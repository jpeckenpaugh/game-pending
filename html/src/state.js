// Shared mutable state for the whole Canvas game. Modules import these objects
// directly so gameplay remains dependency-free and easy to inspect in browser.
export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");

export const world = {
  width: 2800,
  height: 900,
  baseGroundY: 0,
  gravity: 1850,
  friction: 0.82,
  terrainStep: 160,
  terrain: [],
  platforms: [],
  ladders: [],
  caves: [],
  teleports: [],
  spawnX: 80,
  spawnY: 0,
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
  surfaceId: "ground",
  coyoteTimer: 0,
  jumpBuffer: 0,
  shootCooldown: 0,
  invulnerableFor: 0,
  climbing: false,
  airJumpsRemaining: 0,
  bootsPulseTimer: 0,
  faceMood: "smile",
  faceMoodTimer: 0,
  faceMoodPriority: 0,
};

export const camera = { x: 0, y: 0, zoom: 1 };
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
  extraShotsRemaining: 0,
  extraShotTimer: 0,
};

export const powerUps = {
  bootsLevel: 0,
  shieldLevel: 0,
  shieldCharges: 0,
  shieldRecharge: 0,
  shieldKineticCharges: 0,
  shieldKineticRecharge: 0,
  specs: 0,
  radar: 0,
  droneLevel: 0,
  droneCharges: 0,
  droneRecharge: 0,
  droneExtraMissiles: 0,
  droneExtraRecharge: 0,
  bootsGlideCharge: 0,
  bootsGlideCooldown: 0,
};

export const powerUpPool = ["boots", "shield", "specs", "radar", "drone"];

export const states = {
  TITLE: "title",
  CUSTOMIZE: "customize",
  PAUSED: "paused",
  PLAYING: "playing",
  LEVEL_COMPLETE: "levelComplete",
  POWER_CHOICE: "powerChoice",
  GAME_OVER: "gameOver",
  LEVEL_COLLECTING: "levelCollecting",
};

export const customization = {
  name: "Game Pending",
  tagline: "Name Pending",
  startingBootsLevel: 0,
  startingSpecs: 0,
  startingRadar: 0,
  startingShieldLevel: 0,
  startingDroneLevel: 0,
  level: 1,
  targetFps: "auto",
  template: "custom",
  colorTheme: "classic",
  droneStyle: "oval",
  head: "stick",
  bigHead: 0,
  face: "classic",
  faceStyle: "monochrome",
  circleHead: "classic",
  triangleHead: "classic",
  squareHead: "classic",
  opponentFaceStyle: "monochrome",
  weaponType: "gun",
  opponentIntelligence: "mixed",
  spawningLocations: "standard",
  worldGeneration: "seeded",
  selectedField: "name",
  customizeMenu: "main",
  returnState: states.TITLE,
  savedName: "Game Pending",
  savedTagline: "Name Pending",
  savedStartingBootsLevel: 0,
  savedStartingSpecs: 0,
  savedStartingRadar: 0,
  savedStartingShieldLevel: 0,
  savedStartingDroneLevel: 0,
  savedLevel: 1,
  savedTargetFps: "auto",
  savedTemplate: "custom",
  savedColorTheme: "classic",
  savedDroneStyle: "oval",
  savedHead: "stick",
  savedBigHead: 0,
  savedFace: "classic",
  savedFaceStyle: "monochrome",
  savedCircleHead: "classic",
  savedTriangleHead: "classic",
  savedSquareHead: "classic",
  savedOpponentFaceStyle: "monochrome",
  savedWeaponType: "gun",
  savedOpponentIntelligence: "mixed",
  savedSpawningLocations: "standard",
  savedWorldGeneration: "seeded",
};

export const game = {
  level: 1,
  enemiesRemaining: 0,
  message: "Arrows/WASD move, X jumps, Space shoots",
  messageTimer: 4,
  state: states.TITLE,
  completedLevel: 0,
  levelClearTimer: 0,
  lastPowerUp: "",
  powerChoices: [],
  powerChoiceSelection: 0,
  powerChoiceReturnState: "playing",
  lastTime: performance.now(),
  autoTargetFps: 60,
  autoFramePressure: 0,
  autoStableFor: 0,
  jumpRequested: false,
  titleSelection: 0,
  pauseSelection: 0,
  levelCompleteSelection: 0,
  gameOverSelection: 0,
  wrapTimer: 0,
  wrapFromX: 0,
  wrapFromY: 0,
  wrapToX: 0,
  wrapToY: 0,
  teleportPhase: "idle",
  teleportTimer: 0,
  teleportDuration: 0,
  teleportFromX: 0,
  teleportFromY: 0,
  teleportToX: 0,
  teleportToY: 0,
  teleportPanStartX: 0,
  teleportPanStartY: 0,
  teleportZoomInStartX: 0,
  teleportZoomInStartY: 0,
  teleportZoomInStartZoom: 1,
  teleportMoved: false,
};

const faceMoodPriorities = {
  smile: 1,
  angry: 2,
  surprised: 3,
  crying: 4,
  hurt: 5,
};

export function setPlayerFaceMood(mood, duration = 0.9, priority = faceMoodPriorities[mood] || 1) {
  if (player.faceMoodTimer > 0 && priority < player.faceMoodPriority) return;
  player.faceMood = mood;
  player.faceMoodTimer = Math.max(0, duration);
  player.faceMoodPriority = priority;
}

export function resetPlayerFaceMood() {
  player.faceMood = "smile";
  player.faceMoodTimer = 0;
  player.faceMoodPriority = 0;
}

export function updatePlayerFaceMood(dt) {
  if (player.faceMoodTimer <= 0) return;
  player.faceMoodTimer = Math.max(0, player.faceMoodTimer - dt);
  if (player.faceMoodTimer === 0) resetPlayerFaceMood();
}
