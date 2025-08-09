import Phaser from 'phaser';
import { ScoreManager } from './ScoreManager';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  question: string;
  answer: string;
  difficulty: Difficulty;
}

export class AimScene extends Phaser.Scene {
  private score = 0;
  private lives = 3;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private questionText!: Phaser.GameObjects.Text;
  private inputContainer!: Phaser.GameObjects.DOMElement;
  private currentQuestion: Question | null = null;
  private questionActive = false;

  private correctSound!: Phaser.Sound.BaseSound;
  private wrongSound!: Phaser.Sound.BaseSound;
  private spinSound!: Phaser.Sound.BaseSound;
  private bgMusic!: Phaser.Sound.BaseSound;

  private wheelContainer!: Phaser.GameObjects.Container;
  private isSpinning = false;

  private feedbackGroup!: Phaser.GameObjects.Group;

  private loadingContainer!: Phaser.GameObjects.Container;

  private questions: Question[] = [
    { question: 'What is the color of the sky?', answer: 'blue', difficulty: 'easy' },
    { question: 'Translate: "Dog" to Spanish.', answer: 'perro', difficulty: 'easy' },
    { question: 'What do bees make?', answer: 'honey', difficulty: 'easy' },
    { question: 'What’s 2 + 2?', answer: '4', difficulty: 'easy' },
    { question: 'What is 5 x 6?', answer: '30', difficulty: 'medium' },
    { question: 'Translate: "Window" to Spanish.', answer: 'ventana', difficulty: 'medium' },
    { question: 'What is the capital of France?', answer: 'paris', difficulty: 'medium' },
    { question: 'What planet do we live on?', answer: 'earth', difficulty: 'medium' },
    { question: 'Name the longest river in the world.', answer: 'nile', difficulty: 'hard' },
    { question: 'Spell “environment” backwards.', answer: 'tnemnorivne', difficulty: 'hard' },
    { question: 'What’s the square root of 144?', answer: '12', difficulty: 'hard' },
    { question: 'Translate: “Knowledge” to Spanish.', answer: 'conocimiento', difficulty: 'hard' },
    { question: 'What is the opposite of "hot"?', answer: 'cold', difficulty: 'easy' },
    { question: 'Translate: "House" to Spanish.', answer: 'casa', difficulty: 'easy' },
    { question: 'How many legs does a spider have?', answer: '8', difficulty: 'easy' },
    { question: 'What color do you get when you mix red and yellow?', answer: 'orange', difficulty: 'easy' },
    { question: 'What is 12 ÷ 3?', answer: '4', difficulty: 'medium' },
    { question: 'Translate: "Tree" to Spanish.', answer: 'árbol', difficulty: 'medium' },
    { question: 'What gas do humans need to breathe?', answer: 'oxygen', difficulty: 'medium' },
    { question: 'Name the largest ocean on Earth.', answer: 'pacific', difficulty: 'hard' },
    { question: 'Translate: “Challenge” to Spanish.', answer: 'desafío', difficulty: 'hard' },
    { question: 'What is the chemical symbol for gold?', answer: 'au', difficulty: 'hard' },
    { question: 'What color are bananas?', answer: 'yellow', difficulty: 'easy' },
    { question: 'Translate: "Cat" to Spanish.', answer: 'gato', difficulty: 'easy' },
    { question: 'How many days are in a week?', answer: '7', difficulty: 'easy' },
    { question: 'What is the first letter of the alphabet?', answer: 'a', difficulty: 'easy' },
    { question: 'What is 10 divided by 2?', answer: '5', difficulty: 'medium' },
    { question: 'Translate: "School" to Spanish.', answer: 'escuela', difficulty: 'medium' },
    { question: 'Who wrote "Romeo and Juliet"?', answer: 'shakespeare', difficulty: 'medium' },
    { question: 'What is the boiling point of water in Celsius?', answer: '100', difficulty: 'medium' },
    { question: 'Translate: “Development” to Spanish.', answer: 'desarrollo', difficulty: 'hard' },
    { question: 'Who painted the Mona Lisa?', answer: 'leonardo da vinci', difficulty: 'hard' },
  ];

