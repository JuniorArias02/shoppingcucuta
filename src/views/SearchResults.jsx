import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductService from '../services/ProductService';
import ProductCard from '../components/products/ProductCard';
import { Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import CategoryService from '../services/CategoryService';

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productsData, categoriesData] = await Promise.all([
                    ProductService.getAll({ search: query }),
                    CategoryService.getAll()
                ]);

                const prods = productsData.data?.length !== undefined ? productsData.data : (Array.isArray(productsData) ? productsData : []);
                const cats = Array.isArray(categoriesData) ? categoriesData : (categoriesData.data || []);
                
                setCategories(cats);

                // Filter out adult content if not confirmed
                if (!user?.mayor_edad) {
                    const adultCategoryIds = cats
                        .filter(c => c.nombre.toLowerCase().includes('18'))
                        .map(c => c.id);
                    
                    setProducts(prods.filter(p => !adultCategoryIds.includes(p.categoria_id)));
                } else {
                    setProducts(prods);
                }
            } catch (error) {
                console.error("Error fetching results", error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchData();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [query, user?.mayor_edad]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sc-cyan"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Search size={28} className="text-sc-magenta" />
                    Resultados para: <span className="text-sc-cyan">"{query}"</span>
                </h1>
                <p className="text-slate-400">
                    Se encontraron {products.length} productos coincidentes.
                </p>
            </div>

            {products.length > 0 ? (
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
                    {products.map(product => (
                        <div key={product.id} className="break-inside-avoid">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-sc-navy-card/50 rounded-3xl border border-white/5 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Search size={40} className="text-slate-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No encontramos resultados</h2>
                    <p className="text-slate-400 max-w-md mx-auto mb-8">
                        Intenta con otros términos, verifica la ortografía o explora nuestras categorías.
                    </p>
                    <Link to="/" className="px-6 py-3 bg-sc-cyan text-sc-navy font-bold rounded-xl hover:bg-cyan-300 transition-colors flex items-center gap-2">
                        Volver al Inicio <ArrowRight size={20} />
                    </Link>
                </div>
            )}
        </div>
    );
}
