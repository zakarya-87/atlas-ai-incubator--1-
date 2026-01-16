import requests

BASE_URL = "http://localhost:5173"
TIMEOUT = 30

def test_get_analysis_history_for_venture():
    # Step 1: Create a new venture to use its ID for analysis history retrieval
    venture_data = {
        "name": "Test Venture for Analysis History",
        "description": "Venture created for testing analysis history retrieval."
    }

    venture_id = None
    token = None

    try:
        # Authenticate as admin demo mode to get JWT token (assuming endpoint /auth/login and demo admin credentials)
        auth_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "admin@demo.com", "password": "adminpassword"},
            timeout=TIMEOUT
        )
        assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"
        auth_json = auth_response.json()
        assert "token" in auth_json or "accessToken" in auth_json, "No token found in auth response"
        token = auth_json.get("token") or auth_json.get("accessToken")
        headers = {"Authorization": f"Bearer {token}"}

        # Create venture
        create_venture_resp = requests.post(
            f"{BASE_URL}/ventures",
            json=venture_data,
            headers=headers,
            timeout=TIMEOUT
        )
        assert create_venture_resp.status_code == 201 or create_venture_resp.status_code == 200, f"Failed to create venture: {create_venture_resp.text}"
        venture = create_venture_resp.json()
        assert "id" in venture, "Venture creation response missing 'id'"
        venture_id = venture["id"]

        # Step 2: Retrieve analysis history for the new venture
        history_resp = requests.get(
            f"{BASE_URL}/analysis/{venture_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert history_resp.status_code == 200, f"Failed to get analysis history: {history_resp.text}"
        history_json = history_resp.json()
        assert isinstance(history_json, list), "Analysis history response should be a list"

        # Each item in history should at least have expected keys if any (based on feature, might include id, ventureId, content, createdAt)
        for record in history_json:
            assert isinstance(record, dict), "Each analysis record should be a dictionary"
            assert "ventureId" in record, "Analysis record missing 'ventureId'"
            assert record["ventureId"] == venture_id, "Analysis record 'ventureId' does not match requested ventureId"
            # Optional: check for presence of createdAt or other typical fields if specified

    finally:
        # Clean up: delete the created venture if it was created
        if venture_id and token:
            requests.delete(
                f"{BASE_URL}/ventures/{venture_id}",
                headers={"Authorization": f"Bearer {token}"},
                timeout=TIMEOUT
            )

test_get_analysis_history_for_venture()