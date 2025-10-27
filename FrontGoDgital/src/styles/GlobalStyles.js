import { createGlobalStyle, ThemeProvider } from "styled-components"
import PropTypes from "prop-types"

import { synviaTheme } from "./theme"

export const GlobalStyles = createGlobalStyle`
  :root {
    --synvia-midnight: ${synviaTheme.colors.midnight};
    --synvia-space-cadet: ${synviaTheme.colors.spaceCadet};
    --synvia-deep-indigo: ${synviaTheme.colors.deepIndigo};
    --synvia-steel-blue: ${synviaTheme.colors.steelBlue};
    --synvia-ice-blue: ${synviaTheme.colors.iceBlue};
    --synvia-snow: ${synviaTheme.colors.snow};
    --synvia-surface: ${synviaTheme.colors.surface};
    --synvia-surface-alt: ${synviaTheme.colors.surfaceAlt};
    --synvia-border: ${synviaTheme.colors.border};
    --synvia-text-primary: ${synviaTheme.colors.textPrimary};
    --synvia-text-secondary: ${synviaTheme.colors.textSecondary};
    --synvia-text-muted: ${synviaTheme.colors.textMuted};
    --synvia-accent-primary: ${synviaTheme.colors.accentPrimary};
    --synvia-accent-secondary: ${synviaTheme.colors.accentSecondary};
    --synvia-accent-highlight: ${synviaTheme.colors.accentHighlight};
    --synvia-focus-ring: ${synviaTheme.colors.focusRing};
    --synvia-gradient-bg: ${synviaTheme.colors.gradientBackground};
    --synvia-gradient-card: ${synviaTheme.colors.gradientCard};
  }

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${synviaTheme.typography.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--synvia-gradient-bg);
    color: var(--synvia-text-primary);
    line-height: 1.6;
    min-height: 100vh;
    position: relative;
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at 20% 20%, rgba(142, 194, 255, 0.15), transparent 45%),
                radial-gradient(circle at 80% 0%, rgba(91, 181, 162, 0.18), transparent 40%),
                radial-gradient(circle at 50% 75%, rgba(20, 21, 38, 0.25), transparent 55%);
    z-index: -1;
  }

  ::selection {
    background: rgba(52, 127, 196, 0.25);
    color: var(--synvia-text-primary);
  }

  button {
    border: none;
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  h1, h2, h3, h4, h5 {
    font-family: ${synviaTheme.typography.secondary};
    color: var(--synvia-text-primary);
  }

  .security-alert-critical {
    border-left: 4px solid ${synviaTheme.colors.danger};
    background: rgba(218, 92, 92, 0.08);
  }

  .security-alert-warning {
    border-left: 4px solid ${synviaTheme.colors.warning};
    background: rgba(244, 183, 64, 0.08);
  }

  .security-alert-info {
    border-left: 4px solid var(--synvia-accent-primary);
    background: rgba(52, 127, 196, 0.08);
  }
`

export const ThemeWrapper = ({ children }) => (
  <ThemeProvider theme={synviaTheme}>
    <GlobalStyles />
    {children}
  </ThemeProvider>
)

ThemeWrapper.propTypes = {
  children: PropTypes.node,
}
