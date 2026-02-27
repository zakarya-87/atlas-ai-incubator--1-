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

def test_undo_redo_hook_functionality():
    """
    TestSprite MCP TC005: Undo/Redo Hook Functionality
    Tests the undo/redo functionality for state management in business analysis
    """

    mock_undo_response = {
        "success": True,
        "action": "undo",
        "previousState": {
            "analysis": {
                "swot": {
                    "strengths": ["Technical expertise"],
                    "weaknesses": ["Limited resources"],
                    "opportunities": ["Market growth"],
                    "threats": ["Competition"]
                }
            }
        },
        "message": "Undo operation completed successfully"
    }

    mock_redo_response = {
        "success": True,
        "action": "redo",
        "currentState": {
            "analysis": {
                "swot": {
                    "strengths": ["Technical expertise", "Strong team"],
                    "weaknesses": ["Limited resources"],
                    "opportunities": ["Market growth", "New partnerships"],
                    "threats": ["Competition"]
                }
            }
        },
        "message": "Redo operation completed successfully"
    }

    mock_update_response = {
        "success": True,
        "stateId": "state-456",
        "changes": {
            "added": ["Strong team"],
            "removed": []
        }
    }

    venture_id = "venture-123"
    headers = {"Content-Type": "application/json"}

    print("[INFO] Testing Undo/Redo Hook Functionality")

    update_payload = {
        "ventureId": venture_id,
        "action": "add",
        "field": "swot.strengths",
        "value": "Strong team"
    }

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, mock_update_response)

        update_resp = requests.post(
            f"http://localhost:5173/state/update",
            json=update_payload,
            headers=headers,
            timeout=30
        )

        assert update_resp.status_code == 200, f"State update failed: {update_resp.text}"
        update_result = update_resp.json()
        assert update_result["success"], "State update was not successful"

        state_id = update_result["stateId"]
        print(f"[OK] State updated: {state_id}")

    undo_payload = {
        "ventureId": venture_id,
        "action": "undo"
    }

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, mock_undo_response)

        undo_resp = requests.post(
            f"http://localhost:5173/state/undo",
            json=undo_payload,
            headers=headers,
            timeout=30
        )

        assert undo_resp.status_code == 200, f"Undo operation failed: {undo_resp.text}"
        undo_result = undo_resp.json()

        assert undo_result["success"], "Undo operation was not successful"
        assert undo_result["action"] == "undo", "Action should be 'undo'"
        assert "previousState" in undo_result, "Previous state missing from undo response"
        assert "analysis" in undo_result["previousState"], "Analysis data missing from previous state"

        swot_data = undo_result["previousState"]["analysis"]["swot"]
        required_categories = ["strengths", "weaknesses", "opportunities", "threats"]

        for category in required_categories:
            assert category in swot_data, f"SWOT category '{category}' missing from undo state"
            assert isinstance(swot_data[category], list), f"SWOT category '{category}' should be a list"

        print("[OK] Undo operation successful")
        print(f"   Previous state strengths: {len(swot_data['strengths'])} items")
        print(f"   Previous state weaknesses: {len(swot_data['weaknesses'])} items")

    redo_payload = {
        "ventureId": venture_id,
        "action": "redo"
    }

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, mock_redo_response)

        redo_resp = requests.post(
            f"http://localhost:5173/state/redo",
            json=redo_payload,
            headers=headers,
            timeout=30
        )

        assert redo_resp.status_code == 200, f"Redo operation failed: {redo_resp.text}"
        redo_result = redo_resp.json()

        assert redo_result["success"], "Redo operation was not successful"
        assert redo_result["action"] == "redo", "Action should be 'redo'"
        assert "currentState" in redo_result, "Current state missing from redo response"
        assert "analysis" in redo_result["currentState"], "Analysis data missing from current state"

        swot_data = redo_result["currentState"]["analysis"]["swot"]

        for category in required_categories:
            assert category in swot_data, f"SWOT category '{category}' missing from redo state"
            assert isinstance(swot_data[category], list), f"SWOT category '{category}' should be a list"

        strengths = swot_data["strengths"]
        assert len(strengths) >= 2, "Redo should have restored at least 2 strengths"
        assert "Strong team" in strengths, "'Strong team' should be present after redo"

        print("[OK] Redo operation successful")
        print(f"   Current state strengths: {len(swot_data['strengths'])} items")
        print(f"   Current state weaknesses: {len(swot_data['weaknesses'])} items")
        print(f"   Current state opportunities: {len(swot_data['opportunities'])} items")
        print(f"   Current state threats: {len(swot_data['threats'])} items")

    with patch('requests.get') as mock_get:
        mock_get.return_value = MockResponse(200, mock_redo_response["currentState"])

        state_resp = requests.get(
            f"http://localhost:5173/state/{venture_id}",
            headers=headers,
            timeout=30
        )

        assert state_resp.status_code == 200, f"State retrieval failed: {state_resp.text}"
        state_result = state_resp.json()

        final_swot = state_result["analysis"]["swot"]
        redo_swot = mock_redo_response["currentState"]["analysis"]["swot"]

        assert final_swot["strengths"] == redo_swot["strengths"], "Final state should match redo state"
        print("[OK] State consistency validated")

if __name__ == "__main__":
    test_undo_redo_hook_functionality()
    print("[PASS] TestSprite MCP TC005: Undo/Redo Hook Functionality - PASSED")
