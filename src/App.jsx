import { useState } from 'react'
import Home from './Components/Home'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState('home')

  const renderView = () => {
    switch(currentView) {
      case 'home':
        return <Home onSelectGym={() => setCurrentView('gym')} onSelectCafe={() => setCurrentView('cafe')} />
      case 'gym':
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl mb-4">Gimnasio (Próximamente)</h1>
            <button 
              onClick={() => setCurrentView('home')}
              className="px-6 py-3 bg-amber-600 text-black rounded-lg hover:bg-amber-500 transition"
            >
              Volver al Home
            </button>
          </div>
        </div>
      case 'cafe':
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl mb-4">Café Bar (Próximamente)</h1>
            <button 
              onClick={() => setCurrentView('home')}
              className="px-6 py-3 bg-amber-600 text-black rounded-lg hover:bg-amber-500 transition"
            >
              Volver al Home
            </button>
          </div>
        </div>
      default:
        return <Home onSelectGym={() => setCurrentView('gym')} onSelectCafe={() => setCurrentView('cafe')} />
    }
  }

  return <>{renderView()}</>
}

export default App