import Phaser from "phaser";
import Egg from "./Egg";

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, currentTile, depth, key) {
    super(scene);

    this.scene = scene;
    this.currentTile = currentTile;
    this.x = currentTile.x;
    this.y = currentTile.y - currentTile.height / 2;
    this.key = key;
    this.range = 2;
    this.maxAp = 99;
    this.ap = this.maxAp;
    this.hp = 8;
    this.contour = scene.add.graphics();
    this.depth = depth;

    this.sprite = this.scene.add
      .sprite(this.x, this.y, "chicken", 0)
      .setDepth(this.depth);

    this.width = this.sprite.displayWidth;
    this.height = this.sprite.displayHeight;

    this.moveTimeline = null;

    // this.on("pointerdown", this.onPointerDownHandler)
    //   .on("pointerup", this.onPointerUpHandler)
    //   .on("pointerover", this.showContour)
    //   .on("pointerout", this.hideContour);
  }

  // onPointerDownHandler() {}
  // onPointerUpHandler() {
  //   console.log(this.key);
  // }

  // showContour() {
  //   this.sprite.setTint("0x00ff00");
  // }
  // hideContour() {
  //   this.sprite.clearTint();
  // }

  move(x, y) {
    this.x = x;
    this.y = y;
    this.scene.tweens.add({
      targets: this.sprite,
      x: x,
      y: y,
      ease: "Power2",
      duration: 700,
      onCompleteScope: this,
      onComplete: function () {}
    });
  }

  moveOnPath(tileList) {
    if (this.moveTimeline != null) this.moveTimeline.stop();
    this.moveTimeline = this.scene.tweens.createTimeline();

    const updateCameraTime = 2;
    let curUpdateCameraTime = 0;

    tileList.forEach((t) => {
      this.moveTimeline.add({
        targets: this.sprite,
        x: t.x,
        y: t.y - t.height / 2,
        ease: "Power1",
        duration: 250,
        onCompleteScope: this,
        onComplete: function () {
          this.x = t.x;
          this.y = t.y;
          this.currentTile = t;
          t.hideSelection();
          this.setAp(this.ap - 1);
          if (curUpdateCameraTime >= updateCameraTime) {
            curUpdateCameraTime = 0;
            this.scene.updateCamera();
          } else curUpdateCameraTime++;
        }
      });
    });
    this.moveTimeline
      .setCallback(
        "onComplete",
        function () {
          this.scene.updateCamera();
        },
        null,
        this
      )
      .play();
  }

  setAp(amount) {
    this.ap = amount;
    this.scene.emitUpdateUI();
  }

  updateRangeField() {
    // let neighbors = [
    //   { x: 0, y: 1 },
    //   { x: 1, y: 0 },
    //   { x: 0, y: -1 },
    //   { x: -1, y: 0 },
    //   { x: -1, y: 1 },
    //   { x: 1, y: -1 },
    //   { x: 1, y: 1 },
    //   { x: -1, y: -1 }
    // ];
    this.scene.mobs.currentTile.onSight = false;
    for (let i = -this.range; i <= this.range; i++) {
      for (let j = -this.range; j <= this.range; j++) {
        if (
          this.currentTile.pos.x + i >= 0 &&
          this.currentTile.pos.x + i < this.scene.mapSize &&
          this.currentTile.pos.y + j >= 0 &&
          this.currentTile.pos.y + j < this.scene.mapSize &&
          !(
            this.currentTile.pos.x + i === this.currentTile.pos.x &&
            this.currentTile.pos.y + j === this.currentTile.pos.y
          )
        ) {
          this.scene.map[this.currentTile.pos.x + i][
            this.currentTile.pos.y + j
          ].showSelection();
          if (
            this.scene.mobs.currentTile.pos.x === this.currentTile.pos.x + i &&
            this.scene.mobs.currentTile.pos.y === this.currentTile.pos.y + j
          ) {
            this.scene.mobs.currentTile.onSight = true;
          }
        }
      }
    }
  }

  shootTowards(target) {
    let egg = new Egg(
      this.scene,
      this.currentTile.x,
      this.currentTile.y - 10,
      "",
      0
    );

    this.scene.tweens.add({
      targets: egg.sprite,
      x: target.x,
      y: target.y,
      ease: "Sine.easeInOut",
      duration: 500,
      onCompleteScope: this,
      onComplete: function () {
        egg.sprite.destroy();
        egg = null;
        target.takeDamage(2);
      }
    });
  }

  preload() {}

  create() {}

  update(time, delta) {}
}
