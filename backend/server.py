from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from bson import ObjectId

# Stripe imports
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'perennia-secret-key-2024')
JWT_ALGORITHM = "HS256"

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    is_admin: bool = False
    created_at: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price_bbd: float
    price_usd: float
    category: str  # resin, soaps, candles
    images: List[str] = []
    stock: int = 0
    featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_bbd: Optional[float] = None
    price_usd: Optional[float] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price_bbd: float
    price_usd: float
    category: str
    images: List[str]
    stock: int
    featured: bool
    created_at: str
    average_rating: float = 0.0
    review_count: int = 0

class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    comment: str

class ReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: str

class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(ge=1)

class CartResponse(BaseModel):
    items: List[dict]
    total_bbd: float
    total_usd: float

class OrderCreate(BaseModel):
    items: List[CartItem]
    shipping_address: str
    city: str
    postal_code: str
    country: str = "Barbados"
    phone: str
    notes: Optional[str] = None
    payment_method: str = "stripe"  # stripe or form

class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[dict]
    total_bbd: float
    total_usd: float
    shipping_address: str
    city: str
    postal_code: str
    country: str
    phone: str
    notes: Optional[str]
    status: str
    payment_status: str
    payment_method: str
    created_at: str

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class CheckoutRequest(BaseModel):
    order_id: str
    origin_url: str

class SocialLinks(BaseModel):
    instagram: Optional[str] = ""
    facebook: Optional[str] = ""
    twitter: Optional[str] = ""
    tiktok: Optional[str] = ""
    whatsapp: Optional[str] = ""
    youtube: Optional[str] = ""
    pinterest: Optional[str] = ""

class ContactInfo(BaseModel):
    address: Optional[str] = "Bridgetown, Barbados"
    phone: Optional[str] = "+1 (246) 123-4567"
    email: Optional[str] = "info@perennia.bb"

class HeroSection(BaseModel):
    tagline: Optional[str] = "Handcrafted in Barbados"
    title: Optional[str] = "Luxury Artisan"
    subtitle: Optional[str] = "Gifts & Décor"
    description: Optional[str] = "Discover our collection of handcrafted resin art, natural body care, and artisan candles. Each piece crafted with love and Caribbean spirit."
    image_url: Optional[str] = ""

class AboutSection(BaseModel):
    title: Optional[str] = "Crafted with Love, Inspired by the Caribbean"
    content: Optional[str] = "Perennia was born from a deep passion for artistry and the enchanting beauty of Barbados. What started as a personal creative journey has blossomed into a celebration of Caribbean craftsmanship."
    quote: Optional[str] = "Every piece tells a story of Caribbean beauty and timeless elegance."
    image_url: Optional[str] = ""

class ThemeColors(BaseModel):
    primary: Optional[str] = "#D4AF37"  # Gold
    secondary: Optional[str] = "#40E0D0"  # Turquoise
    accent: Optional[str] = "#4A0E5C"  # Deep purple
    background: Optional[str] = "#050505"  # Near black
    surface: Optional[str] = "#0F0F0F"  # Dark surface
    text_primary: Optional[str] = "#F5F5F5"  # White text
    text_secondary: Optional[str] = "#A3A3A3"  # Gray text

class LayoutSettings(BaseModel):
    show_hero: Optional[bool] = True
    show_categories: Optional[bool] = True
    show_featured: Optional[bool] = True
    show_about_snippet: Optional[bool] = True
    show_newsletter: Optional[bool] = True
    navbar_style: Optional[str] = "glass"  # glass, solid, transparent
    footer_style: Optional[str] = "full"  # full, minimal
    product_card_style: Optional[str] = "default"  # default, minimal, detailed

class SiteSettings(BaseModel):
    business_name: Optional[str] = "Perennia"
    tagline: Optional[str] = "Handcrafted Luxury from Barbados"
    logo_url: Optional[str] = ""
    social_links: Optional[SocialLinks] = None
    contact_info: Optional[ContactInfo] = None
    hero_section: Optional[HeroSection] = None
    about_section: Optional[AboutSection] = None
    footer_text: Optional[str] = "Handcrafted luxury from Barbados. Each piece tells a story of Caribbean artistry and timeless elegance."
    theme_colors: Optional[ThemeColors] = None
    layout_settings: Optional[LayoutSettings] = None

