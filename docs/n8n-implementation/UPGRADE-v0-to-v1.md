# Upgrading from v0 to v1

## What changed

v1 replaces the Manual Trigger with a Slack webhook and expands the governance logic significantly. The workflow is not backwards-compatible with v0 — it is a full replacement.

## New credentials to configure

Before activating v1, configure these credentials in your n8n instance:

### 1. Notion (`notionApi`)
- Create a Notion integration at [notion.so/my-integrations](https://www.notion.so/my-integrations)
- Grant it access to the **AI Governance Workspace** and child pages
- Required pages: MCP Server Inventory (`366ae242418681729400da90083fc856`)
- Required database: PoC Evidence Log (`86b8a07f78e4461ba488ed075613b696`)

### 2. Slack Bot (`slackApi`)
- Create a Slack app with `chat:write` and `chat:write.public` scopes
- Install to your workspace
- Use the Bot User OAuth Token as the credential
- The workflow posts to the `slack_channel_id` field in the intake payload

### 3. Asana (`asanaApi`) — existing from v0
- Replace fictional `workspace` and `projectId` values in the **Create Asana Review Task** node with real IDs from your Asana project

## Intake payload

Send a POST request to the webhook URL with this JSON body:

```json
{
  "workflow_name": "my-new-mcp-workflow",
  "mcp_endpoint": "https://tools.example.com/sse",
  "tool_capabilities": ["read"],
  "credential_reference_present": false,
  "workflow_owner": "jane.smith",
  "risk_classification": "low",
  "submitted_by": "jane.smith",
  "team": "Platform Engineering",
  "justification": "Read-only access to internal documentation index for agent context.",
  "slack_user_id": "U012AB3CD",
  "slack_channel_id": "C04MFNKMB66"
}
```

**Required fields:** `workflow_name`, `mcp_endpoint`, `submitted_by`, `slack_channel_id`

**Fields that trigger findings if missing:** `workflow_owner` (MCP-N8N-005), `risk_classification` (MCP-N8N-006), `justification` when write-capable (MCP-N8N-004)

## Decision outcomes

| Decision | Trigger conditions | Action |
|---|---|---|
| `auto_approve` | Zero medium, high, or critical findings | Slack approval message + Notion evidence row |
| `human_review` | Any medium or high findings | Asana task + Slack pending message + Notion evidence row |
| `auto_deny` | Any critical finding (MCP-N8N-008) | Slack denial message + Notion evidence row |

## Linter rules reference

| Rule ID | Finding | Severity | Triggers when |
|---|---|---|---|
| MCP-N8N-001 | MCP reference detected | Medium | `mcp_endpoint` is present |
| MCP-N8N-002 | Credential on MCP node | High | `credential_reference_present: true` |
| MCP-N8N-003 | External MCP endpoint | High | Endpoint is not on internal domain |
| MCP-N8N-004 | Write capability without justification | High | Capabilities include write/execute and justification is empty |
| MCP-N8N-005 | Missing workflow owner | Medium | `workflow_owner` is empty |
| MCP-N8N-006 | Missing risk classification | Medium | `risk_classification` is empty |
| MCP-N8N-007 | Framework mapping not submitted | Low | Always fires (intake form does not collect mappings) |
| MCP-N8N-008 | Secret-like material in submission | Critical | Regex match on password/secret/token/api_key/bearer patterns |
| MCP-N8N-009 | Endpoint not on approved domain list | Medium | Endpoint does not contain `internal` or `localhost` |

## Notion evidence fields written per run

| Field | Value |
|---|---|
| Finding (title) | `{workflow_name}: {highest_severity} ({decision})` |
| Finding ID | `MCP-GOV-{timestamp}` |
| Workflow Name | From intake |
| Risk Classification | Low / Medium / High / Prohibited |
| Severity | Highest finding severity |
| Decision | Pending Review / Approved Risk / Rejected |
| Status | Not started |
| Evidence Summary | Decision reason + submitter + finding count |
| Reviewer | Submitter (security team assigns on review) |
| OWASP LLM Mapping | Deduplicated OWASP categories across all findings |
| CSA AI Mapping | Deduplicated CSA AI themes across all findings |
| MAESTRO Mapping | Deduplicated MAESTRO themes across all findings |
