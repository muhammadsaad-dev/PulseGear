import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { getUserDetails, updateUserProfile } from '../actions/userActions'
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants'
import { listMyOrders } from '../actions/orderActions'
import { useWishlist } from '../components/WishlistContext'
import { useToast } from '../components/Toast'

function ProfileScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'wishlist' | 'settings'

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { wishlist } = useWishlist()

  const userDetails = useSelector((state) => state.userDetails)
  const { error, loading, user } = userDetails

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const userUpdateProfile = useSelector((state) => state.userUpdateProfile)
  const { success: successUpdate } = userUpdateProfile

  const orderListMy = useSelector((state) => state.orderListMy)
  const { loading: loadingOrders, error: errorOrders, orders = [] } = orderListMy

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
    } else {
      if (!user || !user.name || successUpdate || userInfo._id !== user._id) {
        if (successUpdate) {
          toast.success('Profile updated successfully')
        }
        dispatch({ type: USER_UPDATE_PROFILE_RESET })
        dispatch(getUserDetails('profile'))
        dispatch(listMyOrders())
      } else {
        setName(user.name)
        setEmail(user.email)
      }
    }
  }, [dispatch, navigate, userInfo, user, successUpdate])

  const submitHandler = (e) => {
    e.preventDefault()
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match')
    } else {
      dispatch(
        updateUserProfile({
          id: user._id,
          name,
          email,
          password: password || undefined,
        })
      )
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{userInfo?.name}</h1>
          <p className="text-xs text-zinc-400">{userInfo?.email}</p>
        </div>

        {/* Minimalist Tabs */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            Wishlist ({wishlist.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Contents */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <Loader size="sm" text="Loading orders..." />
          ) : errorOrders ? (
            <Message variant="danger">{errorOrders}</Message>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-400">
              No orders placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/20">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Paid</th>
                    <th className="p-3">Delivered</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 font-mono text-white">#{order._id}</td>
                      <td className="p-3 text-zinc-300">{order.createdAt?.substring(0, 10)}</td>
                      <td className="p-3 font-semibold text-white">${Number(order.totalPrice).toFixed(2)}</td>
                      <td className="p-3">
                        {order.isPaid ? (
                          <span className="text-emerald-400">Paid ({order.paidAt?.substring(0, 10)})</span>
                        ) : (
                          <span className="text-zinc-500">Unpaid</span>
                        )}
                      </td>
                      <td className="p-3">
                        {order.isDelivered ? (
                          <span className="text-emerald-400">Delivered</span>
                        ) : (
                          <span className="text-zinc-400">In Transit</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          to={`/order/${order._id}`}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {wishlist.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-400">
              No saved items in your wishlist.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlist.map((item) => (
                <div key={item._id} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
                  <Link to={`/product/${item._id}`} className="block aspect-square bg-zinc-950 rounded-lg p-3">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </Link>
                  <h4 className="text-xs font-medium text-white line-clamp-1">{item.name}</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">${Number(item.price).toFixed(2)}</span>
                    <Link to={`/product/${item._id}`} className="text-zinc-400 hover:text-white underline">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-md p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white">Account Settings</h2>
          {error && <Message variant="danger">{error}</Message>}
          {loading && <Loader size="sm" text="Saving..." />}

          <form onSubmit={submitHandler} className="space-y-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-zinc-800 space-y-3">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">New Password (optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg transition-colors mt-2"
            >
              Update Profile
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ProfileScreen
