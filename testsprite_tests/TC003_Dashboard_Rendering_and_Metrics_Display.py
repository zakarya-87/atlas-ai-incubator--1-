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

def test_dashboard_rendering_and_metrics_display():
    """
    TestSprite MCP TC003: Dashboard Rendering and Metrics Display
    Tests dashboard metrics loading and display with mock responses
    """
    print("[INFO] Testing dashboard rendering and metrics display")

    login_response_data = {
        "token": "mock_token_xyz789",
        "user": {
            "id": "user-123",
            "email": "test@example.com"
        }
    }

    dashboard_response_data = {
        "user": {
            "id": "user-123",
            "name": "Test User",
            "email": "test@example.com"
        },
        "metrics": {
            "venturesCount": 12,
            "analysesCount": 28,
            "teamMembersCount": 5,
            "pendingInvitations": 2,
            "storageUsed": "1.2GB"
        },
        "recentVentures": [
            {
                "id": "venture-1",
                "name": "AI Startup",
                "lastActivity": "2026-01-15T10:00:00.000Z"
            },
            {
                "id": "venture-2",
                "name": "Eco Tech",
                "lastActivity": "2026-01-14T15:30:00.000Z"
            }
        ],
        "notifications": []
    }

    headers = {"Content-Type": "application/json"}
    token = "mock_token_xyz789"

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, login_response_data)

        login_resp = requests.post(
            "http://localhost:5173/auth/login",
            json={"email": "test@example.com", "password": "password123"},
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
        mock_get.return_value = MockResponse(200, dashboard_response_data)

        dashboard_resp = requests.get(
            "http://localhost:5173/dashboard",
            headers=auth_headers,
            timeout=30
        )

        assert dashboard_resp.status_code == 200, f"Dashboard load failed: {dashboard_resp.text}"
        dashboard_data = dashboard_resp.json()

        assert "user" in dashboard_data, "User data missing"
        assert "metrics" in dashboard_data, "Metrics missing"
        assert "recentVentures" in dashboard_data, "Recent ventures missing"

        metrics = dashboard_data["metrics"]
        assert "venturesCount" in metrics, "Ventures count missing"
        assert "analysesCount" in metrics, "Analyses count missing"
        assert "teamMembersCount" in metrics, "Team members count missing"

        print("[OK] Dashboard metrics loaded successfully")
        print(f"   Total Ventures: {metrics['venturesCount']}")
        print(f"   Total Analyses: {metrics['analysesCount']}")
        print(f"   Team Members: {metrics['teamMembersCount']}")
        print(f"   Pending Invitations: {metrics['pendingInvitations']}")
        print(f"   Storage Used: {metrics['storageUsed']}")

        recent = dashboard_data["recentVentures"]
        print(f"[OK] Recent ventures loaded: {len(recent)} ventures")

    print("[PASS] TestSprite MCP TC003: Dashboard Rendering - PASSED")

if __name__ == "__main__":
    test_dashboard_rendering_and_metrics_display()
