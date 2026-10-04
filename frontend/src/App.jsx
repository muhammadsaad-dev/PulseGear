import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomeScreen from './screens/HomeScreen'
import ProductScreen from './screens/ProductScreen'
import CartScreen from './screens/CartScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import ProfileScreen from './screens/ProfileScreen'
import ShippingScreen from './screens/ShippingScreen'
import PaymentScreen from './screens/PaymentScreen'
import PlaceOrderScreen from './screens/PlaceOrderScreen'
import OrderScreen from './screens/OrderScreen'
import UserListScreen from './screens/UserListScreen'
import UserEditScreen from './screens/UserEditScreen'
import ProductListScreen from './screens/ProductListScreen'
import ProductEditScreen from './screens/ProductEditScreen'
import OrderListScreen from './screens/OrderListScreen'
import { ToastProvider } from './components/Toast'
import { WishlistProvider } from './components/WishlistContext'

function App() {
  return (
    <ToastProvider>
      <WishlistProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/register" element={<RegisterScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/shipping" element={<ShippingScreen />} />
                <Route path="/payment" element={<PaymentScreen />} />
                <Route path="/placeorder" element={<PlaceOrderScreen />} />
                <Route path="/order/:id" element={<OrderScreen />} />
                <Route path="/product/:id" element={<ProductScreen />} />
                <Route path="/cart" element={<CartScreen />} />
                <Route path="/cart/:id" element={<CartScreen />} />

                {/* Admin Management Routes */}
                <Route path="/admin/userlist" element={<UserListScreen />} />
                <Route path="/admin/user/:id/edit" element={<UserEditScreen />} />
                <Route path="/admin/productlist" element={<ProductListScreen />} />
                <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />
                <Route path="/admin/orderlist" element={<OrderListScreen />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </WishlistProvider>
    </ToastProvider>
  )
}

export default App
