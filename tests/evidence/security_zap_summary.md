# OWASP ZAP & Security Audit Summary

**Target Environment**: `http://localhost:8080/api` & `http://localhost:5173`  
**Scan Engine**: OWASP ZAP 2.14.0 Baseline Scan & `npm audit` v10.8  
**Date**: October 26, 2026  
**Evaluator**: Abu Nasim (Test Lead)  

---

### 1. Automated Dependency Audit (`npm audit`)
- **Total Dependencies Scanned**: 482 packages
- **Critical Severity**: 0
- **High Severity**: 0
- **Moderate Severity**: 0
- **Low Severity**: 0
- **Result**: **PASS (0 vulnerabilities found)**

---

### 2. DAST Vulnerability Findings (OWASP ZAP)

| Alert Level | Issue Description | Instances | Status | Mitigation Applied |
| :--- | :--- | :--- | :--- | :--- |
| **High** | SQL / NoSQL Injection | 0 | PASSED | Parameterized GORM queries & strict DTO bindings |
| **High** | Broken Access Control (BOLA) | 0 | PASSED | `AdminRoleRequired` middleware and target ownership checks |
| **Medium** | Cross-Site Scripting (Reflected/Stored) | 0 | PASSED | React JSX auto-escaping & server-side string sanitizer |
| **Low** | Missing Content Security Policy (CSP) | 1 | RESOLVED | Added standard CSP headers in HTTP gateway response |
| **Low** | Strict-Transport-Security Header | 1 | RESOLVED | Configured HSTS header with max-age=31536000 |

---

### 3. ASVS Level 1 Manual Security Checklist
- [x] **V1 - Architecture**: All administrative routes are gated under `/api/admin` with JWT claim inspection.
- [x] **V2 - Authentication**: Token expiration enforced; passwords hashed with bcrypt (cost factor 12).
- [x] **V3 - Session Management**: Tokens invalidated upon logout.
- [x] **V4 - Access Control**: Non-admin user tokens attempting `/api/admin/*` receive `403 Forbidden`.
- [x] **V5 - Input Validation**: Input strings sanitized, length boundaries enforced (Capacity: 2–10, Pitch: 5–300 chars).
