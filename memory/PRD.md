# Perennia - E-commerce Platform PRD

## Original Problem Statement
Build a website for Perennia business based in Barbados selling:
- Handcrafted Resin Gifts & Décor
- Soaps, Lotions & Scrubs
- Candles

Currency: BBD (primary), USD (secondary)

## User Personas
1. **Customers**: Barbados locals and international buyers seeking luxury handcrafted artisan products
2. **Admin/Owner**: Perennia business owner managing products, orders, and customer inquiries

## Core Requirements (Static)
- Product catalog with categories
- Shopping cart functionality
- Dual payment options (Stripe + Order form)
- Customer accounts with order history
- Product reviews
- Admin panel for product management
- Contact form
- Social media integration
- Dark luxurious theme with brand colors (black, gold, white, turquoise, deep purple)
- Editable website layout and content from admin panel
- Theme/color customization

## What's Been Implemented

### January 20, 2026 - Theme Customization & Logo Update
- [x] Transparent logo integration (uploaded by user)
- [x] Theme color customization via admin panel
  - Quick theme presets (Gold Luxury, Rose Gold, Ocean Blue, Forest Green, Sunset Purple, Clean White)
  - Custom color pickers for Primary, Secondary, Accent, Background, Surface, Text colors
- [x] Layout customization via admin panel
  - Toggle switches for Homepage sections (Hero, Categories, Featured, About Snippet, Newsletter)
  - Navbar style selector (Glass, Solid, Transparent)
  - Footer style selector (Full, Minimal)
- [x] CSS variables for dynamic theming
- [x] Fixed malformed .env file issue
- [x] Removed .env from .gitignore for deployment
- [x] Updated all components to use CSS variables instead of hardcoded colors

### January 2025 - Initial Build
- [x] User authentication (JWT-based)
- [x] Product CRUD with categories
- [x] Shopping cart & order management
- [x] Stripe payment integration
- [x] Product reviews system
- [x] Contact form
- [x] Admin dashboard APIs
- [x] Site Settings API (CMS-like content management)
- [x] Dark luxurious theme with Playfair Display + Montserrat fonts
- [x] Responsive navbar with glassmorphism
- [x] Homepage with hero, categories, featured products
- [x] Shop page with category filtering
- [x] Product detail page with reviews
- [x] Shopping cart drawer & page
- [x] Checkout with Stripe integration
- [x] Admin product/order/message management

## Admin Credentials
- Email: admin@perennia.bb
- Password: admin123

## Technical Architecture
```
/app/
├── backend/
│   ├── server.py           # FastAPI backend (all routes)
│   ├── .env                 # MONGO_URL, DB_NAME, CORS_ORIGINS, STRIPE_API_KEY
│   └── requirements.txt
└── frontend/
    ├── .env                 # REACT_APP_BACKEND_URL
    ├── public/
    │   └── logo-transparent.png  # User's logo
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProductCard.jsx
        │   └── CartDrawer.jsx
        ├── context/
        │   ├── AuthContext.js
        │   ├── CartContext.js
        │   └── SiteSettingsContext.js  # Theme colors & layout settings
        ├── pages/
        │   ├── Home.jsx
        │   ├── Shop.jsx
        │   ├── ProductDetail.jsx
        │   ├── AdminDashboard.jsx  # Settings tabs for customization
        │   └── ...
        └── index.css        # CSS variables for theming
```

## Key API Endpoints
- `GET /api/settings` - Public site settings (theme, layout, content)
- `PUT /api/admin/settings` - Update site settings (admin only)
- `GET /api/products` - Product list with ratings
- `POST /api/checkout/create-session` - Stripe checkout

## Prioritized Backlog

### P0 (Critical) - COMPLETED
- Product catalog ✓
- Cart & checkout ✓
- User auth ✓
- Admin panel ✓
- Theme customization ✓
- Layout customization ✓

### P1 (High Priority)
- Secondary currency display (USD toggle) - Planned
- Email notifications for orders
- Password reset functionality

### P2 (Medium Priority)
- Product image upload (currently URL-based)
- Inventory alerts (low stock)
- Discount codes/coupons
- Search functionality

### P3 (Nice to Have)
- Multi-language support
- Analytics dashboard
- Invoice PDF generation
- Shipping calculator

## Deployment Status
- Preview: https://handmade-haven-12.preview.emergentagent.com
- Production: Ready for deployment (gitignore fixed)

## Test Reports
- /app/test_reports/iteration_2.json - Theme customization tests (100% pass rate)
