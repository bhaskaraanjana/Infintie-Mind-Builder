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
import { DebugMenu } from './DebugMenu';
import { MobileContextMenu } from './components/MobileContextMenu';
import { SelectionToggle } from './components/SelectionToggle';
import { SelectionToolbar } from './components/SelectionToolbar';

function App() {
    const { user } = useAuth();

    // Show login modal if not authenticated
    if (!user) {
        return <LoginModal />;
    }

    const loadData = useStore((state) => state.loadData);
    const themeName = useStore((state) => state.theme);
    const initializeSync = useStore((state) => state.initializeSync);
    const reconcileWithCloud = useStore((state) => state.reconcileWithCloud);
    const cleanupSync = useStore((state) => state.cleanupSync);

    // Initialize cloud sync when user logs in
    useEffect(() => {
        if (user) {
            (async () => {
                await initializeSync(user.uid);
                // After sync is initialized, reconcile any local changes
                await reconcileWithCloud();
            })();
        }

        return () => {
            cleanupSync();
        };
    }, [user, initializeSync, reconcileWithCloud, cleanupSync]);

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
            <Canvas />
            <SearchBar />
            <TagFilter />
            <NoteEditor />
            <Minimap />
            <DebugMenu />
            <Settings />
            <ViewControls />
            <SelectionToggle />
            <SelectionToolbar />
            <MobileContextMenu />
        </div>
    );
}

export default App;
