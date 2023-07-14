var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: "#222222",
  physics: {
    default: "arcade",
    arcade: {
      // gravity: { y: 0 },
      debug: true,
      debugShowBody: true,
      debugShowStaticBody: true,
      debugShowVelocity: true,
      debugShowCollisions: true,
    },
  },
  scene: [StartScene, SingleGameScene],
  plugins: {
    scene: [{
      key: 'rexBoard',
      plugin: rexboardplugin,
      mapping: 'rexBoard'
    }]
  }
};
var game = new Phaser.Game(config);