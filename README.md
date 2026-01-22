/app/
├── backend/
│   ├── server.py          # FastAPI backend (948 lines)
│   └── .env               # MongoDB, Stripe config
│
├── frontend/
│   ├── .env               # API URL config
│   ├── public/
│   │   └── logo-transparent.png
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── ProductCard.jsx
│       │   ├── CartDrawer.jsx
│       │   └── ui/        # Shadcn components
 ├── context/
│       │   ├── AuthContext.js
│       │   ├── CartContext.js
│       │   ├── CurrencyContext.js     # BBD/USD switcher
│       │   └── SiteSettingsContext.js # Theme & layout
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Shop.jsx
│       │   ├── ProductDetail.jsx
│       │   ├── Cart.jsx
│       │   ├── Checkout.jsx
│       │   ├── AdminDashboard.jsx
│       │   └── ... (12 pages total)
│       ├── App.js
│       └── index.css
│
└── memory/
    └── PRD.md             # Product requirements
