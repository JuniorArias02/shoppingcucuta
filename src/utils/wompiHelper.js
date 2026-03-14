import Swal from 'sweetalert2';

/**
 * Abre el modal de selección de método de pago Wompi (Widget o Web)
 * @param {Object} wompiParams - Parámetros de Wompi del backend
 * @param {Function} onSuccess - Callback cuando el pago es exitoso
 * @param {Function} onError - Callback cuando hay un error
 */
export const openWompiPayment = async (wompiParams, onSuccess, onError) => {
    try {
        // Mostrar modal de selección
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
 * Asegura que el script de Wompi esté cargado usando un mecanismo de polling
 */
const ensureWompiScriptLoaded = () => {
    return new Promise((resolve, reject) => {
        // Wompi recomienda usar siempre esta URL, el ambiente se define por la llave pública
        const scriptSrc = 'https://checkout.wompi.co/widget.js';
        
        console.log('🔍 Checking Wompi Script...');

        // 1. Polling: Verificar si el objeto global aparece
        let attempts = 0;
        const maxAttempts = 100; // 10 segundos
        
        const checkGlobal = setInterval(() => {
            attempts++;
            
            if (typeof window.WidgetCheckout !== 'undefined') {
                console.log('✅ WidgetCheckout found in global scope!');
                clearInterval(checkGlobal);
                return resolve();
            }

            // En cada intento, ver si el script tag existe
            if (attempts % 10 === 0) {
                const scriptTag = document.querySelector(`script[src*="wompi.co/widget.js"]`);
                console.log(`⏳ Attempt ${attempts/10}s: WidgetCheckout still undefined. Script tag exists: ${!!scriptTag}`);
            }

            if (attempts >= maxAttempts) {
                clearInterval(checkGlobal);
                const scriptTag = document.querySelector(`script[src*="wompi.co/widget.js"]`);
                
                if (!scriptTag) {
                    // Si no está el tag, intentamos inyectarlo como último recurso
                    console.log('🌐 Script tag missing, trying emergency injection...');
                    const s = document.createElement('script');
                    s.src = scriptSrc;
                    s.async = true;
                    document.head.appendChild(s);
                    // Damos 3 segundos más
                    setTimeout(() => {
                        if (typeof window.WidgetCheckout !== 'undefined') resolve();
                        else reject(new Error('El script de Wompi no se pudo cargar. Por favor refresca la página e intenta de nuevo.'));
                    }, 3000);
                    return;
                }

                reject(new Error('Wompi se cargó pero no se inicializó correctamente (WidgetCheckout is undefined).'));
            }
        }, 100);
    });
};

/**
 * Abre el Widget de Wompi (pago embebido)
 */
const openWompiWidget = async (wompiParams, onSuccess, onError) => {
    try {
        console.log('🎨 Opening Widget...');
        console.log('📦 Wompi Params for Widget:', wompiParams);

        if (!wompiParams.public_key) {
            throw new Error('La llave pública de Wompi no se recibió del servidor.');
        }

        // Asegurar que el script esté listo (máximo 10 segundos)
        await ensureWompiScriptLoaded();

        console.log('✅ WidgetCheckout is available');
        
        const checkout = new window.WidgetCheckout({
            currency: wompiParams.currency,
            amountInCents: wompiParams.amount_in_cents,
            reference: wompiParams.reference,
            publicKey: wompiParams.public_key,
            signature: wompiParams.signature ? {
                integrity: wompiParams.signature.integrity,
                ...(wompiParams.signature.expiration_time && { expirationTime: wompiParams.signature.expiration_time })
            } : undefined,
            redirectUrl: wompiParams.redirect_url,
        });

        console.log('✅ WidgetCheckout instance created successfully');
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

        console.log('✅ Widget opened successfully');

    } catch (error) {
        console.error('❌ Error en Widget:', error);
        
        Swal.fire({
            title: 'Error de Inicialización',
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
const openWompiWeb = async (wompiParams) => {
    try {
        console.log('🌐 Redirecting to Wompi Web Checkout...');
        console.log('📦 Wompi Params for Web:', wompiParams);

        // Validar parámetros requeridos (coincidiendo con test_wompi.html)
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

        console.log('📝 Creating URL for Wompi Web Checkout (GET)...');

        // Prepare URL parameters - EXACTLY as in test_wompi.html
        // Using snake-case keys as expected by Wompi's GET endpoint
        const queryParams = new URLSearchParams({
            'public-key': String(wompiParams.public_key || '').trim(),
            'currency': String(wompiParams.currency || '').trim(),
            'amount-in-cents': String(wompiParams.amount_in_cents || '').trim(),
            'reference': String(wompiParams.reference || '').trim(),
            'redirect-url': String(wompiParams.redirect_url || '').trim()
        });

        // Add signature parameters
        // NOTE: Backend returns 'expiration_time', Wompi expects 'signature:timestamp'
        if (wompiParams.signature) {
            queryParams.append('signature:integrity', String(wompiParams.signature.integrity || '').trim());

            // Handle both potential key names (expiration_time from backend, or expirationTime if changed)
            const timestamp = wompiParams.signature.expiration_time || wompiParams.signature.expirationTime;
            queryParams.append('signature:timestamp', String(timestamp || '').trim());
        }

        const isSandbox = (wompiParams.public_key || '').startsWith('pub_test');
        const baseUrl = isSandbox ? 'https://sandbox.wompi.co/p/' : 'https://checkout.wompi.co/p/';
        
        const checkoutUrl = `${baseUrl}?${queryParams.toString()}`;

        console.log('🌐 Generated URL (' + (isSandbox ? 'Sandbox' : 'Production') + '):', checkoutUrl);

        // Copiar al portapapeles automáticamente
        try {
            await navigator.clipboard.writeText(checkoutUrl);
        } catch (err) {
            console.warn('Could not copy to clipboard', err);
        }

        // Mostrar alerta con la URL (Similar a test_wompi.html payWithURL)
        const confirmResult = await Swal.fire({
            title: 'URL Generada (Copiada)',
            text: 'Hemos generado tu enlace de pago seguro.',
            input: 'text',
            inputValue: checkoutUrl,
            inputAttributes: {
                readonly: true
            },
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: '🚀 Ir a Pagar',
            cancelButtonText: 'Cerrar',
            background: '#151E32',
            color: '#fff',
            customClass: {
                input: 'text-slate-900 font-mono text-sm'
            }
        });

        if (confirmResult.isConfirmed) {
            // Abrir en nueva pestaña para evitar bloqueos y mantener la app abierta
            window.open(checkoutUrl, '_blank');
        }

    } catch (error) {
        console.error('❌ Error en Web Checkout:', error);
        Swal.fire({
            title: 'Error',
            text: `No se pudo generar el enlace: ${error.message}`,
            icon: 'error',
            background: '#151E32',
            color: '#fff'
        });
    }
};
