import { useState, useEffect } from 'react';
import { Coffee, Bell, ShoppingCart, Users, DollarSign, Check, X, Clock, RefreshCw, CheckCircle, XCircle, LogIn, UtensilsCrossed, Search, Save } from 'lucide-react';
import swal from '../utils/swal';
import {
  subscribeToOrders,
  subscribeToNotifications,
  subscribeToTables,
  updateOrder,
  updateNotification,
  setTable,
  getTable,
  deleteTable,
  subscribeToMenu,
  setMenuItem
} from '../services/storageService';
import { seedMenu } from '../utils/seedMenu';

const AdminPanel = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('pedidos');
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState('Todas');
  const [menuEdits, setMenuEdits] = useState({});
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeNotifications: 0
  });

  const ADMIN_PASSWORD = 'valhalla2024';

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'Contraseña incorrecta' });
      setPassword('');
    }
  };

  // Suscripciones en tiempo real (reemplaza polling de 10s)
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubOrders = subscribeToOrders((ordersList) => {
      setOrders(ordersList);
    });

    const unsubNotifications = subscribeToNotifications((notifList) => {
      setNotifications(notifList);
    });

    const unsubTables = subscribeToTables((tablesList) => {
      setTables(tablesList);
    });

    const unsubMenu = subscribeToMenu((items) => {
      setMenuItems(items);
    });

    return () => {
      unsubOrders();
      unsubNotifications();
      unsubTables();
      unsubMenu();
    };
  }, [isAuthenticated]);

  // Recalcular estadísticas cuando cambian los datos
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'pendiente').length;
    const totalRevenue = orders
      .filter(o => o.status === 'completado')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const activeNotifications = notifications.filter(n => n.status === 'pendiente').length;

    setStats({
      totalOrders: orders.length,
      pendingOrders,
      totalRevenue,
      activeNotifications
    });
  }, [orders, notifications]);

  const handleCompleteOrder = async (orderId) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      await updateOrder(orderId, { ...order, status: 'completado', completedAt: Date.now() });
    } catch (error) {
      console.error('Error al actualizar el pedido:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Error al actualizar el pedido' });
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await swal.fire({
      icon: 'warning',
      title: '¿Cancelar pedido?',
      text: '¿Seguro que deseas cancelar este pedido?',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    });
    if (!result.isConfirmed) return;
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      await updateOrder(orderId, { ...order, status: 'cancelado', cancelledAt: Date.now() });
    } catch (error) {
      swal.fire({ icon: 'error', title: 'Error', text: 'Error al cancelar el pedido' });
    }
  };

  const handleAttendNotification = async (notificationId) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;
      await updateNotification(notificationId, { ...notification, status: 'atendido', attendedAt: Date.now() });
    } catch (error) {
      swal.fire({ icon: 'error', title: 'Error', text: 'Error al atender la notificación' });
    }
  };

  const handleResetTable = async (tableNumber) => {
    const result = await swal.fire({
      icon: 'warning',
      title: `¿Reiniciar Mesa ${tableNumber}?`,
      text: 'Los clientes conectados serán desconectados y la mesa quedará libre para nuevos clientes.',
      showCancelButton: true,
      confirmButtonText: 'Sí, reiniciar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      const tableData = await getTable(tableNumber);
      if (tableData) {
        const updatedTable = { ...tableData, status: 'deactivated', deactivatedAt: Date.now() };
        await setTable(tableNumber, updatedTable);

        setTimeout(async () => {
          await deleteTable(tableNumber);
        }, 3000);

        swal.fire({ icon: 'success', title: 'Mesa reiniciada', text: `Mesa ${tableNumber} reiniciada correctamente` });
      }
    } catch (error) {
      console.error('Error al reiniciar la mesa:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Error al reiniciar la mesa. Intenta nuevamente.' });
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
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
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
        </div>
      </div>
    );
  }

  // Panel principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-amber-950">
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
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

      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex space-x-2 border-b border-amber-800/30 overflow-x-auto scrollbar-hide">
          {[
            { id: 'pedidos', label: 'Pedidos', icon: <ShoppingCart className="w-4 h-4" />, count: stats.pendingOrders },
            { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="w-4 h-4" />, count: stats.activeNotifications },
            { id: 'mesas', label: 'Mesas Activas', icon: <Users className="w-4 h-4" />, count: tables.length },
            { id: 'menu', label: 'Menú', icon: <UtensilsCrossed className="w-4 h-4" />, count: 0 }
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
                          {(order.status || 'pendiente').toUpperCase()}
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
                      <div className="text-2xl font-bold text-amber-500">${(order.total || 0).toLocaleString()}</div>
                      <div className="text-xs text-amber-200/50">{(order.items || []).length} productos</div>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 mb-4 space-y-2">
                    {(order.items || []).map((item, idx) => (
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
                            <span>{notif.sessionName || 'Sin nombre'}</span>
                            <span>•</span>
                            <span className={notif.status === 'pendiente' ? 'text-red-400 font-semibold' : 'text-green-400'}>
                              {getRelativeTime(notif.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(notif.status)}`}>
                      {(notif.status || 'pendiente').toUpperCase()}
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
                      Atendido {formatTime(notif.attendedAt)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'mesas' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-zinc-900/50 rounded-xl border border-amber-800/30">
                <Users className="w-16 h-16 text-amber-600/30 mx-auto mb-4" />
                <p className="text-amber-200/50 text-lg">No hay mesas activas</p>
              </div>
            ) : (
              tables.map(table => (
                <div
                  key={table.tableNumber || table.id}
                  className="relative bg-gradient-to-br from-zinc-900 to-black border border-amber-800/30 rounded-xl p-4 sm:p-6 hover:border-amber-600/50 transition-all"
                >
                  {table.status !== 'deactivated' && (
                    <button
                      onClick={() => handleResetTable(table.tableNumber)}
                      className="absolute top-2 right-2 p-1.5 bg-red-900/40 text-red-400 rounded-lg hover:bg-red-900/70 transition border border-red-800/50"
                      title="Eliminar mesa"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex items-center justify-between mb-4 pr-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-amber-400">Mesa {table.tableNumber}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      table.status === 'deactivated'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-green-500/20 text-green-400 border-green-500/30'
                    }`}>
                      {table.status === 'deactivated' ? 'DESACTIVADA' : 'ACTIVA'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-amber-200/70">
                      <Users className="w-4 h-4" />
                      <span>{(table.sessions || []).length} persona(s)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-amber-200/70">
                      <Clock className="w-4 h-4" />
                      <span>Creada {getRelativeTime(table.createdAt)}</span>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-3 space-y-2 mb-4">
                    {(table.sessions || []).map((session, idx) => (
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

                  {table.status !== 'deactivated' && (
                    <button
                      onClick={() => handleResetTable(table.tableNumber)}
                      className="w-full py-3 bg-red-900/30 text-red-400 rounded-lg font-semibold hover:bg-red-900/50 transition border border-red-800/50 flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>Reiniciar Mesa</span>
                    </button>
                  )}

                  <div className="mt-4 text-xs text-amber-200/40 text-center">
                    Expira {formatTime(table.expiresAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            {menuItems.length === 0 && (
              <div className="text-center py-10">
                <UtensilsCrossed className="w-16 h-16 text-amber-600/30 mx-auto mb-4" />
                <p className="text-amber-200/50 text-lg mb-6">No hay productos en el menú</p>
                <button
                  onClick={async () => {
                    const result = await swal.fire({
                      icon: 'question',
                      title: 'Cargar menú inicial',
                      text: '¿Deseas cargar todos los productos del menú inicial?',
                      showCancelButton: true,
                      confirmButtonText: 'Sí, cargar',
                      cancelButtonText: 'Cancelar'
                    });
                    if (!result.isConfirmed) return;
                    try {
                      await seedMenu();
                      swal.fire({ icon: 'success', title: 'Menú cargado', text: 'Se cargaron todos los productos correctamente.' });
                    } catch (error) {
                      swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar el menú.' });
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-amber-600/50 transition-all"
                >
                  Cargar menú inicial
                </button>
              </div>
            )}

            {menuItems.length > 0 && (
              <>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/50" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-amber-800/30 rounded-xl text-amber-100 placeholder-amber-500/30 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                  />
                </div>

                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                  {['Todas', 'Infusiones Calientes', 'Infusiones Frías', 'Batidos y Limonadas', 'Tostados y Dulces', 'Bebidas', 'Hamburguesas', 'Pizzas', 'Sandwiches', 'Adicionales'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setMenuCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                        menuCategory === cat
                          ? 'bg-amber-600 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems
                    .filter(item => {
                      const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
                      const matchesCategory = menuCategory === 'Todas' || item.category === menuCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map(item => {
                      const edit = menuEdits[item.id] || {};
                      const currentPrice = edit.price !== undefined ? edit.price : (item.price ?? '');
                      const currentPrice2 = edit.price2 !== undefined ? edit.price2 : (item.price2 ?? '');
                      const currentDescription = edit.description !== undefined ? edit.description : (item.description ?? '');
                      const hasChanges =
                        (edit.price !== undefined && edit.price !== (item.price ?? '')) ||
                        (edit.price2 !== undefined && edit.price2 !== (item.price2 ?? '')) ||
                        (edit.description !== undefined && edit.description !== (item.description ?? ''));

                      return (
                        <div
                          key={item.id}
                          className={`bg-gradient-to-br from-zinc-900 to-black border border-amber-800/30 rounded-xl p-5 transition-all relative ${
                            !item.available ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-amber-400">{item.name}</h3>
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-900/30 text-amber-300 border border-amber-800/30 mt-1">
                                {item.category}
                              </span>
                            </div>
                            <button
                              onClick={async () => {
                                try {
                                  await setMenuItem(item.id, { available: !item.available });
                                } catch {
                                  swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar la disponibilidad.' });
                                }
                              }}
                              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                                item.available ? 'bg-green-600' : 'bg-zinc-600'
                              }`}
                            >
                              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                item.available ? 'left-6' : 'left-0.5'
                              }`} />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-amber-200/50 mb-1">
                                {item.priceLabel ? `Precio (${item.priceLabel})` : 'Precio'}
                              </label>
                              <input
                                type="number"
                                placeholder="Consultar"
                                value={currentPrice}
                                onChange={(e) => setMenuEdits(prev => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], price: e.target.value === '' ? '' : Number(e.target.value) }
                                }))}
                                className="w-full px-3 py-2 bg-black/30 border border-amber-800/30 rounded-lg text-amber-100 placeholder-amber-500/30 focus:outline-none focus:border-amber-600 text-sm"
                              />
                            </div>

                            {item.price2Label && (
                              <div>
                                <label className="block text-xs text-amber-200/50 mb-1">Precio ({item.price2Label})</label>
                                <input
                                  type="number"
                                  placeholder="Consultar"
                                  value={currentPrice2}
                                  onChange={(e) => setMenuEdits(prev => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], price2: e.target.value === '' ? '' : Number(e.target.value) }
                                  }))}
                                  className="w-full px-3 py-2 bg-black/30 border border-amber-800/30 rounded-lg text-amber-100 placeholder-amber-500/30 focus:outline-none focus:border-amber-600 text-sm"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-xs text-amber-200/50 mb-1">Descripción</label>
                              <textarea
                                rows={2}
                                value={currentDescription}
                                onChange={(e) => setMenuEdits(prev => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], description: e.target.value }
                                }))}
                                className="w-full px-3 py-2 bg-black/30 border border-amber-800/30 rounded-lg text-amber-100 placeholder-amber-500/30 focus:outline-none focus:border-amber-600 text-sm resize-none"
                              />
                            </div>

                            {hasChanges && (
                              <button
                                onClick={async () => {
                                  try {
                                    const updates = {};
                                    if (edit.price !== undefined) updates.price = edit.price === '' ? null : edit.price;
                                    if (edit.price2 !== undefined) updates.price2 = edit.price2 === '' ? null : edit.price2;
                                    if (edit.description !== undefined) updates.description = edit.description;
                                    await setMenuItem(item.id, updates);
                                    setMenuEdits(prev => {
                                      const next = { ...prev };
                                      delete next[item.id];
                                      return next;
                                    });
                                    swal.fire({ icon: 'success', title: 'Guardado', text: `${item.name} actualizado correctamente.`, timer: 1500, showConfirmButton: false });
                                  } catch {
                                    swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar los cambios.' });
                                  }
                                }}
                                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-black rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-600/30 transition-all flex items-center justify-center space-x-2"
                              >
                                <Save className="w-4 h-4" />
                                <span>Guardar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
