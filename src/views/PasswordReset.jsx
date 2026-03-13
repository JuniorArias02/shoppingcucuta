import { useState } from 'react';
import AuthService from '../services/AuthService';
import { Mail, Key, ShieldCheck, ArrowRight, Lock, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const STEP_META = [
    { icon: Mail, color: 'text-sc-cyan', title: 'Recuperar Cuenta', desc: 'Ingresa tu correo para recibir un código de verificación.' },
    { icon: ShieldCheck, color: 'text-sc-magenta', title: 'Código Enviado', desc: null },
    { icon: Key, color: 'text-green-400', title: 'Nueva Contraseña', desc: 'Ingresa el código y crea una contraseña segura.' },
];

export default function PasswordReset() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const showAlert = (icon, title, text) =>
        Swal.fire({ icon, title, text, background: '#151E32', color: '#fff', confirmButtonColor: '#D9258B' });

    const handleSendCode = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        setLoading(true);
        try {
            await AuthService.sendRecoveryCode(email);
            setStep(2);
            showAlert('success', '¡Código Enviado!', `Hemos enviado un código de recuperación a ${email}`);
        } catch (err) {
            showAlert('error', 'Error', err.response?.data?.message || 'No pudimos enviar el código.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            showAlert('error', 'Error', 'Las contraseñas no coinciden.');
            return;
        }
        setLoading(true);
        try {
            const { access_token } = await AuthService.resetPassword({ email, code, password, password_confirmation: passwordConfirmation });
            localStorage.setItem('ACCESS_TOKEN', access_token);
            await Swal.fire({ icon: 'success', title: '¡Contraseña Restablecida!', text: 'Has recuperado el acceso.', background: '#151E32', color: '#fff', confirmButtonColor: '#D9258B', timer: 2000, showConfirmButton: false });
            window.location.href = '/';
        } catch (err) {
            showAlert('error', 'Error', err.response?.data?.message || 'Código inválido o expirado.');
        } finally {
            setLoading(false);
        }
    };

    const meta = STEP_META[step - 1];
    const StepIcon = meta.icon;

    return (
        <div className="min-h-screen w-full flex">

            {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden bg-sc-navy px-16 py-14">

                <div className="absolute top-[-60px] left-[-60px] w-[380px] h-[380px] bg-sc-magenta/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-80px] right-[-40px] w-[300px] h-[300px] bg-sc-cyan/15 rounded-full blur-[100px] pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10 flex items-center">
                    <div className="p-1 bg-white/5 rounded-xl border border-white/10 shadow-xl shadow-sc-magenta/20">
                        <img src="/logo.jpg" alt="Shopping Cúcuta" className="h-12 w-auto object-contain" />
                    </div>
                </div>

                {/* Copy */}
                <div className="relative z-10 space-y-6">
                    <div className="space-y-4">
                        <p className="text-sc-magenta text-sm font-semibold uppercase tracking-widest">Recuperación de cuenta</p>
                        <h2 className="text-5xl font-extrabold text-white leading-tight">
                            Sin acceso<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sc-magenta to-sc-cyan">
                                no te quedas.
                            </span>
                        </h2>
                        <p className="text-slate-400 text-base max-w-sm">
                            Recupera tu cuenta en 3 pasos simples. Tu seguridad es nuestra prioridad.
                        </p>
                    </div>

                    {/* Steps visual */}
                    <div className="space-y-3">
                        {[
                            { n: 1, label: 'Ingresa tu correo electrónico' },
                            { n: 2, label: 'Recibe el código de verificación' },
                            { n: 3, label: 'Crea tu nueva contraseña' },
                        ].map(({ n, label }) => (
                            <div key={n} className="flex items-center gap-3">
                                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                    ${step >= n ? 'bg-sc-magenta text-white shadow-lg shadow-sc-magenta/30' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                                    {n}
                                </span>
                                <span className={`text-sm transition-colors ${step >= n ? 'text-slate-200' : 'text-slate-600'}`}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-slate-600 text-xs">
                    &copy; {new Date().getFullYear()} Shopping Cúcuta. Seguridad garantizada.
                </p>
            </div>

            {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
            <div className="flex flex-col justify-center w-full lg:w-1/2 bg-sc-navy-card px-8 sm:px-16 lg:px-20 py-14 relative overflow-hidden">

                <div className="absolute top-0 right-0 w-72 h-72 bg-sc-magenta/10 rounded-full blur-[100px] pointer-events-none lg:hidden" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-sc-cyan/10 rounded-full blur-[80px] pointer-events-none lg:hidden" />

                <div className="relative z-10 max-w-sm w-full mx-auto">

                    {/* Logo móvil */}
                    <div className="flex items-center gap-3 mb-10 lg:hidden">
                        <div className="w-11 h-11 rounded-lg overflow-hidden shadow-lg shadow-sc-magenta/30 bg-white/5 p-1">
                            <img src="/logo.jpg" alt="Shopping Cúcuta" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-white font-bold tracking-tight">Shopping Cúcuta</span>
                    </div>

                    {/* Step icon + header */}
                    <div className="mb-8 space-y-1">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mb-4 ${meta.color}`}>
                            <StepIcon size={24} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white">{meta.title}</h1>
                        <p className="text-slate-400 text-sm">
                            {meta.desc ?? `Ingresa el código que enviamos a `}
                            {step === 2 && <span className="text-sc-cyan font-medium">{email}</span>}
                        </p>
                    </div>

                    {/* ── PASO 1: Email ── */}
                    {step === 1 && (
                        <form onSubmit={handleSendCode} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Correo electrónico</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-cyan transition-colors" size={18} />
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
                            <button type="submit" disabled={loading}
                                className="w-full group bg-gradient-to-r from-sc-cyan to-blue-600 hover:to-blue-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-sc-cyan/20 hover:shadow-sc-cyan/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                                {loading ? 'Enviando...' : 'Enviar Código'}
                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    )}

                    {/* ── PASO 2: Confirmación envío ── */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-sc-navy/50 border border-white/5 rounded-xl px-5 py-4 text-sm text-slate-300">
                                Revisa tu bandeja de entrada (y spam). Una vez tengas el código, continúa.
                            </div>
                            <button onClick={() => setStep(3)}
                                className="w-full group bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-sc-magenta/20 hover:shadow-sc-magenta/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm">
                                Tengo el Código
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)}
                                    className="flex-1 bg-transparent border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-medium py-3 px-4 rounded-xl transition-all text-sm">
                                    Cambiar Correo
                                </button>
                                <button onClick={handleSendCode}
                                    className="flex-1 border border-sc-cyan/30 text-sc-cyan hover:bg-sc-cyan/10 font-medium py-3 px-4 rounded-xl transition-all text-sm">
                                    Reenviar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── PASO 3: Código + Nueva contraseña ── */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">

                            {/* Código */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Código de verificación</label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-400 transition-colors" size={18} />
                                    <input
                                        id="code"
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full bg-sc-navy/60 border border-slate-700/60 text-white pl-11 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-green-400/30 focus:border-green-400 outline-none transition-all placeholder-slate-600 tracking-[0.4em] text-center text-sm font-mono"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Nueva contraseña */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nueva contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-magenta transition-colors" size={18} />
                                    <input
                                        id="password"
                                        type={showPass ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-sc-navy/60 border border-slate-700/60 text-white pl-11 pr-12 py-3.5 rounded-xl focus:ring-2 focus:ring-sc-magenta/30 focus:border-sc-magenta outline-none transition-all placeholder-slate-600 text-sm"
                                        placeholder="Mínimo 8 caracteres"
                                        minLength={8}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sc-magenta transition-colors focus:outline-none"
                                        aria-label={showPass ? 'Ocultar' : 'Mostrar'}>
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirmar contraseña */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmar contraseña</label>
                                <div className="relative group">
                                    <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sc-magenta transition-colors" size={18} />
                                    <input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        className="w-full bg-sc-navy/60 border border-slate-700/60 text-white pl-11 pr-12 py-3.5 rounded-xl focus:ring-2 focus:ring-sc-magenta/30 focus:border-sc-magenta outline-none transition-all placeholder-slate-600 text-sm"
                                        placeholder="Repite la contraseña"
                                        minLength={8}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sc-magenta transition-colors focus:outline-none"
                                        aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}>
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full group bg-gradient-to-r from-green-500 to-emerald-600 hover:to-emerald-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    )}

                    {/* Back to login */}
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <Link to="/login" className="text-sm text-slate-500 hover:text-white transition-colors">
                            ← Volver al Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
