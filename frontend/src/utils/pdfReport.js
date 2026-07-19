import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

// ===========================
// Report metadata / links (placeholders — update with real values)
// ===========================

const LIVE_DEMO_URL = "https://codeguard-ai-umber.vercel.app";
const GITHUB_URL = "https://github.com/Ritish363/codeguard-ai";
const CONTACT_EMAIL = "your-ritishoswal@gmail.com"; // your email

const PDF_VERSION = "1.0";
const ENGINE_VERSION = "CodeGuard AI v1.0";

function generateReportId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CG-${ts}-${rand}`;
}

// ===========================
// Theme
// ===========================

const COLORS = {
  brand: [32, 98, 196],
  brandLight: [66, 133, 224],
  brandDark: [17, 24, 39],
  brandDarker: [12, 17, 28],
  ink: [23, 26, 32],
  muted: [110, 118, 128],
  border: [222, 226, 232],
  panel: [247, 248, 250],
  panelAlt: [250, 251, 252],
  white: [255, 255, 255],
  shadow: [214, 219, 226],
  ringTrack: [230, 233, 238],
  high: [229, 72, 77],
  highBg: [253, 236, 236],
  medium: [230, 138, 33],
  mediumBg: [254, 240, 223],
  low: [23, 148, 96],
  lowBg: [232, 251, 243],
};

const PAGE = {
  width: 210,
  height: 297,
  margin: 14,
};

const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;

const CATEGORY_MAP = {
  CG001: "Security", CG002: "Reliability", CG003: "Reliability", CG004: "Security",
  CG005: "Maintainability", CG006: "Security", CG007: "Security", CG008: "Security",
  CG009: "Maintainability", CG010: "Maintainability", CG011: "Security", CG012: "Security",
  CG013: "Security", CG014: "Security", CG015: "Reliability", CG016: "Security",
  CG017: "Security", CG018: "Reliability", CG019: "Maintainability", CG020: "Maintainability",
  CG021: "Maintainability", CG022: "Maintainability", CG023: "Maintainability",
  CG024: "Maintainability", CG025: "Reliability", CG026: "Maintainability",
};

// ===========================
// Vector icon helpers (no external assets — jsPDF compatible)
// ===========================

function drawShield(doc, cx, cy, s, fillColor) {
  doc.setFillColor(...fillColor);
  doc.lines(
    [
      [2 * s, 0],
      [0, 1.15 * s],
      [-s, 1.25 * s],
      [-s, -1.25 * s],
      [0, -1.15 * s],
    ],
    cx - s,
    cy - s,
    [1, 1],
    "F",
    true
  );
}

function drawCheck(doc, x, y, s, color, weight = 0.9) {
  doc.setDrawColor(...color);
  doc.setLineWidth(weight);
  doc.setLineCap(1);
  doc.line(x, y, x + s * 0.35, y + s * 0.38);
  doc.line(x + s * 0.35, y + s * 0.38, x + s, y - s * 0.45);
}

function drawIconChip(doc, x, y, size, color, type) {
  doc.setFillColor(...color);
  doc.setDrawColor(...color);

  switch (type) {
    case "rules": {
      // small checklist glyph
      for (let i = 0; i < 3; i += 1) {
        doc.setDrawColor(...color);
        doc.setLineWidth(0.7);
        doc.line(x, y + i * 1.6, x + size * 0.55, y + i * 1.6);
      }
      break;
    }
    case "issues": {
      // warning triangle
      doc.setFillColor(...color);
      doc.triangle(
        x + size / 2, y - size / 2,
        x, y + size / 2,
        x + size, y + size / 2,
        "F"
      );
      break;
    }
    case "time": {
      doc.setDrawColor(...color);
      doc.setLineWidth(0.8);
      doc.circle(x + size / 2, y, size / 2, "S");
      doc.line(x + size / 2, y, x + size / 2, y - size / 2 + 0.8);
      doc.line(x + size / 2, y, x + size / 2 + size / 3, y);
      break;
    }
    case "calendar": {
      doc.setDrawColor(...color);
      doc.setLineWidth(0.8);
      doc.roundedRect(x, y - size / 2, size, size, 0.6, 0.6, "S");
      doc.line(x, y - size / 4, x + size, y - size / 4);
      break;
    }
    case "engine": {
      doc.setFillColor(...color);
      doc.circle(x + size / 2, y, size / 2.2, "F");
      doc.setFillColor(255, 255, 255);
      doc.circle(x + size / 2, y, size / 4.4, "F");
      break;
    }
    default: {
      doc.setFillColor(...color);
      doc.circle(x + size / 2, y, size / 2.4, "F");
    }
  }
}

// ===========================
// Premium visual primitives — gradients, shadows, rings, badges
// ===========================

function drawGradientRect(doc, x, y, w, h, colorStart, colorEnd, steps = 36) {
  const stepH = h / steps;
  for (let i = 0; i < steps; i += 1) {
    const t = i / Math.max(1, steps - 1);
    const r = colorStart[0] + (colorEnd[0] - colorStart[0]) * t;
    const g = colorStart[1] + (colorEnd[1] - colorStart[1]) * t;
    const b = colorStart[2] + (colorEnd[2] - colorStart[2]) * t;
    doc.setFillColor(r, g, b);
    doc.rect(x, y + i * stepH, w, stepH + 0.6, "F");
  }
}

function drawShadowRoundedRect(doc, x, y, w, h, r, offsetX = 0.6, offsetY = 0.9) {
  doc.setFillColor(...COLORS.shadow);
  doc.roundedRect(x + offsetX, y + offsetY, w, h, r, r, "F");
}

// Rounded rect with only the top corners visibly rounded (bottom flattened) —
// used for card headers so they sit flush with the body below them.
function drawTopRoundedRect(doc, x, y, w, h, r, fillColor) {
  doc.setFillColor(...fillColor);
  doc.roundedRect(x, y, w, h, r, r, "F");
  if (h > r) {
    doc.rect(x, y + h - r, w, r, "F");
  }
}

function drawProgressRing(doc, cx, cy, radius, thickness, percent, color, trackColor) {
  const segments = 96;
  const pct = Math.max(0, Math.min(100, percent)) / 100;
  const progSegments = Math.round(segments * pct);

  doc.setLineCap(1);
  doc.setLineWidth(thickness);

  doc.setDrawColor(...trackColor);
  for (let i = 0; i < segments; i += 1) {
    const a0 = (i / segments) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / segments) * 2 * Math.PI - Math.PI / 2;
    doc.line(
      cx + radius * Math.cos(a0), cy + radius * Math.sin(a0),
      cx + radius * Math.cos(a1), cy + radius * Math.sin(a1)
    );
  }

  doc.setDrawColor(...color);
  for (let i = 0; i < progSegments; i += 1) {
    const a0 = (i / segments) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / segments) * 2 * Math.PI - Math.PI / 2;
    doc.line(
      cx + radius * Math.cos(a0), cy + radius * Math.sin(a0),
      cx + radius * Math.cos(a1), cy + radius * Math.sin(a1)
    );
  }
}

// Small rounded pill badge. Returns the width used so callers can chain layout.
function drawPillBadge(doc, x, yTop, text, opts = {}) {
  const {
    fg = COLORS.ink,
    bg = COLORS.panel,
    border = null,
    fontSize = 7.5,
    height = 6.4,
    bold = true,
    align = "left",
  } = opts;

  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(fontSize);
  const w = doc.getTextWidth(text) + 8;
  const drawX = align === "right" ? x - w : x;

  doc.setFillColor(...bg);
  if (border) {
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.roundedRect(drawX, yTop, w, height, height / 2, height / 2, "FD");
  } else {
    doc.roundedRect(drawX, yTop, w, height, height / 2, height / 2, "F");
  }

  doc.setTextColor(...fg);
  doc.text(text, drawX + w / 2, yTop + height - 2, { align: "center" });
  return { w, x: drawX };
}

// ===========================
// Small helpers
// ===========================

function severityColors(severity) {
  if (severity === "High") return { fg: COLORS.high, bg: COLORS.highBg, label: "HIGH" };
  if (severity === "Medium") return { fg: COLORS.medium, bg: COLORS.mediumBg, label: "MEDIUM" };
  return { fg: COLORS.low, bg: COLORS.lowBg, label: "LOW" };
}

function riskLevel(score) {
  if (score >= 80) return { label: "Low Risk", color: COLORS.low, bg: COLORS.lowBg };
  if (score >= 60) return { label: "Medium Risk", color: COLORS.medium, bg: COLORS.mediumBg };
  if (score >= 40) return { label: "High Risk", color: COLORS.high, bg: COLORS.highBg };
  return { label: "Critical Risk", color: COLORS.high, bg: COLORS.highBg };
}

function productionReadiness(result) {
  if (result.score >= 80 && result.high === 0) return { label: "Ready", color: COLORS.low };
  if (result.high === 0) return { label: "Ready with Minor Fixes", color: COLORS.medium };
  return { label: "Not Ready", color: COLORS.high };
}

function deploymentAssessment(result) {
  const recommended = result.score >= 70 && result.high === 0;
  const status = recommended ? "Recommended" : "Not Recommended";
  const statusColor = recommended ? COLORS.low : COLORS.high;
  const statusBg = recommended ? COLORS.lowBg : COLORS.highBg;

  let recommendation;
  if (result.score >= 90) {
    recommendation = `Excellent quality (Grade ${result.grade}). This code is in a strong position for production deployment.`;
  } else if (result.score >= 70) {
    recommendation = `Good overall quality (Grade ${result.grade}). Findings below are manageable and do not indicate critical structural risk.`;
  } else if (result.score >= 40) {
    recommendation = `Grade ${result.grade} — a meaningful number of issues should be addressed before this code is production-ready.`;
  } else {
    recommendation = `Grade ${result.grade} — significant concerns were found. Remediation is required before deployment.`;
  }

  const highNote =
    result.high > 0
      ? `${result.high} high-severity issue${result.high !== 1 ? "s were" : " was"} detected and should be resolved first, as these findings carry the greatest potential impact.`
      : null;

  return { status, statusColor, statusBg, recommendation, highNote };
}

function getExecutiveRecommendation(score) {
  if (score >= 90) {
    return "The analyzed code follows good security and coding practices. Only minor improvements are recommended.";
  }
  if (score >= 70) {
    return "The analyzed code contains a few moderate issues. Address them before deploying to production.";
  }
  return "The analyzed code contains significant security or quality issues. High priority remediation is recommended before deployment.";
}

function generateImpactFallback(issue) {
  const severity = issue.severity || "Low";
  const riskWord =
    severity === "High"
      ? "significant security or reliability"
      : severity === "Medium"
      ? "moderate reliability or maintainability"
      : "minor code quality";

  return `This ${severity.toLowerCase()}-severity finding (${issue.rule || "CG000"}) may introduce ${riskWord} risk if left unresolved. Review the affected code and apply the recommended fix to mitigate the potential impact.`;
}

function ensureSpace(doc, y, needed, topMargin = 26) {
  if (y + needed > PAGE.height - 24) {
    doc.addPage();
    drawPageHeaderBand(doc);
    return topMargin;
  }
  return y;
}

function sectionTitle(doc, text, y, first = false) {
  if (!first) {
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(PAGE.margin, y - 7, PAGE.width - PAGE.margin, y - 7);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.ink);
  doc.text(text, PAGE.margin, y);

  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(1.1);
  doc.line(PAGE.margin, y + 2.6, PAGE.margin + 26, y + 2.6);

  return y + 13;
}

// ===========================
// Slim header band (report pages, not cover)
// ===========================

function drawPageHeaderBand(doc) {
  doc.setFillColor(...COLORS.brandDark);
  doc.rect(0, 0, PAGE.width, 16, "F");
  doc.setFillColor(...COLORS.brand);
  doc.rect(0, 15.3, PAGE.width, 0.7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.white);
  doc.text("CodeGuard AI", PAGE.margin, 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 186, 198);
  doc.text("Static Code Analysis Report", PAGE.width - PAGE.margin, 10.5, { align: "right" });
}

// ===========================
// 1. Premium cover page
// ===========================

function drawCoverPage(doc, result) {
  const risk = riskLevel(result.score);

  // Subtle gradient band behind the title
  drawGradientRect(doc, 0, 0, PAGE.width, 100, COLORS.brandDark, [26, 41, 66]);
  doc.setFillColor(...COLORS.brand);
  doc.rect(0, 96, PAGE.width, 4, "F");

  drawShield(doc, PAGE.width / 2, 30, 9, COLORS.brand);
  drawCheck(doc, PAGE.width / 2 - 4, 31.5, 8, COLORS.white, 1.1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(29);
  doc.setTextColor(...COLORS.white);
  doc.text("CodeGuard AI", PAGE.width / 2, 53, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(195, 202, 214);
  doc.text("Automated Security & Code Quality Assessment Report", PAGE.width / 2, 63, {
    align: "center",
  });

  doc.setFontSize(9);
  doc.setTextColor(150, 158, 172);
  doc.text("React  •  FastAPI  •  Python AST", PAGE.width / 2, 72, { align: "center" });

  // Score hero label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.muted);
  doc.text("OVERALL QUALITY SCORE", PAGE.width / 2, 113, { align: "center" });

  // Circular progress ring around the score
  const ringCx = PAGE.width / 2;
  const ringCy = 152;
  const ringR = 33;
  drawProgressRing(doc, ringCx, ringCy, ringR, 3.6, result.score, risk.color, COLORS.ringTrack);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(56);
  doc.setTextColor(...risk.color);
  doc.text(String(result.score), ringCx, ringCy + 8, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.muted);
  doc.text("/ 100", ringCx, ringCy + 18, { align: "center" });

  // Grade + Risk badges with soft shadows
  const pillY = 205;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const gradeText = `Grade ${result.grade}`;
  const riskText = risk.label;
  const gradeW = doc.getTextWidth(gradeText) + 16;
  const riskW = doc.getTextWidth(riskText) + 16;
  const badgeGap = 6;
  const totalW = gradeW + riskW + badgeGap;
  let px = PAGE.width / 2 - totalW / 2;
  const badgeH = 12;

  drawShadowRoundedRect(doc, px, pillY - 7.5, gradeW, badgeH, 6);
  doc.setFillColor(...COLORS.panel);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(px, pillY - 7.5, gradeW, badgeH, 6, 6, "FD");
  doc.setTextColor(...COLORS.ink);
  doc.text(gradeText, px + gradeW / 2, pillY, { align: "center" });

  px += gradeW + badgeGap;
  drawShadowRoundedRect(doc, px, pillY - 7.5, riskW, badgeH, 6);
  doc.setFillColor(...risk.bg);
  doc.setDrawColor(...risk.color);
  doc.roundedRect(px, pillY - 7.5, riskW, badgeH, 6, 6, "FD");
  doc.setTextColor(...risk.color);
  doc.text(riskText, px + riskW / 2, pillY, { align: "center" });

  // Meta
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Generated ${new Date().toLocaleString()}`, PAGE.width / 2, 228, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.ink);
  doc.text("Prepared by CodeGuard AI", PAGE.width / 2, 236, { align: "center" });

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(PAGE.margin + 30, 244, PAGE.width - PAGE.margin - 30, 244);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("Confidential Static Analysis Report", PAGE.width / 2, 252, { align: "center" });
}

