import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  User,
  Heart,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Layers,
  Package,
  Users,
} from 'lucide-react'
import SearchBox from './SearchBox'
import { logout } from '../actions/userActions'
import { useWishlist } from './WishlistContext'

function Header() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userDropdownRef = useRef(null)
  const adminDropdownRef = useRef(null)

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const cart = useSelector((state) => state.cart)
  const { cartItems } = cart

  const totalCartCount = cartItems.reduce((acc, item) => acc + Number(item.qty), 0)

  const { wishlist } = useWishlist()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const logoutHandler = () => {
    dispatch(logout())
    setUserDropdownOpen(false)
    setAdminDropdownOpen(false)
    navigate('/login')
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setAdminDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 font-black text-xs">
              P
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Pulse<span className="text-zinc-400 font-normal">Gear</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <SearchBox />
          </div>

          {/* Nav Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Wishlist Link */}
            <Link
              to="/profile"
              className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              title="Saved items"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="bg-zinc-800 text-zinc-200 text-xs px-2 py-0.5 rounded-full font-semibold border border-zinc-700">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Admin Portal Dropdown */}
            {userInfo && userInfo.isAdmin && (
              <div className="relative" ref={adminDropdownRef}>
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-white hover:border-zinc-700 transition-all"
                >
                  Admin
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {adminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 p-1.5 shadow-xl z-50">
                    <Link
                      to="/admin/productlist"
                      onClick={() => setAdminDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Products
                    </Link>
                    <Link
                      to="/admin/orderlist"
                      onClick={() => setAdminDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      Orders
                    </Link>
                    <Link
                      to="/admin/userlist"
                      onClick={() => setAdminDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Users
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* User Dropdown */}
            {userInfo ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200 hover:border-zinc-700 transition-all"
                >
                  <span className="max-w-[100px] truncate">{userInfo.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 p-1.5 shadow-xl z-50">
                    <div className="px-3 py-1.5 border-b border-zinc-800 mb-1">
                      <p className="text-[11px] text-zinc-400">Signed in as</p>
                      <p className="text-xs font-semibold text-white truncate">{userInfo.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      Account & Orders
                    </Link>
                    <button
                      onClick={logoutHandler}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/cart" className="relative p-2 text-zinc-300">
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 bg-white text-zinc-950 text-[10px] w-4 h-4 font-bold rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <SearchBox />
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 py-3 space-y-1 text-sm">
            {userInfo ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-zinc-300 hover:bg-zinc-900 rounded-lg"
                >
                  Account & Orders
                </Link>
                {userInfo.isAdmin && (
                  <>
                    <Link
                      to="/admin/productlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-zinc-300 hover:bg-zinc-900 rounded-lg"
                    >
                      Admin Products
                    </Link>
                    <Link
                      to="/admin/orderlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-zinc-300 hover:bg-zinc-900 rounded-lg"
                    >
                      Admin Orders
                    </Link>
                    <Link
                      to="/admin/userlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-zinc-300 hover:bg-zinc-900 rounded-lg"
                    >
                      Admin Users
                    </Link>
                  </>
                )}
                <button
                  onClick={logoutHandler}
                  className="w-full text-left px-3 py-2 text-rose-400 hover:bg-zinc-900 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-center bg-white text-zinc-950 font-medium rounded-lg"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
