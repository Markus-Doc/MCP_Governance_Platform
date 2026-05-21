# Governance Control Register

## AI and MCP Access Governance Platform

**Audience:** CISO, Compliance Officers, Security Architects, Audit Reviewers  
**Framework alignment:** ISO/IEC 27001, ISO/IEC 42001, SOC 2 Type II, CSA AI Controls Matrix

---

## Register Overview

This register documents the eight control objectives for the AI and MCP Access Governance Platform, their implementation status in the PoC, and their alignment to recognised governance frameworks.

The controls form an interlocking defence-in-depth posture. No single control is relied upon in isolation.

---

## Control Register

### GOV-01 — Structured Intake

**Objective:** Access requests are captured using required fields that support risk classification, ownership and evidence production.

**Rationale:** Without structured intake, risk cannot be assessed consistently. Incomplete requests create accountability gaps and evidence failures.

**Implementation (PoC):**
- Asana task template with required fields enforced
- n8n validation node rejects requests with missing required fields
- Required fields include: requester name, team, service name, service type, vendor, data classification, environment, MCP tool scope, agentic scope, business purpose, requested permissions, review period

**Evidence produced:** Structured Asana task record with all required fields populated

**Framework alignment:**

| Framework | Reference |
|---|---|
| ISO/IEC 27001 | A.9.1 — Access control policy; intake as the control gate |
| ISO/IEC 42001 | Clause 6 — Planning and AI risk assessment |
| CSA AI | `governance_ownership`, `accountability` |
| SOC 2 | CC6.1 — Logical access controls; intake as first control point |

**Status:** Implemented in PoC

---

### GOV-02 — Risk-Based Decisioning

**Objective:** Requests are classified using documented, consistent criteria covering data classification, environment, exposure, privilege and MCP tool risk.

**Rationale:** Inconsistent risk assessment creates uneven governance and erodes trust in the control environment. Documented rules enable explainable, repeatable decisions.

**Implementation (PoC):**
- Four-level risk matrix (Low, Medium, High, Prohibited)
- Seven risk factors assessed for each request
- Linter rules LINT-001 through LINT-006 implement deterministic classification checks
- Classification is automatic, not reliant on individual reviewer judgement for the initial triage

**Evidence produced:** Structured finding records with rule ID, severity, classification basis and framework tags

**Framework alignment:**

| Framework | Reference |
|---|---|
| ISO/IEC 27001 | A.8.2 — Information classification; risk-based access decisions |
| NIST SP 800-30 | Risk assessment process — likelihood, impact, risk level |
| CSA AI | `access_control`, `auditability` |
| MAESTRO | Tool execution, orchestration and external integration layers |

**Status:** Implemented in PoC

---

### GOV-03 — Human Accountability

**Objective:** Material risk is routed to human review with reviewer identity, decision and timestamp captured.

**Rationale:** AI-driven governance decisions are appropriate for triage and classification but not for final approval of material risk. Human accountability at the decision point is required.

**Implementation (PoC):**
- All Medium and High-risk requests route to human review queue in Asana
- Review task includes finding summary, severity, framework tags and requester details
- Reviewer identity, decision and timestamp captured in evidence record
- Conditional approvals require specific, verifiable conditions

**Evidence produced:** Asana review task with reviewer identity and decision; evidence JSON with reviewer fields populated

**Framework alignment:**

| Framework | Reference |
|---|---|
| ISO/IEC 42001 | Clause 8.4 — AI system operation, human oversight |
| ISO/IEC 27001 | A.6.1.1 — Information security roles and responsibilities |
| CSA AI | `human_oversight`, `accountability` |
| OWASP LLM | LLM09 — Overreliance (humans retain decision authority) |

**Status:** Implemented in PoC (Asana task creation; reviewer decision logging in evidence template)

---

### GOV-04 — Audit Evidence

**Objective:** Terminal decisions (auto allow, auto deny, human review outcome) produce structured evidence records suitable for SOC 2 Type II style audit queries.

**Rationale:** Evidence production is not retrospective — it must be built into the decision workflow. Evidence at the point of decision enables audit queries without reconstruction.

**Implementation (PoC):**
- Evidence Summary node in n8n workflow produces structured JSON for every terminal outcome
- Evidence includes: request fields, finding list, decision outcome, decision basis, reviewer fields, timestamp
- Evidence stored in GitHub (`evidence/samples/`) and optionally in Notion governance database
- Finding records include CSA AI, MAESTRO, ISO and SOC 2 framework tags

**Evidence produced:** Structured JSON evidence record with full decision chain

**Framework alignment:**

| Framework | Reference |
|---|---|
| ISO/IEC 27001 | A.12.4 — Logging and monitoring; A.12.4.1 — Event logging |
| ISO/IEC 42001 | Clause 9 — Performance evaluation and monitoring |
| SOC 2 | CC7.2 — System monitoring; evidence of control operation |
| CSA AI | `auditability` |

**Status:** Implemented in PoC

---

### GOV-05 — Least Privilege

**Objective:** Approved access is time-bound, purpose-bound and limited to the minimum capability required for the stated business purpose.

**Rationale:** Least privilege limits the blast radius of a compromised or misused integration. Time-bound access prevents drift accumulation.

