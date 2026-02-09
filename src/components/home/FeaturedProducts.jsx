import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../products/ProductCard';

export default function FeaturedProducts({ products }) {
    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end px-2 gap-2 sm:gap-0">
                <div>
                    <h3 className="font-bold text-white text-xl md:text-2xl tracking-tight mb-1">
                        Recomendado para ti
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm">Selección exclusiva basada en tus gustos</p>
                </div>
                <Link to="/products" className="text-sc-cyan text-sm font-bold hover:text-white transition-colors flex items-center gap-1 self-end sm:self-auto">
                    Ver todo <ArrowRight size={16} />
                </Link>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center bg-sc-navy-card/30 rounded-2xl border border-white/5">
                    <p className="text-slate-400">No hay productos destacados por el momento.</p>
                    <Link to="/admin/create-product" className="text-sc-cyan hover:underline mt-2 inline-block">
                        ¡Crea el primero!
                    </Link>
                </div>
            )}
        </div>
    );
}
