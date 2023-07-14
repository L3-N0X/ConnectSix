class StartScene extends Phaser.Scene {
    constructor() {
        super("StartScene");
    }

    preload() {
        this.load.image("background1", "assets/background1.jpg");
        this.load.image("ballBottom", "assets/purple.png");
        this.load.image("ball1", "assets/red.png");
        this.load.image("ball2", "assets/blue.png");
        this.load.image("ball3", "assets/yellow.png");

        this.load.on("complete", () => {
            this.scene.start("SingleGameScene");
        });
    }

    create() {
        this.add.text(20, 20, "Loading game...");
    }
}
