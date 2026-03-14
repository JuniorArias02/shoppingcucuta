import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import useInactivityTimer from '../utils/useInactivityTimer';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const data = await AuthService.login(credentials);
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
    };

    const updateUser = async () => {
        const userData = await AuthService.verifyAuth();
        if (userData) {
            setUser(userData);
        }
    };

    const confirmAge = async () => {
        const data = await AuthService.confirmAge();
        if (data.user) {
            setUser(data.user);
        }
        return data;
    };

    // Función para manejar la inactividad - Usamos useCallback para que la función sea estable
    const handleInactivity = useCallback(() => {
        console.log('🔒 Cerrando sesión por inactividad...');

        // Limpiar TODO el localStorage
        localStorage.clear();

        // Actualizar el estado del usuario
        setUser(null);

        // Opcional: Mostrar un mensaje al usuario
        Swal.fire({
            title: 'Sesión Expirada',
            text: 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.',
            icon: 'info',
            background: '#151E32',
            color: '#fff',
            confirmButtonColor: '#D9258B'
        }).then(() => {
            // Redirigir al login
            window.location.href = '/login';
        });
    }, []);

    // Activar el temporizador de inactividad solo si hay un usuario logueado
    useInactivityTimer(
        user ? handleInactivity : () => { },
        30 * 60 * 1000 // 30 minutos en milisegundos
    );

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser, confirmAge }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
