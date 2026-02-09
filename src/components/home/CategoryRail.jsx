import { Sparkles, Smartphone, Shirt, Home as HomeIcon, Dumbbell, Gamepad2, Tag } from 'lucide-react';

export default function CategoryRail({ categories, selectedCategory, onCategoryClick }) {

    const getCategoryIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('tecno') || n.includes('celular') || n.includes('comput')) return <Smartphone size={24} className="md:w-8 md:h-8" />;
        if (n.includes('moda') || n.includes('ropa') || n.includes('camis')) return <Shirt size={24} className="md:w-8 md:h-8" />;
        if (n.includes('hogar') || n.includes('casa') || n.includes('decor')) return <HomeIcon size={24} className="md:w-8 md:h-8" />;
        if (n.includes('deport') || n.includes('fit') || n.includes('gym')) return <Dumbbell size={24} className="md:w-8 md:h-8" />;
        if (n.includes('juguet') || n.includes('game') || n.includes('niñ')) return <Gamepad2 size={24} className="md:w-8 md:h-8" />;
        return <Tag size={24} className="md:w-8 md:h-8" />;
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-2 md:mb-4 px-2">
                <div className="p-2 rounded-lg bg-sc-cyan/10 text-sc-cyan">
                    <Sparkles size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="font-bold text-white text-xl md:text-2xl tracking-tight">
                    Categorías Populares
                </h3>
            </div>

            {categories.length > 0 ? (
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide px-2 -mx-2 md:mx-0 snap-x">
                    {/* 'Todas' Option */}
                    <div
                        onClick={() => onCategoryClick(null)}
                        className={`flex flex-col items-center gap-2 md:gap-3 min-w-[80px] md:min-w-[100px] group cursor-pointer p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 snap-start ${!selectedCategory ? 'bg-white/10' : 'hover:bg-white/5 active:scale-95'}`}
                    >
                        <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full bg-sc-navy-card border ${!selectedCategory ? 'border-sc-cyan shadow-[0_0_15px_rgba(0,194,203,0.3)]' : 'border-slate-700'} flex items-center justify-center text-sc-cyan group-hover:scale-105 md:group-hover:scale-110 group-hover:border-sc-cyan group-hover:shadow-[0_0_20px_rgba(0,194,203,0.3)] transition-all duration-300 relative z-10`}>
                            <Sparkles size={24} className="md:w-8 md:h-8" />
                        </div>
                        <span className={`text-xs md:text-sm font-medium transition-colors text-center ${!selectedCategory ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                            Todas
                        </span>
                    </div>

                    {categories.filter(c => !c.parent_id).map(cat => (
                        <div
                            key={cat.id}
                            onClick={() => onCategoryClick(cat.id)}
                            className={`flex flex-col items-center gap-2 md:gap-3 min-w-[80px] md:min-w-[100px] group cursor-pointer p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 snap-start ${selectedCategory === cat.id ? 'bg-white/10' : 'hover:bg-white/5 active:scale-95'}`}
                        >
                            <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full bg-sc-navy-card border ${selectedCategory === cat.id ? 'border-sc-cyan shadow-[0_0_15px_rgba(0,194,203,0.3)]' : 'border-slate-700'} flex items-center justify-center text-sc-cyan group-hover:scale-105 md:group-hover:scale-110 group-hover:border-sc-cyan group-hover:shadow-[0_0_20px_rgba(0,194,203,0.3)] transition-all duration-300 relative z-10`}>
                                <span className="drop-shadow-lg filter">{getCategoryIcon(cat.nombre)}</span>
                            </div>
                            <span className={`text-xs md:text-sm font-medium transition-colors text-center truncate w-full ${selectedCategory === cat.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                {cat.nombre}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 md:py-10 text-slate-500 bg-white/5 rounded-2xl animate-pulse">
                    Cargando categorías...
                </div>
            )}
        </div>
    );
}
