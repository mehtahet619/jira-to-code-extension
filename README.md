# Ticket-to-Code VS Code Extension

[![Version](https://img.shields.io/npm/v/jira-to-code.svg)](https://www.npmjs.com/package/jira-to-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VSCode-Extension-blue)](https://code.visualstudio.com/)
[![Node Version](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/UmangDalvadi/jira-to-code)

Turn tickets from **Jira, Trello, Linear, or GitHub Issues** into ready‑to‑review pull requests with one command. This extension connects multiple project management platforms, Git, and LLMs to automate the busy work: parsing requirements, generating code and tests, opening a PR, and updating tickets. The default LLM can be swapped for your own.

## 🚀 Supported Platforms

- **Jira** (Atlassian) - `https://company.atlassian.net/browse/PROJ-123`
- **Trello** - `https://trello.com/c/cardId/card-name`
- **Linear** - `https://linear.app/team/issue/TEAM-123`
- **GitHub Issues** - `https://github.com/owner/repo/issues/123`

*Community contributions welcome for additional platforms!*

---

## 📊 Flow

![Flow](./webview/public/jira-flow.png)

---

## ✨ What it does

- **Multi-Platform Support**: Reads tickets from Jira, Trello, Linear, or GitHub Issues by URL
- **Smart Parsing**: Extracts requirements, acceptance criteria, and tasks using an LLM
- **Code Generation**: Creates a git branch and minimal code change scaffold
- **Test Generation**: Generates comprehensive tests for your code
- **PR Automation**: Opens a pull request with detailed description
- **Ticket Updates**: Comments on tickets with QA steps and review checklists
- **Status Management**: Moves tickets to the next status automatically

---

## ⚙️ How it works

1. **Paste any supported ticket URL** into the VS Code panel and click **Run**.
2. **Auto-detect platform** → authenticate with the appropriate service (Jira, Trello, Linear, or GitHub).
3. **Fetch ticket data** → extract title, description, labels, and acceptance criteria.
4. **AI Processing** → send ticket text, repo context, and coding standards to LLMs.
5. **Code Generation** → LLM applies file edits, writes tests, and runs them locally.
6. ✅ **If tests pass** → commits, pushes, opens a PR, and updates the original ticket.  
   ❌ **If tests fail** → self-correction loop retries.

## 🔌 Integration Adapters

The extension uses a flexible adapter system to support multiple platforms:

| Platform | URL Pattern | Authentication | Status |
|----------|-------------|----------------|---------|
| **Jira** | `*.atlassian.net/browse/*` | OAuth2 / API Token | ✅ Stable |
| **Trello** | `trello.com/c/*` | API Key + Token | ✅ Stable |
| **Linear** | `linear.app/*/issue/*` | API Key / OAuth2 | ✅ Stable |
| **GitHub Issues** | `github.com/*/issues/*` | PAT / OAuth2 | ✅ Stable |

> **Community Contributions Welcome!** Want to add support for Azure DevOps, Asana, or other platforms? See our [Integration Guide](./docs/INTEGRATIONS.md).

---

## 🚀 Features

- **Multi-Platform Support**: Jira, Trello, Linear, and GitHub Issues
- **Smart Authentication**: OAuth2 and API token support per platform
- **VS Code Integration**: Clean UI panel for ticket input and run status
- **One-Command Workflow**: From any ticket → ready PR
- **Pull Request Templates**: Automated PR descriptions and checklists
- **Ticket Updates**: Comments with test steps & review checklists
- **Status Management**: Automatic status transitions
- **Configurable LLMs**: Swap models for code, tests, and documentation
- **Self-Correction**: Automatic retry loop for failed tests
- **Extensible Architecture**: Community can add new platform adapters

---

## 📦 Requirements

- VS Code 1.100 or newer
- Node.js 20+
- Git installed & logged in
- API access for your chosen platform(s):
  - **Jira**: API token or OAuth2 app
  - **Trello**: API key and token
  - **Linear**: API key or OAuth2 app
  - **GitHub**: Personal access token or OAuth2 app
- LLM API key (Google Gemini supported)

---

## 🧠 LLM Orchestration

- **Code model** → file planning & edits  
- **Test model** → unit tests & fixtures  
- **Docs model** → PR & Jira comments  

> Uses repo style guides + safety rails (no edits outside workspace).

---

## 🧪 Development

```bash
# Build webview
cd webview
npm install

# Compile extension
cd ..
npm install

# Debug in VS Code
# Open extension.ts then press F5
````

---

## 🛠️ Usage

1. Open Command Palette → `Ctrl+Shift+P`
2. Run → **Jira to Code AI**
3. Enter Jira ticket → start converting tasks 🚀

---

## 🤝 Contributing

We ❤️ contributions!

1. Fork the repo
2. Create your branch

   ```bash
   git checkout -b feature/my-feature
   ```
3. Commit changes

   ```bash
   git commit -m "feat: add my feature"
   ```
4. Push to fork

   ```bash
   git push origin feature/my-feature
   ```
5. Open a Pull Request

---

## 📄 License

Licensed under the [MIT License](LICENSE).