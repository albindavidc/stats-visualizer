export type DitherAlgorithm = 'floyd-steinberg' | 'atkinson' | 'bayer4' | 'threshold';

export interface PortraitSettings {
  imageSrc: string | null;
  images: string[]; // List of images for multi-image support & animation
  activeImageIndex: number;
  imageLoop: boolean; // Continuous loop cycling through multiple images
  imageLoopDuration: number; // Seconds per frame in loop (e.g. 3s)
  outputWidth: number; // 150 to 400
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  threshold: number; // 0 to 255
  blur: number; // 0 to 10
  invert: boolean;
  algorithm: DitherAlgorithm;
  zoom: number; // 1.0 to 3.0
  panX: number; // -100 to 100
  panY: number; // -100 to 100
  layers: number; // 10 to 60
  maxRevealTime: number; // in seconds, e.g. 2.0
  particleLoop: boolean;
  fillColor: string; // default #A78BFA
}

export type ThemePreset = 'cyber-cyan' | 'matrix-green' | 'sunset' | 'mono' | 'custom';

export interface ThemeColors {
  bg: string;
  cardBg: string;
  accent: string;
  secondaryAccent: string;
  text: string;
  leaderColor: string;
  valueColor: string;
  borderColor1: string;
  borderColor2: string;
  borderColor3: string;
}

export interface InfoRow {
  id: string;
  type: 'row' | 'divider';
  label: string;
  value: string;
}

export interface BannerShellSettings {
  title: string;
  headerText: string;
  showLiveBadge: boolean;
  email: string;
  username: string;
  footerCommand: string;
  theme: ThemePreset;
  colors: ThemeColors;
  animatePortrait: boolean;
  animateRows: boolean;
  animateBorder: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  repo: string;
  logo: string;
  description: string;
  tags: string[];
}
