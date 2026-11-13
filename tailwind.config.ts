import type { Config } from 'tailwindcss'

// Semantic tokens only (docs/design.md). Spacing uses Tailwind's 4px grid.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      'text-primary': 'var(--text-primary)',
      'text-secondary': 'var(--text-secondary)',
      'text-disabled': 'var(--text-disabled)',
      'bg-primary': 'var(--bg-primary)',
      'bg-surface': 'var(--bg-surface)',
      'bg-subtle': 'var(--bg-subtle)',
      'border-default': 'var(--border-default)',
      'border-strong': 'var(--border-strong)',
      'brand': 'var(--brand)',
      'brand-bg': 'var(--brand-bg)',
      'success': 'var(--success)',
      'success-bg': 'var(--success-bg)',
      'success-text': 'var(--success-text)',
      'danger': 'var(--danger)',
      'danger-bg': 'var(--danger-bg)',
      'danger-text': 'var(--danger-text)',
      'warning': 'var(--warning)',
      'warning-bg': 'var(--warning-bg)',
      'warning-text': 'var(--warning-text)',
      'accent': 'var(--accent)',
    },
    borderRadius: {
      none: '0',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      full: '9999px',
    },
    fontSize: {
      h5: ['24px', { lineHeight: '32px', fontWeight: '500' }],
      body: ['16px', { lineHeight: '24px', fontWeight: '500' }],
      caption: ['12px', { lineHeight: '18px', fontWeight: '400' }],
    },
    extend: {
      fontFamily: { sans: ['var(--font-inter)', 'Inter Display', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}

export default config
