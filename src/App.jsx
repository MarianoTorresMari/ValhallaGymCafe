import { useState } from 'react'
import Home from './Components/Home'
import Cafe from './Components/Cafe'
import Gym from './Components/Gym'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState('home')

  const renderView = () => {
    switch(currentView) {
      case 'home':
        return <Home 
          onSelectGym={() => setCurrentView('gym')} 
          onSelectCafe={() => setCurrentView('cafe')} 
        />
      case 'gym':
      return <Gym onBack={() => setCurrentView('home')} />
      case 'cafe':
        return <Cafe onBack={() => setCurrentView('home')} />
      default:
        return <Home 
          onSelectGym={() => setCurrentView('gym')} 
          onSelectCafe={() => setCurrentView('cafe')} 
        />
    }
  }

  return <>{renderView()}</>
}

export default App