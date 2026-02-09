import { useState, useEffect } from 'react';
import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';
import HeroSection from '../components/home/HeroSection';
import CategoryRail from '../components/home/CategoryRail';
import FeaturedProducts from '../components/home/FeaturedProducts';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    ProductService.getAll(),
                    CategoryService.getAll({ has_products: true })
                ]);

                // Handle pagination or flat array
                const prods = productsData.data?.length !== undefined ? productsData.data : (Array.isArray(productsData) ? productsData : []);
                setProducts(prods);
                setFilteredProducts(prods);
                setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData.data || []));
            } catch (error) {
                console.error("Error fetching home data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const handleCategoryClick = (categoryId) => {
        if (selectedCategory === categoryId) {
            setSelectedCategory(null);
            setFilteredProducts(products); // Reset
        } else {
            setSelectedCategory(categoryId);
            setFilteredProducts(products.filter(p => p.categoria_id === categoryId));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sc-cyan"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 md:space-y-12 pb-20 md:pb-0">
            <HeroSection />

            <CategoryRail
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryClick={handleCategoryClick}
            />

            <FeaturedProducts
                products={filteredProducts}
            />
        </div>
    );
}
