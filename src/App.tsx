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
import { useAuth } from './contexts/AuthContext';
import { LoginModal } from './LoginModal';

function App() {
    const { user } = useAuth();

    // Show login modal if not authenticated
    if (!user) {
        return <LoginModal />;
    }

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
        }
    }, [themeName]);

    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                overflow: 'hidden',
                backgroundColor: 'var(--theme-bg)',
            }}
        >
            <SearchBar />
            <TagFilter />
            <Canvas />
            <NoteEditor />
            <Minimap />
            <Settings />
            <ViewControls />
        </div>
    );
}

export default App;