// ===========================
// 2. Executive Summary — premium highlight card
// ===========================

function drawExecutiveSummaryCard(doc, result, startY) {
  const risk = riskLevel(result.score);

  const x = PAGE.margin;
  const width = CONTENT_WIDTH;
  const padding = 8;
  const accentW = 1.6;
  const textX = x + accentW + padding;
  const textW = width - accentW - padding * 2;

  const titleH = 9;
  const labelH = 5.2;
  const lineH = 4.4;
  const blockGap = 6;
  const metricRowH = 10.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.3);
  const assessmentBody =
    "This Python source code was analyzed using CodeGuard AI's static analysis engine.";
  const assessmentLines = doc.splitTextToSize(assessmentBody, textW);

  const recommendation = getExecutiveRecommendation(result.score);
  const recLines = doc.splitTextToSize(recommendation, textW);

  const metrics = [
    { label: "Overall Score", value: `${result.score} / 100` },
    { label: "Grade", value: String(result.grade) },
    { label: "Risk Level", value: risk.label, color: risk.color },
    { label: "Total Issues", value: String(result.total_issues) },
    { label: "Analysis Time", value: `${result.analysis_time}s` },
  ];
  const metricRows = Math.ceil(metrics.length / 2);

  const contentH =
    titleH +
    blockGap +
    labelH +
    assessmentLines.length * lineH +
    blockGap +
    metricRows * metricRowH +
    blockGap +
    labelH +
    recLines.length * lineH;

  const cardH = contentH + padding * 2;

  // Card shell — light blue background, thin blue border, rounded corners
  drawShadowRoundedRect(doc, x, startY, width, cardH, 3);
  doc.setFillColor(228, 240, 253);
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(0.45);
  doc.roundedRect(x, startY, width, cardH, 3, 3, "FD");

  // Left accent border
  doc.setFillColor(...COLORS.brand);
  doc.rect(x, startY + 3, accentW, cardH - 6, "F");

  let cy = startY + padding;

  // Title row with small shield/check icon
  drawShield(doc, textX + 3, cy + 2.6, 3, COLORS.brand);
  drawCheck(doc, textX - 0.4, cy + 2.9, 3.2, COLORS.white, 0.8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.ink);
  doc.text("Executive Summary", textX + 9, cy + 4);
  cy += titleH + blockGap;

  // Overall Assessment
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.brand);
  doc.text("OVERALL ASSESSMENT", textX, cy);
  cy += labelH;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.3);
  doc.setTextColor(...COLORS.ink);
  doc.text(assessmentLines, textX, cy);
  cy += assessmentLines.length * lineH + blockGap;

  // Metrics — clean two-column layout
  const colW = textW / 2;
  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const mx = textX + col * colW;
    const my = cy + row * metricRowH;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.4);
    doc.setTextColor(...COLORS.muted);
    doc.text(m.label.toUpperCase(), mx, my);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...(m.color || COLORS.ink));
    doc.text(String(m.value), mx, my + 6);
  });
  cy += metricRows * metricRowH + blockGap;

  // Recommendation
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.brand);
  doc.text("RECOMMENDATION", textX, cy);
  cy += labelH;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.3);
  doc.setTextColor(...COLORS.ink);
  doc.text(recLines, textX, cy);

  return startY + cardH + 10;
}

