# VibeGuard ✨🛡️

**Lightweight security checks for AI-assisted & rapid coding in Python.**

[![Version](https://img.shields.io/visual-studio-marketplace/v/vibe-guard.vibeguard?style=flat-square&label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=vibe-guard.vibeguard)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/vibe-guard.vibeguard?style=flat-square&label=Installs)](https://marketplace.visualstudio.com/items?itemName=vibe-guard.vibeguard)
[![Ratings](https://img.shields.io/visual-studio-marketplace/r/vibe-guard.vibeguard?style=flat-square&label=Rating)](https://marketplace.visualstudio.com/items?itemName=vibe-guard.vibeguard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

VibeGuard is a VS Code extension designed to help developers, especially those prioritizing speed ("vibe coding") and using AI code assistants, catch common security vulnerabilities without disrupting their workflow. It focuses on high-confidence, actionable warnings for common issues often overlooked during rapid development.

**Current MVP Status:** This is an early Minimum Viable Product focusing on Python code analysis.

---

## 🚀 Installation

The easiest way to install VibeGuard is directly from the Visual Studio Code Marketplace:

1.  Open VS Code.
2.  Go to the **Extensions** view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3.  Search for `VibeGuard`.
4.  Look for the extension published by **`vibe-guard`**.
5.  Click **Install**.

Alternatively, [install directly from the Marketplace website](https://marketplace.visualstudio.com/items?itemName=vibe-guard.vibeguard).

_(Manual installation from a `.vsix` file is also possible via the `...` menu in the Extensions view and selecting "Install from VSIX..." if needed.)_

---

## ✨ Features (MVP v0.1)

- 🔒 **Local Analysis:** All code analysis happens entirely locally on your machine. **No code is ever sent to external servers.** Your privacy and security are paramount.
- ⚡️ **Real-time Feedback:** Get instant warnings directly in the editor (squiggles) and the "Problems" panel as you code or save (analysis runs asynchronously).
- 🔑 **Secret Detection (VG001):** Detects potential hardcoded secrets (passwords, API keys, tokens) based on common keywords assigned to string literals.
  - _Example:_ `api_key = "..."`, `db_password: "..."`
- 💉 **Basic SQL Injection Detection (VG002):** Detects potential SQL Injection risks when f-strings or %-formatting are used _on the same line_ as common database execution methods (like `.execute()` or `.query()`) without apparent parameterization.
  - _Example:_ `cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")`
- 🔗 **Clickable Links:** Warnings include links to relevant OWASP pages (like SQL Injection Prevention) for quick access to more information.
- ⚙️ **Configurable:** Easily enable or disable VibeGuard via VS Code settings.

---

## 💡 Usage

1.  Install the extension (see Installation section).
2.  Make sure VibeGuard is enabled (it is by default). You can check in VS Code Settings (`Ctrl+,` or `Cmd+,`) by searching for `VibeGuard`.
3.  Open a Python (`.py`) file.
4.  VibeGuard automatically analyzes the code and highlights potential issues.
5.  Review warnings in the "Problems" panel (`Ctrl+Shift+M` or `Cmd+Shift+M`).
6.  Click the diagnostic code (e.g., `VG001`, `VG002`) in the Problems panel to open relevant documentation (OWASP).

---

## 🛠️ Configuration

- **`vibeguard.enable`**: (Type: `boolean`, Default: `true`)
  - Set this to `false` in your VS Code User or Workspace settings to completely disable VibeGuard analysis.

---

## ⚠️ Known Limitations & Potential False Positives (MVP)

Transparency is important! VibeGuard's MVP uses regular expressions for detection, which is fast but has inherent limitations:

- **Secrets (VG001):**
  - May flag variables containing keywords as substrings (e.g., `display_token = "..."` might be flagged because `token` is a keyword).
  - Will not detect secrets assigned without quotes (e.g., `port = 5432`) or secrets using less common keywords.
- **SQL Injection (VG002):**
  - **Crucial Limitation:** Only detects unsafe formatting (f-string / %-format) when performed **directly inside** the database execution call on the **same line** (e.g., `cursor.execute(f"...")`).
  - **It does NOT detect** cases where the unsafe query string is built first and then passed as a variable (e.g., `query = f"..."; cursor.execute(query)`).
  - May flag legitimate uses of f-strings or %-formatting as _arguments_ within a `.execute()` call if they are not the query itself (e.g., `cursor.execute(f"Log marker: {var}", real_query)` could potentially be flagged).
  - Will not detect SQLi constructed via simple string concatenation (`"SELECT..." + var`) or using `.format()`.
  - May miss SQLi if unusual database execution method names are used.
- **Comments/Docstrings:** May currently flag patterns found within comments or multi-line strings/docstrings.

_Future versions aim to improve accuracy, potentially using Abstract Syntax Tree (AST) parsing to address some of these limitations._

---

## 🤝 Contributing / Feedback

Feedback is highly encouraged! Please report bugs, suggest features, or ask questions on the [**GitHub Issues page**](https://github.com/rohith0087/vibeguard/issues).

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
