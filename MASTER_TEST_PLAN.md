# ATLAS AI Incubator - Master Test Plan

## Document Control

| Property | Value |
|----------|-------|
| **Version** | 1.0.0 |
| **Date** | February 2, 2026 |
| **Author** | ATLAS AI Incubator Team |
| **Status** | Active |
| **Review Cycle** | Monthly |

---

## 1. Introduction

### 1.1 Purpose

This Master Test Plan (MTP) defines the comprehensive testing strategy for the ATLAS AI Incubator platform, incorporating **TestSprite MCP Server** for AI-driven test generation, execution, and maintenance.

### 1.2 Scope

**In Scope:**
- Frontend (React/TypeScript) testing
- Backend (NestJS/Node.js) testing
- API endpoint testing
- Database interaction testing
- Edge case detection and testing
- Error handling and recovery testing
- Security vulnerability testing
- Performance and load testing

**Out of Scope:**
- Third-party service internals (Stripe, OpenAI)
- Infrastructure testing (hardware, network)
- Browser compatibility below specified versions

### 1.3 Testing Strategy Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING APPROACH                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   🧪 Automated Testing (90%)                                │
│      ├─ Unit Tests (Vitest/Jest)                            │
│      ├─ Integration Tests (Supertest)                       │
│      ├─ E2E Tests (Playwright)                              │
│      ├─ Edge Case Tests (TestSprite MCP)                    │
│      └─ Error Handling Tests (TestSprite MCP)               │
│                                                              │
│   👁️ Manual Testing (10%)                                   │
│      ├─ Exploratory Testing                                 │
│      ├─ UX Validation                                       │
│      └─ Accessibility Audit                                 │
│                                                              │
│   🤖 AI-Assisted (TestSprite MCP)                           │
│      ├─ Auto Test Generation                                │
│      ├─ Edge Case Discovery                                 │
│      ├─ Coverage Optimization                               │
│      └─ Self-Healing Tests                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Test Objectives

### 2.1 Primary Objectives

1. **Functional Correctness**: Verify all features work as specified
2. **Reliability**: Ensure system stability under various conditions
3. **Security**: Protect against common vulnerabilities
4. **Performance**: Meet response time and throughput requirements
5. **Maintainability**: Create tests that evolve with the codebase

### 2.2 Success Criteria

| Criteria | Target | Measurement |
|----------|--------|-------------|
| **Code Coverage** | 85%+ | Line/Branch/Function |
| **Edge Case Coverage** | 95%+ | Boundary conditions |
| **Error Path Coverage** | 100% | Exception handling |
| **Critical Path Coverage** | 100% | Business flows |
| **Test Pass Rate** | 99%+ | CI execution |
| **Defect Escape Rate** | <2% | Production bugs |

---

## 3. Test Categories

### 3.1 Category Matrix

| ID | Category | Description | Priority | Tooling | Status |
|----|----------|-------------|----------|---------|--------|
| TC | Core Functionality | Primary feature tests | P0 | Vitest/Jest | 🟡 Partial |
| EC | Edge Cases | Boundary conditions | P1 | TestSprite MCP | 🟡 In Progress |
| EH | Error Handling | Failure scenarios | P1 | TestSprite MCP | 🟡 In Progress |
| PF | Performance | Load & stress tests | P2 | TestSprite MCP | ⚪ Planned |
| SC | Security | Vulnerability tests | P1 | TestSprite MCP | ⚪ Planned |
| RG | Regression | Change validation | P2 | All | 🟡 Partial |

### 3.2 Test Category Details

#### Core Functionality Tests (TC)

**Purpose**: Validate primary user workflows and business logic

**Coverage Areas:**
- User authentication and authorization
- Venture creation and management
- AI-powered business analysis generation
- Team collaboration features
- Data export and reporting

**Example Tests:**
```python
# TC001_user_login_with_valid_credentials.py
def test_successful_login():
    """Verify user can log in with valid credentials"""
    
# TC004_create_new_venture_with_valid_data.py
def test_venture_creation():
    """Verify venture is created with valid input"""
```

#### Edge Case Tests (EC)

