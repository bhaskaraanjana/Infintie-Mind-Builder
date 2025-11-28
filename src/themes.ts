export type ThemeName = 'light' | 'dark' | 'midnight' | 'forest' | 'ocean';

export interface Theme {
    name: ThemeName;
    label: string;
    description: string;
    colors: {
        // Backgrounds
        bg: string;
        canvasBg: string;
        canvasPattern: string;

        // Text
        text: string;
        textSecondary: string;

        // UI Elements
        border: string;
        primary: string;
        primaryHover: string;

        // Note type colors
        fleeting: { main: string; glow: string };
        literature: { main: string; glow: string };
        permanent: { main: string; glow: string };
        hub: { main: string; glow: string };

        // Link colors
        linkDefault: string;
        linkHover: string;
    };
}

export const themes: Record<ThemeName, Theme> = {
    light: {
        name: 'light',
        label: 'Light',
        description: 'Clean and minimal',
        colors: {
            bg: '#FFFFFF',
            canvasBg: '#FAF9F6',
            canvasPattern: '#D4D4D4',
            text: '#171717',
            textSecondary: '#525252',
            border: '#E5E5E5',
            primary: '#0EA5E9',
            primaryHover: '#0284C7',
            fleeting: { main: '#FFD700', glow: '#FFD70040' },
            literature: { main: '#87CEEB', glow: '#87CEEB40' },
            permanent: { main: '#90EE90', glow: '#90EE9040' },
            hub: { main: '#D8BFD8', glow: '#D8BFD840' },
            linkDefault: '#94A3B8',
            linkHover: '#64748B'
        }
    },

    dark: {
        name: 'dark',
        label: 'Dark',
        description: 'Obsidian-inspired',
        colors: {
            bg: '#1E1E1E',
            canvasBg: '#252525',
            canvasPattern: '#383838',
            text: '#E0E0E0',
            textSecondary: '#A0A0A0',
            border: '#383838',
            primary: '#60A5FA',
            primaryHover: '#3B82F6',
            fleeting: { main: '#FFEB3B', glow: '#FFEB3B50' },
            literature: { main: '#00E5FF', glow: '#00E5FF50' },
            permanent: { main: '#00E676', glow: '#00E67650' },
            hub: { main: '#D500F9', glow: '#D500F950' },
            linkDefault: '#B0BEC5',
            linkHover: '#FFFFFF'
        }
    },

    midnight: {
        name: 'midnight',
        label: 'Midnight',
        description: 'Deep and ethereal',
        colors: {
            bg: '#0A0E27',
            canvasBg: '#0F1439',
            canvasPattern: '#1A1F4A',
            text: '#E8E9F3',
            textSecondary: '#9CA3BC',
            border: '#1E2440',
            primary: '#8B5CF6',
            primaryHover: '#7C3AED',
            fleeting: { main: '#FFFF00', glow: '#FFFF0060' },
            literature: { main: '#00FFFF', glow: '#00FFFF60' },
            permanent: { main: '#00FF00', glow: '#00FF0060' },
            hub: { main: '#FF00FF', glow: '#FF00FF60' },
            linkDefault: '#5C6BC0',
            linkHover: '#E8EAF6'
        }
    },

    forest: {
        name: 'forest',
        label: 'Forest',
        description: 'Natural and earthy',
        colors: {
            bg: '#1A2A1A',
            canvasBg: '#1F3520',
            canvasPattern: '#2A4A2A',
            text: '#E8F4E8',
            textSecondary: '#A8C8A8',
            border: '#2A4A2A',
            primary: '#4ADE80',
            primaryHover: '#22C55E',
            fleeting: { main: '#FFCA28', glow: '#FFCA2850' },
            literature: { main: '#4DD0E1', glow: '#4DD0E150' },
            permanent: { main: '#A5D6A7', glow: '#A5D6A750' },
            hub: { main: '#CE93D8', glow: '#CE93D850' },
            linkDefault: '#A5D6A7',
            linkHover: '#E8F5E9'
        }
    },

    ocean: {
        name: 'ocean',
        label: 'Ocean',
        description: 'Deep and serene',
        colors: {
            bg: '#0D1B2A',
            canvasBg: '#1B263B',
            canvasPattern: '#2E3F56',
            text: '#E0F2FE',
            textSecondary: '#7DD3FC',
            border: '#2E3F56',
            primary: '#22D3EE',
            primaryHover: '#06B6D4',
            fleeting: { main: '#FFAB91', glow: '#FFAB9150' },
            literature: { main: '#4DD0E1', glow: '#4DD0E150' },
            permanent: { main: '#80CBC4', glow: '#80CBC450' },
            hub: { main: '#9FA8DA', glow: '#9FA8DA50' },
            linkDefault: '#B3E5FC',
            linkHover: '#FFFFFF'
        }
    }
};

export const getTheme = (name: ThemeName): Theme => themes[name];
