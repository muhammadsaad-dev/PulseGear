import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'

function SearchBox() {
  const [keyword, setKeyword] = useState('')
  const navigate = useNavigate()

  const submitHandler = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      navigate(`/?keyword=${encodeURIComponent(keyword.trim())}&page=1`)
    } else {
      navigate('/')
    }
  }

  const clearSearch = () => {
    setKeyword('')
    navigate('/')
  }

  return (
    <form onSubmit={submitHandler} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          name="q"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-8 py-1.5 bg-zinc-900/70 text-xs text-zinc-100 placeholder-zinc-500 rounded-lg border border-zinc-800 focus:outline-none focus:border-zinc-600 transition-colors"
        />
        {keyword && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2.5 p-0.5 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  )
}

export default SearchBox
