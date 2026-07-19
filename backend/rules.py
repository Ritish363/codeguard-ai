def check_password(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "password =" in line:
            return {
                "rule": "CG001",
                "issue": "Hardcoded Password Found",
                "severity": "High",
                "line": line_number,
                "suggestion": "Store secrets in environment variables"
            }
    return None


def check_broad_exception(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if line.strip() == "except:":
            return {
                "rule": "CG002",
                "issue": "Broad Exception Handling Found",
                "severity": "Medium",
                "line": line_number,
                "suggestion": "Catch specific exceptions instead of using except:"
            }
    return None


def check_infinite_loop(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "while True" in line:
            return {
                "rule": "CG003",
                "issue": "Possible Infinite Loop",
                "severity": "Medium",
                "line": line_number,
                "suggestion": "Add a proper termination condition"
            }
    return None


def check_eval(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "eval(" in line:
            return {
                "rule": "CG004",
                "issue": "Dangerous use of eval()",
                "severity": "High",
                "line": line_number,
                "suggestion": "Avoid eval() and use safer alternatives"
            }
    return None


def check_wildcard_import(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "import *" in line:
            return {
                "rule": "CG005",
                "issue": "Wildcard Import Detected",
                "severity": "Low",
                "line": line_number,
                "suggestion": "Import only required modules"
            }
    return None


def check_exec(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "exec(" in line:
            return {
                "rule": "CG006",
                "issue": "Dangerous use of exec()",
                "severity": "High",
                "line": line_number,
                "suggestion": "Avoid exec() as it can execute arbitrary code."
            }
    return None


def check_os_system(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "os.system(" in line:
            return {
                "rule": "CG007",
                "issue": "Command Execution Detected",
                "severity": "High",
                "line": line_number,
                "suggestion": "Avoid os.system(); use safer APIs when possible."
            }
    return None


def check_subprocess(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "subprocess." in line:
            return {
                "rule": "CG008",
                "issue": "Subprocess Usage Detected",
                "severity": "Medium",
                "line": line_number,
                "suggestion": "Validate user input before executing subprocess commands."
            }
    return None


def check_todo(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "TODO" in line or "FIXME" in line:
            return {
                "rule": "CG009",
                "issue": "Incomplete Code",
                "severity": "Low",
                "line": line_number,
                "suggestion": "Complete pending TODO/FIXME tasks."
            }
    return None


def check_pass(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if line.strip() == "pass":
            return {
                "rule": "CG010",
                "issue": "Empty Block Detected",
                "severity": "Low",
                "line": line_number,
                "suggestion": "Replace 'pass' with actual implementation if required."
            }
    return None


def check_md5(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "hashlib.md5" in line:
            return {
                "rule": "CG011",
                "issue": "Weak Hash Algorithm (MD5)",
                "severity": "High",
                "line": line_number,
                "suggestion": "Use SHA-256 or a stronger hashing algorithm."
            }
    return None


def check_sha1(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "hashlib.sha1" in line:
            return {
                "rule": "CG012",
                "issue": "Weak Hash Algorithm (SHA1)",
                "severity": "Medium",
                "line": line_number,
                "suggestion": "Use SHA-256 or SHA-3 instead."
            }
    return None


def check_debug_mode(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "debug=True" in line:
            return {
                "rule": "CG013",
                "issue": "Debug Mode Enabled",
                "severity": "Medium",
                "line": line_number,
                "suggestion": "Disable debug mode before deploying."
            }
    return None


def check_api_key(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "API_KEY" in line or "api_key" in line:
            return {
                "rule": "CG014",
                "issue": "Hardcoded API Key",
                "severity": "High",
                "line": line_number,
                "suggestion": "Store API keys in environment variables."
            }
    return None


def check_requests_timeout(code):
    for line_number, line in enumerate(code.splitlines(), start=1):
        if "requests.get(" in line and "timeout=" not in line:
            return {
                "rule": "CG015",
                "issue": "HTTP Request Without Timeout",
                "severity": "Low",
                "line": line_number,
                "suggestion": "Specify a timeout to prevent hanging requests."
            }
    return None