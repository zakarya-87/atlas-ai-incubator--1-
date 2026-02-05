# TestSprite MCP Tests for ATLAS AI Incubator

Comprehensive test suite leveraging TestSprite MCP Server for AI-driven testing, edge case detection, and error handling validation.

## 🎯 Overview

This test suite implements a multi-dimensional testing strategy:

- ✅ **Core Functionality** (TC*) - Primary feature validation
- ⚡ **Edge Cases** (EC*) - Boundary conditions and unusual scenarios  
- 🛡️ **Error Handling** (EH*) - Failure recovery and resilience
- 🔒 **Security** (SC*) - Vulnerability and penetration testing
- ⚡ **Performance** (PF*) - Load and stress testing
- 🔄 **Regression** (RG*) - Change validation and prevention

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 22+** - [Download here](https://nodejs.org/)
- **Python 3.8+** - For running test scripts
- **TestSprite API Key** - Get from [TestSprite Dashboard](https://www.testsprite.com/dashboard)

### Installation

1. **Set up the MCP Server** (already configured in `.mcpconfig.json`):
   ```bash
   cd "C:\Users\zboud\ATLAS AI Incubator"
   ```

2. **Set your API key** in `.env`:
   ```cmd
   set TESTSPRITE_API_KEY=your_api_key_here
   ```

3. **Run setup validation**:
   ```cmd
   cd testsprite_tests
   setup.bat
   ```

4. **Run all tests**:
   ```cmd
   python testsprite_runner.py
   ```

---

## 📁 File Structure

```
testsprite_tests/
│
├── core/                          # Core functionality tests (TC*)
│   ├── TC001_user_login_with_valid_credentials.py
│   ├── TC002_user_registration_with_new_email.py
│   ├── TC003_generate_business_analysis_with_valid_input.py
│   ├── TC004_create_new_venture_with_valid_data.py
│   ├── TC005_get_venture_details_by_id.py
│   ├── TC006_get_analysis_history_for_venture.py
│   ├── TC007_update_user_profile_information.py
│   ├── TC008_create_subscription_with_valid_payment.py
│   ├── TC009_invite_team_member_with_valid_details.py
│   └── TC010_export_analysis_in_requested_format.py
│
├── edge_cases/                    # Edge case tests (EC*)
│   ├── EC001_input_validation.py       ✅ Input boundaries
│   ├── EC002_boundary_conditions.py    ✅ Numeric/temporal limits
│   ├── EC003_concurrent_access.py      📝 Concurrent scenarios
│   ├── EC004_data_limits.py            📝 Resource limits
│   ├── EC005_special_characters.py     📝 Encoding edge cases
│   └── EC006_timezone_edge_cases.py    📝 Temporal boundaries
│
├── error_handling/                # Error handling tests (EH*)
│   ├── EH001_network_failures.py       ✅ Network error scenarios
│   ├── EH002_api_errors.py             ✅ API failure handling
│   ├── EH003_database_errors.py        📝 Database failure tests
│   ├── EH004_ai_service_failures.py    📝 AI service error tests
│   ├── EH005_authentication_errors.py  📝 Auth failure tests
│   └── EH006_validation_errors.py      📝 Validation error tests
│
├── security/                      # Security tests (SC*)
│   ├── SC001_sql_injection.py          📝 SQL injection tests
│   ├── SC002_xss_protection.py         📝 XSS prevention tests
│   ├── SC003_auth_bypass.py            📝 Authentication bypass
│   └── SC004_rate_limiting.py          📝 Rate limiting tests
│
├── performance/                   # Performance tests (PF*)
│   ├── PF001_response_times.py         📝 API response benchmarks
│   ├── PF002_concurrent_users.py       📝 Load tests
│   └── PF003_memory_usage.py           📝 Memory leak detection
│
├── regression/                    # Regression tests (RG*)
│   └── RG001_critical_paths.py         📝 Critical path validation
│
├── testsprite_runner.py           # Advanced test runner with MCP integration
├── setup.bat                      # Windows environment setup
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

**Legend:**
- ✅ Implemented and ready
- 📝 Planned for upcoming sprint

---

## 🧪 Running Tests

### Run All Tests
```cmd
python testsprite_runner.py
```

### Run Specific Categories
```cmd
# Core functionality only
python testsprite_runner.py --category core

# Edge cases only
python testsprite_runner.py --category edge_cases

# Error handling only
python testsprite_runner.py --category error_handling

# Performance tests
python testsprite_runner.py --category performance

# Security tests
python testsprite_runner.py --category security
```

### CI/CD Mode (Strict)
```cmd
python testsprite_runner.py \
  --ci-mode \
  --coverage-threshold 85 \
  --category all
```

### Validate Setup
```cmd
python testsprite_runner.py --validate
```

### Generate Reports
```cmd
# Both JSON and Markdown
python testsprite_runner.py --report-format both

# JSON only
python testsprite_runner.py --report-format json

# Markdown only
python testsprite_runner.py --report-format markdown
```

### Run Individual Test
```cmd
python EC001_input_validation.py
python EH001_network_failures.py
```

---

## 📊 Test Results

Test reports are automatically generated in the `testsprite_tests/` directory:

- **JSON format**: `testsprite_report_YYYYMMDD_HHMMSS.json`
  - Machine-readable test data
  - CI/CD integration
  - Coverage metrics
  
- **Markdown format**: `testsprite_report_YYYYMMDD_HHMMSS.md`
  - Human-readable summary
  - Category breakdown
  - Failed test details
  - Recovery mechanism status

---

## 📖 Test Categories

### Core Tests (TC*)

Primary functionality validation:

| Test ID | Component | Description | Status |
|---------|-----------|-------------|--------|
| TC001 | Authentication | User login flow | ✅ |
| TC002 | Authentication | User registration | ✅ |
| TC003 | Analysis | Business analysis generation | ✅ |
| TC004 | Ventures | Create new venture | ✅ |
| TC005 | Ventures | Retrieve venture details | ✅ |
| TC006 | History | Analysis history | ✅ |
| TC007 | Users | Profile management | ✅ |
| TC008 | Billing | Subscription handling | ✅ |
| TC009 | Teams | Member invitations | ✅ |
| TC010 | Export | Data export features | ✅ |

### Edge Case Tests (EC*) ⭐

Boundary condition and unusual scenario testing:

| Test ID | Category | Description | Test Cases | Status |
|---------|----------|-------------|------------|--------|
| EC001 | Input Validation | Empty inputs, max lengths, Unicode | 50+ | ✅ |
| EC002 | Boundary Conditions | Numeric limits, arrays, time | 30+ | ✅ |
| EC003 | Concurrent Access | Race conditions, locking | 20+ | 📝 |
| EC004 | Data Limits | Resource exhaustion, quotas | 25+ | 📝 |
| EC005 | Special Characters | XSS, injection attempts | 30+ | 📝 |
| EC006 | Timezone Edge Cases | DST, leap years, boundaries | 15+ | 📝 |

### Error Handling Tests (EH*) ⭐

Failure scenario and recovery testing:

| Test ID | Category | Description | Scenarios | Status |
|---------|----------|-------------|-----------|--------|
| EH001 | Network | Timeouts, DNS, connections | 25+ | ✅ |
| EH002 | API | HTTP errors, malformed responses | 20+ | ✅ |
| EH003 | Database | Connection loss, constraints | 20+ | 📝 |
| EH004 | AI Services | Rate limits, model failures | 15+ | 📝 |
| EH005 | Authentication | Token expiry, auth failures | 15+ | 📝 |
| EH006 | Validation | Schema violations, type errors | 20+ | 📝 |

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `TESTSPRITE_API_KEY` | TestSprite API key | For cloud | - |
| `ATLAS_API_URL` | Backend API URL | No | http://localhost:5173 |
| `TEST_USER_EMAIL` | Test account email | No | test@example.com |
| `TEST_USER_PASSWORD` | Test account password | No | TestPass123! |
| `TESTSPRITE_MODE` | Execution mode | No | local |
| `COVERAGE_THRESHOLD` | Min coverage % | No | 80 |
| `PARALLEL_WORKERS` | Parallel execution | No | 1 |

### MCP Server Configuration

**File**: `.mcpconfig.json`

```json
{
  "mcpServers": {
    "testsprite": {
      "command": "npx",
      "args": ["-y", "@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "${TESTSPRITE_API_KEY}",
        "PROJECT_PATH": "c:/Users/zboud/ATLAS AI Incubator",
        "COVERAGE_THRESHOLD": "85",
        "EDGE_CASE_MODE": "aggressive",
        "ERROR_TESTING": "comprehensive",
        "AUTO_GENERATE": "true"
      }
    }
  }
}
```

---

## 🔧 Troubleshooting

### "API Key not set"
```cmd
# Get your API key from https://www.testsprite.com/dashboard
set TESTSPRITE_API_KEY=your_key_here
```

### "Backend server not available"
```cmd
# Option 1: Start the backend
npm run dev

# Option 2: Use mock mode
set TESTSPRITE_MODE=local
```

### "Module not found" errors
```cmd
# Install Python dependencies
pip install requests
pip install playwright  # For E2E tests
```

### Tests timing out
```cmd
# Run specific category
python testsprite_runner.py --category core

# Or increase timeout (in test file)
# timeout=300  # 5 minutes
```

---

## 🤝 TestSprite MCP Integration

### AI-Driven Features

The TestSprite MCP server provides:

1. **Automated Test Generation**
   - AI analyzes code changes
   - Generates relevant test cases
   - Suggests edge cases automatically

2. **Cloud Execution**
   - Run tests in secure cloud environment
   - Parallel execution support
   - Distributed testing capabilities

3. **Auto-Fix Suggestions**
   - AI analyzes failing tests
   - Suggests fixes for common issues
   - Recommends test improvements

4. **Comprehensive Reporting**
   - Detailed coverage analysis
   - Performance metrics
   - Trend analysis over time

### Using MCP Commands

In your MCP-compatible IDE (Cursor, VSCode, Trae):

```
"Help me test this project with TestSprite"
→ MCP server activates
→ Analyzes codebase
→ Generates test plan
→ Executes tests
→ Reports results

"Generate edge case tests for the auth module"
→ Identifies boundary conditions
→ Creates EC* test files
→ Validates edge scenarios

"Check coverage gaps in the venture API"
→ Analyzes current coverage
→ Identifies untested paths
→ Suggests additional tests
```

---

## 📈 Coverage Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Line Coverage** | 85% | 16.45% | 🔴 |
| **Branch Coverage** | 80% | 19.53% | 🔴 |
| **Edge Case Coverage** | 95% | ~30% | 🟡 |
| **Error Path Coverage** | 100% | ~25% | 🟡 |
| **Critical Path Coverage** | 100% | TBD | ⚪ |

### Coverage Improvement Plan

- **Week 1-2**: Implement EC001-EC002, EH001-EH002 ✅
- **Week 3-4**: Complete core test migration
- **Week 5-6**: Implement EC003-EC006
- **Week 7-8**: Implement EH003-EH006
- **Week 9-10**: Add security (SC*) and performance (PF*) tests
- **Week 11-12**: Optimization and self-healing

---

## 📚 Additional Documentation

- [Test Best Practices](../TEST_BEST_PRACTICES.md) - Comprehensive testing strategy
- [Test Coverage Strategy](../TEST_COVERAGE_STRATEGY.md) - Coverage goals and metrics
- [Master Test Plan](../MASTER_TEST_PLAN.md) - Complete test planning document
- [CICD Test Strategy](../CICD_TEST_STRATEGY.md) - CI/CD integration guide

### External Resources

- [TestSprite Documentation](https://docs.testsprite.com)
- [TestSprite Dashboard](https://www.testsprite.com/dashboard)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)

---

## 🔄 Maintenance

### Daily
- Automated test execution in CI
- Coverage report generation
- Flaky test detection

### Weekly
- Test suite review
- Coverage gap analysis
- New edge case identification

### Monthly
- Full regression suite
- Strategy refinement
- Test optimization

---

## 📝 Contributing

### Adding New Tests

1. Follow naming convention: `{CATEGORY}{ID}_{description}.py`
2. Include test metadata via `get_test_info()` method
3. Add to appropriate directory (core/, edge_cases/, error_handling/)
4. Update this README
5. Run validation: `python testsprite_runner.py --validate`

### Test Template

```python
#!/usr/bin/env python3
"""
TestSprite MCP Test: XX000 - Description

Brief description of what this test validates.
"""

import sys
import os
from typing import Dict, Any

class TestCase:
    @staticmethod
    def get_test_info() -> Dict[str, Any]:
        return {
            "test_id": "XX000",
            "test_name": "Test Name",
            "category": "category",
            "priority": "High/Medium/Low",
            "description": "What this test does"
        }
    
    def run_tests(self):
        """Execute test scenarios"""
        pass

def main():
    runner = TestCase()
    # Run tests
    sys.exit(0)  # or 1 for failure

if __name__ == "__main__":
    main()
```

---

## 📞 Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [TestSprite Documentation](https://docs.testsprite.com)
3. Open an issue in the project repository
4. Contact the ATLAS AI Incubator team

---

**Last Updated**: February 2026  
**Version**: 2.0.0  
**Maintainer**: ATLAS AI Incubator Team  
**TestSprite MCP**: @latest

---

*This test suite is continuously evolving with AI assistance from TestSprite MCP Server.*
