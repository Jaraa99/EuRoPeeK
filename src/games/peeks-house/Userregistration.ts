import Phaser from "phaser";
import axios from "axios";

export class Userregistration extends Phaser.Scene {
    private uiElements: Phaser.GameObjects.DOMElement[] = [];
    private codeText?: Phaser.GameObjects.Text;
    private passwordVisible: boolean = false;
    private passwordInput?: HTMLInputElement;

    constructor() {
        super('Userregistration');
    }

    preload() {
        // Ya no cargamos imagen de fondo
        // this.load.image('background', '/assets/buu.jpeg');
    }

    create() {
        // Establecer fondo blanco
        this.cameras.main.setBackgroundColor('#ffffff');

        this.add.text(this.cameras.main.centerX, 50, 'User Registration', {
            font: '32px Arial',
            color: '#000000' // texto negro para que contraste con fondo blanco
        }).setOrigin(0.5);

        const usernameInput = this.createInput(this.cameras.main.centerX, 120, 'User name');
        const emailInput = this.createInput(this.cameras.main.centerX, 190, 'Email');

        // Campo de contraseña
        const passwordContainer = this.add.dom(this.cameras.main.centerX, 260).createFromHTML(`
            <div style="display:flex;justify-content:center;align-items:center;">
                <input id="passwordField" type="password" placeholder="Password" 
                    style="font-size:18px;padding:8px;width:220px;border:2px solid black;border-radius:8px;outline:none;" />
                <button id="toggleBtn" 
                    style="margin-left:8px;font-size:16px;padding:6px;border:none;border-radius:8px;background-color:#a8dadc;color:#1d3557;cursor:pointer;">
                    👁️
                </button>
            </div>
        `);

        const passwordField = passwordContainer.getChildByID('passwordField') as HTMLInputElement;
        const toggleBtn = passwordContainer.getChildByID('toggleBtn') as HTMLButtonElement;
        this.passwordInput = passwordField;

        toggleBtn.addEventListener('click', () => {
            this.passwordVisible = !this.passwordVisible;
            passwordField.type = this.passwordVisible ? 'text' : 'password';
            toggleBtn.textContent = this.passwordVisible ? '🙈' : '👁️';
        });

        const roleSelect = this.add.dom(this.cameras.main.centerX, 330, 'select', {
            width: '280px',
            fontSize: '18px',
            padding: '8px',
            borderRadius: '8px'
        });

        const selectElement = roleSelect.node as HTMLSelectElement;
        selectElement.innerHTML = `
            <option value="">Selecciona tu rol</option>
            <option value="estudiante">Estudiante</option>
            <option value="profesor">Profesor</option>
        `;

        const registerButton = this.add.dom(this.cameras.main.centerX, 400, 'button', {
            width: '220px',
            height: '40px',
            fontSize: '18px',
            backgroundColor: '#1d3557',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
        }, 'Registrar');

        registerButton.addListener('click');
        registerButton.on('click', async () => {
            // Hacemos la función asíncrona aquí
            await this.handleRegister(usernameInput, emailInput, passwordField, roleSelect);
        });

        const backButton = this.add.dom(this.cameras.main.centerX, 460, 'button', {
            width: '220px',
            height: '40px',
            fontSize: '18px',
            backgroundColor: '#e63946',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
        }, 'Regresar');

        backButton.addListener('click');
        backButton.on('click', () => {
            this.showLoadingAndChangeScene('WindowRegister');
        });

        this.codeText = this.add.text(this.cameras.main.centerX, 520, '', {
            font: '20px Arial',
            color: '#000000',
            backgroundColor: '#a8dadc',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5);

        this.uiElements.push(usernameInput, emailInput, passwordContainer, roleSelect, registerButton, backButton);
    }

    async handleRegister(
        usernameInput: Phaser.GameObjects.DOMElement,
        emailInput: Phaser.GameObjects.DOMElement,
        passwordField: HTMLInputElement,
        roleSelect: Phaser.GameObjects.DOMElement
    ) {
        const username = (usernameInput.node as HTMLInputElement).value.trim();
        const email = (emailInput.node as HTMLInputElement).value.trim();
        const password = passwordField.value.trim();
        const role = (roleSelect.node as HTMLSelectElement).value;

        if (!username || !email || !password || !role) {
            alert('Por favor, completa todos los campos y selecciona un rol.');
            return;
        }

        // Validar correo con condiciones específicas:
        // - Solo letras y números antes del @
        // - Dominio debe ser gmail.com, hotmail.com o outlook.com
        const emailPattern = /^([a-zA-Z0-9]+)@(gmail\.com|hotmail\.com|outlook\.com)$/;
        if (!emailPattern.test(email)) {
            alert('Por favor, ingresa un correo válido con dominio @gmail.com, @hotmail.com o @outlook.com, y sin caracteres especiales antes del arroba.');
            return;
        }

        let studentCode = '';
        let teacherCode = '';
        let finalRole = role;

        if (role === 'estudiante') {
            studentCode = 'EST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            localStorage.setItem('studentCode', studentCode);
            this.codeText?.setText('Código de estudiante: ' + studentCode);
        } else if (role === 'profesor') {
            teacherCode = 'DOC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            localStorage.removeItem('studentCode');
            localStorage.setItem('teacherName', username);
            localStorage.setItem('teacherCode', teacherCode);
            this.codeText?.setText('Código de profesor: ' + teacherCode);
            finalRole = 'admin';
        }

        localStorage.setItem('username', username);
        localStorage.setItem('email', email);
        localStorage.setItem('role', finalRole);

        try {
            await axios.post('http://localhost:3000/user', {
                username,
                email,
                password,
                role,
            });

            alert(finalRole === 'estudiante'
                ? `¡Registro exitoso!\nTu código de estudiante es: ${studentCode}`
                : `¡Registro exitoso como administrador!\nTu código es: ${teacherCode}`);

            if (finalRole === 'admin') {
                this.showLoadingAndChangeScene('TeacherDashboardScene');
            } else {
                this.showLoadingAndChangeScene('MenuScene');
            }
        } catch (err: any) {
            alert('Error al registrar: ' + (err.response?.data?.message || 'Error desconocido'));
        }
    }

    createInput(x: number, y: number, placeholder: string) {
        const input = this.add.dom(x, y, 'input', {
            type: 'text',
            fontSize: '18px',
            padding: '8px',
            width: '280px',
            border: '2px solid black',
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: '#ffffff'
        });

        const inputElement = input.node as HTMLInputElement;
        inputElement.placeholder = placeholder;

        return input;
    }

    showLoadingAndChangeScene(targetScene: string) {
        this.uiElements.forEach(element => element.destroy());
        this.codeText?.destroy();

        const loadingBackground = this.add.rectangle(0, 0, this.cameras.main.width!, this.cameras.main.height!, 0x000000);
        loadingBackground.setOrigin(0, 0);

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Cargando...', {
            font: '32px Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            this.scene.start(targetScene);
        });
    }
}
