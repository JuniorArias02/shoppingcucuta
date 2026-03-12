import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useCart } from '../../store/CartContext';
import {
    LogOut, ShoppingCart, Search, Menu, User,
    LayoutDashboard, Heart, ShoppingBag, Settings,
    Home, X, CreditCard
} from 'lucide-react';
import { useState } from 'react';

// Ítems del sidebar — cliente
const CLIENT_MENU = [
    { path: '/client/dashboard', label: 'Resumen', icon: LayoutDashboard },
    { path: '/client/favorites', label: 'Mis Favoritos', icon: Heart },
    { path: '/client/pending-payments', label: 'Pagos Pendientes', icon: CreditCard },
    { path: '/client/orders', label: 'Mis Compras', icon: ShoppingBag },
    { path: '/client/settings', label: 'Configuración', icon: Settings },
];

// Ítems del sidebar — admin
const ADMIN_MENU = [
    { path: '/admin/dashboard', label: 'Panel Admin', icon: LayoutDashboard },
    { path: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
    { path: '/admin/settings', label: 'Configuración', icon: Settings },
];

export default function AppLayout() {
    const { user, logout } = useAuth();
    const { count } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/search?q=${e.target.value}`);
        }
    };

    const isActive = (path) => location.pathname === path;

    // Determina qué menú mostrar según el rol
    const menuItems = user?.rol_id === 2 ? CLIENT_MENU : ADMIN_MENU;
    const accentColor = user?.rol_id === 2 ? 'sc-cyan' : 'sc-magenta';

    return (
        <div className="min-h-screen bg-sc-navy font-sans text-slate-100">

            {/* ── SIDEBAR OVERLAY (fondo oscuro al abrir) ── */}
            {sidebarOpen && user && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── SIDEBAR DESLIZANTE ── */}
            {user && (
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-72
                    bg-sc-navy-card/95 backdrop-blur-md border-r border-slate-800
                    transform transition-transform duration-300 ease-in-out shadow-2xl
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="h-full flex flex-col">

                        {/* Brand Header */}
                        <div className="h-24 flex items-center px-8 border-b border-slate-800/60 bg-gradient-to-r from-sc-navy-card to-transparent">
                            <Link to="/" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-sc-magenta/20 group-hover:shadow-sc-magenta/40 transition-shadow duration-300">
                                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:to-white transition-all">
                                        Shopping
                                    </span>
                                    <span className={`text-sm font-bold tracking-wide uppercase ${user?.rol_id === 2 ? 'text-sc-cyan' : 'text-sc-magenta'}`}>
                                        {user?.rol_id === 2 ? 'Cliente' : 'Admin'}
                                    </span>
                                </div>
                            </Link>
                            <button
                                className="ml-auto text-slate-400 hover:text-white transition-colors"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="px-6 py-5 border-b border-slate-800/60">
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 bg-gradient-to-br from-sc-magenta to-sc-purple p-[2px] rounded-full`}>
                                    <div className="w-full h-full bg-sc-navy rounded-full flex items-center justify-center text-white font-bold">
                                        {user?.nombre?.charAt(0) || 'U'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white leading-tight">{user?.nombre}</p>
                                    <p className={`text-xs mt-0.5 ${user?.rol_id === 2 ? 'text-sc-cyan' : 'text-sc-magenta'}`}>
                                        {user?.rol_id === 2 ? 'Cliente' : 'Administrador'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                            <div className="px-4 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                                Mi Cuenta
                            </div>
                            {menuItems.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group overflow-hidden
                                            ${active
                                                ? `text-white shadow-lg bg-gradient-to-r ${user?.rol_id === 2 ? 'from-sc-cyan/10 shadow-sc-cyan/10' : 'from-sc-magenta/10 shadow-sc-magenta/10'} to-transparent`
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        {active && (
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full ${user?.rol_id === 2 ? 'bg-sc-cyan' : 'bg-sc-magenta'}`} />
                                        )}
                                        <item.icon
                                            size={22}
                                            className={`transition-colors duration-300
                                                ${active
                                                    ? user?.rol_id === 2 ? 'text-sc-cyan' : 'text-sc-magenta'
                                                    : 'text-slate-500 group-hover:text-sc-cyan'
                                                }`}
                                        />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Footer */}
                        <div className="p-4 mx-4 mb-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                            <Link
                                to="/"
                                onClick={() => setSidebarOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                            >
                                <Home size={20} className="text-sc-magenta" />
                                Ir a la Tienda
                            </Link>
                            <button
                                onClick={() => { logout(); setSidebarOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
                            >
                                <LogOut size={20} />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* Background Ambient Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-sc-magenta/10 rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-sc-cyan/10 rounded-full blur-[150px] opacity-20"></div>
            </div>

            {/* ── TOP NAVIGATION BAR ── */}
            <nav className="sticky top-0 z-30 bg-sc-navy-card/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20 gap-4">

                        {/* Logo + botón hamburguesa (si está logueado) */}
                        <div className="flex items-center gap-4">
                            {user && (
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="p-2 -ml-2 hover:bg-white/5 rounded-lg text-slate-300 transition-colors"
                                    aria-label="Abrir menú"
                                >
                                    <Menu size={24} />
                                </button>
                            )}
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-sc-magenta/20 group-hover:shadow-sc-magenta/40 transition-shadow duration-300">
                                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:to-white transition-all leading-none">
                                        Shopping
                                    </span>
                                    <span className="text-xs font-bold text-sc-magenta tracking-wide uppercase leading-none mt-0.5">Cúcuta</span>
                                </div>
                            </Link>

                            {/* Desktop link Ofertas */}
                            <div className="hidden md:flex items-center gap-1">
                                <Link
                                    to="/products?ofertas=true"
                                    className="px-4 py-2 rounded-full bg-sc-magenta/10 text-sc-magenta hover:bg-sc-magenta hover:text-white transition-all text-sm font-bold flex items-center gap-2 border border-sc-magenta/20 hover:border-sc-magenta"
                                >
                                    Ofertas 🔥
                                </Link>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-6">
                            <div className="relative w-full group">
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    onKeyDown={handleSearch}
                                    className="w-full pl-5 pr-12 py-3 rounded-full bg-sc-navy border border-slate-700 focus:border-sc-cyan/50 focus:ring-2 focus:ring-sc-cyan/20 outline-none transition-all text-sm text-white placeholder-slate-500"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 group-focus-within:text-sc-cyan transition-colors">
                                    <Search size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 sm:gap-6">

                            {user ? (
                                /* Botón "Mi Cuenta" que abre el sidebar */
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="flex items-center gap-2 hover:bg-white/5 px-3 py-2 rounded-xl transition"
                                >
                                    <div className="w-9 h-9 bg-gradient-to-br from-sc-magenta to-sc-purple p-[1px] rounded-full">
                                        <div className="w-full h-full bg-sc-navy rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {user?.nombre?.charAt(0) || 'U'}
                                        </div>
                                    </div>
                                    <div className="hidden lg:block text-sm leading-tight text-left">
                                        <p className="text-slate-400 text-xs">Hola, {user?.nombre?.split(' ')[0] || 'Usuario'}</p>
                                        <p className="font-bold text-white">Mi Cuenta</p>
                                    </div>
                                </button>
                            ) : (
                                <Link to="/login" className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-xl transition group text-slate-300 hover:text-white">
                                    <User size={22} className="group-hover:text-sc-cyan transition-colors" />
                                    <div className="hidden lg:block text-sm leading-tight">
                                        <p className="text-slate-500 text-xs">Bienvenido</p>
                                        <p className="font-bold group-hover:text-sc-cyan transition-colors">Iniciar Sesión</p>
                                    </div>
                                </Link>
                            )}

                            {/* Cart */}
                            <Link to="/cart" className="relative p-2.5 hover:bg-white/5 rounded-full transition group text-slate-300 hover:text-white">
                                <ShoppingCart size={24} className="group-hover:text-sc-magenta transition-colors" />
                                {count > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-sc-magenta text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-sc-navy shadow-lg transform group-hover:scale-110 transition-transform">
                                        {count}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden px-4 pb-4">
                    <div className="relative w-full group">
                        <input
                            type="text"
                            placeholder="Buscar en la tienda..."
                            onKeyDown={handleSearch}
                            className="w-full pl-5 pr-12 py-2.5 rounded-full bg-sc-navy/50 border border-slate-700 focus:border-sc-cyan transition-all text-sm text-white"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 group-focus-within:text-sc-cyan transition-colors">
                            <Search size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
                <Outlet />
            </main>
        </div>
    );
}
