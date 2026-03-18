export const colorPresets = [
  '#1a1a2e','#16213e','#0f3460','#e94560','#533483','#2c2c54',
  '#000000','#ffffff','#ff6b6b','#feca57','#48dbfb','#1dd1a1',
  '#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#f368e0','#ee5a24',
  '#0abde3','#10ac84','#222f3e','#c8d6e5','#341f97','#ff6348',
];

export const gradientPresets = [
  ['#667eea','#764ba2'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],
  ['#43e97b','#38f9d7'],['#fa709a','#fee140'],['#a18cd1','#fbc2eb'],
  ['#ffecd2','#fcb69f'],['#ff9a9e','#fecfef'],['#667eea','#f093fb'],
  ['#0c3483','#a2b6df'],['#11998e','#38ef7d'],['#fc5c7d','#6a82fb'],
  ['#e74c3c','#000000'],['#1a1a2e','#e94560'],['#0f0c29','#302b63'],
];

export const fontList = [
  'Inter','Poppins','Montserrat','Oswald','Roboto',
  'Bebas Neue','Bangers','Permanent Marker','Anton','Russo One'
];

export const sizePresets = [
  { label: 'YouTube (1280x720)', w: 1280, h: 720 },
  { label: 'HD (1920x1080)', w: 1920, h: 1080 },
  { label: 'Facebook (1200x630)', w: 1200, h: 630 },
  { label: 'Instagram (1080x1080)', w: 1080, h: 1080 },
  { label: 'Pinterest (1000x1500)', w: 1000, h: 1500 },
  { label: 'Twitter Banner (2560x1440)', w: 2560, h: 1440 },
  { label: 'FB Cover (820x312)', w: 820, h: 312 },
];

export const shapeTypes = ['rect','circle','triangle','star','arrow'];

export const patternTypes = ['dots','lines','grid','diagonal','zigzag','circles'];

export const defaultState = {
  width: 1280,
  height: 720,
  zoom: 1,
  bg: { type: 'solid', color: '#1a1a2e' },
  gradient: { color1: '#667eea', color2: '#764ba2', angle: 135, type: 'linear' },
  bgImage: { img: null, fit: 'cover', blur: 0, brightness: 100, overlayColor: '#000000', overlayOpacity: 0 },
  pattern: { type: 'dots', bg: '#1a1a2e', fg: '#ffffff', scale: 20, opacity: 30 },
  layers: [],
  selectedLayer: null,
  effects: { vignette: 0, noise: 0, borderWidth: 0, borderColor: '#ffffff', borderRadius: 0 },
};