**Purpose**: Identify and validate boundary conditions

**Coverage Areas:**
- Input validation boundaries
- Maximum/minimum value limits
- Unicode and special character handling
- Concurrent access scenarios
- Timezone and temporal edge cases

**Implemented Tests:**
- ✅ EC001: Input Validation (50+ test cases)
- ✅ EC002: Boundary Conditions (30+ test cases)
- 📝 EC003: Concurrent Access (planned)
- 📝 EC004: Data Limits (planned)
- 📝 EC005: Special Characters (planned)
- 📝 EC006: Timezone Edge Cases (planned)

#### Error Handling Tests (EH)

**Purpose**: Ensure graceful failure and recovery

**Coverage Areas:**
- Network failures and timeouts
- API errors (4xx, 5xx)
- Database connection issues
- AI service unavailability
- Authentication failures

**Implemented Tests:**
- ✅ EH001: Network Failures (25+ test cases)
- ✅ EH002: API Errors (20+ test cases)
- 📝 EH003: Database Errors (planned)
- 📝 EH004: AI Service Failures (planned)
- 📝 EH005: Authentication Errors (planned)
- 📝 EH006: Validation Errors (planned)

---

## 4. Test Execution Strategy

### 4.1 Execution Environments

| Environment | Purpose | Frequency | TestSprite Mode |
|-------------|---------|-----------|-----------------|
| **Local** | Developer testing | Every commit | Standalone |
| **CI** | Pre-merge validation | Every PR | Cloud + Local |
| **Staging** | Integration testing | Nightly | Cloud |
| **Production** | Smoke testing | Post-deploy | Cloud |

### 4.2 Execution Commands

```bash
# Developer local testing
cd testsprite_tests
python testsprite_runner.py --category all

# CI/CD execution (strict mode)
python testsprite_runner.py \
  --ci-mode \
  --coverage-threshold 85 \
  --category all

# Category-specific testing
python testsprite_runner.py --category edge_cases
python testsprite_runner.py --category error_handling
python testsprite_runner.py --category core

# With cloud execution
python testsprite_runner.py --cloud --category all
```

### 4.3 Execution Pipeline

```
Pre-Commit (Local)
├── Lint & Format
├── Type Check
├── Unit Tests (Vitest/Jest)
└── Quick TestSprite Check
    
Pull Request (CI)
├── Full Unit Test Suite
├── Integration Tests
├── TestSprite MCP Suite
│   ├── Core Tests (TC*)
│   ├── Edge Cases (EC*)
│   ├── Error Handling (EH*)
│   └── Coverage Validation
├── Security Scan
└── Performance Baseline

Nightly (Staging)
├── Full Regression Suite
├── E2E Tests (Playwright)
├── Load Tests
└── TestSprite Cloud Analysis

Post-Deploy (Production)
├── Smoke Tests
├── Health Checks
└── Error Rate Monitoring
```

---

## 5. TestSprite MCP Integration

