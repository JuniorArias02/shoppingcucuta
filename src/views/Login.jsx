import { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import Swal from 'sweetalert2';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Store, ShoppingBag, Tag, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
    { icon: ShoppingBag, label: 'Gestiona tus productos fácilmente' },
    { icon: Tag, label: 'Administra categorías y ofertas' },
    { icon: CreditCard, label: 'Controla pedidos y pagos en tiempo real' },
];

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ email, password });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: error.response?.data?.message || 'Credenciales incorrectas',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#D9258B'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">

            {/* ── LEFT PANEL (decorativo, oculto en móvil) ────────────────── */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden bg-sc-navy px-16 py-14">

                {/* Blobs de fondo */}
                <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] bg-sc-magenta/25 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-60px] right-[-60px] w-[320px] h-[320px] bg-sc-cyan/20 rounded-full blur-[100px] pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10 flex items-center">
                    <img src="/logo.jpg" alt="Shopping Cúcuta" className="h-10 w-auto object-contain rounded-lg shadow-lg shadow-sc-magenta/30" />
                </div>

                {/* Centro: copy principal */}
                <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                        <p className="text-sc-magenta text-sm font-semibold uppercase tracking-widest">Panel de Administración</p>
                        <h2 className="text-5xl font-extrabold text-white leading-tight">
                            Tu tienda,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sc-magenta to-sc-cyan">
                                bajo control.
                            </span>
                        </h2>
                        <p className="text-slate-400 text-base max-w-sm">
                            Gestiona productos, pedidos y clientes desde un solo lugar, con todas las herramientas que necesitas.
                        </p>
                    </div>

                    <ul className="space-y-4">
                        {FEATURES.map(({ icon: Icon, label }) => (
                            <li key={label} className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sc-cyan">
                                    <Icon size={18} />
                                </span>
                                <span className="text-slate-300 text-sm">{label}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer del panel */}
                <p className="relative z-10 text-slate-600 text-xs">
                    &copy; {new Date().getFullYear()} Shopping Cúcuta. Todos los derechos reservados.
                </p>
            </div>

            {/* ── RIGHT PANEL (formulario) ─────────────────────────────────── */}
            <div className="flex flex-col justify-center w-full lg:w-1/2 bg-sc-navy-card px-8 sm:px-16 lg:px-20 py-14 relative overflow-hidden">

                {/* Blob sutil de fondo en móvil */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-sc-magenta/10 rounded-full blur-[100px] pointer-events-none lg:hidden" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-sc-cyan/10 rounded-full blur-[80px] pointer-events-none lg:hidden" />

                <div className="relative z-10 max-w-sm w-full mx-auto">

                    {/* Logo visible solo en móvil */}
                    <div className="mb-10 lg:hidden">
                        <img src="/logo.jpg" alt="Shopping Cúcuta" className="h-10 w-auto object-contain rounded-lg shadow-lg shadow-sc-magenta/30" />
                    </div>

                    {/* Encabezado del form */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-white">Bienvenido</h1>
                        <p className="text-slate-400 mt-2 text-sm">
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Correo electrónico
                            </label>
                            <div className="relative group">
                                <Mail
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-cyan transition-colors"
                                    size={18}
                                />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-sc-navy/60 border border-slate-700/60 text-white pl-11 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-sc-cyan/30 focus:border-sc-cyan outline-none transition-all placeholder-slate-600 text-sm"
                                    placeholder="tu@correo.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <Lock
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-magenta transition-colors"
                                    size={18}
                                />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-sc-navy/60 border border-slate-700/60 text-white pl-11 pr-12 py-3.5 rounded-xl focus:ring-2 focus:ring-sc-magenta/30 focus:border-sc-magenta outline-none transition-all placeholder-slate-600 text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sc-magenta transition-colors focus:outline-none"
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot password */}
                        <div className="flex justify-end">
                            <Link
                                to="/password-reset"
                                className="text-xs text-slate-500 hover:text-sc-cyan transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-sc-magenta/20 hover:shadow-sc-magenta/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? 'Iniciando sesión...' : 'Ingresar al Dashboard'}
                            {!loading && (
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            )}
                        </button>

                        {/* Links secundarios */}
                        <div className="pt-4 space-y-3 text-center">
                            <p className="text-sm text-slate-500">
                                ¿No tienes cuenta?{' '}
                                <Link to="/register" className="text-sc-magenta font-semibold hover:text-white transition-colors">
                                    Crear Cuenta
                                </Link>
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-xs text-sc-cyan hover:text-white transition-colors font-medium"
                            >
                                <Store size={14} />
                                Ir a la tienda
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
