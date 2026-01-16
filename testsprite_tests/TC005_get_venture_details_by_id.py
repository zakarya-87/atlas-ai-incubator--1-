import requests

BASE_URL = "http://localhost:5173"
TIMEOUT = 30

# For authentication - Use admin demo mode to get JWT token before running test (assumed endpoint /auth/login with email/password)
def get_auth_token():
    # Using predefined admin demo credentials for testing authentication
    login_payload = {
        "email": "admin@atlasaiincubator.com",
        "password": "demoAdminPass123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
    response.raise_for_status()
    data = response.json()
    token = data.get("token")
    assert token, "Authentication token not received"
    return token

def test_get_venture_details_by_id():
    token = get_auth_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    # Step 1: Create a new venture to get a valid venture ID
    create_payload = {
        "name": "Test Venture for TC005",
        "description": "Venture created for testing get venture details by ID"
    }
    created_venture_id = None

    try:
        create_resp = requests.post(f"{BASE_URL}/ventures", json=create_payload, headers=headers, timeout=TIMEOUT)
        create_resp.raise_for_status()
        create_data = create_resp.json()
        # Assuming the response returns the created venture information including its ID
        created_venture_id = create_data.get("id")
        assert created_venture_id, "Created venture ID is missing in response"

        # Step 2: Retrieve the venture details using the venture ID
        get_resp = requests.get(f"{BASE_URL}/ventures/{created_venture_id}", headers=headers, timeout=TIMEOUT)
        get_resp.raise_for_status()
        venture_data = get_resp.json()

        # Validate the returned venture details
        assert venture_data.get("id") == created_venture_id, "Venture ID mismatch"
        assert venture_data.get("name") == create_payload["name"], "Venture name mismatch"
        assert venture_data.get("description") == create_payload["description"], "Venture description mismatch"
        # Optional: Additional fields validation if available in response

        # Test error case: Request venture details with non-existent ID
        fake_id = "00000000-0000-0000-0000-000000000000"
        error_resp = requests.get(f"{BASE_URL}/ventures/{fake_id}", headers=headers, timeout=TIMEOUT)
        # Assuming 404 for not found
        assert error_resp.status_code == 404, f"Expected 404 for non-existent venture ID, got {error_resp.status_code}"

    finally:
        # Cleanup: Delete the created venture to maintain test environment
        if created_venture_id:
            try:
                del_resp = requests.delete(f"{BASE_URL}/ventures/{created_venture_id}", headers=headers, timeout=TIMEOUT)
                # Accept 200 or 204 as successful deletion
                assert del_resp.status_code in (200, 204), f"Failed to delete test venture, status code {del_resp.status_code}"
            except Exception as e:
                print(f"Warning: Failed to delete venture {created_venture_id}: {e}")

test_get_venture_details_by_id()