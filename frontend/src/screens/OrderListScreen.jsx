import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { listOrders } from '../actions/orderActions'

function OrderListScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const orderList = useSelector((state) => state.orderList)
  const { loading, error, orders = [] } = orderList

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listOrders())
    } else {
      navigate('/login')
    }
  }, [dispatch, navigate, userInfo])

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Master Orders List</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Track customer orders and dispatch status.</p>
      </div>

      {loading ? (
        <Loader text="Loading orders..." />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-400">
          No orders found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/20">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
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
                  <td className="p-3 font-mono text-zinc-400">#{order._id}</td>
                  <td className="p-3 font-medium text-white">{order.user ? order.user.name : 'Guest'}</td>
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
                      <span className="text-zinc-400">Pending</span>
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
  )
}

export default OrderListScreen
