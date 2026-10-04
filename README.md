# ⚡ PulseGear — Next-Gen E-Commerce Platform

> **High-Performance Full-Stack E-Commerce Platform built with Django REST Framework, React 18, Vite, Tailwind CSS, and Redux.**

---

## 🌟 Overview

**PulseGear** is an enterprise-grade e-commerce application designed for high-performance electronics, developer gear, and modern peripherals. Engineered with a decoupled architecture, it pairs a robust Django REST Framework backend with an ultra-responsive React 18 frontend styled with Tailwind CSS, Lucide icons, and glassmorphic micro-interactions.

---

## ✨ Key Features & UX Highlights

### 🛍️ Modern Storefront & Discovery
* **Interactive Hero Carousel**: Auto-sliding featured gear banner showcasing top-rated products with dynamic gradients.
* **Instant Filtering & Sorting**: Client and server-side filtering by category chips, price ranges, in-stock availability, and multiple sort criteria.
* **Live Debounced Search**: Fast search bar with keyword matching and clear actions.
* **Persistent Wishlist System**: One-click bookmarking of products with localStorage persistence and interactive heart badges.
* **Smart Cart Engine**: Dynamic free-shipping progress tracker, promo code validation (`PULSE10`), line-item quantity controls, and order summary breakdown.

### 💳 Seamless Multi-Step Checkout
* **Visual Progress Tracker**: Stepped progress breadcrumbs (`Sign In` ➔ `Shipping` ➔ `Payment` ➔ `Place Order`).
* **Payment Gateways**: PayPal SDK integration and simulated demo checkout for portfolio reviewers.
* **Interactive Invoicing**: Real-time tax and shipping calculations with order status timelines (`Pending` ➔ `Paid` ➔ `In Transit` ➔ `Delivered`).

### 🛡️ Admin Command Center
* **Product Inventory Management**: Create new drafts, update specs, modify pricing, and upload product assets with live image previews.
* **Order Fulfillment Center**: Monitor incoming platform orders with one-click "Mark as Delivered" fulfillment triggers.
* **User & Permissions Directory**: Manage customer profiles and toggle administrative privileges.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Core** | React 18, React Router v6, Redux & Redux Thunk |
| **Build & Tooling** | Vite 5, PostCSS, Autoprefixer |
| **Styling & UI** | Tailwind CSS 3.4, Lucide React Icons, Glassmorphism CSS |
| **Backend API** | Django 5, Django REST Framework (DRF) |
| **Authentication** | Django SimpleJWT (JSON Web Tokens) |
| **Database** | SQLite (Dev) / PostgreSQL (Production) |

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** v18+ and **npm**
* **Python** 3.10+

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/pulsegear.git
cd pulsegear

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Run migrations & seed data
python manage.py migrate

# Start the Django development server
python manage.py runserver
```

### 3. Frontend Setup
```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install modern dependencies
npm install

# Start the Vite development server (proxies API requests to Django on :8000)
npm run dev

# Or compile for production
npm run build
```

---

## 📁 Project Architecture

```
pulsegear/
├── backend/                # Django project configuration & routing
│   ├── settings.py         # Static files, JWT, and CORS setup
│   ├── urls.py             # Root URL router & static asset routes
│   └── wsgi.py
├── base/                   # Core Django app
│   ├── models.py           # Product, Review, Order, OrderItem models
│   ├── serializers.py      # DRF ModelSerializers
│   ├── urls/               # Modular API route definitions
│   └── views/              # DRF views (products, orders, users)
├── frontend/               # Vite + React 18 SPA
│   ├── public/             # Vector branding assets & favicon
│   ├── src/
│   │   ├── actions/        # Redux thunk action creators
│   │   ├── components/     # Header, Footer, ProductCard, Toast, Wishlist
│   │   ├── reducers/       # Redux state reducers
│   │   ├── screens/        # Modernized view screens (Home, Product, Cart, Admin)
│   │   ├── App.jsx         # Router & Context provider wrapper
│   │   └── index.css       # Tailwind directives & glassmorphic design system
│   ├── tailwind.config.js  # Color palette & glowing theme tokens
│   └── vite.config.js      # Vite build configuration & API proxy
└── requirements.txt
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
