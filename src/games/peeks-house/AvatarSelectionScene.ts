import Phaser from "phaser";

export class AvatarSelecctionScene extends Phaser.Scene {
  private avatarKeys = ["peek", "peekk", "ecu","cholo","fiesta"];
  private selectedFrame?: Phaser.GameObjects.Graphics;

  constructor() {
    super("AvatarSelectionScene");
  }

  preload() {
    this.load.image("peekk", "/assets/peekk.png");
    this.load.image("peek", "/assets/peek.png");
    this.load.image("ecu","/assets/ecu.png");
    this.load.image("cholo","/assets/cholo.png");
    this.load.image("fiesta","/assets/fiesta.png");
  }

  create() {
    this.cameras.main.setBackgroundColor("#ffffff");

    this.add.text(this.cameras.main.centerX, 40, "Elige tu avatar", {
      fontSize: "36px",
      fontFamily: "Comic Sans MS",
      color: "#ffffffff",
    }).setOrigin(0.5);

    const spacing = 160;
    const totalAvatars = this.avatarKeys.length;
    const totalWidth = (totalAvatars - 1) * spacing;
    const startX = this.cameras.main.centerX - totalWidth / 2;


    this.selectedFrame = this.add.graphics();
    this.selectedFrame.lineStyle(6, 0xffd700, 1);
    this.selectedFrame.strokeRoundedRect(0, 0, 130, 130, 20);
    this.selectedFrame.setVisible(false);

    this.avatarKeys.forEach((key, index) => {
      const x = startX + index * spacing;
      const y = 180;

      const avatar = this.add.image(x, y, key)
        .setDisplaySize(120, 120)
        .setInteractive({ useHandCursor: true })
        .setOrigin(0.5);

      // avatar.on("pointerover", () => avatar.setScale(1.1));
      // avatar.on("pointerout", () => avatar.setScale(1));

      avatar.on("pointerdown", () => {
        localStorage.setItem("avatar", key);
        this.showSelectedFrame(x, y);
        this.time.delayedCall(500, () => this.scene.start("ProfileScene"));
      });
    });

    const savedAvatar = localStorage.getItem("avatar") || "";
    const selectedIndex = this.avatarKeys.indexOf(savedAvatar);
    if (selectedIndex >= 0) {
      this.showSelectedFrame(startX + selectedIndex * spacing, 180);
    }

    const backButton = this.add.text(this.cameras.main.centerX, 350, "⬅ Volver al Perfil", {
      fontSize: "28px",
      fontFamily: "Comic Sans MS",
      color: "#ffffff",
      backgroundColor: "#0984e3",
      padding: { x: 20, y: 10 },
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backButton.on("pointerdown", () => this.scene.start("ProfileScene"));

    this.tweens.add({
      targets: this.selectedFrame,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 800,
      ease: "Sine.easeInOut",
    });
  }

  private showSelectedFrame(x: number, y: number) {
    if (!this.selectedFrame) return;
    this.selectedFrame.setPosition(x - 65, y - 65);
    this.selectedFrame.setVisible(true);
  }
}
