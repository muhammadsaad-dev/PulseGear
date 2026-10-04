import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import CheckoutSteps from '../components/CheckoutSteps'
import { saveShippingAddress } from '../actions/cartActions'

function ShippingScreen() {
  const cart = useSelector((state) => state.cart)
  const { shippingAddress = {} } = cart

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [address, setAddress] = useState(shippingAddress.address || '')
  const [city, setCity] = useState(shippingAddress.city || '')
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '')
  const [country, setCountry] = useState(shippingAddress.country || '')

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(saveShippingAddress({ address, city, postalCode, country }))
    navigate('/payment')
  }

  return (
    <div className="max-w-md mx-auto pb-12 px-4 space-y-6">
      <CheckoutSteps step1 step2 />

      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">Shipping Details</h1>
          <p className="text-xs text-zinc-400">Where should we deliver your order?</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Postal Code</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="94107"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Country</label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="United States"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-colors mt-2"
          >
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  )
}

export default ShippingScreen
