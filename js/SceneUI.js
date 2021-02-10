import Phaser from "phaser";

export default class SceneUI extends Phaser.Scene {
  constructor() {
    super({ key: "SceneUI", active: true });

    this.score = 0;
  }

  create() {
    this.sceneMain = this.scene.get("SceneMain");
    let height = this.cameras.main.height;

    //  UI
    this.HUDap = this.add
      .text(20, 10, "AP : 0", {
        font: "9pt courier",
        color: "white"
      })
      .setOrigin(0, 0);
    this.HUDhp = this.add
      .text(20, 30, "HP : 0", {
        font: "9pt courier",
        color: "white"
      })
      .setOrigin(0, 0);
    this.HUDattack = this.add
      .text(20, height - 40, "ATTACK-3AP", {
        font: "9pt courier",
        color: "white"
      })
      .setOrigin(0, 0)
      .setInteractive()
      .on("pointerup", this.sceneMain.onToogleAttack, this.sceneMain);
    this.HUDturn = this.add
      .text(20, height - 20, "END TURN", {
        font: "9pt courier",
        color: "white"
      })
      .setOrigin(0, 0)
      .setInteractive()
      .on("pointerup", this.sceneMain.onToogleTurn, this.sceneMain);

    this.sceneMain.events.on(
      "updateUI",
      function () {
        this.HUDap.setText("AP : " + this.sceneMain.player.ap);
        this.HUDhp.setText("HP : " + this.sceneMain.player.hp);
      },
      this
    );
  }
}
