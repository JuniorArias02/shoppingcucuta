import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, LayoutDashboard, ShoppingBag, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

export default function HeroSection() {
    const { user, logout } = useAuth();
    const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
    const [fade, setFade] = useState(true);

    const guestMessages = [
        "Nueva Colección 2026 ✨",
        "Envíos seguros a todo Cúcuta 🛵",
        "¿Buscas tecnología de punta? 📱",
        "Calidad garantizada en cada compra ⭐"
    ];

    const userMessages = [
        "Qué gusto tenerte de vuelta ✨",
        "¿Qué te gustaría descubrir hoy? 🔍",
        "Tenemos novedades para ti 🎁",
        "Revisa tus favoritos ❤️"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentMsgIndex((prev) => (prev + 1) % (user ? userMessages.length : guestMessages.length));
                setFade(true);
            }, 500); // Wait for fade out
        }, 4000);

        return () => clearInterval(interval);
    }, [user, guestMessages.length, userMessages.length]); // Added dependencies for linting

    const currentMessage = user ? userMessages[currentMsgIndex] : guestMessages[currentMsgIndex];

    return (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-sc-navy-card border border-white/5 h-auto md:h-[32rem] flex items-center px-4 py-8 md:px-16 md:py-0 group transition-all duration-500">
            {/* Background Gradient Mesh */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-sc-magenta/20 to-sc-purple/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-sc-cyan/10 to-transparent rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 opacity-40 pointer-events-none"></div>

            <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">

                {/* Left Content */}
                <div className="max-w-2xl space-y-4 md:space-y-6 text-center md:text-left mx-auto md:mx-0 flex-1">
                    {!user ? (
                        <>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm self-center md:self-start mx-auto md:mx-0 w-fit">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sc-cyan opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sc-cyan"></span>
                                </span>
                                <span className={`text-[10px] md:text-xs font-bold text-sc-cyan tracking-wider uppercase transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                                    {currentMessage}
                                </span>
                            </div>

                            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                                Tecnología que <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sc-magenta via-purple-500 to-sc-cyan animate-gradient-x">Inspira</span>
                            </h2>

                            <p className="text-base md:text-lg text-slate-400 max-w-lg leading-relaxed mx-auto md:mx-0">
                                Descubre lo último en gadgets, accesorios y estilo de vida con la calidad y garantía de Shopping Cúcuta.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center md:justify-start">
                                <Link to="/products?ofertas=true" className="bg-sc-magenta hover:bg-pink-600 text-white font-bold px-6 py-3 md:px-8 md:py-3.5 rounded-xl shadow-lg shadow-sc-magenta/25 hover:shadow-sc-magenta/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                                    Ver Ofertas <Zap size={20} fill="currentColor" />
                                </Link>
                                <Link to="/products" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-3 md:px-8 md:py-3.5 rounded-xl backdrop-blur-sm transition-all flex items-center justify-center gap-2">
                                    Explorar Todo <ArrowRight size={20} />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6 animate-fade-in-up">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
                                    Hola, <span className="text-sc-cyan">{user.nombre.split(' ')[0]}</span> 👋
                                </h2>
                                <p className={`text-slate-400 text-lg flex items-center gap-2 justify-center md:justify-start transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                                    <Sparkles size={16} className="text-yellow-400" /> {currentMessage}
                                </p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 max-w-md mx-auto md:mx-0 shadow-xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sc-magenta to-sc-purple p-[2px]">
                                        <div className="w-full h-full bg-sc-navy-card rounded-full flex items-center justify-center font-bold text-white">
                                            {user.nombre.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Tu Cuenta</p>
                                        <p className="font-bold text-white">{user.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        to={user.rol_id === 1 ? "/admin/dashboard" : "/client/dashboard"}
                                        className="bg-sc-cyan hover:bg-cyan-400 text-sc-navy font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-sc-cyan/20"
                                    >
                                        <LayoutDashboard size={18} /> Panel
                                    </Link>
                                    <Link
                                        to={user.rol_id === 1 ? "/admin/orders" : "/client/orders"}
                                        className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                                    >
                                        <ShoppingBag size={18} /> Pedidos
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating Elements (Decorative - Desktop Only) */}
                {!user && (
                    <div className="hidden lg:block animate-float-slow pointer-events-none">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md border border-white/10 flex items-center justify-center rotate-12 shadow-xl">
                            <Zap size={40} className="text-yellow-400 drop-shadow-lg" fill="currentColor" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
