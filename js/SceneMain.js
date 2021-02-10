import Phaser from "phaser";
import Tile from "./Tile";
import Player from "./Player";
import Mobs from "./Mobs";
import Bomb from "./Bomb";
import PerlinNoise2D from "./PerlinNoise2D";
import * as Pathfinding from "./Pathfinding";

const colors = [
  0xffffff
  // "0xfc3e3e"
  // "0xfef44d",
  // "0x60fd3e",
  // "0x518ffd",
  // "0x733efa",
  // "0xde2de0"
];

export default class SceneMain extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMain" });
  }

  preload() {
    this.load.image("back", "../assets/sprites/background.png");
    this.load.image("dirt", "../assets/sprites/dirt.png");
    this.load.image("rock", "../assets/sprites/rock.png");
    this.load.image("water", "../assets/sprites/water.png");
    this.load.image("sand", "../assets/sprites/sand.png");
    this.load.image("bomb", "../assets/sprites/bomb.png");
    this.load.image("egg", "../assets/sprites/egg.png");
    this.load.image("chicken", "../assets/sprites/chicken.png");
    this.load.image("crab", "../assets/sprites/crab.png");
    this.load.image("crosshair", "../assets/sprites/crosshair.png");
  }

  create() {
    const { width, height } = this.sys.game.config;

    this.background = this.add
      .image(width / 2, height / 2, "back")
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(-99)
      .setScrollFactor(0.25, 0.25);
    this.tweens.add({
      targets: this.background,
      y: 180,
      x: 360,
      ease: "Sine.easeInOut",
      duration: 20000,
      yoyo: true,
      loop: -1
    });

    this.mapSize = 32;
    this.map = this.drawMap(26, 90, this.mapSize, this.mapSize);

    this.player = new Player(
      this,
      this.map[Phaser.Math.Between(0, this.mapSize - 1)][2],
      this.mapSize,
      "Joe"
    );

    this.goal = new Bomb(
      this,
      this.map[Phaser.Math.Between(0, this.mapSize - 1)][this.mapSize - 2],
      this.mapSize
    );

    //find path from player to goal
    let victoryPath = Pathfinding.findPath(
      this.map,
      this.player.currentTile,
      this.goal.currentTile,
      true
    );
    victoryPath.forEach((tile) => {
      if (tile.type === "water") {
        tile.setType("dirt");
        let neigh = [
          [-1, 0],
          [1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1]
        ];
        neigh.forEach((n) => {
          if (
            tile.xindex + n[0] < this.mapSize &&
            tile.yindex + n[1] < this.mapSize
          ) {
            let nTile = this.map[tile.xindex + n[0]][tile.yindex + n[1]];
            nTile.setType("dirt");
          }
        });
      }
    });

    // this.crabTile = this.map[Phaser.Math.Between(0, this.map.length - 1)][
    //   Phaser.Math.Between(0, this.map[0].length - 1)
    // ];
    // this.crabTile = this.map[6][5];
    // this.crabTile.setOccupied(true);
    this.mobs = new Mobs(this, this.map[6][5], this.mapSize, "Crab");

    this.attackMode = false;
    this.playersTurn = true;
    this.inCombat = false;

    this.camera = this.cameras.main;
    this.camera.centerOn(this.player.x, this.player.y);
    // this.camera.zoomTo(0.5, 1000, "Power2");

    this.sceneUI = this.scene.get("SceneUI");
    this.emitUpdateUI();

    this.input.keyboard.on("keydown", (event) => {
      if (event.code === "ArrowLeft") {
        this.camera.scrollX -= 5;
      }
      if (event.code === "ArrowRight") {
        this.camera.scrollX += 5;
      }
      if (event.code === "ArrowUp") {
        this.camera.scrollY -= 5;
      }
      if (event.code === "ArrowDown") {
        this.camera.scrollY += 5;
      }
    });
  }

  drawMap(xOffset, yOffset, map_size_x, map_size_y) {
    const size = 32;

    // RNG + PERLIN NOISE
    const gridSize = map_size_x / 4; // To check
    let step = map_size_x / gridSize;

    let randomGrid = [];
    for (var i = 0; i < gridSize + 1; i++) {
      randomGrid.push([]);
      for (var j = 0; j < gridSize + 1; j++) {
        randomGrid[i].push([
          Phaser.Math.RND.realInRange(-1, 1),
          Phaser.Math.RND.realInRange(-1, 1)
        ]);
      }
    }

    const noise = new PerlinNoise2D(map_size_x, randomGrid);

    // ACTUAL MAP CREATION
    let worldTint = colors[Phaser.Math.Between(0, colors.length)];
    let map = [];
    for (let j = 0; j < map_size_y; j++) {
      map[j] = [];
      for (let i = 0; i < map_size_x; i++) {
        let xPos = xOffset + (size / 2) * (i + j);
        let yPos = yOffset - (size / 4) * (i - j);

        // let rand = Phaser.Math.Between(1, 20);
        let type = "dirt";
        // if (rand >= 16 && rand < 18) {
        //   type = "rock";
        // } else if (rand >= 18) {
        //   type = "water";
        // }

        var p = Math.abs(noise.perlin(i / step, j / step, randomGrid) * 10);
        if (p < 0.8) {
          type = "water";
        } else if (p >= 0.8 && p < 1.4) {
          type = "sand";
        } else if (p > 1.62 && p < 1.76) {
          type = "rock";
        }

        map[j][i] = new Tile(
          this,
          xPos,
          yPos,
          "x" + j + "y" + i,
          0,
          j,
          i,
          j - i,
          type,
          worldTint
        );
        map[j][i].on("pointerup", this.onTilePointerUpHandler);
      }
    }

    return map;
  }

  onTilePointerUpHandler(pointer) {
    if (!this.scene.attackMode && this.scene.playersTurn) {
      if (this.walkable) {
        let path = Pathfinding.findPath(
          this.scene.map,
          this.scene.player.currentTile,
          this
        );
        if (path.length <= this.scene.player.ap) {
          path.forEach((t) => {
            t.showSelection();
          });
          this.scene.player.moveOnPath(path);
        } else {
          console.warn("NOT ENOUGH AP");
        }
      }
    }
  }
  onToogleAttack(pointer) {
    if (!this.attackMode && this.player.ap >= 3) {
      this.attackMode = true;
      this.sceneUI.HUDturn.off("pointerup");
      this.sceneUI.HUDturn.setTint("0xaaaaaa");
      this.player.updateRangeField();
      this.input.setDefaultCursor("crosshair");
    } else {
      this.sceneUI.HUDturn.on("pointerup", this.onToogleTurn, this);
      this.sceneUI.HUDturn.clearTint();
      this.attackMode = false;
      this.hideAllSelection();
      this.input.setDefaultCursor("default");
    }
  }

  onToogleTurn(pointer) {
    if (this.playersTurn) {
      this.playersTurn = false;
      this.mobs.setAp(this.mobs.maxAp);
      this.AITurn_move();
      this.sceneUI.HUDattack.off("pointerup");
      this.sceneUI.HUDattack.setTint("0xaaaaaa");
      this.sceneUI.HUDturn.off("pointerup");
      this.sceneUI.HUDturn.setTint("0xaaaaaa");
    } else {
      this.playersTurn = true;
      this.player.setAp(this.player.maxAp);
      this.sceneUI.HUDattack.on("pointerup", this.onToogleAttack, this);
      this.sceneUI.HUDattack.clearTint();
      this.sceneUI.HUDturn.on("pointerup", this.onToogleTurn, this);
      this.sceneUI.HUDturn.clearTint();
    }
  }

  AITurn_move() {
    let path = Pathfinding.findPath(
      this.map,
      this.mobs.currentTile,
      this.player.currentTile
    );

    if (path.length > 1) {
      path.pop(); //remove last tile (the occupied goal tile)
      path = path.slice(0, this.mobs.ap); //remove unaccessible because of ap
      path.forEach((t) => {
        t.showSelection();
      });
      this.mobs.moveOnPath(path);
    } else {
      this.AITurn_combat();
    }
  }

  AITurn_combat() {
    while (this.mobs.ap - 2 >= 0) {
      console.log("mobs attack !");
      this.player.hp -= 2;
      this.emitUpdateUI();
      this.mobs.setAp(this.mobs.ap - 2);
    }

    this.onToogleTurn();
  }

  hideAllSelection() {
    for (let i = 0; i < this.mapSize; i++) {
      for (let j = 0; j < this.mapSize; j++) {
        this.map[i][j].hideSelection();
      }
    }
  }

  updateCamera() {
    if (this.camera.panEffect !== null) {
      this.camera.panEffect.reset();
    }
    this.camera.pan(this.player.x, this.player.y, 1000, "Power2");
  }

  emitUpdateUI() {
    this.events.emit("updateUI");
  }

  update(time, delta) {}
}
