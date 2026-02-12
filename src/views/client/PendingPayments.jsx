import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { CreditCard, Eye, Calendar, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import Price from '../../components/ui/Price';
import { useNavigate } from 'react-router-dom';
import { openWompiPayment } from '../../utils/wompiHelper';

export default function PendingPayments() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPendingOrders = async () => {
        try {
            const response = await api.get('/orders?estado=pendiente'); // Filter by status if backend supports it, otherwise filter client side
            // Standardize response
            let data = response.data.data ? response.data.data : (Array.isArray(response.data) ? response.data : []);

            // Client side filter just in case backend doesn't support query param yet for client
            data = data.filter(o => o.estado === 'pendiente');

            setOrders(data);
        } catch (error) {
            console.error("Error loading pending orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingOrders();
    }, []);

    const handleCancel = async (orderId) => {
        const result = await Swal.fire({
            title: '¿Cancelar Pedido?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No, mantener',
            background: '#151E32',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                const OrderService = (await import('../../services/OrderService')).default;
                await OrderService.cancelOrder(orderId);
                Swal.fire({
                    title: 'Cancelado',
                    text: 'El pedido ha sido cancelado.',
                    icon: 'success',
                    background: '#151E32',
                    color: '#fff',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchPendingOrders();
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo cancelar el pedido.',
                    icon: 'error',
                    background: '#151E32',
                    color: '#fff'
                });
            }
        }
    };

    const handlePay = async (order) => {
        try {
            Swal.fire({
                title: 'Iniciando Pasarela...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                background: '#151E32',
                color: '#fff'
            });

            const PaymentService = (await import('../../services/PaymentService')).default;
            const wompiParams = await PaymentService.initWompiTransaction(order.id);

            console.log('🔐 Wompi Params:', wompiParams);

            // Close loading
            Swal.close();

            // Use the centralized Wompi helper (handles localhost detection automatically)
            await openWompiPayment(
                wompiParams,
                // onSuccess callback
                (transaction) => {
                    Swal.fire({
                        title: '¡Pago Exitoso!',
                        text: `Transacción aprobada: ${transaction.id}`,
                        icon: 'success',
                        background: '#151E32',
                        color: '#fff'
                    }).then(() => {
                        fetchPendingOrders(); // Refresh orders list
                    });
                },
                // onError callback
                (error) => {
                    console.error('Wompi Payment Error:', error);
                    Swal.fire({
                        title: 'Error de Pago',
                        text: 'No se pudo procesar el pago. Por favor intenta nuevamente.',
                        icon: 'error',
                        background: '#151E32',
                        color: '#fff'
                    });
                }
            );

        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo iniciar el pago.',
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
        }
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const getImageUrl = (img) => {
        if (!img) return 'https://placehold.co/100?text=No+Img';
        if (img.startsWith('http')) return img;
        return `${API_URL}${img}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sc-cyan"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-sc-navy-card/50 rounded-3xl border border-white/5">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Todo al día</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                    No tienes pagos pendientes. ¡Gracias por tu compra!
                </p>
                <div onClick={() => navigate('/products')} className="cursor-pointer text-sc-cyan hover:underline">
                    Ver Menú
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <CreditCard className="text-sc-magenta" /> Pagos Pendientes
                </h1>
                <p className="text-slate-400">Gestiona tus pedidos que aún no han sido pagados.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(order => (
                    <div key={order.id} className="bg-sc-navy-card/80 border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:border-sc-magenta/30 transition-all group relative">
                        {/* Status Strip */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg">Pedido #{order.id}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                        <Calendar size={14} />
                                        <span>{order.fecha}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Price price={order.total} size="lg" className="text-amber-400" />
                                </div>
                            </div>

                            {/* Items Preview */}
                            <div className="space-y-3 mb-6 bg-sc-navy/50 p-3 rounded-xl border border-white/5">
                                {order.items.slice(0, 3).map(item => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={getImageUrl(item.imagen)} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-300 text-sm truncate">{item.producto}</p>
                                            <div className="text-slate-500 text-xs flex items-center gap-1">{item.cantidad} x <Price price={item.precio} size="xs" /></div>
                                        </div>
                                    </div>
                                ))}
                                {order.items_count > 3 && (
                                    <p className="text-xs text-center text-slate-500 mt-1">
                                        + {order.items_count - 3} productos más
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleCancel(order.id)}
                                    className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-sm transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handlePay(order)}
                                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-sc-magenta to-purple-600 hover:scale-[1.02] text-white font-bold text-sm shadow-lg shadow-sc-magenta/20 transition-all"
                                >
                                    Pagar Ahora
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
