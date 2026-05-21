# AI and MCP Access Governance Platform — Portfolio Case Study

**Project title:** AI and MCP Access Governance Platform  
**Type:** Working governance proof of concept  
**Stack:** n8n · Asana · Notion · GitHub  
**Author:** Markus Walker

---

## Overview

The AI and MCP Access Governance Platform is a working security engineering project that solves a real and emerging governance problem: organisations have no repeatable intake, review or audit process for AI agent integrations and MCP-connected tools before they reach production.

This project demonstrates a complete governance control loop — from structured intake through automated risk classification, human-reviewed approval, and durable audit evidence — implemented as a runnable n8n workflow.

**n8n Workflow — Final Working State:**

![Final n8n workflow showing Manual Trigger, Sample Input, MCP Tool Server, AI Agent, Code Linter, IF Router, Asana Task Creation, and Evidence Summary nodes](../../assets/screenshots/MCP-Gov_N8N-Workflow.png)

*The final n8n workflow export, `N8N-MCP_Access_Governance_Platform-v2.json`, is available at `assets/diagrams/` in this repository.*

---

## The Problem This Solves

A backend developer connects a new MCP server to an internal workflow environment. That server can query internal databases, expose API structures and return sensitive data to an AI agent. No security review has occurred. No owner is documented. No evidence of any decision exists.

This is the default outcome when AI-native tooling meets legacy governance processes.

The AI and MCP Access Governance Platform introduces a lightweight, structured control layer that sits between the moment a developer wants a new integration and the moment that integration touches real infrastructure.

---

## Governance Flow

```
Developer submits request via Asana
              ↓
n8n receives and validates the intake form
              ↓
Automated risk signal checks:
  - Data classification
  - Environment (prod / dev / lab)
  - MCP tool exposure type
  - Privilege scope
  - Vendor maturity
              ↓
Risk is classified: Low / Medium / High / Prohibited
              ↓
       ┌──────┴──────────────────────────────┐
       ↓                                     ↓
  Auto Allow (Low risk)         Human Review (Medium / High)
       ↓                                     ↓
  Evidence Record             Security Review Task (Asana)
                                             ↓
                                  Reviewer Decision
                             Approve / Approve with Conditions / Deny
                                             ↓
                                    Evidence Record
```

Every path — approved, conditionally approved, or denied — produces a structured audit evidence record.

---

## Architecture

### Platform Components

| Platform | Role |
|---|---|
| **n8n Cloud** | Workflow orchestration, validation, risk classification, decision routing, evidence summary |
| **Asana** | Human review task queue, remediation tracking, operational audit evidence |
| **Notion** | Governance knowledge base, MCP server inventory, control notes, decision records |
| **GitHub** | Source control, documentation, workflow exports, evidence artefacts, JSON schemas |

### Reference Architecture

The platform follows a four-layer architecture:

1. **Intake layer** — Structured Asana form with required fields (requester, integration name, data classification, environment, MCP tool details)
2. **Orchestration layer** — n8n Cloud receives the request, runs automated checks and applies the decision logic matrix
3. **Human review layer** — Asana review queue with security engineer assignment, condition management and decision recording
4. **Evidence layer** — Structured JSON evidence records stored in GitHub, tamper-evident by default via Git content-addressable storage

---

## Governance Controls

Eight control objectives govern the platform:

| Control | Objective |
|---|---|
| **GOV-01** | Structured intake — every request captured with required fields |
| **GOV-02** | Risk-based decisioning — classification uses documented, consistent criteria |
| **GOV-03** | Human accountability — material risk always routed to named security reviewer |
| **GOV-04** | Audit evidence — every terminal decision produces a structured record |
| **GOV-05** | Least privilege — approved access is time-bound and purpose-bound |
| **GOV-06** | Safe automation boundary — no real provisioning without explicit reviewer approval |
| **GOV-07** | Scope guardrails — workflow changes follow documented architecture |
| **GOV-08** | Periodic review — approved access re-reviewed on material scope change |

---

## Security Linter

