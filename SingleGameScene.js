const radius = 22;

const gridCountX = 10;
const gridCountY = 16;
const gridTopOffset = 4;

const tweenDuration = 50;

const horiSpeed = 10;
const vertSpeed = 4;

var threeBallGroup = [];
var allowRotate = true;

var rotRCounter = 0;
var rotLCounter = 0;

var ballYSpeed = 1;
var ballXSpeed = 0;

var allBalls;
var staticBalls;
var threeBalls;
var collidedOnce = false;

class SingleGameScene extends Phaser.Scene {
  // use phaser 3.60
  constructor() {
    super({ key: "SingleGameScene" });
  }

  preload() {
    allBalls = this.physics.add.group();
    staticBalls = this.physics.add.group();
    threeBalls = this.physics.add.group();
  }

  create() {
    this.background = this.add.image(0, 0, "background1");
    this.background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    this.background.setOrigin(0, 0);
    var graphics = this.add.graphics({
      lineStyle: {
        width: 1,
        color: 0x00ffff,
        alpha: 0.2,
      },
    });

    var rexBoardAdd = this.rexBoard.add;
    this.board = rexBoardAdd.board({
      grid: getHexagonGrid(this),
      width: gridCountX,
      height: gridCountY,
    });
    this.board.forEachTileXY(function (tileXY, board) {
      var points = board.getGridPoints(tileXY.x, tileXY.y, true);
      graphics.strokePoints(points, true);
    }, this);

    this.createBall();
  }

  createBall() {
    this.ball1 = this.physics.add.sprite(250, 100, "ball1").setCircle(25);
    this.ball2 = this.physics.add.sprite(250 + radius, 100 + radius * 1.732, "ball2").setCircle(25);
    this.ball3 = this.physics.add.sprite(250 - radius, 100 + radius * 1.732, "ball3").setCircle(25);

    this.ball1.setDisplaySize(radius * 2, radius * 2).setOrigin(0.5);
    this.ball2.setDisplaySize(radius * 2, radius * 2).setOrigin(0.5);
    this.ball3.setDisplaySize(radius * 2, radius * 2).setOrigin(0.5);

    this.board.addChess(this.ball1, 4, 0, 0, true);
    this.board.addChess(this.ball2, 4, 1, 0, true);
    this.board.addChess(this.ball3, 5, 1, 0, true);
    this.board.removeChess(this.ball1);
    this.board.removeChess(this.ball2);
    this.board.removeChess(this.ball3);

    allBalls.add(this.ball1);
    allBalls.add(this.ball2);
    allBalls.add(this.ball3);

    rotRCounter = 0;
    rotLCounter = 0;
    ballXSpeed = 0;
    ballYSpeed = 1;
    allowRotate = true;

    threeBalls.clear(false, false);
    threeBalls.add(this.ball1);
    threeBalls.add(this.ball2);
    threeBalls.add(this.ball3);

    threeBallGroup[0] = this.ball1; // 0 rot
    threeBallGroup[2] = this.ball3; // 2 gelb
    threeBallGroup[4] = this.ball2; // 4 blau
    threeBallGroup[1] = null;
    threeBallGroup[3] = null;
    threeBallGroup[5] = null;
  }

