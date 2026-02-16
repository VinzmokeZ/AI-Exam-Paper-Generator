# Setup Guide - AI Exam Oracle

## Prerequisites
1. **Python 3.9+**: [Download](https://www.python.org/downloads/)
2. **Node.js 18+**: [Download](https://nodejs.org/)
3. **Firebase CLI** (for deployment): `npm install -g firebase-tools`

## Installation

1. **One-Click Setup**:
   Run `setup.bat` in the root folder.
   This script will:
   - Check tool versions.
   - Install Python dependencies (FastAPI, SQLAlchemy, RAG libs).
   - Install React dependencies.
   - Initialize the local database.

2. **Model Setup**:
   Run `run_model.bat` to prepare the local AI model.
   - *Note:* Ensure you have at least 8GB RAM for local model inference.

## Launching

1. **Local Development**:
   Run `run_local.bat`.
   - Backend will start at [http://localhost:8000](http://localhost:8000)
   - Frontend will start at [http://localhost:3000](http://localhost:3000)
   - Browser will open automatically.

## Troubleshooting
- **Port Conflict:** If 3000 or 8000 is occupied, edit `run_local.bat`.
- **Module Not Found:** Re-run `setup.bat`.
