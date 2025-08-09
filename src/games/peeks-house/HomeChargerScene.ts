import Phaser from "phaser";

export class HomeChargerScene extends Phaser.Scene {
  constructor() {
    super('HomeChargerScene');
  }

  preload() {
    this.load.image('europeekkk', 'src/assents/europeekkk.png');
  }

  create() {
  
    const background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'europeekkk');

    
    const scaleX = this.cameras.main.width / background.width;
    const scaleY = this.cameras.main.height / background.height;
    const scale = Math.max(scaleX, scaleY);

    background.setScale(scale);
    background.setScrollFactor(0);

    
    this.tweens.add({
      targets: background,
      scaleX: scale * 1.02, 
      scaleY: scale * 1.02,
      yoyo: true,         
      repeat: -1,          
      duration: 1500,      
      ease: 'Sine.easeInOut'
    });

    
    this.time.delayedCall(3000, () => {
      this.scene.start('WindowRegister');
    });
  }
}

