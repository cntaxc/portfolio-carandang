import Dashboard from './components/Dashboard';
import IntroSplash from './components/IntroSplash';
import { useEffect } from 'react';
import { RecommendationsProvider } from './context/RecommendationsContext';
import { installGlobalSfx } from './audio/sfx';
import './styles/theme.css';
import './styles/layout.css';
import './styles/sections.css';
import './styles/portfolio.css';
import './App.css';

function App() {
  // Hover / click sounds on every button and link (files in sfxConfig.js).
  useEffect(() => installGlobalSfx(), []);

  return (
    <RecommendationsProvider>
      <IntroSplash />
      <Dashboard />
    </RecommendationsProvider>
  );
}

export default App;
