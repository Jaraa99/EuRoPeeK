import Phaser from "phaser";

export class MenuGame extends Phaser.Scene {
  constructor() {
    super("MenuGames");
  }

  preload() {
    this.load.image('pajaros', 'src/assents/pagaros.png');
    this.load.image('image1', 'src/assents/aim.png');
    this.load.image('image2', 'src/assents/jobs.png');
    this.load.image('image3', 'src/assents/hoouse.png');
    this.load.image('userIcon', 'src/assents/ingles.png');
  }

  create() {
  this.add.image(0, 0, 'pajaros')
    .setOrigin(0, 0)
    .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  const spacing = 450;
    const userIcon = this.add.image(this.cameras.main.width - 50, 50, 'userIcon')
      .setDisplaySize(50, 50)
      .setInteractive()
      .setOrigin(0.5);

    userIcon.on('pointerdown', () => {
      this.scene.start('ProfileScene');
    });

    const backButton = this.add.text(this.cameras.main.width / 10, this.cameras.main.height - 30, 'Back', {
      font: '24px Arial',
      color: '#000000ff'
    }).setOrigin(0.5).setInteractive();

    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    const createGameCard = (
      x: number,
      y: number,
      key: string,
      label: string,
      onClick: () => void,
      delay: number
    ) => {
      const container = this.add.container(x, y + 100).setAlpha(0);

      const frameSize = 280;
      const imageMaxSize = 240;

      const frame = this.add.graphics();
      frame.fillStyle(0x000000, 0.5);
      frame.fillRoundedRect(-frameSize / 2, -frameSize / 2, frameSize, frameSize + 30, 20);

      const image = this.add.image(0, -10, key).setInteractive();

      // Escalar imagen proporcionalmente
      const texture = this.textures.get(key);
      const source = texture.getSourceImage();
      const scale = Math.min(imageMaxSize / source.width, imageMaxSize / source.height);
      image.setScale(scale);

      const text = this.add.text(0, 70, label, {
        font: '20px Comic Sans MS',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      text.setShadow(2, 2, '#000', 2, true, true);

      image.on('pointerover', () => {
        image.setScale(scale * 1.1);
        frame.clear();
        frame.fillStyle(0xffff00, 0.6);
        frame.fillRoundedRect(-frameSize / 2, -frameSize / 2, frameSize, frameSize + 30, 20);
      });

      image.on('pointerout', () => {
        image.setScale(scale);
        frame.clear();
        frame.fillStyle(0x000000, 0.5);
        frame.fillRoundedRect(-frameSize / 2, -frameSize / 2, frameSize, frameSize + 30, 20);
      });

      image.on('pointerdown', () => {
        this.tweens.add({
          targets: image,
          scale: scale * 1.2,
          yoyo: true,
          ease: 'Bounce.easeOut',
          duration: 300,
          onComplete: () => {
            onClick();
          }
        });
      });

      container.add([frame, image, text]);

      this.tweens.add({
        targets: container,
        y: y,
        alpha: 1,
        ease: 'Bounce.easeOut',
        delay: delay,
        duration: 800
      });

      return container;
    };

    createGameCard(centerX - spacing, centerY, 'image1', 'Play Aim', () => {
      this.scene.start('AimScene');
    }, 0);

    createGameCard(centerX, centerY, 'image2', 'Explore Jobs', () => {
      this.scene.start('JobsScene');
    }, 200);

    createGameCard(centerX + spacing, centerY, 'image3', 'Peek the House', () => {
      this.scene.start('PeekScene');
    }, 400);
  }
}
