import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import CheckoutSteps from '../components/CheckoutSteps'
import { createOrder } from '../actions/orderActions'
import { ORDER_CREATE_RESET } from '../constants/orderConstants'
import { useToast } from '../components/Toast'

function PlaceOrderScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const orderCreate = useSelector((state) => state.orderCreate)
  const { order, error, success } = orderCreate

  const cart = useSelector((state) => state.cart)
  const { cartItems = [], shippingAddress = {}, paymentMethod = 'PayPal' } = cart

  const itemsPrice = cartItems.reduce((acc, item) => acc + Number(item.price) * Number(item.qty), 0).toFixed(2)
  const shippingPrice = (Number(itemsPrice) > 100 || Number(itemsPrice) === 0 ? 0 : 10).toFixed(2)
  const taxPrice = Number(0.082 * Number(itemsPrice)).toFixed(2)
  const totalPrice = (Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice)).toFixed(2)

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping')
    } else if (!paymentMethod) {
      navigate('/payment')
    }
  }, [navigate, shippingAddress, paymentMethod])

  useEffect(() => {
    if (success && order) {
      toast.success('Order placed successfully')
      navigate(`/order/${order._id}`)
      dispatch({ type: ORDER_CREATE_RESET })
    }
  }, [dispatch, navigate, success, order, toast])

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        orderItems: cartItems,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        itemsPrice: itemsPrice,
        shippingPrice: shippingPrice,
        taxPrice: taxPrice,
        totalPrice: totalPrice,
      })
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4 space-y-6">
      <CheckoutSteps step1 step2 step3 step4 />

      <h1 className="text-xl font-bold text-white tracking-tight border-b border-zinc-800 pb-3">
        Review & Place Order
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-7 space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1">
            <h3 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">Shipping Destination</h3>
            <p className="text-white">
              {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1">
            <h3 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">Payment Method</h3>
            <p className="text-white">{paymentMethod}</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
            <h3 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">Items in Order</h3>
            <div className="divide-y divide-zinc-800/80">
              {cartItems.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded bg-zinc-950 p-1 border border-zinc-800" />
                    <div>
                      <Link to={`/product/${item.product}`} className="font-medium text-white hover:underline line-clamp-1">
                        {item.name}
                      </Link>
                      <span className="text-zinc-500">Qty: {item.qty}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-white">
                    ${(Number(item.qty) * Number(item.price)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3.5 text-xs">
            <h2 className="text-sm font-bold text-white border-b border-zinc-800 pb-2.5">
              Cost Summary
            </h2>

            <div className="space-y-2 text-zinc-300">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-white">${itemsPrice}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-white">
                  {Number(shippingPrice) === 0 ? 'FREE' : `$${shippingPrice}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (8.2%)</span>
                <span className="font-semibold text-white">${taxPrice}</span>
              </div>

              <div className="border-t border-zinc-800 pt-2 flex justify-between text-sm font-bold text-white">
                <span>Order Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>

            {error && <Message variant="danger">{error}</Message>}

            <button
              type="button"
              disabled={cartItems.length === 0}
              onClick={placeOrderHandler}
              className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-colors mt-2"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceOrderScreen
