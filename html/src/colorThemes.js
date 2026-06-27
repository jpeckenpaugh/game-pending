// Shared color palettes for optional world and opponent theming.
// Classic preserves the original black-and-white line-art presentation.
import { customization } from "./state.js";

export const colorThemeTypes = ["classic", "natural", "sunset", "arcade", "pastel", "forest"];

export const colorThemes = {
  classic: {
    id: "classic",
    ink: "#000",
    colored: false,
    enemies: ["#fff"],
    gear: {},
    weapon: {},
    attack: {},
    drone: {},
  },
  natural: {
    id: "natural",
    ink: "#141414",
    colored: true,
    sky: { top: "#82c9ff", bottom: "#fbfdff" },
    ground: { grass: "#4f9a45", detail: "#6c4a32" },
    underground: { fill: "#6d4b35", accent: "rgba(88, 56, 35, 0.22)" },
    platform: {
      wood: "#9b6a3a",
      woodDetail: "#684725",
      cement: "#9fa6a9",
      cementDetail: "#737b80",
    },
    ladder: { rail: "#8b5a2b", rung: "#b8783d" },
    gear: {
      boots: "#5d3a24",
      thrust: "#f4a261",
      shield: "#55a9c9",
      vest: "#6fb36e",
      specs: "#2d8bb8",
      radar: "#f2bc5e",
    },
    weapon: { gun: "#5f6670", club: "#8a5a2f", wand: "#6d4ca5", accent: "#f2bc5e" },
    attack: { bullet: "#2d3033", magic: "#7e57c2", missile: "#e85d75" },
    drone: { body: "#c9d0d2", accent: "#6f8790", rotor: "#3e4b50", beam: "#55a9c9" },
    enemies: ["#e85d75", "#f2bc5e", "#6dbf7a", "#629bd3", "#b578d6", "#f08a5d"],
  },
  sunset: {
    id: "sunset",
    ink: "#1b1411",
    colored: true,
    sky: { top: "#f4a261", bottom: "#fff2d7" },
    ground: { grass: "#8aa64b", detail: "#67402c" },
    underground: { fill: "#5e3d31", accent: "rgba(54, 31, 24, 0.24)" },
    platform: {
      wood: "#a46b42",
      woodDetail: "#663d28",
      cement: "#a49b91",
      cementDetail: "#756d65",
    },
    ladder: { rail: "#865333", rung: "#be7d4e" },
    gear: {
      boots: "#6e4432",
      thrust: "#ffb347",
      shield: "#e76f51",
      vest: "#b7794d",
      specs: "#6f7dbb",
      radar: "#e9c46a",
    },
    weapon: { gun: "#73564a", club: "#9b5f35", wand: "#7a5182", accent: "#ffca6a" },
    attack: { bullet: "#3a2a25", magic: "#c06c84", missile: "#d95d39" },
    drone: { body: "#d8a06d", accent: "#8e5a3a", rotor: "#4d342a", beam: "#e9c46a" },
    enemies: ["#d95d39", "#f4a261", "#e9c46a", "#7aa17a", "#6f7dbb", "#b76e98"],
  },
  arcade: {
    id: "arcade",
    ink: "#070707",
    colored: true,
    sky: { top: "#8fd8ff", bottom: "#faffff" },
    ground: { grass: "#00b894", detail: "#3b2c79" },
    underground: { fill: "#30275e", accent: "rgba(0, 184, 148, 0.16)" },
    platform: {
      wood: "#ffb000",
      woodDetail: "#8f5f00",
      cement: "#8fb8ff",
      cementDetail: "#4f73b7",
    },
    ladder: { rail: "#ff8a00", rung: "#ffd166" },
    gear: {
      boots: "#ff8a00",
      thrust: "#7cff6b",
      shield: "#00c2ff",
      vest: "#5747a6",
      specs: "#c77dff",
      radar: "#ffd166",
    },
    weapon: { gun: "#00c2ff", club: "#ff8a00", wand: "#c77dff", accent: "#7cff6b" },
    attack: { bullet: "#070707", magic: "#c77dff", missile: "#ff4d6d" },
    drone: { body: "#8fb8ff", accent: "#00c2ff", rotor: "#070707", beam: "#7cff6b" },
    enemies: ["#ff4d6d", "#00c2ff", "#7cff6b", "#ffd166", "#c77dff", "#ff8a00"],
  },
  pastel: {
    id: "pastel",
    ink: "#1f1f1f",
    colored: true,
    sky: { top: "#b8ddff", bottom: "#fffdf9" },
    ground: { grass: "#8fcf91", detail: "#806551" },
    underground: { fill: "#8f725d", accent: "rgba(119, 94, 76, 0.18)" },
    platform: {
      wood: "#c59a72",
      woodDetail: "#8a6a51",
      cement: "#b7c2c8",
      cementDetail: "#828f97",
    },
    ladder: { rail: "#a67b5b", rung: "#d0a57f" },
    gear: {
      boots: "#b88968",
      thrust: "#ffd28a",
      shield: "#94c7ee",
      vest: "#9bd9a0",
      specs: "#8db3d4",
      radar: "#ffd28a",
    },
    weapon: { gun: "#8f9ba3", club: "#b88968", wand: "#b89adf", accent: "#ffd28a" },
    attack: { bullet: "#4a4a4a", magic: "#b89adf", missile: "#ff9aae" },
    drone: { body: "#d8e4ea", accent: "#94c7ee", rotor: "#7d8b92", beam: "#ffd28a" },
    enemies: ["#ff9aae", "#ffd28a", "#9bd9a0", "#94c7ee", "#c7a4e8", "#ffa68f"],
  },
  forest: {
    id: "forest",
    ink: "#1a1a0a",
    colored: true,
    sky: { top: "#1a3a1a", bottom: "#2d5016" },
    ground: { grass: "#3d2b1f", detail: "#5c4033" },
    underground: { fill: "#2a1a10", accent: "rgba(61, 43, 31, 0.22)" },
    platform: {
      wood: "#2d5016",
      woodDetail: "#4a7c28",
      cement: "#5c3d2e",
      cementDetail: "#8b6914",
    },
    ladder: { rail: "#228b22", rung: "#228b22" },
    gear: {
      boots: "#3d2b1f",
      thrust: "#6b8e23",
      shield: "#55a9c9",
      vest: "#4a7c28",
      specs: "#2d8bb8",
      radar: "#9acd32",
    },
    weapon: { gun: "#5c3d2e", club: "#3d2b1f", wand: "#6b8e23", accent: "#9acd32" },
    attack: { bullet: "#3d2b1f", magic: "#6b8e23", missile: "#ff4d6d" },
    drone: { body: "#4a7c28", accent: "#6b8e23", rotor: "#3d2b1f", beam: "#9acd32" },
    enemies: ["#6b8e23", "#8b6914", "#5c4033", "#9acd32", "#3d2b1f", "#2d5016"],
  },
};

export function activeColorTheme() {
  return colorThemes[customization.colorTheme] || colorThemes.classic;
}

export function colorThemeLabel(colorTheme) {
  if (colorTheme === "natural") return "Natural";
  if (colorTheme === "sunset") return "Sunset";
  if (colorTheme === "arcade") return "Arcade";
  if (colorTheme === "pastel") return "Pastel";
  if (colorTheme === "forest") return "Forest";
  return "Classic";
}

export function enemyThemeColor(theme, colorIndex = 0) {
  if (!theme.colored || !theme.enemies.length) return "";
  const index = Math.abs(Math.floor(colorIndex)) % theme.enemies.length;
  return theme.enemies[index];
}

export function themedColor(theme, group, key) {
  if (!theme.colored) return "";
  return theme[group]?.[key] || "";
}