// ===========================
// 2a. Risk Distribution — colored horizontal severity bars
// ===========================

function drawRiskDistribution(doc, result, startY) {
  let y = ensureSpace(doc, startY, 55);

  // Section title with small warning-triangle icon
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(PAGE.margin, y - 7, PAGE.width - PAGE.margin, y - 7);

  drawIconChip(doc, PAGE.margin + 1.5, y - 3.3, 4, COLORS.medium, "issues");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.ink);
  doc.text("Risk Distribution", PAGE.margin + 9, y);
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(1.1);
  doc.line(PAGE.margin + 9, y + 2.6, PAGE.margin + 35, y + 2.6);
  y += 13;

  const rows = [
    { label: "High", count: result.high || 0, fg: COLORS.high, bg: COLORS.highBg },
    { label: "Medium", count: result.medium || 0, fg: COLORS.medium, bg: COLORS.mediumBg },
    { label: "Low", count: result.low || 0, fg: COLORS.low, bg: COLORS.lowBg },
  ];

  const maxCount = Math.max(1, result.high || 0, result.medium || 0, result.low || 0);

  const labelW = 22;
  const countW = 12;
  const rowH = 10;
  const barH = 5.5;
  const barX = PAGE.margin + labelW;
  const barMaxW = CONTENT_WIDTH - labelW - countW - 4;

  rows.forEach((row, i) => {
    const ry = y + i * rowH;
    const barY = ry - barH + 1.5;

    // Severity label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.ink);
    doc.text(row.label, PAGE.margin, ry);

    // Track (empty/light bar, always shown)
    doc.setFillColor(...row.bg);
    doc.roundedRect(barX, barY, barMaxW, barH, 1.4, 1.4, "F");
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(barX, barY, barMaxW, barH, 1.4, 1.4, "S");

    // Filled portion (colored bar), proportional to count
    const fillW = (row.count / maxCount) * barMaxW;
    if (fillW > 0.6) {
      doc.setFillColor(...row.fg);
      doc.roundedRect(barX, barY, Math.max(fillW, 1.6), barH, 1.4, 1.4, "F");
    }

    // Count beside the bar
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...row.fg);
    doc.text(String(row.count), barX + barMaxW + 4, ry);
  });

  return y + rows.length * rowH + 6;
}

