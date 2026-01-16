import requests
import uuid

BASE_URL = "http://localhost:5173"
REGISTER_ENDPOINT = f"{BASE_URL}/auth/register"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_user_registration_with_new_email():
    # Generate unique email for registration
    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    password = "StrongPassword123!"

    payload = {
        "email": unique_email,
        "password": password
    }

    response = None
    try:
        response = requests.post(REGISTER_ENDPOINT, json=payload, headers=HEADERS, timeout=TIMEOUT)
        # Validate response status code for successful registration
        assert response.status_code == 201 or response.status_code == 200, \
            f"Expected 200 or 201, got {response.status_code}: {response.text}"
        # Validate response body contains success indication (assuming a JSON with success or user ID)
        json_response = response.json()
        assert "email" in json_response, "Response missing 'email'"
        assert json_response["email"] == unique_email, "Registered email does not match"
        # Optionally check for presence of user id or token if returned
        assert "id" in json_response or "token" in json_response or "message" in json_response, \
            "Response missing expected confirmation fields"
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_user_registration_with_new_email()