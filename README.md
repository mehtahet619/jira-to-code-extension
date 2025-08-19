# Jira-to-Code VS Code Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![VS Code](https://img.shields.io/badge/VSCode-Extension-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

Turn a Jira ticket into a ready-to-review pull request with one command.  
This extension connects Jira, Git, and LLMs to automate the busy work: parsing requirements, generating code and tests, opening a PR, and updating Jira.  
The default LLM can be swapped for your own.

---

## 📊 Flow

![Flow](./webview/public/jira-flow.png)

---

## ✨ What it does

- Reads a Jira issue by URL.
- Extracts requirements, acceptance criteria, and tasks using an LLM.
- Creates a git branch and a minimal code change scaffold.
- Generates tests and a PR description.
- Opens a pull request.
- Comments on the Jira ticket with QA steps and a review checklist.
- Moves the Jira issue to the next status.

---

## ⚙️ How it works

1. Paste a Jira URL into the VS Code panel and click **Run**.
2. Authenticate with Jira using OAuth2 → fetch title, description, labels, and acceptance criteria.
3. Extension sends ticket text, repo context, and coding standards to the LLMs.
4. LLM applies file edits, writes tests, and runs them locally.
5. ✅ If tests pass → commits, pushes, opens a PR, and updates Jira.  
   ❌ If tests fail → self-correction loop retries.

---

## 🚀 Features

- OAuth2 with Jira Cloud and Jira Server.
- VS Code UI panel for ticket input and run status.
- **One-command workflow** from Jira ticket → PR.
- Pull request template support.
- Jira comments with test steps & review checklist.
- Status transition (In Progress → Code Review).
- Configurable LLMs for code, tests, and docs.
- Self-correction loop for failed tests.

---

## 📦 Requirements

- VS Code 1.90 or newer
- Node.js 18+
- Git installed & logged in
- Jira API access (read, comment, transition)
- LLM API key

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