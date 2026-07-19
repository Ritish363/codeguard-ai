import ast
from ast_rules import analyze_ast

from rules import (
    check_password,
    check_broad_exception,
    check_infinite_loop,
    check_eval,
    check_wildcard_import,
    check_exec,
    check_os_system,
    check_subprocess,
    check_todo,
    check_pass,
    check_md5,
    check_sha1,
    check_debug_mode,
    check_api_key,
    check_requests_timeout

)

def analyze_code(code):

    issues = []

    try:
        ast.parse(code)
    except SyntaxError as e:
        
        return [
        {
            "rule": "CG000",
            "issue": "Syntax Error",
            "severity": "High",
            "line": e.lineno,
            "suggestion": e.msg,
        }
    ]

    result = check_password(code)
    if result:
        issues.append(result)

    result = check_broad_exception(code)
    if result:
        issues.append(result)

    result = check_infinite_loop(code)
    if result:
        issues.append(result)

    result = check_eval(code)
    if result:
        issues.append(result)

    result = check_wildcard_import(code)
    if result:
        issues.append(result)

    result = check_exec(code)
    if result:
        issues.append(result)

    result = check_os_system(code)
    if result:
        issues.append(result)

    result = check_subprocess(code)
    if result:
        issues.append(result)

    result = check_todo(code)
    if result:
        issues.append(result)

    result = check_pass(code)
    if result:
        issues.append(result)

    result = check_md5(code)
    if result:
        issues.append(result)

    result = check_sha1(code)
    if result:
        issues.append(result)

    result = check_debug_mode(code)
    if result:
        issues.append(result)

    result = check_api_key(code)
    if result:
        issues.append(result)

    result = check_requests_timeout(code)
    if result:
        issues.append(result)
    
    issues.extend(analyze_ast(code))

    return issues