### 5.1 MCP Server Configuration

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
        "AUTO_GENERATE": "true",
        "PARALLEL_WORKERS": "4"
      }
    }
  }
}
```

### 5.2 AI-Driven Workflows

#### Workflow 1: Auto Test Generation

**Trigger**: New feature or module added

**Process**:
1. Developer commits new code
2. TestSprite MCP analyzes changes
3. AI generates relevant test cases
4. Tests added to appropriate category
5. Developer reviews and approves

**Example Command**:
```
"Generate tests for the new payment module"
→ Creates TC*, EC*, EH* tests for payments
```

#### Workflow 2: Coverage Gap Analysis

**Trigger**: Coverage report shows gaps

**Process**:
1. Coverage analyzer identifies gaps
2. TestSprite MCP prioritizes gaps by criticality
3. AI suggests test implementations
4. Tests generated and executed
5. Coverage improved

**Example Command**:
```
"Analyze coverage gaps in auth module"
→ Identifies untested paths
→ Generates tests for gaps
```

#### Workflow 3: Edge Case Discovery

**Trigger**: Regular analysis or manual request

**Process**:
1. TestSprite MCP scans codebase
2. AI identifies boundary conditions
3. Edge case tests generated (EC*)
4. Tests validate boundaries
5. Results reported

**Example Command**:
```
"Detect edge cases in venture creation API"
→ Finds boundary conditions
→ Creates EC004 tests
```

### 5.3 MCP Commands Reference

| Command | Description | Usage |
|---------|-------------|-------|
| `generate_tests` | Create tests for code | `Generate tests for ./src/auth` |
| `analyze_coverage` | Find coverage gaps | `Analyze coverage` |
| `detect_edge_cases` | Find boundaries | `Find edge cases in API` |
| `generate_errors` | Create error tests | `Generate error tests` |
| `optimize_suite` | Optimize performance | `Optimize tests` |
| `validate_recovery` | Test error recovery | `Validate error recovery` |

---

## 6. Test Data Management

### 6.1 Test Data Strategy

| Data Type | Source | Refresh Frequency | Security |
|-----------|--------|-------------------|----------|
| **Unit Tests** | Fixtures/Mocks | Per test | Sanitized |
| **Integration** | Test database | Per suite | Anonymized |
| **E2E Tests** | Staging environment | Daily | Test accounts |
| **Performance** | Production-like | Weekly | Synthetic |

### 6.2 Test Fixtures

```typescript
// test/fixtures/user.fixture.ts
export const testUsers = {
  standard: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User'
  },
  admin: {
    email: 'admin@example.com',
    password: 'AdminPass123!',
    role: 'ADMIN'
  },
  edge: {
    longEmail: 'a'.repeat(240) + '@test.com',
    unicodeName: '测试用户🎉',
    specialChars: 'Test <script>alert(1)</script>'
  }
};

