import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Edit, Trash2, Shield } from 'lucide-react'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { listUsers, deleteUser } from '../actions/userActions'
import { useToast } from '../components/Toast'

function UserListScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const userList = useSelector((state) => state.userList)
  const { loading, error, users = [] } = userList

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const userDelete = useSelector((state) => state.userDelete)
  const { success: successDelete } = userDelete

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listUsers())
    } else {
      navigate('/login')
    }
  }, [dispatch, navigate, successDelete, userInfo])

  const deleteHandler = (id, name) => {
    if (window.confirm(`Delete user "${name}"?`)) {
      dispatch(deleteUser(id))
      toast.info('User removed')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Users Directory</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Manage customer profiles and staff permissions.</p>
      </div>

      {loading ? (
        <Loader text="Loading users..." />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/20">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="p-3 font-mono text-zinc-400">#{user._id}</td>
                  <td className="p-3 font-medium text-white">{user.name}</td>
                  <td className="p-3 text-zinc-300">{user.email}</td>
                  <td className="p-3">
                    {user.isAdmin ? (
                      <span className="text-purple-300 font-semibold inline-flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="text-zinc-500">Customer</span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    <Link
                      to={`/admin/user/${user._id}/edit`}
                      className="inline-block p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => deleteHandler(user._id, user.name)}
                      className="p-1.5 rounded bg-zinc-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

export default UserListScreen
