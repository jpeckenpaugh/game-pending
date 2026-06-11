export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");

export const world = {
  width: 2800,
  baseGroundY: 0,
  gravity: 1850,
  friction: 0.82,
  terrainStep: 160,
  terrain: [],
};

export const player = {
  x: 80,
  y: 0,
  previousY: 0,
  vx: 0,
  vy: 0,
  width: 26,
  height: 74,
  speed: 780,
  jumpPower: 720,
  ammo: 10,
  facing: 1,
  onGround: true,
  coyoteTimer: 0,
  jumpBuffer: 0,
  shootCooldown: 0,
  invulnerableFor: 0,
};

export const camera = { x: 0 };
export const keys = new Set();
export const touches = new Map();
export const projectiles = [];
export const enemies = [];
export const drops = [];
export const particles = [];

export const drone = {
  active: false,
  phase: "idle",
  direction: 1,
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
};

export const powerUps = {
  boots: 0,
  vestLevel: 0,
  vestCharges: 0,
  vestRecharge: 0,
  specs: 0,
  droneLevel: 0,
  droneCharges: 0,
  droneRecharge: 0,
};

export const powerUpPool = ["boots", "vest", "specs", "drone"];

export const states = {
  TITLE: "title",
  CUSTOMIZE: "customize",
  PLAYING: "playing",
  LEVEL_COMPLETE: "levelComplete",
  GAME_OVER: "gameOver",
  LEVEL_COLLECTING: "levelCollecting",
};

export const customization = {
  name: "Game Pending",
  tagline: "Name Pending",
  startingPowerUps: 0,
  selectedField: "name",
};

export const game = {
  level: 1,
  enemiesRemaining: 0,
  message: "Arrows/WASD move, Space shoots, Up/W jumps",
  messageTimer: 4,
  state: states.TITLE,
  completedLevel: 0,
  levelClearTimer: 0,
  lastPowerUp: "",
  lastTime: performance.now(),
  jumpRequested: false,
};
