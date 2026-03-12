import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

const AgeConfirmationModal = ({ isOpen, onClose, onConfirm, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-sc-navy-card border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header Decoration */}
                <div className="h-2 bg-gradient-to-r from-sc-cyan to-blue-600"></div>
                
                <div className="p-8 text-center">
                    {/* Icon */}
                    <div className="mx-auto w-20 h-20 rounded-full bg-sc-cyan/10 flex items-center justify-center text-sc-cyan mb-6 ring-8 ring-sc-cyan/5">
                        <ShieldCheck size={40} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                        Contenido para Adultos
                    </h2>
                    
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Esta categoría contiene productos que requieren que seas mayor de edad para verlos. ¿Confirmas que tienes 18 años o más?
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="w-full py-4 bg-sc-cyan hover:bg-sc-cyan/90 disabled:opacity-50 text-sc-navy font-bold rounded-2xl transition-all duration-300 transform active:scale-[0.98] shadow-[0_0_20px_rgba(0,194,203,0.3)]"
                        >
                            {loading ? 'Confirmando...' : 'Sí, soy mayor de edad'}
                        </button>
                        
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-colors duration-300"
                        >
                            No, volver
                        </button>
                    </div>
                </div>

                <p className="text-[10px] text-slate-600 text-center pb-6 px-8 uppercase tracking-widest font-bold">
                    Responsabilidad y Seguridad Venezia
                </p>
            </div>
        </div>
    );
};

export default AgeConfirmationModal;
