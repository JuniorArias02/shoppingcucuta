import { useEffect, useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Package, CreditCard, Heart, ShoppingBag, Settings, LogOut, ChevronRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                // Simulación de carga para sentir premium app
                // const res = await api.get('/orders/my-orders'); 
                // setRecentOrders(res.data.data.slice(0, 3));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders", error);
                setLoading(false);
            }
        };
        fetchRecentOrders();
    }, []);

    const quickActions = [
        { label: 'Mis Pedidos', icon: ShoppingBag, path: '/client/orders', color: 'bg-sc-magenta' },
        { label: 'Favoritos', icon: Heart, path: '/client/favorites', color: 'bg-rose-500' },
        { label: 'Mis Pagos', icon: CreditCard, path: '/client/pending-payments', color: 'bg-sc-cyan' },
        { label: 'Ajustes', icon: Settings, path: '/client/settings', color: 'bg-sc-purple' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sc-cyan"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-lg mx-auto lg:max-w-none pb-20 lg:pb-0">
            {/* Header / Balance Card Style */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sc-navy-card to-slate-900 border border-white/5 shadow-2xl p-6 md:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sc-cyan/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-sc-magenta to-sc-purple p-[2px] shadow-lg shadow-sc-magenta/20">
                            <div className="w-full h-full bg-sc-navy-card rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold text-white">
                                {user?.nombre?.charAt(0) || <User />}
                            </div>
                        </div>
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-sc-navy-card"></div>
                    </div>

                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">Hola, {user?.nombre?.split(' ')[0]}</h2>
                        <p className="text-slate-400 text-sm md:text-base mt-1">{user?.email}</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Link to="/client/settings" className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-slate-300 transition-colors">
                            Editar Perfil
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 px-2">Accesos Rápidos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action, idx) => (
                        <Link
                            key={idx}
                            to={action.path}
                            className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-sc-navy-card/50 border border-white/5 hover:bg-white/5 hover:border-sc-cyan/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className={`w-12 h-12 rounded-full ${action.color}/20 text-${action.color.replace('bg-', '')} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <action.icon size={24} className="text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-sc-navy-card/30 rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <h3 className="font-bold text-white text-lg">Actividad Reciente</h3>
                    <Link to="/client/orders" className="text-sc-cyan text-sm font-semibold hover:text-white transition-colors">Ver todo</Link>
                </div>

                <div className="p-4 space-y-2">
                    {recentOrders.length > 0 ? (
                        recentOrders.map(order => (
                            <Link key={order.id} to={`/client/orders/${order.id}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                                    <ShoppingBag size={20} className="text-slate-400 group-hover:text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-white text-sm">Pedido #{order.id}</p>
                                    <p className="text-xs text-slate-500">{order.fecha}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sc-cyan text-sm">${order.total}</p>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Entregado</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-600 group-hover:text-white" />
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600">
                                <Package size={32} />
                            </div>
                            <p className="text-slate-400 text-sm">No tienes pedidos recientes</p>
                            <Link to="/products" className="text-sc-magenta text-sm font-bold mt-2 inline-block">¡Ir de compras!</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Logout Mobile Only (since sidebar handles desktop) */}
            <div className="lg:hidden">
                <button
                    onClick={logout}
                    className="w-full py-4 rounded-2xl border border-red-500/30 text-red-400 font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut size={20} /> Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
