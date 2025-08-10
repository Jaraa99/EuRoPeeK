import Phaser from "phaser";
import { ScoreManager } from "./ScoreManager";

export class ProfileScene extends Phaser.Scene {
  private profileImage!: Phaser.GameObjects.Image;
  private bgMusic!: Phaser.Sound.BaseSound;

  private scoreTexts: Phaser.GameObjects.Text[] = [];
  private totalText!: Phaser.GameObjects.Text;
  private statsTexts: Phaser.GameObjects.Text[] = [];

  private statsX = 80;
  private statsY = 240;

  constructor() {
    super("ProfileScene");
  }

  preload() {
    this.load.audio("profileMusic", "src/assets/profile-music.mp3");
    this.load.image("fondos", "src/assets/fondos.png"); // Carga la imagen de fondo
  }

  create() {
    // Imagen de fondo que cubre toda la pantalla
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "fondos")
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
      .setDepth(-1);

    this.bgMusic = this.sound.add("profileMusic", {
      loop: true,
      volume: 0.5,
    });
    this.bgMusic.play();

    this.events.on("shutdown", () => {
      if (this.bgMusic && this.bgMusic.isPlaying) this.bgMusic.stop();
    });

    this.events.on("sleep", () => {
      if (this.bgMusic && this.bgMusic.isPlaying) this.bgMusic.stop();
    });

    this.addBackgroundStars();
    this.playParticles();
    this.addTitle();
    this.displayUserInfo();
    this.createProfileFrameAndImage();

    this.createStatsBackground();

    this.createBackButton();
    this.createLogoutButton();
    this.addSideBalloons();

    this.createStatsTextObjects();

