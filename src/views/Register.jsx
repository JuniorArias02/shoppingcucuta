import { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import Swal from 'sweetalert2';
import { Lock, Mail, User, ArrowRight, Eye, EyeOff, ShoppingBag, Star, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const PERKS = [
    { icon: ShoppingBag, label: 'Accede a varios productos locales' },
    { icon: Star, label: 'Guarda tus favoritos y listas de deseos' },
    { icon: Truck, label: 'Se notifica seguimiento del pedidos' },
];

export default function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirmation) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden', background: '#151E32', color: '#fff' });
            return;
        }
        setLoading(true);
        try {
            await AuthService.register(formData);
            await login({ email: formData.email, password: formData.password });
            navigate('/');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al registrarse',
                text: error.response?.data?.message || JSON.stringify(error.response?.data) || 'Ocurrió un error',
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

            {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden bg-sc-navy px-16 py-14">

                <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] bg-sc-cyan/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] bg-sc-magenta/15 rounded-full blur-[100px] pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10 flex items-center">
                    <img src="/logo.jpg" alt="Shopping Cúcuta" className="h-10 w-auto object-contain rounded-lg shadow-lg shadow-sc-cyan/30" />
                </div>

                {/* Copy */}
                <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                        <p className="text-sc-cyan text-sm font-semibold uppercase tracking-widest">Únete hoy</p>
                        <h2 className="text-5xl font-extrabold text-white leading-tight">
                            Empieza a<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sc-cyan to-sc-magenta">
                                comprar local.
                            </span>
                        </h2>
                        <p className="text-slate-400 text-base max-w-sm">
                            Crea tu cuenta gratis y descubre lo mejor del comercio de Cúcuta desde donde estés.
                        </p>
                    </div>

                    <ul className="space-y-4">
                        {PERKS.map(({ icon: Icon, label }) => (
                            <li key={label} className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sc-cyan">
                                    <Icon size={18} />
                                </span>
                                <span className="text-slate-300 text-sm">{label}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative z-10 text-slate-600 text-xs">
                    &copy; {new Date().getFullYear()} Shopping Cúcuta. Todos los derechos reservados.
                </p>
            </div>

            {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
            <div className="flex flex-col justify-center w-full lg:w-1/2 bg-sc-navy-card px-8 sm:px-16 lg:px-20 py-14 relative overflow-hidden">

                <div className="absolute top-0 left-0 w-72 h-72 bg-sc-cyan/10 rounded-full blur-[100px] pointer-events-none lg:hidden" />
                <div className="absolute bottom-0 right-0 w-56 h-56 bg-sc-magenta/10 rounded-full blur-[80px] pointer-events-none lg:hidden" />

                <div className="relative z-10 max-w-sm w-full mx-auto">

                    {/* Logo móvil */}
                    <div className="mb-10 lg:hidden">
                        <img src="/logo.jpg" alt="Shopping Cúcuta" className="h-10 w-auto object-contain rounded-lg shadow-lg shadow-sc-cyan/30" />
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-white">Crear Cuenta</h1>
                        <p className="text-slate-400 mt-2 text-sm">
                            Únete gratis en menos de un minuto
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Nombre */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre completo</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-cyan transition-colors" size={18} />
                                <input
                                    id="nombre"
                                    type="text"
                                    value={formData.nombre}
                                    onChange={set('nombre')}
                                    className="w-full bg-sc-navy/60 border border-slate-700/60 text-white pl-11 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-sc-cyan/30 focus:border-sc-cyan outline-none transition-all placeholder-slate-600 text-sm"
                                    placeholder="Tu nombre"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Correo electrónico</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-cyan transition-colors" size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={set('email')}
                                    className="w-full bg-sc-navy/60 border border-slate-700/60 text-white pl-11 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-sc-cyan/30 focus:border-sc-cyan outline-none transition-all placeholder-slate-600 text-sm"
                                    placeholder="tu@correo.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-magenta transition-colors" size={18} />
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={set('password')}
                                    className="w-full bg-sc-navy/60 border border-slate-700/60 text-white pl-11 pr-12 py-3.5 rounded-xl focus:ring-2 focus:ring-sc-magenta/30 focus:border-sc-magenta outline-none transition-all placeholder-slate-600 text-sm"
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    minLength={8}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sc-magenta transition-colors focus:outline-none"
                                    aria-label={showPass ? 'Ocultar' : 'Mostrar'}>
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmar contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-magenta transition-colors" size={18} />
                                <input
                                    id="password_confirmation"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={formData.password_confirmation}
                                    onChange={set('password_confirmation')}
                                    className="w-full bg-sc-navy/60 border border-slate-700/60 text-white pl-11 pr-12 py-3.5 rounded-xl focus:ring-2 focus:ring-sc-magenta/30 focus:border-sc-magenta outline-none transition-all placeholder-slate-600 text-sm"
                                    placeholder="Repite tu contraseña"
                                    required
                                    minLength={8}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sc-magenta transition-colors focus:outline-none"
                                    aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}>
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group bg-gradient-to-r from-sc-cyan to-teal-500 hover:to-teal-400 text-sc-navy font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-sc-cyan/20 hover:shadow-sc-cyan/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
                        >
                            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>

                        <p className="text-center text-sm text-slate-500 pt-2">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="text-sc-cyan font-semibold hover:text-white transition-colors">
                                Iniciar Sesión
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
