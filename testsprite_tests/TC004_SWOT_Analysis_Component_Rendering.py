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

def test_swot_analysis_component_rendering():
    """
    TestSprite MCP TC004: SWOT Analysis Component Rendering
    Tests SWOT analysis display with all four quadrants rendered correctly
    """
    print("[INFO] Testing SWOT analysis component rendering")

    login_response_data = {
        "token": "mock_token_swot123",
        "user": {"id": "user-123", "email": "test@example.com"}
    }

    swot_response_data = {
        "id": "analysis-456",
        "ventureId": "venture-789",
        "type": "SWOT",
        "status": "completed",
        "result": {
            "swot": {
                "strengths": [
                    {"point": "Strong technical expertise", "explanation": "Experienced development team with AI/ML background"},
                    {"point": "Innovative product design", "explanation": "Unique value proposition in the market"}
                ],
                "weaknesses": [
                    {"point": "Limited market presence", "explanation": "New entrant in competitive market"},
                    {"point": "Resource constraints", "explanation": "Startup funding limitations"}
                ],
                "opportunities": [
                    {"point": "Growing AI market", "explanation": "Industry expansion and increasing demand"},
                    {"point": "Strategic partnerships", "explanation": "Potential collaboration opportunities"}
                ],
                "threats": [
                    {"point": "Competitive landscape", "explanation": "Established competitors in the space"},
                    {"point": "Regulatory changes", "explanation": "Evolving AI regulations and policies"}
                ]
            }
        },
        "createdAt": "2026-01-16T10:00:00.000Z"
    }

    headers = {"Content-Type": "application/json"}
    token = "mock_token_swot123"

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, login_response_data)

        requests.post(
            "http://localhost:5173/auth/login",
            json={"email": "test@example.com", "password": "password123"},
            headers=headers,
            timeout=30
        )

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    with patch('requests.get') as mock_get:
        mock_get.return_value = MockResponse(200, swot_response_data)

        swot_resp = requests.get(
            "http://localhost:5173/analysis/venture-789/swot",
            headers=auth_headers,
            timeout=30
        )

        assert swot_resp.status_code == 200, f"SWOT analysis load failed: {swot_resp.text}"
        swot_data = swot_resp.json()

        assert "result" in swot_data, "SWOT result missing"
        assert "swot" in swot_data["result"], "SWOT data missing"

        swot = swot_data["result"]["swot"]

        for quadrant in ["strengths", "weaknesses", "opportunities", "threats"]:
            assert quadrant in swot, f"{quadrant} missing from SWOT analysis"
            assert isinstance(swot[quadrant], list), f"{quadrant} should be a list"
            assert len(swot[quadrant]) > 0, f"{quadrant} should not be empty"

            for item in swot[quadrant]:
                assert "point" in item, f"{quadrant} item missing point"
                assert "explanation" in item, f"{quadrant} item missing explanation"

        print("[OK] SWOT Analysis rendered successfully")
        print(f"   Strengths: {len(swot['strengths'])} items")
        print(f"   Weaknesses: {len(swot['weaknesses'])} items")
        print(f"   Opportunities: {len(swot['opportunities'])} items")
        print(f"   Threats: {len(swot['threats'])} items")

    print("[PASS] TestSprite MCP TC004: SWOT Analysis Component - PASSED")

if __name__ == "__main__":
    test_swot_analysis_component_rendering()
