import requests
import uuid

BASE_URL = "http://localhost:5173"
TIMEOUT = 30

# Test user credentials for login/register (unique email to avoid conflicts)
TEST_USER_EMAIL = f"testuser_{uuid.uuid4()}@example.com"
TEST_USER_PASSWORD = "TestPassword123!"

def test_update_user_profile_information():
    try:
        # Step 1: Register a new user to test profile update
        register_payload = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        register_response = requests.post(
            f"{BASE_URL}/auth/register",
            json=register_payload,
            timeout=TIMEOUT
        )
        assert register_response.status_code == 201 or register_response.status_code == 200, \
            f"Registration failed: {register_response.text}"

        # Step 2: Login to obtain JWT token
        login_payload = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_payload,
            timeout=TIMEOUT
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        login_data = login_response.json()
        token = login_data.get("token") or login_data.get("accessToken") or login_data.get("access_token")
        assert token, "JWT token not found in login response"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Step 3: Get current user profile to compare later
        profile_get_response = requests.get(
            f"{BASE_URL}/users/profile",
            headers=headers,
            timeout=TIMEOUT
        )
        assert profile_get_response.status_code == 200, \
            f"Fetching user profile failed: {profile_get_response.text}"
        original_profile = profile_get_response.json()

        # Step 4: Prepare updated profile data - change name and language preference
        updated_profile_payload = {
            "name": "Updated Test User",
            "preferences": {
                "language": "fr",  # Change language to French for internationalization test
                "notifications": True
            }
        }
        # Additional fields might be included depending on API implementation - keep minimal but meaningful

        # Step 5: Update user profile using PUT /users/profile
        update_response = requests.put(
            f"{BASE_URL}/users/profile",
            headers=headers,
            json=updated_profile_payload,
            timeout=TIMEOUT
        )
        assert update_response.status_code == 200, f"Profile update failed: {update_response.text}"
        update_resp_data = update_response.json()

        # Verify the response reflects the updated data (at least the 'name' and 'preferences' keys)
        assert update_resp_data.get("name") == updated_profile_payload["name"], "Name not updated correctly"
        prefs = update_resp_data.get("preferences", {})
        assert prefs.get("language") == updated_profile_payload["preferences"]["language"], "Language preference not updated"
        assert prefs.get("notifications") == updated_profile_payload["preferences"]["notifications"], "Notifications preference not updated"

        # Step 6: Retrieve profile again and verify persistence
        profile_after_update_response = requests.get(
            f"{BASE_URL}/users/profile",
            headers=headers,
            timeout=TIMEOUT
        )
        assert profile_after_update_response.status_code == 200, \
            f"Fetching user profile after update failed: {profile_after_update_response.text}"
        profile_after_update = profile_after_update_response.json()
        assert profile_after_update.get("name") == updated_profile_payload["name"], "Updated name not persisted"
        prefs_after = profile_after_update.get("preferences", {})
        assert prefs_after.get("language") == updated_profile_payload["preferences"]["language"], "Updated language preference not persisted"
        assert prefs_after.get("notifications") == updated_profile_payload["preferences"]["notifications"], "Updated notifications preference not persisted"

    finally:
        # Cleanup - delete test user if API provides a way (assuming DELETE /users/profile for cleanup)
        # If no delete endpoint, this part can be adapted or omitted.
        # Attempt delete with auth token if endpoint exists:
        try:
            delete_response = requests.delete(
                f"{BASE_URL}/users/profile",
                headers=headers,
                timeout=TIMEOUT
            )
            # Accept 200 or 204 as success or not implemented at all
            assert delete_response.status_code in {200, 204}, f"Failed to delete test user: {delete_response.text}"
        except Exception:
            pass  # Ignore if delete not supported or fails


test_update_user_profile_information()