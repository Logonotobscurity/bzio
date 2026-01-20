import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/{page,layout,error,not-found}.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.tsx',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        pill: '9999px',
      },
      keyframes: {
        'accordion-down': {
          from: {height: '0'},
          to: {height: 'var(--radix-accordion-content-height)'},
        },
        'accordion-up': {
          from: {height: 'var(--radix-accordion-content-height)'},
          to: {height: '0'},
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      spacing: {
        /* Section Spacing */
        'section-xs': 'var(--section-spacing-xs)',
        'section-sm': 'var(--section-spacing-sm)',
        'section-md': 'var(--section-spacing-md)',
        'section-lg': 'var(--section-spacing-lg)',
        'section-xl': 'var(--section-spacing-xl)',
        /* Grid Gaps */
        'gap-xxs': 'var(--gap-xxs)',
        'gap-xs': 'var(--gap-xs)',
        'gap-sm': 'var(--gap-sm)',
        'gap-md': 'var(--gap-md)',
        'gap-lg': 'var(--gap-lg)',
        'gap-xl': 'var(--gap-xl)',
        /* Container & Padding */
        'container-px': 'var(--container-padding-x)',
        'nav-padding-block': 'var(--navbar-padding-block)',
        'nav-padding-inline': 'var(--navbar-padding-inline)',
        'card-padding': 'var(--card-padding)',
        'card-gap': 'var(--card-gap)',
        /* Button Spacing */
        'btn-px-sm': 'var(--btn-padding-x-sm)',
        'btn-px-lg': 'var(--btn-padding-x-lg)',
        'btn-py': 'var(--btn-padding-y)',
      },
      gaps: {
        'fluid-xs': 'var(--gap-xs)',
        'fluid-sm': 'var(--gap-sm)',
        'fluid-md': 'var(--gap-md)',
        'fluid-lg': 'var(--gap-lg)',
        'fluid-xl': 'var(--gap-xl)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