  applyPhysics(grounded) {
    // yeah quite a mess, but it doesnt work

    if (grounded && threeBallGroup[1] == null) {
      this.stopBalls();
      return;
    }
    for (let i = 0; i < 6; i++) {
      if (threeBallGroup[i] == null) continue;
      var ballTileXY = this.board.worldXYToTileXY(threeBallGroup[i].x, threeBallGroup[i].y);
      ballTileXY.z = 0;
      var neighbor1 = this.board.getNeighborChess(ballTileXY, 1);
      var neighbor2 = this.board.getNeighborChess(ballTileXY, 2);
      if (neighbor1 != null && neighbor2 == null) {
        var dx = neighbor1.x - threeBallGroup[i].x;
        var dy = neighbor1.y - threeBallGroup[i].y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 2 * radius) {
          // collision
          collidedOnce = true;
          var overlap = 2 * radius - distance;
          var angle = Math.atan2(dy, dx);
          threeBallGroup[i].setX(threeBallGroup[i].x - Math.cos(angle) * overlap);
          threeBallGroup[i].setY(threeBallGroup[i].y - Math.sin(angle) * overlap);
        }
      } else if (neighbor1 == null && neighbor2 != null) {
        var dx = neighbor2.x - threeBallGroup[i].x;
        var dy = neighbor2.y - threeBallGroup[i].y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 2 * radius) {
          // collision
          collidedOnce = true;
          var overlap = 2 * radius - distance;
          var angle = Math.atan2(dy, dx);
          threeBallGroup[i].setX(threeBallGroup[i].x - Math.cos(angle) * overlap);
          threeBallGroup[i].setY(threeBallGroup[i].y - Math.sin(angle) * overlap);
        } else if (neighbor1 != null && neighbor2 != null) {
          stopBalls();
        }
      }
    }
    // else if (grounded) {
    //   console.log("grounded vertical");
    //   this.board.addChess(
    //     this.ball1,
    //     this.board.worldXYToTileXY(this.ball1.x, this.ball1.y).x,
    //     this.board.worldXYToTileXY(this.ball1.x, this.ball1.y).y,
    //     0,
    //     true
    //   );
    //   this.board.addChess(
    //     this.ball2,
    //     this.board.worldXYToTileXY(this.ball2.x, this.ball2.y).x,
    //     this.board.worldXYToTileXY(this.ball2.x, this.ball2.y).y,
    //     0,
    //     true
    //   );
    //   this.board.addChess(
    //     this.ball3,
    //     this.board.worldXYToTileXY(this.ball3.x, this.ball3.y).x,
    //     this.board.worldXYToTileXY(this.ball3.x, this.ball3.y).y,
    //     0,
    //     true
    //   );
    //   for (let i = 1; i < 6; i += 2) {
    //     var ballpos = this.board.worldXYToTileXY(threeBallGroup[i].x, threeBallGroup[i].y);
    //     ballpos.z = 0;
    //     var neighbor0 = this.board.getNeighborChess(ballpos, 0);
    //     var neighbor1 = this.board.getNeighborChess(ballpos, 1);
    //     var neighbor2 = this.board.getNeighborChess(ballpos, 2);
    //     var neighbor3 = this.board.getNeighborChess(ballpos, 3);
    //     var neighbor4 = this.board.getNeighborChess(ballpos, 4);
    //     var neighbor5 = this.board.getNeighborChess(ballpos, 5);
    //     var neighbors = [neighbor0, neighbor1, neighbor2, neighbor3, neighbor4, neighbor5];
    //     neighbors[i + (1 % 6)] = null;
    //     neighbors[i + (2 % 6)] = null;
    //     neighbors.forEach((neighbor) => {
    //       if (neighbor != null) {
    //         var dx = neighbor.x - threeBallGroup[i].x;
    //         var dy = neighbor.y - threeBallGroup[i].y;
    //         var distance = Math.sqrt(dx * dx + dy * dy);
    //         if (distance < 2 * radius) {
    //           // collision
    //           collidedOnce = true;
    //           var overlap = 2 * radius - distance;
    //           var angle = Math.atan2(dy, dx);
    //           threeBallGroup[i].setX(threeBallGroup[i].x - Math.cos(angle) * overlap);
    //           threeBallGroup[i].setY(threeBallGroup[i].y - Math.sin(angle) * overlap);
    //         }
    //       }
    //     });
    //   }
    // } else {
    //   // ball pos 2
    //   if (threeBallGroup[0] == null) {
    //     for (let i = 1; i < 6; i += 2) {
    //       var ballpos = this.board.worldXYToTileXY(threeBallGroup[i].x, threeBallGroup[i].y);
    //       ballpos.z = 0;
    //       var neighbor0 = this.board.getNeighborChess(ballpos, 0);
    //       var neighbor1 = this.board.getNeighborChess(ballpos, 1);
    //       var neighbor2 = this.board.getNeighborChess(ballpos, 2);
    //       var neighbor3 = this.board.getNeighborChess(ballpos, 3);
    //       var neighbor4 = this.board.getNeighborChess(ballpos, 4);
    //       var neighbor5 = this.board.getNeighborChess(ballpos, 5);
    //       var neighbors = [neighbor0, neighbor1, neighbor2, neighbor3, neighbor4, neighbor5];
    //       if (neighbor1 != null && neighbor2 != null) {
    //         this.stopBalls();
    //         return;
    //       }
    //       neighbors.forEach((neighbor) => {
    //         if (neighbor != null) {
    //           var dx = neighbor.x - threeBallGroup[i].x;
    //           var dy = neighbor.y - threeBallGroup[i].y;
    //           var distance = Math.sqrt(dx * dx + dy * dy);
    //           if (distance < 2 * radius) {
    //             // collision
    //             collidedOnce = true;
    //             var overlap = 2 * radius - distance;
    //             var angle = Math.atan2(dy, dx);
    //             // print angle in degrees
    //             threeBalls.getChildren().forEach((ball) => {
    //               ball.setX(ball.x - Math.cos(angle) * overlap);
    //               ball.setY(ball.y - Math.sin(angle) * overlap);
    //             });
    //           }
    //         }
    //       });
    //     }
    //   } else {
    //     var checkHole = 0;
    //     for (let i = 0; i < 5; i += 2) {
    //       var ballpos = this.board.worldXYToTileXY(threeBallGroup[i].x, threeBallGroup[i].y);
    //       ballpos.z = 0;
    //       var neighbor0 = this.board.getNeighborChess(ballpos, 0);
    //       var neighbor1 = this.board.getNeighborChess(ballpos, 1);
    //       var neighbor2 = this.board.getNeighborChess(ballpos, 2);
    //       var neighbor3 = this.board.getNeighborChess(ballpos, 3);
    //       var neighbor4 = this.board.getNeighborChess(ballpos, 4);
    //       var neighbor5 = this.board.getNeighborChess(ballpos, 5);
    //       var neighbors = [neighbor0, neighbor1, neighbor2, neighbor3, neighbor4, neighbor5];
    //       if (neighbor1 != null && neighbor2 != null) {
    //         this.stopBalls();
    //         return;
    //       } else if ((i == 2 && neighbor1 != null) || (i == 4 && neighbor2 != null)) {
    //         checkHole++;
    //       }
    //       if (checkHole == 2) {
    //         this.stopBalls();
    //         return;
    //       }
    //       neighbors.forEach((neighbor) => {
    //         if (neighbor != null) {
    //           var dx = neighbor.x - threeBallGroup[i].x;
    //           var dy = neighbor.y - threeBallGroup[i].y;
    //           var distance = Math.sqrt(dx * dx + dy * dy);
    //           if (distance < 2 * radius) {
    //             // collision
    //             collidedOnce = true;
    //             var overlap = 2 * radius - distance;
    //             var angle = Math.atan2(dy, dx);
    //             // print angle in degrees
    //             threeBalls.getChildren().forEach((ball) => {
    //               ball.setX(ball.x - Math.cos(angle) * overlap);
    //               ball.setY(ball.y - Math.sin(angle) * overlap);
    //             });
    //           }
    //         }
    //       });
    //     }
    //   }
    // }
  }

  stopBalls() {
    this.tweens._active.forEach((tween) => {
      tween.stop();
    });
    collidedOnce = false;
    this.addBallsToChess();
    staticBalls.add(this.ball1);
    staticBalls.add(this.ball2);
    staticBalls.add(this.ball3);
    this.createBall();
  }

  addBallsToChess() {
    this.board.addChess(
      this.ball1,
      this.board.worldXYToTileXY(this.ball1.x, this.ball1.y).x,
      this.board.worldXYToTileXY(this.ball1.x, this.ball1.y).y,
      0,
      true
    );
    this.board.addChess(
      this.ball2,
      this.board.worldXYToTileXY(this.ball2.x, this.ball2.y).x,
      this.board.worldXYToTileXY(this.ball2.x, this.ball2.y).y,
      0,
      true
    );
    this.board.addChess(
      this.ball3,
      this.board.worldXYToTileXY(this.ball3.x, this.ball3.y).x,
      this.board.worldXYToTileXY(this.ball3.x, this.ball3.y).y,
      0,
      true
    );
  }

  update() {
    // consistently move the balls down
    if (
      this.ball1.y < this.board.tileXYToWorldXY(0, gridCountY - 1).y &&
      this.ball2.y < this.board.tileXYToWorldXY(0, gridCountY - 1).y &&
      this.ball3.y < this.board.tileXYToWorldXY(0, gridCountY - 1).y
    ) {
      if (collidedOnce) {
        this.ball1.setY(this.ball1.y + 10);
        this.ball2.setY(this.ball2.y + 10);
        this.ball3.setY(this.ball3.y + 10);
        this.applyPhysics(false, this);
      } else {
        if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).isDown) {
          this.ball1.setY(this.ball1.y + 10);
          this.ball2.setY(this.ball2.y + 10);
          this.ball3.setY(this.ball3.y + 10);
        } else {
          this.ball1.setY(this.ball1.y + 1);
          this.ball2.setY(this.ball2.y + 1);
          this.ball3.setY(this.ball3.y + 1);
        }
        this.applyPhysics(false, this);
      }
    } else {
      this.applyPhysics(true, this);
    }
    // use A and D to move the balls sideways
    if (
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown &&
      this.ball1.x > this.board.tileXYToWorldXY(0, gridCountY - 1).x &&
      this.ball2.x > this.board.tileXYToWorldXY(0, gridCountY - 1).x &&
      this.ball3.x > this.board.tileXYToWorldXY(0, gridCountY - 1).x
    ) {
      this.ball1.setX(this.ball1.x - vertSpeed);
      this.ball2.setX(this.ball2.x - vertSpeed);
      this.ball3.setX(this.ball3.x - vertSpeed);
      if (this.ball1.x < this.board.tileXYToWorldXY(0, gridCountY - 1).x) {
        var xOffset = radius - this.ball1.x;
        this.ball1.setX(this.ball1.x + xOffset);
        this.ball2.setX(this.ball2.x + xOffset);
        this.ball3.setX(this.ball3.x + xOffset);
      } else if (this.ball2.x < this.board.tileXYToWorldXY(0, gridCountY - 1).x) {
        var xOffset = radius - this.ball2.x;
        this.ball1.setX(this.ball1.x + xOffset);
        this.ball2.setX(this.ball2.x + xOffset);
        this.ball3.setX(this.ball3.x + xOffset);
      } else if (this.ball3.x < this.board.tileXYToWorldXY(0, gridCountY - 1).x) {
        var xOffset = radius - this.ball3.x;
        this.ball1.setX(this.ball1.x + xOffset);
        this.ball2.setX(this.ball2.x + xOffset);
        this.ball3.setX(this.ball3.x + xOffset);
      }
    } else if (
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown &&
      this.ball1.x < this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x &&
      this.ball2.x < this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x &&
      this.ball3.x < this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x
    ) {
      this.ball1.setX(this.ball1.x + vertSpeed);
      this.ball2.setX(this.ball2.x + vertSpeed);
      this.ball3.setX(this.ball3.x + vertSpeed);
      if (this.ball1.x > this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x) {
        var xOffset = this.ball1.x - this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x;
        this.ball1.setX(this.ball1.x - xOffset);
        this.ball2.setX(this.ball2.x - xOffset);
        this.ball3.setX(this.ball3.x - xOffset);
      } else if (this.ball2.x > this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x) {
        var xOffset = this.ball2.x - this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x;
        this.ball1.setX(this.ball1.x - xOffset);
        this.ball2.setX(this.ball2.x - xOffset);
        this.ball3.setX(this.ball3.x - xOffset);
      } else if (this.ball3.x > this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x) {
        var xOffset = this.ball3.x - this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x;
        this.ball1.setX(this.ball1.x - xOffset);
        this.ball2.setX(this.ball2.x - xOffset);
        this.ball3.setX(this.ball3.x - xOffset);
      }
    }
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown) {
      // use W and S to rotate the ballgroup only once by 60 degrees

      rotLCounter++;
      this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.W);
    }
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown) {
      rotRCounter++;
      this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.S);
    }

    if (rotLCounter > 0 && allowRotate) {
      allowRotate = false;
      // rotLCounter = 1;
      if (threeBallGroup[0] == null) {
        this.tweens.add({
          targets: threeBallGroup[1],
          x: threeBallGroup[1].x - radius + ballXSpeed,
          y: threeBallGroup[1].y + ballYSpeed,
          duration: tweenDuration,
          ease: "Power1",
        });
        this.tweens.add({
          targets: threeBallGroup[3],
          x: threeBallGroup[3].x + radius + ballXSpeed,
          y: threeBallGroup[3].y + ballYSpeed,
          duration: tweenDuration,
          ease: "Power1",
        });
        this.tweens
          .add({
            targets: threeBallGroup[5],
            x: threeBallGroup[5].x + ballXSpeed,
            y: threeBallGroup[5].y + radius * Math.sqrt(3) + ballYSpeed,
            duration: tweenDuration,
            ease: "Power1",
          })
          .on("complete", () => {
            allowRotate = true;
            rotLCounter--;
          });

        threeBallGroup[0] = threeBallGroup[1];
        threeBallGroup[2] = threeBallGroup[3];
        threeBallGroup[4] = threeBallGroup[5];

        threeBallGroup[1] = null;
        threeBallGroup[3] = null;
        threeBallGroup[5] = null;
      } else {
        this.tweens.add({
          targets: threeBallGroup[0],
          x: threeBallGroup[0].x - radius + ballXSpeed,
          y: threeBallGroup[0].y + ballYSpeed,
          duration: tweenDuration,
          ease: "Power1",
        });
        this.tweens.add({
          targets: threeBallGroup[2],
          x: threeBallGroup[2].x + ballXSpeed,
          y: threeBallGroup[2].y - radius * Math.sqrt(3) + ballYSpeed,
          duration: tweenDuration,
          ease: "Power1",
        });
        this.tweens
          .add({
            targets: threeBallGroup[4],
            x: threeBallGroup[4].x + radius + ballXSpeed,
            y: threeBallGroup[4].y + ballYSpeed,
            duration: tweenDuration,
            ease: "Power1",
          })
          .on("complete", () => {
            allowRotate = true;
            rotLCounter--;
          });
        threeBallGroup[5] = threeBallGroup[0];
        threeBallGroup[1] = threeBallGroup[2];
        threeBallGroup[3] = threeBallGroup[4];
        threeBallGroup[0] = null;
        threeBallGroup[2] = null;
        threeBallGroup[4] = null;
      }
    } else if (rotRCounter > 0 && allowRotate) {
      allowRotate = false;
      // rotRCounter = 1;
      if (threeBallGroup[0] == null) {
        this.tweens.add({
          targets: threeBallGroup[1],
          x: threeBallGroup[1].x + ballXSpeed,
          y: threeBallGroup[1].y + radius * Math.sqrt(3) + ballYSpeed,
          duration: tweenDuration,
          ease: "Power1",
        });
        this.tweens.add({
          targets: threeBallGroup[3],
          x: threeBallGroup[3].x - radius + ballXSpeed,
          y: threeBallGroup[3].y + ballYSpeed,
          duration: tweenDuration,
          ease: "Power1",
        });
        this.tweens
          .add({
            targets: threeBallGroup[5],
            x: threeBallGroup[5].x + radius + ballXSpeed,
            y: threeBallGroup[5].y + ballYSpeed,
            duration: tweenDuration,
            ease: "Power1",
          })

          .on("complete", () => {
            allowRotate = true;
            rotRCounter--;
          });
        threeBallGroup[2] = threeBallGroup[1];
        threeBallGroup[4] = threeBallGroup[3];
        threeBallGroup[0] = threeBallGroup[5];
        threeBallGroup[1] = null;
        threeBallGroup[3] = null;
        threeBallGroup[5] = null;
      } else {
        this.tweens.add({
          targets: threeBallGroup[0],
          x: threeBallGroup[0].x + radius + ballXSpeed,
          y: threeBallGroup[0].y + ballYSpeed,
          duration: tweenDuration,
          ease: "Power1",
        });
        this.tweens.add({
          targets: threeBallGroup[2],
          x: threeBallGroup[2].x - radius + ballXSpeed,
          y: threeBallGroup[2].y + ballYSpeed,
          duration: tweenDuration,
          ease: "Power1",
        });
        this.tweens
          .add({
            targets: threeBallGroup[4],
            x: threeBallGroup[4].x + ballXSpeed,
            y: threeBallGroup[4].y - radius * Math.sqrt(3) + ballYSpeed,
            duration: tweenDuration,
            ease: "Power1",
          })
          .on("complete", () => {
            allowRotate = true;
            rotRCounter--;
          });

        threeBallGroup[1] = threeBallGroup[0];
        threeBallGroup[3] = threeBallGroup[2];
        threeBallGroup[5] = threeBallGroup[4];
        threeBallGroup[0] = null;
        threeBallGroup[2] = null;
        threeBallGroup[4] = null;
      }
    }
  }
}

var getHexagonGrid = function (scene) {
  var staggeraxis = "x";
  var staggerindex = "even";
  var grid = scene.rexBoard.add.hexagonGrid({
    x: 150,
    y: 36,
    staggeraxis: staggeraxis,
    staggerindex: staggerindex,
  });
  grid.setCellRadius((radius * 2) / Math.sqrt(3));
  return grid;
};
