import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import CheckoutSteps from '../components/CheckoutSteps'
import { savePaymentMethod } from '../actions/cartActions'

function PaymentScreen() {
  const cart = useSelector((state) => state.cart)
  const { shippingAddress = {} } = cart

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [paymentMethod, setPaymentMethod] = useState('PayPal')

  if (!shippingAddress.address) {
    navigate('/shipping')
  }

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(savePaymentMethod(paymentMethod))
    navigate('/placeorder')
  }

  const options = [
    { id: 'PayPal', label: 'PayPal or Credit Card' },
    { id: 'Stripe', label: 'Stripe / Direct Card Payment' },
  ]

  return (
    <div className="max-w-md mx-auto pb-12 px-4 space-y-6">
      <CheckoutSteps step1 step2 step3 />

      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">Payment Method</h1>
          <p className="text-xs text-zinc-400">Select how you would like to pay.</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-3">
          {options.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors text-xs font-medium ${
                paymentMethod === opt.id
                  ? 'bg-zinc-800/80 border-zinc-500 text-white'
                  : 'bg-zinc-900/30 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.id}
                checked={paymentMethod === opt.id}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-zinc-100 bg-zinc-900 border-zinc-700 focus:ring-0"
              />
              <span>{opt.label}</span>
            </label>
          ))}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors mt-4"
          >
            Review Order
          </button>
        </form>
      </div>
    </div>
  )
}

export default PaymentScreen