class SiteSettingsUpdate(BaseModel):
    business_name: Optional[str] = None
    tagline: Optional[str] = None
    logo_url: Optional[str] = None
    social_links: Optional[SocialLinks] = None
    contact_info: Optional[ContactInfo] = None
    hero_section: Optional[HeroSection] = None
    about_section: Optional[AboutSection] = None
    footer_text: Optional[str] = None
    theme_colors: Optional[ThemeColors] = None
    layout_settings: Optional[LayoutSettings] = None

# ===================== AUTH HELPERS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, is_admin: bool = False) -> str:
    payload = {
        "user_id": user_id,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: dict = Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def get_optional_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        return user
    except:
        return None

# ===================== AUTH ROUTES =====================

@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "phone": user_data.phone,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    token = create_token(user_id)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "phone": user["phone"],
            "is_admin": False
        }
    }

@api_router.post("/auth/login", response_model=dict)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user.get("is_admin", False))
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "phone": user.get("phone"),
            "is_admin": user.get("is_admin", False)
        }
    }

@api_router.get("/auth/me", response_model=dict)
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "id": user["id"],
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "phone": user.get("phone"),
        "is_admin": user.get("is_admin", False)
    }

# ===================== PRODUCT ROUTES =====================

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(category: Optional[str] = None, featured: Optional[bool] = None):
    match_stage = {}
    if category:
        match_stage["category"] = category
    if featured is not None:
        match_stage["featured"] = featured
    
    pipeline = [
        {"$match": match_stage} if match_stage else {"$match": {}},
        {
            "$lookup": {
                "from": "reviews",
                "localField": "id",
                "foreignField": "product_id",
                "as": "product_reviews"
            }
        },
        {
            "$addFields": {
                "average_rating": {
                    "$cond": {
                        "if": {"$gt": [{"$size": "$product_reviews"}, 0]},
                        "then": {"$avg": "$product_reviews.rating"},
                        "else": 0.0
                    }
                },
                "review_count": {"$size": "$product_reviews"}
            }
        },
        {"$project": {"product_reviews": 0, "_id": 0}},
        {"$limit": 100}
    ]
    
    products = await db.products.aggregate(pipeline).to_list(100)
    return products

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(100)
    if reviews:
        product["average_rating"] = sum(r["rating"] for r in reviews) / len(reviews)
        product["review_count"] = len(reviews)
    else:
        product["average_rating"] = 0.0
        product["review_count"] = 0
    
    return product

@api_router.post("/admin/products", response_model=ProductResponse)
async def create_product(product_data: ProductCreate, admin: dict = Depends(get_admin_user)):
    product_id = str(uuid.uuid4())
    product = {
        "id": product_id,
        **product_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "average_rating": 0.0,
        "review_count": 0
    }
    await db.products.insert_one(product)
    return product

