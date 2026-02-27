#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TestSprite MCP TC011: Live AI Display Verification
Target: http://atlas-ai-webapp.azurewebsites.net
"""

import requests
import json
import time
import os
import sys

class LiveTest:
    def __init__(self):
        base_url = os.getenv("ATLAS_API_URL", "https://atlas-ai-webapp.azurewebsites.net")
        if base_url.endswith('/'):
            base_url = base_url[:-1]
        
        # Ensure base URL points to the /api endpoint for backend calls
        if not base_url.endswith('/api'):
            self.api_url = f"{base_url}/api"
        else:
            self.api_url = base_url
        
        self.email = os.getenv("TEST_USER_EMAIL", "test@example.com")
        self.password = os.getenv("TEST_USER_PASSWORD", "TestPass123!")
        self.token = None
        self.headers = {"Content-Type": "application/json"}

    def login(self):
        print(f"[INFO] Logging in to {self.api_url} as {self.email}...")
        try:
            resp = requests.post(
                f"{self.api_url}/auth/login",
                json={"email": self.email, "password": self.password},
                headers=self.headers,
                timeout=30
            )
            if resp.status_code in [200, 201]:
                data = resp.json()
                self.token = data.get("access_token") or data.get("token")
                if not self.token:
                    print(f"[FAIL] No token found in login response: {data}")
                    return False
                self.headers["Authorization"] = f"Bearer {self.token}"
                print("[OK] Login successful")
                return True
            else:
                print(f"[WARN] Login failed ({resp.status_code}): {resp.text}. Attempting registration...")
                resp = requests.post(
                    f"{self.api_url}/auth/register",
                    json={
                        "email": self.email, 
                        "password": self.password,
                        "firstName": "Test",
                        "lastName": "User"
                    },
                    headers=self.headers,
                    timeout=30
                )
                if resp.status_code in [200, 201]:
                    data = resp.json()
                    self.token = data.get("access_token") or data.get("token")
                    if not self.token:
                        print(f"[FAIL] No token found in registration response: {data}")
                        return False
                    self.headers["Authorization"] = f"Bearer {self.token}"
                    print("[OK] Registration and login successful")
                    return True
                else:
                    print(f"[FAIL] Registration failed: {resp.text}")
                    return False
        except Exception as e:
            print(f"[ERROR] Connection error: {e}")
            return False

    def run_verification(self):
        if not self.login():
            return False

        venture_id = None
        try:
            # 1. Create Venture
            print("[INFO] Creating test venture...")
            venture_payload = {
                "name": "Live Test Venture " + str(int(time.time())),
                "description": "A venture created for live AI display verification."
            }
            resp = requests.post(
                f"{self.api_url}/ventures",
                json=venture_payload,
                headers=self.headers,
                timeout=30
            )
            if resp.status_code not in [200, 201]:
                print(f"[FAIL] Venture creation failed: {resp.text}")
                return False
            
            venture_id = resp.json().get("id")
            print(f"[OK] Venture created: {venture_id}")

            # 2. Trigger AI Analysis
            print(f"[INFO] Triggering SWOT analysis for venture {venture_id}...")
            # Note: The backend route might be /analysis/generate based on TC003
            analysis_payload = {
                "ventureId": venture_id,
                "module": "strategy",
                "tool": "swot",
                "description": "Generate SWOT analysis for a new generic SaaS platform",
                "language": "en"
            }
            resp = requests.post(
                f"{self.api_url}/analysis/generate",
                json=analysis_payload,
                headers=self.headers,
                timeout=30
            )
            if resp.status_code not in [200, 201]:
                print(f"[FAIL] Analysis trigger failed ({resp.status_code}): {resp.text}")
                return False
            
            job_id = resp.json().get("jobId")
            print(f"[OK] Analysis job submitted: {job_id}")

            # 3. Poll for completion
            print("[INFO] Polling for analysis completion (max 2 mins)...")
            start_poll = time.time()
            while time.time() - start_poll < 120:
                resp = requests.get(
                    f"{self.api_url}/jobs/{job_id}",
                    headers=self.headers,
                    timeout=10
                )
                if resp.status_code == 200:
                    status_data = resp.json()
                    status = status_data.get("status")
                    print(f"      Status: {status}")
                    
                    if status == "completed":
                        result = status_data.get("result")
                        if result and ("swot" in result or "swot_analysis" in result):
                            swot = result.get("swot") or result.get("swot_analysis")
                            print("[OK] SWOT Data received:")
                            for q in ["strengths", "weaknesses", "opportunities", "threats"]:
                                count = len(swot.get(q, []))
                                print(f"      - {q.capitalize()}: {count} items")
                                if count == 0:
                                    print(f"[FAIL] {q} quadrant is empty")
                                    return False
                            return True
                        else:
                            print(f"[FAIL] Status is completed but result or swot/swot_analysis is missing: {status_data}")
                            return False
                    elif status == "failed":
                        print(f"[FAIL] Job failed: {status_data.get('error')}")
                        return False
                else:
                    print(f"[WARN] Failed to poll job status: {resp.status_code}")
                
                time.sleep(5)
            
            print("[FAIL] Timeout waiting for analysis job")
            return False

        finally:
            if venture_id:
                print(f"[INFO] Cleaning up venture {venture_id}...")
                requests.delete(f"{self.api_url}/ventures/{venture_id}", headers=self.headers, timeout=30)

def main():
    test = LiveTest()
    success = test.run_verification()
    if success:
        print("\n[PASS] Live AI Display Verification PASSED")
        sys.exit(0)
    else:
        print("\n[FAIL] Live AI Display Verification FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
