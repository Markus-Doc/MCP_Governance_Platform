# Security Review Checklist

## AI and MCP Access Governance Platform

**Audience:** Security Reviewers, Platform Engineers  
**Use when:** A request has been routed to the human_review decision path and a security reviewer is conducting the formal review

---

## How to Use This Checklist

Work through each section. Record your findings against each item. At the end, select your review outcome and document any conditions.

This checklist is the basis for the reviewer decision record in the evidence JSON.

**Review outcomes:** Approve | Approve with Conditions | Deny | Needs More Information

---

## Section 1 — Request Completeness

| Check | Question | Pass / Fail / Note |
|---|---|---|
| 1.1 | Is the requester name and email documented? | |
| 1.2 | Is a named team and accountable owner confirmed? | |
| 1.3 | Is the service name and vendor clearly identified? | |
| 1.4 | Is the business purpose specific and appropriate for the request? | |
| 1.5 | Is a review period or access expiry proposed? | |
| 1.6 | Are the requested permissions specific (not blanket access)? | |

**Section 1 outcome:** Pass / Fail / Return for clarification

---

## Section 2 — Data Classification and Scope

| Check | Question | Pass / Fail / Note |
|---|---|---|
| 2.1 | What is the highest data classification this integration will access? | |
| 2.2 | Is that classification appropriate for the proposed vendor and environment? | |
| 2.3 | Are there any restricted, regulated or customer data types involved? | |
| 2.4 | Is the scope of data access limited to what the stated business purpose requires? | |
| 2.5 | Has the data path through the MCP server or API been mapped? (what data flows where) | |
| 2.6 | Is there a risk of sensitive data being exposed to the MCP server's output or logs? | |

**Section 2 outcome:** Acceptable / Needs conditions / Deny

---

## Section 3 — Environment and Infrastructure Risk

| Check | Question | Pass / Fail / Note |
|---|---|---|
| 3.1 | What environment is the integration targeting? (Sandbox / Staging / Production) | |
| 3.2 | Is production access justified by the business purpose? | |
| 3.3 | Are there other lower-risk environments where the integration could be validated first? | |
| 3.4 | Has the integration been tested in a non-production environment before this review? | |
| 3.5 | Does the integration have dependencies on production services that are not covered by this review? | |

**Section 3 outcome:** Acceptable / Condition required (start in staging) / Deny

---

## Section 4 — MCP Tool Scope and Authorisation

| Check | Question | Pass / Fail / Note |
|---|---|---|
| 4.1 | What tools does the MCP server expose? Are they documented? | |
| 4.2 | Are the requested tools limited to the minimum needed for the stated purpose? | |
| 4.3 | Are any MCP tools capable of write, delete, export or privileged operations? | |
| 4.4 | Are the authorisation boundaries for the MCP server clear? (who can call which tools, under what conditions?) | |
| 4.5 | Is there a risk of a confused deputy attack? (tool called for unintended user or purpose) | |
| 4.6 | Has the MCP server vendor's security posture been assessed? | |
| 4.7 | Does the MCP server have its own access controls, or does it trust all callers? | |

**Section 4 outcome:** Acceptable / Conditions required (tool scope restriction) / Deny

---

## Section 5 — Agentic and AI Agent Risk

| Check | Question | Pass / Fail / Note |
|---|---|---|
| 5.1 | Is there an AI agent in the workflow? What decisions can it make autonomously? | |
| 5.2 | Is there a human confirmation step before the agent takes any action with business impact? | |
| 5.3 | Can the agent call MCP tools without human input? If so, under what conditions? | |
| 5.4 | Has the risk of prompt injection been considered? (malicious input manipulating agent behaviour) | |
| 5.5 | Are the agent's tool access boundaries documented and enforced? | |
| 5.6 | What is the blast radius if the agent behaves unexpectedly? | |
| 5.7 | Has the agentic scope been explicitly bounded in the request? | |

**Section 5 outcome:** Acceptable / Conditions required (approval gate, bounded scope) / Deny

---

## Section 6 — Credential and Secrets Handling

