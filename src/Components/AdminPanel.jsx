import { useState, useEffect } from 'react';
import { Coffee, Bell, ShoppingCart, Users, DollarSign, Check, X, Clock, AlertCircle, RefreshCw, TrendingUp, Eye, CheckCircle, XCircle, LogIn } from 'lucide-react';

const AdminPanel = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('pedidos');
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeNotifications: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Contraseña de admin (en producción debería estar en el backend)
  const ADMIN_PASSWORD = 'valhalla2024';

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('❌ Contraseña incorrecta');
      setPassword('');
    }
  };

// Cargar datos del storage
  const loadData = async () => {
    if (!window.storage) {
      console.error('❌ window.storage no está disponible');
      alert('Error: Sistema de almacenamiento no disponible.');
      setIsRefreshing(false);
      return;
    }
    
    setIsRefreshing(true);
    try {
      console.log('🔄 AdminPanel: Cargando datos del storage...');
      
      // Listar todas las claves compartidas
      const allKeys = await window.storage.list('', true);
      console.log('📋 Keys encontradas:', allKeys);
      
      if (allKeys && allKeys.keys) {
        const ordersList = [];
        const notificationsList = [];
        const tablesMap = new Map();

        for (const key of allKeys.keys) {
          try {
            console.log(`🔍 Procesando key: ${key}`);
            const result = await window.storage.get(key, true);
            
            if (!result || !result.value) {
              console.log(`⚠️ Key ${key} sin valor`);
              continue;
            }

            const data = JSON.parse(result.value);
            console.log(`📦 Datos de ${key}:`, data);

            if (key.startsWith('order_')) {
              ordersList.push({ ...data, id: key });
              console.log('✅ Pedido agregado:', key);
            } else if (key.startsWith('notification_')) {
              notificationsList.push({ ...data, id: key });
              console.log('✅ Notificación agregada:', key);
            } else if (key.startsWith('table_') && key.endsWith('_info')) {
              tablesMap.set(data.tableNumber, data);
              console.log('✅ Mesa agregada:', data.tableNumber);
            }
          } catch (error) {
            console.error(`❌ Error procesando ${key}:`, error);
          }
        }

        // Ordenar por timestamp (más recientes primero)
        ordersList.sort((a, b) => b.timestamp - a.timestamp);
        notificationsList.sort((a, b) => b.timestamp - a.timestamp);

        console.log('📊 Resumen de datos cargados:');
        console.log(`- Pedidos: ${ordersList.length}`);
        console.log(`- Notificaciones: ${notificationsList.length}`);
        console.log(`- Mesas: ${tablesMap.size}`);

        setOrders(ordersList);
        setNotifications(notificationsList);
        setTables(Array.from(tablesMap.values()));

        // Calcular estadísticas
        const pendingOrders = ordersList.filter(o => o.status === 'pendiente').length;
        const totalRevenue = ordersList
          .filter(o => o.status === 'completado')
          .reduce((sum, o) => sum + o.total, 0);
        const activeNotifications = notificationsList.filter(n => n.status === 'pendiente').length;

        setStats({
          totalOrders: ordersList.length,
          pendingOrders,
          totalRevenue,
          activeNotifications
        });

        console.log('✅ Datos cargados exitosamente');
      } else {
        console.log('⚠️ No se encontraron keys');
      }
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
 useEffect(() => {
    if (isAuthenticated) {
      console.log('👤 Usuario autenticado, iniciando carga de datos');
      loadData();
      // Actualizar cada 10 segundos (más frecuente para detectar cambios)
      const interval = setInterval(() => {
        console.log('⏰ Actualización automática de datos');
        loadData();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);
 const handleCompleteOrder = async (orderId) => {
    try {
      console.log('✅ Completando pedido:', orderId);
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        console.error('❌ Pedido no encontrado:', orderId);
        return;
      }

      const updatedOrder = { ...order, status: 'completado', completedAt: Date.now() };
      await window.storage.set(orderId, JSON.stringify(updatedOrder), true);
      console.log('✅ Pedido actualizado a completado');
      await loadData();
    } catch (error) {
      console.error('❌ Error al actualizar el pedido:', error);
      alert('Error al actualizar el pedido');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Seguro que deseas cancelar este pedido?')) return;

    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updatedOrder = { ...order, status: 'cancelado', cancelledAt: Date.now() };
      await window.storage.set(orderId, JSON.stringify(updatedOrder), true);
      await loadData();
    } catch (error) {
      alert('Error al cancelar el pedido');
    }
  };

  const handleAttendNotification = async (notificationId) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      const updatedNotification = { ...notification, status: 'atendido', attendedAt: Date.now() };
      await window.storage.set(notificationId, JSON.stringify(updatedNotification), true);
      await loadData();
    } catch (error) {
      alert('Error al atender la notificación');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getRelativeTime = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `Hace ${hours}h`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pendiente': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'completado': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'cancelado': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'atendido': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    }
  };

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-amber-950 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-600 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Coffee className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-amber-400 mb-2">Panel de Administración</h1>
            <p className="text-amber-200/70">Ingresa la contraseña para acceder</p>
          </div>

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-4 bg-zinc-900/50 border-2 border-amber-700/50 rounded-xl text-amber-100 text-center placeholder-amber-500/30 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 mb-4"
            autoFocus
          />

          <button
            onClick={handleLogin}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-amber-600/50 transition-all flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Ingresar</span>
          </button>

          <button
            onClick={onBack}
            className="w-full mt-4 py-3 bg-zinc-900/50 text-amber-400 border-2 border-amber-700/50 rounded-xl font-bold hover:bg-zinc-800/50 transition-all"
          >
            Volver
          </button>

          <p className="text-center text-amber-200/40 text-xs mt-6">
            💡 Contraseña de prueba: valhalla2024
          </p>
        </div>
      </div>
    );
  }

  // Panel principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-amber-950">
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
              <Coffee className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-2xl font-bold text-amber-400">Panel de Administración</h1>
                <p className="text-sm text-amber-200/60">Gestión de pedidos y notificaciones</p>
              </div>
            </div>

            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="px-4 py-2 bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition border border-amber-800/50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-amber-800/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold text-amber-400">{stats.totalOrders}</span>
            </div>
            <p className="text-amber-200/70 text-sm">Pedidos Totales</p>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-black border border-orange-800/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold text-orange-400">{stats.pendingOrders}</span>
            </div>
            <p className="text-orange-200/70 text-sm">Pedidos Pendientes</p>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-black border border-green-800/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold text-green-400">${(stats.totalRevenue / 1000).toFixed(0)}k</span>
            </div>
            <p className="text-green-200/70 text-sm">Ingresos Totales</p>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-black border border-red-800/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-bold text-red-400">{stats.activeNotifications}</span>
            </div>
            <p className="text-red-200/70 text-sm">Notificaciones Activas</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-2 border-b border-amber-800/30">
          {[
            { id: 'pedidos', label: 'Pedidos', icon: <ShoppingCart className="w-4 h-4" />, count: stats.pendingOrders },
            { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="w-4 h-4" />, count: stats.activeNotifications },
            { id: 'mesas', label: 'Mesas Activas', icon: <Users className="w-4 h-4" />, count: tables.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all relative flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'text-amber-400 border-b-2 border-amber-600'
                  : 'text-amber-200/50 hover:text-amber-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-amber-800/30">
                <ShoppingCart className="w-16 h-16 text-amber-600/30 mx-auto mb-4" />
                <p className="text-amber-200/50 text-lg">No hay pedidos registrados</p>
              </div>
            ) : (
              orders.map(order => (
                <div
                  key={order.id}
                  className="bg-gradient-to-br from-zinc-900 to-black border border-amber-800/30 rounded-xl p-6 hover:border-amber-600/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-amber-400">Mesa {order.tableNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                        <span className="text-amber-200/50 text-sm">{getRelativeTime(order.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-amber-200/70">
                        <Users className="w-4 h-4" />
                        <span>{order.sessionName}</span>
                        <span>•</span>
                        <span>{formatTime(order.timestamp)}</span>
                        <span>•</span>
                        <span className={order.paymentMethod === 'transfer' ? 'text-blue-400' : 'text-green-400'}>
                          {order.paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-500">${order.total.toLocaleString()}</div>
                      <div className="text-xs text-amber-200/50">{order.items.length} productos</div>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 mb-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-amber-200">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-amber-400 font-semibold">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.status === 'pendiente' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleCompleteOrder(order.id)}
                        className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-600/30 transition-all flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Marcar como Completado</span>
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-6 py-3 bg-red-900/30 text-red-400 rounded-lg font-semibold hover:bg-red-900/50 transition border border-red-800/50 flex items-center space-x-2"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'completado' && (
                    <div className="flex items-center justify-center space-x-2 text-green-400 py-2">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">Pedido completado {order.completedAt && `- ${formatTime(order.completedAt)}`}</span>
                    </div>
                  )}

                  {order.status === 'cancelado' && (
                    <div className="flex items-center justify-center space-x-2 text-red-400 py-2">
                      <X className="w-5 h-5" />
                      <span className="font-semibold">Pedido cancelado {order.cancelledAt && `- ${formatTime(order.cancelledAt)}`}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notificaciones' && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-amber-800/30">
                <Bell className="w-16 h-16 text-amber-600/30 mx-auto mb-4" />
                <p className="text-amber-200/50 text-lg">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`bg-gradient-to-br from-zinc-900 to-black border rounded-xl p-6 transition-all ${
                    notif.status === 'pendiente' 
                      ? 'border-red-800/50 hover:border-red-600/50' 
                      : 'border-amber-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {notif.type === 'bill' ? (
                          <DollarSign className="w-8 h-8 text-amber-500" />
                        ) : (
                          <Bell className="w-8 h-8 text-amber-500" />
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-amber-400">
                            {notif.type === 'bill' ? 'Solicitud de Cuenta' : 'Llamado de Mozo'}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-amber-200/70">
                            <span>Mesa {notif.tableNumber}</span>
                            <span>•</span>
                            <span>{notif.sessionName}</span>
                            <span>•</span>
                            <span className={notif.status === 'pendiente' ? 'text-red-400 font-semibold' : 'text-green-400'}>
                              {getRelativeTime(notif.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(notif.status)}`}>
                      {notif.status.toUpperCase()}
                    </span>
                  </div>

                  {notif.status === 'pendiente' && (
                    <button
                      onClick={() => handleAttendNotification(notif.id)}
                      className="mt-4 w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-600/30 transition-all flex items-center justify-center space-x-2"
                    >
                      <Check className="w-5 h-5" />
                      <span>Marcar como Atendido</span>
                    </button>
                  )}

                  {notif.status === 'atendido' && notif.attendedAt && (
                    <div className="mt-4 text-center text-green-400 text-sm">
                      ✓ Atendido {formatTime(notif.attendedAt)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'mesas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-zinc-900/50 rounded-xl border border-amber-800/30">
                <Users className="w-16 h-16 text-amber-600/30 mx-auto mb-4" />
                <p className="text-amber-200/50 text-lg">No hay mesas activas</p>
              </div>
            ) : (
              tables.map(table => (
                <div
                  key={table.tableNumber}
                  className="bg-gradient-to-br from-zinc-900 to-black border border-amber-800/30 rounded-xl p-6 hover:border-amber-600/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-amber-400">Mesa {table.tableNumber}</h3>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
                      ACTIVA
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-amber-200/70">
                      <Users className="w-4 h-4" />
                      <span>{table.sessions.length} persona(s)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-amber-200/70">
                      <Clock className="w-4 h-4" />
                      <span>Creada {getRelativeTime(table.createdAt)}</span>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-3 space-y-2">
                    {table.sessions.map((session, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-200">{session.name}</span>
                          {session.isOwner && (
                            <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded-full">
                              Anfitrión
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-xs text-amber-200/40 text-center">
                    Expira {formatTime(table.expiresAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;