import Phaser from "phaser";

export default class Egg extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key, frame) {
    super(scene, x, y, key, frame);

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.key = key;
    this.thickness = 8;
    this.contour = scene.add.graphics();

    this.sprite = this.scene.add.sprite(this.x, this.y, "egg", 0);

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
