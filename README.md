# VibeGuard (MVP)

**Lightweight security checks for AI-assisted & rapid coding.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

VibeGuard is a VS Code extension designed to help developers, especially those prioritizing speed ("vibe coding") and using AI code assistants, catch common security vulnerabilities without disrupting their workflow. It focuses on high-confidence, actionable warnings for common issues often overlooked during rapid development.

**Current MVP Status:** This is an early Minimum Viable Product focusing on Python code.

## Features (MVP v0.1)

- **Local Analysis:** All code analysis happens entirely locally on your machine. **No code is ever sent to external servers.**
- **Real-time Feedback:** Warnings appear directly in the editor and the "Problems" panel as you code or save (asynchronously).
- **Secret Detection (VG001):** Detects potential hardcoded secrets (passwords, API keys, tokens) based on common keywords assigned to string literals.
  - Example: `api_key = "..."`, `db_password: "..."`
- **Basic SQL Injection Detection (VG002):** Detects potential SQL Injection risks when f-strings or %-formatting are used on the same line as common database execution methods (like `.execute()` or `.query()`) without apparent parameterization.
  - Example: `cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")`
- **Clickable Links:** Warnings include links to relevant OWASP pages for learning more about the vulnerability.
- **Configurable:** Easily enable or disable VibeGuard via VS Code settings.

## Installation

_(Instructions for installing the packaged `.vsix` file will go here once built. For development, launch via F5 from the source code.)_

<!--
Example for later:
1. Download the latest `.vsix` file from the [Releases](<link-to-your-releases-page>).
2. Open VS Code.
3. Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
4. Click the `...` menu in the top-right corner.
5. Select "Install from VSIX..." and choose the downloaded file.
-->

## Usage

1.  Install the extension.
2.  Ensure VibeGuard is enabled in your VS Code settings (Search for "VibeGuard: Enable" - it's enabled by default).
3.  Open a Python (`.py`) file.
4.  VibeGuard will automatically analyze the code and display warnings (yellow squiggles) for detected issues in the editor and the "Problems" panel.
5.  Click the diagnostic code (e.g., `VG001`) in the Problems panel to learn more about the vulnerability type.

## Configuration

- **`vibeguard.enable`**: (boolean, default: `true`)
  - Set this to `false` in your VS Code settings (`File > Preferences > Settings` or `Code > Settings > Settings`, search for "VibeGuard") to disable all VibeGuard analysis.

## Known Limitations & Potential False Positives (MVP)

Transparency is important! VibeGuard's MVP uses regex-based detection, which has limitations:

- **Secrets (VG001):**
  - May flag variables containing keywords as substrings (e.g., `display_token = "..."` might be flagged because it contains `token`).
  - Will not detect secrets assigned without quotes or using less common keywords.
- **SQL Injection (VG002):**
  - May flag legitimate uses of f-strings or %-formatting as arguments within a `.execute()` call if they are not the query itself (e.g., `cursor.execute(f"Log marker: {var}", real_query)` could be flagged).
  - Will not detect SQLi constructed via simple string concatenation (`"SELECT..." + var`) or using `.format()`.
  - May miss SQLi if unusual database execution method names are used or if the query is built across multiple lines.
- **Comments/Docstrings:** May flag patterns within comments or docstrings.

Future versions may use more advanced techniques (like AST parsing) to improve accuracy.

## Contributing / Feedback

_(Optional: Add instructions here later if you want contributions or specify how users can provide feedback - e.g., link to your GitHub repository issues page)._

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details. <!-- Create a LICENSE file with MIT text -->
