function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJSON(result, filename = "codeguard-report.json") {
  const blob = new Blob([JSON.stringify(result, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, filename);
}

export function downloadTXT(result, filename = "codeguard-report.txt") {
  const lines = [];
  lines.push("CodeGuard AI — Static Analysis Report");
  lines.push("=".repeat(42));
  lines.push(`Score: ${result.score}/100 (Grade ${result.grade})`);
  lines.push(`Rules Checked: ${result.rules_checked}`);
  lines.push(`Total Issues: ${result.total_issues}`);
  lines.push(
    `High: ${result.high}   Medium: ${result.medium}   Low: ${result.low}`
  );
  lines.push(`Analysis Time: ${result.analysis_time}s`);
  lines.push("");
  lines.push("Findings");
  lines.push("-".repeat(42));

  (result.issues || []).forEach((issue, i) => {
    lines.push(
      `${i + 1}. [${issue.severity}] ${issue.rule || "CG000"} — ${issue.issue}`
    );
    if (issue.line) lines.push(`   Line: ${issue.line}`);
    if (issue.suggestion) lines.push(`   Fix: ${issue.suggestion}`);
    lines.push("");
  });

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  triggerDownload(blob, filename);
}