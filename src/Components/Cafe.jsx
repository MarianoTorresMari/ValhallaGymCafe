import { useState, useEffect } from 'react';
import { Coffee, ShoppingCart, X, Plus, Minus, Flame, Star, Bell, CreditCard, DollarSign, Check, AlertCircle, Users, User, LogOut, Snowflake, GlassWater, Beer, Sandwich, Pizza } from 'lucide-react';
import swal from '../utils/swal';
import {
  getTable,
  setTable,
  deleteTable,
  subscribeToTable,
  createOrder,
  createNotification,
  getLocal,
  setLocal,
  subscribeToMenu
} from '../services/storageService';

const Cafe = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('Infusiones Calientes');
  const [cart, setCart] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
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
  const [tableDeactivated, setTableDeactivated] = useState(false);

  // Estados para pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Estado para animación de carrito
  const [cartBounce, setCartBounce] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [lastAddedId, setLastAddedId] = useState(null);

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
      const data = await getTable(tableNum);
      return data || null;
    } catch (error) {
      console.log(`Mesa ${tableNum} no existe (normal si es nueva)`);
      return null;
    }
  };

  // Crear nueva mesa
  const createNewTable = async (tableNum, name) => {
    const newSessionId = generateSessionId();
    const tableData = {
      tableNumber: tableNum,
      createdAt: Date.now(),
      expiresAt: Date.now() + (3 * 60 * 60 * 1000),
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
      await setTable(tableNum, tableData);
      setTableNumber(tableNum);
      setSessionId(newSessionId);
      setSessionName(name || 'Principal');
      setTableInfo(tableData);
      setShowTableModal(false);
    } catch (error) {
      console.error('Error al crear la mesa:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Error al crear la mesa. Intenta nuevamente.' });
    }
  };

  // Unirse a mesa existente
  const joinExistingTable = async (tableNum, name) => {
    const existingTable = await checkTableStatus(tableNum);
    if (!existingTable) {
      swal.fire({ icon: 'error', title: 'Error', text: 'La mesa ya no está disponible.' });
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
      await setTable(tableNum, updatedTable);
      setTableNumber(tableNum);
      setSessionId(newSessionId);
      setSessionName(name || `Invitado ${existingTable.sessions.length}`);
      setTableInfo(updatedTable);
      setShowTableModal(false);
    } catch (error) {
      console.error('Error al unirse a la mesa:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Error al unirse a la mesa. Intenta nuevamente.' });
    }
  };

  // Manejar selección de mesa
  const handleTableSubmit = async () => {
    if (!tempTableInput.trim()) return;

    const tableNum = tempTableInput.trim();
    const existing = await checkTableStatus(tableNum);

    if (existing) {
      setTableInfo(existing);
      setShowJoinOptions(true);
    } else {
      await createNewTable(tableNum, tempNameInput.trim());
    }
  };

  // Liberar mesa (solo dueño)
  const handleReleaseTable = async () => {
    const isOwnerSession = tableInfo?.sessions?.find(s => s.id === sessionId)?.isOwner;
    if (!isOwnerSession) {
      swal.fire({ icon: 'error', title: 'Error', text: 'Solo el creador de la mesa puede liberarla.' });
      return;
    }

    const result = await swal.fire({
      icon: 'warning',
      title: '¿Liberar la mesa?',
      text: 'Esto cerrará la sesión para todos los participantes.',
      showCancelButton: true,
      confirmButtonText: 'Sí, liberar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteTable(tableNumber);
        setTableNumber(null);
        setSessionId(null);
        setSessionName('');
        setTableInfo(null);
        setCart([]);
        setShowTableModal(true);
      } catch (error) {
        swal.fire({ icon: 'error', title: 'Error', text: 'Error al liberar la mesa.' });
      }
    }
  };

  // Cargar última notificación del localStorage
  useEffect(() => {
    if (!tableNumber || !sessionId) return;
    const saved = getLocal(`notification_time_${tableNumber}_${sessionId}`);
    if (saved) {
      setLastNotificationTime(parseInt(saved));
    }
  }, [tableNumber, sessionId]);

  // Suscribirse al estado de la mesa en tiempo real (reemplaza polling de 5s)
  useEffect(() => {
    if (!tableNumber || !sessionId) return;

    const unsubscribe = subscribeToTable(tableNumber, (data) => {
      if (!data || data.status === 'deactivated') {
        setTableDeactivated(true);
      } else {
        setTableInfo(data);
      }
    });

    return () => unsubscribe();
  }, [tableNumber, sessionId]);

  // Suscripción al menú de Firestore
  useEffect(() => {
    const unsub = subscribeToMenu(setMenuItems);
    return () => unsub();
  }, []);

  const categories = [
    { id: 'Infusiones Calientes', name: 'Calientes',    icon: <Flame className="w-5 h-5" /> },
    { id: 'Infusiones Frías',     name: 'Frías',        icon: <Snowflake className="w-5 h-5" /> },
    { id: 'Batidos y Limonadas',  name: 'Batidos',      icon: <GlassWater className="w-5 h-5" /> },
    { id: 'Tostados y Dulces',    name: 'Tostados',     icon: <Coffee className="w-5 h-5" /> },
    { id: 'Bebidas',              name: 'Bebidas',       icon: <Beer className="w-5 h-5" /> },
    { id: 'Hamburguesas',         name: 'Hamburguesas', icon: <Sandwich className="w-5 h-5" /> },
    { id: 'Pizzas',               name: 'Pizzas',        icon: <Pizza className="w-5 h-5" /> },
    { id: 'Sandwiches',           name: 'Sandwiches',   icon: <Sandwich className="w-5 h-5" /> },
    { id: 'Adicionales',          name: 'Adicionales',  icon: <Plus className="w-5 h-5" /> },
  ];

  const filteredItems = menuItems.filter(item => item.available && item.category === selectedCategory);

  const addToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }

    setAddedItemName(item.name);
    setShowAddedFeedback(true);
    setCartBounce(true);
    setLastAddedId(item.id);
    setTimeout(() => setCartBounce(false), 600);
    setTimeout(() => setLastAddedId(null), 600);
    setTimeout(() => setShowAddedFeedback(false), 2000);
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

  const getSubCategoryColor = (category) => {
    if (category?.includes('Infusiones')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (category?.includes('Batido')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (category?.includes('Tostado')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (category?.includes('Hambur')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (category?.includes('Pizza')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (category?.includes('Sandwich')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (category?.includes('Bebida')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
    setIsCartOpen(false);
  };

  const handleConfirmOrder = async () => {
    if (!paymentMethod) return;

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
      await createOrder(orderId, order);

      await swal.fire({
        icon: 'success',
        title: '¡Pedido confirmado!',
        html: `<div style="text-align:left;color:#fbbf24">
          <p><strong>${sessionName}</strong></p>
          <p>Mesa: ${tableNumber}</p>
          <p>Total: $${getTotalPrice().toLocaleString()}</p>
          <p>Pago: ${paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo'}</p>
          <br><p>Tu pedido llegará pronto.</p>
        </div>`
      });

      setCart([]);
      setPaymentMethod(null);
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error al confirmar el pedido:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Error al confirmar el pedido. Por favor intenta nuevamente.' });
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
      swal.fire({ icon: 'warning', title: 'Espera un momento', text: `Debes esperar ${remainingTime} minuto(s) antes de enviar otra notificación.` });
      return;
    }

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
      await createNotification(notificationId, notification);

      const currentTime = Date.now();
      setLocal(`notification_time_${tableNumber}_${sessionId}`, currentTime.toString());
      setLastNotificationTime(currentTime);

      setNotificationMessage(
        type === 'bill'
          ? 'Solicitud de cuenta enviada. En breve te atenderemos.'
          : 'El mozo/a fue notificado. Llegará en un momento.'
      );
      setShowNotificationFeedback(true);
      setShowBellMenu(false);

      setTimeout(() => {
        setShowNotificationFeedback(false);
      }, 5000);

    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Error al enviar la notificación. Por favor intenta nuevamente.' });
    }
  };

  const isOwner = tableInfo?.sessions?.find(s => s.id === sessionId)?.isOwner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-amber-950">
       {/* Modal de mesa desactivada */}
      {tableDeactivated && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-600 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-4">Mesa Desactivada</h2>
              <p className="text-amber-200/70 mb-6">
                La mesa ha sido desactivada y tu sesión ha finalizado.
              </p>
              <button
                onClick={() => {
                  setTableDeactivated(false);
                  setTableNumber(null);
                  setSessionId(null);
                  setSessionName('');
                  setTableInfo(null);
                  setCart([]);
                  setShowTableModal(true);
                }}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-xl font-bold hover:shadow-xl hover:shadow-amber-600/50 transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección/unión de mesa */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-600 rounded-2xl p-8 max-w-md w-full">
           {!showJoinOptions ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={onBack}
                    className="p-2 hover:bg-amber-900/20 rounded-lg transition"
                    title="Volver al inicio"
                  >
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <Coffee className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500" />
                  <div className="w-6"></div>
                </div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">Bienvenido a Valhalla Café</h2>
                  <p className="text-sm sm:text-base text-amber-200/70">Indica tu mesa para comenzar</p>
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
                  Si alguien ya está en tu mesa, podrás unirte
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
                    <span className="text-amber-500 font-bold">{tableInfo?.sessions?.length || 0}</span>
                  </div>
                  <div className="space-y-1">
                    {tableInfo?.sessions?.map((session, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-amber-200/70">
                        <User className="w-3.5 h-3.5 text-amber-500/60 flex-shrink-0" />
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

      {/* Toast de producto agregado */}
      {showAddedFeedback && (
        <div className="fixed top-4 right-4 z-[55] animate-cart-toast">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-black px-5 py-3 rounded-xl shadow-2xl shadow-amber-600/40 flex items-center space-x-2 font-semibold">
            <Check className="w-5 h-5" />
            <span>{addedItemName} agregado</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {/* Fila 1 mobile: Volver + acciones | Desktop: todo en una fila */}
          <div className="flex items-center justify-between py-2 lg:py-4">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <button
                onClick={onBack}
                className="px-3 py-2 bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition border border-amber-800/50 text-sm"
              >
                ← Volver
              </button>
              {/* Info de mesa visible solo en desktop */}
              <div className="hidden lg:flex items-center space-x-3">
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
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {isOwner && (
                <button
                  onClick={handleReleaseTable}
                  className="p-2.5 bg-red-900/30 text-red-400 rounded-xl hover:bg-red-900/50 transition border border-red-800/50"
                  title="Liberar mesa"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowBellMenu(!showBellMenu)}
                  className="relative p-2.5 bg-amber-900/30 text-amber-400 rounded-xl hover:bg-amber-900/50 transition border border-amber-800/50"
                >
                  <Bell className="w-5 h-5" />
                  {!canSendNotification() && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  )}
                </button>

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

              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className={`relative hidden lg:flex px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-600/50 transition-all items-center space-x-2 ${cartBounce ? 'animate-cart-bounce' : ''}`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Carrito</span>
                {cart.length > 0 && (
                  <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold ${cartBounce ? 'animate-cart-ping' : ''}`}>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Fila 2 mobile: título + info mesa (solo visible en mobile) */}
          <div className="lg:hidden flex items-center justify-center space-x-2 pb-2">
            <Coffee className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold text-amber-400">Valhalla Café</h1>
            <span className="text-amber-500/40">·</span>
            <p className="text-sm text-amber-200/60">Mesa {tableNumber}</p>
            <span className="text-amber-500/40">·</span>
            <p className="text-sm text-amber-200/60">{sessionName}</p>
            {isOwner && (
              <span className="text-[10px] bg-amber-600/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                Anfitrión
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Botón flotante del carrito en móvil */}
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className={`lg:hidden fixed bottom-4 right-4 z-40 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-full shadow-2xl shadow-amber-600/50 hover:shadow-amber-600/70 transition-all flex items-center space-x-2 px-5 py-3 ${cartBounce ? 'animate-cart-bounce' : ''}`}
      >
        <ShoppingCart className="w-5 h-5" />
        {cart.length > 0 ? (
          <span className="font-bold text-sm">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} - ${getTotalPrice().toLocaleString()}
          </span>
        ) : (
          <span className="font-bold text-sm">Carrito</span>
        )}
      </button>

      {/* Categorías Principales */}
      <div className="sticky top-[60px] sm:top-[72px] z-30 bg-black/95 backdrop-blur-md border-b border-amber-900/20">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex overflow-x-auto gap-2 scrollbar-hide lg:flex-wrap lg:overflow-visible lg:gap-3 lg:justify-start">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex flex-col items-center justify-center gap-1.5 w-[68px] py-3 rounded-2xl font-semibold transition-all duration-200 lg:w-auto lg:flex-row lg:px-5 lg:py-2.5 lg:gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-b from-amber-500 to-orange-600 lg:bg-gradient-to-r text-black shadow-lg shadow-amber-600/40 scale-105 lg:scale-100'
                    : 'bg-zinc-900/70 text-amber-300/80 border border-amber-900/30 hover:border-amber-600/50 hover:text-amber-200'
                }`}
              >
                <span className="flex-shrink-0">{cat.icon}</span>
                <span className="text-[10px] lg:text-sm leading-tight text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-24 lg:pb-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <Coffee className="w-16 h-16 text-amber-600/30 mx-auto mb-4" />
            <p className="text-amber-200/50 text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group relative bg-gradient-to-br from-zinc-900 to-black border border-amber-800/30 rounded-2xl overflow-hidden hover:border-amber-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/30 hover:-translate-y-1"
              >
                {item?.popular && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                    <Flame className="w-3 h-3" />
                    <span>Popular</span>
                  </div>
                )}

                <div className="relative h-32 bg-gradient-to-br from-amber-900/20 to-orange-900/20 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Coffee className="w-16 h-16 text-amber-400" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getSubCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 flex space-x-2">
                    {item?.protein && (
                      <span className="px-2 py-1 rounded-md text-xs font-bold bg-amber-600/90 text-black">
                        {item.protein} proteína
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-amber-400 mb-2 group-hover:text-amber-300 transition">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-amber-200/60 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      {item.price !== null && item.price !== undefined ? (
                        <>
                          <span className="text-2xl font-bold text-amber-500">
                            {item.priceLabel ? `${item.priceLabel}: ` : ''}${item.price.toLocaleString()}
                          </span>
                          {item.price2 !== null && item.price2 !== undefined && (
                            <div className="text-sm text-amber-400/70 mt-1">
                              + {item.price2Label}: ${item.price2.toLocaleString()}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xl font-bold text-amber-500/70">Consultar</span>
                      )}
                    </div>
                    {item.price !== null && item.price !== undefined && (
                      <button
                        onClick={() => addToCart(item)}
                        className={`px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 text-black hover:shadow-amber-600/30 ${lastAddedId === item.id ? 'animate-btn-added' : ''}`}
                      >
                        {lastAddedId === item.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span>{lastAddedId === item.id ? 'Agregado' : 'Agregar'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Panel del carrito - drawer desde abajo en móvil, sidebar en desktop */}
      <div className={`fixed z-50 bg-black/95 backdrop-blur-xl border-amber-900/30 transform transition-transform duration-300 overflow-hidden
        lg:top-0 lg:right-0 lg:h-full lg:w-[480px] lg:border-l
        max-lg:bottom-0 max-lg:left-0 max-lg:right-0 max-lg:max-h-[60vh] max-lg:rounded-t-2xl max-lg:border-t
        ${isCartOpen ? 'translate-y-0 lg:translate-x-0' : 'max-lg:translate-y-full lg:translate-x-full'}
      `}>
        <div className="flex flex-col h-full max-h-[60vh] lg:max-h-full">
          <div className="p-4 lg:p-6 border-b border-amber-900/30 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl lg:text-2xl font-bold text-amber-400 flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
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

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-10 lg:py-20">
                <ShoppingCart className="w-12 h-12 lg:w-16 lg:h-16 text-amber-600/20 mx-auto mb-4" />
                <p className="text-amber-200/40">Agrega productos al carrito</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-zinc-900/50 border border-amber-800/30 rounded-xl p-3 lg:p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-amber-400 truncate">{item.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold flex-shrink-0 ${getSubCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      <p className="text-amber-200/50 text-sm">${item.price.toLocaleString()} c/u</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 transition flex-shrink-0 ml-2"
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
            <div className="p-4 lg:p-6 border-t border-amber-900/30 space-y-3 lg:space-y-4 flex-shrink-0">
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
        @keyframes cart-bounce {
          0%, 100% { transform: scale(1); }
          30% { transform: scale(1.15); }
          60% { transform: scale(0.95); }
        }
        .animate-cart-bounce {
          animation: cart-bounce 0.5s ease-in-out;
        }
        @keyframes cart-ping {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .animate-cart-ping {
          animation: cart-ping 0.4s ease-in-out;
        }
        @keyframes cart-toast {
          0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
          15% { opacity: 1; transform: translateY(0) scale(1); }
          85% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-10px) scale(0.95); }
        }
        .animate-cart-toast {
          animation: cart-toast 2s ease-in-out forwards;
        }
        @keyframes btn-added {
          0% { transform: scale(1); }
          40% { transform: scale(0.9); }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .animate-btn-added {
          animation: btn-added 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Cafe;
