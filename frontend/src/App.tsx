import { useEffect, useState } from 'react';
import { Layout } from './components/layout/Layout';
import { AuthView } from './components/views/AuthView';
import { ExcavationView } from './components/views/ExcavationView';
import { WorkshopView } from './components/views/WorkshopView';
import { MuseumView } from './components/views/MuseumView';
import { MarketView } from './components/views/MarketView';
import { CompetitionView } from './components/views/CompetitionView';
import { GuildView } from './components/views/GuildView';
import { WarView } from './components/views/WarView';
import { LeaderboardView } from './components/views/LeaderboardView';
import { ReportView } from './components/views/ReportView';
import { useGameStore } from './store/gameStore';
import { Loader2 } from 'lucide-react';

type ViewType = 'excavation' | 'workshop' | 'museum' | 'market' | 'competition' | 'guild' | 'war' | 'leaderboard' | 'report';

const viewComponents: Record<ViewType, React.FC> = {
  excavation: ExcavationView,
  workshop: WorkshopView,
  museum: MuseumView,
  market: MarketView,
  competition: CompetitionView,
  guild: GuildView,
  war: WarView,
  leaderboard: LeaderboardView,
  report: ReportView,
};

function App() {
  const { isAuthenticated, isLoading, fetchUserData, notification, activeView, clearNotification } = useGameStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      await fetchUserData();
      setInitializing(false);
    };
    init();
  }, [fetchUserData]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  const CurrentView = viewComponents[activeView as ViewType] || viewComponents.excavation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Layout>
        <CurrentView />
      </Layout>

      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-xl animate-bounce cursor-pointer ${
            notification.type === 'success' ? 'bg-green-600' :
            notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          } text-white font-medium`}
          onClick={clearNotification}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default App;
