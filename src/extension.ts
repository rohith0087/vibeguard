import * as vscode from "vscode";

const diagnosticCollection =
  vscode.languages.createDiagnosticCollection("vibeguard");

// Global variable to track enabled state
let isEnabled = true;

export function activate(context: vscode.ExtensionContext) {
  console.log("VibeGuard is now active!");

  // --- Function to update enabled state from configuration ---
  function updateEnabledState() {
    const config = vscode.workspace.getConfiguration("vibeguard");
    isEnabled = config.get<boolean>("enable", true);
    // Keep this log for user feedback on setting changes
    console.log(`[VibeGuard] Enabled state updated: ${isEnabled}`);
    if (!isEnabled) {
      diagnosticCollection.clear();
    } else {
      triggerFullAnalysis(); // Re-analyze if enabled
    }
  }

  // --- Function to trigger analysis on all relevant open documents ---
  async function triggerFullAnalysis() {
    if (!isEnabled) return;
    await Promise.allSettled(
      vscode.workspace.textDocuments.map(async (document) => {
        if (document && document.uri.scheme === "file") {
          await analyzeDocument(document);
        }
      })
    );
  }

  // --- Analysis Function (Async) ---
  async function analyzeDocument(document: vscode.TextDocument) {
    if (!isEnabled) {
      diagnosticCollection.delete(document.uri);
      return;
    }

    await new Promise<void>((resolve) =>
      setTimeout(() => {
        if (document.languageId === "python") {
          const text = document.getText();
          const diagnostics: vscode.Diagnostic[] = [];

          // ----- DETECTOR 1: SECRET DETECTION (Reverted Regex - No \b) -----
          const secretKeywordsRegex =
            /(password|secret|apikey|api_key|token|pwd|passwd)\s*[:=]\s*['"].+['"]/gi;
          let matchSecret;
          try {
            while ((matchSecret = secretKeywordsRegex.exec(text)) !== null) {
              const startPos = document.positionAt(matchSecret.index);
              const endPos = document.positionAt(
                matchSecret.index + matchSecret[0].length
              );
              const range = new vscode.Range(startPos, endPos);
              const diagnosticSecret = new vscode.Diagnostic(
                range,
                `[VibeGuard Secret] Potential hardcoded credential found matching keyword. Avoid storing secrets directly in code. Use environment variables or a secrets manager.`,
                vscode.DiagnosticSeverity.Warning
              );
              diagnosticSecret.code = {
                value: "VG001",
                target: vscode.Uri.parse(
                  "https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure"
                ),
              };
              diagnosticSecret.source = "VibeGuard";
              diagnostics.push(diagnosticSecret);
            }
          } catch (e) {
            console.error(
              "[VibeGuard] Error during secret regex execution:",
              e
            );
          }
          // ----- END DETECTOR 1 -----

          // ----- DETECTOR 2 START: BASIC SQL INJECTION PATTERN (v0.4 - Context Heuristic) -----
          const potentialFormatStringsRegex =
            /(f(["']).*?\{.*?\}.*?\2)|((["']).*?%\w.*?\4\s*%\s*.+)/gi;
          const dbExecRegex =
            /\.execute\(|\.query\(|\.exec\(|\["execute"\]|\["query"\]/i; // Common method names

          let matchFormat;
          try {
            while (
              (matchFormat = potentialFormatStringsRegex.exec(text)) !== null
            ) {
              const fullMatchString = matchFormat[1] || matchFormat[3];
              if (!fullMatchString) continue;

              const matchStartIndex =
                text.lastIndexOf("\n", matchFormat.index) + 1;
              let matchEndIndex = text.indexOf("\n", matchFormat.index);
              if (matchEndIndex === -1) {
                matchEndIndex = text.length;
              }
              const lineText = text.substring(matchStartIndex, matchEndIndex);

              // Check if the LINE contains a likely DB execution call
              const containsDbExec = dbExecRegex.test(lineText);

              if (containsDbExec) {
                // Re-find the precise index of the formatted string within the text
                const preciseMatchIndex = text.indexOf(
                  fullMatchString,
                  matchFormat.index > 0 ? matchFormat.index - 1 : 0
                );
                if (preciseMatchIndex === -1) continue;

                const textAfterMatch = text.substring(
                  preciseMatchIndex + fullMatchString.length
                );
                const seemsParameterized = /^\s*,\s*\(\s*\[?\s*\w+/.test(
                  textAfterMatch
                );

                if (!seemsParameterized) {
                  // Only flag if format string is on DB exec line AND not parameterized
                  const startPos = document.positionAt(preciseMatchIndex);
                  const endPos = document.positionAt(
                    preciseMatchIndex + fullMatchString.length
                  );
                  const range = new vscode.Range(startPos, endPos);
                  const diagnosticSql = new vscode.Diagnostic(
                    range,
                    `[VibeGuard SQLi] Potential SQL Injection risk: String formatting seems to be used in DB call. Use parameterized queries (e.g., execute("...?", (var,))) to prevent vulnerabilities.`,
                    vscode.DiagnosticSeverity.Warning
                  );
                  diagnosticSql.code = {
                    value: "VG002",
                    target: vscode.Uri.parse(
                      "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
                    ),
                  };
                  diagnosticSql.source = "VibeGuard";
                  diagnostics.push(diagnosticSql);
                }
              }
            }
          } catch (e) {
            console.error("[VibeGuard] Error during SQLi regex execution:", e);
          }
          // ----- DETECTOR 2 END -----

          diagnosticCollection.set(document.uri, diagnostics);
        } else {
          diagnosticCollection.delete(document.uri);
        }
        resolve();
      }, 0)
    );
  }

  // --- Initial Setup & Event Listeners ---
  updateEnabledState(); // Read initial config

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("vibeguard.enable")) {
        updateEnabledState();
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(async (document) => {
      if (document) {
        await analyzeDocument(document);
      }
    })
  );
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      if (document && document.uri.scheme === "file") {
        await analyzeDocument(document);
      }
    })
  );
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnosticCollection.delete(document.uri);
    })
  );

  triggerFullAnalysis(); // Initial analysis

  context.subscriptions.push(
    vscode.commands.registerCommand("vibeguard.helloWorld", () => {
      vscode.window.showInformationMessage(
        `VibeGuard is currently ${isEnabled ? "enabled" : "disabled"}.`
      );
    })
  );
  context.subscriptions.push(diagnosticCollection);
}

// Deactivate function
export function deactivate() {
  console.log("VibeGuard deactivated.");
  if (diagnosticCollection) {
    diagnosticCollection.clear();
    diagnosticCollection.dispose();
  }
}
