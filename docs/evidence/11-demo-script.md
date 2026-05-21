# Demo Script

## AI and MCP Access Governance Platform — PoC v0

**Audience:** Security team leads, platform engineers, interviewers, portfolio reviewers  
**Duration:** 10–20 minutes (adjust depth per audience)  
**Format:** Live demo or recorded walkthrough

---

## Setup Before the Demo

- Repository open in VS Code or terminal
- n8n workflow imported and visible in browser tab
- Asana project `MCP Access Governance Reviews` open in browser tab (optional)
- `examples/findings/` directory visible in editor
- `workflows/n8n/mcp_access_governance_poc_v0.json` open in editor
- Test run completed at least once before the live demo

---

## Part 1 — The Business Problem (2–3 minutes)

**Open:** `README.md` — scroll to "The Business Problem" section

**Talk track:**

> "The scenario is this. A backend developer wants to connect a third-party database provider through MCP to internal infrastructure. That connection can expose internal service metadata, API credentials, repository context and customer data. Without a governance workflow, the integration goes ahead based on the developer's own judgement. The security team finds out later — if at all.
>
> The questions we're trying to answer are: which AI and MCP integrations exist in our environment? Were they security-reviewed before connection? Can we produce evidence of that review if an incident occurs? Who is accountable?"

**Point to the table:** Show the five business risks — access sprawl, accountability gaps, audit evidence failures, shadow integrations, framework alignment gaps.

---

## Part 2 — The Governance Model (2 minutes)

**Open:** `docs/charter/01-executive-landing.md` — "How It Works" flow diagram

**Talk track:**

> "The platform intercepts the request at intake. The developer submits a structured Asana task with required fields. n8n picks it up, validates the fields and runs a deterministic linter against the request. The linter checks for high-signal risk patterns — MCP nodes, credential references, AI agents without approval gates, missing ownership metadata.
>
> Based on those findings, the workflow routes to one of three paths: auto allow for low-risk, human review for medium and high-risk, and auto deny for prohibited patterns. Every path produces evidence."

---

## Part 3 — The Linter (3 minutes)

**Open:** `workflows/n8n/mcp_access_governance_poc_v0.json` — scroll to the Code node

**Talk track:**

> "The linter has six deterministic rules. Let me walk through them.
>
> LINT-001 and LINT-002 detect MCP nodes and credential references. These are the foundational signals — an MCP-connected tool has access to business systems and credentials that need review before they're in production.
>
> LINT-003 catches HTTP nodes making direct calls to MCP-like endpoints — a developer bypassing the official tool node but still reaching an MCP server.
>
> LINT-004 is the most important for agentic AI risk. It checks whether an AI agent node has a human approval gate upstream. If an AI agent can call tools and take actions without a human confirmation step, that's a governance failure.
>
> LINT-005 and LINT-006 are governance metadata checks. Is the workflow owned? Is it risk-classified? Without these, the workflow can't be governed even if it's technically correct."

**Open:** `examples/findings/` — show one of the finding JSON files

> "Every finding is structured JSON with a rule ID, severity, human_review_required flag and framework_mappings. The framework_mappings immediately tell a reviewer which governance themes are at stake — CSA AI control themes, MAESTRO threat layers, OWASP LLM categories, ISO and SOC 2 tags. A reviewer doesn't need to manually cross-reference a controls matrix."

**<SCREENSHOT PLACEHOLDER: Finding JSON open in editor — rule_id, severity, human_review_required and framework_mappings fields highlighted>**

---

## Part 4 — The n8n Workflow in Action (3 minutes)

**Switch to:** n8n browser tab — workflow canvas

**Talk track:**

> "Here's the working PoC workflow. Manual Trigger for the demo, but in production this would be an Asana webhook. We start with a Sample Input node that populates a fictional high-risk request — a third-party MCP server connecting to a production customer database.
>
> The Code node runs the linter checks against this input. The IF node branches on whether any findings require human review. For this request, they do — LINT-001, LINT-002 and LINT-004 all fire at High severity. The workflow routes to the Asana task creation node."

**Click: Test workflow** — show the execution running

**Open the execution log:**

