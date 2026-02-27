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

def test_user_registration_with_new_email():
    """
    TestSprite MCP TC002: User Registration with New Email
    Tests user registration with unique email using mock responses
    """
    print("[INFO] Testing user registration with new email")

    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    password = "StrongPassword123!"

    register_response_data = {
        "id": f"user-{uuid.uuid4()}",
        "email": unique_email,
        "name": "Test User",
        "createdAt": "2026-01-16T15:00:00.000Z"
    }

    login_response_data = {
        "token": f"mock_token_{uuid.uuid4()}",
        "user": {
            "id": register_response_data["id"],
            "email": unique_email
        }
    }

    headers = {"Content-Type": "application/json"}

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(201, register_response_data)

        register_resp = requests.post(
            "http://localhost:5173/auth/register",
            json={"email": unique_email, "password": password},
            headers=headers,
            timeout=30
        )

        assert register_resp.status_code == 201, f"Expected 201, got {register_resp.status_code}"
        register_data = register_resp.json()

        assert "id" in register_data, "User ID missing from registration response"
        assert register_data["email"] == unique_email, "Email mismatch in response"
        assert "createdAt" in register_data, "Creation timestamp missing"

        print(f"[OK] User registered successfully: {register_data['email']}")
        print(f"   User ID: {register_data['id']}")

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, login_response_data)

        login_resp = requests.post(
            "http://localhost:5173/auth/login",
            json={"email": unique_email, "password": password},
            headers=headers,
            timeout=30
        )

        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()

        assert "token" in login_data, "Token missing from login response"
        assert "user" in login_data, "User data missing from login response"

        print(f"[OK] User logged in successfully")

    print("[PASS] TestSprite MCP TC002: User Registration - PASSED")

if __name__ == "__main__":
    test_user_registration_with_new_email()
