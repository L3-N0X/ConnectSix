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
    ballTileXY.z = 0;
    var neighbor1 = this.board.getNeighborChess(ballTileXY, 1);
    var neighbor2 = this.board.getNeighborChess(ballTileXY, 2);
    if (neighbor1 != null && neighbor2 == null) {
      if (this.board.worldXYToTileXY(neighbor1.x, neighbor1.y).x == 0 && !collidedOnce) {
        threeBallGroup[0].setX(threeBallGroup[0].x + 1);
        this.addBallsToChess();
        this.board.removeChess(this.ball1);
      }
      // console.log("neighbor1");
      var dx = neighbor1.x - threeBallGroup[0].x;
      var dy = neighbor1.y - threeBallGroup[0].y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 2 * radius + 1) {
        // collision
        collidedOnce = true;
        var overlap = 2 * radius - distance;
        var angle = Math.atan2(dy, dx);
        if (angle == Math.PI / 2 || angle == 0 || angle == Math.PI) angle = 1.5;
        threeBallGroup[0].setX(threeBallGroup[0].x - Math.cos(angle) * overlap);
        threeBallGroup[0].setY(threeBallGroup[0].y - Math.sin(angle) * overlap);
      }
    } else if (neighbor1 == null && neighbor2 != null) {
      if (
        this.board.worldXYToTileXY(neighbor2.x, neighbor2.y).x == gridCountX - 2 &&
        this.board.worldXYToTileXY(neighbor2.x, neighbor2.y).y % 2 == 0
      ) {
        console.log("neighbor2");
        threeBallGroup[0].setX(threeBallGroup[0].x - 8);
        this.stopBalls();
        return;
      } else if (this.board.worldXYToTileXY(neighbor2.x, neighbor2.y).x == 0 && !collidedOnce) {
        threeBallGroup[0].setX(threeBallGroup[0].x + 1);
        this.addBallsToChess();
        this.board.removeChess(this.ball1);
      }
      // console.log("neighbor2");
      var dx = neighbor2.x - threeBallGroup[0].x;
      var dy = neighbor2.y - threeBallGroup[0].y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 2 * radius + 1) {
        // collision
        collidedOnce = true;
        var overlap = 2 * radius - distance;
        var angle = Math.atan2(dy, dx);
        if (angle == Math.PI / 2 || angle == 0 || angle == Math.PI) angle = 1.5;
        threeBallGroup[0].setX(threeBallGroup[0].x - Math.cos(angle) * overlap);
        threeBallGroup[0].setY(threeBallGroup[0].y - Math.sin(angle) * overlap);
      }
    } else if (neighbor1 != null && neighbor2 != null) {
      console.log("both neighbors");
      if (
        this.board.worldXYToTileXY(neighbor2.x, neighbor2.y).x == gridCountX - 2 &&
        this.board.worldXYToTileXY(neighbor2.x, neighbor2.y).y % 2 == 0
      ) {
        console.log("neighbor2 both weird");
        threeBallGroup[0].setX(threeBallGroup[0].x - 8);
        this.stopBalls();
        return;
      }
      this.stopBalls();
    } else if (neighbor1 == null && neighbor2 == null) {
      // console.log("no neighbors");
    }

    if (threeBallGroup[0].x < this.board.tileXYToWorldXY(0, gridCountY - 1).x) {
      threeBallGroup[0].setX(this.board.tileXYToWorldXY(0, gridCountY - 1).x);
      var ballTileXY = this.board.worldXYToTileXY(threeBallGroup[0].x, threeBallGroup[0].y);
      ballTileXY.z = 0;
      var neighbor1 = this.board.getNeighborChess(ballTileXY, 1);
      var neighbor2 = this.board.getNeighborChess(ballTileXY, 2);
      if (neighbor1 != null) this.stopBalls();
    } else if (threeBallGroup[0].x > this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x) {
      threeBallGroup[0].setX(this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x);
      var ballTileXY = this.board.worldXYToTileXY(threeBallGroup[0].x, threeBallGroup[0].y);
      ballTileXY.z = 0;
      var neighbor1 = this.board.getNeighborChess(ballTileXY, 1);
      var neighbor2 = this.board.getNeighborChess(ballTileXY, 2);
      if (neighbor2 != null) this.stopBalls();
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
    this.createBall();
  }

  addBallsToChess() {
    var correctedX = this.board.worldXYToTileXY(this.ball1.x, this.ball1.y).x;
    var correctedY = this.board.worldXYToTileXY(this.ball1.x, this.ball1.y).y;
    this.board.addChess(this.ball1, correctedX, correctedY, 0, true);
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
        this.ball1.setX(this.ball1.x + xOffset);
      }
    } else if (
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown &&
      this.ball1.x < this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x &&
      !collidedOnce
    ) {
      this.ball1.setX(this.ball1.x + vertSpeed);
      if (this.ball1.x > this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x) {
        var xOffset = this.ball1.x - this.board.tileXYToWorldXY(gridCountX - 1, gridCountY - 1).x;
        this.ball1.setX(this.ball1.x - xOffset);
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