| Check | Question | Pass / Fail / Note |
|---|---|---|
| 6.1 | Where are the credentials for this integration stored? | |
| 6.2 | Are credentials stored in an approved secrets manager (not in code, config or workflow exports)? | |
| 6.3 | Does the integration use least-privilege credentials (not admin or root)? | |
| 6.4 | Is there a credential rotation plan? | |
| 6.5 | Are the credential scopes documented and limited to what the integration requires? | |
| 6.6 | Has the workflow export been reviewed to confirm no credentials are embedded? | |

**Section 6 outcome:** Acceptable / Conditions required (move to Secret Manager) / Deny

---

## Section 7 — Logging and Auditability

| Check | Question | Pass / Fail / Note |
|---|---|---|
| 7.1 | Will all MCP tool calls be logged? | |
| 7.2 | Will the logs capture requester context, tool name, parameters and response summary? | |
| 7.3 | Are logs stored in a tamper-evident, durable system? | |
| 7.4 | Is there a retention period defined for integration logs? | |
| 7.5 | Can individual tool calls be traced to a named user or service identity? | |
| 7.6 | Will a security operations team be able to query these logs? | |

**Section 7 outcome:** Acceptable / Conditions required (enable logging) / Deny

---

## Section 8 — LLM and AI Application Security

| Check | Question | Pass / Fail / Note |
|---|---|---|
| 8.1 | Has prompt injection risk been considered for any AI-facing inputs? | |
| 8.2 | Is there a risk of sensitive data being exfiltrated through the AI model's output? | |
| 8.3 | Are tool calls validated and bounded before execution? | |
| 8.4 | Is the AI model used in this integration assessed for its data handling practices? | |
| 8.5 | Is there a risk of the AI model being manipulated through MCP server responses? | |
| 8.6 | Are output filters or safety controls applied before results are returned to users? | |

**Section 8 outcome:** Acceptable / Conditions required / Deny

---

## Section 9 — Architecture Guardrails

| Check | Question | Pass / Fail / Note |
|---|---|---|
| 9.1 | Is the integration scope documented in architecture notes? | |
| 9.2 | Are integration dependencies (databases, APIs, services) identified? | |
| 9.3 | Does the integration create a new attack surface that is not covered by existing controls? | |
| 9.4 | Does the integration conflict with existing security architecture decisions? | |
| 9.5 | Has the security review been completed before any production use, real user data or customer impact? | |

**Section 9 outcome:** Acceptable / Document required / Deny

---

## Section 10 — Review Outcome

### Summary

| Section | Outcome |
|---|---|
| 1. Request completeness | |
| 2. Data classification | |
| 3. Environment risk | |
| 4. MCP tool scope | |
| 5. Agentic AI risk | |
| 6. Credential handling | |
| 7. Logging and auditability | |
| 8. LLM application security | |
| 9. Architecture guardrails | |

### Final Decision

- [ ] **Approve** — Request meets all security requirements as submitted
- [ ] **Approve with Conditions** — Access may proceed only under the conditions listed below
- [ ] **Deny** — Request does not meet security requirements
- [ ] **Needs More Information** — Returned to requester for clarification

### Conditions (if Approve with Conditions)

| # | Condition | Verifiable Before Access? |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |

### Denial Reason (if Deny)

```
[Specific reason — reference the section and item number that failed]
[Policy basis — reference the specific policy or control objective]
```

### Reviewer Details

| Field | Value |
|---|---|
| Reviewer name | |
| Reviewer email | |
| Review date | |
| Review reference (Asana task ID) | |
| Evidence record ID | |

---

## Post-Review Actions

| Action | Owner | Due |
|---|---|---|
| Update Asana task to In Review / Approved Risk / Remediation Required | Reviewer | Same day |
| Write reviewer decision to evidence JSON | Reviewer | Same day |
| Notify requester of outcome | Reviewer or automated | Same day |
| Update Notion governance log | Reviewer | Within 1 business day |
| Schedule re-review reminder if Approve with Conditions | Governance Owner | Within 1 week |
