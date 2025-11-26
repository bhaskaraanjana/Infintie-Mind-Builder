import { useEffect } from 'react';
import { InfiniteCanvas as Canvas } from './InfiniteCanvas';
import { NoteEditor } from './NoteEditor';
import { SearchBar } from './SearchBar';
import { Minimap } from './Minimap';
import { TagFilter } from './TagFilter';
import { useStore } from './store';

function App() {
    const loadData = useStore((state) => state.loadData);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <Canvas />
            <NoteEditor />
            <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: '10px', zIndex: 10 }}>
                <SearchBar />
                <TagFilter />
            </div>
            <Minimap />
        </div>
    );
}

export default App;