// test/fixtures/venture.fixture.ts
export const testVentures = {
  valid: {
    name: 'Test Venture',
    description: 'A test venture for testing',
    industry: 'Technology'
  },
  boundary: {
    maxName: 'A'.repeat(255),
    maxDesc: 'B'.repeat(5000),
    empty: { name: '', description: '' }
  }
};
```

---

## 7. Risk Management

### 7.1 Testing Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Flaky Tests** | Medium | High | Automatic retry, isolation, quarantine |
| **Slow Execution** | Medium | Medium | Parallel execution, optimization |
| **Incomplete Coverage** | Medium | High | AI gap analysis, mandatory gates |
| **Environment Drift** | Low | High | Containerized tests, IaC |
| **AI Test Quality** | Low | Medium | Human review, gradual rollout |

### 7.2 Contingency Plans

**Scenario 1: TestSprite MCP Unavailable**
- Fallback to standalone mode
- Use pre-generated test suites
- Manual test execution

**Scenario 2: Coverage Drop**
- Immediate notification
- Block PR merge
- Generate gap-filling tests

**Scenario 3: Critical Bug in Production**
- Add regression test immediately
- Root cause analysis
- Update test suite

---

## 8. Reporting & Metrics

### 8.1 Test Reports

**Daily Report** (CI):
- Test execution summary
- Coverage metrics
- Failed test details
- Trend comparison

**Weekly Report** (Team):
- Coverage trends
- New tests added
- Flaky test inventory
- Action items

**Monthly Report** (Management):
- Coverage goals vs. actual
- Defect escape analysis
- ROI on testing investment
- Strategic recommendations

### 8.2 Dashboard Metrics

```json
{
  "coverage": {
    "overall": {
      "lines": 87.5,
      "branches": 82.3,
      "functions": 91.2
    },
    "by_component": {
      "auth": 96.2,
      "ventures": 88.5,
      "analysis": 84.3
    }
  },
  "tests": {
    "total": 156,
    "categories": {
      "core": 45,
      "edge_cases": 28,
      "error_handling": 22,
      "security": 15,
      "performance": 12
    }
  },
  "execution": {
    "avg_duration": 245,
    "pass_rate": 99.2,
    "flaky_tests": 3
  }
}
```

---

## 9. Schedule & Milestones

### 9.1 Implementation Timeline

| Phase | Duration | Key Deliverables | Target Coverage |
|-------|----------|------------------|-----------------|
| **Foundation** | Weeks 1-2 | MCP setup, base tests | 40% |
| **Core Tests** | Weeks 3-4 | TC* migration | 60% |
| **Edge Cases** | Weeks 5-6 | EC001-EC006 | 75% |
| **Error Handling** | Weeks 7-8 | EH001-EH006 | 85% |
| **Security/Perf** | Weeks 9-10 | SC*, PF* tests | 90% |
| **Optimization** | Weeks 11-12 | Self-healing | 95% |

### 9.2 Milestones

- ✅ **M1** (Week 2): TestSprite MCP configured, EC001/EH001 complete
- 📝 **M2** (Week 4): Core tests migrated, 60% coverage
- 📝 **M3** (Week 6): Edge cases 90%+ coverage
- 📝 **M4** (Week 8): Error handling 95%+ coverage
- 📝 **M5** (Week 10): Security tests complete
- 📝 **M6** (Week 12): 95%+ overall coverage, self-healing enabled

---

## 10. Roles & Responsibilities

### 10.1 Testing Team

| Role | Responsibilities |
|------|------------------|
| **Test Lead** | Strategy, planning, coordination |
| **SDET** | Framework development, automation |
| **Developers** | Unit tests, integration tests |
| **QA Engineers** | E2E tests, exploratory testing |
| **DevOps** | CI/CD integration, infrastructure |

### 10.2 TestSprite MCP Ownership

- **Configuration**: DevOps Team
- **Test Generation**: SDET + AI
- **Review & Approval**: Test Lead
- **Execution**: Automated (CI)
- **Maintenance**: Continuous (AI-assisted)

---

## 11. Tools & Resources

### 11.1 Testing Tools

| Purpose | Tool | Version |
|---------|------|---------|
| Unit Testing (FE) | Vitest | ^4.0.18 |
| Unit Testing (BE) | Jest | ^29.x |
| E2E Testing | Playwright | ^1.41.0 |
| MCP Server | TestSprite | @latest |
| API Testing | Supertest | ^6.x |
| Coverage | V8/nyc | Latest |
| Mocking | MSW/vitest-mock | Latest |

### 11.2 Infrastructure

- **CI/CD**: GitHub Actions
- **Test Environment**: Docker containers
- **Database**: PostgreSQL (test instances)
- **Browser Automation**: Playwright + headless Chrome
- **Cloud Execution**: TestSprite Cloud

---

## 12. Appendices

### Appendix A: Test File Naming Convention

```
Format: {CATEGORY}{ID}_{description}.py

Examples:
- TC001_user_login_with_valid_credentials.py
- EC001_input_validation.py
- EH001_network_failures.py
- SC001_sql_injection.py
- PF001_response_times.py
- RG001_critical_paths.py
```

### Appendix B: Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TESTSPRITE_API_KEY` | Yes (Cloud) | TestSprite API key |
| `ATLAS_API_URL` | No | Backend URL (default: localhost:5173) |
| `TESTSPRITE_MODE` | No | local/cloud (default: local) |
| `COVERAGE_THRESHOLD` | No | Min coverage % (default: 80) |
| `TEST_USER_EMAIL` | No | Test account email |
| `TEST_USER_PASSWORD` | No | Test account password |

### Appendix C: Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All tests passed, coverage met |
| 1 | Tests failed or coverage not met |
| 2 | Setup/validation error |
| 3 | MCP server error |

### Appendix D: Troubleshooting

**Issue**: Tests failing with "MCP server not available"
**Solution**: Check API key, run in local mode: `--category core`

**Issue**: Coverage threshold not met
**Solution**: Add more tests, lower threshold temporarily, or skip with `--ci-mode=false`

**Issue**: Test execution timeout
**Solution**: Increase timeout in runner, run categories separately, or use `--parallel=2`

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-02 | ATLAS Team | Initial release with TestSprite MCP integration |

---

**Approval:**

- [ ] Test Lead
- [ ] Tech Lead
- [ ] Product Owner

---

*This document is a living document and will be updated as the testing strategy evolves.*
