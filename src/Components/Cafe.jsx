import { useState, useEffect } from 'react';
import { Coffee, ShoppingCart, X, Plus, Minus, Flame, Star, Clock, Leaf, Zap, Bell, CreditCard, DollarSign, Check, AlertCircle, Users, LogOut } from 'lucide-react';

const Cafe = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('fitness');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Estados para mesa y sesión
  const [tableNumber, setTableNumber] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [showTableModal, setShowTableModal] = useState(true);
  const [tempTableInput, setTempTableInput] = useState('');
  const [tempNameInput, setTempNameInput] = useState('');
  const [tableInfo, setTableInfo] = useState(null);
  const [showJoinOptions, setShowJoinOptions] = useState(false);
  
  // Estados para pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  
  // Estados para notificaciones
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState(null);
  const [showNotificationFeedback, setShowNotificationFeedback] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Generar ID único para sesión
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

// Verificar estado de la mesa
  const checkTableStatus = async (tableNum) => {
    try {
      const result = await window.storage.get(`table_${tableNum}_info`, true);
      console.log('✅ Mesa encontrada:', tableNum, result);
      if (result && result.value) {
        return JSON.parse(result.value);
      }
      return null;
    } catch (error) {
      // Si la clave no existe, window.storage.get lanza un error
      console.log(`ℹ️ Mesa ${tableNum} no existe (normal si es nueva)`);
      return null;
    }
  };

 // Crear nueva mesa
  const createNewTable = async (tableNum, name) => {
    console.log('🔨 Creando nueva mesa:', tableNum, name);
    const newSessionId = generateSessionId();
    const tableData = {
      tableNumber: tableNum,
      createdAt: Date.now(),
      expiresAt: Date.now() + (3 * 60 * 60 * 1000), // 3 horas
      mainSession: {
        id: newSessionId,
        name: name || 'Principal',
        isOwner: true
      },
      sessions: [{
        id: newSessionId,
        name: name || 'Principal',
        isOwner: true,
        joinedAt: Date.now()
      }],
      status: 'active'
    };

    try {
      await window.storage.set(`table_${tableNum}_info`, JSON.stringify(tableData), true);
      console.log('✅ Mesa creada exitosamente');
      
      // VERIFICAR que se guardó
      const verification = await window.storage.get(`table_${tableNum}_info`, true);
      console.log('🔍 Verificación de guardado:', verification);
      
      setTableNumber(tableNum);
      setSessionId(newSessionId);
      setSessionName(name || 'Principal');
      setTableInfo(tableData);
      setShowTableModal(false);
    } catch (error) {
      console.error('❌ Error al crear la mesa:', error);
      alert('Error al crear la mesa. Intenta nuevamente.');
    }
  };

 // Unirse a mesa existente
  const joinExistingTable = async (tableNum, name) => {
    console.log('👥 Uniéndose a mesa existente:', tableNum);
    const existingTable = await checkTableStatus(tableNum);
    if (!existingTable) {
      alert('La mesa ya no está disponible.');
      return;
    }

    const newSessionId = generateSessionId();
    const updatedTable = {
      ...existingTable,
      sessions: [
        ...existingTable.sessions,
        {
          id: newSessionId,
          name: name || `Invitado ${existingTable.sessions.length}`,
          isOwner: false,
          joinedAt: Date.now()
        }
      ]
    };

    try {
      await window.storage.set(`table_${tableNum}_info`, JSON.stringify(updatedTable), true);
      console.log('✅ Unido a mesa exitosamente');
      
      // VERIFICAR que se guardó
      const verification = await window.storage.get(`table_${tableNum}_info`, true);
      console.log('🔍 Verificación:', verification);
      
      setTableNumber(tableNum);
      setSessionId(newSessionId);
      setSessionName(name || `Invitado ${existingTable.sessions.length}`);
      setTableInfo(updatedTable);
      setShowTableModal(false);
    } catch (error) {
      console.error('❌ Error al unirse a la mesa:', error);
      alert('Error al unirse a la mesa. Intenta nuevamente.');
    }
  };

  // Manejar selección de mesa
  const handleTableSubmit = async () => {
    if (!tempTableInput.trim()) return;

    const tableNum = tempTableInput.trim();
    const existing = await checkTableStatus(tableNum);

    if (existing) {
      // Mesa existe - mostrar opciones
      setTableInfo(existing);
      setShowJoinOptions(true);
    } else {
      // Mesa nueva - crear directamente
      await createNewTable(tableNum, tempNameInput.trim());
    }
  };
  

  // Liberar mesa (solo dueño)
  const handleReleaseTable = async () => {
    const isOwner = tableInfo?.sessions.find(s => s.id === sessionId)?.isOwner;
    if (!isOwner) {
      alert('Solo el creador de la mesa puede liberarla.');
      return;
    }

    const confirmRelease = window.confirm(
      '¿Estás seguro de liberar la mesa?\n\nEsto cerrará la sesión para todos los participantes.'
    );

    if (confirmRelease) {
      try {
        await window.storage.delete(`table_${tableNumber}_info`, true);
        // Limpiar estado y volver al inicio
        setTableNumber(null);
        setSessionId(null);
        setSessionName('');
        setTableInfo(null);
        setCart([]);
        setShowTableModal(true);
      } catch (error) {
        alert('Error al liberar la mesa.');
      }
    }
  };

  // Cargar última notificación del storage
  useEffect(() => {
    const loadLastNotification = async () => {
      if (!tableNumber || !sessionId) return;
      try {
        const result = await window.storage.get(`notification_time_${tableNumber}_${sessionId}`);
        if (result) {
          setLastNotificationTime(parseInt(result.value));
        }
      } catch (error) {
        console.log('No hay notificaciones previas');
      }
    };
    loadLastNotification();
  }, [tableNumber, sessionId]);

  // Datos del menú
  const menuItems = [
    // MENÚ FITNESS
    {
      id: 1,
      name: "Warrior Breakfast",
      mainCategory: "fitness",
      subCategory: "Desayuno",
      price: 8500,
      description: "Huevos revueltos, pan integral, aguacate y proteína",
      calories: 450,
      protein: "35g",
      popular: true,
      time: "15-20 min"
    },
    {
      id: 2,
      name: "Odin's Oatmeal",
      mainCategory: "fitness",
      subCategory: "Desayuno",
      price: 5500,
      description: "Avena con frutas, miel y frutos secos",
      calories: 350,
      protein: "12g",
      time: "10 min"
    },
    {
      id: 3,
      name: "Protein Bowl",
      mainCategory: "fitness",
      subCategory: "Bowl",
      price: 7500,
      description: "Quinoa, pollo grillado, vegetales asados y aguacate",
      calories: 520,
      protein: "42g",
      popular: true,
      time: "12 min"
    },
    {
      id: 4,
      name: "Green Power Smoothie",
      mainCategory: "fitness",
      subCategory: "Bebida",
      price: 5500,
      description: "Espinaca, banana, proteína vegetal y almendras",
      calories: 280,
      protein: "25g",
      time: "5 min"
    },
    {
      id: 5,
      name: "Cold Brew Protein",
      mainCategory: "fitness",
      subCategory: "Bebida",
      price: 5800,
      description: "Café frío con shot de proteína whey",
      calories: 150,
      protein: "30g",
      time: "3 min"
    },
    {
      id: 6,
      name: "Chicken Wrap Integral",
      mainCategory: "fitness",
      subCategory: "Wrap",
      price: 6800,
      description: "Wrap integral con pollo, vegetales frescos y hummus",
      calories: 420,
      protein: "38g",
      time: "10 min"
    },
    {
      id: 7,
      name: "Energy Protein Bar",
      mainCategory: "fitness",
      subCategory: "Snack",
      price: 3500,
      description: "Barra casera con dátiles, avena y proteína",
      calories: 250,
      protein: "18g",
      time: "Inmediato"
    },
    {
      id: 8,
      name: "Post-Workout Shake",
      mainCategory: "fitness",
      subCategory: "Bebida",
      price: 6200,
      description: "Batido con banana, mantequilla de maní y proteína",
      calories: 380,
      protein: "35g",
      popular: true,
      time: "5 min"
    },
    // MENÚ DESPREOCUPADO
    {
      id: 9,
      name: "Cappuccino Nórdico",
      mainCategory: "despreocupado",
      subCategory: "Café Caliente",
      price: 4200,
      description: "Cappuccino cremoso con arte latte",
      calories: 120,
      popular: true,
      time: "8 min"
    },
    {
      id: 10,
      name: "Latte Caramelo",
      mainCategory: "despreocupado",
      subCategory: "Café Caliente",
      price: 4800,
      description: "Latte suave con sirope de caramelo y crema",
      calories: 280,
      time: "8 min"
    },
    {
      id: 11,
      name: "Viking Pancakes",
      mainCategory: "despreocupado",
      subCategory: "Desayuno",
      price: 7000,
      description: "Pancakes con maple, mantequilla y berries",
      calories: 580,
      time: "15 min"
    },
    {
      id: 12,
      name: "Chocolate Cookies",
      mainCategory: "despreocupado",
      subCategory: "Postre",
      price: 3800,
      description: "Galletas artesanales con chips de chocolate",
      calories: 320,
      popular: true,
      time: "Inmediato"
    },
    {
      id: 13,
      name: "Frappé Chocolate",
      mainCategory: "despreocupado",
      subCategory: "Bebida Fría",
      price: 6500,
      description: "Frappé cremoso con chocolate belga y crema",
      calories: 420,
      time: "10 min"
    },
    {
      id: 14,
      name: "Brownie Casero",
      mainCategory: "despreocupado",
      subCategory: "Postre",
      price: 4500,
      description: "Brownie tibio con helado de vainilla",
      calories: 480,
      time: "5 min"
    },
    {
      id: 15,
      name: "Croissant Gourmet",
      mainCategory: "despreocupado",
      subCategory: "Panadería",
      price: 4200,
      description: "Croissant relleno de jamón y queso gratinado",
      calories: 380,
      time: "10 min"
    },
    {
      id: 16,
      name: "Smoothie Frutal",
      mainCategory: "despreocupado",
      subCategory: "Bebida Fría",
      price: 5500,
      description: "Smoothie de frutas tropicales con yogurt griego",
      calories: 320,
      time: "8 min"
    },
    {
      id: 17,
      name: "Tostadas Francesas",
      mainCategory: "despreocupado",
      subCategory: "Desayuno",
      price: 6200,
      description: "Tostadas con canela, miel y frutas frescas",
      calories: 450,
      time: "12 min"
    },
    {
      id: 18,
      name: "Espresso Doble",
      mainCategory: "despreocupado",
      subCategory: "Café Caliente",
      price: 3500,
      description: "Espresso intenso de origen único",
      calories: 10,
      time: "5 min"
    }
  ];

  const categories = [
    { 
      id: 'fitness', 
      name: 'Menú Fitness', 
      icon: <Zap className="w-5 h-5" />,
      color: 'from-green-600 to-emerald-600',
      description: 'Alto en proteínas y nutrientes'
    },
    { 
      id: 'despreocupado', 
      name: 'Menú Despreocupado', 
      icon: <Coffee className="w-5 h-5" />,
      color: 'from-amber-600 to-orange-600',
      description: 'Para disfrutar sin límites'
    }
  ];

  const filteredItems = menuItems.filter(item => item.mainCategory === selectedCategory);

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

  const getSubCategoryColor = (mainCat) => {
    return mainCat === 'fitness' 
      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
      : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
    setIsCartOpen(false);
  };

    const handleConfirmOrder = async () => {
    if (!paymentMethod) return;

    console.log('📦 Confirmando pedido...');
    const order = {
      tableNumber,
      sessionId,
      sessionName,
      items: cart,
      total: getTotalPrice(),
      paymentMethod,
      timestamp: Date.now(),
      status: 'pendiente'
    };

    try {
      const orderId = `order_${tableNumber}_${sessionId}_${Date.now()}`;
      console.log('💾 Guardando pedido con ID:', orderId);
      console.log('📋 Datos del pedido:', order);
      
      await window.storage.set(orderId, JSON.stringify(order), true);
      
      // VERIFICAR que se guardó correctamente
      const verify = await window.storage.get(orderId, true);
      console.log('✅ Pedido guardado y verificado:', verify);

      alert(`¡Pedido confirmado! 🎉\n\n${sessionName}\nMesa: ${tableNumber}\nTotal: $${getTotalPrice().toLocaleString()}\nPago: ${paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo'}\n\nTu pedido llegará pronto.`);

      setCart([]);
      setPaymentMethod(null);
      setShowPaymentModal(false);
    } catch (error) {
      console.error('❌ Error al confirmar el pedido:', error);
      alert('Error al confirmar el pedido. Por favor intenta nuevamente.');
    }
  };

  const canSendNotification = () => {
    if (!lastNotificationTime) return true;
    const tenMinutes = 10 * 60 * 1000;
    return (Date.now() - lastNotificationTime) >= tenMinutes;
  };

   const handleSendNotification = async (type) => {
    if (!canSendNotification()) {
      const remainingTime = Math.ceil((10 * 60 * 1000 - (Date.now() - lastNotificationTime)) / 60000);
      alert(`⏰ Debes esperar ${remainingTime} minuto(s) antes de enviar otra notificación.`);
      return;
    }

    console.log('🔔 Enviando notificación:', type);
    const notification = {
      tableNumber,
      sessionId,
      sessionName,
      type,
      timestamp: Date.now(),
      status: 'pendiente'
    };

    try {
      const notificationId = `notification_${tableNumber}_${sessionId}_${Date.now()}`;
      console.log('💾 Guardando notificación con ID:', notificationId);
      
      await window.storage.set(notificationId, JSON.stringify(notification), true);
      
      // VERIFICAR que se guardó
      const verify = await window.storage.get(notificationId, true);
      console.log('✅ Notificación guardada y verificada:', verify);
      
      const currentTime = Date.now();
      await window.storage.set(`notification_time_${tableNumber}_${sessionId}`, currentTime.toString(), true);
      setLastNotificationTime(currentTime);

      setNotificationMessage(
        type === 'bill' 
          ? '✅ Solicitud de cuenta enviada. En breve te atenderemos.' 
          : '✅ El mozo/a fue notificado. Llegará en un momento.'
      );
      setShowNotificationFeedback(true);
      setShowBellMenu(false);

      setTimeout(() => {
        setShowNotificationFeedback(false);
      }, 5000);

    } catch (error) {
      console.error('❌ Error al enviar la notificación:', error);
      alert('Error al enviar la notificación. Por favor intenta nuevamente.');
    }
  };

  const isOwner = tableInfo?.sessions.find(s => s.id === sessionId)?.isOwner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-amber-950">
      {/* Modal de selección/unión de mesa */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-600 rounded-2xl p-8 max-w-md w-full">
            {!showJoinOptions ? (
              <>
                <div className="text-center mb-6">
                  <Coffee className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-amber-400 mb-2">Bienvenido a Valhalla Café</h2>
                  <p className="text-amber-200/70">Indica tu mesa para comenzar</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-amber-300 text-sm font-semibold mb-2">
                      Número de Mesa
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 5"
                      value={tempTableInput}
                      onChange={(e) => setTempTableInput(e.target.value)}
                      className="w-full px-4 py-4 bg-zinc-900/50 border-2 border-amber-700/50 rounded-xl text-amber-100 text-center text-2xl font-bold placeholder-amber-500/30 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 text-sm font-semibold mb-2">
                      Tu Nombre (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Juan"
                      value={tempNameInput}
                      onChange={(e) => setTempNameInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTableSubmit()}
                      className="w-full px-4 py-3 bg-zinc-900/50 border-2 border-amber-700/50 rounded-xl text-amber-100 placeholder-amber-500/30 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleTableSubmit}
                  disabled={!tempTableInput.trim()}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-amber-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>

                <p className="text-center text-amber-200/40 text-xs mt-4">
                  💡 Si alguien ya está en tu mesa, podrás unirte
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <Users className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-amber-400 mb-2">Mesa {tempTableInput} en uso</h2>
                  <p className="text-amber-200/70">¿Qué deseas hacer?</p>
                </div>

                <div className="bg-zinc-900/50 border border-amber-700/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-300 font-semibold">Personas en la mesa:</span>
                    <span className="text-amber-500 font-bold">{tableInfo?.sessions.length || 0}</span>
                  </div>
                  <div className="space-y-1">
                    {tableInfo?.sessions.map((session, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-amber-200/70">
                        <span>👤</span>
                        <span>{session.name}</span>
                        {session.isOwner && (
                          <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded-full">
                            Anfitrión
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => joinExistingTable(tempTableInput, tempNameInput.trim())}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-green-600/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <Users className="w-5 h-5" />
                    <span>Unirme a esta Mesa</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowJoinOptions(false);
                      setTempTableInput('');
                      setTableInfo(null);
                    }}
                    className="w-full py-4 bg-zinc-900/50 text-amber-400 border-2 border-amber-700/50 rounded-xl font-bold hover:bg-zinc-800/50 transition-all"
                  >
                    Elegir Otra Mesa
                  </button>
                </div>

                <p className="text-center text-amber-200/40 text-xs mt-4">
                  Al unirte, tendrás tu propio carrito independiente
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de método de pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-600 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-400">Método de Pago</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-amber-900/20 rounded-lg transition"
              >
                <X className="w-6 h-6 text-amber-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`w-full p-6 rounded-xl border-2 transition-all ${
                  paymentMethod === 'transfer'
                    ? 'bg-amber-600/20 border-amber-600'
                    : 'bg-zinc-900/50 border-amber-700/30 hover:border-amber-600/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <CreditCard className="w-8 h-8 text-amber-500" />
                    <div className="text-left">
                      <div className="text-lg font-bold text-amber-400">Transferencia</div>
                      <div className="text-sm text-amber-200/60">Alias o CBU</div>
                    </div>
                  </div>
                  {paymentMethod === 'transfer' && (
                    <Check className="w-6 h-6 text-green-400" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('cash')}
                className={`w-full p-6 rounded-xl border-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-600/20 border-amber-600'
                    : 'bg-zinc-900/50 border-amber-700/30 hover:border-amber-600/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <DollarSign className="w-8 h-8 text-amber-500" />
                    <div className="text-left">
                      <div className="text-lg font-bold text-amber-400">Efectivo</div>
                      <div className="text-sm text-amber-200/60">Pagar en el mostrador</div>
                    </div>
                  </div>
                  {paymentMethod === 'cash' && (
                    <Check className="w-6 h-6 text-green-400" />
                  )}
                </div>
              </button>
            </div>

            <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-lg">
                <span className="text-amber-200">Total a pagar:</span>
                <span className="font-bold text-amber-400">${getTotalPrice().toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={!paymentMethod}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-green-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>Confirmar Pedido</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback de notificación */}
      {showNotificationFeedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl shadow-green-600/50 flex items-center space-x-3">
            <Check className="w-6 h-6" />
            <span className="font-semibold">{notificationMessage}</span>
          </div>
        </div>
      )}

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
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-amber-200/60">Mesa {tableNumber}</p>
                  <span className="text-amber-500/40">•</span>
                  <p className="text-sm text-amber-200/60">{sessionName}</p>
                  {isOwner && (
                    <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded-full">
                      Anfitrión
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Botón de liberar mesa (solo para dueño) */}
              {isOwner && (
                <button
                  onClick={handleReleaseTable}
                  className="p-3 bg-red-900/30 text-red-400 rounded-xl hover:bg-red-900/50 transition border border-red-800/50"
                  title="Liberar mesa"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}

              {/* Botón de campana */}
              <div className="relative">
                <button
                  onClick={() => setShowBellMenu(!showBellMenu)}
                  className="relative p-3 bg-amber-900/30 text-amber-400 rounded-xl hover:bg-amber-900/50 transition border border-amber-800/50"
                >
                  <Bell className="w-6 h-6" />
                  {!canSendNotification() && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Menú de campana */}
                {showBellMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-amber-700/50 rounded-xl shadow-2xl overflow-hidden">
                    <button
                      onClick={() => handleSendNotification('bill')}
                      className="w-full p-4 text-left hover:bg-amber-900/20 transition border-b border-amber-700/30"
                    >
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-amber-500" />
                        <div>
                          <div className="font-bold text-amber-400">Pedir la Cuenta</div>
                          <div className="text-xs text-amber-200/50">Solicitar factura</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSendNotification('waiter')}
                      className="w-full p-4 text-left hover:bg-amber-900/20 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-amber-500" />
                        <div>
                          <div className="font-bold text-amber-400">Llamar Mozo/a</div>
                          <div className="text-xs text-amber-200/50">Asistencia general</div>
                        </div>
                      </div>
                    </button>
                    {!canSendNotification() && (
                      <div className="p-3 bg-red-900/20 border-t border-red-700/30">
                        <div className="flex items-center space-x-2 text-xs text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>Espera {Math.ceil((10 * 60 * 1000 - (Date.now() - lastNotificationTime)) / 60000)} min</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
          </div>
        </div>
      </header>

      {/* Categorías Principales */}
      <div className="sticky top-[72px] z-30 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-md py-6 border-b border-amber-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative p-6 rounded-2xl font-semibold transition-all duration-300 overflow-hidden group ${
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-2xl scale-105`
                    : 'bg-zinc-900/50 text-amber-200 border-2 border-amber-800/30 hover:bg-zinc-800/50 hover:border-amber-600/50'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 ${
                  selectedCategory === cat.id ? 'translate-x-full' : '-translate-x-full'
                } group-hover:translate-x-full transition-transform duration-1000`}></div>
                
                <div className="relative flex items-center justify-center space-x-3">
                  {cat.icon}
                  <div className="text-left">
                    <div className="text-xl font-bold">{cat.name}</div>
                    <div className={`text-xs ${selectedCategory === cat.id ? 'text-white/80' : 'text-amber-200/50'}`}>
                      {cat.description}
                    </div>
                  </div>
                </div>

                {selectedCategory === cat.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"></div>
                )}
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
                {item.popular && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                    <Flame className="w-3 h-3" />
                    <span>Popular</span>
                  </div>
                )}

                <div className="relative h-48 bg-gradient-to-br from-amber-900/20 to-orange-900/20 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                    {item.mainCategory === 'fitness' ? '🥗' : '☕'}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getSubCategoryColor(item.mainCategory)}`}>
                      {item.subCategory}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 flex space-x-2">
                    {item.protein && (
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        item.mainCategory === 'fitness' 
                          ? 'bg-green-600/90 text-white' 
                          : 'bg-amber-600/90 text-black'
                      }`}>
                        {item.protein} proteína
                      </span>
                    )}
                    <span className="bg-black/70 text-amber-400 px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-amber-400 mb-2 group-hover:text-amber-300 transition">
                    {item.name}
                  </h3>
                  <p className="text-amber-200/60 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-amber-300/50 mb-4">
                    <span>{item.calories} cal</span>
                    {item.protein && (
                      <>
                        <span>•</span>
                        <span>{item.protein}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-amber-500">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className={`px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2 ${
                        item.mainCategory === 'fitness'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-green-600/30'
                          : 'bg-gradient-to-r from-amber-600 to-orange-600 text-black hover:shadow-amber-600/30'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>

                <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-30 transition-opacity">
                  {item.mainCategory === 'fitness' ? (
                    <Leaf className="w-8 h-8 text-green-500" />
                  ) : (
                    <Coffee className="w-8 h-8 text-amber-500" />
                  )}
                </div>
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
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-amber-400">{item.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSubCategoryColor(item.mainCategory)}`}>
                          {item.subCategory}
                        </span>
                      </div>
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

          {cart.length > 0 && (
            <div className="p-6 border-t border-amber-900/30 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-amber-200/70">
                  <span>Subtotal</span>
                  <span>${getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="h-px bg-amber-800/30"></div>
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-amber-400">Total</span>
                  <span className="text-amber-500">${getTotalPrice().toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleProceedToPayment}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-600/50 transition-all flex items-center justify-center space-x-2"
              >
                <span>Confirmar Pedido</span>
                <Star className="w-5 h-5" />
              </button>
              <p className="text-center text-amber-200/40 text-xs">
                {sessionName} • Mesa {tableNumber} • 15-30 min
              </p>
            </div>
          )}
        </div>
      </div>

      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        ></div>
      )}

      {showBellMenu && (
        <div
          onClick={() => setShowBellMenu(false)}
          className="fixed inset-0 z-30"
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
        @keyframes slide-down {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Cafe;