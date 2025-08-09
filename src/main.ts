import Phaser from "phaser";

// Escenas del juego Peek's House
import { PeekScene } from "./games/peeks-house/PeekScene"; 
import { JobsScene } from "./games/peeks-house/JobsScene";
import { AimScene } from "./games/peeks-house/AimScene";
import { HomeChargerScene } from "./games/peeks-house/HomeChargerScene";
import { WindowRegister } from "./games/peeks-house/WindowRegister";
import { Userregistration } from "./games/peeks-house/Userregistration";
import { Logins } from "./games/peeks-house/Logins";
import { ProfileScene } from "./games/peeks-house/ProfileScene"; 
import { ScoreManager } from "./games/peeks-house/ScoreManager";
import { AvatarSelecctionScene } from "./games/peeks-house/AvatarSelectionScene"; 
import { TeacherDashboardScene } from "./games/peeks-house/TeacherDashboardScene";

// Menú principal y menú de selección de juegos
import { MenuScene } from "./games/peeks-house/MenuScene";
import { MenuGame } from "./games/peeks-house/MenuGame"; 
import { LoginFormScene } from "./games/peeks-house/LoginFormScene";

// Configuración del juego con escalado dinámico y centrado
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app", // ID del div en index.html
  backgroundColor: "#1a1a1a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,  // Resolución base
    height: 720,
  },
  dom: {
    createContainer: true,
  },
  scene: [
    HomeChargerScene,
    WindowRegister,
    Logins,
    Userregistration,
    MenuScene,
    MenuGame,
    LoginFormScene,
    PeekScene,
    JobsScene,
    AimScene,
    ProfileScene,
    ScoreManager,
    AvatarSelecctionScene,
    TeacherDashboardScene
  ],  // <--- coma agregada aquí
  
};

new Phaser.Game(config);
