# TestSprite MCP Test Report

**Project:** ATLAS AI Incubator  
**Execution Date:** 2026-02-02T15:08:05.029111  
**Test Category:** ALL  
**TestSprite MCP:** @latest

## [RESULTS] Executive Summary

| Metric | Value |
|--------|-------|
| Total Tests | 35 |
| [OK] Passed | 12 |
| [FAIL] Failed | 23 |
| [TIMEOUT] Timeout | 0 |
| [ERROR] Error | 0 |
| [RECOVERY] Recovery Success | 5 |
| **Success Rate** | **34.3%** |
| Coverage Threshold | 80.0% |
| Coverage Met | [NO] |
| Total Duration | 77.74s |
| **Status** | **FAILED** |

## [CATEGORIES] Category Breakdown

### CORE

- **Tests:** 15
- **Passed:** 1 [OK]
- **Failed:** 14 [FAIL]
- **Success Rate:** 6.7%
- **Duration:** 69.18s

### EDGE_CASES

- **Tests:** 6
- **Passed:** 4 [OK]
- **Failed:** 2 [FAIL]
- **Success Rate:** 66.7%
- **Duration:** 2.41s

### ERROR_HANDLING

- **Tests:** 6
- **Passed:** 4 [OK]
- **Failed:** 2 [FAIL]
- **Success Rate:** 66.7%
- **Duration:** 1.78s

### PERFORMANCE

- **Tests:** 3
- **Passed:** 1 [OK]
- **Failed:** 2 [FAIL]
- **Success Rate:** 33.3%
- **Duration:** 1.62s

### REGRESSION

- **Tests:** 1
- **Passed:** 1 [OK]
- **Failed:** 0 [FAIL]
- **Success Rate:** 100.0%
- **Duration:** 0.14s

### SECURITY

- **Tests:** 4
- **Passed:** 1 [OK]
- **Failed:** 3 [FAIL]
- **Success Rate:** 25.0%
- **Duration:** 2.60s

## [FAILED] Failed Tests

### TC001_User_Authentication_Success

- **Status:** FAILED
- **Category:** core
- **Duration:** 14.15s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\ATLAS AI Incubator\testsprite_tests\TC001_...`

### TC002_User_Authentication_Failure

- **Status:** FAILED
- **Category:** core
- **Duration:** 6.99s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\ATLAS AI Incubator\testsprite_tests\TC002_...`

### TC002_user_registration_with_new_email

- **Status:** FAILED
- **Category:** core
- **Duration:** 5.25s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\AppData\Local\Programs\Python\Python311\Li...`

### TC003_Dashboard_Rendering_and_Metrics_Display

- **Status:** FAILED
- **Category:** core
- **Duration:** 6.31s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\ATLAS AI Incubator\testsprite_tests\TC003_...`

### TC003_generate_business_analysis_with_valid_input

- **Status:** FAILED
- **Category:** core
- **Duration:** 0.29s
- **Error:** `SyntaxError: Non-UTF-8 code starting with '\x89' in file C:\Users\zboud\ATLAS AI Incubator\testsprit...`

### TC004_SWOT_Analysis_Component_Rendering

- **Status:** FAILED
- **Category:** core
- **Duration:** 6.01s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\ATLAS AI Incubator\testsprite_tests\TC004_...`

### TC004_create_new_venture_with_valid_data

- **Status:** FAILED
- **Category:** core
- **Duration:** 0.25s
- **Error:** `SyntaxError: Non-UTF-8 code starting with '\x89' in file C:\Users\zboud\ATLAS AI Incubator\testsprit...`

### TC005_UndoRedo_Hook_Functionality

- **Status:** FAILED
- **Category:** core
- **Duration:** 0.09s
- **Error:** `SyntaxError: Non-UTF-8 code starting with '\xea' in file C:\Users\zboud\ATLAS AI Incubator\testsprit...`

### TC005_get_venture_details_by_id

- **Status:** FAILED
- **Category:** core
- **Duration:** 4.88s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\AppData\Local\Programs\Python\Python311\Li...`

### TC006_get_analysis_history_for_venture

- **Status:** FAILED
- **Category:** core
- **Duration:** 4.73s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\AppData\Local\Programs\Python\Python311\Li...`

### TC007_update_user_profile_information

- **Status:** FAILED
- **Category:** core
- **Duration:** 4.78s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\AppData\Local\Programs\Python\Python311\Li...`

### TC008_create_subscription_with_valid_payment

- **Status:** FAILED
- **Category:** core
- **Duration:** 4.75s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\AppData\Local\Programs\Python\Python311\Li...`

### TC009_invite_team_member_with_valid_details

- **Status:** FAILED
- **Category:** core
- **Duration:** 4.77s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\AppData\Local\Programs\Python\Python311\Li...`

### TC010_export_analysis_in_requested_format

- **Status:** FAILED
- **Category:** core
- **Duration:** 4.80s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\AppData\Local\Programs\Python\Python311\Li...`

### EC001_input_validation

- **Status:** FAILED
- **Category:** edge_cases
- **Duration:** 1.00s
- **Error:** `
======================================================================
EC001: Input Validation Edge...`

### EC006_timezone_edge_cases

- **Status:** FAILED
- **Category:** edge_cases
- **Duration:** 0.16s
- **Error:** `
======================================================================
EC006: Timezone Edge Cases
=...`

### EH003_database_errors

- **Status:** FAILED
- **Category:** error_handling
- **Duration:** 0.14s
- **Error:** `
======================================================================
EH003: Database Error Handli...`

### EH004_ai_service_failures

- **Status:** FAILED
- **Category:** error_handling
- **Duration:** 0.15s
- **Error:** `Traceback (most recent call last):
  File "C:\Users\zboud\ATLAS AI Incubator\testsprite_tests\EH004_...`

### PF001_response_times

- **Status:** FAILED
- **Category:** performance
- **Duration:** 0.67s
- **Error:** `
======================================================================
PF001: Response Time Perform...`

### PF002_concurrent_users

- **Status:** FAILED
- **Category:** performance
- **Duration:** 0.72s
- **Error:** `
======================================================================
PF002: Concurrent Load Testi...`

### SC001_sql_injection

- **Status:** FAILED
- **Category:** security
- **Duration:** 0.64s
- **Error:** `
======================================================================
SC001: SQL Injection Prevent...`

### SC002_xss_protection

- **Status:** FAILED
- **Category:** security
- **Duration:** 0.61s
- **Error:** `
======================================================================
SC002: XSS Prevention - Comp...`

### SC004_rate_limiting

- **Status:** FAILED
- **Category:** security
- **Duration:** 0.65s
- **Error:** `
======================================================================
SC004: Rate Limiting & DDoS ...`

## [RECOVERY] Recovery Mechanisms Validated

- [OK] EH001_network_failures
- [OK] EH002_api_errors
- [OK] EH005_authentication_errors
- [OK] EH006_validation_errors
- [OK] RG001_critical_paths

## [ENV] Environment

- **Python:** 3.11.9
- **Platform:** win32
- **MCP Server:** Standalone
- **API Key:** Not Set
- **CI Mode:** False

## [NOTES] Notes

[WARNING] Coverage threshold not met. Consider:
- Adding more tests for uncovered code paths
- Running edge case detection
- Reviewing error handling coverage

---
*Generated by TestSprite MCP Test Runner*
