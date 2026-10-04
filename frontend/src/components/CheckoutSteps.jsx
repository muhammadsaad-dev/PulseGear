import React from 'react'
import { Link } from 'react-router-dom'

function CheckoutSteps({ step1, step2, step3, step4 }) {
  const steps = [
    { num: 1, label: 'Sign In', to: '/login', active: step1 },
    { num: 2, label: 'Shipping', to: '/shipping', active: step2 },
    { num: 3, label: 'Payment', to: '/payment', active: step3 },
    { num: 4, label: 'Place Order', to: '/placeorder', active: step4 },
  ]

  return (
    <nav aria-label="Progress" className="max-w-xl mx-auto my-6 px-4">
      <ol className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <li key={step.num} className="flex items-center gap-2">
            {step.active ? (
              <Link
                to={step.to}
                className="flex items-center gap-1.5 text-xs font-semibold text-white"
              >
                <span className="w-5 h-5 rounded-full bg-white text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                  {step.num}
                </span>
                <span>{step.label}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px]">
                  {step.num}
                </span>
                <span>{step.label}</span>
              </div>
            )}
            {idx < steps.length - 1 && (
              <span className="text-zinc-700 ml-2 hidden sm:inline">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default CheckoutSteps