> "Four findings. Max severity: High. Decision: human_review. The IF node branched correctly. The Asana node would create a review task in the Security Review queue if credentials are configured."

**<SCREENSHOT PLACEHOLDER: n8n execution results panel — 4 findings output from Code node, IF node output showing human_review routing>**

**Switch to:** Asana tab (if configured)

**<SCREENSHOT PLACEHOLDER: Asana New Findings section — review task created by n8n with finding summary, severity and CSA AI tags>**

---

## Part 5 — The Evidence Chain (2 minutes)

**Open:** `examples/` or `evidence/samples/` — show an evidence JSON file

**Talk track:**

> "Here's the evidence record. Finding raised, classification applied, decision made, framework tags included. This is what makes the system auditable. If a compliance reviewer asks 'show me evidence that human oversight controls were applied to AI agent workflows between these dates' — we can point to this.
>
> The finding has a CSA AI `human_oversight` tag. The Asana task has the reviewer identity and timestamp. The evidence JSON has the full decision chain. Git history shows when the record was written. That's an audit-ready evidence chain."

**<SCREENSHOT PLACEHOLDER: Evidence JSON record in GitHub — showing evidence_id, decision, findings, reviewer fields and framework_mappings>**

---

## Part 6 — Auto Deny Path (1 minute)

**Modify or switch to:** a prohibited payload example

**Talk track:**

> "Let's quickly show the auto-deny path. Restricted data, no owner, unknown vendor, unrestricted agent scope. The linter returns a Prohibited classification. The IF node routes to the auto-deny branch. The evidence node writes a denial reason and policy basis. No Asana task needed — the denial is the control."

---

## Part 7 — Framework Alignment (1 minute)

**Open:** `docs/security-architecture/04-security-architecture.md` — scroll to Section 9

**Talk track:**

> "The control register maps every finding to ISO/IEC 27001, ISO/IEC 42001, CSA AI, MAESTRO and SOC 2 Type II. This is what allows the project to speak the same language as a compliance team, a CISO or an auditor — without overclaiming. We're demonstrating alignment with these frameworks at the engineering level. We're not claiming certification."

---

## Part 8 — Enterprise Deployment Path (1 minute)

**Open:** `docs/solution-design/03-solution-design.md` — Section 9 enterprise diagram

**Talk track:**

> "The PoC runs on n8n Cloud. The enterprise target is Google Cloud. Self-hosted n8n, GCP IAM service accounts, Google Secret Manager for credentials, Cloud Logging for telemetry, Google Security Operations as the SIEM destination, BigQuery for governance reporting. The architecture decisions are all documented. The governance patterns are the same — the infrastructure scales."

---

## Closing Statement

> "The platform proves the core control loop: intake, classify, route, review, evidence. It's small, deterministic and documented. The enterprise deployment path is architected. The framework alignment is written at the code level, not just as a policy claim.
>
> Governance of AI agents and MCP-connected tools is an emerging engineering problem. This demonstrates one practical, evidence-producing approach to solving it."

---

## Q&A Preparation

| Question | Answer |
|---|---|
| Why n8n? | Widely-used, accessible workflow platform. Governance patterns apply to any orchestration engine. |
| Why Asana? | Strong API support, custom fields, clear audit trail via task history. Low barrier for demo. |
| Why not use an AI model for the classification? | v0 is intentionally deterministic — prove the control loop first. AI enrichment (Gemini for explanation) is planned for Phase 2. |
| How does this scale? | Linter is stateless. Runs as a Code node or as a CI check. BigQuery handles aggregated reporting. |
| Is this certifiable? | No. It demonstrates practical alignment with recognised frameworks. Certification is a separate, ongoing organisational process. |
| What's next? | Live Asana webhook integration, Gemini API for finding explanations, GCP deployment with Cloud Logging, periodic re-review scheduler. |
| How would you handle false positives? | Reviewer override is possible for all Medium/High findings. Reviewer decision and rationale are captured in evidence. Rules can be tuned for specific environment context. |
| What about the confused deputy problem in MCP? | The review checklist has a dedicated MCP authorisation section. Tool scope, caller identity and consent boundaries are reviewed before approval. |
