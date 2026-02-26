#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import requests
import json
import time
import os
import sys

class LiveMarketTest:
    def __init__(self):
        base_url = os.getenv("ATLAS_API_URL", "https://atlas-ai-webapp.azurewebsites.net")
        if base_url.endswith('/'):
            base_url = base_url[:-1]
        
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
        resp = requests.post(
            f"{self.api_url}/auth/login",
            json={"email": self.email, "password": self.password},
            headers=self.headers,
            timeout=30
        )
        if resp.status_code in [200, 201]:
            data = resp.json()
            self.token = data.get("access_token") or data.get("token")
            self.headers["Authorization"] = f"Bearer {self.token}"
            return True
        return False

    def run_verification(self):
        if not self.login():
            return False

        venture_id = None
        try:
            print("[INFO] Creating test venture...")
            resp = requests.post(
                f"{self.api_url}/ventures",
                json={"name": "Market Test", "description": "Market test"},
                headers=self.headers,
                timeout=30
            )
            venture_id = resp.json().get("id")

            print(f"[INFO] Triggering Market Analysis for venture {venture_id}...")
            analysis_payload = {
                "ventureId": venture_id,
                "module": "marketAnalysis",
                "tool": "overview",
                "description": "Market analysis for a generic AI coding assistant",
                "language": "en"
            }
            resp = requests.post(f"{self.api_url}/analysis/generate", json=analysis_payload, headers=self.headers, timeout=30)
            job_id = resp.json().get("jobId")

            print("[INFO] Polling for completion...")
            start_poll = time.time()
            while time.time() - start_poll < 120:
                resp = requests.get(f"{self.api_url}/jobs/{job_id}", headers=self.headers, timeout=10)
                status_data = resp.json()
                if status_data.get("status") == "completed":
                    result = status_data.get("result")
                    print(f"[DEBUG] Full Result keys: {list(result.keys())}")
                    return True
                time.sleep(5)
            return False
        finally:
            if venture_id:
                requests.delete(f"{self.api_url}/ventures/{venture_id}", headers=self.headers, timeout=30)

if __name__ == "__main__":
    test = LiveMarketTest()
    if test.run_verification():
        sys.exit(0)
    sys.exit(1)
