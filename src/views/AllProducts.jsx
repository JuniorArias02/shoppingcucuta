import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';
import ProductCard from '../components/products/ProductCard';
import { Search, ArrowLeft, Filter, X } from 'lucide-react';

export default function AllProducts() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') ? parseInt(searchParams.get('category')) : null;
    const isOfertas = searchParams.get('ofertas') === 'true';

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Pass params to ProductService.getAll
                const params = {};
                if (isOfertas) params.ofertas = true;

                const [productsData, categoriesData] = await Promise.all([
                    ProductService.getAll(params),
                    CategoryService.getAll({ has_products: true })
                ]);

                const prods = productsData.data?.length !== undefined ? productsData.data : (Array.isArray(productsData) ? productsData : []);
                setProducts(prods);
                setFilteredProducts(prods);
                setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData.data || []));
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isOfertas]); // Re-fetch when ofertas param changes

    useEffect(() => {
        let result = products;

        if (selectedCategory) {
            result = result.filter(p => p.categoria_id === selectedCategory);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.nombre.toLowerCase().includes(lowerTerm) ||
                p.descripcion?.toLowerCase().includes(lowerTerm) ||
                p.marca?.toLowerCase().includes(lowerTerm)
            );
        }

        setFilteredProducts(result);
    }, [selectedCategory, searchTerm, products]);

    const handleCategoryClick = (categoryId) => {
        if (selectedCategory === categoryId) {
            setSelectedCategory(null);
            setSearchParams({});
        } else {
            setSelectedCategory(categoryId);
            setSearchParams({ category: categoryId });
        }
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setSearchTerm('');
        setSearchParams({});
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sc-cyan"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-sc-navy/95 backdrop-blur-md border-b border-white/5 py-4 px-4 md:px-8 mb-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {isOfertas ? (
                                <>Ofertas <span className="text-sc-magenta">Especiales</span></>
                            ) : (
                                <>Explorar <span className="text-sc-cyan">Todo</span></>
                            )}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 flex-1 md:max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-sc-navy-card border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-sc-cyan/50 focus:ring-1 focus:ring-sc-cyan/50 transition-all placeholder:text-slate-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2.5 rounded-xl border border-white/10 transition-all ${showFilters || selectedCategory ? 'bg-sc-cyan text-sc-navy border-sc-cyan' : 'bg-sc-navy-card text-slate-300 hover:bg-white/5 hover:text-white'}`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Filters Collapse */}
                {(showFilters || selectedCategory) && (
                    <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-slate-400 mr-2">Filtrar por:</span>
                            <button
                                onClick={() => handleCategoryClick(null)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${!selectedCategory ? 'bg-white text-sc-navy border-white' : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'}`}
                            >
                                Todos
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${selectedCategory === cat.id ? 'bg-sc-cyan text-sc-navy border-sc-cyan' : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'}`}
                                >
                                    {cat.nombre}
                                </button>
                            ))}
                            {(selectedCategory || searchTerm) && (
                                <button
                                    onClick={clearFilters}
                                    className="ml-auto text-xs text-sc-magenta hover:text-pink-400 flex items-center gap-1"
                                >
                                    <X size={14} /> Limpiar filtros
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Masonry Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {filteredProducts.length > 0 ? (
                    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="break-inside-avoid">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                            <Search size={32} className="text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No se encontraron productos</h3>
                        <p className="text-slate-400">Intenta con otros términos o filtros.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-6 text-sc-cyan hover:underline"
                        >
                            Ver todos los productos
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
