# Project Charter: AI and MCP Access Governance Platform

**Status:** Proof of Concept — Portfolio Artefact  
**Audience:** CISO, Security Leadership, Governance Owners, Platform Managers, Security Engineers  
**Scenario:** All named entities, request records and evidence samples in this document are fictional. This is a public-safe corporate mock-up demonstrating governance design, security architecture and automation capability.

---

## 1. Cover Page

**Project:** AI and MCP Access Governance Platform  
**First Build:** MCP Access Request Governance PoC — n8n and Asana  
**Version:** v0 — Proof of Concept  
**Date:** 2026  
**Classification:** Public Portfolio Artefact

---

## 2. Portfolio Context Statement

This project demonstrates a corporate-facing access governance platform for AI services, MCP servers and external APIs. It is designed as a practical security, governance and automation artefact suitable for portfolio presentation and technical review.

The artefact demonstrates security architecture, governance design, workflow automation, AI risk awareness and project delivery capability. It does not claim certification, use real customer data or describe a live production deployment.

---

## 3. Scenario Context

**The scenario:** A backend developer at a mid-size technology company wants to connect a new third-party database provider tool through MCP into the company's internal infrastructure.

The integration would allow an AI agent to:

- Query internal databases on behalf of users
- Read repository context and project metadata
- Access internal API credentials through the MCP server's tool interface

Without a governance workflow, this integration would proceed based on the developer's own judgement. The security team would not know it exists until an incident or audit review.

**The platform addresses this gap** by providing a repeatable intake, review and evidence workflow that sits before any MCP-connected integration reaches infrastructure.

---

## 4. Executive Summary

The AI and MCP Access Governance Platform provides governed intake, risk classification, decision routing and audit evidence capture for AI agent integrations, MCP server connections and external API access requests.

The platform treats governance as a built-in capability — not a friction layer. Safe access becomes easier to request, safer to approve and auditable by default.

The MVP uses Asana for structured request intake, n8n for automated orchestration and Notion for governance knowledge. It validates required request fields, classifies AI, MCP and API access risk across four levels, routes requests to the appropriate decision path and records evidence for every terminal outcome.

The project reduces shadow AI adoption, excessive permissions, unmanaged external service connections, unclear ownership and weak audit evidence — while preserving a lightweight path for legitimate AI-native workflow experimentation.

---

## 5. Problem Statement

Modern workflow platforms, development tools and productivity applications now support MCP server connections and AI agent integrations. These connections give AI agents the ability to:

- Read data from internal systems
- Call APIs on behalf of users or services
- Modify records, create tasks or trigger automations
- Access credentials, secrets and sensitive configuration

Existing enterprise access governance processes — designed for human identities and static service accounts — do not address these capabilities adequately.

**The specific gap:** No repeatable process exists for a security team to:
1. Receive a structured request for a new AI or MCP integration
2. Assess risk consistently using documented criteria
3. Make a traceable, documented decision
4. Produce durable evidence of the review

**The consequence of inaction:** AI agents accumulate access to business systems without governance review, creating access sprawl, accountability gaps and audit evidence failures.

---

## 6. Project Purpose

Build a practical, working proof of concept that:

1. Demonstrates a repeatable MCP and AI integration governance workflow
2. Produces durable evidence for each decision outcome
3. Maps governance findings to recognised AI and security frameworks
4. Establishes a documented enterprise deployment path
5. Is suitable for presentation to a CISO, Lead Security Engineer or portfolio reviewer

---

## 7. Scope and Boundaries

### In Scope

- Fictional Asana request intake model with required field schema
- n8n workflow orchestration: validation, risk classification, decision routing, evidence capture
- Four-level risk classification model (Low, Medium, High, Prohibited)
- Three decision paths: auto allow, human review, auto deny
- Structured finding and evidence JSON schemas
- Framework mapping: CSA AI, MAESTRO, ISO 27001, ISO 42001, SOC 2, OWASP LLM
- Governance control register
- Enterprise deployment path documentation (GCP-aligned)
- Demo-ready sample requests, findings and evidence records

