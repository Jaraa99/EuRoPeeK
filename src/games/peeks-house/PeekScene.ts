import Phaser from "phaser";
import { ScoreManager } from './ScoreManager';

export class PeekScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private scoreBox!: Phaser.GameObjects.Graphics;
  private resultText!: Phaser.GameObjects.Text;
  private loadingText!: Phaser.GameObjects.Text;

  private lives = 3;
  private score = 0;

  private preguntaText!: Phaser.GameObjects.Text;
  private dropZone!: Phaser.GameObjects.Zone;
  private dropZoneText!: Phaser.GameObjects.Text;
  private preguntaActual!: { pregunta: string, respuesta: string };
  private respuestas!: string[];
  private opcionesArrastrables: Phaser.GameObjects.Text[] = [];

  private sonidos: { correcto?: Phaser.Sound.BaseSound, incorrecto?: Phaser.Sound.BaseSound } = {};
  private bgMusic!: Phaser.Sound.BaseSound;

  constructor() {
    super("PeekScene");
  }

  preload() {
    this.load.image("house-bg", "src/assets/hpuse.jpg");
    this.load.audio("correcto", "src/assets/correct.mp3");
    this.load.audio("incorrecto", "src/assets/wrong.mp3");
    this.load.audio("musica", "src/assets/music.mp3");
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#000');
    this.loadingText = this.add.text(width / 2, height / 2 - 50, "Loading Peek's House...", {
      fontSize: "32px",
      color: "#ffcc00",
      fontStyle: "bold",
      fontFamily: "Comic Sans MS",
      backgroundColor: "#003366",
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    const bubbles: Phaser.GameObjects.Text[] = [];
    const bubbleChars = ['🔵', '🟣', '🟠', '🟢', '🔴'];
    for (let i = 0; i < 5; i++) {
      const bubble = this.add.text(width / 2 - 100 + i * 50, height / 2 + 30, bubbleChars[i], {
        fontSize: '32px'
      }).setOrigin(0.5);
      this.tweens.add({
        targets: bubble,
        y: bubble.y - 20,
        yoyo: true,
        repeat: -1,
        duration: 500 + i * 100,
        ease: 'Sine.easeInOut'
      });
      bubbles.push(bubble);
    }

    this.time.delayedCall(1500, () => {
      this.loadingText.destroy();
      bubbles.forEach(b => b.destroy());

      this.add.image(width / 2, height / 2, "house-bg")
        .setDisplaySize(width, height)
        .setAlpha(0.4);

      this.bgMusic = this.sound.add("musica", { loop: true, volume: 0.4 });
      this.bgMusic.play();

      this.resetGameState();
      ScoreManager.incrementGamesPlayed(); // Juego iniciado - incrementar contador

      this.mostrarReglas();  // <-- Aquí mostramos las reglas antes de iniciar el juego
    });
  }

  mostrarReglas() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo semitransparente para las reglas
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    const reglasTexto = 
      "🏠 Peek's House - Reglas del Juego\n\n" +
      "1️⃣ Arrastra la respuesta correcta a la zona de caída.\n" +
      "2️⃣ Por cada respuesta correcta, ganas 10 puntos.\n" +
      "3️⃣ Por cada error, pierdes 5 puntos y una vida.\n" +
      "4️⃣ Tienes 3 vidas, el juego termina cuando las pierdes todas.\n\n" +
      "¡Diviértete y aprende inglés!";

    const reglas = this.add.text(width / 2, height / 2 - 60, reglasTexto, {
      fontSize: "24px",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    const btnEmpezar = this.add.text(width / 2, height / 2 + 140, "▶ Empezar", {
      fontSize: "32px",
      backgroundColor: "#00b894",
      color: "#ffffff",
      padding: { x: 30, y: 10 },
      fontStyle: "bold",
      align: "center",
     
    }).setOrigin(0.5).setInteractive();

    btnEmpezar.on('pointerover', () => btnEmpezar.setStyle({ backgroundColor: "#019875" }));
    btnEmpezar.on('pointerout', () => btnEmpezar.setStyle({ backgroundColor: "#00b894" }));
    
    btnEmpezar.once('pointerdown', () => {
      overlay.destroy();
      reglas.destroy();
      btnEmpezar.destroy();

      this.iniciarJuego();
    });
  }

  resetGameState() {
    this.score = 0;
    this.lives = 3;
    ScoreManager.setScore('PeekScene', 0);
  }

  iniciarJuego() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.text(width / 2, 20, "🏠 Peek's House Quiz!", {
      fontSize: "32px",
      color: "#ffff00"
    }).setOrigin(0.5);

    this.preguntaText = this.add.text(width / 2, 80, "", {
      fontSize: "26px",
      color: "#ffffff",
      backgroundColor: "#007acc",
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    this.dropZone = this.add.zone(width / 2, 150, 200, 60)
      .setRectangleDropZone(200, 60)
      .setData("respuestaCorrecta", "");

    this.add.graphics()
      .lineStyle(2, 0xffffff)
      .strokeRect(this.dropZone.x - 100, this.dropZone.y - 30, 200, 60);

    this.dropZoneText = this.add.text(this.dropZone.x, this.dropZone.y, "Drop here!", {
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);

    this.scoreBox = this.add.graphics();
    this.scoreBox.fillStyle(0x000000, 0.7);
    this.scoreBox.fillRoundedRect(width - 220, 10, 210, 60, 10);
    this.scoreBox.lineStyle(2, 0xffff00);
    this.scoreBox.strokeRoundedRect(width - 220, 10, 210, 60, 10);

    this.scoreText = this.add.text(width - 115, 20, `Score: ${this.score}`, {
      fontSize: "24px",
      color: "#ffff00",
      fontStyle: "bold"
    }).setOrigin(0.5, 0);

    this.livesText = this.add.text(width - 115, 45, `Lives: ${this.lives}`, {
      fontSize: "24px",
      color: "#ff4444",
      fontStyle: "bold"
    }).setOrigin(0.5, 0);

    this.resultText = this.add.text(width / 2, 210, "", {
      fontSize: "28px",
      color: "#00ff00"
    }).setOrigin(0.5);

    this.sonidos.correcto = this.sound.add("correcto");
    this.sonidos.incorrecto = this.sound.add("incorrecto");

    this.respuestas = [
      "🛏 bedroom", "🍳 kitchen", "🚿 bathroom", "📺 livingroom",
      "🍽 diningroom", "🧺 laundry", "🚗 garage", "🌇 balcony", "🌼 garden", "📦 attic"
    ];

    this.mostrarPregunta();

    const backButton = this.add.text(width / 2, height - 20, '⬅ Volver al menú', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive();

    backButton.on('pointerover', () => backButton.setStyle({ backgroundColor: '#222222' }));
    backButton.on('pointerout', () => backButton.setStyle({ backgroundColor: '#444444' }));
    backButton.on('pointerdown', () => {
      this.bgMusic.stop();
      this.scene.start('MenuScene');
    });

    this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Text) => {
      gameObject.setScale(1.2);
    });

    this.input.on('drag', (_pointer: any, gameObject: Phaser.GameObjects.Text, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (_pointer: any, gameObject: Phaser.GameObjects.Text, dropped: boolean) => {
      gameObject.setScale(1);
      if (!dropped) {
        this.tweens.add({
          targets: gameObject,
          x: gameObject.getData('startX'),
          y: gameObject.getData('startY'),
          ease: 'Back.easeOut',
          duration: 500
        });
      }
    });

    this.input.on('drop', (_pointer: any, gameObject: Phaser.GameObjects.Text, dropZone: Phaser.GameObjects.Zone) => {
      const respuesta = gameObject.text.split(" ")[1];
      const correcta = dropZone.getData("respuestaCorrecta");

      if (respuesta === correcta) {
        gameObject.setScale(0.8);
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;

        this.dropZoneText.setText("✅ Correct!");
        this.dropZoneText.setColor("#00ff00");
        this.dropZoneText.setStyle({ fontSize: '32px', fontWeight: 'bold' });

        this.tweens.add({
          targets: this.dropZoneText,
          scale: 1.3,
          yoyo: true,
          repeat: 3,
          duration: 300,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            this.dropZoneText.setScale(1);
            this.dropZoneText.setStyle({ fontSize: '24px', fontWeight: 'normal' });
            this.dropZoneText.setText("Drop here!");
            this.dropZoneText.setColor("#ffffff");
          }
        });

        this.sonidos.correcto?.play();

        ScoreManager.incrementCorrectAnswers(); // Respuesta correcta sumada
        this.updateScore(true);

        this.time.delayedCall(1200, () => {
          gameObject.destroy();
          this.mostrarPregunta();
        });

      } else {
        // Cuando es incorrecto, pasa a la siguiente pregunta inmediatamente
        this.dropZoneText.setText("❌ Try again!");
        this.dropZoneText.setColor("#ff0000");
        this.dropZoneText.setStyle({ fontSize: '32px', fontWeight: 'bold' });

        this.tweens.add({
          targets: this.dropZoneText,
          scale: 1.3,
          yoyo: true,
          repeat: 3,
          duration: 300,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            this.dropZoneText.setScale(1);
            this.dropZoneText.setStyle({ fontSize: '24px', fontWeight: 'normal' });
            this.dropZoneText.setText("Drop here!");
            this.dropZoneText.setColor("#ffffff");
          }
        });

        this.sonidos.incorrecto?.play();

        ScoreManager.incrementIncorrectAnswers(); // Respuesta incorrecta sumada
        this.updateScore(false);

        // Destruir todas las opciones viejas y mostrar nueva pregunta
        this.opcionesArrastrables.forEach(op => op.destroy());
        this.opcionesArrastrables = [];

        this.mostrarPregunta();
      }
    });
  }

  mostrarPregunta() {
    this.opcionesArrastrables.forEach(op => op.destroy());
    this.opcionesArrastrables = [];

    const preguntas = [
      { pregunta: "😴 Where do you sleep?", respuesta: "bedroom" },
      { pregunta: "🍳 Where do you cook?", respuesta: "kitchen" },
      { pregunta: "🪥 Where do you brush your teeth?", respuesta: "bathroom" },
      { pregunta: "📺 Where do you watch TV?", respuesta: "livingroom" },
      { pregunta: "🍽 Where do you eat dinner?", respuesta: "diningroom" },
      { pregunta: "🧺 Where do you wash clothes?", respuesta: "laundry" },
      { pregunta: "🚗 Where do you park the car?", respuesta: "garage" },
      { pregunta: "🌇 Where do you look at the view?", respuesta: "balcony" },
      { pregunta: "🌼 Where do you grow flowers?", respuesta: "garden" },
      { pregunta: "📦 Where do you store old things?", respuesta: "attic" }
    ];

    this.preguntaActual = Phaser.Utils.Array.GetRandom(preguntas);
    this.preguntaText.setText(this.preguntaActual.pregunta);
    this.dropZone.setData("respuestaCorrecta", this.preguntaActual.respuesta);
    this.dropZoneText.setText("Drop here!");

    this.crearOpcionesArrastrables();
  }

  crearOpcionesArrastrables() {
    const shuffled = Phaser.Utils.Array.Shuffle(this.respuestas);
    const opcionesPorFila = 5;
    const espaciadoX = 180;
    const espaciadoY = 100;
    const startX = this.cameras.main.centerX - ((opcionesPorFila - 1) * espaciadoX) / 2;
    const startY = this.cameras.main.centerY + 60;

    shuffled.forEach((texto, i) => {
      const fila = Math.floor(i / opcionesPorFila);
      const columna = i % opcionesPorFila;

      const button = this.add.text(
        startX + columna * espaciadoX,
        startY + fila * espaciadoY,
        texto,
        {
          fontSize: "22px",
          backgroundColor: "#004466",
          color: "#ffffff",
          padding: { x: 10, y: 5 }
        }
      ).setOrigin(0.5).setInteractive();

      this.input.setDraggable(button);

      button.setData('startX', button.x);
      button.setData('startY', button.y);

      button.on("pointerover", () => button.setStyle({ backgroundColor: "#006699" }));
      button.on("pointerout", () => button.setStyle({ backgroundColor: "#004466" }));

      this.opcionesArrastrables.push(button);
    });
  }

  updateScore(correct: boolean): void {
    if (correct) {
      this.score += 10;
    } else {
      this.lives--;
      ScoreManager.incrementLivesLost(); // Sumar vida perdida
      this.score -= 5;
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
    }

    if (this.score < 0) this.score = 0;

    this.scoreText.setText(`Score: ${this.score}`);
    this.livesText.setText(`Lives: ${this.lives}`);

    ScoreManager.setScore('PeekScene', this.score);
  }

  gameOver() {
    this.bgMusic.stop();

    this.opcionesArrastrables.forEach(op => op.destroy());
    this.opcionesArrastrables = [];
    this.preguntaText.setText("");
    this.dropZoneText.setText("");
    this.dropZone.disableInteractive();

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.resultText.setText(`Game Over\nYour final score: ${this.score}`)
      .setColor("#ff0000")
      .setFontSize(48)
      .setOrigin(0.5);

    const restartButton = this.add.text(centerX, centerY + 120, '🔄 Restart', {
      fontSize: '32px',
      backgroundColor: '#ff8800',
      color: '#fff',
      padding: { x: 20, y: 10 },
      fontStyle: "bold"
    }).setOrigin(0.5).setInteractive();

    restartButton.on('pointerover', () => restartButton.setStyle({ backgroundColor: '#cc6600' }));
    restartButton.on('pointerout', () => restartButton.setStyle({ backgroundColor: '#ff8800' }));
    restartButton.on('pointerdown', () => {
      this.scene.restart();
    });
  }
}
