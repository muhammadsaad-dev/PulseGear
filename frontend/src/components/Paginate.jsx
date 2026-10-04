import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function Paginate({ pages, page, keyword = '', isAdmin = false }) {
  if (pages <= 1) return null

  const getPageUrl = (p) => {
    const cleanKeyword = keyword ? keyword.trim() : ''
    const base = isAdmin ? '/admin/productlist' : ''
    const query = cleanKeyword ? `?keyword=${encodeURIComponent(cleanKeyword)}&page=${p}` : `?page=${p}`
    return `${base}/${query}`
  }

  return (
    <div className="flex items-center justify-center gap-2 my-10">
      {/* Prev button */}
      {page > 1 && (
        <Link
          to={getPageUrl(page - 1)}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      )}

      {/* Page Numbers */}
      {[...Array(pages).keys()].map((x) => {
        const pageNum = x + 1
        const isActive = pageNum === page

        return (
          <Link
            key={pageNum}
            to={getPageUrl(pageNum)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-glow border border-indigo-400'
                : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            {pageNum}
          </Link>
        )
      })}

      {/* Next button */}
      {page < pages && (
        <Link
          to={getPageUrl(page + 1)}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

export default Paginate
