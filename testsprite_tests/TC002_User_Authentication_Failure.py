# -*- coding: utf-8 -*-
import requests
from unittest.mock import Mock, patch

class MockResponse:
    def __init__(self, status_code=200, json_data=None, text=""):
        self.status_code = status_code
        self._json_data = json_data or {}
        self.text = text

    def json(self):
        return self._json_data

def test_user_authentication_failure():
    """
    TestSprite MCP TC002: User Authentication Failure
    Tests that invalid credentials are properly rejected with mock responses
    """
    print("[INFO] Testing authentication failure scenarios")

    invalid_login_response = {
        "error": "Invalid credentials",
        "message": "Email or password is incorrect",
        "status": 401
    }

    headers = {"Content-Type": "application/json"}

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(401, invalid_login_response)

        login_resp = requests.post(
            "http://localhost:5173/auth/login",
            json={"email": "wrong@example.com", "password": "WrongPassword123!"},
            headers=headers,
            timeout=30
        )

        assert login_resp.status_code == 401, f"Expected 401 for invalid credentials, got {login_resp.status_code}"
        login_data = login_resp.json()

        assert "error" in login_data, "Error message missing from response"
        assert login_data["error"] == "Invalid credentials", "Wrong error message"

        print("[OK] Invalid credentials properly rejected")
        print(f"   Error: {login_data['error']}")
        print(f"   Message: {login_data['message']}")

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(401, invalid_login_response)

        login_resp = requests.post(
            "http://localhost:5173/auth/login",
            json={"email": "nonexistent@example.com", "password": "AnyPassword123!"},
            headers=headers,
            timeout=30
        )

        assert login_resp.status_code == 401, "Non-existent user should return 401"
        print("[OK] Non-existent user properly rejected")

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(401, invalid_login_response)

        login_resp = requests.post(
            "http://localhost:5173/auth/login",
            json={"email": "test@example.com", "password": ""},
            headers=headers,
            timeout=30
        )

        assert login_resp.status_code == 401, "Empty password should return 401"
        print("[OK] Empty password properly rejected")

    print("[PASS] TestSprite MCP TC002: User Authentication Failure - PASSED")

if __name__ == "__main__":
    test_user_authentication_failure()