// ===========================
// 2b. Analysis Summary — dashboard cards
// ===========================

function metricCard(doc, x, y, w, h, label, value, color, iconType) {
  drawShadowRoundedRect(doc, x, y, w, h, 2.5);
  doc.setDrawColor(...COLORS.border);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(x, y, w, h, 2.5, 2.5, "FD");

  drawIconChip(doc, x + 5, y + 8, 4.6, color, iconType);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(...COLORS.muted);
  doc.text(label.toUpperCase(), x + 12, y + 8.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...color);
  doc.text(String(value), x + 5, y + 19);
}

function drawAnalysisSummary(doc, result, startY) {
  let y = sectionTitle(doc, "Analysis Summary", startY, true);
  const risk = riskLevel(result.score);

  const heroH = 27;
  drawShadowRoundedRect(doc, PAGE.margin, y, CONTENT_WIDTH, heroH, 3);
  drawGradientRect(doc, PAGE.margin, y, CONTENT_WIDTH, heroH, COLORS.brandDark, [30, 45, 70]);
  // re-clip corners to rounded by painting rounded rect on top border only
  doc.setDrawColor(...COLORS.brandDark);
  doc.setFillColor(...COLORS.brand);
  doc.rect(PAGE.margin, y + heroH - 1.5, CONTENT_WIDTH, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(190, 197, 209);
  doc.text("OVERALL QUALITY SCORE", PAGE.margin + 9, y + 10.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(31);
  doc.setTextColor(...COLORS.white);
  doc.text(`${result.score}`, PAGE.margin + 9, y + 22);
  const scoreW = doc.getTextWidth(`${result.score}`);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(150, 158, 172);
  doc.text("/100", PAGE.margin + 9 + scoreW + 2, y + 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const gradeText = `Grade ${result.grade}`;
  const riskText = risk.label;
  const gradeW = doc.getTextWidth(gradeText) + 10;
  const riskW = doc.getTextWidth(riskText) + 10;
  let px = PAGE.margin + CONTENT_WIDTH - 9 - riskW;

  doc.setFillColor(...risk.bg);
  doc.roundedRect(px, y + 8.5, riskW, 9.5, 4.75, 4.75, "F");
  doc.setTextColor(...risk.color);
  doc.text(riskText, px + riskW / 2, y + 15, { align: "center" });

  px -= gradeW + 5;
  doc.setDrawColor(95, 103, 118);
  doc.setLineWidth(0.4);
  doc.roundedRect(px, y + 8.5, gradeW, 9.5, 4.75, 4.75, "D");
  doc.setTextColor(...COLORS.white);
  doc.text(gradeText, px + gradeW / 2, y + 15, { align: "center" });

  y += heroH + 9;

  const gap = 5;
  const cols = 3;
  const cardW = (CONTENT_WIDTH - gap * (cols - 1)) / cols;
  const cardH = 23;

  const metrics = [
    { label: "Rules Checked", value: result.rules_checked, color: COLORS.brand, icon: "rules" },
    { label: "Total Issues", value: result.total_issues, color: COLORS.brand, icon: "issues" },
    { label: "Analysis Time", value: `${result.analysis_time}s`, color: COLORS.brand, icon: "time" },
    { label: "High Issues", value: result.high, color: COLORS.high, icon: "dot" },
    { label: "Medium Issues", value: result.medium, color: COLORS.medium, icon: "dot" },
    { label: "Low Issues", value: result.low, color: COLORS.low, icon: "dot" },
  ];

  metrics.forEach((m, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = PAGE.margin + col * (cardW + gap);
    const cy = y + row * (cardH + gap);
    metricCard(doc, x, cy, cardW, cardH, m.label, m.value, m.color, m.icon);
  });

  const rows = Math.ceil(metrics.length / cols);
  y += rows * (cardH + gap) + 5;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);

  return y + 9;
}

// ===========================
// 3. Deployment assessment
// ===========================

function drawAssessment(doc, result, startY) {
  let y = ensureSpace(doc, startY, 56);
  y = sectionTitle(doc, "Deployment Assessment", y);

  const { status, statusColor, statusBg, recommendation, highNote } = deploymentAssessment(result);
  const risk = riskLevel(result.score);
  const readiness = productionReadiness(result);

  const recLines = doc.splitTextToSize(recommendation, CONTENT_WIDTH - 10);
  const highLines = highNote ? doc.splitTextToSize(highNote, CONTENT_WIDTH - 10) : [];
  const chipsH = 20;
  const boxH = chipsH + 9 + recLines.length * 4.6 + (highNote ? highLines.length * 4.6 + 5 : 0) + 6;

  drawShadowRoundedRect(doc, PAGE.margin, y - 5, CONTENT_WIDTH, boxH, 3);
  doc.setFillColor(...statusBg);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(PAGE.margin, y - 5, CONTENT_WIDTH, boxH, 3, 3, "FD");

  const chipW = (CONTENT_WIDTH - 16) / 3;
  const chips = [
    { label: "Deployment Status", value: status, color: statusColor },
    { label: "Overall Risk", value: risk.label, color: risk.color },
    { label: "Production Readiness", value: readiness.label, color: readiness.color },
  ];

  chips.forEach((c, i) => {
    const cx = PAGE.margin + 6 + i * chipW;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(...COLORS.muted);
    doc.text(c.label.toUpperCase(), cx, y + 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(...c.color);
    const valueLines = doc.splitTextToSize(c.value, chipW - 4);
    doc.text(valueLines, cx, y + 10);
  });

  let cy = y + chipsH;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(PAGE.margin + 6, cy, PAGE.margin + CONTENT_WIDTH - 6, cy);
  cy += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.ink);
  doc.text(recLines, PAGE.margin + 6, cy);
  cy += recLines.length * 4.6;

  if (highNote) {
    cy += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.high);
    doc.text(highLines, PAGE.margin + 6, cy);
  }

  return y + boxH + 11;
}

// ===========================
// 4. Findings — modern rounded cards, shaded header, badges
// ===========================

const CARD = {
  headerH: 17,
  radius: 3,
  barW: 2.4,
};

function measureCardHeight(doc, issue) {
  const innerWidth = CONTENT_WIDTH - 20;
  doc.setFontSize(9);

  let height = CARD.headerH + 15; // header + title row

  const impactText = issue.why || generateImpactFallback(issue);
  const impactLines = doc.splitTextToSize(impactText, innerWidth - 8);
  height += 7 + impactLines.length * 4.4 + 6; // label + panel padding

  const recLines = doc.splitTextToSize(issue.suggestion || "-", innerWidth - 8);
  height += 3 + recLines.length * 4.4 + 10;

  if (issue.example_fix) {
    const fixLines = doc.splitTextToSize(issue.example_fix, innerWidth - 6);
    height += 3 + fixLines.length * 4.2 + 8;
  }

  if (issue.code) {
    const codeLines = doc.splitTextToSize(issue.code, innerWidth - 6);
    height += 3 + codeLines.length * 4.2 + 8;
  }

  return height + 8;
}

function drawFindingCard(doc, issue, y) {
  const sev = severityColors(issue.severity);
  const cardX = PAGE.margin;
  const cardW = CONTENT_WIDTH;
  const cardH = measureCardHeight(doc, issue);
  const barW = CARD.barW;
  const r = CARD.radius;

  // Soft drop shadow, then white card body with border
  drawShadowRoundedRect(doc, cardX, y, cardW, cardH, r);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(cardX, y, cardW, cardH, r, r, "FD");

  // Shaded header strip (rounded top, flat bottom) tinted by severity
  drawTopRoundedRect(doc, cardX + barW, y, cardW - barW, CARD.headerH, r, sev.bg);

  // Thick colored left bar spanning the full card
  doc.setFillColor(...sev.fg);
  doc.rect(cardX, y, barW, cardH, "F");
  // square the bar's bottom/top against the rounded card corners
  doc.roundedRect(cardX, y, barW + r, cardH, r, r, "S");

  // Severity pill badge
  const sevBadge = drawPillBadge(doc, cardX + 8, y + 5, sev.label, {
    fg: COLORS.white,
    bg: sev.fg,
    fontSize: 7.5,
    height: 6.8,
  });

  // Rule ID badge
  const ruleBadge = drawPillBadge(doc, cardX + 8 + sevBadge.w + 6, y + 5, issue.rule || "CG000", {
    fg: COLORS.ink,
    bg: COLORS.white,
    border: COLORS.border,
    fontSize: 8,
    height: 6.8,
  });

  // Line number badge (right-aligned)
  drawPillBadge(doc, cardX + cardW - 8, y + 5, `Line ${issue.line || "-"}`, {
    fg: COLORS.muted,
    bg: COLORS.panelAlt,
    border: COLORS.border,
    fontSize: 7.3,
    height: 6.8,
    bold: false,
    align: "right",
  });

  let cy = y + CARD.headerH + 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.ink);
  doc.text(issue.issue || "Untitled Issue", cardX + 8, cy);
  cy += 7;

  const innerWidth = CONTENT_WIDTH - 20;

  // Light information panel — Security Impact
  const writeInfoPanel = (label, content) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.3);
    doc.setTextColor(...COLORS.muted);
    doc.text(label.toUpperCase(), cardX + 8, cy);
    cy += 4;

    const lines = doc.splitTextToSize(content, innerWidth - 12);
    const boxH = lines.length * 4.4 + 6;

    doc.setFillColor(...COLORS.panel);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX + 8, cy, innerWidth - 4, boxH, 1.8, 1.8, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.ink);
    doc.text(lines, cardX + 11, cy + 5.4);
    cy += boxH + 6;
  };

  // Highlighted callout box — Recommended Fix
  const writeCallout = (label, content, boxColor) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.3);
    doc.setTextColor(...COLORS.muted);
    doc.text(label.toUpperCase(), cardX + 8, cy);
    cy += 4;

    const lines = doc.splitTextToSize(content, innerWidth - 12);
    const boxH = lines.length * 4.4 + 6;

    doc.setFillColor(...boxColor.bg);
    doc.setDrawColor(...boxColor.fg);
    doc.setLineWidth(0.4);
    doc.roundedRect(cardX + 8, cy, innerWidth - 4, boxH, 1.8, 1.8, "FD");
    doc.setFillColor(...boxColor.fg);
    doc.rect(cardX + 8, cy, 1.4, boxH, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...boxColor.text);
    doc.text(lines, cardX + 12.5, cy + 5.4);
    cy += boxH + 6;
  };

  // Dark syntax-style code block — Affected Code / Suggested Implementation
  const writeCodeBlock = (label, content) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.3);
    doc.setTextColor(...COLORS.muted);
    doc.text(label.toUpperCase(), cardX + 8, cy);
    cy += 4;

    const lines = doc.splitTextToSize(content, innerWidth - 8);
    const boxH = lines.length * 4.2 + 6;

    doc.setFillColor(...COLORS.brandDarker);
    doc.roundedRect(cardX + 8, cy, innerWidth - 4, boxH, 1.8, 1.8, "F");

    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 200, 255);
    doc.text(lines, cardX + 12, cy + 5.6);
    cy += boxH + 6;
  };

  writeInfoPanel("Security Impact", issue.why || generateImpactFallback(issue));

  writeCallout("Recommended Fix", issue.suggestion || "-", {
    bg: COLORS.lowBg,
    fg: COLORS.low,
    text: [23, 110, 74],
  });

  if (issue.example_fix) {
    writeCodeBlock("Suggested Implementation", issue.example_fix);
  }

  if (issue.code) {
    writeCodeBlock("Affected Code", issue.code);
  }

  return y + cardH + 10;
}

