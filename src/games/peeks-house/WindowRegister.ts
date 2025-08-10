import Phaser from "phaser";

export class WindowRegister extends Phaser.Scene {
    constructor() {
        super('WindowRegister');
    }

    preload() {
        this.load.image('europeekkk', 'src/assets/europeekkk.png');
    }

    create() {
        const background = this.add.image(0, 0, 'europeekkk');
        background.setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width!, this.cameras.main.height!);

        const createButton = (x: number, y: number, text: string, sceneName: string) => {
            const rect = this.add.rectangle(0, 0, 160, 50, 0x1d3557);
            rect.setStrokeStyle(2, 0xffffff);

            const label = this.add.text(0, 0, text, {
                font: 'bold 24px Arial',
                color: '#ffffff'
            }).setOrigin(0.5);

            const container = this.add.container(x, y, [rect, label]);
            container.setSize(160, 50);

            rect.setInteractive({ useHandCursor: true });

            rect.on('pointerover', () => {
                rect.setFillStyle(0x457b9d);
            });

            rect.on('pointerout', () => {
                rect.setFillStyle(0x1d3557);
            });

            rect.on('pointerdown', () => {
                this.scene.start(sceneName);
            });
        };

        createButton(this.cameras.main.width! / 7, this.cameras.main.height! - 100, 'Login', 'Logins');
        createButton(this.cameras.main.width! / 7, this.cameras.main.height! - 40, 'Register', 'Userregistration');
    }
}
