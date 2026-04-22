// src/styles/theme.ts

export const husbandTheme = {
  role: 'husband' as const,
  // Primária azul
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  primaryMid: '#60A5FA',
  // Accent
  accent: '#0EA5E9',
  accentLight: '#E0F2FE',
  // Gradientes
  gradientMain: 'linear-gradient(160deg, #1D4ED8 0%, #2563EB 50%, #60A5FA 100%)',
  gradientCard: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
  // Neutros
  cream: '#F0F7FF',
  white: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#475569',
  textLight: '#94A3B8',
  border: 'rgba(37,99,235,0.15)',
  shadow: '0 4px 24px rgba(37,99,235,0.12)',
  shadowSm: '0 2px 8px rgba(37,99,235,0.08)',
  // Pills highlight
  pillBg: '#DBEAFE',
  pillText: '#1D4ED8',
}

export const wifeTheme = {
  role: 'wife' as const,
  // Primária rosa
  primary: '#8B3A62',
  primaryDark: '#5C1F3E',
  primaryLight: '#F5E6EE',
  primaryMid: '#C4709A',
  // Accent
  accent: '#C9973A',
  accentLight: '#FBF3E4',
  // Gradientes
  gradientMain: 'linear-gradient(160deg, #5C1F3E 0%, #8B3A62 50%, #C4709A 100%)',
  gradientCard: 'linear-gradient(135deg, #5C1F3E, #8B3A62)',
  // Neutros
  cream: '#FDF8F4',
  white: '#FFFFFF',
  text: '#2A1A1F',
  textMuted: '#7A5C68',
  textLight: '#B09AA6',
  border: 'rgba(139,58,98,0.15)',
  shadow: '0 4px 24px rgba(139,58,98,0.12)',
  shadowSm: '0 2px 8px rgba(139,58,98,0.08)',
  // Pills highlight
  pillBg: '#F5E6EE',
  pillText: '#8B3A62',
}

export type AppTheme = typeof husbandTheme

// Shared tokens
export const shared = {
  radius: '16px',
  radiusSm: '10px',
  radiusXl: '24px',
  fontDisplay: "'Playfair Display', serif",
  fontBody: "'DM Sans', sans-serif",
  navHeight: '68px',
  headerHeight: '64px',
}

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  html, body, #root {
    height: 100%;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  input, select, textarea, button {
    font-family: 'DM Sans', sans-serif;
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 2px; }
`
