import { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './redux/store';
import { EditorProvider } from './context/EditorContext';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import GridCanvas from './components/GridCanvas';

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ReduxProvider store={store}>
      <EditorProvider>
        {/* Haiti deep background, Blue Chalk text */}
        <div
          className="flex h-screen flex-col overflow-hidden"
          style={{ backgroundColor: 'var(--q-haiti)', color: 'var(--q-chalk)' }}
        >
          <Header onMenuToggle={() => setDrawerOpen((v) => !v)} drawerOpen={drawerOpen} />

          <div className="flex flex-1 overflow-hidden relative">
            <Toolbar drawerOpen={drawerOpen} onDrawerClose={() => setDrawerOpen(false)} />

            {/* Mobile overlay */}
            {drawerOpen && (
              <div
                className="fixed inset-0 z-20 lg:hidden"
                style={{ backgroundColor: 'rgba(24,16,43,0.75)', backdropFilter: 'blur(4px)' }}
                onClick={() => setDrawerOpen(false)}
              />
            )}

            <GridCanvas />
          </div>
        </div>
      </EditorProvider>
    </ReduxProvider>
  );
}
