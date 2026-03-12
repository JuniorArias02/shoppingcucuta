import { useState, useEffect } from 'react';
import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';
import HeroSection from '../components/home/HeroSection';
import CategoryRail from '../components/home/CategoryRail';
import FeaturedProducts from '../components/home/FeaturedProducts';
import { useAuth } from '../store/AuthContext';
import AgeConfirmationModal from '../components/ui/AgeConfirmationModal';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { user, confirmAge } = useAuth();
    const navigate = useNavigate();
    const [showAgeModal, setShowAgeModal] = useState(false);
    const [pendingCategoryId, setPendingCategoryId] = useState(null);
    const [confirmingAge, setConfirmingAge] = useState(false);

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
                setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData.data || []));
            } catch (error) {
                console.error("Error fetching home data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Reactive filtering logic
    useEffect(() => {
        if (loading) return;

        const adultCategoryIds = categories
            .filter(c => c.nombre.toLowerCase().includes('18'))
            .map(c => c.id);

        let result = [...products];

        if (selectedCategory) {
            // Specific category selected
            result = result.filter(p => p.categoria_id === selectedCategory);
        } else {
            // "Todas" view - filter out adult content if not confirmed
            if (!user?.mayor_edad) {
                result = result.filter(p => !adultCategoryIds.includes(p.categoria_id));
            }
        }

        setFilteredProducts(result);
    }, [products, categories, selectedCategory, user?.mayor_edad, loading]);


    const handleCategoryClick = (categoryId) => {
        // Find category to check name
        const category = categories.find(c => c.id === categoryId);
        const isAdultCategory = category?.nombre.toLowerCase().includes('18');

        if (isAdultCategory) {
            if (!user) {
                // Not logged in, redirect to login
                navigate('/login');
                return;
            }

            if (!user.mayor_edad) {
                // Not confirmed yet, show modal
                setPendingCategoryId(categoryId);
                setShowAgeModal(true);
                return;
            }
        }

        if (selectedCategory === categoryId) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(categoryId);
        }
    };

    const handleConfirmAge = async () => {
        setConfirmingAge(true);
        try {
            await confirmAge();
            setShowAgeModal(false);
            // After confirmation, select the category
            if (pendingCategoryId) {
                setSelectedCategory(pendingCategoryId);
                setPendingCategoryId(null);
            }
        } catch (error) {
            console.error("Error confirming age", error);
        } finally {
            setConfirmingAge(false);
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

            <AgeConfirmationModal
                isOpen={showAgeModal}
                onClose={() => setShowAgeModal(false)}
                onConfirm={handleConfirmAge}
                loading={confirmingAge}
            />
        </div>
    );
}
