import { useEffect } from 'react';
import { InfiniteCanvas as Canvas } from './InfiniteCanvas';
import { NoteEditor } from './NoteEditor';
import { SearchAndFilter } from './SearchAndFilter';
import { Minimap } from './Minimap';
import { Settings } from './Settings';
import { ViewControls } from './ViewControls';
import { useStore } from './store';
import { themes } from './themes';
import { useAuth } from './contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { EmailVerificationModal } from './EmailVerificationModal';

import { MobileContextMenu } from './components/MobileContextMenu';
import { SelectionToggle } from './components/SelectionToggle';
import { SelectionToolbar } from './components/SelectionToolbar';
import { useModalHistory } from './hooks/useModalHistory';

function App() {
    const { user } = useAuth();

    const themeName = useStore((state) => state.theme);

    // Apply theme colors immediately
    useEffect(() => {
        const theme = themes[themeName];
        if (theme) {
            const root = document.documentElement;
            // Dynamic injection of all theme variables
            Object.entries(theme.colors).forEach(([key, value]) => {
                root.style.setProperty(`--${key}`, value);
            });
        }
    }, [themeName]);



    const loadData = useStore((state) => state.loadData);
    // themeName moved up
    const initializeSync = useStore((state) => state.initializeSync);
    const reconcileWithCloud = useStore((state) => state.reconcileWithCloud);
    const cleanupSync = useStore((state) => state.cleanupSync);

    // Navigation History
    const editingNoteId = useStore((state) => state.editingNoteId);
    const setEditingNoteId = useStore((state) => state.setEditingNoteId);

    // Using a custom hook to manage back button support for the editor
    // We import it dynamically or just assume it is available from correct path
    // Since App.tsx is in src/, hooks is in src/hooks
    // We need to add imports at top

    // Note: The hook call must be inside the component body
    // We can't conditionally call hooks, so check editingNoteId boolean
    // But we need to IMPORT the hook first. I will add import in separate replacement if needed, 
    // or assume I can do it here if I include imports.
    // I will use a separate replacement for imports.


    // Initialize cloud sync when user logs in
    useEffect(() => {
        if (user) {
            (async () => {
                await initializeSync(user.uid);
                // DISABLED: reconcileWithCloud blindly pushes local data, causing resurrection of deleted notes.
                // We rely on 'onSnapshot' to sync state first.
                // await reconcileWithCloud();
            })();
        }

        return () => {
            cleanupSync();
        };
    }, [user, initializeSync, reconcileWithCloud, cleanupSync]);

    useEffect(() => {
        loadData();
    }, [loadData]);



    useModalHistory(!!editingNoteId, () => setEditingNoteId(null), 'editor');

    // Show login modal if not authenticated
    if (!user) {
        return <LoginModal />;
    }

    if (!user.emailVerified) {
        return <EmailVerificationModal />;
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                overflow: 'hidden',
                backgroundColor: 'var(--bg)',
            }}
        >
            <Canvas />

            <SearchAndFilter />

            <NoteEditor key={editingNoteId} />
            <Minimap />

            <Settings />
            <ViewControls />
            <SelectionToggle />
            <SelectionToolbar />
            <MobileContextMenu />
        </div>
    );
}

export default App;
