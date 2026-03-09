import { useState, useEffect } from 'react';
import { CircleDollarSign, TrendingUp, CreditCard, Activity, Calendar } from 'lucide-react';
import OrderService from '../../services/OrderService';
import Swal from 'sweetalert2';

export default function Earnings() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        totalGanancias: 0,
        pedidosPagados: 0,
        ticketPromedio: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await OrderService.getOrders();
            const allOrders = response.data || [];

            // Only consider orders that conceptually have collected money 
            // (pagado, visto, despachado, enviado, entregado)
            const paidStatuses = ['pagado', 'visto', 'despachado', 'enviado', 'entregado'];
            const validOrders = allOrders.filter(o => paidStatuses.includes(o.estado));

            setOrders(validOrders);

            // Calculate metrics
            const total = validOrders.reduce((sum, order) => sum + Number(order.total), 0);
            const qty = validOrders.length;
            const avg = qty > 0 ? total / qty : 0;

            setMetrics({
                totalGanancias: total,
                pedidosPagados: qty,
                ticketPromedio: avg
            });

        } catch (error) {
            console.error('Error fetching earnings data:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los datos financieros',
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <CircleDollarSign className="text-emerald-400" size={32} />
                        Finanzas y Ganancias
                    </h1>
                    <p className="text-slate-400">Control de ingresos y transacciones procesadas (Pedidos Pagados).</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 bg-sc-navy-card/80 border border-white/5 rounded-xl">
                    <Calendar size={18} className="text-emerald-400" />
                    <select className="bg-transparent text-white text-sm outline-none font-medium cursor-pointer">
                        <option className="bg-sc-navy text-white">Este Mes</option>
                        <option className="bg-sc-navy text-white">Mes Pasado</option>
                        <option className="bg-sc-navy text-white">Últimos 3 Meses</option>
                        <option className="bg-sc-navy text-white">Este Año</option>
                    </select>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-sc-navy-card to-slate-900 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-400 text-sm font-medium mb-1">Ganancias Totales</p>
                                <h3 className="text-3xl font-bold text-white">${metrics.totalGanancias.toLocaleString()}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <TrendingUp className="text-emerald-400" size={24} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <TrendingUp size={12} /> +12%
                            </span>
                            <span className="text-slate-500">vs mes anterior</span>
                        </div>
                    </div>
                </div>

                <div className="bg-sc-navy-card/80 border border-white/5 rounded-3xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Pedidos Pagados</p>
                            <h3 className="text-3xl font-bold text-white">{metrics.pedidosPagados}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-sc-cyan/10 flex items-center justify-center">
                            <CreditCard className="text-sc-cyan" size={24} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        Solo transacciones exitosas
                    </div>
                </div>

                <div className="bg-sc-navy-card/80 border border-white/5 rounded-3xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Ticket Promedio</p>
                            <h3 className="text-3xl font-bold text-white">${Math.round(metrics.ticketPromedio).toLocaleString()}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-sc-purple/10 flex items-center justify-center">
                            <Activity className="text-sc-purple" size={24} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        Gasto medio por cliente
                    </div>
                </div>
            </div>

            {/* Recent Paid Transactions */}
            <div className="bg-sc-navy-card/80 border border-white/5 rounded-3xl overflow-hidden shadow-xl mt-8">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Transacciones Recientes</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="p-4 text-sm font-semibold text-slate-300">ID Pedido</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Fecha / Hora</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Cliente</th>
                                <th className="p-4 text-sm font-semibold text-slate-300 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400">
                                        No hay transacciones registradas aún.
                                    </td>
                                </tr>
                            ) : (
                                orders.slice(0, 10).map((order) => (
                                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 text-sm font-bold text-white">#{order.id}</td>
                                        <td className="p-4 text-sm text-slate-400">{order.fecha}</td>
                                        <td className="p-4 text-sm text-slate-300">
                                            {order.cliente?.nombre || 'Usuario'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="font-bold text-emerald-400">
                                                +${Number(order.total).toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
