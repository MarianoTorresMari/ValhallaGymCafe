import { useState } from 'react';
import { Coffee, Lock, ArrowRight } from 'lucide-react';
import LOGOsf from '../assets/LOGOsf.png';

function Home({ onSelectCafe, onSelectAdmin }) {

  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-amber-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-800/10 rounded-full blur-3xl"></div>
      </div>

      {/* Botón de admin - esquina superior derecha */}
      <button
        onClick={onSelectAdmin}
        className="fixed top-4 right-4 p-2.5 bg-zinc-900/60 text-amber-500/60 rounded-lg hover:bg-zinc-800/70 hover:text-amber-400 transition-all duration-200 border border-amber-900/30 hover:border-amber-700/50"
        title="Panel de Administración"
      >
        <Lock className="w-4 h-4" />
      </button>

      {/* Logo y Título */}
      <div className="text-center mb-10 animate-fade-in relative z-10">
        <div className="mb-7 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-600/30 to-orange-700/20 blur-xl scale-110"></div>
            <div className="relative w-36 h-36 rounded-full ring-2 ring-amber-700/40 ring-offset-4 ring-offset-black overflow-hidden shadow-2xl shadow-amber-950/80">
              <img src={LOGOsf} alt="Valhalla Gym & Café" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700 mb-2 tracking-tight">
          Valhalla
        </h1>
        <p className="text-xl md:text-2xl text-amber-200/60 font-light tracking-[0.2em] uppercase">
          Café Bar
        </p>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-600/60 to-transparent mx-auto mt-5"></div>
      </div>

      {/* Tarjeta Café */}
      <div className="max-w-sm w-full px-4 relative z-10">
        <div
          onMouseEnter={() => setHoveredCard('cafe')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={onSelectCafe}
          className="relative group cursor-pointer"
        >
          {/* Glow */}
          <div className={`absolute inset-0 bg-gradient-to-br from-amber-700/40 to-orange-900/30 rounded-2xl blur-2xl transition-opacity duration-500 ${
            hoveredCard === 'cafe' ? 'opacity-100' : 'opacity-40'
          }`}></div>

          <div className={`relative bg-gradient-to-br from-zinc-900/95 to-zinc-950 border rounded-2xl p-8 flex flex-col gap-5 overflow-hidden shadow-2xl transition-all duration-400 ${
            hoveredCard === 'cafe' ? 'border-amber-600/60 -translate-y-1 shadow-amber-900/40' : 'border-amber-800/30'
          }`}>
            {/* Shimmer */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent -skew-x-12 transition-transform duration-700 ${
              hoveredCard === 'cafe' ? 'translate-x-full' : '-translate-x-full'
            }`}></div>

            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-900/40 border border-amber-700/30 flex items-center justify-center flex-shrink-0">
                <Coffee className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-amber-400 leading-tight">Café Bar</h2>
                <p className="text-amber-200/50 text-sm">Valhalla Gym & Café</p>
              </div>
            </div>

            <p className="relative z-10 text-amber-100/60 text-sm leading-relaxed">
              Pedí desde tu mesa, elegí tu método de pago y disfrutá de nuestros cafés artesanales y comida saludable.
            </p>

            <div className={`relative z-10 flex items-center justify-between w-full py-3.5 px-5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              hoveredCard === 'cafe'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-600/30'
                : 'bg-amber-900/30 text-amber-300/80 border border-amber-800/40'
            }`}>
              <span>{hoveredCard === 'cafe' ? 'Ingresar al Café' : 'Ver carta'}</span>
              <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${hoveredCard === 'cafe' ? 'translate-x-1' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center relative z-10">
        <p className="text-amber-200/30 text-xs tracking-widest uppercase">
          Gym &amp; Café · Valhalla
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.9s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Home;
