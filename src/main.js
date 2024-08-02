import "./style.css";
import Phaser from "phaser";
import playerImg from './Assets/Sprites/Player.png';
import enemyImg from './Assets/Sprites/Zombie.png';

const sizes = {
  width: 1500,
  height: 600,
};

function getRandomNumber(e) {
  return Math.floor(Math.random() * e);
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.playerSpeed = 200;
    this.enemySpeed = 190;
    this.dashCooldown = false;
    this.dashCooldownTime = 2500;
    this.enemyHealth = 200;
    this.enemyCurrentHealth = 200;

    this.maxTime = 60;
    this.remainingTime = this.maxTime; // 1 minute
  }

  preload() {
    this.load.image('player', playerImg);
    this.load.image("enemy", enemyImg);
  }

  create() {
    // Background
    // this.add.image(0, 0, "bg").setOrigin(0, 0);

    // Player
    this.player = this.physics.add.sprite(400, 300, "player").setOrigin(0,0);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(this.player.width - this.player.width/4, this.player.height - this.player.height/4);
    
    // Enemy
    this.enemy = this.physics.add.sprite(700, 250, "enemy").setOrigin(0, 0);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setSize(this.enemy.width - this.enemy.width/4, this.enemy.height - this.enemy.height/4);

    // Colliders
    // this.physics.add.collider(this.player, this.enemy);
    // this.physics.add.overlap(
    //   this.player,
    //   this.enemy,
    //   () =>
    //     // this.killPlayer(this.player)
    //     (this.enemy.enemyCurrentHealth -= 10),
    //   console.log("Damage Taken")
    // );

    // Assign Keys
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      r: Phaser.Input.Keyboard.KeyCodes.R,
    });

    this.remainingTimeText = this.add.text(
      10,
      20,
      `Remaining Time: ${this.remainingTime}`,
      { font: "26px Arial", fill: "#FFF" }
    );

    this.add.text(10, sizes.height - 50, "Objective: Avoid the enemy for 1 minute!\nControls: WASD - movement; SPACE - dash", {font: '22px Arial', fill: '#FFF'})

    this.dashScore = this.add.rectangle(
      this.player.x + this.player.width / 2,
      this.player.y - 10,
      40,
      5,
      0x00ff00
    );

    // this.enemyHealthIndicatorHurt = this.add.rectangle(
    //   this.enemy.x + this.enemy.width / 2,
    //   this.enemy.y - 10,
    //   this.enemy.width,
    //   5,
    //   0xFF0000
    // );

    // this.enemyHealthIndicator = this.add.rectangle(
    //   this.enemy.x + this.enemy.width / 2,
    //   this.enemy.y - 10,
    //   this.enemy.width,
    //   5,
    //   0x00ff00
    // );

    this.enemyHealthIndicator = this.add.graphics();
    // this.updateHealth();

    // this.time.addEvent({
    //   delay: 1000,
    //   callback: () => {
    //     this.takeDamage(50);
    //   },
    //   loop: true,
    // });

    this.physics.add.collider(
      this.player,
      this.enemy,
      () => {
        this.gameOver("lose");
      },
      null,
      this
    );

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  updateTimer() {
    this.remainingTime--;

    this.remainingTimeText.setText(`Remaining Time: ${this.remainingTime}`);

    if (this.remainingTime == 0) {
      this.gameOver("win");
    }
  }

  gameOver(event) {
    this.timerEvent.remove();
    this.physics.pause();

    if (event == "win") {
      this.add
        .text(10, 55, "You Win!\nRefresh the page to restart.", {
          fontSize: "24px",
          fill: "#ff0000",
        })
        .setOrigin(0, 0);
    } else if (event == "lose") {
      this.add
        .text(10, 55, "Game Over\nRefresh the page to restart.", {
          fontSize: "24px",
          fill: "#ff0000",
        })
        .setOrigin(0, 0);
    }
  }

  updateHealth() {
    // reset the health
    this.enemyHealthIndicator.clear();

    // definitions
    const barWidth = this.enemy.width;
    const barHeight = 5;
    const barX = 0;
    const barY = 0;

    // add red color
    this.enemyHealthIndicator.fillStyle(0xff0000);
    this.enemyHealthIndicator.fillRect(barX, barY, barWidth, barHeight);

    // calculate health width
    const healthWidth = (this.enemyCurrentHealth / this.enemyHealth) * barWidth;

    // pass health width to the bar with green color this  time
    this.enemyHealthIndicator.fillStyle(0x00ff00);
    this.enemyHealthIndicator.fillRect(barX, barY, healthWidth, barHeight);
  }

  takeDamage(amount) {
    this.enemyCurrentHealth -= amount;

    // Ensure health does not drop below 0
    if (this.enemyCurrentHealth <= 0) {
      this.enemyCurrentHealth = 0;
      this.enemy.destroy();
      this.enemyHealthIndicator.destroy();
    }

    // Update the health bar
    this.updateHealth();
  }

  update() {
    this.dashScore.setPosition(this.player.x + this.player.width/2, this.player.y - 5);
    this.enemyHealthIndicator.setPosition(this.enemy.x, this.enemy.y - 10);

    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // Movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      // console.log(getRandomNumber(4));
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    } else {
      this.player.setVelocityY(0);
    }

    // Movement Fix when two keys are pressed
    if (
      (this.cursors.down.isDown &&
        (this.cursors.right.isDown || this.cursors.left.isDown)) ||
      (this.cursors.up.isDown &&
        (this.cursors.right.isDown || this.cursors.left.isDown))
    ) {
      this.playerSpeed = 150;
    } else {
      this.playerSpeed = 200;
    }

    // Dashing
    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.space) &&
      !this.dashCooldown
    ) {
      this.dash();
    }
  }

  killPlayer(player) {
    player.disableBody(true, true);
  }

  dash() {
    const dashVector = new Phaser.Math.Vector2(this.player.body.velocity)
      .normalize()
      .scale(5000);

    this.dashCooldown = true;
    this.dashScore.setFillStyle(0xff0000);
    this.player.setVelocity(dashVector.x, dashVector.y);
    // this.player.body.checkCollision.none = true;

    // this.time.delayedCall(1000, () => {
    //   this.player.body.checkCollision.none = false;
    // });

    this.time.delayedCall(this.dashCooldownTime, () => {
      this.dashCooldown = false;
      this.dashScore.setFillStyle(0x00ff00);
    });
  }
}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);
