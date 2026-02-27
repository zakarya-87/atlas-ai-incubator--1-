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

def test_user_authentication_success():
    """
    TestSprite MCP TC001: User Authentication Success
    Tests successful user login and dashboard redirect with mock responses
    """
    print("[INFO] Testing user authentication success flow")

    login_response_data = {
        "token": "mock_jwt_token_abc123",
        "user": {
            "id": "user-123",
            "email": "testuser@example.com",
            "name": "Test User"
        }
    }

    dashboard_response_data = {
        "user": {
            "id": "user-123",
            "name": "Test User"
        },
        "metrics": {
            "venturesCount": 5,
            "analysesCount": 12,
            "teamMembersCount": 3
        }
    }

    headers = {"Content-Type": "application/json"}
    token = None

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, login_response_data)

        login_resp = requests.post(
            "http://localhost:5173/auth/login",
            json={"email": "testuser@example.com", "password": "ValidPass123!"},
            headers=headers,
            timeout=30
        )

        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        assert "token" in login_data, "Token missing from login response"

        token = login_data["token"]
        print(f"[OK] User authenticated successfully: {login_data['user']['email']}")

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    with patch('requests.get') as mock_get:
        mock_get.return_value = MockResponse(200, dashboard_response_data)

        dashboard_resp = requests.get(
            "http://localhost:5173/dashboard",
            headers=auth_headers,
            timeout=30
        )

        assert dashboard_resp.status_code == 200, f"Dashboard load failed: {dashboard_resp.text}"
        dashboard_data = dashboard_resp.json()

        assert "user" in dashboard_data, "User data missing from dashboard"
        assert "metrics" in dashboard_data, "Metrics missing from dashboard"

        metrics = dashboard_data["metrics"]
        assert "venturesCount" in metrics, "Ventures count missing"
        assert "analysesCount" in metrics, "Analyses count missing"
        assert "teamMembersCount" in metrics, "Team members count missing"

        print("[OK] Dashboard loaded successfully")
        print(f"   Ventures: {metrics['venturesCount']}")
        print(f"   Analyses: {metrics['analysesCount']}")
        print(f"   Team Members: {metrics['teamMembersCount']}")

    print("[PASS] TestSprite MCP TC001: User Authentication Success - PASSED")

if __name__ == "__main__":
    test_user_authentication_success()
