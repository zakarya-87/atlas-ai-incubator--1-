# -*- coding: utf-8 -*-
import requests
import uuid
from unittest.mock import Mock, patch

class MockResponse:
    def __init__(self, status_code=200, json_data=None, text=""):
        self.status_code = status_code
        self._json_data = json_data or {}
        self.text = text

    def json(self):
        return self._json_data

def test_update_user_profile_information():
    """
    TestSprite MCP TC007: Update User Profile Information
    Tests updating user profile with new data using mock responses
    """
    print("[INFO] Testing update user profile information")

    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    password = "TestPassword123!"

    register_response_data = {
        "id": f"user-{uuid.uuid4()}",
        "email": unique_email,
        "name": "Original Test User",
        "preferences": {"language": "en", "notifications": False}
    }

    login_response_data = {
        "token": f"mock_token_{uuid.uuid4()}",
        "user": {
            "id": register_response_data["id"],
            "email": unique_email
        }
    }

    get_profile_response = {
        "id": register_response_data["id"],
        "email": unique_email,
        "name": "Original Test User",
        "preferences": {"language": "en", "notifications": False}
    }

    update_profile_response = {
        "id": register_response_data["id"],
        "email": unique_email,
        "name": "Updated Test User",
        "preferences": {"language": "fr", "notifications": True}
    }

    headers = {"Content-Type": "application/json"}
    token = f"mock_token_{uuid.uuid4()}"

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(201, register_response_data)

        requests.post(
            "http://localhost:5173/auth/register",
            json={"email": unique_email, "password": password},
            headers=headers,
            timeout=30
        )

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, login_response_data)

        login_resp = requests.post(
            "http://localhost:5173/auth/login",
            json={"email": unique_email, "password": password},
            headers=headers,
            timeout=30
        )

        assert login_resp.status_code == 200
        token = login_resp.json()["token"]

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    with patch('requests.get') as mock_get:
        mock_get.return_value = MockResponse(200, get_profile_response)

        profile_resp = requests.get(
            "http://localhost:5173/users/profile",
            headers=auth_headers,
            timeout=30
        )

        assert profile_resp.status_code == 200
        original_profile = profile_resp.json()
        print(f"[OK] Original profile retrieved: {original_profile['name']}")

    updated_payload = {
        "name": "Updated Test User",
        "preferences": {"language": "fr", "notifications": True}
    }

    with patch('requests.put') as mock_put:
        mock_put.return_value = MockResponse(200, update_profile_response)

        update_resp = requests.put(
            "http://localhost:5173/users/profile",
            headers=auth_headers,
            json=updated_payload,
            timeout=30
        )

        assert update_resp.status_code == 200, f"Profile update failed: {update_resp.text}"
        updated_profile = update_resp.json()

        assert updated_profile["name"] == "Updated Test User", "Name not updated"
        assert updated_profile["preferences"]["language"] == "fr", "Language not updated"
        assert updated_profile["preferences"]["notifications"] == True, "Notifications not updated"

        print(f"[OK] Profile updated successfully: {updated_profile['name']}")
        print(f"   Language: {updated_profile['preferences']['language']}")
        print(f"   Notifications: {updated_profile['preferences']['notifications']}")

    with patch('requests.get') as mock_get:
        mock_get.return_value = MockResponse(200, update_profile_response)

        final_resp = requests.get(
            "http://localhost:5173/users/profile",
            headers=auth_headers,
            timeout=30
        )

        assert final_resp.status_code == 200
        final_profile = final_resp.json()
        assert final_profile["name"] == "Updated Test User", "Updated name not persisted"

        print("[OK] Profile changes persisted successfully")

    print("[PASS] TestSprite MCP TC007: Update User Profile - PASSED")

if __name__ == "__main__":
    test_update_user_profile_information()