  private scoreListener = (scene: string, score: number) => {
    if (scene === 'AimScene') {
      this.score = score;
      this.scoreText?.setText(`Score: ${this.score}`);
    }
  };
  private showRulesOverlay() {
  const width = this.cameras.main.width;
  const height = this.cameras.main.height;

  const overlayBG = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(1000);

  const rulesText = this.add.text(width / 2, height / 2 - 120,
    `📜 REGLAS DEL JUEGO 📜\n\n` +
    `🎯 Gira la rueda para elegir la dificultad.\n` +
    `📝 Escribe la respuesta y presiona "Enviar".\n` +
    `✅ Respuestas correctas suman puntos.\n` +
    `❌ Incorrectas restan puntos y vidas.\n` +
    `💔 Tienes 3 vidas. Si se acaban, pierdes.\n\n` +
    `🎉 ¡Intenta conseguir la mayor puntuación posible! 🎉\n\n` +
    `¡Buena suerte! 🍀`, {
    fontSize: '22px',
    fontFamily: 'Comic Sans MS, cursive',
    color: '#ffffff',
    align: 'center',
    backgroundColor: '#ff880088',
    padding: { x: 20, y: 20 },
    wordWrap: { width: 600 }
  }).setOrigin(0.5).setDepth(1001);

  const startButton = this.add.text(width / 2, height / 2 + 180, '¡Empezar!', {
    fontSize: '32px',
    fontFamily: 'Comic Sans MS, cursive',
    backgroundColor: '#00cc66',
    color: '#ffffff',
    padding: { x: 20, y: 10 }
  }).setOrigin(0.5).setDepth(1001).setInteractive();

  startButton.on('pointerover', () => startButton.setStyle({ backgroundColor: '#009944' }));
  startButton.on('pointerout', () => startButton.setStyle({ backgroundColor: '#00cc66' }));
  startButton.on('pointerdown', () => {
    overlayBG.destroy();
    rulesText.destroy();
    startButton.destroy();
    this.questionText.setText('¡Presiona "Girar" para empezar!');
  });
}


  constructor() {
    super('AimScene');
  }

  private resetGameState() {
    this.lives = 3;
    this.score = 0;
    this.questionActive = false;
    this.currentQuestion = null;

    ScoreManager.incrementGamesPlayed();  // Contabilizar inicio de juego
  }

  preload() {
    this.load.image("iii", 'src/assents/iii.jpg');
    this.load.audio('bgMusic', 'src/assents/music.mp3');
    this.load.audio('correctSound', 'src/assents/correct.mp3');
    this.load.audio('wrongSound', 'src/assents/wrong.mp3');
    this.load.audio('spinSound', 'src/assents/spin.mp3');
    this.load.image('owlHappy', 'src/assents/owl_happy.png');
    this.load.image('owlSad', 'src/assents/owl_sad.png');
  }

