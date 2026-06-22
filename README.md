# AI Feedback Intelligence Platform

A production-grade, asynchronous customer feedback analytics dashboard and automated triaging service. 

This platform enables teams to ingest customer reviews via CSV logs, categorize issues, detect sentiments, check processing latency, audit system health, and generate drafts of support email replies automatically using **Gemini 2.5/2.0/3.5** models.

---

## Key Features

- **Asynchronous Ingestion Pipeline**: Ingest thousands of reviews via CSV. FastAPI uses asynchronous `BackgroundTasks` to parse, store, and process records without blocking the request-response thread loop.
- **AI-Powered Insights**: Auto-classifies sentiment (`Positive`, `Neutral`, `Negative`) and tags categories (`Bug`, `Feature Request`, `Billing`, `Customer Support`, `Other`).
- **AI-Generated Support Drafts**: Gemini automatically drafts a professional customer support email reply tailored to the feedback's rating and topic.
- **Fail-Safe Heuristic Engine**: Resilient fallback rules capture rate-limit errors (e.g., HTTP `429` on Gemini's free tier) and execute local keyword-based classifications, guaranteeing 100% app uptime.
- **Active DevOps Health Probes**: A dedicated `/health` endpoint executes an active database connection check (`SELECT 1`) to signal container health status to load balancers.
- **SLA Performance Monitoring**: Custom ASGI middleware benchmarks request execution speeds down to the microsecond and injects the duration into the `X-Response-Time` HTTP response header.
- **Flat Pastel Interface**: A clean, minimalist light dashboard styled with Montserrat typography, thin block borders, and strictly no shadows or gradients. Includes inline collapsible drawers to copy support drafts.

---

## Tech Stack

- **Backend**: Python 3.11, FastAPI, SQLAlchemy ORM, PostgreSQL (psycopg2)
- **Frontend**: React (Vite), Tailwind CSS v3, Chart.js, Lucide Icons
- **AI Engine**: Google Gemini API SDK (`google-generativeai`)
- **Deployment**: Docker, Docker Compose, Nginx

---

## Project Structure

```text
multisource-feedback/
├── backend/
│   ├── app/
│   │   ├── config.py           # Configuration schema (Pydantic Settings)
│   │   ├── database.py         # SQLAlchemy engine, session yielding, and SQLite check bypass
│   │   ├── models.py           # Database models (feedbacks table columns)
│   │   ├── schemas.py          # Data serialization & validation schemas (Pydantic)
│   │   ├── crud.py             # Database operations & SQL aggregates
│   │   ├── ai.py               # Gemini client & heuristic fallback models
│   │   └── routers/
│   │       ├── feedback.py     # Ingest CSVs, query rows, and trigger async workers
│   │       └── analytics.py    # Aggregate queries for charts
│   │   └── main.py             # ASGI middleware, startup creation, CORS, and health probes
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx   # Accordion data grid, pastel charts, filters
│   │   │   ├── FileUpload.jsx  # Drag-and-drop CSV parser & alerts
│   │   │   └── StatsCard.jsx   # Metrics indicators
│   │   ├── App.jsx             # Flat navbar header & app shell
│   │   ├── index.css           # Global typography & light theme variables
│   │   └── main.jsx
│   ├── index.html              # Meta descriptions & Google Fonts Montserrat imports
│   ├── tailwind.config.js      # Pruning configuration
│   └── Dockerfile              # Multi-stage production build (Node 20 + Nginx)
├── docker-compose.yml          # Orchestrates db, backend, and frontend
└── sample_feedback.csv         # Local test dataset
```

---

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

---

### Running the Platform (Docker Compose)

1. Clone or navigate to the project directory:
   ```bash
   cd multisource-feedback
   ```

2. Create a `.env` file and insert your Gemini API Key and desired model configuration:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   ```
   *Note: If no API key is specified, the system will use local heuristic fallbacks.*

3. Spin up the orchestrator containers:
   ```bash
   docker compose up -d --build
   ```
   *(If your machine has cached base images and you encounter connection errors checking Docker Hub, run: `docker compose up -d --build --pull=never`)*

4. Access the platforms:
   - **Interactive Web UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API Server**: [http://localhost:8000](http://localhost:8000)
   - **Swagger Interactive Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Operational Health Probe**: [http://localhost:8000/health](http://localhost:8000/health)

---

## Verifying Technical Advancements

### 1. Performance Latency Headers
- Open your browser's Developer Tools (F12) -> **Network Tab**.
- Click **"Refresh Data"** on the dashboard.
- Select the `summary` API call and view the **Response Headers**.
- Check the custom header:
  `X-Response-Time: 14.25ms`

### 2. Operational Health Probe
- Navigate to `http://localhost:8000/health`.
- The backend will ping the PostgreSQL container and return:
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "gemini_api_key_configured": true,
    "model_configured": "gemini-2.5-flash"
  }
  ```

---

## Running Locally (Without Docker)

To run the application locally for quick debugging using **SQLite**:

1. **Configure local SQLite**: Update your `.env` file:
   ```env
   DATABASE_URL=sqlite:///./feedback.db
   ```

2. **Boot the Backend**:
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. **Boot the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173).
# Multi-Source Feedback Intelligence System
## Installation

```sh
pip install -r requirements.txt
```
