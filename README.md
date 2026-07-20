# CodeGuard AI

## Overview

CodeGuard AI is a full-stack static code analysis platform designed to help developers identify security vulnerabilities and code quality issues in Python applications. It combines a modern React frontend with a FastAPI backend to perform static analysis, generate security scores, classify vulnerabilities by severity, and produce professional audit reports.

The platform provides an intuitive browser-based development experience through an integrated Monaco Editor while delivering detailed analysis results and downloadable PDF reports.

---

## Features

- Monaco-powered code editor
- Write, paste, upload, or drag-and-drop Python files
- Static code analysis using 26 security and quality rules
- AST-based analysis for advanced code inspection
- Security score and letter grade generation
- Severity-wise issue classification
- Detailed findings dashboard with recommendations
- Professional downloadable PDF audit reports
- Scan history
- Responsive user interface
- Dark IDE-inspired design
- FastAPI-powered backend
- React + Vite frontend

---

## Static Analysis Capabilities

CodeGuard AI performs analysis for:

- Hardcoded credentials
- Unsafe deserialization
- Mutable default arguments
- Bare exception handling
- Duplicate function definitions
- Unreachable code
- Unused imports
- Unused variables
- Infinite loops
- Weak coding practices
- General code quality issues

The analysis combines pattern-based rule checking with Python Abstract Syntax Tree (AST) inspection for improved accuracy.

---

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Monaco Editor
- Framer Motion
- jsPDF
- jspdf-autotable
- Lucide React

### Backend

- FastAPI
- Python
- Uvicorn
- Python AST Module

---

## Project Structure

```text
CodeGuard-AI
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── utils
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend
│   ├── main.py
│   ├── analyzer.py
│   ├── rules.py
│   ├── ast_rules.py
│   ├── requirements.txt
│   └── ...
│
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/Ritish363/codeguard-ai.git

cd codeguard-ai
```

---

### Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend will run at:

```
http://127.0.0.1:8000
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file inside the `frontend` directory.

```env
VITE_API_URL=http://127.0.0.1:8000
```

For production deployment, replace the value with the deployed backend URL.

---

## Usage

1. Launch both frontend and backend.
2. Enter or upload a Python source file.
3. Click **Analyze Code**.
4. Review the generated security score, grade, and detected issues.
5. Generate and download the audit report.

---

## Screenshots

Screenshots will be added after deployment.

- Home Page
- Code Workspace
- Analysis Dashboard
- Audit Report

---

## Deployment

### Frontend

Vercel

### Backend

Render

---

## Future Enhancements

- Support for additional programming languages
- AI-powered code fix suggestions
- GitHub repository scanning
- User authentication
- Persistent cloud-based scan history
- Database integration
- Docker deployment
- CI/CD pipeline

---

## Author

**Ritish Oswal**

B.Tech – Artificial Intelligence & Data Science

GitHub: https://github.com/Ritish363

---

## License

This project is intended for educational, portfolio, and demonstration purposes.

## Live Demo

Frontend:
https://codeguard-ai-umber.vercel.app

Backend API:
https://codeguard-ai-backend-iy6j.onrender.com

---

#Note:
The backend is hosted on Render Free Tier.
The first request after inactivity may take around 30–60 seconds.
