import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft } from 'lucide-react'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { getUserDetails, updateUser } from '../actions/userActions'
import { USER_UPDATE_RESET } from '../constants/userConstants'
import { useToast } from '../components/Toast'

function UserEditScreen() {
  const { id: userId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const userDetails = useSelector((state) => state.userDetails)
  const { error, loading, user } = userDetails

  const userUpdate = useSelector((state) => state.userUpdate)
  const { error: errorUpdate, loading: loadingUpdate, success: successUpdate } = userUpdate

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: USER_UPDATE_RESET })
      toast.success('User updated successfully')
      navigate('/admin/userlist')
    } else {
      if (!user || !user.name || String(user._id) !== String(userId)) {
        dispatch(getUserDetails(userId))
      } else {
        setName(user.name || '')
        setEmail(user.email || '')
        setIsAdmin(user.isAdmin || false)
      }
    }
  }, [dispatch, user, userId, successUpdate, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(updateUser({ _id: userId, name, email, isAdmin }))
  }

  return (
    <div className="max-w-md mx-auto pb-12 px-4 space-y-6">
      <div>
        <Link
          to="/admin/userlist"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to users</span>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5">
        <h1 className="text-xl font-bold text-white tracking-tight border-b border-zinc-800 pb-3">
          Edit User #{userId}
        </h1>

        {loadingUpdate && <Loader size="sm" text="Saving..." />}
        {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}

        {loading ? (
          <Loader text="Loading..." />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <form onSubmit={submitHandler} className="space-y-3.5 text-xs">
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

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                id="isAdminCheckbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-zinc-100 cursor-pointer"
              />
              <label htmlFor="isAdminCheckbox" className="text-xs text-zinc-200 cursor-pointer">
                Administrator Privileges
              </label>
            </div>

            <button
              type="submit"
              disabled={loadingUpdate}
              className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-colors mt-2"
            >
              Save User
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default UserEditScreen