function drawFindings(doc, issues, startY) {
  let y = ensureSpace(doc, startY, 30);
  y = sectionTitle(doc, "Detailed Findings", y);

  issues.forEach((issue) => {
    const needed = measureCardHeight(doc, issue) + 10;
    y = ensureSpace(doc, y, needed);
    y = drawFindingCard(doc, issue, y);
  });

  return y + 4;
}

// ===========================
// 5. Project recommendations — modern checklist rows
// ===========================

function drawRecommendations(doc, issues, startY) {
  let y = ensureSpace(doc, startY, 30);
  y = sectionTitle(doc, "Project Recommendations", y);

  const buckets = { Security: new Set(), Reliability: new Set(), Maintainability: new Set() };

  issues.forEach((issue) => {
    if (!issue.suggestion) return;
    const category = CATEGORY_MAP[issue.rule] || "Maintainability";
    const bucket = buckets[category] ? category : "Maintainability";
    buckets[bucket].add(issue.suggestion);
  });

  const order = ["Security", "Reliability", "Maintainability"];
  const bucketColors = { Security: COLORS.high, Reliability: COLORS.medium, Maintainability: COLORS.brand };
  const bucketBg = { Security: COLORS.highBg, Reliability: COLORS.mediumBg, Maintainability: [227, 236, 250] };
  const hasAny = order.some((k) => buckets[k].size > 0);

  if (!hasAny) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.muted);
    doc.text("No outstanding recommendations — this project passed every check.", PAGE.margin, y);
    return y + 10;
  }

  order.forEach((cat) => {
    const items = [...buckets[cat]];
    if (items.length === 0) return;

    y = ensureSpace(doc, y, 16);

    doc.setFillColor(...bucketColors[cat]);
    doc.circle(PAGE.margin + 1.6, y - 2, 1.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...bucketColors[cat]);
    doc.text(cat, PAGE.margin + 6, y);
    y += 7;

    items.forEach((rec) => {
      const lines = doc.splitTextToSize(rec, CONTENT_WIDTH - 22);
      const rowH = lines.length * 4.7 + 7;
      y = ensureSpace(doc, y, rowH + 3);

      drawShadowRoundedRect(doc, PAGE.margin, y - 5, CONTENT_WIDTH, rowH, 2);
      doc.setFillColor(...COLORS.white);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.25);
      doc.roundedRect(PAGE.margin, y - 5, CONTENT_WIDTH, rowH, 2, 2, "FD");

      // colored circular check icon
      doc.setFillColor(...bucketBg[cat]);
      doc.circle(PAGE.margin + 8, y + rowH / 2 - 5, 3.6, "F");
      drawCheck(doc, PAGE.margin + 6, y + rowH / 2 - 5.4, 3.6, bucketColors[cat], 0.9);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.3);
      doc.setTextColor(...COLORS.ink);
      doc.text(lines, PAGE.margin + 16, y + 1);

      y += rowH + 3;
    });

    y += 4;
  });

  return y + 4;
}