### Out of Scope

- Real privileged provisioning or production access grants
- Live API calls to real infrastructure during PoC execution
- Formal certification against any standard
- Legal advice or procurement process replacement
- Real customer data, personal data or production secrets
- Automated deployment to production systems

---

## 8. Governance Philosophy

Governance is an enablement layer. It allows teams to adopt AI, MCP and API services faster by making intake, review, approval, denial and evidence capture consistent from the beginning.

The design uses defence in depth:

- **Request fields** ensure completeness before any review begins
- **Ownership requirements** establish accountability at intake
- **Data classification** drives risk scoring
- **Policy logic** classifies risk consistently without manual judgement
- **Human review** remains the decision authority for material risk
- **Evidence capture** ensures every decision is auditable
- **Least privilege and periodic review** limit long-term exposure

High-risk agentic or tool-enabled access is not an automatic approval path. Human review is required for medium and high-risk requests.

---

## 9. Standards and Framework Alignment

| Framework | Application in This Project |
|---|---|
| **NIST SP 800-37** | Risk management framework structure — identify, assess, respond, monitor |
| **NIST SP 800-30** | Risk assessment language — likelihood, impact, risk level, treatment |
| **ISO/IEC 27001** | Access control (A.9), supplier relationships (A.15), audit logging (A.12.4), incident evidence |
| **ISO/IEC 42001** | AI management system: human oversight (8.4), accountability (5.3), performance evaluation (9), AI risk planning (6) |
| **SOC 2 Type II** | Evidence of control operation over time; structured decision records and review trails |
| **CSA AI Controls Matrix** | Access control, human oversight, accountability, auditability, governance ownership, third-party risk |
| **MAESTRO** | Agentic AI threat modelling: tool execution, orchestration, external integration, governance observability layers |
| **OWASP LLM Top 10** | Prompt injection, sensitive data exposure, excessive agency, unbounded tool consumption |
| **MCP Security Guidance** | Consent, authorisation, tool scope, confused deputy protections |

The project does not claim formal certification or attestation.

---

## 10. Stakeholders and Roles

| Role | Responsibility in This Model |
|---|---|
| **Requester** | Submits integration request via Asana with required fields |
| **Security Reviewer** | Reviews medium and high-risk requests; makes approve / deny / conditional approval decision |
| **Platform Engineer** | Maintains n8n workflow, credential configuration and integration health |
| **Governance Owner** | Owns control register, risk classification rules and exception process |
| **CISO / Security Leadership** | Receives evidence summary; reviews risk posture; approves scope changes |

---

## 11. Target Operating Model

```
1. Requester submits Asana task with required fields
2. n8n webhook or poll trigger receives the request
3. Required fields are validated (reject if incomplete)
4. Service type classified: AI service / MCP server / external API
5. Risk factors assessed: data class, environment, exposure, privilege, MCP tool scope, agentic scope, service maturity
6. Risk level assigned: Low / Medium / High / Prohibited
7. Decision path selected: auto allow / human review / auto deny
8. Human review task created in Asana when required
9. Requester receives status notification
10. Evidence record written for terminal outcome
11. Approved requests route to implementation guidance
12. Denied requests receive written rationale
13. Approved access flagged for periodic review on material scope change
```

**<SCREENSHOT PLACEHOLDER: Asana intake task showing required fields — requester name, team, service name, service type, data classification, environment, MCP tool scope, business purpose>**

---

## 12. High-Level Architecture