@api_router.put("/admin/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product_data: ProductUpdate, admin: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(100)
    if reviews:
        product["average_rating"] = sum(r["rating"] for r in reviews) / len(reviews)
        product["review_count"] = len(reviews)
    else:
        product["average_rating"] = 0.0
        product["review_count"] = 0
    
    return product

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ===================== REVIEW ROUTES =====================

@api_router.get("/products/{product_id}/reviews", response_model=List[ReviewResponse])
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(100)
    return reviews

@api_router.post("/products/{product_id}/reviews", response_model=ReviewResponse)
async def create_review(product_id: str, review_data: ReviewCreate, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    existing = await db.reviews.find_one({"product_id": product_id, "user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this product")
    
    review_id = str(uuid.uuid4())
    review = {
        "id": review_id,
        "product_id": product_id,
        "user_id": user["id"],
        "user_name": f"{user['first_name']} {user['last_name'][0]}.",
        "rating": review_data.rating,
        "comment": review_data.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review)
    return review

# ===================== ORDER ROUTES =====================

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, user: dict = Depends(get_current_user)):
    # Validate products and calculate totals
    items_with_details = []
    total_bbd = 0.0
    total_usd = 0.0
    
    for item in order_data.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        item_total_bbd = product["price_bbd"] * item.quantity
        item_total_usd = product["price_usd"] * item.quantity
        total_bbd += item_total_bbd
        total_usd += item_total_usd
        
        items_with_details.append({
            "product_id": item.product_id,
            "product_name": product["name"],
            "quantity": item.quantity,
            "price_bbd": product["price_bbd"],
            "price_usd": product["price_usd"],
            "image": product["images"][0] if product["images"] else ""
        })
        
        # Update stock
        await db.products.update_one({"id": item.product_id}, {"$inc": {"stock": -item.quantity}})
    
    order_id = str(uuid.uuid4())
    order = {
        "id": order_id,
        "user_id": user["id"],
        "user_email": user["email"],
        "items": items_with_details,
        "total_bbd": round(total_bbd, 2),
        "total_usd": round(total_usd, 2),
        "shipping_address": order_data.shipping_address,
        "city": order_data.city,
        "postal_code": order_data.postal_code,
        "country": order_data.country,
        "phone": order_data.phone,
        "notes": order_data.notes,
        "status": "pending",
        "payment_status": "pending",
        "payment_method": order_data.payment_method,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order)
    return order

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_user_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["user_id"] != user["id"] and not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    return order

@api_router.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders(admin: dict = Depends(get_admin_user)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, admin: dict = Depends(get_admin_user)):
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Status updated"}

# ===================== STRIPE PAYMENT ROUTES =====================

@api_router.post("/checkout/create-session")
async def create_checkout_session(checkout_data: CheckoutRequest, request: Request, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": checkout_data.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if order["payment_status"] == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")
    
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment not configured")
    
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    origin_url = checkout_data.origin_url.rstrip("/")
    success_url = f"{origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/checkout/cancel?order_id={checkout_data.order_id}"
    
    # Use USD for Stripe payment
    amount = float(order["total_usd"])
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": checkout_data.order_id,
            "user_id": user["id"],
            "user_email": user["email"]
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "order_id": checkout_data.order_id,
        "user_id": user["id"],
        "user_email": user["email"],
        "amount": amount,
        "currency": "usd",
        "payment_status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, user: dict = Depends(get_current_user)):
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment not configured")
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update payment transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if transaction and transaction["payment_status"] != "paid":
        new_status = "paid" if status.payment_status == "paid" else status.payment_status
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": new_status}}
        )
        
        # Update order if paid
        if status.payment_status == "paid":
            await db.orders.update_one(
                {"id": transaction["order_id"]},
                {"$set": {"payment_status": "paid", "status": "processing"}}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            order_id = webhook_response.metadata.get("order_id")
            if order_id:
                await db.orders.update_one(
                    {"id": order_id},
                    {"$set": {"payment_status": "paid", "status": "processing"}}
                )
                await db.payment_transactions.update_one(
                    {"order_id": order_id},
                    {"$set": {"payment_status": "paid"}}
                )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"received": True}

# ===================== CONTACT ROUTES =====================

@api_router.post("/contact")
async def submit_contact(message: ContactMessage):
    msg = {
        "id": str(uuid.uuid4()),
        **message.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False
    }
    await db.contact_messages.insert_one(msg)
    return {"message": "Message sent successfully"}

@api_router.get("/admin/contacts")
async def get_contact_messages(admin: dict = Depends(get_admin_user)):
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return messages

# ===================== SITE SETTINGS ROUTES =====================

@api_router.get("/settings")
async def get_site_settings():
    """Get site settings (public endpoint)"""
    settings = await db.site_settings.find_one({"id": "main"}, {"_id": 0})
    if not settings:
        # Return default settings
        default_settings = {
            "id": "main",
            "business_name": "Perennia",
            "tagline": "Handcrafted Luxury from Barbados",
            "logo_url": "/logo-transparent.png",
            "social_links": {
                "instagram": "",
                "facebook": "",
                "twitter": "",
                "tiktok": "",
                "whatsapp": "",
                "youtube": "",
                "pinterest": ""
            },
            "contact_info": {
                "address": "Bridgetown, Barbados",
                "phone": "+1 (246) 123-4567",
                "email": "info@perennia.bb"
            },
            "hero_section": {
                "tagline": "Handcrafted in Barbados",
                "title": "Luxury Artisan",
                "subtitle": "Gifts & Décor",
                "description": "Discover our collection of handcrafted resin art, natural body care, and artisan candles. Each piece crafted with love and Caribbean spirit.",
                "image_url": "https://images.unsplash.com/photo-1668086682339-f14262879c18?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwc2NlbnRlZCUyMGNhbmRsZSUyMGRhcmslMjBtb29kJTIwZ29sZHxlbnwwfHx8fDE3Njg5NDMzNDR8MA&ixlib=rb-4.1.0&q=85"
            },
            "about_section": {
                "title": "Crafted with Love, Inspired by the Caribbean",
                "content": "Perennia was born from a deep passion for artistry and the enchanting beauty of Barbados. What started as a personal creative journey has blossomed into a celebration of Caribbean craftsmanship.\n\nBased in the vibrant island of Barbados, Perennia represents more than just handcrafted goods—it's a testament to the rich artistic heritage of the Caribbean. Each resin piece captures the turquoise waters of our beaches, each candle carries the warmth of our tropical sunsets.\n\nOur body care line is crafted with natural ingredients, drawing from the healing traditions that have been passed down through generations. We believe that luxury should be accessible, sustainable, and deeply personal.",
                "quote": "Every piece tells a story of Caribbean beauty and timeless elegance.",
                "image_url": "https://images.unsplash.com/photo-1759794108525-94ff060da692?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBoYW5kbWFkZSUyMHNvYXAlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3Njg5NDMzNDJ8MA&ixlib=rb-4.1.0&q=85"
            },
            "footer_text": "Handcrafted luxury from Barbados. Each piece tells a story of Caribbean artistry and timeless elegance.",
            "theme_colors": {
                "primary": "#D4AF37",
                "secondary": "#40E0D0",
                "accent": "#4A0E5C",
                "background": "#050505",
                "surface": "#0F0F0F",
                "text_primary": "#F5F5F5",
                "text_secondary": "#A3A3A3"
            },
            "layout_settings": {
                "show_hero": True,
                "show_categories": True,
                "show_featured": True,
                "show_about_snippet": True,
                "show_newsletter": True,
                "navbar_style": "glass",
                "footer_style": "full",
                "product_card_style": "default"
            }
        }
        result = await db.site_settings.insert_one(default_settings)
        # Remove _id before returning
        default_settings.pop("_id", None)
        return default_settings
    return settings

@api_router.put("/admin/settings")
async def update_site_settings(settings: SiteSettingsUpdate, admin: dict = Depends(get_admin_user)):
    """Update site settings (admin only)"""
    update_data = {k: v for k, v in settings.model_dump().items() if v is not None}
    
    # Handle nested objects
    nested_fields = ["social_links", "contact_info", "hero_section", "about_section", "theme_colors", "layout_settings"]
    for field in nested_fields:
        if field in update_data and update_data[field]:
            update_data[field] = update_data[field].model_dump() if hasattr(update_data[field], 'model_dump') else update_data[field]
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Check if settings exist
    existing = await db.site_settings.find_one({"id": "main"})
    if existing:
        await db.site_settings.update_one({"id": "main"}, {"$set": update_data})
    else:
        update_data["id"] = "main"
        await db.site_settings.insert_one(update_data)
    
    updated = await db.site_settings.find_one({"id": "main"}, {"_id": 0})
    return updated

# ===================== ADMIN SETUP =====================

@api_router.post("/admin/setup")
async def setup_admin():
    """Create initial admin user if none exists"""
    existing_admin = await db.users.find_one({"is_admin": True})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    admin_id = str(uuid.uuid4())
    admin = {
        "id": admin_id,
        "email": "admin@perennia.bb",
        "password": hash_password("admin123"),
        "first_name": "Admin",
        "last_name": "User",
        "phone": None,
        "is_admin": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin)
    return {"message": "Admin created", "email": "admin@perennia.bb", "password": "admin123"}

# ===================== SEED DATA =====================

@api_router.post("/seed")
async def seed_data():
    """Seed initial products"""
    existing = await db.products.find_one()
    if existing:
        return {"message": "Data already seeded"}
    
    products = [
        # Resin products
        {
            "id": str(uuid.uuid4()),
            "name": "Ocean Wave Coaster Set",
            "description": "Hand-poured resin coasters capturing the essence of Caribbean waves. Each piece is unique with swirling turquoise and white tones.",
            "price_bbd": 120.00,
            "price_usd": 60.00,
            "category": "resin",
            "images": ["https://images.unsplash.com/photo-1718635310388-880694939769?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxyZXNpbiUyMGFydCUyMGRlY29yJTIwZ29sZCUyMHR1cnF1b2lzZXxlbnwwfHx8fDE3Njg5NDMzNDZ8MA&ixlib=rb-4.1.0&q=85"],
            "stock": 15,
            "featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Gold Leaf Trinket Tray",
            "description": "Elegant resin tray adorned with genuine gold leaf flakes. Perfect for jewelry or decorative display.",
            "price_bbd": 180.00,
            "price_usd": 90.00,
            "category": "resin",
            "images": ["https://images.unsplash.com/photo-1663739314425-4b0d05a8a068?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxyZXNpbiUyMGFydCUyMGRlY29yJTIwZ29sZCUyMHR1cnF1b2lzZXxlbnwwfHx8fDE3Njg5NDMzNDZ8MA&ixlib=rb-4.1.0&q=85"],
            "stock": 10,
            "featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Midnight Purple Clock",
            "description": "A stunning wall clock featuring deep purple resin with gold flecks. Functional art for your space.",
            "price_bbd": 250.00,
            "price_usd": 125.00,
            "category": "resin",
            "images": ["https://images.unsplash.com/photo-1718635310388-880694939769?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxyZXNpbiUyMGFydCUyMGRlY29yJTIwZ29sZCUyMHR1cnF1b2lzZXxlbnwwfHx8fDE3Njg5NDMzNDZ8MA&ixlib=rb-4.1.0&q=85"],
            "stock": 5,
            "featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Soaps
        {
            "id": str(uuid.uuid4()),
            "name": "Lavender Dreams Bar",
            "description": "Gentle lavender-infused soap made with organic oils. Calming scent for relaxation.",
            "price_bbd": 24.00,
            "price_usd": 12.00,
            "category": "soaps",
            "images": ["https://images.unsplash.com/photo-1622116500760-1753e5973ec7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBoYW5kbWFkZSUyMHNvYXAlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3Njg5NDMzNDJ8MA&ixlib=rb-4.1.0&q=85"],
            "stock": 50,
            "featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Charcoal Detox Scrub",
            "description": "Deep cleansing activated charcoal body scrub with coconut oil. Exfoliates and purifies.",
            "price_bbd": 36.00,
            "price_usd": 18.00,
            "category": "soaps",
            "images": ["https://images.pexels.com/photos/6621470/pexels-photo-6621470.jpeg"],
            "stock": 30,
            "featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Shea Butter Body Lotion",
            "description": "Rich moisturizing lotion with pure shea butter and vanilla essence. Nourishes dry skin.",
            "price_bbd": 48.00,
            "price_usd": 24.00,
            "category": "soaps",
            "images": ["https://images.unsplash.com/photo-1620567645328-99d8d4b6d4e5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBoYW5kbWFkZSUyMHNvYXAlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3Njg5NDMzNDJ8MA&ixlib=rb-4.1.0&q=85"],
            "stock": 25,
            "featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Candles
        {
            "id": str(uuid.uuid4()),
            "name": "Caribbean Sunset Candle",
            "description": "Hand-poured soy candle with notes of hibiscus, mango, and warm amber. 40+ hours burn time.",
            "price_bbd": 64.00,
            "price_usd": 32.00,
            "category": "candles",
            "images": ["https://images.unsplash.com/photo-1668086682339-f14262879c18?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwc2NlbnRlZCUyMGNhbmRsZSUyMGRhcmslMjBtb29kJTIwZ29sZHxlbnwwfHx8fDE3Njg5NDMzNDR8MA&ixlib=rb-4.1.0&q=85"],
            "stock": 20,
            "featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Midnight Oud Collection",
            "description": "Luxurious black vessel candle with deep oud and sandalwood fragrance. Perfect for evening ambiance.",
            "price_bbd": 96.00,
            "price_usd": 48.00,
            "category": "candles",
            "images": ["https://images.unsplash.com/photo-1651795426376-0e6adfd01f00?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwzfHxhcnRpc2FuJTIwc2NlbnRlZCUyMGNhbmRsZSUyMGRhcmslMjBtb29kJTIwZ29sZHxlbnwwfHx8fDE3Njg5NDMzNDR8MA&ixlib=rb-4.1.0&q=85"],
            "stock": 15,
            "featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Vanilla Bean Trio",
            "description": "Set of three mini candles in warm vanilla scent. Perfect gift set or home warming collection.",
            "price_bbd": 72.00,
            "price_usd": 36.00,
            "category": "candles",
            "images": ["https://images.unsplash.com/photo-1641837225643-f999493f6375?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHw0fHxhcnRpc2FuJTIwc2NlbnRlZCUyMGNhbmRsZSUyMGRhcmslMjBtb29kJTIwZ29sZHxlbnwwfHx8fDE3Njg5NDMzNDR8MA&ixlib=rb-4.1.0&q=85"],
            "stock": 18,
            "featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    return {"message": "Data seeded", "products_count": len(products)}

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Perennia API - Handcrafted Luxury"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
