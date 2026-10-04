import React, { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import Message from '../components/Message'
import { addToCart, removeFromCart } from '../actions/cartActions'
import { useToast } from '../components/Toast'

function CartScreen() {
  const { id: productId } = useParams()
  const [searchParams] = useSearchParams()
  const qty = searchParams.get('qty') ? Number(searchParams.get('qty')) : 1

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const [promoCode, setPromoCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)

  const cart = useSelector((state) => state.cart)
  const { cartItems = [] } = cart

  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty))
    }
  }, [dispatch, productId, qty])

  const removeFromCartHandler = (id, name) => {
    dispatch(removeFromCart(id))
    toast.info(`Removed "${name}" from cart`)
  }

  const checkoutHandler = () => {
    navigate('/shipping')
  }

  const applyPromoCode = (e) => {
    e.preventDefault()
    if (promoCode.trim().toUpperCase() === 'PULSE10') {
      setDiscountPercent(0.1)
      toast.success('Promo code applied: 10% discount')
    } else {
      toast.error('Invalid promo code')
    }
  }

  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.qty) * Number(item.price), 0)
  const discountAmount = subtotal * discountPercent
  const shippingCost = subtotal > 100 || subtotal === 0 ? 0 : 10
  const finalTotal = subtotal - discountAmount + shippingCost
  const totalItems = cartItems.reduce((acc, item) => acc + Number(item.qty), 0)

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Shopping Bag</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{totalItems} items</p>
        </div>
        <Link to="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
          Continue shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-3 max-w-md mx-auto my-10">
          <p className="text-sm font-semibold text-zinc-200">Your bag is empty</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-8 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.product}
                className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-lg bg-zinc-950 p-2 border border-zinc-800 shrink-0 flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <Link
                      to={`/product/${item.product}`}
                      className="text-sm font-semibold text-zinc-100 hover:underline line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      ${Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <select
                    value={item.qty}
                    onChange={(e) => dispatch(addToCart(item.product, Number(e.target.value)))}
                    className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-xs font-medium text-white focus:outline-none"
                  >
                    {[...Array(item.countInStock || 10).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>

                  <span className="text-sm font-bold text-white min-w-[70px] text-right">
                    ${(Number(item.price) * Number(item.qty)).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCartHandler(item.product, item.name)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-zinc-800 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount (10%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-white">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-zinc-800 pt-2.5 flex justify-between text-sm font-bold text-white">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo input */}
              <form onSubmit={applyPromoCode} className="pt-2 flex gap-1.5">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo (PULSE10)"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold shrink-0"
                >
                  Apply
                </button>
              </form>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={checkoutHandler}
                className="w-full py-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartScreen
