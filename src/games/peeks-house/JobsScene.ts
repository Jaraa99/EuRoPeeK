import Phaser from "phaser";
import { ScoreManager } from './ScoreManager';

export class JobsScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private scoreBox!: Phaser.GameObjects.Graphics;
  private resultText!: Phaser.GameObjects.Text;
  private loadingText!: Phaser.GameObjects.Text;

  private lives = 3;
  private score = 0;
  private targetSentence: string[] = [];
  private selectedWords: string[] = [];
  private wordButtons: Phaser.GameObjects.Container[] = [];
  private answerSlots: Phaser.GameObjects.Text[] = [];

  private owlHappy!: Phaser.GameObjects.Image;
  private owlSad!: Phaser.GameObjects.Image;

  private correctSound!: Phaser.Sound.BaseSound;
  private wrongSound!: Phaser.Sound.BaseSound;
  private bgMusic!: Phaser.Sound.BaseSound;

  // Flag para bloquear selección mientras se reproduce audio
  private isSpeaking = false;

  // Control para mostrar reglas y bloquear juego hasta cerrarlas
  private rulesContainer!: Phaser.GameObjects.Container;
  private rulesBackground!: Phaser.GameObjects.Rectangle;
  private rulesText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;
  private isRulesShown: boolean = true;

  private allSentences: string[][] = [
    ["He", "is", "a", "doctor"],
    ["She", "is", "a", "teacher"],
    ["I", "am", "a", "firefighter"],
    ["You", "are", "a", "police", "officer"],
    ["They", "are", "musicians"],
    ["We", "are", "nurses"],
    ["He", "is", "an", "engineer"],
    ["She", "is", "a", "chef"],
    ["I", "am", "a", "student"],
    ["You", "are", "a", "dentist"],
    ["My", "father", "is", "a", "pilot"],
    ["Her", "brother", "is", "a", "mechanic"],
    ["Our", "teacher", "is", "kind"],
    ["The", "nurse", "is", "helpful"],
    ["He", "is", "a", "bus", "driver"],
    ["They", "are", "good", "friends"],
    ["She", "is", "an", "artist"],
    ["I", "am", "a", "writer"],
    ["He", "is", "a", "builder"],
    ["We", "are", "good", "students"]
  ];

  private scoreListener = (scene: string, score: number) => {
    if (scene === 'JobsScene') {
      this.score = score;
      this.scoreText?.setText(`Puntaje: ${this.score}`);
    }
  };

  constructor() {
    super("JobsScene");
  }

  preload() {
    this.load.image('bgJobs', 'src/assents/jobs.jpg');
    this.load.image('owlHappy', 'src/assents/owl_happy.png');
    this.load.image('owlSad', 'src/assents/owl_sad.png');
    this.load.audio('correctSound', 'src/assents/correct.mp3');
    this.load.audio('wrongSound', 'src/assents/wrong.mp3');
    this.load.audio('bgMusic', 'src/assents/background_music.mp3');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.image(width / 2, height / 2, 'bgJobs').setOrigin(0.5).setDisplaySize(width, height);

    this.loadingText = this.add.text(width / 2, height / 2, "Cargando...", {
      fontSize: "32px",
      color: "#333",
      backgroundColor: "#fff8dc",
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    this.owlHappy = this.add.image(width / 2, 500, 'owlHappy').setScale(0.1).setAlpha(0);
    this.owlSad = this.add.image(width / 2, 500, 'owlSad').setScale(0.1).setAlpha(0);

    this.correctSound = this.sound.add('correctSound');
    this.wrongSound = this.sound.add('wrongSound');
    this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.3 });
    this.bgMusic.play();

    this.resetGameState();

    // Contabilizar que se inicia un juego
    ScoreManager.incrementGamesPlayed();

    this.time.delayedCall(1000, () => {
      this.loadingText.destroy();

      this.add.text(50, 20, "Arrange the sentence:", {
        fontSize: "24px",
        color: "#333",
        fontStyle: "bold"
      });

      this.scoreBox = this.add.graphics();
      this.scoreBox.fillStyle(0xcce5ff, 1);
      this.scoreBox.lineStyle(2, 0x999999);
      this.scoreBox.fillRoundedRect(580, 10, 180, 40, 10);
      this.scoreBox.strokeRoundedRect(580, 10, 180, 40, 10);

      this.scoreText = this.add.text(width / 2, 20, `Puntaje: ${this.score}`, {
        fontSize: "20px",
        color: "#000",
        fontStyle: "bold"
      }).setOrigin(0.5, 0);

      this.livesText = this.add.text(width - 20, 20, `Vidas: ${this.lives}`, {
        fontSize: "20px",
        color: "#000",
        fontStyle: "bold"
      }).setOrigin(1, 0);

      this.resultText = this.add.text(50, 60, "", {
        fontSize: "20px",
        color: "#000",
        fontStyle: "bold"
      });

      // Mostrar reglas antes de empezar el juego
      this.showRules();

      const backButton = this.add.text(width / 2, height - 40, '⬅ Ir al Menú', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#7ec4cf',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();

      backButton.on('pointerover', () => backButton.setStyle({ backgroundColor: '#62aeb8' }));
      backButton.on('pointerout', () => backButton.setStyle({ backgroundColor: '#7ec4cf' }));
      backButton.on('pointerdown', () => {
        this.bgMusic.stop();
        this.scene.start('MenuScene');
      });
    });

    ScoreManager.addListener(this.scoreListener);

    this.events.on('shutdown', () => {
      if (this.bgMusic && this.bgMusic.isPlaying) {
        this.bgMusic.stop();
      }
    });

    ScoreManager.setScore('JobsScene', 0);
  }

  private resetGameState() {
    this.lives = 3;
    this.score = ScoreManager.getScore('JobsScene') || 0;
    this.selectedWords = [];
    this.targetSentence = [];
  }

  private async playWordSound(word: string) {
    return new Promise<void>(resolve => {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.onend = () => resolve();
      speechSynthesis.speak(utterance);
    });
  }

  private async spellWord(word: string) {
    const letters = word.split('');
    for (const letter of letters) {
      await new Promise<void>(resolve => {
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = 'en-US';
        utterance.onend = () => resolve();
        speechSynthesis.speak(utterance);
      });
      await new Promise(r => setTimeout(r, 400));
    }
  }

  private showRules() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo semitransparente para la ventana de reglas
    this.rulesBackground = this.add.rectangle(width / 2, height / 2, width * 0.8, height * 0.6, 0x000000, 0.7);
    this.rulesBackground.setOrigin(0.5);

    // Texto de las reglas
    const rulesContent = 
      "Reglas del Juego:\n\n" +
      "1. Escucha y arma la oración correcta.\n" +
      "2. Selecciona las palabras en el orden correcto.\n" +
      "3. Tienes 3 vidas; pierdes una si te equivocas.\n" +
      "4. Cada oración correcta suma 10 puntos.\n" +
      "5. Cuando pierdas todas las vidas, el juego termina.\n" +
      "6. ¡Diviértete y aprende inglés!";

    this.rulesText = this.add.text(width / 2, height / 2 - 40, rulesContent, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width * 0.7 }
    }).setOrigin(0.5);

    // Botón para cerrar las reglas y empezar el juego
    this.startButton = this.add.text(width / 2, height / 2 + height * 0.25, "Empezar", {
      fontSize: '32px',
      backgroundColor: '#7ec4cf',
      color: '#000',
      padding: { x: 20, y: 10 },
      align: 'center',
      fontStyle: 'bold',
      
    }).setOrigin(0.5).setInteractive();

    this.startButton.on('pointerover', () => this.startButton.setStyle({ backgroundColor: '#62aeb8' }));
    this.startButton.on('pointerout', () => this.startButton.setStyle({ backgroundColor: '#7ec4cf' }));

    this.startButton.on('pointerdown', () => {
      // Ocultar reglas y comenzar el juego
      this.rulesBackground.destroy();
      this.rulesText.destroy();
      this.startButton.destroy();

      this.isRulesShown = false;
      this.loadNewSentence();
    });
  }

  private loadNewSentence() {
    if (this.isRulesShown) return; // Bloquea hasta que cierren las reglas

    this.resultText.setText("");  // Limpiar resultado al cargar oración nueva

    this.answerSlots.forEach(slot => slot.destroy());
    this.wordButtons.forEach(btn => btn.destroy());
    this.answerSlots = [];
    this.wordButtons = [];
    this.selectedWords = [];

    const randomIndex = Phaser.Math.Between(0, this.allSentences.length - 1);
    this.targetSentence = [...this.allSentences[randomIndex]];
    const shuffledWords = Phaser.Utils.Array.Shuffle([...this.targetSentence]);

    const screenWidth = this.cameras.main.width;
    const slotSpacing = 180;
    const totalWidth = this.targetSentence.length * slotSpacing;
    const startX = (screenWidth - totalWidth) / 2 + slotSpacing / 2;

    const startY = 200;
    for (let i = 0; i < this.targetSentence.length; i++) {
      const slot = this.add.text(startX + i * slotSpacing, startY, "______", {
        fontSize: "32px",
        color: "#333",
        backgroundColor: "#e0e0e0ff",
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5);
      this.answerSlots.push(slot);
    }

    const buttonStartY = 300;
    shuffledWords.forEach((word, idx) => {
      const btnX = startX + idx * slotSpacing;

      const btnContainer = this.add.container(btnX, buttonStartY);
      const btnBg = this.add.rectangle(0, 0, 140, 50, 0x7ec4cf, 1).setStrokeStyle(2, 0x333333);
      const btnText = this.add.text(0, 0, word, {
        fontSize: "24px",
        color: "#fff"
      }).setOrigin(0.5);

      btnContainer.add([btnBg, btnText]);
      btnContainer.setSize(140, 50);
      btnContainer.setInteractive(new Phaser.Geom.Rectangle(-70, -25, 140, 50), Phaser.Geom.Rectangle.Contains);

      btnContainer.on('pointerdown', async () => {
        if (this.isSpeaking) return; // Bloquea mientras se pronuncia/deletrea
        if (this.selectedWords.length < this.targetSentence.length && !btnContainer.getData('used')) {
          this.isSpeaking = true;

          this.selectedWords.push(word);
          this.answerSlots[this.selectedWords.length - 1].setText(word);
          btnContainer.setAlpha(0.5);
          btnContainer.setData('used', true);

          await this.playWordSound(word);

          this.isSpeaking = false;

          if (this.selectedWords.length === this.targetSentence.length) {
            this.checkSentence();
          }
        }
      });

      this.wordButtons.push(btnContainer);
    });
  }

  private checkSentence() {
    const correct = JSON.stringify(this.selectedWords) === JSON.stringify(this.targetSentence);

    if (correct) {
      this.score += 10;
      this.resultText.setText("✅ ¡Correcto!");
      this.correctSound.play();
      this.showOwl(true);

      ScoreManager.incrementCorrectAnswers();
    } else {
      this.score -= 5;
      this.lives -= 1;
      this.livesText.setText(`Vidas: ${this.lives}`);
      const correctText = this.targetSentence.join(" ");
      this.resultText.setText(`❌ Incorrecto. Correcto: "${correctText}"`);
      this.wrongSound.play();
      this.showOwl(false);

      ScoreManager.incrementIncorrectAnswers();
      ScoreManager.incrementLivesLost();

      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
    }

    this.score = Math.max(this.score, 0);

    ScoreManager.setScore('JobsScene', this.score);
    this.scoreText.setText(`Puntaje: ${this.score}`);

    this.time.delayedCall(3000, () => {
      this.resultText.setText("");
      if (this.lives > 0) this.loadNewSentence();
    });
  }

  private showOwl(isHappy: boolean) {
    const owl = isHappy ? this.owlHappy : this.owlSad;
    const otherOwl = isHappy ? this.owlSad : this.owlHappy;

    otherOwl.setAlpha(0);
    owl.setAlpha(0);

    this.tweens.add({
      targets: owl,
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 1500,
      onComplete: () => {
        owl.setAlpha(0);
      }
    });
  }

  private gameOver() {
    this.bgMusic.stop();
    this.clearScene();

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.add.text(centerX, centerY - 50, `Game Over\nTu puntaje final: ${this.score}`, {
      fontSize: '48px',
      fontFamily: 'Comic Sans MS, cursive',
      color: '#ff0000',
      align: 'center',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(10);

    const restartButton = this.add.text(centerX, centerY + 120, '🔄 Restart', {
      fontSize: '32px',
      fontFamily: 'Comic Sans MS, cursive',
      backgroundColor: '#ff8800',
      color: '#fff',
      padding: { x: 20, y: 10 },
      align: 'center',
    }).setOrigin(0.5).setDepth(10).setInteractive({ cursor: 'pointer' });

    restartButton.on('pointerover', () => restartButton.setStyle({ backgroundColor: '#cc6600' }));
    restartButton.on('pointerout', () => restartButton.setStyle({ backgroundColor: '#ff8800' }));
    restartButton.on('pointerdown', () => {
      ScoreManager.setScore('JobsScene', 0);
      this.scene.restart();
    });
  }

  private clearScene() {
    this.answerSlots.forEach(text => text.destroy());
    this.wordButtons.forEach(btn => btn.destroy());
    this.resultText.setText("");
  }

  shutdown() {
    ScoreManager.removeListener(this.scoreListener);
  }
}
