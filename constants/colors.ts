const darkColors = {
  // Main colors - more vibrant for iOS
  primary: '#0A84FF',
  secondary: '#BF5AF2',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  
  // Background colors - slightly lighter for better contrast
  background: '#0D0D0D',
  backgroundSecondary: '#1C1C1E',
  cardBg: 'rgba(28, 28, 30, 0.6)',
  
  // Glass morphism colors - ultra transparent for glass effect
  glass: {
    primary: 'rgba(10, 132, 255, 0.12)',
    secondary: 'rgba(191, 90, 242, 0.12)',
    tertiary: 'rgba(255, 255, 255, 0.04)',
    background: 'rgba(28, 28, 30, 0.35)',
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Text colors - more vibrant
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textTertiary: 'rgba(255, 255, 255, 0.6)',
  
  // UI colors - more visible
  border: 'rgba(255, 255, 255, 0.15)',
  borderSecondary: 'rgba(255, 255, 255, 0.08)',
  white: '#FFFFFF',
  black: '#000000',
  
  // iOS system colors - enhanced vibrant colors
  systemBlue: '#0A84FF',
  systemPurple: '#BF5AF2',
  systemGreen: '#30D158',
  systemOrange: '#FF9F0A',
  systemRed: '#FF453A',
  systemYellow: '#FFD60A',
  systemPink: '#FF375F',
  systemTeal: '#64D2FF',
  systemIndigo: '#5E5CE6',
};

const lightColors = {
  // Main colors - more vibrant pastels that really pop
  primary: '#007AFF',
  secondary: '#AF52DE',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  
  // Background colors - clean and bright
  background: '#F2F2F7',
  backgroundSecondary: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.9)',
  
  // Glass morphism colors - more visible with stronger shadows
  glass: {
    primary: 'rgba(0, 122, 255, 0.08)',
    secondary: 'rgba(175, 82, 222, 0.08)',
    tertiary: 'rgba(0, 0, 0, 0.03)',
    background: 'rgba(255, 255, 255, 0.6)',
    overlay: 'rgba(0, 0, 0, 0.08)',
  },
  
  // Text colors - stronger contrast
  text: '#000000',
  textSecondary: 'rgba(0, 0, 0, 0.8)',
  textTertiary: 'rgba(0, 0, 0, 0.6)',
  
  // UI colors - more defined
  border: 'rgba(0, 122, 255, 0.25)',
  borderSecondary: 'rgba(0, 122, 255, 0.15)',
  white: '#FFFFFF',
  black: '#000000',
  
  // Shadow colors for light theme - much stronger shadows
  shadow: {
    light: 'rgba(0, 0, 0, 0.15)',
    medium: 'rgba(0, 0, 0, 0.25)',
    heavy: 'rgba(0, 0, 0, 0.35)',
  },
  
  // iOS system colors - true iOS light mode colors
  systemBlue: '#007AFF',
  systemPurple: '#AF52DE',
  systemGreen: '#34C759',
  systemOrange: '#FF9500',
  systemRed: '#FF3B30',
  systemYellow: '#FFCC00',
  systemPink: '#FF2D92',
  systemTeal: '#5AC8FA',
  systemIndigo: '#5856D6',
};

export { darkColors, lightColors };
export default darkColors;