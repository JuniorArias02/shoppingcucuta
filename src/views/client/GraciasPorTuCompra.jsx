import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { CheckCircle, XCircle, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import Swal from 'sweetalert2';
import OrderService from '../../services/OrderService';

export default function GraciasPorTuCompra() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, unused, error
    const [message, setMessage] = useState('Verificando estado del pago...');
    const [orderId, setOrderId] = useState(null);

    // Wompi sends transaction info in query params, e.g. ?id=...&env=...
    // But our redirect might just be a simple landing. 
    // We should look for 'id' (transaction id) provided by Wompi redirect.
    const transactionId = searchParams.get('id');
    const env = searchParams.get('env'); // 'test' or 'prod'

    useEffect(() => {
        if (!transactionId) {
            setStatus('unused');
            setMessage('No se encontró información de la transacción.');
            return;
        }

        const verifyTransaction = async () => {
            try {
                // Poll user's orders to see if the latest one is paid
                setStatus('loading');
                setMessage('Confirmando tu pago con el banco...');

                let attempts = 0;
                const maxAttempts = 5;
                let foundPaid = false;

                // Function to wait
                const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

                while (attempts < maxAttempts) {
                    try {
                        const response = await OrderService.getOrders({ page: 1 });
                        const orders = response.data.data || response.data || []; // Handle pagination structure if needed

                        if (orders.length > 0) {
                            const latestOrder = orders[0];
                            // Check if this latest order is paid or processing
                            // Note: Wompi might update it to 'pagado' via webhook
                            if (latestOrder.estado === 'pagado' || latestOrder.estado === 'procesando') {
                                foundPaid = true;
                                break;
                            }
                        }
                    } catch (err) {
                        console.warn('Polling error:', err);
                    }

                    attempts++;
                    if (attempts < maxAttempts) await wait(2000); // Wait 2s
                }

                if (foundPaid) {
                    setStatus('success');
                    setMessage('¡Tu pago ha sido confirmado exitosamente!');
                } else {
                    // Fallback success message
                    setStatus('success');
                    setMessage('Hemos recibido tu solicitud. Tu pago se está procesando y recibirás la confirmación pronto.');
                }

            } catch (error) {
                console.error('Error verifying:', error);
                setStatus('error');
                setMessage('Hubo un error al verificar el estado.');
            }
        };

        verifyTransaction();
    }, [transactionId]);

    const handleGoToOrders = () => {
        navigate('/client/orders');
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/5 text-center relative overflow-hidden">

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl -z-0"></div>

                <div className="relative z-10 flex flex-col items-center">

                    {status === 'loading' && (
                        <>
                            <div className="w-20 h-20 mb-6 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                                <Clock className="w-10 h-10 text-blue-400 animate-spin-slow" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Procesando Pago</h1>
                            <p className="text-slate-400">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-20 h-20 mb-6 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                                ¡Gracias por tu Compra!
                            </h1>
                            <p className="text-slate-300 mb-8">
                                {message}
                            </p>

                            <div className="w-full space-y-3">
                                <button
                                    onClick={handleGoToOrders}
                                    className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={18} />
                                    Ver Mis Pedidos
                                </button>

                                <button
                                    onClick={() => navigate('/products')}
                                    className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Volver a la Tienda
                                </button>
                            </div>
                        </>
                    )}

                    {status === 'unused' && (
                        <>
                            <div className="w-20 h-20 mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-10 h-10 text-slate-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Disfruta tus Pizzas</h1>
                            <p className="text-slate-400 mb-6">Estamos listos para tomar tu orden.</p>
                            <button
                                onClick={() => navigate('/products')}
                                className="w-full py-3 bg-cyan-600/80 hover:bg-cyan-600 text-white font-bold rounded-xl transition-all"
                            >
                                Ver Menú
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-20 h-20 mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Algo salió mal</h1>
                            <p className="text-slate-400 mb-6">{message}</p>
                            <button
                                onClick={handleGoToOrders}
                                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                            >
                                Verificar en Mis Pedidos
                            </button>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