```
 ┌─────────────────────────────────────────────────────┐
 │                   INTAKE LAYER                      │
 │         Asana Task (required field schema)          │
 └─────────────────────────┬───────────────────────────┘
                           │ Asana API / webhook
 ┌─────────────────────────▼───────────────────────────┐
 │                ORCHESTRATION LAYER                   │
 │              n8n Workflow Engine                     │
 │  ┌──────────────┐  ┌─────────────┐  ┌───────────┐  │
 │  │  Validation  │→ │    Risk     │→ │  Decision │  │
 │  │    Node      │  │Classifier   │  │  Router   │  │
 │  └──────────────┘  └─────────────┘  └─────┬─────┘  │
 └─────────────────────────────────────────── │ ───────┘
                   ┌───────────────────────────┤
          ┌────────▼──────┐  ┌─────────────────▼──────────┐
          │  Auto Allow   │  │     Human Review Queue     │
          │  Evidence     │  │  Asana Security Review Task │
          │  Record       │  │  + Reviewer Decision        │
          └───────────────┘  └─────────────┬──────────────┘
                                           │
          ┌────────────────────────────────▼──────────────┐
          │                  EVIDENCE LAYER                │
          │   Structured JSON evidence record              │
          │   GitHub (durable) + Notion (governance KB)   │
          └───────────────────────────────────────────────┘
```

**Enterprise extension:** GCP (Secret Manager, Cloud Logging, Security Operations, BigQuery), Google Workspace identity, GCP IAM service accounts.

**<SCREENSHOT PLACEHOLDER: n8n workflow canvas — full workflow from Manual Trigger to Evidence Summary node>**

---

## 13. Risk Classification Model

Four risk levels with the principle that multiple co-occurring factors escalate the classification:

| Level | Description | Decision Path |
|---|---|---|
| **Low** | Known or pre-approved service, read-only use, public or internal data, clear owner, limited scope | Auto Allow |
| **Medium** | New service, limited sensitive data, new vendor, manual approval needed, bounded privilege | Human Review |
| **High** | Confidential data, external AI service, MCP tool execution with side effects, broad permissions, production environment | Human Review (Security team) |
| **Prohibited** | Regulated or restricted data to unapproved service, broad write access without accountable owner, uncontrolled agent execution, unsafe MCP server | Auto Deny |

Full matrix: [Risk Classification Matrix](../governance/06-risk-classification-matrix.md)

---

## 14. Decision Rules

| Condition | Decision |
|---|---|
| Service pre-approved AND low-risk AND read-only AND no sensitive data AND valid owner | Auto Allow |
| Confidential data OR production access OR new MCP server OR agentic tool use with side effects | Human Review |
| Regulated data to unapproved public service OR no accountable owner OR excessive unreviewed permissions | Auto Deny |

Full matrix: [Decision Logic Matrix](../governance/07-decision-logic-matrix.md)

---

## 15. Control Objectives

| ID | Control Objective |
|---|---|
| GOV-01 | Requests captured via approved intake with required fields |
| GOV-02 | Risk classified using documented, consistent criteria |
| GOV-03 | Material risk routed to human review with named reviewer |
| GOV-04 | Terminal decisions produce structured audit evidence |
| GOV-05 | Approved access is time-bound and least-privilege |
| GOV-06 | No real provisioning without explicit human approval |
| GOV-07 | Workflow changes guided by documented architecture and scope |
| GOV-08 | Approved access subject to re-review on material scope change |

Full register: [Governance Control Register](../governance/08-governance-control-register.md)

---

## 16. Deliverables

| Deliverable | Status |
|---|---|
| Project Charter | Complete |
| Solution Design | Complete |
| Security Architecture and Governance Design | Complete |
| Risk Classification Matrix | Complete |
| Decision Logic Matrix | Complete |
| Governance Control Register | Complete |
| n8n Implementation Guide | Complete |
| Evidence Model and Templates | Complete |
| Security Review Checklist | Complete |
| Demo Script | Complete |
| Technical Case Study | Complete |
| Importable n8n Workflow JSON | Complete |
| Example Request Payloads | Complete |
| Example Finding Outputs | Complete |

---

## 17. Success Criteria

- Requests are structured and validated
- Risk levels are explainable and consistently applied
- Decisions are traceable to documented rules
- Human review is triggered for all medium and high-risk requests
- Evidence is captured for every terminal decision path
- Approved access records include owner, purpose, data scope and review period
- Denied requests include written rationale
- The workflow can be demonstrated end to end with fictional data
- All sample data remains fictional and portfolio-safe
- No secrets, credentials or real customer data are present

---

