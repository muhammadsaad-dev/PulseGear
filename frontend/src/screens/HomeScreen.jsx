import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useSearchParams } from 'react-router-dom'
import { ArrowUpDown, AlertCircle } from 'lucide-react'
import Product from '../components/Product'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Paginate from '../components/Paginate'
import ProductCarousel from '../components/ProductCarousel'
import { listProducts } from '../actions/productActions'

function HomeScreen() {
  const dispatch = useDispatch()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const productList = useSelector((state) => state.productList)
  const { error, loading, products = [], page, pages } = productList

  const keyword = location.search
  const queryKeyword = searchParams.get('keyword') || ''

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [onlyInStock, setOnlyInStock] = useState(false)

  useEffect(() => {
    dispatch(listProducts(keyword))
  }, [dispatch, keyword])

  const categories = useMemo(() => {
    const set = new Set(['All'])
    if (products && Array.isArray(products)) {
      products.forEach((p) => {
        if (p.category) set.add(p.category)
      })
    }
    return Array.from(set)
  }, [products])

  const processedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return []
    let list = [...products]

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase())
    }

    if (onlyInStock) {
      list = list.filter((p) => p.countInStock > 0)
    }

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case 'price-desc':
        list.sort((a, b) => Number(b.price) - Number(a.price))
        break
      case 'rating':
        list.sort((a, b) => Number(b.rating) - Number(a.rating))
        break
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      default:
        break
    }

    return list
  }, [products, selectedCategory, onlyInStock, sortBy])

  return (
    <div className="space-y-6 pb-8">
      {/* Featured Carousel */}
      {!queryKeyword && <ProductCarousel />}

      {/* Section Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {queryKeyword ? `Search results for "${queryKeyword}"` : 'All Products'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {processedProducts.length} items available
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stock toggle */}
          <button
            onClick={() => setOnlyInStock(!onlyInStock)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              onlyInStock
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            In stock only
          </button>

          {/* Sort */}
          <div className="relative flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <Loader text="Loading catalog..." />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : processedProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-3 my-6">
          <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">No products found</p>
          <button
            onClick={() => {
              setSelectedCategory('All')
              setOnlyInStock(false)
              setSortBy('featured')
            }}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {processedProducts.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>

          <Paginate page={page} pages={pages} keyword={keyword} />
        </div>
      )}
    </div>
  )
}

export default HomeScreen
