import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Heart, Plus } from 'lucide-react'
import Rating from './Rating'
import { addToCart } from '../actions/cartActions'
import { useWishlist } from './WishlistContext'
import { useToast } from './Toast'

function Product({ product }) {
  const dispatch = useDispatch()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const toast = useToast()

  const wishlisted = isWishlisted(product._id)
  const inStock = product.countInStock > 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (inStock) {
      dispatch(addToCart(product._id, 1))
      toast.success(`Added "${product.name}" to cart`)
    } else {
      toast.error('Product is out of stock')
    }
  }

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
    if (wishlisted) {
      toast.info('Removed from saved items')
    } else {
      toast.success('Saved to your wishlist')
    }
  }

  return (
    <div className="group relative bg-zinc-900/40 rounded-xl border border-zinc-800/80 overflow-hidden flex flex-col hover:border-zinc-700 transition-all duration-200">
      {/* Top action row */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <button
          onClick={handleWishlistToggle}
          aria-label="Wishlist"
          className={`p-1.5 rounded-lg backdrop-blur-sm border transition-colors ${
            wishlisted
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-400' : ''}`} />
        </button>
      </div>

      {/* Image container */}
      <Link
        to={`/product/${product._id}`}
        className="block relative pt-[85%] bg-zinc-950 overflow-hidden"
      >
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-5 group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/images/placeholder.png'
          }}
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Status */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span>{product.category || product.brand}</span>
            {!inStock && <span className="text-rose-400 font-medium">Out of stock</span>}
          </div>

          {/* Title */}
          <Link to={`/product/${product._id}`}>
            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-2">
            <Rating value={product.rating} text={`(${product.numReviews})`} />
          </div>
        </div>

        {/* Bottom row: Price & Quick Add */}
        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
          <span className="text-base font-bold text-white">
            ${Number(product.price).toFixed(2)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              inStock
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white border border-zinc-700'
                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Product
