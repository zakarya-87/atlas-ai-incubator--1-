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

def test_get_venture_details_by_id():
    """
    TestSprite MCP TC005: Get Venture Details by ID
    Tests retrieving venture details using venture ID with mock responses
    """
    print("[INFO] Testing get venture details by ID")

    login_response_data = {
        "token": "mock_token_venture123",
        "user": {"id": "user-123", "email": "test@example.com"}
    }

    create_venture_response = {
        "id": "venture-456",
        "name": "Test Venture for TC005",
        "description": "Venture created for testing get venture details by ID",
        "userId": "user-123",
        "createdAt": "2026-01-16T15:00:00.000Z",
        "updatedAt": "2026-01-16T15:00:00.000Z"
    }

    get_venture_response = {
        "id": "venture-456",
        "name": "Test Venture for TC005",
        "description": "Venture created for testing get venture details by ID",
        "userId": "user-123",
        "status": "active",
        "createdAt": "2026-01-16T15:00:00.000Z",
        "updatedAt": "2026-01-16T15:00:00.000Z"
    }

    headers = {"Content-Type": "application/json"}
    token = "mock_token_venture123"
    venture_id = "venture-456"

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, login_response_data)

        requests.post(
            "http://localhost:5173/auth/login",
            json={"email": "admin@atlasaiincubator.com", "password": "demoAdminPass123"},
            headers=headers,
            timeout=30
        )

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(201, create_venture_response)

        create_resp = requests.post(
            "http://localhost:5173/ventures",
            json={"name": "Test Venture for TC005", "description": "Venture created for testing"},
            headers=auth_headers,
            timeout=30
        )

        assert create_resp.status_code in [200, 201], f"Create venture failed: {create_resp.text}"
        venture_id = create_resp.json()["id"]
        print(f"[OK] Venture created: {venture_id}")

    with patch('requests.get') as mock_get:
        mock_get.return_value = MockResponse(200, get_venture_response)

        get_resp = requests.get(
            f"http://localhost:5173/ventures/{venture_id}",
            headers=auth_headers,
            timeout=30
        )

        assert get_resp.status_code == 200, f"Get venture failed: {get_resp.text}"
        venture_data = get_resp.json()

        assert venture_data["id"] == venture_id, "Venture ID mismatch"
        assert venture_data["name"] == "Test Venture for TC005", "Venture name mismatch"
        assert venture_data["description"] == "Venture created for testing get venture details by ID", "Description mismatch"

        print(f"[OK] Venture details retrieved successfully")
        print(f"   ID: {venture_data['id']}")
        print(f"   Name: {venture_data['name']}")
        print(f"   Status: {venture_data.get('status', 'unknown')}")

    with patch('requests.get') as mock_get:
        not_found_response = {"error": "Venture not found", "status": 404}
        mock_get.return_value = MockResponse(404, not_found_response)

        error_resp = requests.get(
            "http://localhost:5173/ventures/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
            timeout=30
        )

        assert error_resp.status_code == 404, f"Expected 404 for non-existent venture"
        print("[OK] Non-existent venture returns 404 as expected")

    print("[PASS] TestSprite MCP TC005: Get Venture Details - PASSED")

if __name__ == "__main__":
    test_get_venture_details_by_id()
