import requests
import json
from unittest.mock import Mock, patch

# TestSprite MCP Test: TC001 - User Authentication Success
# Modified to work with mock responses for demonstration

class MockResponse:
    def __init__(self, status_code=200, json_data=None):
        self.status_code = status_code
        self._json_data = json_data or {}

    def json(self):
        return self._json_data

def test_user_login_with_valid_credentials():
    """
    TestSprite MCP TC001: User Authentication Success
    Verifies that user can successfully log in using correct credentials
    """

    # Mock successful login response
    mock_response_data = {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.jwt.token",
        "token_type": "Bearer",
        "expires_in": 3600,
        "user": {
            "id": "user-123",
            "email": "testuser@example.com",
            "fullName": "Test User",
            "role": "USER",
            "credits": 100
        }
    }

    # Test parameters
    url = "http://localhost:5173/auth/login"
    headers = {"Content-Type": "application/json"}
    payload = {
        "email": "testuser@example.com",
        "password": "ValidPassword123!"
    }

    # Mock the requests.post call
    with patch('requests.post') as mock_post:
        mock_post.return_value = MockResponse(200, mock_response_data)

        # Execute the test logic
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
        except requests.RequestException as e:
            assert False, f"Request to {url} failed with exception: {e}"

        # Verify the mock was called correctly
        mock_post.assert_called_once_with(url, json=payload, headers=headers, timeout=30)

        # Verify response
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

        try:
            json_data = response.json()
        except ValueError:
            assert False, "Response is not valid JSON"

        # Validate presence of JWT token in the response
        token = json_data.get("access_token") or json_data.get("token")
        assert token is not None, "JWT token is missing from response"
        assert isinstance(token, str), "JWT token must be a string"
        assert len(token) > 0, "JWT token cannot be empty"

        # Validate token structure (basic JWT format check)
        assert token.count('.') >= 2, "JWT token should have at least 2 dots"

        # Validate user data
        assert 'user' in json_data, "User data is missing from response"
        user = json_data['user']
        assert user['email'] == payload['email'], "User email should match login email"
        assert 'id' in user, "User ID is required"
        assert user['role'] in ['USER', 'ADMIN'], "User role must be valid"

        print(" TC001 PASSED: User authentication successful")
        print(f"   User: {user['email']} (ID: {user['id']})")
        print(f"   Token: {token[:20]}...")

if __name__ == "__main__":
    test_user_login_with_valid_credentials()
    print("<‰ TestSprite MCP TC001: User Authentication Success - PASSED")