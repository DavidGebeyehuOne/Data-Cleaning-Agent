# Data Cleaning Agent

A Next.js based Data Cleaning Agent that uses Python (Pandas) and LLMs (OpenAI) to profile, plan, and clean datasets.

## Features
- **File Upload**: CSV, Excel, Parquet.
- **Profiling**: Automated data quality checks (missing, duplicates, outliers).
- **Agentic Planning**: LLM-generated cleaning plans (impute, drop, normalize, etc).
- **Execution**: Python-backed robust data processing.
- **Reporting**: Full change logs and cleaned file downloads.

## Prerequisites
- Node.js
- Python 3.8+
- OpenAI API Key (optional, falls back to heuristics)

## Setup

1. **Backend Setup**
   Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Frontend Setup**
   Install Node dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in `frontend/` with:
   ```
   OPENAI_API_KEY=sk-...
   ```

## Running

1. Start the Next.js dev server:
   ```bash
   cd frontend
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000)

## Architecture
- `frontend/`: Next.js App Router UI and API Routes.
- `backend/scripts/`: Python scripts for heavy data lifting (`profile_data.py`, `clean_data.py`).
- `storage/`: Local storage for raw and cleaned files.
