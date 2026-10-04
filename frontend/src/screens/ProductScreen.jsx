import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Heart,
  Star,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react'
import Rating from '../components/Rating'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { listProductDetails, createProductReview } from '../actions/productActions'
import { addToCart } from '../actions/cartActions'
import { PRODUCT_CREATE_REVIEW_RESET } from '../constants/productConstants'
import { useWishlist } from '../components/WishlistContext'
import { useToast } from '../components/Toast'

function ProductScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()
  const { isWishlisted, toggleWishlist } = useWishlist()

  const [qty, setQty] = useState(1)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const productDetails = useSelector((state) => state.productDetails)
  const { loading, error, product } = productDetails

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const productReviewCreate = useSelector((state) => state.productReviewCreate)
  const {
    loading: loadingProductReview,
    error: errorProductReview,
    success: successProductReview,
  } = productReviewCreate

  useEffect(() => {
    if (successProductReview) {
      setRating(5)
      setComment('')
      toast.success('Review submitted successfully')
      dispatch({ type: PRODUCT_CREATE_REVIEW_RESET })
    }
    dispatch(listProductDetails(id))
  }, [dispatch, id, successProductReview])

  const addToCartHandler = () => {
    dispatch(addToCart(id, Number(qty)))
    toast.success(`Added ${qty} item(s) to cart`)
    navigate(`/cart/${id}?qty=${qty}`)
  }

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(createProductReview(id, { rating, comment }))
  }

  const inStock = product?.countInStock > 0
  const wishlisted = isWishlisted(product?._id)

  return (
    <div className="space-y-8 pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to catalog</span>
        </Link>
      </div>

      {loading ? (
        <Loader text="Loading product..." />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : !product ? (
        <Message variant="danger">Product not found</Message>
      ) : (
        <div className="space-y-12">
          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Image Gallery */}
            <div className="lg:col-span-7">
              <div className="relative aspect-square rounded-2xl bg-zinc-900/50 border border-zinc-800 p-8 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/images/placeholder.png'
                  }}
                />
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-4 right-4 p-2.5 rounded-xl border transition-colors ${
                    wishlisted
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Product Meta & Actions */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Brand / Category */}
                <div className="text-xs text-zinc-400 font-medium">
                  <span>{product.brand}</span>
                  {product.category && <span className="mx-2">•</span>}
                  <span>{product.category}</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Rating value={product.rating} />
                  <span className="text-xs text-zinc-400 font-medium">
                    {product.rating} ({product.numReviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="pt-2">
                  <span className="text-3xl font-extrabold text-white">
                    ${Number(product.price).toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-2">
                  {product.description || 'Engineered with premium craftsmanship for reliable everyday performance.'}
                </p>
              </div>

              {/* Purchase Box */}
              <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Availability</span>
                  {inStock ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      In stock ({product.countInStock} available)
                    </span>
                  ) : (
                    <span className="text-rose-400 font-medium">Out of stock</span>
                  )}
                </div>

                {inStock && (
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                    <span className="text-zinc-400 font-medium">Quantity</span>
                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-semibold text-white focus:outline-none"
                    >
                      {[...Array(product.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={addToCartHandler}
                  disabled={!inStock}
                  className={`w-full py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                    inStock
                      ? 'bg-zinc-100 hover:bg-white text-zinc-950'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>

                {/* Guarantees */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800/80 text-center text-[11px] text-zinc-400">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Free Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>2-Year Warranty</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                    <span>30-Day Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="border-t border-zinc-800 pt-10 space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Customer Reviews ({product.reviews?.length || 0})
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Existing Reviews */}
              <div className="lg:col-span-7 space-y-3">
                {(!product.reviews || product.reviews.length === 0) ? (
                  <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-400">
                    No customer reviews yet.
                  </div>
                ) : (
                  product.reviews.map((review) => (
                    <div
                      key={review._id}
                      className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{review.name}</span>
                        <Rating value={review.rating} />
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{review.comment}</p>
                      <p className="text-[10px] text-zinc-500">
                        {review.createdAt ? review.createdAt.substring(0, 10) : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Review Form */}
              <div className="lg:col-span-5">
                <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Write a Review</h3>

                  {loadingProductReview && <Loader size="sm" text="Submitting..." />}
                  {errorProductReview && <Message variant="danger">{errorProductReview}</Message>}

                  {userInfo ? (
                    <form onSubmit={submitHandler} className="space-y-3">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Rating</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Comment</label>
                        <textarea
                          rows="3"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          required
                          placeholder="Your review..."
                          className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loadingProductReview}
                        className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Submit
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-zinc-400">
                      Please <Link to="/login" className="text-white underline">sign in</Link> to leave a review.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductScreen
