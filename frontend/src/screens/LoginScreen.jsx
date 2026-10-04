import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff } from 'lucide-react'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { login } from '../actions/userActions'

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const redirect = searchParams.get('redirect') ? `/${searchParams.get('redirect')}` : '/'

  const userLogin = useSelector((state) => state.userLogin)
  const { error, loading, userInfo } = userLogin

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [navigate, userInfo, redirect])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(login(email, password))
  }

  return (
    <div className="max-w-sm mx-auto my-12 px-4">
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">Sign In</h1>
          <p className="text-xs text-zinc-400">Enter your credentials to access your account.</p>
        </div>

        {error && <Message variant="danger">{error}</Message>}
        {loading && <Loader size="sm" text="Authenticating..." />}

        <form onSubmit={submitHandler} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-8 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-colors mt-2"
          >
            Sign In
          </button>
        </form>

        <div className="pt-3 border-t border-zinc-800 text-center text-xs text-zinc-400">
          Don't have an account?{' '}
          <Link
            to={redirect !== '/' ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
            className="text-white font-medium underline"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
