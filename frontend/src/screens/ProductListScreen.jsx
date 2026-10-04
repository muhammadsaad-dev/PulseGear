import React, { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit, Trash2 } from 'lucide-react'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Paginate from '../components/Paginate'
import { listProducts, deleteProduct, createProduct } from '../actions/productActions'
import { PRODUCT_CREATE_RESET } from '../constants/productConstants'
import { useToast } from '../components/Toast'

function ProductListScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const productList = useSelector((state) => state.productList)
  const { loading, error, products = [], pages, page } = productList

  const productDelete = useSelector((state) => state.productDelete)
  const { loading: loadingDelete, error: errorDelete, success: successDelete } = productDelete

  const productCreate = useSelector((state) => state.productCreate)
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    product: createdProduct,
  } = productCreate

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const keyword = location.search

  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET })

    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login')
      return
    }

    if (successCreate && createdProduct) {
      toast.success('Product draft created')
      navigate(`/admin/product/${createdProduct._id}/edit`)
    } else {
      dispatch(listProducts(keyword))
    }
  }, [dispatch, navigate, userInfo, successDelete, successCreate, createdProduct, keyword])

  const deleteHandler = (id, name) => {
    if (window.confirm(`Delete product "${name}"?`)) {
      dispatch(deleteProduct(id))
      toast.info('Product removed')
    }
  }

  const createProductHandler = () => {
    dispatch(createProduct())
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Products Management</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Manage store inventory, prices, and stock.</p>
        </div>

        <button
          onClick={createProductHandler}
          disabled={loadingCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Product</span>
        </button>
      </div>

      {loadingDelete && <Loader size="sm" text="Deleting..." />}
      {errorDelete && <Message variant="danger">{errorDelete}</Message>}

      {loadingCreate && <Loader size="sm" text="Creating draft..." />}
      {errorCreate && <Message variant="danger">{errorCreate}</Message>}

      {loading ? (
        <Loader text="Loading products..." />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/20">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-3 font-mono text-zinc-400">#{product._id}</td>
                    <td className="p-3 font-medium text-white">
                      <Link to={`/product/${product._id}`} className="hover:underline">
                        {product.name}
                      </Link>
                    </td>
                    <td className="p-3 font-semibold text-white">${Number(product.price).toFixed(2)}</td>
                    <td className="p-3 text-zinc-300">{product.category}</td>
                    <td className="p-3 text-zinc-300">{product.brand}</td>
                    <td className="p-3">
                      {product.countInStock > 0 ? (
                        <span className="text-zinc-300">{product.countInStock}</span>
                      ) : (
                        <span className="text-rose-400 font-medium">Out of stock</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <Link
                        to={`/admin/product/${product._id}/edit`}
                        className="inline-block p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => deleteHandler(product._id, product.name)}
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

          <Paginate pages={pages} page={page} isAdmin={true} />
        </div>
      )}
    </div>
  )
}

export default ProductListScreen
