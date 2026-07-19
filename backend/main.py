from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from analyzer import analyze_code
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://codeguard-ai-umber.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeRequest(BaseModel):
    code: str


@app.get("/")
def home():
    return {"message": "Predictive Code Review Bot"}


@app.post("/review")
def review(request: CodeRequest):

    start_time = time.perf_counter()

    code = request.code

    issues = analyze_code(code)
    from rule_details import RULE_DETAILS
    from rule_details import RULE_DETAILS

    for issue in issues:
        details = RULE_DETAILS.get(issue.get("rule"))

        if details:
            issue["why"] = details.get("why", "")
            issue["example_fix"] = details.get("example_fix", "")
        else:
            issue["why"] = ""
            issue["example_fix"] = ""

    code_lines = code.splitlines()

    for issue in issues:

        line = issue.get("line")

        if line and 1 <= line <= len(code_lines):
            issue["code"] = code_lines[line - 1].strip()
        else:
            issue["code"] = ""

    if any(issue["issue"] == "Syntax Error" for issue in issues):
        return {
            "score": 0,
            "grade": "F",
            "analysis_time": round(time.perf_counter() - start_time, 3),
            "rules_checked": 26,
            "total_issues": len(issues),
            "high": 0,
            "medium": 0,
            "low": 0,
            "issues": issues,
        }

    score = 100

    severity_weight = {
        "High": 20,
        "Medium": 10,
        "Low": 4,
        "Info": 0,
    }

    high = 0
    medium = 0
    low = 0

    for issue in issues:

        severity = issue["severity"]

        score -= severity_weight.get(severity, 0)

        if severity == "High":
            high += 1

        elif severity == "Medium":
            medium += 1

        elif severity == "Low":
            low += 1

    score = max(score, 0)

    if score >= 90:
        grade = "A"

    elif score >= 80:
        grade = "B"

    elif score >= 70:
        grade = "C"

    elif score >= 60:
        grade = "D"

    else:
        grade = "F"

    analysis_time = f"{(time.perf_counter() - start_time):.4f}"

    return {
        "score": score,
        "grade": grade,
        "analysis_time": analysis_time,
        "rules_checked": 26,
        "total_issues": len(issues),
        "high": high,
        "medium": medium,
        "low": low,
        "issues": issues,
    }