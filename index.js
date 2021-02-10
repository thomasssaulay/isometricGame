/**
 * Author: Thomas SAULAY
 */

import Phaser from "phaser";

import SceneGameOver from "./js/SceneGameOver";
import SceneMainMenu from "./js/SceneMainMenu";
import SceneMain from "./js/SceneMain";
import SceneUI from "./js/SceneUI";

const config = {
  type: Phaser.AUTO,
  pixelArt: true,
  roundPixels: true,
  zoom: 0.5,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "game-container",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 320,
    height: 180
  },
  backgroundColor: "#191923",
  parent: "game-container",
  scene: [SceneMainMenu, SceneMain, SceneUI, SceneGameOver]
};

const game = new Phaser.Game(config);
