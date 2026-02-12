import Swal from 'sweetalert2';

/**
 * Detecta si estamos en localhost
 */
const isLocalhost = () => {
    return window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('192.168.');
};

/**
 * Abre el modal de selección de método de pago Wompi (Widget o Web)
 * @param {Object} wompiParams - Parámetros de Wompi del backend
 * @param {Function} onSuccess - Callback cuando el pago es exitoso
 * @param {Function} onError - Callback cuando hay un error
 */
export const openWompiPayment = async (wompiParams, onSuccess, onError) => {
    try {
        // Si estamos en localhost, usar directamente Web Checkout (CloudFront bloquea localhost)
        if (isLocalhost()) {
            console.log('🌐 Localhost detectado - Usando Web Checkout automáticamente');
            Swal.fire({
                title: 'Redirigiendo a Wompi',
                text: 'Serás redirigido a la página de pago segura de Wompi',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false,
                background: '#151E32',
                color: '#fff'
            });

            // Esperar 2 segundos y redirigir
            await new Promise(resolve => setTimeout(resolve, 2000));
            openWompiWeb(wompiParams);
            return;
        }

        // Mostrar modal de selección (solo en producción)
        const result = await Swal.fire({
            title: '<strong class="text-white text-xl">¿Cómo prefieres pagar?</strong>',
            html: `
                <div class="flex flex-col gap-4 mt-4">
                    <button id="btn-widget" class="group relative flex items-center gap-4 p-4 rounded-xl bg-sc-navy border border-white/10 hover:border-sc-cyan/50 transition-all hover:bg-white/5 text-left">
                        <div class="bg-sc-cyan/10 p-3 rounded-full text-sc-cyan group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                        </div>
                        <div>
                            <h4 class="font-bold text-white text-lg">En esta web</h4>
                            <p class="text-sm text-slate-400">Paga sin salir de Venezia Pizzas (Widget).</p>
                        </div>
                    </button>

                    <button id="btn-web" class="group relative flex items-center gap-4 p-4 rounded-xl bg-sc-navy border border-white/10 hover:border-sc-magenta/50 transition-all hover:bg-white/5 text-left">
                        <div class="bg-sc-magenta/10 p-3 rounded-full text-sc-magenta group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                        </div>
                        <div>
                            <h4 class="font-bold text-white text-lg">Ir a Wompi</h4>
                            <p class="text-sm text-slate-400">Paga en la página segura de Wompi.</p>
                        </div>
                    </button>
                </div>
            `,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            background: '#151E32',
            color: '#fff',
            width: 500,
            didOpen: () => {
                const widgetBtn = document.getElementById('btn-widget');
                const webBtn = document.getElementById('btn-web');

                // Handler para Widget
                widgetBtn.onclick = async () => {
                    try {
                        Swal.close();
                        await openWompiWidget(wompiParams, onSuccess, onError);
                    } catch (error) {
                        console.error('❌ Error en Widget Handler:', error);
                        if (onError) onError(error);
                    }
                };

                // Handler para Web
                webBtn.onclick = () => {
                    try {
                        Swal.close();
                        openWompiWeb(wompiParams);
                    } catch (error) {
                        console.error('❌ Error en Web Checkout Handler:', error);
                        if (onError) onError(error);
                    }
                };
            }
        });
    } catch (error) {
        console.error('❌ Error al abrir modal de Wompi:', error);
        if (onError) onError(error);
    }
};

/**
 * Abre el Widget de Wompi (pago embebido)
 */
const openWompiWidget = async (wompiParams, onSuccess, onError) => {
    try {
        console.log('🎨 Opening Widget...');
        console.log('📦 Wompi Params for Widget:', wompiParams);

        // Verificar que WidgetCheckout esté disponible
        if (typeof window.WidgetCheckout === 'undefined') {
            throw new Error('WidgetCheckout no está disponible. Verifica que el script de Wompi esté cargado en index.html');
        }

        console.log('🔧 Creating WidgetCheckout instance...');
        const checkout = new window.WidgetCheckout({
            currency: wompiParams.currency,
            amountInCents: wompiParams.amount_in_cents,
            reference: wompiParams.reference,
            publicKey: wompiParams.public_key,
            signature: { integrity: wompiParams.signature },
            redirectUrl: wompiParams.redirect_url,
        });

        console.log('🚀 Opening Wompi Widget...');
        checkout.open(function (result) {
            const transaction = result.transaction;
            console.log('💳 Transaction Result:', transaction);

            if (transaction.status === 'APPROVED') {
                Swal.fire({
                    title: '¡Pago Exitoso!',
                    text: `Transacción aprobada: ${transaction.id}`,
                    icon: 'success',
                    background: '#151E32',
                    color: '#fff'
                }).then(() => {
                    if (onSuccess) onSuccess(transaction);
                });
            } else if (transaction.status === 'DECLINED') {
                Swal.fire({
                    title: 'Pago Rechazado',
                    text: 'Tu banco ha rechazado la transacción.',
                    icon: 'error',
                    background: '#151E32',
                    color: '#fff'
                });
            } else {
                Swal.fire({
                    title: 'Transacción Finalizada',
                    text: `Estado: ${transaction.status}`,
                    icon: 'info',
                    background: '#151E32',
                    color: '#fff'
                }).then(() => {
                    if (onSuccess) onSuccess(transaction);
                });
            }
        });
    } catch (error) {
        console.error('❌ Error en Widget:', error);
        Swal.fire({
            title: 'Error',
            text: `No se pudo abrir el widget de pago: ${error.message}`,
            icon: 'error',
            background: '#151E32',
            color: '#fff'
        });
        if (onError) onError(error);
    }
};

/**
 * Redirige a la página web de Wompi (pago externo)
 */
const openWompiWeb = (wompiParams) => {
    try {
        console.log('🌐 Redirecting to Wompi Web Checkout...');
        console.log('📦 Wompi Params for Web:', wompiParams);

        // Validar parámetros requeridos
        const requiredParams = ['public_key', 'currency', 'amount_in_cents', 'reference', 'signature', 'redirect_url'];
        const missingParams = requiredParams.filter(param => !wompiParams[param]);

        if (missingParams.length > 0) {
            console.error('❌ Missing Wompi Params:', missingParams);
            Swal.fire({
                title: 'Error de Configuración',
                text: `Faltan parámetros de pago: ${missingParams.join(', ')}`,
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
            return;
        }

        console.log('📝 Creating form for Wompi Web Checkout...');
        // Crear formulario para POST
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://checkout.wompi.co/p/';

        const params = {
            'public-key': wompiParams.public_key,
            'currency': wompiParams.currency,
            'amount-in-cents': wompiParams.amount_in_cents,
            'reference': wompiParams.reference,
            'signature:integrity': wompiParams.signature,
            'redirect-url': wompiParams.redirect_url
        };

        console.log('📋 Form params:', params);

        for (const key in params) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = params[key];
            form.appendChild(input);
        }

        document.body.appendChild(form);
        console.log('🚀 Submitting form to Wompi...');
        form.submit();
    } catch (error) {
        console.error('❌ Error en Web Checkout:', error);
        Swal.fire({
            title: 'Error',
            text: `No se pudo redirigir a Wompi: ${error.message}`,
            icon: 'error',
            background: '#151E32',
            color: '#fff'
        });
    }
};
