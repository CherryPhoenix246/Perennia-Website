import requests
import sys
import json
from datetime import datetime
import uuid

class PerenniaAPITester:
    def __init__(self, base_url="https://handmade-haven-12.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n🔍 Testing Basic Endpoints...")
        
        # Test root endpoint
        self.run_test("API Root", "GET", "", 200)
        
        # Test products endpoint
        success, products = self.run_test("Get Products", "GET", "products", 200)
        if success and isinstance(products, list):
            print(f"   Found {len(products)} products")
            return products
        return []

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        test_user_data = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "first_name": "Test",
            "last_name": "User",
            "phone": "246-123-4567"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   User registered with token: {self.token[:20]}...")
            return test_user_data
        return None

    def test_user_login(self, user_data=None):
        """Test user login"""
        print("\n🔍 Testing User Login...")
        
        if not user_data:
            # Try with a test user
            user_data = {
                "email": "test@test.com",
                "password": "TestPass123!"
            }
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   User logged in with token: {self.token[:20]}...")
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔍 Testing Admin Login...")
        
        admin_data = {
            "email": "admin@perennia.bb",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=admin_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin logged in with token: {self.admin_token[:20]}...")
            return True
        return False

    def test_protected_endpoints(self):
        """Test endpoints that require authentication"""
        print("\n🔍 Testing Protected Endpoints...")
        
        if not self.token:
            print("   Skipping - no user token available")
            return
        
        headers = {'Authorization': f'Bearer {self.token}'}
        
        # Test get user profile
        self.run_test("Get User Profile", "GET", "auth/me", 200, headers=headers)
        
        # Test get user orders
        self.run_test("Get User Orders", "GET", "orders", 200, headers=headers)

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n🔍 Testing Admin Endpoints...")
        
        if not self.admin_token:
            print("   Skipping - no admin token available")
            return
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test admin orders
        self.run_test("Get All Orders (Admin)", "GET", "admin/orders", 200, headers=headers)
        
        # Test admin contacts
        self.run_test("Get Contact Messages (Admin)", "GET", "admin/contacts", 200, headers=headers)

    def test_contact_form(self):
        """Test contact form submission"""
        print("\n🔍 Testing Contact Form...")
        
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Message",
            "message": "This is a test message from the API tester."
        }
        
        self.run_test(
            "Submit Contact Form",
            "POST",
            "contact",
            200,
            data=contact_data
        )

    def test_product_details(self, products):
        """Test individual product endpoints"""
        print("\n🔍 Testing Product Details...")
        
        if not products:
            print("   Skipping - no products available")
            return
        
        # Test first product
        product = products[0]
        product_id = product.get('id')
        
        if product_id:
            # Test get single product
            self.run_test(
                f"Get Product Details",
                "GET",
                f"products/{product_id}",
                200
            )
            
            # Test get product reviews
            self.run_test(
                f"Get Product Reviews",
                "GET",
                f"products/{product_id}/reviews",
                200
            )

    def test_order_creation(self, products):
        """Test order creation flow"""
        print("\n🔍 Testing Order Creation...")
        
        if not self.token:
            print("   Skipping - no user token available")
            return
        
        if not products:
            print("   Skipping - no products available")
            return
        
        headers = {'Authorization': f'Bearer {self.token}'}
        product = products[0]
        
        order_data = {
            "items": [
                {
                    "product_id": product['id'],
                    "quantity": 1
                }
            ],
            "shipping_address": "123 Test Street",
            "city": "Bridgetown",
            "postal_code": "BB11000",
            "country": "Barbados",
            "phone": "246-123-4567",
            "notes": "Test order",
            "payment_method": "form"
        }
        
        self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=order_data,
            headers=headers
        )

    def test_seed_data(self):
        """Test data seeding"""
        print("\n🔍 Testing Data Seeding...")
        
        self.run_test("Seed Products Data", "POST", "seed", 200)

    def test_admin_setup(self):
        """Test admin setup"""
        print("\n🔍 Testing Admin Setup...")
        
        # This might fail if admin already exists, which is expected
        success, response = self.run_test("Setup Admin User", "POST", "admin/setup", 200)
        if not success:
            # Try with 400 status (admin already exists)
            self.run_test("Admin Already Exists", "POST", "admin/setup", 400)

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Perennia API Test Suite")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic functionality
        products = self.test_basic_endpoints()
        
        # Test data seeding
        self.test_seed_data()
        
        # Re-fetch products after seeding
        if not products:
            _, products = self.run_test("Get Products After Seed", "GET", "products", 200)
            if not isinstance(products, list):
                products = []
        
        # Test admin setup
        self.test_admin_setup()
        
        # Test user registration and login
        user_data = self.test_user_registration()
        if not user_data:
            # Try login with existing user
            self.test_user_login()
        
        # Test admin login
        self.test_admin_login()
        
        # Test protected endpoints
        self.test_protected_endpoints()
        
        # Test admin endpoints
        self.test_admin_endpoints()
        
        # Test contact form
        self.test_contact_form()
        
        # Test product details
        self.test_product_details(products)
        
        # Test order creation
        self.test_order_creation(products)
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return 1

def main():
    tester = PerenniaAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())