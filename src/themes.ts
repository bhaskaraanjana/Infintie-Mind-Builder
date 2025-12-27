export type ThemeName = 'cream' | 'midnight';

export interface ThemeColors {
    // Backgrounds
    bg: string;
    canvasBg: string;
    canvasPattern: string;

    // Text
    text: string;
    textSecondary: string;
    textMuted: string;

    // Borders
    border: string;

    // Glass
    'glass-bg': string;
    'glass-border': string;

    // Neutrals (50-950)
    'neutral-50': string;
    'neutral-100': string;
    'neutral-200': string;
    'neutral-300': string;
    'neutral-400': string;
    'neutral-500': string;
    'neutral-600': string;
    'neutral-700': string;
    'neutral-800': string;
    'neutral-900': string;
    'neutral-950': string;

    // Primary (50-950)
    'primary-50': string;
    'primary-100': string;
    'primary-200': string;
    'primary-300': string;
    'primary-400': string;
    'primary-500': string;
    'primary-600': string;
    'primary-700': string;
    'primary-800': string;
    'primary-900': string;
    'primary-950': string;

    // Note Types
    'fleeting-main': string;
    'fleeting-glow': string;
    'literature-main': string;
    'literature-glow': string;
    'permanent-main': string;
    'permanent-glow': string;
    'hub-main': string;
    'hub-glow': string;

    // Links
    linkDefault: string;
    linkHover: string;
}

export interface Theme {
    name: ThemeName;
    label: string;
    description: string;
    colors: ThemeColors;
}

export const themes: Record<ThemeName, Theme> = {
    cream: {
        name: 'cream',
        label: 'Cream',
        description: 'Warm, paper-like aesthetic',
        colors: {
            // Warm Paper Backgrounds
            bg: '#FDFBF7',         // Warm White
            canvasBg: '#F5F2EB',   // Darker Paper
            canvasPattern: '#E6E2D6',

            text: '#1C1917',        // Warm Black (Stone-900)
            textSecondary: '#44403C', // Stone-700
            textMuted: '#78716C',     // Stone-500

            border: '#E7E5E4',      // Stone-200

            'glass-bg': 'rgba(255, 255, 255, 0.7)',
            'glass-border': 'rgba(255, 255, 255, 0.3)',

            // Neutrals (Tailwind Stone)
            'neutral-50': '#FAFAF9',
            'neutral-100': '#F5F5F4',
            'neutral-200': '#E7E5E4',
            'neutral-300': '#D6D3D1',
            'neutral-400': '#A8A29E',
            'neutral-500': '#78716C',
            'neutral-600': '#57534E',
            'neutral-700': '#44403C',
            'neutral-800': '#292524',
            'neutral-900': '#1C1917',
            'neutral-950': '#0C0A09',

            // Primary (Sky Blue - "Daylight")
            'primary-50': '#f0f9ff',
            'primary-100': '#e0f2fe',
            'primary-200': '#bae6fd',
            'primary-300': '#7dd3fc',
            'primary-400': '#38bdf8',
            'primary-500': '#0ea5e9', // Sky-500
            'primary-600': '#0284c7',
            'primary-700': '#0369a1',
            'primary-800': '#075985',
            'primary-900': '#0c4a6e',
            'primary-950': '#082f49',

            // Note Types
            'fleeting-main': '#F59E0B', // Amber-500
            'fleeting-glow': 'rgba(245, 158, 11, 0.4)',
            'literature-main': '#F97316', // Orange-500
            'literature-glow': 'rgba(249, 115, 22, 0.4)',
            'permanent-main': '#10B981', // Emerald-500
            'permanent-glow': 'rgba(16, 185, 129, 0.3)',
            'hub-main': '#8B5CF6',       // Violet-500
            'hub-glow': 'rgba(139, 92, 246, 0.3)',

            linkDefault: '#A8A29E',
            linkHover: '#57534E'
        }
    },

    midnight: {
        name: 'midnight',
        label: 'Midnight',
        description: 'High contrast dark theme',
        colors: {
            // Deep Zinc (not pure black - easier on eyes)
            bg: '#09090b',           // Zinc-950
            canvasBg: '#09090b',     // Zinc-950
            canvasPattern: '#18181b', // Zinc-900 (subtle pattern)

            text: '#fafafa',          // Zinc-50 (high contrast white)
            textSecondary: '#a1a1aa', // Zinc-400
            textMuted: '#71717a',     // Zinc-500

            border: '#3f3f46',        // Zinc-700 (visible borders!)

            'glass-bg': 'rgba(24, 24, 27, 0.85)',  // Zinc-900 with opacity
            'glass-border': 'rgba(255, 255, 255, 0.15)',

            // Neutrals - INVERTED for dark mode (50=darkest, 950=lightest)
            // This ensures components using neutral-50 get a dark background
            'neutral-50': '#18181b',   // Zinc-900 (sidebar/panel bg)
            'neutral-100': '#27272a',  // Zinc-800 (card bg)
            'neutral-200': '#3f3f46',  // Zinc-700 (hover states)
            'neutral-300': '#52525b',  // Zinc-600 (borders)
            'neutral-400': '#71717a',  // Zinc-500 (muted)
            'neutral-500': '#a1a1aa',  // Zinc-400 (secondary text)
            'neutral-600': '#d4d4d8',  // Zinc-300
            'neutral-700': '#e4e4e7',  // Zinc-200
            'neutral-800': '#f4f4f5',  // Zinc-100
            'neutral-900': '#fafafa',  // Zinc-50 (primary text)
            'neutral-950': '#ffffff',

            // Primary (Blue - Electric)
            'primary-50': '#eff6ff',
            'primary-100': '#dbeafe',
            'primary-200': '#bfdbfe',
            'primary-300': '#93c5fd',
            'primary-400': '#60a5fa',
            'primary-500': '#3b82f6',
            'primary-600': '#2563eb',
            'primary-700': '#1d4ed8',
            'primary-800': '#1e40af',
            'primary-900': '#1e3a8a',
            'primary-950': '#172554',

            // Note Types (Vibrant Neon for dark bg)
            'fleeting-main': '#facc15',
            'fleeting-glow': 'rgba(250, 204, 21, 0.6)',
            'literature-main': '#22d3ee',
            'literature-glow': 'rgba(34, 211, 238, 0.6)',
            'permanent-main': '#4ade80',
            'permanent-glow': 'rgba(74, 222, 128, 0.6)',
            'hub-main': '#c084fc',
            'hub-glow': 'rgba(192, 132, 252, 0.6)',

            linkDefault: '#71717a',
            linkHover: '#a1a1aa'
        }
    }
};

export const getTheme = (name: ThemeName): Theme => themes[name];
