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

## What's Been Implemented (January 2025)

### Backend (FastAPI + MongoDB)
- [x] User authentication (JWT-based)
- [x] Product CRUD with categories
- [x] Shopping cart & order management
- [x] Stripe payment integration
- [x] Product reviews system
- [x] Contact form
- [x] Admin dashboard APIs
- [x] Payment transactions collection

### Frontend (React)
- [x] Dark luxurious theme with Playfair Display + Montserrat fonts
- [x] Responsive navbar with glassmorphism
- [x] Homepage with hero, categories, featured products
- [x] Shop page with category filtering
- [x] Product detail page with reviews
- [x] Shopping cart drawer & page
- [x] Checkout with Stripe integration
- [x] User registration & login
- [x] Customer account dashboard
- [x] Contact page
- [x] About page
- [x] Admin login & dashboard
- [x] Admin product management (CRUD)
- [x] Admin order management
- [x] Admin messages view

### Admin Credentials
- Email: admin@perennia.bb
- Password: admin123

## Prioritized Backlog

### P0 (Critical) - DONE
- Product catalog ✓
- Cart & checkout ✓
- User auth ✓
- Admin panel ✓

### P1 (High Priority) - Deferred
- Email notifications for orders
- Order confirmation emails
- Password reset functionality
- Image upload for products (currently URL-based)

### P2 (Medium Priority) - Deferred
- Inventory alerts (low stock)
- Discount codes/coupons
- Wishlist feature
- Customer order tracking
- Search functionality

### P3 (Nice to Have) - Deferred
- Multi-language support
- Analytics dashboard
- Customer reviews moderation
- Shipping calculator
- Invoice PDF generation

## Next Tasks
1. Add logo upload/integration
2. Implement email notifications (SendGrid/Resend)
3. Add search functionality
4. Implement discount codes
5. Add inventory alerts