The workflow includes a deterministic Python security linter that inspects n8n workflow JSON exports for governance risk signals:

| Rule | Severity | What It Detects |
|---|---|---|
| LINT-001 | High | MCP client tool node detected in workflow |
| LINT-002 | High | MCP node with auth token references |
| LINT-003 | Medium | HTTP node calling MCP-like endpoint directly |
| LINT-004 | High | AI agent node with no human approval gate upstream |
| LINT-005 | Medium | Workflow missing owner metadata |
| LINT-006 | Low | Workflow missing risk classification metadata |

Rules are pure functions — deterministic, stateless, side-effect-free. Every finding includes embedded framework mapping tags (CSA AI, MAESTRO, OWASP LLM Top 10, ISO/IEC 27001, ISO/IEC 42001) so findings are audit-ready at generation time without post-processing.

All 42 pytest tests pass across positive, negative, serialisation and integration scenarios.

---

## Evidence Model

Four evidence types are produced:

1. **Linter finding records** — structured JSON per finding with full framework mapping
2. **Decision evidence records** — auto allow, human review outcome, or auto deny
3. **Reviewer decision records** — identity, timestamp, conditions, expiry
4. **Exception records** — time-limited overrides requiring governance owner approval

Evidence is stored in GitHub — tamper-evident by default. BigQuery append-only tables are documented as the enterprise upgrade path.

---

## Framework Alignment

| Framework | Coverage |
|---|---|
| ISO/IEC 27001 | Access control, supplier risk, change management, auditability |
| ISO/IEC 42001 | AI management, human oversight, accountability, lifecycle governance |
| NIST SP 800-37 | Risk management framework structure |
| NIST SP 800-30 | Risk assessment language and treatment categories |
| CSA AI Controls Matrix | Cloud AI governance, access control, data governance |
| MAESTRO | Agentic AI threat modelling, orchestration and tool execution layers |
| OWASP LLM Top 10 | Prompt injection, data leakage, tool misuse, excessive agency |
| MCP Security Guidance | Consent, authorisation, confused deputy protections |

The project does not claim formal certification or attestation against any of these frameworks.

---

## What This Demonstrates

| Capability | Evidence |
|---|---|
| Security engineering applied to an emerging problem | MCP and agentic AI governance is a current risk area; this project addresses it with working code |
| Governance translated to testable code | 42 passing tests, deterministic rule coverage, schema-validated output |
| Framework alignment at engineering level | Framework tags embedded in every finding — not just referenced in documents |
| Evidence-oriented design | Structured evidence model with audit chain across every decision path |
| Enterprise deployment thinking | GCP, IAM, Cloud KMS, Cloud Logging, BigQuery — documented enterprise upgrade path |
| Honest scoping | PoC limitations documented clearly; no overclaiming |

---

## Honest Assessment and Limitations

This is a proof of concept. It demonstrates the governance pattern, not a production deployment.

| Limitation | Production Resolution |
|---|---|
| Manual Trigger in workflow | Asana webhook with HMAC verification |
| Sample data hardcoded | n8n Asana API node with custom field mapping |
| Evidence in Git files | BigQuery append-only tables |
| No identity verification on requester | Google Workspace identity integration |
| No re-review scheduler | Scheduled workflow surfacing expired approvals |
| Linter runs on export only | CI/CD integration via GitHub Actions |

None of these are design flaws — they are documented PoC scope boundaries, each with a recorded enterprise equivalent.

All sample data in this repository is fictional. All workflow exports use fictional placeholder values. No production infrastructure, live access tokens or real customer data are present.

---

## Related Documents

- [Executive Summary](02-executive-summary.md)
- [Website Integration Brief](03-website-integration-brief.md)
- [Publishing Checklist](04-publishing-checklist.md)
- [Asset Index](ASSET_INDEX.md)
- [Executive Landing Page](../charter/01-executive-landing.md)
- [Full Technical Case Study](../evidence/12-technical-case-study.md)
- [Governance Control Register](../governance/08-governance-control-register.md)
- [Evidence Model](../evidence/09-evidence-model.md)
