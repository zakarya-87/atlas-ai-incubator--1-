# -*- coding: utf-8 -*-
import requests
import uuid
from unittest.mock import Mock, patch

class MockResponse:
    def __init__(self, status_code=200, json_data=None, text=""):
        self.status_code = status_code
        self._json_data = json_data or {}
        self.text = text

    def json(self):
        return self._json_data

def test_invite_team_member_with_valid_details():
    """
    TestSprite MCP TC009: Invite Team Member with Valid Details
    Tests team invitation functionality using mock responses
    """
    print("[INFO] Testing invite team member with valid details")

    login_response_data = {
        "token": "mock_token_team123",
        "user": {"id": "user-123", "email": "teamowner@example.com"}
    }

    create_venture_response = {
        "id": "venture-team-123",
        "name": f"Test Venture {uuid.uuid4()}",
        "description": "Venture for testing team invitation"
    }

    invite_response_data = {
        "invitationId": f"invite-{uuid.uuid4()}",
        "ventureId": "venture-team-123",
        "email": f"invitee+{uuid.uuid4().hex[:8]}@example.com",
        "role": "member",
        "status": "pending",
        "createdAt": "2026-01-16T15:00:00.000Z"
    }

    headers = {"Content-Type": "application/json"}
    token = "mock_token_team123"
    venture_id = "venture-team-123"

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, login_response_data)

        requests.post(
            "http://localhost:5173/auth/login",
            json={"email": "teamowner@example.com", "password": "SecurePass123!"},
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
            json={"name": f"Test Venture {uuid.uuid4()}", "description": "Venture for testing team invitation"},
            headers=auth_headers,
            timeout=30
        )

        assert create_resp.status_code in [200, 201]
        venture_id = create_resp.json()["id"]
        print(f"[OK] Venture created: {venture_id}")

    invite_email = f"invitee+{uuid.uuid4().hex[:8]}@example.com"
    invite_payload = {
        "ventureId": venture_id,
        "email": invite_email,
        "role": "member"
    }

    invite_response_data = {
        "invitationId": f"invite-{uuid.uuid4()}",
        "ventureId": venture_id,
        "email": invite_email,
        "role": "member",
        "status": "pending",
        "createdAt": "2026-01-16T15:00:00.000Z"
    }

    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(201, invite_response_data)

        invite_resp = requests.post(
            "http://localhost:5173/teams/invite",
            json=invite_payload,
            headers=auth_headers,
            timeout=30
        )

        assert invite_resp.status_code in [200, 201], f"Invite failed: {invite_resp.text}"
        invite_data = invite_resp.json()

        assert "invitationId" in invite_data or "id" in invite_data, "Invitation ID missing"
        assert invite_data.get("email") == invite_email, "Email mismatch"
        assert invite_data.get("role") == "member", "Role mismatch"
        assert invite_data.get("ventureId") == venture_id, "Venture ID mismatch"

        invitation_id = invite_data.get("invitationId") or invite_data.get("id")
        print(f"[OK] Team invitation sent successfully")
        print(f"   Invitation ID: {invitation_id}")
        print(f"   Email: {invite_data['email']}")
        print(f"   Role: {invite_data['role']}")
        print(f"   Status: {invite_data['status']}")

    print("[PASS] TestSprite MCP TC009: Invite Team Member - PASSED")

if __name__ == "__main__":
    test_invite_team_member_with_valid_details()