// ===========================
// 6. Scan information — modern info cards with icons
// ===========================

function drawScanInfo(doc, result, startY) {
  let y = ensureSpace(doc, startY, 55);
  y = sectionTitle(doc, "Scan Information", y);

  const now = new Date();
  const gap = 5;
  const cols = 3;
  const cardW = (CONTENT_WIDTH - gap * (cols - 1)) / cols;
  const cardH = 21;

  const items = [
    { label: "Report Version", value: "1.0", icon: "dot" },
    { label: "Engine", value: "CodeGuard AI", icon: "engine" },
    { label: "Analysis Type", value: "Static (AST)", icon: "rules" },
    { label: "Language", value: "Python", icon: "dot" },
    { label: "Rules Evaluated", value: String(result.rules_checked), icon: "rules" },
    { label: "Generated Date", value: now.toLocaleDateString(), icon: "calendar" },
    { label: "Generated Time", value: now.toLocaleTimeString(), icon: "time" },
  ];

  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = PAGE.margin + col * (cardW + gap);
    const cy = y + row * (cardH + gap);

    drawShadowRoundedRect(doc, x, cy, cardW, cardH, 2.2);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.setFillColor(...COLORS.panelAlt);
    doc.roundedRect(x, cy, cardW, cardH, 2.2, 2.2, "FD");

    drawIconChip(doc, x + 4, cy + 6.5, 3.6, COLORS.brand, item.icon);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(item.label.toUpperCase(), x + 10, cy + 7.4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...COLORS.ink);
    doc.text(item.value, x + 4, cy + 16.5);
  });

  const rows = Math.ceil(items.length / cols);
  return y + rows * (cardH + gap) + 6;
}

