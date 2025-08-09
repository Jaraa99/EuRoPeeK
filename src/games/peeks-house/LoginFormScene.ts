import Phaser from "phaser";


export class LoginFormScene extends Phaser.Scene {
  private nameInput: Phaser.GameObjects.DOMElement | null = null;
  private passwordInput: Phaser.GameObjects.DOMElement | null = null;

  constructor() {
    super("LoginFormScene");
  }

  preload() {
    this.load.image("logi", "src/assents/logi.png");
  }

  create() {
    // Fondo
    const background = this.add.image(0, 0, "logi");
    background.setOrigin(0, 0);
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Título
    this.add.text(50, 30, "Login", {
      fontSize: "32px",
      color: "#ffffff"
    });

    // Campo nombre
    this.add.text(100, 150, "Name:", { fontSize: "30px", color: "#06283fff" });
    this.nameInput = this.add.dom(this.cameras.main.width / 2, 200).createFromHTML(
      `<input type="text" id="name" placeholder="Ingresa tu nombre" style="width: 200px; height: 30px; font-size: 18px;"/>`
    );

    // Campo contraseña
    this.add.text(100, 250, "Password:", { fontSize: "30px", color: "#052e49" });
    this.passwordInput = this.add.dom(this.cameras.main.width / 2, 300).createFromHTML(
      `<input type="password" id="password" placeholder="Ingresa tu contraseña" style="width: 200px; height: 30px; font-size: 18px;"/>`
    );

    // Botón ingresar
    const loginButton = this.add.text(this.cameras.main.width / 2, 400, "Get into", {
      fontSize: "32px",
      color: "#ffffff",
      backgroundColor: "#1E90FF",
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();

    loginButton.on("pointerover", () => {
      loginButton.setStyle({ fill: "#FFD700" });
    });

    loginButton.on("pointerout", () => {
      loginButton.setStyle({ fill: "#ffffff" });
    });

    loginButton.on("pointerdown", () => {
      const name = (document.getElementById("name") as HTMLInputElement).value;
      const password = (document.getElementById("password") as HTMLInputElement).value;

      if (name && password) {
        console.log(`Nombre: ${name}, Contraseña: ${password}`);
        this.scene.start("MenuGames"); // Ir a menú de juegos
      } else {
        console.log("Por favor, ingresa un nombre y una contraseña.");
      }
    });

    // Botón regresar (sin 'Cargando...', va directo)
    const backButton = this.add.text(this.cameras.main.width / 2, 470, "Regresar", {
      fontSize: "28px",
      color: "#ffffff",
      backgroundColor: "#D72638",
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();

    backButton.on("pointerover", () => {
      backButton.setStyle({ fill: "#FFD700" });
    });

    backButton.on("pointerout", () => {
      backButton.setStyle({ fill: "#ffffff" });
    });

    backButton.on("pointerdown", () => {
      this.scene.start("Logins"); // Regresar directamente
    });
  }
}