**Implementation (PoC):**
- Review period required at intake
- Conditional approvals can enforce scope limits (e.g., read-only only, sandbox only)
- Expiry date captured in approval evidence
- Integration guides document minimum credential scopes for Asana and Notion connectors

**Evidence produced:** Approval evidence with scope conditions and expiry date

**Framework alignment:**

| Framework | Reference |
|---|---|
| ISO/IEC 27001 | A.9.2.3 — Management of privileged access rights |
| NIST SP 800-37 | Principle of least privilege |
| Zero Trust | Verify explicitly, use least privilege, assume breach |
| CSA AI | `access_control` |

**Status:** Partially implemented (scope limits in conditional approvals; expiry not automated in PoC)

---

### GOV-06 — Safe Automation Boundary

**Objective:** The platform does not perform real privileged provisioning or make changes to production systems without explicit human approval.

**Rationale:** The governance workflow itself must not become an attack surface or an uncontrolled automation. The platform reviews and decides; it does not provision.

**Implementation (PoC):**
- No real API calls to production systems in PoC
- All credential IDs are fictional placeholders
- Workflow creates Asana tasks and evidence records only
- Explicit disclaimer in workflow export and all documentation
- Production deployment path documents where real access provisioning would be a separate, controlled step

**Evidence produced:** No evidence required — this is a safety boundary, not a control producing artefacts

**Framework alignment:**

| Framework | Reference |
|---|---|
| MCP Security | Tool scope consent and authorisation boundaries |
| OWASP LLM | LLM08 — Excessive agency |
| MAESTRO | Tool execution layer — unauthorised side effects |
| ISO/IEC 27001 | A.9.4 — System and application access control |

**Status:** Implemented in PoC by design constraint

---

### GOV-07 — Scope and Architecture Guardrails

**Objective:** AI-assisted workflow changes are guided by documented scope, architecture decisions and review criteria, so that fast iteration does not create unmanaged drift.

**Rationale:** AI agents contributing to workflow development can introduce changes that are technically plausible but architecturally unsound or out of scope. Documented guardrails keep development bounded.

**Implementation (PoC):**
- Locked charter structure (25 sections, 10 required annexes)
- Architecture decision records in project documentation
- Scope boundaries explicitly documented (in scope / out of scope)
- Agent operating rules in builder repo prevent scope creep

**Evidence produced:** Architecture documents, charter, scope statements

**Framework alignment:**

| Framework | Reference |
|---|---|
| ISO/IEC 27001 | A.14 — System acquisition, development and maintenance |
| ISO/IEC 42001 | Clause 4 — Context of the organisation; scope governance |
| CSA AI | `governance_ownership` |

**Status:** Implemented in PoC documentation

---

### GOV-08 — Periodic Review

**Objective:** Approved AI, MCP and API access is subject to re-review when scope, data use, tool capability or vendor posture materially changes.

**Rationale:** Approved access at time T may become inappropriate at time T+N due to scope expansion, data sensitivity changes or vendor risk changes. Periodic review prevents access accumulation.

**Implementation (PoC):**
- Re-review triggers documented in Decision Logic Matrix
- Approval evidence includes expiry date and re-review conditions
- In production: scheduled n8n workflow would surface expiring approvals for re-review

**Evidence produced:** Re-review evidence record with original approval reference

**Framework alignment:**

| Framework | Reference |
|---|---|
| ISO/IEC 27001 | A.9.2.5 — Review of user access rights |
| ISO/IEC 42001 | Clause 9 — Performance evaluation; continual improvement |
| SOC 2 | CC6.1 — Access review; periodic access certification |
| CSA AI | `governance_ownership`, `auditability` |

**Status:** Documented; not automated in PoC (scheduled workflow is production phase)

---

## Control Coverage Summary

| Control | PoC Status | Evidence Type | Primary Framework |
|---|---|---|---|
| GOV-01 Structured Intake | Implemented | Asana task record | ISO 27001 A.9.1 |
| GOV-02 Risk-Based Decisioning | Implemented | Linter finding JSON | NIST SP 800-30 |
| GOV-03 Human Accountability | Implemented | Asana task + evidence JSON | ISO 42001 Clause 8.4 |
| GOV-04 Audit Evidence | Implemented | Evidence JSON record | SOC 2 CC7.2 |
| GOV-05 Least Privilege | Partial | Approval evidence with scope | ISO 27001 A.9.2.3 |
| GOV-06 Safe Automation Boundary | Implemented | Design constraint | OWASP LLM08 |
| GOV-07 Scope Guardrails | Implemented | Documentation | ISO 42001 Clause 4 |
| GOV-08 Periodic Review | Documented | Re-review evidence template | ISO 27001 A.9.2.5 |

---

## Exception Process

An exception to the prohibited classification or to a denied request requires:

1. Formal exception request submitted through the standard intake path
2. Specific policy conflict identified and rationale for exception documented
3. Risk owner named and accepting residual risk in writing
4. CISO-level approval (or equivalent governance authority)
5. Time-limited approval with mandatory re-review date
6. Exception recorded in the Notion exception register

Exceptions do not override the evidence requirement. All exceptions produce a structured evidence record.
