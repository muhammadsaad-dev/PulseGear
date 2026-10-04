import React from 'react'
import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/80 pt-10 pb-8 mt-16 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="space-y-2">
          <span className="text-sm font-bold text-white">PulseGear</span>
          <p className="text-zinc-500 leading-relaxed max-w-xs">
            High-performance hardware, peripherals, and developer essentials.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-zinc-200 mb-2.5">Shop</h4>
          <ul className="space-y-1.5 text-zinc-400">
            <li><Link to="/?category=Electronics" className="hover:text-white transition-colors">Electronics</Link></li>
            <li><Link to="/?category=Computers" className="hover:text-white transition-colors">Computers</Link></li>
            <li><Link to="/?category=Gaming" className="hover:text-white transition-colors">Gaming</Link></li>
            <li><Link to="/?category=Accessories" className="hover:text-white transition-colors">Accessories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-200 mb-2.5">Account</h4>
          <ul className="space-y-1.5 text-zinc-400">
            <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-200 mb-2.5">Newsletter</h4>
          <p className="text-zinc-500 mb-2">Subscribe for new releases and updates.</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-1.5">
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-zinc-500 text-[11px] gap-2">
        <p>&copy; {new Date().getFullYear()} PulseGear Inc. All rights reserved.</p>
        <div className="flex items-center gap-3 text-zinc-400">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white"><Github className="w-4 h-4" /></a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white"><Twitter className="w-4 h-4" /></a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white"><Linkedin className="w-4 h-4" /></a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
