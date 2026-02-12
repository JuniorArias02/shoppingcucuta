import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook personalizado para detectar inactividad del usuario
 * @param {Function} onInactive - Función a ejecutar cuando se detecta inactividad
 * @param {number} timeout - Tiempo de inactividad en milisegundos (default: 30 minutos)
 */
const useInactivityTimer = (onInactive, timeout = 30 * 60 * 1000) => {
    const timerRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    // Función para reiniciar el temporizador
    const resetTimer = useCallback(() => {
        // Limpiar el temporizador anterior
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Actualizar la última actividad
        lastActivityRef.current = Date.now();

        // Guardar el timestamp de la última actividad en localStorage
        localStorage.setItem('lastActivity', Date.now().toString());

        // Crear un nuevo temporizador
        timerRef.current = setTimeout(() => {
            console.log('⏰ Sesión expirada por inactividad');
            onInactive();
        }, timeout);
    }, [onInactive, timeout]);

    // Eventos que consideramos como "actividad"
    const events = [
        'mousedown',
        'mousemove',
        'keypress',
        'scroll',
        'touchstart',
        'click'
    ];

    useEffect(() => {
        // Verificar si hay una sesión previa al cargar
        const lastActivity = localStorage.getItem('lastActivity');
        if (lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

            // Si han pasado más de 30 minutos desde la última actividad
            if (timeSinceLastActivity > timeout) {
                console.log('⏰ Sesión expirada (tiempo transcurrido desde última actividad)');
                onInactive();
                return;
            }
        }

        // Iniciar el temporizador
        resetTimer();

        // Agregar listeners para todos los eventos de actividad
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup: remover listeners y limpiar temporizador
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [resetTimer, onInactive, timeout]);

    return null;
};

export default useInactivityTimer;
