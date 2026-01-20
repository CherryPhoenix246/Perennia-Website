import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import axios from 'axios';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Shop = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'resin', label: 'Resin Art & Décor' },
    { value: 'soaps', label: 'Soaps, Lotions & Scrubs' },
    { value: 'candles', label: 'Candles' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API}/products`;
        if (category) {
          url += `?category=${category}`;
        }
        const response = await axios.get(url);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    setSelectedCategory(category || 'all');
  }, [category]);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const getCategoryTitle = () => {
    const cat = categories.find(c => c.value === selectedCategory);
    return cat ? cat.label : 'All Products';
  };

  return (
    <div className="min-h-screen pt-20" data-testid="shop-page">
      {/* Header */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
              {getCategoryTitle()}
            </h1>
            <p className="text-[#A3A3A3]">
              Discover our handcrafted collection
            </p>
          </motion.div>
        </div>
      </section>

      {/* Shop Content */}
      <section className="py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28">
                <h3 className="text-xs uppercase tracking-widest text-white mb-6">Categories</h3>
                <ul className="space-y-3">
                  {categories.map((cat) => (
                    <li key={cat.value}>
                      <button
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`text-sm transition-colors ${
                          selectedCategory === cat.value
                            ? 'text-[#D4AF37]'
                            : 'text-[#A3A3A3] hover:text-white'
                        }`}
                        data-testid={`filter-${cat.value}`}
                      >
                        {cat.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden flex justify-between items-center mb-6">
              <span className="text-sm text-[#A3A3A3]">
                {filteredProducts.length} products
              </span>
              <Button
                onClick={() => setFilterOpen(true)}
                variant="ghost"
                className="text-white"
              >
                <Filter size={18} className="mr-2" />
                Filter
              </Button>
            </div>

            {/* Mobile Filter Drawer */}
            {filterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/60" onClick={() => setFilterOpen(false)} />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  className="absolute left-0 top-0 bottom-0 w-72 bg-[#0F0F0F] p-6"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-serif text-white">Filter</h3>
                    <button onClick={() => setFilterOpen(false)} className="text-white/60 hover:text-white">
                      <X size={24} />
                    </button>
                  </div>
                  <h4 className="text-xs uppercase tracking-widest text-white mb-4">Categories</h4>
                  <ul className="space-y-3">
                    {categories.map((cat) => (
                      <li key={cat.value}>
                        <button
                          onClick={() => {
                            setSelectedCategory(cat.value);
                            setFilterOpen(false);
                          }}
                          className={`text-sm transition-colors ${
                            selectedCategory === cat.value
                              ? 'text-[#D4AF37]'
                              : 'text-[#A3A3A3] hover:text-white'
                          }`}
                        >
                          {cat.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="products-grid">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="aspect-[4/5] bg-[#1A1A1A] skeleton" />
                      <div className="h-4 bg-[#1A1A1A] skeleton w-3/4" />
                      <div className="h-4 bg-[#1A1A1A] skeleton w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-[#A3A3A3]">No products found in this category.</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
