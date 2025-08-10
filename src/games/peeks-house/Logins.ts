import Phaser from "phaser";

export class Logins extends Phaser.Scene {
  private nameInput?: HTMLInputElement;
  private passwordInput?: HTMLInputElement;
  private submitButton?: HTMLButtonElement;
  private cancelButton?: HTMLButtonElement;

  constructor() {
    super("Logins");
  }

  preload() {
    this.load.image("login", "/assets/l.png"); // imagen de tu búho si la tienes
  }

  create() {
    const { width, height } = this.cameras.main;

    const background = this.add.image(0, 0, "login").setOrigin(0, 0);
    background.setDisplaySize(width, height);

    this.add.text(width / 2, 50, "Choose your role 👤", {
      fontSize: "32px",
      fontFamily: "Arial Rounded MT Bold",
      color: "#1860e7ff",
    }).setOrigin(0.5);

    // Imagen del búho
    
    const spacing = 180;
    const topMargin = 120;

    // Botones de rol
    this.createRoundedButton(
      width / 2 - spacing / 2,
      topMargin,
      "Teacher",
      "#4CAF50",
      "teacher",
      "LoginFormScene"
    );
    this.createRoundedButton(
      width / 2 + spacing / 2,
      topMargin,
      "Student",
      "#2196F3",
      "student",
      "LoginFormScene"
    );

    // Botón regresar
    this.createBackButton(
      width / 2,
      height - 80,
      "Regresar",
      "WindowRegister",
      "#D72638"
    );
  }

  createRoundedButton(
    x: number,
    y: number,
    text: string,
    bgColor: string,
    role: string,
    targetScene: string
  ) {
    const button = this.add.rectangle(x, y, 200, 60, Phaser.Display.Color.HexStringToColor(bgColor).color)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const label = this.add.text(x, y, text, {
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [button, label],
      scale: { from: 0, to: 1 },
      ease: "Back",
      duration: 500,
    });

    button.on("pointerover", () => {
      button.setFillStyle(0xFFD700);
    });

    button.on("pointerout", () => {
      button.setFillStyle(Phaser.Display.Color.HexStringToColor(bgColor).color);
    });

    button.on("pointerdown", () => {
      localStorage.setItem("loginRole", role);
      if (role === "teacher") {
        this.showTeacherLoginForm();
      } else {
        this.scene.start(targetScene);
      }
    });
  }

  showTeacherLoginForm() {
    this.input.enabled = false;
    this.removeTeacherLoginForm();

    this.nameInput = this.createInput("text", "Nombre");
    this.passwordInput = this.createInput("password", "Contraseña");

    document.body.appendChild(this.nameInput);
    document.body.appendChild(this.passwordInput);

    this.submitButton = this.createButton("Ingresar", "46%");
    document.body.appendChild(this.submitButton);

    this.cancelButton = this.createButton("Cancelar", "54%", "#D72638");
    document.body.appendChild(this.cancelButton);

    this.submitButton.onclick = async () => {
      const name = this.nameInput?.value.trim();
      const password = this.passwordInput?.value.trim();

      if (!name || !password) {
        alert("Por favor ingresa nombre y contraseña");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, password, role: "teacher" })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error de autenticación");

        localStorage.setItem("teacherName", name);
        localStorage.setItem("token", data.token);

        this.removeTeacherLoginForm();
        this.input.enabled = true;
        this.scene.start("TeacherDashboardScene");

      } catch (error: any) {
        alert(error.message);
      }
    };

    this.cancelButton.onclick = () => {
      this.removeTeacherLoginForm();
      this.input.enabled = true;
    };
  }

  createInput(type: string, placeholder: string): HTMLInputElement {
    const input = document.createElement("input");
    input.type = type;
    input.placeholder = placeholder;
    input.style.position = "absolute";
    input.style.top = type === "text" ? "30%" : "38%";
    input.style.left = "50%";
    input.style.transform = "translateX(-50%)";
    input.style.padding = "10px";
    input.style.fontSize = "18px";
    input.style.zIndex = "1000";
    input.style.border = "2px solid #1E90FF";
    input.style.borderRadius = "10px";
    input.style.backgroundColor = "#f5f5f5";
    input.style.width = "60%";
    input.style.maxWidth = "300px";
    input.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    input.style.textAlign = "center";
    return input;
  }

  createButton(text: string, top: string, bgColor: string = "#1E90FF"): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = text;
    button.style.position = "absolute";
    button.style.top = top;
    button.style.left = "50%";
    button.style.transform = "translateX(-50%)";
    button.style.padding = "10px 25px";
    button.style.fontSize = "18px";
    button.style.cursor = "pointer";
    button.style.backgroundColor = bgColor;
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "10px";
    button.style.zIndex = "1000";
    button.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
    button.style.transition = "0.3s";

    button.onmouseover = () => button.style.transform = "translateX(-50%) scale(1.1)";
    button.onmouseout = () => button.style.transform = "translateX(-50%) scale(1)";
    return button;
  }

  removeTeacherLoginForm() {
    const remove = (el?: HTMLElement) => el && el.remove();

    remove(this.nameInput);
    remove(this.passwordInput);
    remove(this.submitButton);
    remove(this.cancelButton);

    this.nameInput = undefined;
    this.passwordInput = undefined;
    this.submitButton = undefined;
    this.cancelButton = undefined;
  }

  createBackButton(x: number, y: number, text: string, targetScene: string, bgColor: string) {
    const button = this.add.rectangle(x, y, 200, 60, Phaser.Display.Color.HexStringToColor(bgColor).color)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const label = this.add.text(x, y, text, {
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);

    button.on("pointerover", () => button.setFillStyle(0xFFD700));
    button.on("pointerout", () => button.setFillStyle(Phaser.Display.Color.HexStringToColor(bgColor).color));
    button.on("pointerdown", () => {
      this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7).setOrigin(0);
      this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Cargando...", {
        fontSize: "32px",
        color: "#ffffff"
      }).setOrigin(0.5);

      this.time.delayedCall(2000, () => {
        this.scene.start(targetScene);
      });
    });
  }
}
