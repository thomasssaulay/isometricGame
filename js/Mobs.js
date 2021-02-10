import Phaser from "phaser";

export default class Mobs extends Phaser.GameObjects.Sprite {
  constructor(scene, currentTile, depth, key) {
    super(scene);

    this.scene = scene;
    this.x = currentTile.x;
    this.y = currentTile.y - 10;
    this.currentTile = currentTile;
    this.key = key;
    this.depth = depth;
    this.hp = 4;
    this.maxAp = 6;
    this.ap = this.maxAp;
    this.contour = scene.add.graphics();

    this.sprite = this.scene.add
      .sprite(this.x, this.y, "crab", 0)
      .setScale(0.75, 0.75)
      .setDepth(this.depth);

    this.width = this.sprite.displayWidth;
    this.height = this.sprite.displayHeight;

    this.moveTimeline = null;

    this.setInteractive();
    this.on("pointerdown", this.onPointerDownHandler).on(
      "pointerup",
      this.onPointerUpHandler
    );
    //   .on("pointerover", this.showContour)
    //   .on("pointerout", this.hideContour);
  }

  onPointerDownHandler() {}
  onPointerUpHandler() {
    if (this.scene.attackMode && this.currentTile.onSight) {
      this.scene.onToogleAttack();
      this.scene.player.shootTowards(this);
      this.scene.player.setAp(this.scene.mobs.ap - 3);
    }
  }

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
    let lastTile = tileList[tileList.length - 1];

    tileList.forEach((t) => {
      this.moveTimeline.add({
        targets: this.sprite,
        x: t.x,
        y: t.y - 10,
        ease: "Power1",
        duration: 250,
        onCompleteScope: this,
        onComplete: function () {
          this.x = t.x;
          this.y = t.y;
          this.currentTile = t;
          t.hideSelection();
          this.ap--;
          if (t === lastTile) {
            this.scene.AITurn_combat();
          }
        }
      });
    });

    this.moveTimeline.play();
  }

  takeDamage(amount) {
    this.hp -= amount;
    console.log("damage taken");
    if (this.hp <= 0) {
      this.kill();
    }
  }

  kill() {
    this.sprite.destroy();
    this.destroy();
  }
  setAp(amount) {
    this.ap = amount;
  }

  preload() {}

  create() {}

  update(time, delta) {}
}
