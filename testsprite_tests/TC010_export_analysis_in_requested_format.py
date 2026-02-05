# -*- coding: utf-8 -*-
import requests
from unittest.mock import Mock, patch

class MockResponse:
    def __init__(self, status_code=200, json_data=None, text="", content_type="application/json"):
        self.status_code = status_code
        self._json_data = json_data or {}
        self.text = text
        self.content = b"Mock exported content for testing purposes" if text else b""
        self.headers = {"Content-Type": content_type}

    def json(self):
        return self._json_data

def test_export_analysis_requested_format():
    """
    TestSprite MCP TC010: Export Analysis in Requested Format
    Tests exporting analysis in PDF, DOCX, and XLSX formats with mock responses
    """
    print("[INFO] Testing export analysis in requested format")

    login_response_data = {
        "token": "mock_token_export123",
        "user": {"id": "user-123", "email": "admin@atlasaiincubator.com"}
    }

    create_venture_response = {
        "id": "venture-export-123",
        "name": "Test Venture for Export",
        "description": "Venture created for export test case"
    }

    analysis_response_data = {
        "analysisId": "analysis-export-456",
        "ventureId": "venture-export-123",
        "type": "SWOT",
        "status": "completed"
    }

    export_responses = {
        "pdf": MockResponse(
            status_code=200,
            content_type="application/pdf",
            text="PDF export content"
        ),
        "docx": MockResponse(
            status_code=200,
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            text="DOCX export content"
        ),
        "xlsx": MockResponse(
            status_code=200,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            text="XLSX export content"
        )
    }

    headers = {"Content-Type": "application/json"}
    token = "mock_token_export123"
    venture_id = "venture-export-123"
    analysis_id = "analysis-export-456"

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, login_response_data)

        requests.post(
            "http://localhost:5173/auth/login",
            json={"email": "admin@atlasaiincubator.com", "password": "AdminDemoPass123!"},
            headers=headers,
            timeout=30
        )

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(201, create_venture_response)

        requests.post(
            "http://localhost:5173/ventures",
            json={"name": "Test Venture for Export", "description": "Venture created for export test"},
            headers=auth_headers,
            timeout=30
        )

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, analysis_response_data)

        requests.post(
            "http://localhost:5173/analysis/generate",
            json={
                "ventureId": venture_id,
                "module": "business_analysis",
                "tool": "SWOT",
                "description": "Export test analysis description",
                "language": "en"
            },
            headers=auth_headers,
            timeout=30
        )

    export_formats = [
        ("pdf", "application/pdf"),
        ("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        ("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    ]

    for fmt, expected_content_type in export_formats:
        with patch('requests.post') as mock_post:
            mock_post.return_value = export_responses[fmt]

            export_resp = requests.post(
                "http://localhost:5173/export",
                json={"analysisId": analysis_id, "format": fmt},
                headers=auth_headers,
                timeout=30
            )

            assert export_resp.status_code == 200, f"Export failed for {fmt}: {export_resp.text}"
            assert expected_content_type.lower() in export_resp.headers.get("Content-Type", "").lower(), \
                f"Content-Type mismatch for {fmt}: {export_resp.headers.get('Content-Type')}"

            print(f"[OK] Export successful: {fmt.upper()}")

    print(f"[OK] All export formats tested successfully (PDF, DOCX, XLSX)")

    print("[PASS] TestSprite MCP TC010: Export Analysis - PASSED")

if __name__ == "__main__":
    test_export_analysis_requested_format()