// ===========================
// 6b. Report Metadata, Resources & QR code (final page content)
// ===========================

function drawFinalPage(doc, result, qrDataUrl, startY) {
  const reportId = generateReportId();
  const generatedTimestamp = new Date().toLocaleString();

  // ---- Report Metadata ----
  let y = ensureSpace(doc, startY, 70);
  y = sectionTitle(doc, "Report Metadata", y);

  const metaGap = 5;
  const metaCols = 2;
  const metaCardW = (CONTENT_WIDTH - metaGap * (metaCols - 1)) / metaCols;
  const metaCardH = 18;

  const metaItems = [
    { label: "Report ID", value: reportId },
    { label: "PDF Version", value: PDF_VERSION },
    { label: "Generated Timestamp", value: generatedTimestamp },
    { label: "Engine Version", value: ENGINE_VERSION },
  ];

  metaItems.forEach((item, i) => {
    const col = i % metaCols;
    const row = Math.floor(i / metaCols);
    const x = PAGE.margin + col * (metaCardW + metaGap);
    const cy = y + row * (metaCardH + metaGap);

    drawShadowRoundedRect(doc, x, cy, metaCardW, metaCardH, 2.2);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.setFillColor(...COLORS.panelAlt);
    doc.roundedRect(x, cy, metaCardW, metaCardH, 2.2, 2.2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(item.label.toUpperCase(), x + 5, cy + 6.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.ink);
    const lines = doc.splitTextToSize(item.value, metaCardW - 10);
    doc.text(lines, x + 5, cy + 13);
  });

  const metaRows = Math.ceil(metaItems.length / metaCols);
  y += metaRows * (metaCardH + metaGap) + 8;

  // ---- Resources (clickable hyperlinks) ----
  y = ensureSpace(doc, y, 45);
  y = sectionTitle(doc, "Resources", y);

  const linkItems = [
    { label: "Live Demo", url: LIVE_DEMO_URL },
    { label: "GitHub Repository", url: GITHUB_URL },
    { label: "Email", url: `mailto:${CONTACT_EMAIL}`, displayValue: CONTACT_EMAIL },
  ];

  linkItems.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.3);
    doc.setTextColor(...COLORS.muted);
    doc.text(`${item.label}:`, PAGE.margin, y);
    const labelW = doc.getTextWidth(`${item.label}: `);

    const displayText = item.displayValue || item.url;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.3);
    doc.setTextColor(...COLORS.brand);
    doc.textWithLink(displayText, PAGE.margin + labelW + 2, y, { url: item.url });

    doc.setDrawColor(...COLORS.brand);
    doc.setLineWidth(0.2);
    const linkW = doc.getTextWidth(displayText);
    doc.line(PAGE.margin + labelW + 2, y + 0.6, PAGE.margin + labelW + 2 + linkW, y + 0.6);

    y += 7;
  });

  y += 5;

  // ---- QR code ----
  if (qrDataUrl) {
    y = ensureSpace(doc, y, 70);
    y = sectionTitle(doc, "Live Demo", y);

    const qrSize = 38;
    const qrX = PAGE.width / 2 - qrSize / 2;

    drawShadowRoundedRect(doc, qrX - 4, y - 4, qrSize + 8, qrSize + 8, 2.5);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.setFillColor(...COLORS.white);
    doc.roundedRect(qrX - 4, y - 4, qrSize + 8, qrSize + 8, 2.5, 2.5, "FD");

    doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
    doc.link(qrX, y, qrSize, qrSize, { url: LIVE_DEMO_URL });

    y += qrSize + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.ink);
    doc.text("Scan to view the live demo", PAGE.width / 2, y, { align: "center" });
    y += 6;
  }

  return y;
}

