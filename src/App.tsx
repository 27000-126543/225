import { Layout } from './components/layout/Layout'
import { useGameStore } from './store/gameStore'
import { ExcavationView } from './components/views/ExcavationView'
import { WorkshopView } from './components/views/WorkshopView'
import { MuseumView } from './components/views/MuseumView'
import { MarketView } from './components/views/MarketView'
import { CompetitionView } from './components/views/CompetitionView'
import { GuildView } from './components/views/GuildView'
import { WarView } from './components/views/WarView'
import { LeaderboardView } from './components/views/LeaderboardView'
import { ReportView } from './components/views/ReportView'

function App() {
  const { currentView } = useGameStore()

  const renderView = () => {
    switch (currentView) {
      case 'excavation':
        return <ExcavationView />
      case 'workshop':
        return <WorkshopView />
      case 'museum':
        return <MuseumView />
      case 'market':
        return <MarketView />
      case 'competition':
        return <CompetitionView />
      case 'guild':
        return <GuildView />
      case 'war':
        return <WarView />
      case 'leaderboard':
        return <LeaderboardView />
      case 'report':
        return <ReportView />
      default:
        return <ExcavationView />
    }
  }

  return (
    <Layout>
      {renderView()}
    </Layout>
  )
}

export default App
