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
    this.ball2 = this.physics.add.sprite(-250 + radius, 100 + radius * 1.732, "ball2").setCircle(0);
    this.ball3 = this.physics.add.sprite(-250 - radius, 100 + radius * 1.732, "ball3").setCircle(0);

    this.ball1.setDisplaySize(radius * 2, radius * 2).setOrigin(0.5);

    this.board.addChess(this.ball1, 4, 0, 0, true);
    this.board.removeChess(this.ball1);

    allBalls.add(this.ball1);

    rotRCounter = 0;
    rotLCounter = 0;
    ballXSpeed = 0;
    ballYSpeed = 1;
    allowRotate = true;

    threeBalls.clear(false, false);
    threeBalls.add(this.ball1);

    threeBallGroup[0] = this.ball1;
  }

  applyPhysics(grounded) {
    if (grounded && threeBallGroup[1] == null) {
      this.stopBalls();
      return;
    }
    var ballTileXY = this.board.worldXYToTileXY(threeBallGroup[0].x, threeBallGroup[0].y);
    ballTileXY.x = Phaser.Math.Clamp(ballTileXY.x, 0, gridCountX - 1);
    ballTileXY.z = 0;
    var nDownRight = this.board.getNeighborChess(ballTileXY, 1);
    var nDownLeft = this.board.getNeighborChess(ballTileXY, 2);
    var nLeft = this.board.getNeighborChess(ballTileXY, 3);
    var nRight = this.board.getNeighborChess(ballTileXY, 0);

    if (nDownRight != null && nDownLeft == null) {
      var dx = nDownRight.x - threeBallGroup[0].x;
      var dy = nDownRight.y - threeBallGroup[0].y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 2 * radius + 1) {
        // collision
        // console.log("nDownRight");
        collidedOnce = true;
        var overlap = 2 * radius - distance;
        if (overlap < 0.01 && overlap > -0.01) {
          overlap = 0.1 * Math.sign(threeBallGroup[0].x - nDownRight.x);
          // console.log("overlap1 weird");
        }
        var angle = Math.atan2(dy, dx);
        if (angle == Math.PI / 2 || angle == 0 || angle == Math.PI) {
          angle = 1.5 - 0.1 * Math.sign(nDownRight.x - threeBallGroup[0].x);
          // console.log("angle1 weird");
        }
        threeBallGroup[0].setX(threeBallGroup[0].x - Math.cos(angle) * overlap);
        threeBallGroup[0].setY(threeBallGroup[0].y - Math.sin(angle) * overlap);
      }
    } else if (nDownRight == null && nDownLeft != null) {
      var dx = nDownLeft.x - threeBallGroup[0].x;
      var dy = nDownLeft.y - threeBallGroup[0].y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 2 * radius + 1) {
        // console.log("nDownLeft");
        // collision
        collidedOnce = true;
        var overlap = 2 * radius - distance;
        if (overlap < 0.01 && overlap > -0.01) {
          overlap = 0.1 * Math.sign(nDownLeft.x - threeBallGroup[0].x);
          // console.log("overlap2 weird");
        }
        var angle = Math.atan2(dy, dx);
        if (angle == Math.PI / 2 || angle == 0 || angle == Math.PI) {
          angle = 1.5 + 0.1 * Math.sign(nDownLeft.x - threeBallGroup[0].x);
          // console.log("angle2 weird");
        }
        threeBallGroup[0].setX(threeBallGroup[0].x - Math.cos(angle) * overlap);
        threeBallGroup[0].setY(threeBallGroup[0].y - Math.sin(angle) * overlap);
      }
    } else if (nDownRight != null && nDownLeft != null) {
      // console.log("both neighbors");
      var dx1 = nDownRight.x - threeBallGroup[0].x;
      var dy1 = nDownRight.y - threeBallGroup[0].y;
      var distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      var dx2 = nDownLeft.x - threeBallGroup[0].x;
      var dy2 = nDownLeft.y - threeBallGroup[0].y;
      var distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (distance1 < 2 * radius + 1 || distance2 < 2 * radius + 1) {
        // console.log("both neighbors touching");
        // collision
        collidedOnce = true;
        this.stopBalls();
      }
    } else if (nDownRight == null && nDownLeft == null) {
      // console.log("no neighbors");
    } else if (nLeft != null || nRight != null) {
      // does nothing
      console.log("nLeft or nRight");
      // var dx1 = nLeft.x - threeBallGroup[0].x;
      // var dy1 = nLeft.y - threeBallGroup[0].y;
      // var distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      // var dx2 = nRight.x - threeBallGroup[0].x;
      // var dy2 = nRight.y - threeBallGroup[0].y;
      // var distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      // if (distance1 < 2 * radius + 1 || distance2 < 2 * radius + 1) {
      //   // console.log("nLeft or nRight touching");
      //   // collision
      //   this.stopBalls();
      // }
    }

    if (threeBallGroup[0].x < this.board.tileXYToWorldXY(0, gridCountX - 1).x) {
      threeBallGroup[0].setX(this.board.tileXYToWorldXY(0, gridCountY - 1).x);
      var ballTileXY = this.board.worldXYToTileXY(threeBallGroup[0].x, threeBallGroup[0].y);
      Phaser.Math.Clamp(ballTileXY.x, 0, gridCountX - 1);
      ballTileXY.z = 0;
      var nDownRight = this.board.getNeighborChess(ballTileXY, 1);
      var nDownLeft = this.board.getNeighborChess(ballTileXY, 2);
      if (nDownRight != null) this.stopBalls();
    } else if (threeBallGroup[0].x > this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x) {
      threeBallGroup[0].setX(this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x);
      var ballTileXY = this.board.worldXYToTileXY(threeBallGroup[0].x, threeBallGroup[0].y);
      Phaser.Math.Clamp(ballTileXY.x, 0, gridCountX - 1);
      ballTileXY.z = 0;
      var nDownRight = this.board.getNeighborChess(ballTileXY, 1);
      var nDownLeft = this.board.getNeighborChess(ballTileXY, 2);
      if (nDownLeft != null) this.stopBalls();
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
    //     var nRight = this.board.getNeighborChess(ballpos, 0);
    //     var nDownRight = this.board.getNeighborChess(ballpos, 1);
    //     var nDownLeft = this.board.getNeighborChess(ballpos, 2);
    //     var nLeft = this.board.getNeighborChess(ballpos, 3);
    //     var neighbor4 = this.board.getNeighborChess(ballpos, 4);
    //     var neighbor5 = this.board.getNeighborChess(ballpos, 5);
    //     var neighbors = [nRight, nDownRight, nDownLeft, nLeft, neighbor4, neighbor5];
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
    //       var nRight = this.board.getNeighborChess(ballpos, 0);
    //       var nDownRight = this.board.getNeighborChess(ballpos, 1);
    //       var nDownLeft = this.board.getNeighborChess(ballpos, 2);
    //       var nLeft = this.board.getNeighborChess(ballpos, 3);
    //       var neighbor4 = this.board.getNeighborChess(ballpos, 4);
    //       var neighbor5 = this.board.getNeighborChess(ballpos, 5);
    //       var neighbors = [nRight, nDownRight, nDownLeft, nLeft, neighbor4, neighbor5];
    //       if (nDownRight != null && nDownLeft != null) {
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
    //       var nRight = this.board.getNeighborChess(ballpos, 0);
    //       var nDownRight = this.board.getNeighborChess(ballpos, 1);
    //       var nDownLeft = this.board.getNeighborChess(ballpos, 2);
    //       var nLeft = this.board.getNeighborChess(ballpos, 3);
    //       var neighbor4 = this.board.getNeighborChess(ballpos, 4);
    //       var neighbor5 = this.board.getNeighborChess(ballpos, 5);
    //       var neighbors = [nRight, nDownRight, nDownLeft, nLeft, neighbor4, neighbor5];
    //       if (nDownRight != null && nDownLeft != null) {
    //         this.stopBalls();
    //         return;
    //       } else if ((i == 2 && nDownRight != null) || (i == 4 && nDownLeft != null)) {
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
    if (this.addBallsToChess()) {
      collidedOnce = false;
      staticBalls.add(this.ball1);
      this.createBall();
    }
  }

  addBallsToChess() {
    var correctedX = this.board.worldXYToTileXY(this.ball1.x, this.ball1.y).x;
    var correctedY = this.board.worldXYToTileXY(this.ball1.x, this.ball1.y).y;
    if (correctedY % 2 == 0 && correctedX == gridCountX - 1) {
      correctedX -= 1;
      console.log("corrected");
      this.board.addChess(this.ball1, correctedX, correctedY, 0, true);
      this.board.removeChess(this.ball1);
      return false;
    }
    if (this.board.isEmptyTileXYZ(correctedX, correctedY, 0)) this.board.addChess(this.ball1, correctedX, correctedY, 0, true);
    else {
      if (this.board.isEmptyTileXYZ(correctedX + 1, correctedY, 0)) {
        console.log("corrected x +1");
        this.board.addChess(this.ball1, correctedX + 1, correctedY, 0, true);
      } else if (this.board.isEmptyTileXYZ(correctedX - 1, correctedY, 0)) {
        console.log("corrected x -1");
        this.board.addChess(this.ball1, correctedX - 1, correctedY, 0, true);
      }
      return true;
    }
    return true;
  }

  update() {
    // consistently move the balls down
    if (this.ball1.y < this.board.tileXYToWorldXY(0, gridCountY - 1).y) {
      if (collidedOnce) {
        this.ball1.setY(this.ball1.y + 8);
        this.applyPhysics(false, this);
      } else {
        if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).isDown) {
          this.ball1.setY(this.ball1.y + 10);
        } else {
          this.ball1.setY(this.ball1.y + 1);
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
      !collidedOnce
    ) {
      this.ball1.setX(this.ball1.x - vertSpeed);
      if (this.ball1.x < this.board.tileXYToWorldXY(0, gridCountY - 1).x) {
        var xOffset = this.board.tileXYToWorldXY(0, gridCountY - 1).x - this.ball1.x;
        this.ball1.setX(this.ball1.x + xOffset + 1);
      }
    } else if (
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown &&
      this.ball1.x < this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x &&
      !collidedOnce
    ) {
      this.ball1.setX(this.ball1.x + vertSpeed);
      if (this.ball1.x > this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x) {
        var xOffset = this.ball1.x - this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x;
        this.ball1.setX(this.ball1.x - xOffset - 1);
      }
    }
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown && !collidedOnce) {
      // use W and S to rotate the ballgroup only once by 60 degrees

      rotLCounter++;
      this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.W);
    }
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown && !collidedOnce) {
      rotRCounter++;
      this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.S);
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
