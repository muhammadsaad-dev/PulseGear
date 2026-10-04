import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Loader from './Loader'
import Message from './Message'
import { listTopProducts } from '../actions/productActions'

function ProductCarousel() {
  const dispatch = useDispatch()
  const [currentIndex, setCurrentIndex] = useState(0)

  const productTopRated = useSelector((state) => state.productTopRated)
  const { error, loading, products = [] } = productTopRated

  useEffect(() => {
    dispatch(listTopProducts())
  }, [dispatch])

  useEffect(() => {
    if (!products || products.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [products])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>
  if (!products || products.length === 0) return null

  const currentProduct = products[currentIndex]

  return (
    <div className="relative mb-10 rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800">
      <div className="min-h-[320px] md:min-h-[380px] flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 gap-8">
        {/* Text Content */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
            Featured Highlight
          </span>

          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            {currentProduct.name}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md line-clamp-2 leading-relaxed">
            {currentProduct.description || 'Engineered with premium craftsmanship and uncompromising performance.'}
          </p>

          <div className="pt-2 flex items-center justify-center md:justify-start gap-4">
            <span className="text-xl font-bold text-white">
              ${Number(currentProduct.price).toFixed(2)}
            </span>

            <Link
              to={`/product/${currentProduct._id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-colors"
            >
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Product Image */}
        <div className="flex-1 flex items-center justify-center relative w-full max-w-sm h-56 sm:h-72">
          <Link to={`/product/${currentProduct._id}`} className="w-full h-full flex items-center justify-center">
            <img
              src={currentProduct.image}
              alt={currentProduct.name}
              className="max-h-full max-w-full object-contain"
            />
          </Link>
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-zinc-200' : 'w-1.5 bg-zinc-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default ProductCarousel
