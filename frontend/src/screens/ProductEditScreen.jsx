import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Upload } from 'lucide-react'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { listProductDetails, updateProduct } from '../actions/productActions'
import { PRODUCT_UPDATE_RESET } from '../constants/productConstants'
import { useToast } from '../components/Toast'

function ProductEditScreen() {
  const { id: productId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [image, setImage] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState(0)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  const productDetails = useSelector((state) => state.productDetails)
  const { error, loading, product } = productDetails

  const productUpdate = useSelector((state) => state.productUpdate)
  const { error: errorUpdate, loading: loadingUpdate, success: successUpdate } = productUpdate

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login')
      return
    }

    if (successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET })
      toast.success('Product updated successfully')
      navigate('/admin/productlist')
    } else {
      if (!product || !product.name || String(product._id) !== String(productId)) {
        dispatch(listProductDetails(productId))
      } else {
        setName(product.name || '')
        setPrice(product.price || 0)
        setImage(product.image || '')
        setBrand(product.brand || '')
        setCategory(product.category || '')
        setCountInStock(product.countInStock || 0)
        setDescription(product.description || '')
      }
    }
  }, [dispatch, product, productId, navigate, userInfo, successUpdate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(
      updateProduct({
        _id: productId,
        name,
        price,
        image,
        brand,
        category,
        countInStock,
        description,
      })
    )
  }

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)
    formData.append('product_id', productId)

    setUploading(true)

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
      const { data } = await axios.post('/api/products/upload/', formData, config)
      setImage(data)
      setUploading(false)
      toast.success('Image uploaded')
    } catch (err) {
      console.error(err)
      setUploading(false)
      toast.error('Failed to upload image')
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-12 px-4 space-y-6">
      <div>
        <Link
          to="/admin/productlist"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to products</span>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5">
        <h1 className="text-xl font-bold text-white tracking-tight border-b border-zinc-800 pb-3">
          Edit Product #{productId}
        </h1>

        {loadingUpdate && <Loader size="sm" text="Saving..." />}
        {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}

        {loading ? (
          <Loader text="Loading..." />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <form onSubmit={submitHandler} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Product Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Count In Stock</label>
                <input
                  type="number"
                  required
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Image URL & Upload</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none"
                />
                <label className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium cursor-pointer shrink-0 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input type="file" onChange={uploadFileHandler} className="hidden" />
                </label>
              </div>
              {uploading && <p className="text-zinc-400 mt-1">Uploading...</p>}
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Description</label>
              <textarea
                rows="4"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loadingUpdate}
              className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-colors mt-2"
            >
              Save Changes
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ProductEditScreen