    this.time.addEvent({
      delay: 1500,
      callback: this.updateStatsDisplay,
      callbackScope: this,
      loop: true,
    });
  }

  private addTitle() {
    this.add.text(this.cameras.main.centerX, 30, "🌟 My Profile 🌟", {
      fontFamily: "Comic Sans MS",
      fontSize: "50px",
      color: "#ffe066",
      stroke: "#000",
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: "#444", blur: 4, fill: true },
    }).setOrigin(0.5);
  }

  private displayUserInfo() {
    const username = localStorage.getItem("username") || "Estudiante";
    const email = localStorage.getItem("email") || "correo@ejemplo.com";

    this.add.text(200, 70, `🧸 User: ${username}`, {
      fontSize: "26px",
      fontFamily: "Comic Sans MS",
      color: "#000000ff",
    });

    this.add.text(200, 105, `📮 Mail: ${email}`, {
      fontSize: "26px",
      fontFamily: "Comic Sans MS",
      color: "#000000ff",
    });

    const changeAvatarBtn = this.add.text(200, 150, "🎭 Change Avatar", {
      fontSize: "24px",
      fontFamily: "Comic Sans MS",
      color: "#ffffff",
      backgroundColor: "#6c5ce7",
      padding: { x: 20, y: 10 },
      stroke: "#000",
      strokeThickness: 2,
    })
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        changeAvatarBtn.setStyle({ backgroundColor: "#a29bfe" });
        changeAvatarBtn.setScale(1.1);
      })
      .on("pointerout", () => {
        changeAvatarBtn.setStyle({ backgroundColor: "#6c5ce7" });
        changeAvatarBtn.setScale(1);
      })
      .on("pointerdown", () => this.scene.start("AvatarSelectionScene"));
  }

  private createProfileFrameAndImage() {
    this.add.rectangle(110, 110, 130, 130, 0xffdde1)
      .setOrigin(0.5)
      .setStrokeStyle(4, 0xffffff);

    const avatarKey = localStorage.getItem("avatar") || "defaultOwl";

    this.profileImage = this.add.image(110, 110, avatarKey)
      .setOrigin(0.5)
      .setDisplaySize(120, 120);

    this.tweens.add({
      targets: this.profileImage,
      y: 100,
      duration: 500,
      ease: "Bounce.easeOut",
    });
  }

  private createStatsBackground() {
    const width = 420;
    const height = 280;

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.9);
    bg.fillRoundedRect(this.statsX, this.statsY, width, height, 16);
    bg.lineStyle(4, 0xffd700, 1);
    bg.strokeRoundedRect(this.statsX, this.statsY, width, height, 16);
  }

  private createStatsTextObjects() {
    const scores = ScoreManager.getAllScores();

    this.scoreTexts.forEach(t => t.destroy());
    this.statsTexts.forEach(t => t.destroy());
    this.scoreTexts = [];
    this.statsTexts = [];

    let index = 0;
    for (const scene of Object.keys(scores)) {
      this.add.text(this.statsX + 20, this.statsY + 20 + index * 25, `🏅 ${scene}:`, {
        fontSize: "20px", fontFamily: "Comic Sans MS", color: "#000", fixedWidth: 200, align: "left"
      });

      const value = this.add.text(this.statsX + 230, this.statsY + 20 + index * 25, "0 pts", {
        fontSize: "20px", fontFamily: "Comic Sans MS", color: "#000", fixedWidth: 150, align: "right"
      });

      this.scoreTexts.push(value);
      index++;
    }

    this.add.text(this.statsX + 20, this.statsY + 20 + index * 25, `🏆 Total:`, {
      fontSize: "22px", fontFamily: "Comic Sans MS", color: "#d62828", fixedWidth: 200, align: "left"
    });

    this.totalText = this.add.text(this.statsX + 230, this.statsY + 20 + index * 25, "0 puntos", {
      fontSize: "22px", fontFamily: "Comic Sans MS", color: "#d62828", fixedWidth: 150, align: "right"
    });

    index += 2;

    const statsLabels = [
      "🕹 Juegos Jugados:",
      "✅ Correctas:",
      "❌ Incorrectas:",
      "💔 Vidas Perdidas:",
      "🎯 Precisión:",
    ];

    for (let i = 0; i < statsLabels.length; i++) {
      this.add.text(this.statsX + 20, this.statsY + 20 + index * 25, statsLabels[i], {
        fontSize: "20px",
        fontFamily: "Comic Sans MS",
        color: "#000",
        fixedWidth: 200,
        align: "left",
      });

      const val = this.add.text(this.statsX + 230, this.statsY + 20 + index * 25, "", {
        fontSize: "20px",
        fontFamily: "Comic Sans MS",
        color: "#000",
        fixedWidth: 150,
        align: "right",
      });

      this.statsTexts.push(val);
      index++;
    }

    this.updateStatsDisplay();
  }

  private updateStatsDisplay() {
    const scores = ScoreManager.getAllScores();
    const total = ScoreManager.getTotalScore();
    const correct = ScoreManager.getCorrectAnswers();
    const incorrect = ScoreManager.getIncorrectAnswers();
    const games = ScoreManager.getGamesPlayed();
    const livesLost = ScoreManager.getLivesLost();

    const accuracy =
      correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;

    let i = 0;
    for (const scene of Object.keys(scores)) {
      this.scoreTexts[i].setText(`${scores[scene]} pts`);
      i++;
    }

    this.totalText.setText(`${total} puntos`);

    const statsValues = [games, correct, incorrect, livesLost, `${accuracy}%`];
    for (let j = 0; j < statsValues.length; j++) {
      this.statsTexts[j].setText(`${statsValues[j]}`);
    }
  }

  private createBackButton() {
    const backButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 40,
      "⬅ Volver al Menú",
      {
        fontSize: "30px",
        fontFamily: "Comic Sans MS",
        color: "#ffffff",
        backgroundColor: "#00b4d8",
        padding: { x: 25, y: 15 },
        stroke: "#000",
        strokeThickness: 3,
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 4, fill: true },
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on("pointerover", () => {
      backButton.setStyle({ backgroundColor: "#48cae4" });
      backButton.setScale(1.1);
    });
    backButton.on("pointerout", () => {
      backButton.setStyle({ backgroundColor: "#00b4d8" });
      backButton.setScale(1);
    });
    backButton.on("pointerdown", () => this.scene.start("MenuScene"));
  }

  private createLogoutButton() {
    const logoutButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 110,
      "🚪 Cerrar Sesión",
      {
        fontSize: "28px",
        fontFamily: "Comic Sans MS",
        color: "#ffffff",
        backgroundColor: "#d62828",
        padding: { x: 25, y: 12 },
        stroke: "#000",
        strokeThickness: 3,
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 4, fill: true },
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    logoutButton.on("pointerover", () => {
      logoutButton.setStyle({ backgroundColor: "#e63946" });
      logoutButton.setScale(1.1);
    });
    logoutButton.on("pointerout", () => {
      logoutButton.setStyle({ backgroundColor: "#d62828" });
      logoutButton.setScale(1);
    });
    logoutButton.on("pointerdown", () => {
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("avatar");

      this.scene.start("Logins");
    });
  }

  private addSideBalloons() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const spacing = 80;
    const colors = [0xff6f91, 0xff9671, 0xf9f871, 0x61c0bf, 0x6a2c70];

    for (let y = spacing / 2; y < height - spacing / 2; y += spacing) {
      const colorLeft = colors[Phaser.Math.Between(0, colors.length - 1)];
      this.createAnimatedBalloon(20, y, colorLeft);

      const colorRight = colors[Phaser.Math.Between(0, colors.length - 1)];
      this.createAnimatedBalloon(width - 20, y, colorRight);
    }
  }

  private createAnimatedBalloon(x: number, y: number, color: number) {
    const balloon = this.add.circle(x, y, 15, color).setAlpha(0.8);

    this.tweens.add({
      targets: balloon,
      y: y - 15,
      duration: Phaser.Math.Between(3000, 6000),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      delay: Phaser.Math.Between(0, 2000),
    });
  }

  private playParticles() {
    this.add.particles(0, 0, "spark", {
      x: { min: 0, max: 480 },
      y: { min: 0, max: 100 },
      lifespan: 3000,
      speedY: { min: 30, max: 60 },
      scale: { start: 0.2, end: 0 },
      quantity: 1,
      frequency: 200,
      tint: [0xffd700, 0xff6f91, 0xf9f871],
    });
  }

  private addBackgroundStars() {
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, this.scale.width),
        Phaser.Math.Between(0, 100),
        2,
        0xffffff
      ).setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));

      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 1 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: Phaser.Math.Between(0, 1000),
      });
    }
  }
}
