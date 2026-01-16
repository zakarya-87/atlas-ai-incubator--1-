import requests

BASE_URL = "http://localhost:5173"
TIMEOUT = 30

def test_create_subscription_with_valid_payment():
    # 1. Register a new user
    register_payload = {
        "email": "testuser_subscription@example.com",
        "password": "StrongP@ssword123"
    }
    register_resp = requests.post(
        f"{BASE_URL}/auth/register",
        json=register_payload,
        timeout=TIMEOUT
    )
    assert register_resp.status_code == 201 or register_resp.status_code == 200, f"Registration failed: {register_resp.text}"

    # 2. Login to get JWT token
    login_payload = {
        "email": register_payload["email"],
        "password": register_payload["password"]
    }
    login_resp = requests.post(
        f"{BASE_URL}/auth/login",
        json=login_payload,
        timeout=TIMEOUT
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json().get("token") or login_resp.json().get("accessToken") or login_resp.json().get("jwt")
    assert token is not None, "JWT token not found in login response"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 3. Create a subscription with valid payment details
    subscription_payload = {
        "planId": "premium_monthly",  # assumed plan id - adapt if needed
        "paymentMethod": {
            "type": "card",
            "card": {
                "number": "4242424242424242",
                "expMonth": 12,
                "expYear": 2030,
                "cvc": "123",
                "name": "Test User",
                "address": {
                    "line1": "123 Test St",
                    "city": "Test City",
                    "state": "TS",
                    "postal_code": "12345",
                    "country": "US"
                }
            }
        }
    }

    # Because the PRD does not provide detailed subscription payload schema,
    # we assume these fields to represent valid payment details.
    # If the endpoint requires a different format, this should be adapted accordingly.

    subscription_resp = requests.post(
        f"{BASE_URL}/subscriptions",
        json=subscription_payload,
        headers=headers,
        timeout=TIMEOUT
    )
    # Validate success response status code
    assert subscription_resp.status_code in (200, 201), f"Subscription creation failed: {subscription_resp.text}"

    sub_data = subscription_resp.json()
    # Validate expected subscription fields and status
    assert "id" in sub_data, "Subscription ID missing in response"
    assert "status" in sub_data, "Subscription status missing in response"
    assert sub_data["status"].lower() in ("active", "paid", "pending"), f"Unexpected subscription status: {sub_data['status']}"

    subscription_id = sub_data["id"]

    # Cleanup: delete the subscription after test to maintain idempotency if such endpoint exists
    # Since deletion endpoint is not specified in the PRD, skipping if not available
    # Optional: Implement cancellation or deletion if API supports

test_create_subscription_with_valid_payment()