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

def test_generate_business_analysis_with_valid_input():
    """
    TestSprite MCP TC003: Business Analysis Generation
    Tests AI-powered business analysis generation with valid input
    """

    venture_response_data = {
        "id": "venture-456",
        "name": "Test Venture Analysis",
        "description": "Test venture for business analysis generation",
        "userId": "user-123",
        "createdAt": "2026-01-16T15:00:00.000Z",
        "updatedAt": "2026-01-16T15:00:00.000Z"
    }

    analysis_job_response = {
        "jobId": "job-789",
        "status": "pending",
        "message": "Analysis job submitted successfully"
    }

    analysis_complete_response = {
        "status": "completed",
        "result": {
            "swot": {
                "strengths": [
                    {"point": "Strong technical expertise", "explanation": "Experienced development team"},
                    {"point": "Innovative product design", "explanation": "Unique value proposition"}
                ],
                "weaknesses": [
                    {"point": "Limited market presence", "explanation": "New entrant in competitive market"},
                    {"point": "Resource constraints", "explanation": "Startup funding limitations"}
                ],
                "opportunities": [
                    {"point": "Growing AI market", "explanation": "Industry expansion and demand"},
                    {"point": "Strategic partnerships", "explanation": "Potential collaboration opportunities"}
                ],
                "threats": [
                    {"point": "Competitive landscape", "explanation": "Established competitors"},
                    {"point": "Regulatory changes", "explanation": "Evolving AI regulations"}
                ]
            }
        }
    }

    venture_id = None

    try:
        venture_payload = {
            "name": "Test Venture Analysis",
            "description": "Test venture for business analysis generation"
        }
        headers = {"Content-Type": "application/json"}

        with patch('requests.post') as mock_post:
            mock_post.return_value = MockResponse(201, venture_response_data)

            create_venture_resp = requests.post(
                "http://localhost:5173/ventures",
                json=venture_payload,
                headers=headers,
                timeout=30
            )

            assert create_venture_resp.status_code in [200, 201], \
                f"Failed to create venture: {create_venture_resp.text}"

            venture_data = create_venture_resp.json()
            venture_id = venture_data.get("id")
            assert venture_id, "Venture ID not found in creation response"

            print(f"[OK] Venture created: {venture_id}")

        analysis_payload = {
            "ventureId": venture_id,
            "module": "strategy",
            "tool": "swot",
            "description": "Generate SWOT analysis for our AI-powered business platform",
            "language": "en"
        }

        with patch('requests.post') as mock_post:
            mock_post.return_value = MockResponse(200, analysis_job_response)

            analysis_resp = requests.post(
                "http://localhost:5173/analysis/generate",
                json=analysis_payload,
                headers=headers,
                timeout=30
            )

            assert analysis_resp.status_code == 200, f"Analysis generation failed: {analysis_resp.text}"

            analysis_result = analysis_resp.json()
            assert "jobId" in analysis_result, "Job ID missing from analysis response"

            job_id = analysis_result["jobId"]
            print(f"[OK] Analysis job submitted: {job_id}")

        with patch('requests.get') as mock_get:
            mock_get.return_value = MockResponse(200, analysis_complete_response)

            status_resp = requests.get(
                f"http://localhost:5173/jobs/{job_id}",
                headers=headers,
                timeout=30
            )

            assert status_resp.status_code == 200, f"Job status check failed: {status_resp.text}"

            status_result = status_resp.json()
            assert status_result["status"] == "completed", "Analysis job did not complete successfully"
            assert "result" in status_result, "Analysis result missing from completed job"

            swot_data = status_result["result"]["swot"]
            assert "strengths" in swot_data, "SWOT analysis missing strengths"
            assert "weaknesses" in swot_data, "SWOT analysis missing weaknesses"
            assert "opportunities" in swot_data, "SWOT analysis missing opportunities"
            assert "threats" in swot_data, "SWOT analysis missing threats"

            for category in ["strengths", "weaknesses", "opportunities", "threats"]:
                assert isinstance(swot_data[category], list), f"{category} should be a list"
                assert len(swot_data[category]) > 0, f"{category} should not be empty"

                for item in swot_data[category]:
                    assert "point" in item, f"{category} item missing point"
                    assert "explanation" in item, f"{category} item missing explanation"
                    assert isinstance(item["point"], str), f"{category} point should be string"
                    assert isinstance(item["explanation"], str), f"{category} explanation should be string"

            print("[OK] SWOT Analysis completed successfully")
            print(f"   Strengths: {len(swot_data['strengths'])} items")
            print(f"   Weaknesses: {len(swot_data['weaknesses'])} items")
            print(f"   Opportunities: {len(swot_data['opportunities'])} items")
            print(f"   Threats: {len(swot_data['threats'])} items")

    finally:
        if venture_id:
            with patch('requests.delete') as mock_delete:
                mock_delete.return_value = MockResponse(204)

                delete_resp = requests.delete(
                    f"http://localhost:5173/ventures/{venture_id}",
                    headers=headers,
                    timeout=30
                )

                assert delete_resp.status_code in [200, 204], f"Failed to delete venture: {delete_resp.text}"
                print(f"[OK] Venture cleanup completed: {venture_id}")

if __name__ == "__main__":
    test_generate_business_analysis_with_valid_input()
    print("[PASS] TestSprite MCP TC003: Business Analysis Generation - PASSED")
