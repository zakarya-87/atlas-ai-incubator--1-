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

def test_get_analysis_history_for_venture():
    """
    TestSprite MCP TC006: Get Analysis History for Venture
    Tests retrieving analysis history for a venture with mock responses
    """
    print("[INFO] Testing get analysis history for venture")

    login_response_data = {
        "token": "mock_token_history123",
        "user": {"id": "user-123", "email": "admin@demo.com"}
    }

    create_venture_response = {
        "id": "venture-789",
        "name": "Test Venture for Analysis History",
        "description": "Venture created for testing analysis history retrieval"
    }

    analysis_history_response = [
        {
            "id": "analysis-001",
            "ventureId": "venture-789",
            "type": "SWOT",
            "status": "completed",
            "createdAt": "2026-01-15T10:00:00.000Z"
        },
        {
            "id": "analysis-002",
            "ventureId": "venture-789",
            "type": " Porter's Five Forces",
            "status": "completed",
            "createdAt": "2026-01-14T14:30:00.000Z"
        },
        {
            "id": "analysis-003",
            "ventureId": "venture-789",
            "type": "Business Model Canvas",
            "status": "completed",
            "createdAt": "2026-01-13T09:15:00.000Z"
        }
    ]

    headers = {"Content-Type": "application/json"}
    token = "mock_token_history123"
    venture_id = "venture-789"

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, login_response_data)

        requests.post(
            "http://localhost:5173/auth/login",
            json={"email": "admin@demo.com", "password": "adminpassword"},
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
            json={"name": "Test Venture for Analysis History", "description": "Venture created for testing"},
            headers=auth_headers,
            timeout=30
        )

        assert create_resp.status_code in [200, 201]
        venture_id = create_resp.json()["id"]
        print(f"[OK] Venture created: {venture_id}")

    with patch('requests.get') as mock_get:
        mock_get.return_value = MockResponse(200, analysis_history_response)

        history_resp = requests.get(
            f"http://localhost:5173/analysis/{venture_id}",
            headers=auth_headers,
            timeout=30
        )

        assert history_resp.status_code == 200, f"Get history failed: {history_resp.text}"
        history_data = history_resp.json()

        assert isinstance(history_data, list), "History should be a list"
        assert len(history_data) > 0, "History should not be empty"

        for record in history_data:
            assert isinstance(record, dict), "Each record should be a dictionary"
            assert "id" in record, "Record missing 'id'"
            assert "ventureId" in record, "Record missing 'ventureId'"
            assert record["ventureId"] == venture_id, "ventureId mismatch"
            assert "type" in record, "Record missing 'type'"
            assert "status" in record, "Record missing 'status'"
            assert "createdAt" in record, "Record missing 'createdAt'"

        print(f"[OK] Analysis history retrieved: {len(history_data)} analyses")
        for analysis in history_data:
            print(f"   - {analysis['type']} ({analysis['status']}) - {analysis['createdAt']}")

    print("[PASS] TestSprite MCP TC006: Get Analysis History - PASSED")

if __name__ == "__main__":
    test_get_analysis_history_for_venture()
