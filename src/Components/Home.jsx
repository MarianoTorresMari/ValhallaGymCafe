import { useState } from 'react';

function Home({ onSelectGym, onSelectCafe }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-amber-950 flex flex-col items-center justify-center p-4">
      {/* Logo y Título */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="mb-6 flex justify-center">
          <div className="w-32 h-32 bg-amber-800/20 rounded-full flex items-center justify-center border-4 border-amber-700/50 shadow-2xl shadow-amber-900/50">
            <div className="text-6xl">🏛️</div>
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-600 to-amber-800 mb-3 tracking-tight">
          Valhalla
        </h1>
        <p className="text-2xl md:text-3xl text-amber-200/80 font-light tracking-wide">
          Gym & Cafe
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-4"></div>
      </div>

      {/* Tarjetas de Selección */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full px-4">
        {/* Tarjeta Gimnasio */}
        <div
          onMouseEnter={() => setHoveredCard('gym')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={onSelectGym}
          className={`relative group cursor-pointer transition-all duration-500 transform ${
            hoveredCard === 'gym' ? 'scale-105 -translate-y-2' : 'scale-100'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
          
          <div className="relative bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-700/50 rounded-2xl p-8 h-80 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(251, 191, 36, 0.1) 10px, rgba(251, 191, 36, 0.1) 20px)'
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="text-6xl mb-4">💪</div>
              <h2 className="text-4xl font-bold text-amber-400 mb-3">Gimnasio</h2>
              <p className="text-amber-100/70 text-lg leading-relaxed">
                Entrena como un guerrero. Accede a nuestras instalaciones premium.
              </p>
            </div>

            <button className={`relative z-10 w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              hoveredCard === 'gym'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-lg shadow-amber-600/50'
                : 'bg-amber-900/50 text-amber-200 border-2 border-amber-700/50'
            }`}>
              {hoveredCard === 'gym' ? 'Ingresar al Gimnasio →' : 'Seleccionar'}
            </button>

            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent transform -skew-x-12 transition-all duration-700 ${
              hoveredCard === 'gym' ? 'translate-x-full' : '-translate-x-full'
            }`}></div>
          </div>
        </div>

        {/* Tarjeta Café */}
        <div
          onMouseEnter={() => setHoveredCard('cafe')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={onSelectCafe}
          className={`relative group cursor-pointer transition-all duration-500 transform ${
            hoveredCard === 'cafe' ? 'scale-105 -translate-y-2' : 'scale-100'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-yellow-900 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
          
          <div className="relative bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-700/50 rounded-2xl p-8 h-80 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(251, 191, 36, 0.1) 10px, rgba(251, 191, 36, 0.1) 20px)'
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="text-6xl mb-4">☕</div>
              <h2 className="text-4xl font-bold text-amber-400 mb-3">Café Bar</h2>
              <p className="text-amber-100/70 text-lg leading-relaxed">
                Relájate y recarga energías. Disfruta de nuestros cafés artesanales y comida saludable.
              </p>
            </div>

            <button className={`relative z-10 w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              hoveredCard === 'cafe'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-600/50'
                : 'bg-amber-900/50 text-amber-200 border-2 border-amber-700/50'
            }`}>
              {hoveredCard === 'cafe' ? 'Ingresar al Café →' : 'Seleccionar'}
            </button>

            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent transform -skew-x-12 transition-all duration-700 ${
              hoveredCard === 'cafe' ? 'translate-x-full' : '-translate-x-full'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-amber-200/50 text-sm">
          Un lugar donde la fuerza y el sabor se encuentran
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Home;