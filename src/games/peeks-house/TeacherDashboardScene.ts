import Phaser from "phaser";

export class TeacherDashboardScene extends Phaser.Scene {
  private scoreElements: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("TeacherDashboardScene");
  }

  preload() {
    // Cargar imagen de fondo (verifica que exista)
    this.load.image("teacherBg", "/assets/logi.png");
  }

  create() {
    const teacherName = localStorage.getItem("teacherName") || "Profesor";

    // Fondo
    const bg = this.add.image(0, 0, "teacherBg").setOrigin(0);
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Sombra para contraste
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.4).setOrigin(0);

    // Título
    this.add.text(this.cameras.main.centerX, 30, `Panel de ${teacherName}`, {
      fontSize: "36px",
      color: "#00FFFF",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Subtítulo
    this.add.text(this.cameras.main.centerX, 80, "Puntajes de estudiantes", {
      fontSize: "28px",
      color: "#ffffff"
    }).setOrigin(0.5);

    // Mostrar los puntajes
    this.displayScores();

    // Botón para cerrar sesión
    const backButton = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 50, "Cerrar sesión", {
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#D72638",
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backButton.on("pointerover", () => backButton.setStyle({ fill: "#FFD700" }));
    backButton.on("pointerout", () => backButton.setStyle({ fill: "#ffffff" }));
    backButton.on("pointerdown", () => {
      localStorage.removeItem("teacherName");
      localStorage.removeItem("loginRole");
      this.scene.start("Logins");
    });

    // Actualizar puntajes cada 2 segundos
    this.time.addEvent({
      delay: 2000,
      callback: () => this.displayScores(),
      loop: true
    });
  }

  displayScores() {
    // Eliminar elementos anteriores
    this.scoreElements.forEach(obj => obj.destroy());
    this.scoreElements = [];

    const rawScores = localStorage.getItem("studentScores");
    const scores = rawScores ? JSON.parse(rawScores) : [];

    const startY = 140;
    const spacing = 70;

    scores.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    if (scores.length === 0) {
      const emptyText = this.add.text(this.cameras.main.centerX, startY, "Aún no hay puntajes registrados", {
        fontSize: "20px",
        color: "#888888"
      }).setOrigin(0.5);
      this.scoreElements.push(emptyText);
      return;
    }

    // Encabezados
    const headerY = startY - 40;
    const headers = ["Estudiante", "Puntaje", "Fecha"];
    const positions = [200, 450, 650];

    headers.forEach((header, i) => {
      const text = this.add.text(positions[i], headerY, header, {
        fontSize: "22px",
        color: "#FFFF00",
        fontStyle: "bold"
      }).setOrigin(0.5);
      this.scoreElements.push(text);
    });

    scores.forEach((student: { name: string; score: number; time?: string }, index: number) => {
      const y = startY + index * spacing;

      // Rectángulo de fondo
      const box = this.add.rectangle(this.cameras.main.centerX, y, 720, 55, 0x003344, 0.6)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0x00ffff); // Borde

      // Nombre
      const nameText = this.add.text(200, y, student.name, {
        fontSize: "20px",
        color: "#FFFFFF"
      }).setOrigin(0.5);

      // Puntaje
      const scoreText = this.add.text(450, y, `${student.score} pts`, {
        fontSize: "20px",
        color: "#00FF00"
      }).setOrigin(0.5);

      // Fecha
      const dateText = this.add.text(650, y, student.time || "Sin fecha", {
        fontSize: "20px",
        color: "#AAAAAA"
      }).setOrigin(0.5);

      // Animación de aparición
      this.tweens.add({
        targets: [box, nameText, scoreText, dateText],
        alpha: { from: 0, to: 1 },
        duration: 400,
        ease: "Power2"
      });

      // Guardar para limpiar luego
      this.scoreElements.push(box, nameText, scoreText, dateText);
    });
  }
}
