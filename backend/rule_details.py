RULE_DETAILS = {

    "CG001": {
        "why": "Hardcoded passwords can expose sensitive credentials if the source code is leaked or committed to a public repository.",
        "example_fix": """import os

password = os.getenv("PASSWORD")"""
    },

    "CG002": {
        "why": "Using a bare except catches every exception, making debugging difficult and hiding unexpected runtime errors.",
        "example_fix": """try:
    ...
except ValueError:
    ..."""
    },

    "CG003": {
        "why": "Infinite loops may consume CPU resources indefinitely and cause the application to become unresponsive.",
        "example_fix": """while condition:
    # loop body"""
    },

    "CG004": {
        "why": "The eval() function executes arbitrary Python code and may introduce serious code injection vulnerabilities.",
        "example_fix": """# Avoid eval()

number = int(user_input)"""
    },

    "CG005": {
        "why": "Wildcard imports reduce readability and can overwrite existing identifiers unexpectedly.",
        "example_fix": """from math import sqrt"""
    },

    "CG006": {
        "why": "The exec() function executes arbitrary Python code and may allow attackers to run malicious commands.",
        "example_fix": """# Avoid exec()

functions[user_choice]()"""
    },

    "CG007": {
        "why": "Using os.system() executes shell commands directly and may allow command injection attacks if user input is involved.",
        "example_fix": """import subprocess

subprocess.run(["ls", "-l"], check=True)"""
    },

    "CG008": {
        "why": "Launching subprocesses with unvalidated input may expose the application to security risks.",
        "example_fix": """subprocess.run(
    ["python", "script.py"],
    check=True
)"""
    },

    "CG009": {
        "why": "TODO and FIXME comments often indicate unfinished functionality or known issues that should be resolved before production deployment.",
        "example_fix": """# Complete the pending implementation
# Remove temporary comments"""
    },
    "CG010": {
        "why": "Empty code blocks may indicate unfinished logic or placeholder implementations that should be completed before deployment.",
        "example_fix": """def process():
    print("Processing data...")"""
    },

    "CG011": {
        "why": "MD5 is considered cryptographically broken and should not be used for password hashing or security-sensitive operations.",
        "example_fix": """import hashlib

hashlib.sha256(data.encode()).hexdigest()"""
    },

    "CG012": {
        "why": "SHA-1 is vulnerable to collision attacks and should be replaced with stronger hashing algorithms.",
        "example_fix": """import hashlib

hashlib.sha256(data.encode()).hexdigest()"""
    },

    "CG013": {
        "why": "Running applications in debug mode may expose sensitive information and increase security risks in production.",
        "example_fix": """app.run(debug=False)"""
    },

    "CG014": {
        "why": "Hardcoded API keys can be leaked through source code and should be stored securely.",
        "example_fix": """import os

API_KEY = os.getenv("API_KEY")"""
    },

    "CG015": {
        "why": "HTTP requests without a timeout may hang indefinitely if the remote server does not respond.",
        "example_fix": """requests.get(url, timeout=5)"""
    },

    "CG016": {
        "why": "Opening files without closing them may cause resource leaks and unexpected application behavior.",
        "example_fix": """with open('file.txt') as f:
    data = f.read()"""
    },

    "CG017": {
        "why": "Global variables make code harder to maintain, test and debug due to shared mutable state.",
        "example_fix": """def calculate():
    value = 10
    return value"""
    },

    "CG018": {
        "why": "Unused imports increase memory usage slightly and reduce code readability.",
        "example_fix": """# Remove unused imports

import os"""
    },
        "CG019": {
        "why": "Using mutable objects as default function arguments can lead to unexpected behavior because the same object is reused between function calls.",
        "example_fix": """def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)"""
    },

    "CG020": {
        "why": "Unused variables reduce code readability and often indicate incomplete or unnecessary logic.",
        "example_fix": """# Remove the unused variable

result = calculate()"""
    },

    "CG021": {
        "why": "Using assert for runtime validation is unsafe because assertions can be disabled in optimized execution.",
        "example_fix": """if value <= 0:
    raise ValueError("Invalid value")"""
    },

    "CG022": {
        "why": "Using random() for passwords, tokens, or security-sensitive values is not cryptographically secure.",
        "example_fix": """import secrets

token = secrets.token_hex(16)"""
    },

    "CG023": {
        "why": "Empty exception handlers silently ignore errors, making debugging and maintenance difficult.",
        "example_fix": """except Exception as e:
    print(e)
    raise"""
    },

    "CG024": {
        "why": "Very long functions are difficult to understand, maintain, and test. Breaking them into smaller functions improves readability.",
        "example_fix": """def validate():
    ...

def process():
    ...

def save():
    ..."""
    },

    "CG025": {
        "why": "Deep nesting makes code difficult to read and increases overall complexity.",
        "example_fix": """if not valid:
    return

process_data()"""
    },

    "CG026": {
        "why": "Magic numbers make code harder to understand because their purpose is not immediately clear.",
        "example_fix": """MAX_RETRY = 3

for _ in range(MAX_RETRY):
    ..."""
    }

}