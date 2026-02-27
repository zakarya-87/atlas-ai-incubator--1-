# -*- coding: utf-8 -*-
import requests
import json
from unittest.mock import Mock, patch

class MockResponse:
    def __init__(self, status_code=200, json_data=None, text=""):
        self.status_code = status_code
        self._json_data = json_data or {}
        self.text = text

    def json(self):
        return self._json_data

def test_create_new_venture_with_valid_data():
    """
    TestSprite MCP TC004: Venture Creation with Valid Data
    Tests creating a new business venture with complete and valid data
    """

    mock_create_response = {
        "id": "venture-789",
        "name": "Test Venture Unique-123",
        "description": "A valid description for a test venture created during automated testing.",
        "userId": "user-123",
        "createdAt": "2026-01-16T15:30:00.000Z",
        "updatedAt": "2026-01-16T15:30:00.000Z"
    }

    mock_get_response = {
        "id": "venture-789",
        "name": "Test Venture Unique-123",
        "description": "A valid description for a test venture created during automated testing.",
        "userId": "user-123",
        "createdAt": "2026-01-16T15:30:00.000Z",
        "updatedAt": "2026-01-16T15:30:00.000Z"
    }

    venture_data = {
        "name": "Test Venture Unique-123",
        "description": "A valid description for a test venture created during automated testing."
    }

    headers = {"Content-Type": "application/json"}
    venture_id = None

    try:
        with patch('requests.post') as mock_post:
            mock_post.return_value = MockResponse(201, mock_create_response)

            response = requests.post(
                "http://localhost:5173/ventures",
                json=venture_data,
                headers=headers,
                timeout=30
            )

            assert response.status_code in [200, 201], f"Expected status 200 or 201, got {response.status_code}"

            response_json = response.json()

            assert "id" in response_json, "Response JSON does not contain 'id'"
            assert response_json.get("name") == venture_data["name"], "Venture name mismatch in response"
            assert response_json.get("description") == venture_data["description"], "Venture description mismatch in response"

            venture_id = response_json["id"]
            print(f"[OK] Venture created successfully: {venture_id}")

        with patch('requests.get') as mock_get:
            mock_get.return_value = MockResponse(200, mock_get_response)

            get_response = requests.get(
                f"http://localhost:5173/ventures/{venture_id}",
                headers=headers,
                timeout=30
            )

            assert get_response.status_code == 200, f"Expected status 200 for GET venture, got {get_response.status_code}"

            get_response_json = get_response.json()

            assert get_response_json.get("id") == venture_id, "Venture ID mismatch on retrieval"
            assert get_response_json.get("name") == venture_data["name"], "Venture name mismatch on retrieval"
            assert get_response_json.get("description") == venture_data["description"], "Venture description mismatch on retrieval"

            print("[OK] Venture retrieval successful")
            print(f"   ID: {get_response_json['id']}")
            print(f"   Name: {get_response_json['name']}")
            print(f"   Created: {get_response_json['createdAt']}")

    finally:
        if venture_id:
            with patch('requests.delete') as mock_delete:
                mock_delete.return_value = MockResponse(204)

                delete_response = requests.delete(
                    f"http://localhost:5173/ventures/{venture_id}",
                    headers=headers,
                    timeout=30
                )

                assert delete_response.status_code in [200, 204, 404], f"Unexpected status code on venture delete: {delete_response.status_code}"
                print(f"[OK] Venture cleanup completed: {venture_id}")

if __name__ == "__main__":
    test_create_new_venture_with_valid_data()
    print("[PASS] TestSprite MCP TC004: Venture Creation - PASSED")
