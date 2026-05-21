# Publishing Checklist — AI and MCP Access Governance Platform

**Purpose:** Confirm all items are true before treating the project as publicly published  
**Status:** Working checklist — verify each item before sharing the repo URL publicly

---

## Repository Readiness

- [ ] `README.md` is the clean, professional landing page shown at the repo root
- [ ] `README.md` links to `docs/publication/` and references `assets/screenshots/MCP-Gov_N8N-Workflow.png`
- [ ] Repository structure section in README is accurate
- [ ] No `TODO`, `FIXME`, `PLACEHOLDER`, or draft-quality content in public-facing documents
- [ ] `CHANGELOG.md` is up to date and does not expose internal notes or private context
- [ ] `GOAL_CONTEXT.md` is understood to be an internal planning document (not portfolio content)

---

## Security and Privacy

- [ ] No API keys, tokens or live service access tokens are present in any file
- [ ] No real customer data, personal information or private organisation identifiers are present
- [ ] No internal IP addresses, hostnames or private infrastructure identifiers are present
- [ ] Workflow exports reviewed — all authentication token references are confirmed fictional placeholders
- [ ] Sample payloads and example files contain only fictional data
- [ ] The word "fictional" or "demo" is present wherever sample data could be mistaken for real data
- [ ] No file in `docs/publication/` contains sensitive authentication token patterns or private identifier strings

---

## Documentation Quality

- [ ] `docs/publication/01-portfolio-case-study.md` renders correctly as GitHub Markdown
- [ ] `docs/publication/02-executive-summary.md` renders correctly as GitHub Markdown
- [ ] `docs/publication/03-website-integration-brief.md` is accurate for current website state
- [ ] `docs/publication/04-publishing-checklist.md` is this file — up to date
- [ ] `docs/publication/ASSET_INDEX.md` lists all assets with accurate paths
- [ ] Internal cross-links between documents are correct and resolve
- [ ] No broken links to files that no longer exist

---

## Asset Readiness

- [ ] `assets/screenshots/MCP-Gov_N8N-Workflow.png` is present and is the final workflow screenshot
- [ ] `assets/diagrams/N8N-MCP_Access_Governance_Platform-v2.json` is the final importable workflow
- [ ] All six asset pack images are present under `assets/images/mcp_governance_asset_pack/`
- [ ] Images are correctly referenced in the case study document

---

## Honest Scoping

- [ ] The PoC limitations table is present in the case study and is accurate
- [ ] No claim of production deployment, formal certification or attestation is made
- [ ] The phrase "proof of concept" or "PoC" is used where the scope is limited
- [ ] Framework alignment is described as reference and alignment, not certification

---

## Website Integration (Markus-Doc)

- [ ] `assets/images/mcp-governance/MCP-Gov_N8N-Workflow.png` exists in Markus-Doc
- [ ] `assets/images/mcp-governance/02_mcp_governance_hero_banner.png` exists in Markus-Doc
- [ ] `assets/docs/Markus_Walker_MCP_Governance_Platform.md` (or `.pdf`) exists in Markus-Doc
- [ ] Desktop site `index.html` references MCP Governance as a portfolio piece
- [ ] Mobile site `index.html` references MCP Governance as a portfolio piece
- [ ] All existing site links (resume, IR, Cloud, GitHub, LinkedIn, TryHackMe, writeups) still resolve
- [ ] No backend, build step or package dependency has been introduced to Markus-Doc

---

## Final Git State

- [ ] `git status` in MCP_Governance_Platform is clean or only intentionally untracked files remain
- [ ] `git status` in Markus-Doc is clean or only intentionally untracked files remain
- [ ] Commit messages are professional and do not expose internal planning context

---

## Before Sharing the URL

- [ ] All checklist items above are confirmed
- [ ] The README has been read top to bottom as a first-time visitor would see it
- [ ] The portfolio case study has been read top to bottom for tone and accuracy
- [ ] The executive summary has been read for appropriate register (suitable for CISO or hiring manager)
