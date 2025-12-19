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
        description: 'True black OLED optimized',
        colors: {
            // True Black
            bg: '#000000',
            canvasBg: '#050505',
            canvasPattern: '#1A1A1A',

            text: '#EDEDED',
            textSecondary: '#A1A1AA', // Zinc-400
            textMuted: '#52525B',     // Zinc-600

            border: '#27272A',        // Zinc-800

            'glass-bg': 'rgba(0, 0, 0, 0.7)',
            'glass-border': 'rgba(255, 255, 255, 0.1)',

            // Neutrals (Tailwind Zinc - Cool Gray)
            'neutral-50': '#09090B',  // Inverted for dark mode mapping? No, keep standard scale but UI will map them.
            // ACTUALLY: For the UI tokens to work (bg-neutral-50, etc), we should Map them semantically OR keep the scale correct and ensure components use the right tokens.
            // But usually "bg-neutral-50" implies "lightest".
            // If we want "Midnight" to be dark, we should INVERT the palette so neutral-50 is DARK.
            // This is the easiest way to make existing components compatible without refactoring everything.
            'neutral-50': '#000000', // Was light, now darkest
            'neutral-100': '#09090B',
            'neutral-200': '#18181B', // Card bg
            'neutral-300': '#27272A', // Borders
            'neutral-400': '#3F3F46',
            'neutral-500': '#52525B', // Muted text
            'neutral-600': '#71717A',
            'neutral-700': '#A1A1AA', // Secondary text
            'neutral-800': '#D4D4D8',
            'neutral-900': '#FAFAFA', // Primary text
            'neutral-950': '#FFFFFF',

            // Primary (Blue/Indigo - "Electric")
            'primary-50': '#020617',
            'primary-100': '#0F172A',
            'primary-200': '#1E293B',
            'primary-300': '#334155',
            'primary-400': '#475569',
            'primary-500': '#3B82F6', // Blue-500 (Main Brand)
            'primary-600': '#60A5FA', // Lighter on dark hover
            'primary-700': '#93C5FD',
            'primary-800': '#BFDBFE',
            'primary-900': '#DBEAFE',
            'primary-950': '#EFF6FF',

            // Note Types (High Neon)
            'fleeting-main': '#FACC15', // Yellow-400
            'fleeting-glow': 'rgba(250, 204, 21, 0.5)',
            'literature-main': '#22D3EE', // Cyan-400
            'literature-glow': 'rgba(34, 211, 238, 0.5)',
            'permanent-main': '#4ADE80', // Green-400
            'permanent-glow': 'rgba(74, 222, 128, 0.5)',
            'hub-main': '#C084FC',       // Purple-400
            'hub-glow': 'rgba(192, 132, 252, 0.5)',

            linkDefault: '#52525B',
            linkHover: '#A1A1AA'
        }
    }
};

export const getTheme = (name: ThemeName): Theme => themes[name];