## 18. Milestones and Timeline

| Phase | Objective | Status |
|---|---|---|
| Phase 0 | Repository and planning baseline | Complete |
| Phase 1 | Charter and requirements | Complete |
| Phase 2 | n8n and Asana MVP workflow | Complete |
| Phase 3 | Policy logic and test harness | Complete |
| Phase 4 | Governance mapping and evidence design | Complete |
| Phase 5 | Architecture and threat model | Complete |
| Phase 6 | Demo packaging | Complete |
| Phase 7 | Public portfolio packaging | In Progress |

---

## 19. Work Breakdown Structure

```
Project Charter and Requirements
  └─ Locked charter structure
  └─ Request field schema
  └─ Control objectives

n8n Workflow Build
  └─ Manual Trigger node
  └─ Sample Input / Asana webhook node
  └─ Code node linter
  └─ IF router node
  └─ Asana task creation node
  └─ Evidence summary node

Policy Logic (Python)
  └─ WorkflowLinter (6 deterministic rules)
  └─ LinterReport and LinterFinding
  └─ 42 pytest tests — all passing

Governance Documentation
  └─ Risk classification matrix
  └─ Decision logic matrix
  └─ Control register
  └─ Evidence model
  └─ Security review checklist

Framework Alignment
  └─ CSA AI mapping
  └─ MAESTRO mapping
  └─ ISO / SOC 2 / OWASP tagging

Portfolio Packaging
  └─ Public repo structure
  └─ Demo script
  └─ Technical case study
```

---

## 20. Assumptions and Constraints

| Assumption / Constraint | Note |
|---|---|
| All data is fictional | Hard constraint — no real customer data at any point |
| No real provisioning in PoC | Hard constraint — platform does not grant real access |
| n8n Cloud used for PoC | Enterprise deployment target is GCP self-hosted |
| Asana OAuth required for Asana integration | Credential setup documented; credentials not committed |
| PoC is deterministic | AI-enriched findings are a planned future phase, not v0 |

---

## 21. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Secret leakage in workflow exports | All credential IDs are fictional placeholders; exports reviewed before commit |
| Scope creep beyond PoC | Locked charter structure enforced; out-of-scope items documented separately |
| Misuse of PoC as production approval | Clear disclaimer on all documents and workflow exports |
| Framework misrepresentation | No certification claims; alignment described as reference-only |

---

## 22. Communications and Reporting

This is a portfolio project. Communications take the form of:

- GitHub repository updates with clear commit messages
- Evidence records in `evidence/` and `examples/`
- Periodic review of `STATUS.md` and `PROGRESS.md` in the builder repo

For a production deployment, communications would include: stakeholder review cadence, risk reporting to CISO, Asana-based reviewer notifications and optional Slack integration for status updates.

---

## 23. Budget and Resources

This is a portfolio project built with accessible cloud tools. Estimated resource requirements for a working PoC:

| Resource | Notes |
|---|---|
| n8n Cloud (free tier) | Sufficient for PoC workflow volume |
| Asana (free tier) | Sufficient for PoC review task model |
| Notion (free tier) | Sufficient for governance knowledge base |
| GitHub (public or private) | Source control and documentation |

Production deployment costs would depend on GCP compute, n8n enterprise licensing, IAM design and data retention requirements.

---

## 24. Approval and Review

This charter is a portfolio artefact and does not require organisational approval. In a real deployment, this section would capture:

- CISO approval signature and date
- Security architecture review sign-off
- Legal and privacy review confirmation
- Platform team acceptance

---

## 25. Annexes

See [Annexes](../evidence/annexes/13-annexes.md) for:

- Annex A: Request Intake Field Schema
- Annex B: AI and MCP Risk Classification Matrix (detailed)
- Annex C: Decision Logic Matrix (detailed)
- Annex D: Security Review Checklist
- Annex E: Audit Evidence Fields
- Annex F: Example Asana Request
- Annex G: Example n8n Workflow Map
- Annex H: Framework Mapping Summary
- Annex I: Threat Model Starter
- Annex J: Glossary
