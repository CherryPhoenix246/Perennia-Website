"""
Backend API tests for Site Settings and Theme Customization
Tests: /api/settings (GET), /api/admin/settings (PUT)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSettingsAPI:
    """Test site settings endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
    def get_admin_token(self):
        """Get admin authentication token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@perennia.bb",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    # ==================== PUBLIC SETTINGS ENDPOINT ====================
    
    def test_get_settings_public(self):
        """Test GET /api/settings - public endpoint returns settings"""
        response = self.session.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Verify required fields exist
        assert "business_name" in data, "Missing business_name"
        assert "theme_colors" in data, "Missing theme_colors"
        assert "layout_settings" in data, "Missing layout_settings"
        print(f"SUCCESS: GET /api/settings returned settings with business_name: {data.get('business_name')}")
        
    def test_get_settings_theme_colors_structure(self):
        """Test that theme_colors has all required color fields"""
        response = self.session.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        theme_colors = data.get("theme_colors", {})
        
        required_colors = ["primary", "secondary", "accent", "background", "surface", "text_primary", "text_secondary"]
        for color in required_colors:
            assert color in theme_colors, f"Missing theme color: {color}"
            assert theme_colors[color].startswith("#"), f"Color {color} should be hex format"
        
        print(f"SUCCESS: theme_colors has all required fields: {list(theme_colors.keys())}")
        
    def test_get_settings_layout_settings_structure(self):
        """Test that layout_settings has all required toggle fields"""
        response = self.session.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        layout = data.get("layout_settings", {})
        
        required_toggles = ["show_hero", "show_categories", "show_featured", "show_about_snippet", "show_newsletter"]
        for toggle in required_toggles:
            assert toggle in layout, f"Missing layout toggle: {toggle}"
            assert isinstance(layout[toggle], bool), f"Toggle {toggle} should be boolean"
        
        print(f"SUCCESS: layout_settings has all required toggles")
        
    # ==================== ADMIN SETTINGS ENDPOINT ====================
    
    def test_update_settings_requires_auth(self):
        """Test PUT /api/admin/settings requires authentication"""
        response = self.session.put(f"{BASE_URL}/api/admin/settings", json={
            "business_name": "Test Name"
        })
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("SUCCESS: Admin settings endpoint requires authentication")
        
    def test_update_settings_requires_admin(self):
        """Test PUT /api/admin/settings requires admin role"""
        # First register a regular user
        import uuid
        test_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User"
        })
        
        if reg_response.status_code == 200:
            token = reg_response.json().get("token")
            headers = {"Authorization": f"Bearer {token}"}
            
            response = self.session.put(f"{BASE_URL}/api/admin/settings", 
                json={"business_name": "Test Name"},
                headers=headers
            )
            assert response.status_code == 403, f"Expected 403 for non-admin, got {response.status_code}"
            print("SUCCESS: Admin settings endpoint requires admin role")
        else:
            pytest.skip("Could not create test user")
            
    def test_update_theme_colors_as_admin(self):
        """Test admin can update theme colors"""
        token = self.get_admin_token()
        assert token is not None, "Failed to get admin token"
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get current settings first
        current = self.session.get(f"{BASE_URL}/api/settings").json()
        original_primary = current.get("theme_colors", {}).get("primary", "#D4AF37")
        
        # Update to a new color
        new_primary = "#FF5733"
        response = self.session.put(f"{BASE_URL}/api/admin/settings", 
            json={
                "theme_colors": {
                    "primary": new_primary,
                    "secondary": "#40E0D0",
                    "accent": "#4A0E5C",
                    "background": "#050505",
                    "surface": "#0F0F0F",
                    "text_primary": "#F5F5F5",
                    "text_secondary": "#A3A3A3"
                }
            },
            headers=headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify the update
        updated = response.json()
        assert updated.get("theme_colors", {}).get("primary") == new_primary, "Primary color not updated"
        print(f"SUCCESS: Theme color updated from {original_primary} to {new_primary}")
        
        # Verify persistence by fetching again
        verify = self.session.get(f"{BASE_URL}/api/settings").json()
        assert verify.get("theme_colors", {}).get("primary") == new_primary, "Color change not persisted"
        print("SUCCESS: Theme color change persisted in database")
        
        # Restore original color
        self.session.put(f"{BASE_URL}/api/admin/settings", 
            json={
                "theme_colors": {
                    "primary": original_primary,
                    "secondary": "#40E0D0",
                    "accent": "#4A0E5C",
                    "background": "#050505",
                    "surface": "#0F0F0F",
                    "text_primary": "#F5F5F5",
                    "text_secondary": "#A3A3A3"
                }
            },
            headers=headers
        )
        print(f"SUCCESS: Restored original primary color: {original_primary}")
        
    def test_update_layout_settings_as_admin(self):
        """Test admin can update layout toggles"""
        token = self.get_admin_token()
        assert token is not None, "Failed to get admin token"
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get current settings
        current = self.session.get(f"{BASE_URL}/api/settings").json()
        original_show_hero = current.get("layout_settings", {}).get("show_hero", True)
        
        # Toggle hero section off
        response = self.session.put(f"{BASE_URL}/api/admin/settings", 
            json={
                "layout_settings": {
                    "show_hero": False,
                    "show_categories": True,
                    "show_featured": True,
                    "show_about_snippet": True,
                    "show_newsletter": True,
                    "navbar_style": "glass",
                    "footer_style": "full",
                    "product_card_style": "default"
                }
            },
            headers=headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify update
        updated = response.json()
        assert updated.get("layout_settings", {}).get("show_hero") == False, "show_hero not updated"
        print("SUCCESS: Layout setting show_hero toggled to False")
        
        # Restore original
        self.session.put(f"{BASE_URL}/api/admin/settings", 
            json={
                "layout_settings": {
                    "show_hero": original_show_hero,
                    "show_categories": True,
                    "show_featured": True,
                    "show_about_snippet": True,
                    "show_newsletter": True,
                    "navbar_style": "glass",
                    "footer_style": "full",
                    "product_card_style": "default"
                }
            },
            headers=headers
        )
        print(f"SUCCESS: Restored show_hero to {original_show_hero}")
        
    def test_update_logo_url_as_admin(self):
        """Test admin can update logo URL"""
        token = self.get_admin_token()
        assert token is not None, "Failed to get admin token"
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get current logo
        current = self.session.get(f"{BASE_URL}/api/settings").json()
        original_logo = current.get("logo_url", "")
        
        # Update logo URL
        new_logo = "https://example.com/test-logo.png"
        response = self.session.put(f"{BASE_URL}/api/admin/settings", 
            json={"logo_url": new_logo},
            headers=headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify update
        updated = response.json()
        assert updated.get("logo_url") == new_logo, "Logo URL not updated"
        print(f"SUCCESS: Logo URL updated to {new_logo}")
        
        # Restore original
        self.session.put(f"{BASE_URL}/api/admin/settings", 
            json={"logo_url": original_logo},
            headers=headers
        )
        print(f"SUCCESS: Restored original logo URL")
        
    def test_update_business_name_as_admin(self):
        """Test admin can update business name"""
        token = self.get_admin_token()
        assert token is not None, "Failed to get admin token"
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get current name
        current = self.session.get(f"{BASE_URL}/api/settings").json()
        original_name = current.get("business_name", "Perennia")
        
        # Update business name
        new_name = "TEST_Perennia Updated"
        response = self.session.put(f"{BASE_URL}/api/admin/settings", 
            json={"business_name": new_name},
            headers=headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify update
        updated = response.json()
        assert updated.get("business_name") == new_name, "Business name not updated"
        print(f"SUCCESS: Business name updated to {new_name}")
        
        # Restore original
        self.session.put(f"{BASE_URL}/api/admin/settings", 
            json={"business_name": original_name},
            headers=headers
        )
        print(f"SUCCESS: Restored original business name: {original_name}")


class TestAdminAuth:
    """Test admin authentication for settings access"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
    def test_admin_login(self):
        """Test admin can login with provided credentials"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@perennia.bb",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Admin login failed: {response.status_code}"
        
        data = response.json()
        assert "token" in data, "No token in response"
        assert data.get("user", {}).get("is_admin") == True, "User is not admin"
        print("SUCCESS: Admin login successful with is_admin=True")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
