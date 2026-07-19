import ast


def analyze_ast(code):
    issues = []

    imports = {}
    used_names = set()
    assigned_vars = {}
    functions = {}

    try:
        tree = ast.parse(code)

    except SyntaxError:
        return []

    class Visitor(ast.NodeVisitor):

        # ==========================================
        # Imports
        # ==========================================

        def visit_Import(self, node):

            for alias in node.names:
                imports[alias.name] = node.lineno

            self.generic_visit(node)

        # ==========================================
        # Variables Used
        # ==========================================

        def visit_Name(self, node):

            if isinstance(node.ctx, ast.Load):
                used_names.add(node.id)

            self.generic_visit(node)

        # ==========================================
        # Variables Assigned
        # ==========================================

        def visit_Assign(self, node):

            for target in node.targets:

                if isinstance(target, ast.Name):
                    assigned_vars[target.id] = node.lineno

            self.generic_visit(node)

        # ==========================================
        # Function Calls
        # ==========================================

        def visit_Call(self, node):

            # CG016 - pickle.loads()

            if (
                isinstance(node.func, ast.Attribute)
                and isinstance(node.func.value, ast.Name)
                and node.func.value.id == "pickle"
                and node.func.attr == "loads"
            ):

                issues.append({
                    "rule": "CG016",
                    "issue": "Unsafe Deserialization",
                    "severity": "High",
                    "line": node.lineno,
                    "suggestion": "Avoid pickle.loads() on untrusted input."
                })

            # CG017 - open(...,"w")

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "open"
                and len(node.args) >= 2
            ):

                mode = node.args[1]

                if (
                    isinstance(mode, ast.Constant)
                    and mode.value == "w"
                ):

                    issues.append({
                        "rule": "CG017",
                        "issue": "File Opened in Write Mode",
                        "severity": "Low",
                        "line": node.lineno,
                        "suggestion": "Verify writing to files is intended."
                    })

            self.generic_visit(node)

        # ==========================================
        # Exception Handling
        # ==========================================

        def visit_ExceptHandler(self, node):

            # CG018

            if (
                node.type
                and isinstance(node.type, ast.Name)
                and node.type.id == "Exception"
            ):

                issues.append({
                    "rule": "CG018",
                    "issue": "Catching Generic Exception",
                    "severity": "Medium",
                    "line": node.lineno,
                    "suggestion": "Catch specific exception types."
                })

                # CG025

                if (
                    len(node.body) == 1
                    and isinstance(node.body[0], ast.Pass)
                ):

                    issues.append({
                        "rule": "CG025",
                        "issue": "Empty Exception Handler",
                        "severity": "High",
                        "line": node.lineno,
                        "suggestion": "Do not silently ignore exceptions. Handle or log them."
                    })

            self.generic_visit(node)

        # ==========================================
        # Function Definitions
        # ==========================================

        def visit_FunctionDef(self, node):

            # CG023 - Duplicate Function

            if node.name in functions:

                issues.append({
                    "rule": "CG023",
                    "issue": f"Duplicate Function '{node.name}'",
                    "severity": "Medium",
                    "line": node.lineno,
                    "suggestion": "Rename or remove the duplicate function."
                })

            else:

                functions[node.name] = node.lineno

            # CG021 - Unreachable Code

            found_return = False

            for stmt in node.body:

                if found_return:

                    issues.append({
                        "rule": "CG021",
                        "issue": "Unreachable Code",
                        "severity": "Medium",
                        "line": stmt.lineno,
                        "suggestion": "Code after 'return' will never execute."
                    })

                    break

                if isinstance(stmt, ast.Return):
                    found_return = True

            # CG022 - Mutable Default Argument

            for default in node.args.defaults:

                if isinstance(default, (ast.List, ast.Dict, ast.Set)):

                    issues.append({
                        "rule": "CG022",
                        "issue": "Mutable Default Argument",
                        "severity": "Medium",
                        "line": default.lineno,
                        "suggestion": "Use None as the default value instead of mutable objects."
                    })

            # CG026 - Too Many Arguments

            if len(node.args.args) > 5:

                issues.append({
                    "rule": "CG026",
                    "issue": "Function Has Too Many Arguments",
                    "severity": "Low",
                    "line": node.lineno,
                    "suggestion": "Consider reducing the number of parameters."
                })

            self.generic_visit(node)

        # ==========================================
        # Assert Statement
        # ==========================================

        def visit_Assert(self, node):

            issues.append({
                "rule": "CG024",
                "issue": "Use of assert Statement",
                "severity": "Medium",
                "line": node.lineno,
                "suggestion": "Avoid using assert for runtime validation."
            })

            self.generic_visit(node)

    Visitor().visit(tree)

    # ==========================================
    # CG019 - Unused Imports
    # ==========================================

    for module, line in imports.items():

        if module not in used_names:

            issues.append({
                "rule": "CG019",
                "issue": f"Unused import '{module}'",
                "severity": "Low",
                "line": line,
                "suggestion": f"Remove '{module}' if it is not needed."
            })

    # ==========================================
    # CG020 - Unused Variables
    # ==========================================

    for variable, line in assigned_vars.items():

        if variable not in used_names:

            issues.append({
                "rule": "CG020",
                "issue": f"Unused variable '{variable}'",
                "severity": "Low",
                "line": line,
                "suggestion": f"Remove '{variable}' if it is not used."
            })

    return issues