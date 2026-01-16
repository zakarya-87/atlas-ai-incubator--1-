import requests
import json

BASE_URL = "http://localhost:5173"
TIMEOUT = 30

# Presumed valid admin/demo credentials or test user credentials for authentication
AUTH_EMAIL = "admin@atlasaiincubator.com"
AUTH_PASSWORD = "AdminDemoPass123!"

def test_export_analysis_requested_format():
    session = requests.Session()
    try:
        # Step 1: Authenticate to get JWT token
        login_resp = session.post(
            f"{BASE_URL}/auth/login",
            json={"email": AUTH_EMAIL, "password": AUTH_PASSWORD},
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        token = login_data.get("token") or login_data.get("accessToken")
        assert token, "No token found in login response"

        headers = {"Authorization": f"Bearer {token}"}

        # Step 2: Create a new venture as prerequisite to generate analysis
        venture_payload = {"name": "Test Venture for Export", "description": "Venture created for export test case"}
        venture_resp = session.post(
            f"{BASE_URL}/ventures",
            json=venture_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert venture_resp.status_code == 201, f"Venture creation failed: {venture_resp.text}"
        venture = venture_resp.json()
        venture_id = venture.get("id")
        assert venture_id, "No venture id returned"

        # Step 3: Generate business analysis for the created venture
        analysis_request_payload = {
            "ventureId": venture_id,
            "module": "business_analysis",
            "tool": "SWOT",
            "description": "Export test analysis description",
            "language": "en"
        }
        analysis_resp = session.post(
            f"{BASE_URL}/analysis/generate",
            json=analysis_request_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert analysis_resp.status_code == 200, f"Analysis generation failed: {analysis_resp.text}"
        analysis_data = analysis_resp.json()
        analysis_id = analysis_data.get("analysisId") or analysis_data.get("id")
        assert analysis_id, "No analysisId returned"

        # Step 4: Define formats to test export optionally (can be improved)
        export_formats = ["pdf", "docx", "xlsx"]

        for fmt in export_formats:
            export_payload = {
                "analysisId": analysis_id,
                "format": fmt
            }
            export_resp = session.post(
                f"{BASE_URL}/export",
                json=export_payload,
                headers=headers,
                timeout=TIMEOUT
            )
            assert export_resp.status_code == 200, f"Export failed for format {fmt}: {export_resp.text}"

            # Check Content-Type header matches requested format
            content_type = export_resp.headers.get("Content-Type", "")
            if fmt == "pdf":
                assert "application/pdf" in content_type.lower(), f"Content-Type mismatch for PDF export: {content_type}"
            elif fmt == "docx":
                assert "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in content_type.lower(), f"Content-Type mismatch for DOCX export: {content_type}"
            elif fmt == "xlsx":
                assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in content_type.lower(), f"Content-Type mismatch for XLSX export: {content_type}"
            else:
                # fallback generic check
                assert content_type != "", f"No Content-Type returned for format {fmt}"

            # Basic non-empty content check
            content = export_resp.content
            assert content and len(content) > 100, f"Exported content is empty or too small for format {fmt}"

            # Additional data loss checks can't be done fully without domain knowledge,
            # but we ensure at least content returned.

    finally:
        # Cleanup: Delete the created venture and analyses if API supports it
        try:
            if 'analysis_id' in locals():
                session.delete(f"{BASE_URL}/analysis/{analysis_id}", headers=headers, timeout=TIMEOUT)
        except Exception:
            pass
        try:
            if 'venture_id' in locals():
                session.delete(f"{BASE_URL}/ventures/{venture_id}", headers=headers, timeout=TIMEOUT)
        except Exception:
            pass

test_export_analysis_requested_format()