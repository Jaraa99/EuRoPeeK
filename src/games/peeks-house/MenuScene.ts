// MenuScene.ts
import Phaser from "phaser";


export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");  // El nombre de la escena debe coincidir con el que usas en start()
  }

  preload() {
    this.load.image('logi', '/assets/logi.png');  // Fondo del menú
  }

  create() {
    const background = this.add.image(0, 0, 'logi');
    background.setOrigin(0, 0);
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Título del menú
    this.add.text(centerX, 50, 'Welcome to the Main Menu', {
      font: '32px Arial',
      color: '#000000ff'
    }).setOrigin(0.5);

    // Botón para ir a la escena MenuGames
    const playButton = this.add.text(centerX, centerY, 'Go to Menu Games', {
      font: '24px Arial',
      color: '#ffffff',
      backgroundColor: '#1d3557',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    playButton.setInteractive();
    playButton.on('pointerdown', () => {
      console.log('Ir a MenuGames');
      this.scene.start('MenuGames'); // Iniciar la escena MenuGames
    });
  }
}
