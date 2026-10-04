import React, { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Check, Clock } from 'lucide-react'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getOrderDetails, payOrder, deliverOrder } from '../actions/orderActions'
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants'
import { useToast } from '../components/Toast'

function OrderScreen() {
  const { id: orderId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const orderDetails = useSelector((state) => state.orderDetails)
  const { order, error, loading } = orderDetails

  const orderPay = useSelector((state) => state.orderPay)
  const { loading: loadingPay, success: successPay } = orderPay

  const orderDeliver = useSelector((state) => state.orderDeliver)
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const itemsPrice =
    order?.orderItems?.reduce((acc, item) => acc + Number(item.price) * Number(item.qty), 0).toFixed(2) || '0.00'

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
      return
    }

    if (!order || successPay || String(order._id) !== String(orderId) || successDeliver) {
      dispatch({ type: ORDER_PAY_RESET })
      dispatch({ type: ORDER_DELIVER_RESET })
      dispatch(getOrderDetails(orderId))
    }
  }, [dispatch, navigate, userInfo, order, orderId, successPay, successDeliver])

  const demoPaymentHandler = () => {
    const paymentResult = {
      id: `DEMO-PAY-${Date.now()}`,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: userInfo.email,
    }
    dispatch(payOrder(orderId, paymentResult))
    toast.success('Payment completed')
  }

  const deliverHandler = () => {
    dispatch(deliverOrder(order))
    toast.success('Status updated to Delivered')
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="space-y-1">
          <Link to="/profile" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Orders list</span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">Order #{orderId}</h1>
        </div>
        {order && <span className="text-xs text-zinc-400">{order.createdAt?.substring(0, 10)}</span>}
      </div>

      {loading ? (
        <Loader text="Loading order..." />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : !order ? (
        <Message variant="danger">Order not found</Message>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Details */}
          <div className="lg:col-span-7 space-y-4 text-xs">
            {/* Customer info */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
              <h3 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">Customer & Destination</h3>
              <p className="text-white font-medium">{order.user?.name || userInfo?.name} ({order.user?.email || userInfo?.email})</p>
              <p className="text-zinc-400">
                {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
              </p>
              <div className="pt-1">
                {order.isDelivered ? (
                  <span className="text-emerald-400 font-medium">Delivered on {order.deliveredAt?.substring(0, 10)}</span>
                ) : (
                  <span className="text-zinc-400 font-medium">In Transit / Processing</span>
                )}
              </div>
            </div>

            {/* Payment status */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
              <h3 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">Payment ({order.paymentMethod})</h3>
              {order.isPaid ? (
                <span className="text-emerald-400 font-medium">Paid on {order.paidAt?.substring(0, 10)}</span>
              ) : (
                <span className="text-amber-400 font-medium">Payment Pending</span>
              )}
            </div>

            {/* Ordered Items */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <h3 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">Items</h3>
              <div className="divide-y divide-zinc-800/80">
                {order.orderItems?.map((item, idx) => (
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

          {/* Right Summary */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3.5">
              <h2 className="text-sm font-bold text-white border-b border-zinc-800 pb-2.5">
                Summary
              </h2>

              <div className="space-y-2 text-zinc-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${itemsPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-white">${order.shippingPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-semibold text-white">${order.taxPrice}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Total</span>
                  <span>${order.totalPrice}</span>
                </div>
              </div>

              {!order.isPaid && (
                <div className="pt-2">
                  <button
                    onClick={demoPaymentHandler}
                    disabled={loadingPay}
                    className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg font-semibold transition-colors"
                  >
                    Simulate Payment (Demo)
                  </button>
                </div>
              )}

              {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                <button
                  onClick={deliverHandler}
                  disabled={loadingDeliver}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-colors mt-2"
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderScreen
