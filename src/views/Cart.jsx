import { useState, useEffect } from 'react';
import CartService from '../services/CartService';
import { Trash2, Plus, Minus, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import Price from '../components/ui/Price';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import Swal from 'sweetalert2';
import { openWompiPayment } from '../utils/wompiHelper';

export default function Cart() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const getImageUrl = (img) => {
        if (!img) return 'https://placehold.co/100?text=No+Img';
        if (img.startsWith('http')) return img;
        return `${API_URL}${img}`;
    };

    const fetchCart = async () => {
        try {
            const data = await CartService.getCart();
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setLoading(false);
        }
    }, [user]);

    const updateQuantity = async (id, delta) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const newQty = item.cantidad + delta;
        if (newQty < 1 || newQty > item.stock_max) return;

        try {
            // Optimistic update
            setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad: newQty } : i));
            await CartService.updateItem(id, newQty);
        } catch (error) {
            console.error(error);
            // Revert on error
            fetchCart();
        }
    };

    const removeItem = async (id) => {
        try {
            // Optimistic update
            setItems(prev => prev.filter(i => i.id !== id));
            await CartService.removeItem(id);
        } catch (error) {
            console.error(error);
            fetchCart();
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            Swal.fire({
                title: 'Inicia sesión',
                text: "Necesitas una cuenta para comprar.",
                icon: 'info',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#D9258B',
                confirmButtonText: 'Ir a Login'
            }).then((result) => {
                if (result.isConfirmed) navigate('/login');
            });
            return;
        }

        // Validate Profile Data
        const { perfil } = user;
        if (!perfil || !perfil.direccion || !perfil.ciudad || !perfil.numero_telefono) {
            Swal.fire({
                title: 'Datos de envío faltantes',
                text: "Por favor completa tu dirección y teléfono en tu perfil para continuar.",
                icon: 'warning',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#D9258B',
                confirmButtonText: 'Ir a Mi Perfil',
                showCancelButton: true,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const profileRoute = user.rol_id === 2 ? '/client/settings' : '/admin/settings';
                    navigate(profileRoute);
                }
            });
            return;
        }

        const { value: selectedMethod } = await Swal.fire({
            title: '<span class="text-white text-2xl font-bold">Finalizar Compra</span>',
            html: `
                <div class="text-left space-y-5 pt-4">
                    <div class="bg-white/5 p-4 rounded-xl border border-white/10">
                        <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Enviar a:</p>
                        <p class="text-white font-medium flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-sc-cyan"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                           ${perfil.direccion}, ${perfil.ciudad}
                        </p>
                        <p class="text-slate-400 text-xs mt-1 ml-6">${perfil.numero_telefono}</p>
                    </div>

                    <div class="bg-sc-cyan/10 p-3 rounded-lg border border-sc-cyan/20 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-sc-cyan"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        <p class="text-sm text-sc-cyan font-bold">Pago Seguro vía Wompi</p>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Notas del Pedido (Opcional)</label>
                        <textarea id="notas" class="w-full bg-sc-navy border border-white/10 rounded-xl p-3 text-white text-sm focus:border-sc-cyan outline-none transition-all h-24" placeholder="Instrucciones especiales para tu pedido..."></textarea>
                    </div>
                </div>
            `,
            background: '#151E32',
            color: '#fff',
            confirmButtonColor: '#00C2CB',
            confirmButtonText: 'Confirmar y Pagar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    metodo_pago: 'wompi',
                    notas_cliente: document.getElementById('notas').value
                };
            }
        });

        if (selectedMethod) {
            const formValues = {
                direccion_envio: perfil.direccion,
                ciudad: perfil.ciudad,
                telefono: perfil.numero_telefono,
                codigo_postal: perfil.codigo_postal || '', // Optional
                metodo_pago: selectedMethod.metodo_pago,
                notas_cliente: selectedMethod.notas_cliente
            };
            // Create order
            try {
                Swal.fire({
                    title: 'Procesando pedido...',
                    text: 'Por favor espera',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    background: '#151E32',
                    color: '#fff'
                });

                const OrderService = (await import('../services/OrderService')).default;
                const response = await OrderService.createOrder(formValues);


                if (formValues.metodo_pago === 'wompi') {
                    // Start Wompi Flow
                    try {
                        const PaymentService = (await import('../services/PaymentService')).default;
                        const wompiParams = await PaymentService.initWompiTransaction(response.pedido.id);

                        console.log('🔐 Wompi Params:', wompiParams);

                        // Close Swal loading
                        Swal.close();

                        // Open Wompi Payment Modal (Widget or Web)
                        await openWompiPayment(
                            wompiParams,
                            // onSuccess callback
                            (transaction) => {
                                setItems([]); // Clear cart
                                navigate(`/client/gracias?id=${transaction.id}`);
                            },
                            // onError callback
                            (error) => {
                                console.error('Wompi Payment Error:', error);
                                Swal.fire({
                                    title: 'Error de Pago',
                                    text: 'No se pudo iniciar la pasarela de pagos. Por favor intenta nuevamente desde "Mis Pedidos".',
                                    icon: 'error',
                                    background: '#151E32',
                                    color: '#fff'
                                }).then(() => {
                                    navigate('/client/orders');
                                });
                            }
                        );

                    } catch (wompiError) {
                        console.error('Wompi Error:', wompiError);
                        Swal.fire({
                            title: 'Error de Pago',
                            text: 'No se pudo iniciar la pasarela de pagos. Por favor intenta nuevamente desde "Mis Pedidos".',
                            icon: 'error',
                            background: '#151E32',
                            color: '#fff'
                        }).then(() => {
                            navigate('/client/orders');
                        });
                    }
                } else {
                    // Manual Payment (Current Flow)
                    setItems([]); // Clear cart immediately for manual
                    Swal.fire({
                        title: '¡Pedido Creado!',
                        html: `
                            <div class="text-left space-y-3">
                                <p class="text-slate-300">Tu pedido #${response.pedido.id} ha sido creado exitosamente.</p>
                                <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                    <p class="text-emerald-400 text-sm">
                                        <strong>Estado:</strong> Pagado ✓ (Modo Test)
                                    </p>
                                    <p class="text-emerald-400 text-sm mt-1">
                                        El pedido está listo para ser procesado y enviado.
                                    </p>
                                </div>
                                <p class="text-slate-400 text-sm">Puedes ver el estado de tu pedido en "Mis Pedidos".</p>
                            </div>
                        `,
                        icon: 'success',
                        background: '#151E32',
                        color: '#fff',
                        confirmButtonColor: '#00C2CB',
                        confirmButtonText: 'Ver Mis Pedidos'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const ordersRoute = user.rol_id === 2 ? '/client/orders' : '/admin/orders';
                            navigate(ordersRoute);
                        }
                    });
                }
            } catch (error) {
                console.error('Error creating order:', error);

                if (error.response?.data?.code === 'PROFILE_INCOMPLETE') {
                    Swal.fire({
                        title: 'Perfil Incompleto',
                        text: error.response.data.message,
                        icon: 'warning',
                        background: '#151E32',
                        color: '#fff',
                        confirmButtonColor: '#D9258B',
                        confirmButtonText: 'Ir a mi Perfil',
                        showCancelButton: true,
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const profileRoute = user.rol_id === 2 ? '/client/settings' : '/admin/settings';
                            navigate(profileRoute);
                        }
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: error.response?.data?.message || 'No se pudo crear el pedido. Intenta nuevamente.',
                        icon: 'error',
                        background: '#151E32',
                        color: '#fff',
                        confirmButtonColor: '#00C2CB'
                    });
                }
            }
        }
    };

    const subtotal = items.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);
    const shipping = 0; // Free for now
    const total = subtotal + shipping;

    // Loading Skeleton
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-6">
                <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                    Tu Carrito <span className="text-lg font-normal text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5 animate-pulse">...</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Skeleton Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-sc-navy-card/80 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex gap-5 animate-pulse">
                                {/* Image Skeleton */}
                                <div className="w-28 h-28 bg-sc-navy rounded-xl flex-shrink-0 border border-white/5"></div>

                                {/* Info Skeleton */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="h-6 bg-white/10 rounded-lg w-3/4 mb-3"></div>
                                        <div className="flex gap-2">
                                            <div className="h-6 bg-white/5 rounded-md w-20"></div>
                                            <div className="h-6 bg-white/5 rounded-md w-20"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end mt-4">
                                        <div className="h-8 bg-white/10 rounded-lg w-24"></div>
                                        <div className="h-10 bg-sc-navy rounded-xl w-32"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Skeleton Summary */}
                    <div className="space-y-6">
                        <div className="bg-sc-navy-card/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 sticky top-24 shadow-xl animate-pulse">
                            <div className="h-6 bg-white/10 rounded-lg w-1/2 mb-6"></div>
                            <div className="space-y-3 pb-6 border-b border-white/10">
                                <div className="flex justify-between">
                                    <div className="h-4 bg-white/5 rounded w-20"></div>
                                    <div className="h-4 bg-white/5 rounded w-24"></div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-4 bg-white/5 rounded w-16"></div>
                                    <div className="h-4 bg-white/5 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-6">
                                <div className="h-8 bg-white/10 rounded-lg w-20"></div>
                                <div className="h-8 bg-white/10 rounded-lg w-28"></div>
                            </div>
                            <div className="h-12 bg-white/10 rounded-xl w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-sc-navy-card rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
                    <ShoppingBag size={40} className="text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Tu carrito está vacío</h2>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto">Parece que aún no has agregado nada. Explora nuestra tienda y encuentra lo que buscas.</p>
                <Link to="/" className="bg-sc-magenta hover:bg-pink-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-sc-magenta/40 hover:-translate-y-1">
                    Empezar a comprar
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-6">
            <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                Tu Carrito <span className="text-lg font-normal text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">{items.length} items</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-sc-navy-card/80 backdrop-blur-md p-3 md:p-5 rounded-2xl border border-white/5 flex gap-3 md:gap-5 transition hover:border-sc-cyan/20 group relative">
                            {/* Image */}
                            <div className="w-24 h-24 md:w-28 md:h-28 bg-sc-navy rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                                <img src={getImageUrl(item.imagen)} alt={item.producto_nombre} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-white text-sm md:text-lg line-clamp-2 leading-tight mb-1 pr-8 md:pr-0">
                                            {item.producto_nombre}
                                        </h3>
                                        {/* Delete Button - Positioned absolute on mobile to save space */}
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-slate-500 hover:text-red-400 p-1.5 md:p-2 hover:bg-red-500/10 rounded-lg transition-colors absolute top-2 right-2 md:static md:top-auto md:right-auto"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-[10px] md:text-xs text-slate-400 mt-1 md:mt-2">
                                        {Object.entries(item.atributos).map(([key, val]) => (
                                            <span key={key} className="bg-white/5 border border-white/5 px-2 py-1 rounded-md">
                                                {key}: <span className="text-slate-200">{val}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mt-3 md:mt-4">
                                    <div className="text-white">
                                        <Price price={item.precio_unitario} discountPercent={item.descuento || 0} size="lg" />
                                    </div>

                                    {/* Qty Controls - Larger touch targets & better spacing */}
                                    <div className="flex items-center bg-sc-navy border border-slate-700 rounded-xl h-10 w-fit self-start sm:self-auto">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-10 h-full flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white rounded-l-xl transition-colors disabled:opacity-30 active:bg-white/10"
                                            disabled={item.cantidad <= 1}
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="w-10 text-center text-sm font-bold text-white border-x border-slate-700/50 h-full flex items-center justify-center">{item.cantidad}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-10 h-full flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white rounded-r-xl transition-colors disabled:opacity-30 active:bg-white/10"
                                            disabled={item.cantidad >= item.stock_max}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="bg-emerald-500/10 p-4 rounded-xl flex items-start gap-3 text-emerald-400 text-sm border border-emerald-500/20">
                        <ShieldCheck className="flex-shrink-0 mt-0.5" size={18} />
                        <p>Compra protegida: Recibe el producto que esperabas o te devolvemos tu dinero.</p>
                    </div>
                </div>

                {/* Summary / User Data Mock */}
                <div className="space-y-6">
                    <div className="bg-sc-navy-card/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 sticky top-24 shadow-xl">
                        <h3 className="font-bold text-lg mb-6 text-white">Resumen del Pedido</h3>

                        <div className="space-y-3 text-sm text-slate-400 pb-6 border-b border-white/10">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-slate-200">
                                    <Price price={subtotal} size="sm" />
                                </span>
                            </div>
                            <div className="flex justify-between text-emerald-400">
                                <span>Envío</span>
                                <span className="font-medium">Gratis</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-6 font-bold text-2xl text-white">
                            <span>Total</span>
                            <span className="text-sc-cyan">
                                <Price price={total} size="xl" />
                            </span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-sc-magenta/25 hover:shadow-sc-magenta/40 transition flex items-center justify-center gap-2 group hover:-translate-y-1"
                        >
                            Finalizar Compra
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-xs text-slate-500 mb-2">
                                Transacciones seguras y encriptadas
                            </p>
                            <div className="flex justify-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="h-6 w-10 bg-white rounded"></div>
                                <div className="h-6 w-10 bg-white rounded"></div>
                                <div className="h-6 w-10 bg-white rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
