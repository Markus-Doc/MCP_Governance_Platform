# Executive Landing Page

## AI and MCP Access Governance Platform

**Audience:** CISO, Security Leadership, Governance Owners, Platform Managers

---

## The Problem

AI agents and MCP (Model Context Protocol) connected workflows are entering enterprise infrastructure faster than governance frameworks can keep up.

A backend developer connects a new MCP server to internal tooling. The server can read internal documents, query databases and call APIs on behalf of an AI agent. The developer moves quickly. The security team does not know the integration exists until it is already in production.

This is not a hypothetical. It is the default outcome when AI-native development tools meet legacy access governance processes.

**The consequence:**

- Sensitive data — internal service metadata, API credentials, repository context, customer records — flows through channels that have never been security-reviewed
- No accountable owner is documented for the AI workflow
- No evidence of review exists if an incident occurs
- Security and compliance teams cannot demonstrate that controls operated

---

## The Opportunity

The same automation capabilities that create this risk can also solve it.

**The AI and MCP Access Governance Platform** introduces a lightweight, repeatable intake and review workflow. It sits between the moment a developer wants to connect a new MCP-enabled integration and the moment that integration touches real infrastructure.

The workflow does not slow development. It makes the security review fast, consistent and evidence-producing.

---

## How It Works

```
Developer submits integration request via Asana
              ↓
n8n receives and validates the request
              ↓
Risk signals are checked automatically
(data class, environment, MCP tool exposure, privilege scope, vendor maturity)
              ↓
Risk is classified: Low / Medium / High / Prohibited
              ↓
         ┌────┴────────────────────────────┐
         ↓                                 ↓
   Auto Allow                        Human Review
   (Low risk)              (Medium / High risk — security team)
         ↓                                 ↓
   Evidence Record            Security Review Task (Asana)
                                           ↓
                                  Reviewer Decision
                               (Approve / Approve with Conditions / Deny)
                                           ↓
                                  Evidence Record
```

**The result:** every integration request has a structured intake record, a documented risk classification, a traceable decision and durable audit evidence — regardless of whether it was approved or denied.

**<SCREENSHOT PLACEHOLDER: Asana review project showing New Findings, In Review, Approved Risk, Remediation Required sections>**

---

## What This Reduces

| Risk | Governance Response |
|---|---|
| Shadow AI integrations | Structured intake before any MCP or API connection is made |
| Unowned AI workflows | Mandatory owner field at intake; accountability traceable to person |
| Unreviewed privileged tool access | High-risk and prohibited paths block or require human review |
| No audit evidence | Every decision path produces a structured evidence record |
| Inconsistent risk assessment | Documented classification rules applied consistently by automation |
| AI agent scope creep | Agent and MCP tool capabilities are assessed at intake, not discovered later |

---

## Governance Model

The platform is governed by eight control objectives:

| Control | Objective |
|---|---|
| **GOV-01** | Structured intake — requests captured using required fields |
| **GOV-02** | Risk-based decisioning — classification uses documented criteria |
| **GOV-03** | Human accountability — material risk routed to named reviewer |
| **GOV-04** | Audit evidence — terminal decisions produce structured records |
| **GOV-05** | Least privilege — approved access is time-bound and purpose-bound |
| **GOV-06** | Safe automation boundary — no real provisioning without explicit approval |
| **GOV-07** | Scope guardrails — workflow changes guided by documented architecture |
| **GOV-08** | Periodic review — approved access re-reviewed on material scope change |

These objectives align with ISO/IEC 27001 (access control, supplier risk, auditability), ISO/IEC 42001 (AI governance, human oversight, accountability) and SOC 2 Type II style evidence thinking.

---

## MVP Scope

The working proof of concept demonstrates:

1. **Asana-based intake** — standardised request form with required fields
2. **n8n orchestration** — automated validation, classification and routing
3. **Risk classification** — four-level model (Low / Medium / High / Prohibited)
4. **Decision routing** — auto allow, human review queue and auto deny
5. **Evidence capture** — structured JSON records for every terminal decision
6. **Framework mapping** — findings mapped to CSA AI, MAESTRO, ISO 27001 and ISO 42001

This is a demonstrable, importable, end-to-end working system — not a slide deck.

**<SCREENSHOT PLACEHOLDER: n8n workflow canvas showing Manual Trigger → Sample Input → Code Linter → IF Router → Asana Task Creation → Evidence Summary nodes>**

---

## Enterprise Deployment Path

The PoC uses n8n Cloud, Asana and Notion. The enterprise deployment target is Google Cloud:

| Capability | Enterprise Platform |
|---|---|
| Workflow hosting | Self-hosted n8n on GCP |
| Identity | Google Workspace |
| Secrets management | Google Secret Manager |
| Platform telemetry | Google Cloud Logging |
| Security operations | Google Security Operations (SIEM) |
| Governance reporting | BigQuery |
| Access protection | GCP IAM + ZTNA overlay (Okta / Cloudflare Access) |

The enterprise path is documented but not implemented in the PoC. This is an intentional scope boundary, not a gap.

---

## Standards Alignment Summary

| Standard | Alignment Area |
|---|---|
| NIST SP 800-37 | Risk management framework structure |
| NIST SP 800-30 | Risk assessment language and treatment categories |
| ISO/IEC 27001 | Access control, supplier risk, change management, auditability |
| ISO/IEC 42001 | AI management, human oversight, accountability, lifecycle governance |
| SOC 2 Type II | Evidence of control operation over time |
| CSA AI Controls Matrix | Cloud AI governance, access control, data governance |
| MAESTRO | Agentic AI threat modelling across orchestration and tool execution layers |
| OWASP LLM Top 10 | Prompt injection, data leakage, tool misuse, excessive agency |
| MCP Security Guidance | Consent, authorisation, confused deputy protections |

---

## What This Is Not

- A production deployment
- A formal certification or attestation
- A replacement for security, legal or procurement teams
- A claim that all enterprise controls are implemented

This project demonstrates a working proof of concept and an enterprise-ready design pattern.

---

## Next Steps for Reviewers

| Audience | Recommended Reading |
|---|---|
| CISO / Governance Owner | [Project Charter](02-project-charter.md) |
| Security Architect | [Security Architecture](../security-architecture/04-security-architecture.md) |
| Platform / Implementation Engineer | [n8n Implementation Guide](../n8n-implementation/05-n8n-implementation-guide.md) |
| Compliance / Audit | [Evidence Model](../evidence/09-evidence-model.md) and [Governance Control Register](../governance/08-governance-control-register.md) |