// ===========================
// 7. Footer (every page, including cover)
// ===========================

function drawFooters(doc) {
  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(PAGE.margin, PAGE.height - 19, PAGE.width - PAGE.margin, PAGE.height - 19);
    doc.setDrawColor(...COLORS.brand);
    doc.setLineWidth(0.6);
    doc.line(PAGE.margin, PAGE.height - 19, PAGE.margin + 22, PAGE.height - 19);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.ink);
    doc.text("CodeGuard AI v1.0", PAGE.margin, PAGE.height - 13);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text(`Page ${i} of ${totalPages}`, PAGE.width - PAGE.margin, PAGE.height - 13, {
      align: "right",
    });

    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      "React • FastAPI • Python AST   |   Confidential Static Analysis Report",
      PAGE.width / 2,
      PAGE.height - 8,
      { align: "center" }
    );
  }
}

// ===========================
// Entry point
// ===========================

export default async function generatePDF(result) {
  if (!result) return;

  const doc = new jsPDF();

  doc.setProperties({
    title: "CodeGuard AI — Static Code Analysis Report",
    subject: "Automated Security & Code Quality Assessment",
    author: "CodeGuard AI",
    keywords: "CodeGuard AI, static analysis, code quality, security, Python, report",
    creator: "CodeGuard AI Report Generator",
  });

  drawCoverPage(doc, result);

  doc.addPage();
  drawPageHeaderBand(doc);

  let y = drawExecutiveSummaryCard(doc, result, 28);
  y = drawRiskDistribution(doc, result, y);
  y = drawAnalysisSummary(doc, result, y);
  y = drawAssessment(doc, result, y);
  y = drawFindings(doc, result.issues, y);
  y = drawRecommendations(doc, result.issues, y);
  y = drawScanInfo(doc, result, y);

  let qrDataUrl = null;
  try {
    qrDataUrl = await QRCode.toDataURL(LIVE_DEMO_URL, {
      margin: 1,
      width: 240,
      color: { dark: "#111827", light: "#FFFFFF" },
    });
  } catch (err) {
    qrDataUrl = null;
  }

  drawFinalPage(doc, result, qrDataUrl, y);

  drawFooters(doc);

  doc.save(`CodeGuard_Report_${new Date().getTime()}.pdf`);
}