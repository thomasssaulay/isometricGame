import Phaser from "phaser";

export default class Bomb extends Phaser.GameObjects.Sprite {
  constructor(scene, currentTile, depth) {
    super(scene);

    this.scene = scene;
    this.currentTile = currentTile;
    this.x = currentTile.x;
    this.y = currentTile.y - currentTile.height / 2;
    this.thickness = 8;
    this.contour = scene.add.graphics();
    this.depth = depth;

    this.sprite = this.scene.add
      .sprite(this.x, this.y, "bomb", 0)
      .setScale(0.5, 0.5)
      .setDepth(this.depth);

    this.width = this.sprite.displayWidth;
    this.height = this.sprite.displayHeight;
  }

  shakeCamera(intensity) {
    this.scene.cameras.main.shake(250, intensity);
  }

  emitParticles() {
    this.particles.setLifespan(700);
    this.particles.setQuantity(50);

    this.particles.setEmitZone({
      source: new Phaser.Geom.Rectangle(
        this.x - this.displayWidth / 2,
        this.y - this.displayHeight / 2,
        this.displayWidth,
        this.displayHeight
      ),
      type: "edge",
      quantity: 50
    });
    this.particles.explode();
  }

  preload() {}

  create() {}

  update(time, delta) {}
}
