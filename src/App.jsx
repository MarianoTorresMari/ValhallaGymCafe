import { useState } from 'react'
import Home from './Components/Home'
import Cafe from './Components/Cafe'
import AdminPanel from './Components/AdminPanel'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState('home')

  const renderView = () => {
    switch(currentView) {
      case 'home':
        return <Home
          onSelectCafe={() => setCurrentView('cafe')}
          onSelectAdmin={() => setCurrentView('admin')}
        />
      case 'cafe':
        return <Cafe onBack={() => setCurrentView('home')} />
      case 'admin':
        return <AdminPanel onBack={() => setCurrentView('home')} />
      default:
        return <Home
          onSelectCafe={() => setCurrentView('cafe')}
          onSelectAdmin={() => setCurrentView('admin')}
        />
    }
  }

  return <>{renderView()}</>
}

export default App