  create() {
    this.showLoadingScreen();
          this.showRulesOverlay();

      this.time.delayedCall(3000, () => {
      this.hideLoadingScreen();
      this.resetGameState();
      this.score = ScoreManager.getScore('AimScene') || 0;
      

      const centerX = this.cameras.main.centerX;
      const centerY = this.cameras.main.centerY;

      this.add.image(centerX, centerY, 'iii')
        .setOrigin(0.5)
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
        .setDepth(0);

      this.add.text(centerX, 50, '🎯Guess the Answer🎯', {
        fontSize: '32px',
        fontFamily: 'Comic Sans MS, cursive',
        color: '#ffffff',
        backgroundColor: '#ff8800',
        padding: { x: 20, y: 10 },
        align: 'center'
      }).setOrigin(0.5).setDepth(7);

      this.correctSound = this.sound.add('correctSound');
      this.wrongSound = this.sound.add('wrongSound');
      this.spinSound = this.sound.add('spinSound', { loop: true });
      this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.3 });
      this.bgMusic.play();

      this.wheelContainer = this.add.container(centerX, centerY -60).setDepth(5);
      const radius = 130;
      const sectors = [
        { color: 0x7CFC00, start: 0, end: 120, difficulty: 'easy',icon: '😊Easy' },
        { color: 0xFF4500, start: 120, end: 240, difficulty: 'medium',icon: '😬Medium' },
        { color: 0x1E90FF, start: 240, end: 360, difficulty: 'hard',icon: '🤯Hard' },
      ];
      const wheelGraphics = this.add.graphics();
      sectors.forEach((sector) => {
        wheelGraphics.fillStyle(sector.color, 1);
        wheelGraphics.slice(0, 0, radius, Phaser.Math.DegToRad(sector.start), Phaser.Math.DegToRad(sector.end), false);
        wheelGraphics.fillPath();
      });
      this.wheelContainer.add(wheelGraphics);
      sectors.forEach((sector) => {
        const angleDeg = (sector.start + sector.end) / 2;
        const angleRad = Phaser.Math.DegToRad(angleDeg);
        const textX = Math.cos(angleRad) * (radius / 2);
        const textY = Math.sin(angleRad) * (radius / 2);

        const emojiText = this.add.text(textX, textY, sector.icon, {
          fontSize: '32px'
        }).setOrigin(0.5);

        this.wheelContainer.add(emojiText);
      });

      this.tweens.add({
        targets: this.wheelContainer,
        scale: 1.05,
        yoyo: true,
        repeat: -1,
        duration: 1500,
        ease: 'Sine.easeInOut'
      });

      this.add.triangle(centerX, centerY - radius - 20, 0, 20, 40, 20, 20, 0, 0xffcc00)
        .setOrigin(0.5)
        .setDepth(6);

      const buttonStyle = {
        fontSize: '24px',
        fontFamily: 'Comic Sans MS, cursive',
        backgroundColor: '#ff8800',
        color: '#ffffff',
        padding: { x: 20, y: 10 },
      };

      const spinButton = this.add.text(centerX, centerY + 270, '🎯 Girar', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(7);

      spinButton.on('pointerover', () => spinButton.setStyle({ backgroundColor: '#cc6600' }));
      spinButton.on('pointerout', () => spinButton.setStyle({ backgroundColor: '#ff8800' }));
      spinButton.on('pointerdown', () => {
        if (this.isSpinning || this.questionActive) return;
        this.spinWheel();
      });

      const backBtnBg = this.add.graphics({ x: 20, y: this.cameras.main.height - 60 });
      backBtnBg.fillStyle(0x444444, 0.7);
      backBtnBg.fillRoundedRect(0, 0, 120, 40, 10);
      backBtnBg.setDepth(6);

      const backButton = this.add.text(30, this.cameras.main.height - 50, '⬅️ Menú', {
        fontSize: '20px',
        fontFamily: 'Comic Sans MS, cursive',
        color: '#ffffff'
      }).setDepth(7).setInteractive();

      backButton.on('pointerover', () => {
        backBtnBg.clear();
        backBtnBg.fillStyle(0x666666, 0.7);
        backBtnBg.fillRoundedRect(0, 0, 120, 40, 10);
      });

      backButton.on('pointerout', () => {
        backBtnBg.clear();
        backBtnBg.fillStyle(0x444444, 0.7);
        backBtnBg.fillRoundedRect(0, 0, 120, 40, 10);
      });

      backButton.on('pointerdown', () => {
        this.bgMusic.stop();
        this.scene.start('MenuScene');
      });

      this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 5 }
      }).setDepth(7);

      this.livesText = this.add.text(this.cameras.main.width - 140, 20, `Vidas: ${this.lives}`, {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 5 }
      }).setDepth(7);

      this.questionText = this.add.text(centerX, 120, '', {
        fontSize: '22px',
        fontFamily: 'Comic Sans MS, cursive',
        color: '#000000',
        backgroundColor: '#ffffffcc',
        padding: { x: 15, y: 10 },
        wordWrap: { width: 720 },
        align: 'center'
      }).setOrigin(0.5).setDepth(7);

      const inputHTML = `
        <input id="answer-input" type="text" placeholder="Escribe tu respuesta" autocomplete="off" 
               style="
                  font-size: 20px; 
                  padding: 8px 12px; 
                  border-radius: 8px; 
                  border: 2px solid #ff8800; 
                  width: 350px;
                  font-family: 'Comic Sans MS', cursive;
               "/>
        <button id="submit-btn" style="
                  font-size: 20px;
                  background-color: #ff8800; 
                  color: white; 
                  border: none; 
                  border-radius: 8px; 
                  padding: 8px 16px; 
                  margin-left: 10px;
                  cursor: pointer;
                  font-family: 'Comic Sans MS', cursive;
              ">Enviar</button>
      `;

      this.inputContainer = this.add.dom(centerX, centerY + 160).createFromHTML(inputHTML).setDepth(7);

      const submitButton = this.inputContainer.getChildByID('submit-btn') as HTMLButtonElement;
      submitButton.onclick = () => this.checkAnswer();

      const answerInput = this.inputContainer.getChildByID('answer-input') as HTMLInputElement;
      answerInput.onkeydown = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.checkAnswer();
        }
      };

      this.feedbackGroup = this.add.group();

      ScoreManager.addListener(this.scoreListener);

      this.questionText.setText('¡Presiona "Girar" para empezar!');
    });
  }

  private spinWheel() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    this.spinSound.play();

    const fullSpins = Phaser.Math.Between(3, 6);
    const extraDegrees = Phaser.Math.Between(0, 360);
    const totalRotation = 360 * fullSpins + extraDegrees;

    this.tweens.add({
      targets: this.wheelContainer,
      angle: this.wheelContainer.angle + totalRotation,
      duration: 4000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.spinSound.stop();
        this.isSpinning = false;
        const normalizedAngle = (this.wheelContainer.angle + totalRotation) % 360;
        this.askQuestionForAngle(normalizedAngle);
      }
    });
  }

  private askQuestionForAngle(angle: number) {
    let difficulty: Difficulty = 'easy';
    if (angle >= 0 && angle < 120) difficulty = 'easy';
    else if (angle >= 120 && angle < 240) difficulty = 'medium';
    else difficulty = 'hard';

    const filtered = this.questions.filter(q => q.difficulty === difficulty);
    if (filtered.length === 0) {
      this.questionText.setText('No hay preguntas para esta dificultad.');
      return;
    }

    this.currentQuestion = Phaser.Utils.Array.GetRandom(filtered);
    this.questionText.setText(this.currentQuestion.question);
    this.questionActive = true;

    const answerInput = this.inputContainer.getChildByID('answer-input') as HTMLInputElement;
    answerInput.value = '';
    answerInput.focus();
  }

  private checkAnswer() {
    if (!this.questionActive || !this.currentQuestion) return;

    const answerInput = this.inputContainer.getChildByID('answer-input') as HTMLInputElement;
    const userAnswer = answerInput.value.trim().toLowerCase();

    if (userAnswer === '') return;

    const correctAnswer = this.currentQuestion.answer.toLowerCase();

    if (userAnswer === correctAnswer) {
      this.correctSound.play();
      this.showFeedback(true);
      this.score += 10;
      ScoreManager.incrementCorrectAnswers();    // Incrementar respuestas correctas
    } else {
      this.wrongSound.play();
      this.showFeedback(false);
      this.score -= 5;
      this.lives -= 1;
      this.livesText.setText(`Vidas: ${this.lives}`);

      ScoreManager.incrementIncorrectAnswers();  // Incrementar respuestas incorrectas
      ScoreManager.incrementLivesLost();         // Incrementar vidas perdidas

      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
    }

    this.score = Math.max(this.score, 0);
    this.scoreText.setText(`Score: ${this.score}`);
    ScoreManager.setScore('AimScene', this.score);

    this.questionActive = false;
    this.currentQuestion = null;
    this.questionText.setText('¡Presiona "Girar" para continuar!');

    answerInput.value = '';
  }

  private showFeedback(correct: boolean) {
    const centerY = this.cameras.main.centerY;
    const centerX = this.cameras.main.centerX;

    const feedbackText = this.add.text(centerX, centerY + 80, correct ? '¡Correct! 🎉' : '¡Incorrect! ❌', {
      fontSize: '48px',
      fontFamily: 'Comic Sans MS, cursive',
      color: correct ? '#00cc00' : '#cc0000',
      stroke: '#000',
      strokeThickness: 5,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000',
        blur: 4,
        stroke: true,
        fill: true,
      },
    }).setOrigin(0.5).setDepth(8);

    this.feedbackGroup.add(feedbackText);

    this.tweens.add({
      targets: feedbackText,
      alpha: 0,
      duration: 1500,
      ease: 'Cubic.easeOut',
      delay: 1000,
      onComplete: () => {
        feedbackText.destroy();
      }
    });
  }

  private gameOver() {
    this.bgMusic.stop();
    this.spinSound.stop();
    this.questionActive = false;
    this.inputContainer.setVisible(false);
    this.questionText.setText('¡Juego terminado! 😢');

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const gameOverText = this.add.text(centerX, centerY, 'Game Over\nTu puntaje final: ' + this.score, {
      fontSize: '48px',
      fontFamily: 'Comic Sans MS, cursive',
      color: '#ff0000',
      align: 'center',
      backgroundColor: '#000000cc',
      padding: { x: 20, y: 20 }
    }).setOrigin(0.5).setDepth(10);

    const restartButton = this.add.text(centerX, centerY + 120, 'Reiniciar', {
      fontSize: '32px',
      fontFamily: 'Comic Sans MS, cursive',
      backgroundColor: '#ff8800',
      color: '#fff',
      padding: { x: 15, y: 10 },
      
    }).setOrigin(0.5).setDepth(10).setInteractive();

    restartButton.on('pointerover', () => restartButton.setStyle({ backgroundColor: '#cc6600' }));
    restartButton.on('pointerout', () => restartButton.setStyle({ backgroundColor: '#ff8800' }));

    restartButton.on('pointerdown', () => {
      gameOverText.destroy();
      restartButton.destroy();
      this.inputContainer.setVisible(true);
      this.resetGameState();
      this.scoreText.setText(`Score: ${this.score}`);
      this.livesText.setText(`Vidas: ${this.lives}`);
      this.questionText.setText('¡Presiona "Girar" para empezar!');
    });
  }

  private showLoadingScreen() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingBG = this.add.rectangle(width / 2, height / 2, width, height, 0x222222, 0.8);
    const loadingText = this.add.text(width / 2, height / 2, 'Cargando...', {
      fontSize: '48px',
      fontFamily: 'Comic Sans MS, cursive',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.loadingContainer = this.add.container(0, 0, [loadingBG, loadingText]).setDepth(1000);
  }

  private hideLoadingScreen() {
    this.loadingContainer.destroy();
  }

  shutdown() {
    ScoreManager.removeListener(this.scoreListener);
  }
}
