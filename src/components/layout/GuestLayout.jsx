import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

export default function GuestLayout() {
    const { user } = useAuth();
    if (user) {
        // Redirect based on role or default to admin dashboard
        return <Navigate to="/admin/dashboard" />;
    }

    return <Outlet />;
}
