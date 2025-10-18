import { useState } from 'react';
import { Coffee, ShoppingCart, X, Plus, Minus, Search, Flame, Star, Clock } from 'lucide-react';

const Cafe = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Datos del menú (Aquí puedes agregar las fotos)
  const menuItems = [
    // DESAYUNOS
    {
      id: 1,
      name: "Warrior Breakfast",
      category: "desayunos",
      price: 8500,
      description: "Huevos revueltos, pan integral, aguacate y proteína",
      image: "/path/to/image.jpg", // AGREGAR TU IMAGEN AQUÍ
      calories: 450,
      protein: "35g",
      popular: true,
      time: "15-20 min"
    },
    {
      id: 2,
      name: "Odin's Oatmeal",
      category: "desayunos",
      price: 5500,
      description: "Avena con frutas, miel y frutos secos",
      image: "/path/to/image.jpg",
      calories: 350,
      protein: "12g",
      time: "10 min"
    },
    {
      id: 3,
      name: "Viking Pancakes",
      category: "desayunos",
      price: 7000,
      description: "Pancakes proteicos con maple y berries",
      image: "/path/to/image.jpg",
      calories: 400,
      protein: "25g",
      time: "15 min"
    },

    // BEBIDAS CALIENTES
    {
      id: 4,
      name: "Espresso Valhalla",
      category: "calientes",
      price: 3000,
      description: "Espresso intenso de origen único",
      image: "/path/to/image.jpg",
      calories: 5,
      time: "5 min"
    },
    {
      id: 5,
      name: "Cappuccino Nórdico",
      category: "calientes",
      price: 4200,
      description: "Cappuccino cremoso con arte latte",
      image: "/path/to/image.jpg",
      calories: 120,
      popular: true,
      time: "8 min"
    },
    {
      id: 6,
      name: "Latte Canela",
      category: "calientes",
      price: 4500,
      description: "Latte suave con toque de canela",
      image: "/path/to/image.jpg",
      calories: 150,
      time: "8 min"
    },

    // BEBIDAS FRÍAS
    {
      id: 7,
      name: "Cold Brew Thor",
      category: "frias",
      price: 4800,
      description: "Café frío de 24h con hielo",
      image: "/path/to/image.jpg",
      calories: 10,
      popular: true,
      time: "3 min"
    },
    {
      id: 8,
      name: "Frappé Protein",
      category: "frias",
      price: 6500,
      description: "Frappé con proteína y chocolate",
      image: "/path/to/image.jpg",
      calories: 280,
      protein: "30g",
      time: "10 min"
    },
    {
      id: 9,
      name: "Smoothie Warrior",
      category: "frias",
      price: 5500,
      description: "Smoothie de frutas tropicales y proteína",
      image: "/path/to/image.jpg",
      calories: 220,
      protein: "20g",
      time: "8 min"
    },

    // COMBOS
    {
      id: 10,
      name: "Combo Gladiador",
      category: "combos",
      price: 12000,
      description: "Desayuno completo + café + jugo natural",
      image: "/path/to/image.jpg",
      calories: 600,
      protein: "40g",
      popular: true,
      time: "20 min"
    },
    {
      id: 11,
      name: "Combo Post-Entreno",
      category: "combos",
      price: 10500,
      description: "Batido proteico + barras energéticas + banana",
      image: "/path/to/image.jpg",
      calories: 450,
      protein: "45g",
      time: "5 min"
    },
    {
      id: 12,
      name: "Combo Vikingo",
      category: "combos",
      price: 15000,
      description: "Brunch completo para dos personas",
      image: "/path/to/image.jpg",
      calories: 1200,
      protein: "70g",
      time: "25 min"
    },

    // SNACKS
    {
      id: 13,
      name: "Protein Bar Casera",
      category: "snacks",
      price: 3500,
      description: "Barra energética hecha en casa",
      image: "/path/to/image.jpg",
      calories: 250,
      protein: "18g",
      time: "Inmediato"
    },
    {
      id: 14,
      name: "Tostadas de Aguacate",
      category: "snacks",
      price: 5000,
      description: "Pan integral con aguacate y semillas",
      image: "/path/to/image.jpg",
      calories: 320,
      protein: "12g",
      time: "10 min"
    },
    {
      id: 15,
      name: "Bowl de Frutas",
      category: "snacks",
      price: 4500,
      description: "Frutas frescas de estación con yogurt",
      image: "/path/to/image.jpg",
      calories: 180,
      protein: "8g",
      time: "5 min"
    }
  ];

  const categories = [
    { id: 'todos', name: 'Todo el Menú', icon: '🍽️' },
    { id: 'desayunos', name: 'Desayunos', icon: '🍳' },
    { id: 'calientes', name: 'Bebidas Calientes', icon: '☕' },
    { id: 'frias', name: 'Bebidas Frías', icon: '🧊' },
    { id: 'combos', name: 'Combos', icon: '🎯' },
    { id: 'snacks', name: 'Snacks', icon: '🥑' }
  ];

  // Filtrar items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Funciones del carrito
  const addToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(i => {
      if (i.id === itemId) {
        const newQuantity = i.quantity + change;
        return newQuantity > 0 ? { ...i, quantity: newQuantity } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-amber-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="px-4 py-2 bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition border border-amber-800/50"
              >
                ← Volver
              </button>
              <Coffee className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-2xl font-bold text-amber-400">Valhalla Café</h1>
                <p className="text-sm text-amber-200/60">Energía para guerreros</p>
              </div>
            </div>

            {/* Carrito */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-600/50 transition-all flex items-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Carrito</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/50" />
            <input
              type="text"
              placeholder="Buscar en el menú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-amber-800/30 rounded-xl text-amber-100 placeholder-amber-500/30 focus:outline-none focus:border-amber-600/50 focus:ring-2 focus:ring-amber-600/20"
            />
          </div>
        </div>
      </header>

      {/* Categorías */}
      <div className="sticky top-[140px] z-30 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-md py-4 border-b border-amber-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-black shadow-lg shadow-amber-600/30'
                    : 'bg-zinc-900/50 text-amber-200 border border-amber-800/30 hover:bg-zinc-800/50'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <Coffee className="w-16 h-16 text-amber-600/30 mx-auto mb-4" />
            <p className="text-amber-200/50 text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group relative bg-gradient-to-br from-zinc-900 to-black border border-amber-800/30 rounded-2xl overflow-hidden hover:border-amber-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/30 hover:-translate-y-1"
              >
                {/* Badge popular */}
                {item.popular && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                    <Flame className="w-3 h-3" />
                    <span>Popular</span>
                  </div>
                )}

                {/* Imagen */}
                <div className="relative h-48 bg-gradient-to-br from-amber-900/20 to-orange-900/20 overflow-hidden">
                  {/* Placeholder para la imagen */}
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                    {categories.find(c => c.id === item.category)?.icon}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  
                  {/* Info rápida sobre la imagen */}
                  <div className="absolute bottom-3 left-3 flex space-x-2">
                    {item.protein && (
                      <span className="bg-amber-600/90 text-black px-2 py-1 rounded-md text-xs font-bold">
                        {item.protein} proteína
                      </span>
                    )}
                    <span className="bg-black/70 text-amber-400 px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-amber-400 mb-2 group-hover:text-amber-300 transition">
                    {item.name}
                  </h3>
                  <p className="text-amber-200/60 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Info nutricional */}
                  <div className="flex items-center space-x-4 text-xs text-amber-300/50 mb-4">
                    <span>{item.calories} cal</span>
                    {item.protein && <span>•</span>}
                    {item.protein && <span>{item.protein}</span>}
                  </div>

                  {/* Precio y botón */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-amber-500">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-600/30 transition-all flex items-center space-x-2 group"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>

                {/* Efecto hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/5 to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Panel del carrito */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-black/95 backdrop-blur-xl border-l border-amber-900/30 transform transition-transform duration-300 z-50 ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header del carrito */}
          <div className="p-6 border-b border-amber-900/30">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-amber-400 flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6" />
                <span>Tu Pedido</span>
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-amber-900/20 rounded-lg transition"
              >
                <X className="w-6 h-6 text-amber-400" />
              </button>
            </div>
            <p className="text-amber-200/50 text-sm">
              {cart.length === 0 ? 'Tu carrito está vacío' : `${cart.reduce((sum, item) => sum + item.quantity, 0)} productos`}
            </p>
          </div>

          {/* Items del carrito */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="w-16 h-16 text-amber-600/20 mx-auto mb-4" />
                <p className="text-amber-200/40">Agrega productos al carrito</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-zinc-900/50 border border-amber-800/30 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-400 mb-1">{item.name}</h3>
                      <p className="text-amber-200/50 text-sm">${item.price.toLocaleString()} c/u</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 bg-black/50 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 hover:bg-amber-900/30 rounded transition"
                      >
                        <Minus className="w-4 h-4 text-amber-400" />
                      </button>
                      <span className="text-amber-300 font-bold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 hover:bg-amber-900/30 rounded transition"
                      >
                        <Plus className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>
                    <span className="text-lg font-bold text-amber-500">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer del carrito */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-amber-900/30 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-amber-200/70">
                  <span>Subtotal</span>
                  <span>${getTotalPrice().toLocaleString()}</span>
                </div>
                {/* <div className="flex justify-between text-amber-200/70">
                  <span>Descuento miembro</span>
                  <span className="text-green-400">-10%</span>
                </div> */}
                <div className="h-px bg-amber-800/30"></div>
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-amber-400">Total</span>
                  <span className="text-amber-500">${(getTotalPrice()/*  * 0.9 */).toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-600/50 transition-all flex items-center justify-center space-x-2">
                <span>Confirmar Pedido</span>
                <Star className="w-5 h-5" />
              </button>
              <p className="text-center text-amber-200/40 text-xs">
                Recoge tu pedido en 15-30 minutos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay del carrito */}
      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        ></div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Cafe;