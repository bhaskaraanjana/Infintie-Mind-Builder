import { useEffect } from 'react';
import { InfiniteCanvas as Canvas } from './InfiniteCanvas';
import { NoteEditor } from './NoteEditor';
import { SearchBar } from './SearchBar';
import { Minimap } from './Minimap';
import { TagFilter } from './TagFilter';
import { Settings } from './Settings';
import { ViewControls } from './ViewControls';
import { useStore } from './store';
import { themes } from './themes';

function App() {
    const loadData = useStore((state) => state.loadData);
    const themeName = useStore((state) => state.theme);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Apply theme colors
    useEffect(() => {
        const theme = themes[themeName];
        if (theme) {
            const root = document.documentElement;
            root.style.setProperty('--theme-bg', theme.colors.bg);
            root.style.setProperty('--theme-canvas-bg', theme.colors.canvasBg);
            root.style.setProperty('--theme-text', theme.colors.text);
            root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
            root.style.setProperty('--theme-border', theme.colors.border);
            root.style.setProperty('--theme-primary', theme.colors.primary);

            // Glassmorphism variables
            if (theme.name === 'light') {
                root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.7)');
                root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.3)');
            } else {
                root.style.setProperty('--glass-bg', 'rgba(30, 30, 30, 0.7)');
                root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
            }
        }
    }, [themeName]);

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--theme-bg)' }}>
            <Canvas />
            <NoteEditor />
            <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: '10px', zIndex: 10 }}>
                <SearchBar />
                <TagFilter />
            </div>
            <Minimap />
            <ViewControls />
            <Settings />
        </div>
    );
}

export default App;