# Executive Summary — AI and MCP Access Governance Platform

**Audience:** CISO, Security Leadership, Hiring Managers, Governance Owners  
**Format:** One-page portfolio summary

---

## The Problem

AI agents and MCP-connected workflow tools are entering enterprise infrastructure faster than governance frameworks can keep up. A developer connects a new integration. The security team finds out later — if at all.

Without a structured intake and review process:

- Sensitive data flows through channels that have never been security-reviewed
- No accountable owner is documented for the AI workflow
- No evidence of review exists if an incident occurs
- Security and compliance teams cannot demonstrate that controls operated

---

## The Solution

The **AI and MCP Access Governance Platform** is a working governance proof of concept built on n8n, Asana, Notion and GitHub.

It introduces a lightweight, repeatable intake and review workflow. Every AI agent and MCP integration request is captured, classified by risk, routed to the appropriate decision path, and evidenced — regardless of the outcome.

The control loop:

```
Request → Validate → Classify → Route → Review → Evidence
```

---

## What It Demonstrates

This project is not a policy document. It is a working, importable, end-to-end governance system that proves the pattern can be built and operated.

**For a CISO or governance owner:**
- Eight documented control objectives mapped to ISO/IEC 27001, ISO/IEC 42001 and SOC 2 style evidence thinking
- A risk classification model with four levels: Low, Medium, High, Prohibited
- A human review path for all material risk that produces durable audit evidence
- A documented enterprise deployment path on Google Cloud

**For a security engineering reviewer:**
- A deterministic Python security linter with six rules covering MCP tool detection, missing approval gates, missing owner metadata and privilege signals
- 42 passing pytest tests across rule coverage, serialisation and integration scenarios
- A runnable n8n workflow exportable and importable without live infrastructure
- Framework-tagged findings ready for audit use without post-processing

---

## Standards Alignment

ISO/IEC 27001 · ISO/IEC 42001 · NIST SP 800-37 · NIST SP 800-30 · CSA AI Controls Matrix · MAESTRO · OWASP LLM Top 10 · MCP Security Guidance

The project does not claim formal certification or attestation.

---

## Portfolio Safety

This is a portfolio-safe proof of concept:

- All sample data is fictional
- All workflow exports use fictional placeholder values
- No production infrastructure, live access tokens or real customer data are present
- The project does not claim to be a production deployment, a formal compliance certification or a complete enterprise control environment

---

## Continue Reading

- [Full Portfolio Case Study](01-portfolio-case-study.md)
- [Website Integration Brief](03-website-integration-brief.md)
- [Executive Landing Page](../charter/01-executive-landing.md)
