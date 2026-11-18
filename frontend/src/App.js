import Dashboard from './components/Dashboard';
import IntroSplash from './components/IntroSplash';
import { RecommendationsProvider } from './context/RecommendationsContext';
import './styles/theme.css';
import './styles/layout.css';
import './styles/sections.css';
import './styles/background-profile.css';
import './styles/portfolio.css';
import './App.css';

function App() {
  return (
    <RecommendationsProvider>
      <IntroSplash />
      <Dashboard />
    </RecommendationsProvider>
  );
}

export default App;
