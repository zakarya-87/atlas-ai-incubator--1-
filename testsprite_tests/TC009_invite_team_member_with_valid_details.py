import requests
import uuid

BASE_URL = "http://localhost:5173"
TIMEOUT = 30

# Credentials for team owner login - these should be valid credentials existing in the test environment
TEAM_OWNER_EMAIL = "teamowner@example.com"
TEAM_OWNER_PASSWORD = "SecurePass123!"

def test_invite_team_member_with_valid_details():
    # 1. Authenticate as team owner to get JWT token
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": TEAM_OWNER_EMAIL,
        "password": TEAM_OWNER_PASSWORD
    }

    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        token = login_data.get("token") or login_data.get("accessToken")
        assert token, "JWT token not found in login response"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # 2. Create a new venture to use its ventureId for team invitation
        create_venture_url = f"{BASE_URL}/ventures"
        venture_name = f"Test Venture {uuid.uuid4()}"
        venture_description = "Venture for testing team invitation"
        venture_payload = {
            "name": venture_name,
            "description": venture_description
        }

        create_venture_resp = requests.post(create_venture_url, json=venture_payload, headers=headers, timeout=TIMEOUT)
        assert create_venture_resp.status_code == 201 or create_venture_resp.status_code == 200, f"Venture creation failed: {create_venture_resp.text}"
        venture_data = create_venture_resp.json()
        venture_id = venture_data.get("id") or venture_data.get("ventureId")
        assert venture_id, "ventureId not found in venture creation response"

        # 3. Invite a new team member
        invite_url = f"{BASE_URL}/teams/invite"
        # Use a unique email for invite to prevent duplicate invites in tests
        unique_email = f"invitee+{uuid.uuid4().hex[:8]}@example.com"
        invite_payload = {
            "ventureId": venture_id,
            "email": unique_email,
            "role": "member"
        }

        invite_resp = requests.post(invite_url, json=invite_payload, headers=headers, timeout=TIMEOUT)
        assert invite_resp.status_code == 200 or invite_resp.status_code == 201, f"Invite request failed: {invite_resp.text}"
        invite_data = invite_resp.json()

        # Validate invite response structure and content
        # Assuming the response contains an invitationId or confirmation message
        invitation_id = invite_data.get("invitationId") or invite_data.get("id")
        message = invite_data.get("message") or invite_data.get("detail")

        assert (invitation_id or message), "Invitation response missing expected confirmation data"
        if invitation_id:
            assert isinstance(invitation_id, str) and len(invitation_id) > 0, "Invalid invitationId in response"

        # Optionally, validate role and ventureId echoed back if provided
        if "ventureId" in invite_data:
            assert invite_data["ventureId"] == venture_id, "Returned ventureId does not match"
        if "role" in invite_data:
            assert invite_data["role"] == invite_payload["role"], "Returned role does not match"

    finally:
        # Cleanup: Delete the created venture to not leave test data behind (requires auth)
        if 'token' in locals() and 'venture_id' in locals():
            delete_url = f"{BASE_URL}/ventures/{venture_id}"
            try:
                del_resp = requests.delete(delete_url, headers={"Authorization": f"Bearer {token}"}, timeout=TIMEOUT)
                # Do not assert on delete cleanup - just best effort
            except Exception:
                pass

test_invite_team_member_with_valid_details()