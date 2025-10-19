import { useState } from 'react';
import { Dumbbell, Clock, Users, Trophy, Zap, Shield, Star, Check, X, Calendar, Flame, Heart, Target } from 'lucide-react';

const Gym = ({ onBack }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('planes');

  // Planes de membresía
  const plans = [
    {
      id: 1,
      name: "Guerrero",
      price: 15000,
      period: "mes",
      popular: false,
      color: "from-zinc-700 to-zinc-800",
      features: [
        { text: "Acceso ilimitado al gimnasio", included: true },
        { text: "Vestuarios y duchas", included: true },
        { text: "1 clase grupal por semana", included: true },
        { text: "Rutina personalizada", included: false },
        { text: "Acceso a sauna", included: false },
        { text: "Plan nutricional", included: false }
      ]
    },
    {
      id: 2,
      name: "Vikingo",
      price: 25000,
      period: "mes",
      popular: true,
      color: "from-amber-600 to-orange-600",
      features: [
        { text: "Acceso ilimitado al gimnasio", included: true },
        { text: "Vestuarios y duchas", included: true },
        { text: "Clases grupales ilimitadas", included: true },
        { text: "Rutina personalizada", included: true },
        { text: "Acceso a sauna", included: true },
        { text: "Plan nutricional", included: false }
      ]
    },
    {
      id: 3,
      name: "Odín",
      price: 40000,
      period: "mes",
      popular: false,
      color: "from-yellow-600 to-amber-700",
      features: [
        { text: "Acceso ilimitado al gimnasio", included: true },
        { text: "Vestuarios y duchas premium", included: true },
        { text: "Clases grupales ilimitadas", included: true },
        { text: "Entrenador personal (2x semana)", included: true },
        { text: "Acceso a sauna y jacuzzi", included: true },
        { text: "Plan nutricional completo", included: true }
      ]
    }
  ];

  // Horarios de clases
  const schedule = [
    { day: "Lunes", classes: [
      { name: "CrossFit", time: "07:00", duration: "60 min", intensity: "Alta" },
      { name: "Yoga", time: "10:00", duration: "45 min", intensity: "Baja" },
      { name: "Spinning", time: "18:00", duration: "45 min", intensity: "Alta" }
    ]},
    { day: "Martes", classes: [
      { name: "Funcional", time: "08:00", duration: "60 min", intensity: "Media" },
      { name: "Pilates", time: "11:00", duration: "45 min", intensity: "Baja" },
      { name: "Boxing", time: "19:00", duration: "60 min", intensity: "Alta" }
    ]},
    { day: "Miércoles", classes: [
      { name: "CrossFit", time: "07:00", duration: "60 min", intensity: "Alta" },
      { name: "Stretching", time: "10:00", duration: "30 min", intensity: "Baja" },
      { name: "HIIT", time: "18:30", duration: "45 min", intensity: "Alta" }
    ]},
    { day: "Jueves", classes: [
      { name: "Funcional", time: "08:00", duration: "60 min", intensity: "Media" },
      { name: "Yoga", time: "10:00", duration: "45 min", intensity: "Baja" },
      { name: "Zumba", time: "19:00", duration: "45 min", intensity: "Media" }
    ]},
    { day: "Viernes", classes: [
      { name: "CrossFit", time: "07:00", duration: "60 min", intensity: "Alta" },
      { name: "Spinning", time: "18:00", duration: "45 min", intensity: "Alta" }
    ]}
  ];

  // Servicios e instalaciones
  const facilities = [
    { icon: <Dumbbell />, title: "Zona de Pesas", description: "Equipamiento profesional de última generación" },
    { icon: <Zap />, title: "Área Funcional", description: "Espacio amplio para entrenamiento funcional" },
    { icon: <Users />, title: "Salas de Clases", description: "3 salas equipadas para clases grupales" },
    { icon: <Heart />, title: "Zona Cardio", description: "Cintas, bicicletas y elípticas de alta gama" },
    { icon: <Shield />, title: "Vestuarios Premium", description: "Lockers individuales, duchas y sauna" },
    { icon: <Trophy />, title: "Área de Stretching", description: "Espacio dedicado para calentamiento y estiramiento" }
  ];

  const getIntensityColor = (intensity) => {
    switch(intensity) {
      case 'Alta': return 'text-red-400 bg-red-500/20';
      case 'Media': return 'text-orange-400 bg-orange-500/20';
      case 'Baja': return 'text-green-400 bg-green-500/20';
      default: return 'text-amber-400 bg-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-amber-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="px-4 py-2 bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition border border-amber-800/50"
              >
                ← Volver
              </button>
              <Dumbbell className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-2xl font-bold text-amber-400">Valhalla Gym</h1>
                <p className="text-sm text-amber-200/60">Forja tu leyenda</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-amber-300/70">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Lun-Vie: 6:00-22:00 | Sáb-Dom: 8:00-20:00</span>
              </div>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="flex space-x-2 mt-4 overflow-x-auto scrollbar-hide">
            {[
              { id: 'planes', label: 'Planes', icon: <Star className="w-4 h-4" /> },
              { id: 'horarios', label: 'Horarios', icon: <Calendar className="w-4 h-4" /> },
              { id: 'instalaciones', label: 'Instalaciones', icon: <Trophy className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-black'
                    : 'bg-zinc-900/50 text-amber-200 hover:bg-zinc-800/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* SECCIÓN PLANES */}
        {activeTab === 'planes' && (
          <div>
            {/* Hero section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-4">
                Elige Tu Camino
              </h2>
              <p className="text-amber-200/70 text-lg max-w-2xl mx-auto">
                Cada guerrero necesita el plan adecuado. Desde principiantes hasta atletas de élite.
              </p>
            </div>

            {/* Grid de planes */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`relative group ${plan.popular ? 'md:-translate-y-4' : ''}`}
                >
                  {/* Badge Popular */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1 shadow-xl">
                        <Flame className="w-4 h-4" />
                        <span>MÁS POPULAR</span>
                      </div>
                    </div>
                  )}

                  {/* Card */}
                  <div className={`relative bg-gradient-to-br from-zinc-900 to-black border-2 ${
                    plan.popular ? 'border-amber-600' : 'border-amber-800/30'
                  } rounded-2xl p-8 hover:border-amber-600/50 transition-all duration-300 h-full flex flex-col ${
                    plan.popular ? 'shadow-2xl shadow-amber-900/50' : ''
                  }`}>
                    
                    {/* Efecto de brillo */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-5 rounded-2xl`}></div>

                    {/* Contenido */}
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Header del plan */}
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-amber-400 mb-2">{plan.name}</h3>
                        <div className="flex items-end justify-center space-x-1">
                          <span className="text-4xl font-bold text-amber-500">${plan.price.toLocaleString()}</span>
                          <span className="text-amber-300/50 mb-2">/{plan.period}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex-1 space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <div className={`mt-0.5 ${feature.included ? 'text-green-400' : 'text-red-400/50'}`}>
                              {feature.included ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </div>
                            <span className={`text-sm ${feature.included ? 'text-amber-200' : 'text-amber-200/30'}`}>
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Botón */}
                      <button
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full py-4 rounded-xl font-bold transition-all ${
                          plan.popular
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-black hover:shadow-xl hover:shadow-amber-600/50'
                            : 'bg-amber-900/30 text-amber-400 border-2 border-amber-700/50 hover:bg-amber-900/50'
                        }`}
                      >
                        {selectedPlan === plan.id ? '✓ Seleccionado' : 'Elegir Plan'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Beneficios adicionales */}
            <div className="bg-gradient-to-br from-zinc-900/50 to-black/50 border border-amber-800/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-amber-400 mb-6 text-center">Todos los planes incluyen:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "WiFi de alta velocidad",
                  "Descuento para festejar tu cumple",
                  "App móvil con seguimiento",
                  "Eventos y competencias mensuales",
                  "Asesoría inicial gratuita"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-amber-200/80">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN HORARIOS */}
        {activeTab === 'horarios' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-4">
                Clases Grupales
              </h2>
              <p className="text-amber-200/70 text-lg">
                Entrena con energía y compañía. Todas las clases son con cupo limitado.
              </p>
            </div>

            <div className="space-y-6">
              {schedule.map((day, idx) => (
                <div key={idx} className="bg-gradient-to-br from-zinc-900 to-black border border-amber-800/30 rounded-2xl p-6 hover:border-amber-600/50 transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="w-6 h-6 text-amber-500" />
                    <h3 className="text-2xl font-bold text-amber-400">{day.day}</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {day.classes.map((clase, cidx) => (
                      <div key={cidx} className="bg-zinc-900/50 border border-amber-700/30 rounded-xl p-4 hover:bg-zinc-800/50 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold text-amber-300 group-hover:text-amber-400 transition">{clase.name}</h4>
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${getIntensityColor(clase.intensity)}`}>
                            {clase.intensity}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-amber-200/60">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{clase.time}</span>
                          </div>
                          <span>•</span>
                          <span>{clase.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Nota importante */}
            <div className="mt-8 bg-amber-900/20 border border-amber-700/50 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Target className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-amber-400 mb-2">Reserva tu lugar</h4>
                  <p className="text-amber-200/70">
                    Las clases tienen cupo limitado. Te recomendamos reservar con anticipación desde nuestra app móvil o en recepción.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN INSTALACIONES */}
        {activeTab === 'instalaciones' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-4">
                Nuestras Instalaciones
              </h2>
              <p className="text-amber-200/70 text-lg">
                Equipamiento de clase mundial para tu entrenamiento
              </p>
            </div>

            {/* Grid de instalaciones */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {facilities.map((facility, idx) => (
                <div key={idx} className="group">
                  <div className="bg-gradient-to-br from-zinc-900 to-black border border-amber-800/30 rounded-2xl p-8 h-full hover:border-amber-600/50 transition-all duration-300 hover:-translate-y-2">
                    <div className="text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                      <div className="w-12 h-12 bg-amber-900/30 rounded-xl flex items-center justify-center">
                        {facility.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-amber-400 mb-2">{facility.title}</h3>
                    <p className="text-amber-200/60">{facility.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Galería de fotos (placeholder) */}
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-amber-800/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-amber-400 mb-6">Galería de Fotos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div key={item} className="aspect-square bg-gradient-to-br from-amber-900/20 to-zinc-900/50 rounded-xl overflow-hidden border border-amber-700/30 hover:border-amber-600/50 transition-all group cursor-pointer">
                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition">
                      💪
                    </div>
                    {/* Aquí van tus fotos: <img src="/path/to/photo.jpg" alt="Gym" className="w-full h-full object-cover" /> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* CTA flotante */}
      {selectedPlan && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce-slow">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-black px-8 py-4 rounded-full shadow-2xl shadow-amber-600/50 flex items-center space-x-4">
            <Trophy className="w-6 h-6" />
            <span className="font-bold">Plan {plans.find(p => p.id === selectedPlan)?.name} seleccionado</span>
            <button className="bg-black text-amber-400 px-6 py-2 rounded-full font-bold hover:bg-zinc-900 transition">
              Continuar
            </button>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Gym;