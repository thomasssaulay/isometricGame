import Phaser from "phaser";

export default class Tile extends Phaser.GameObjects.Sprite {
  constructor(
    scene,
    x,
    y,
    key,
    frame,
    xindex,
    yindex,
    depth,
    type = "dirt",
    color = 0xffffff
  ) {
    super(scene, x, y, key, frame);

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.pos = { x: xindex, y: yindex };
    this.xindex = xindex;
    this.yindex = yindex;
    this.key = key;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.parent = null;
    this.onSight = false;
    this.color = color;
    this.depth = depth;
    this.entitiesOnTile = [];
    this.debug = "";

    this.setType(type);

    this.width = this.sprite.displayWidth;
    this.height = this.sprite.displayHeight;

    this.thickness = 1;
    this.contourShape = new Phaser.Geom.Polygon([
      this.x - this.width / 2,
      this.y - this.height / 4,
      this.x,
      this.y - this.height / 2,
      this.x + this.width / 2,
      this.y - this.height / 4,
      this.x,
      this.y
    ]);
    this.contour = scene.add.graphics().setDepth(this.scene.mapSize - 1);
    this.contour.lineStyle(this.thickness, 0x00ff00, 0.8);
  }

  onPointerDownHandler() {}
  onPointerUpHandler() {
    console.log("occupants : ", this.entitiesOnTile);
  }

  setOccupied(occupied) {
    if (occupied) {
      this.disableInteractive();
    } else {
      this.setInteractive(
        new Phaser.Geom.Polygon([
          0,
          this.width / 4,
          this.width / 2,
          this.height / 2,
          this.width,
          this.height / 4,
          this.width / 2,
          0
        ]),
        Phaser.Geom.Polygon.Contains
      );
    }
  }

  showHilight() {
    if (!this.scene.attackMode)
      this.contour.strokePoints(this.contourShape.points, true);
  }
  hideHilight() {
    this.contour.clear();
  }
  showSelection() {
    this.sprite.setTint("0x00ff00aa");
  }
  hideSelection() {
    this.sprite.clearTint();
  }

  setType(t) {
    this.type = t;
    if (t === "dirt" || t === "sand") {
      this.walkable = true;
    } else {
      this.walkable = false;
    }

    if (this.sprite !== undefined) {
      this.sprite.texture = this.type;
    }
    this.sprite = this.scene.add
      .sprite(this.x, this.y, this.type, 0)
      .setDepth(this.depth)
      .setTint(this.color);

    if (this.walkable) {
      this.setOccupied(false);
      this.on("pointerdown", this.onPointerDownHandler)
        .on("pointerup", this.onPointerUpHandler)
        .on("pointerover", this.showHilight)
        .on("pointerout", this.hideHilight);
    }
  }

  preload() {}

  create() {}

  update(time, delta) {}
}
