# GridSense AI: Grid Stability Risk Predictor for Renewable Energy Integration

> **Academic Prototype & Proof of Concept**  
> An intelligent decision-support platform designed to predict and visualize power system stability risks under dynamic renewable energy penetration, fluctuating load demand, and rapid ramping events.

---

## 1. Executive Summary & Problem Statement

As electrical grids integrate high shares of non-synchronous **Inverter-Based Resources (IBRs)** like solar photovoltaic (PV) arrays and wind turbine generators, conventional synchronous thermal units are displaced. This leads to:
1. **System Rotational Inertia Deficit**: Steeper Rate of Change of Frequency (ROCOF) and higher risk of Under-Frequency Load Shedding (UFLS).
2. **Net Load Ramping Stress (The "Duck Curve")**: Rapid drops in solar generation during evening demand peaks.
3. **Localized Voltage Volatility & Reactive Power Deficits**: Transmission voltage sags or overvoltage trips without dynamic VAR support.

**GridSense AI** solves this by providing:
- Predictive stability risk scoring ($0.00 - 1.00$) categorized into operational risk levels (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).
- Real-time multi-channel grid telemetry monitoring.
- Automated threshold alarm generation.
- Grounded power-systems technical knowledge assistance via a Retrieval-Augmented Generation (RAG) architecture citing IEEE/NERC standards.

---

## 2. System Architecture

```mermaid
graph TD
    subgraph Client ["Frontend Layer (Next.js 15 / React / Tailwind / TypeScript)"]
        UI["GridSense Web UI (Desktop/Tablet Optimized)"]
        Dashboard["Overview Dashboard"]
        PredictForm["Stability Prediction View"]
        Monitoring["Detailed Grid Telemetry View"]
        History["Prediction History & Scenario Inspector"]
        AlertsView["Alerts Management Center"]
        RagChat["AI Knowledge Assistant Chat"]
        ModelView["Model Architecture & Transparency"]
    end

    subgraph API ["Backend API Gateway (Node.js / Express.js)"]
        Server["Express Server (:4000)"]
        SecMiddleware["Security Perimeter (Helmet.js, CORS, Zod Validation)"]
        Routes["API Routes (/predictions, /grid, /alerts, /assistant, /model)"]
        AlertEngine["Alerts & Risk Rule Engine"]
        StorageAdapter["Database Repository Pattern (PostgreSQL / In-Memory Fallback)"]
    end

    subgraph MLService ["Machine Learning Service (Python FastAPI / Scikit-learn :8000)"]
        MLApp["FastAPI Service (/predict, /health, /features)"]
        Preprocessor["Feature Engineering (Inertia Index, ROCOF Proxy, Net Demand)"]
        MLModel["Trained Scikit-Learn Model / Physics Baseline Ensemble"]
    end

    subgraph RAGService ["AI Knowledge & Explanation Service (RAG Engine :8001 / Embedded)"]
        RAGApp["RAG Service (/query, /documents)"]
        DocCorpus["Curated Power Systems Docs (IEEE 1547, NERC PRC, Inverter Dynamics)"]
        Retriever["Vector / TF-IDF Context Retriever"]
        LLMBridge["LLM Integration Extension Point (Gemini / OpenAI / Grounded Fallback)"]
    end

    subgraph DataStore ["Persistence Layer"]
        PG[("PostgreSQL Database (gridsense_db)")]
        InMemoryStore[("In-Memory Repository (Out-of-the-Box Fallback)")]
    end

    UI --> Server
    Server --> SecMiddleware
    SecMiddleware --> Routes
    Routes --> AlertEngine
    Routes --> StorageAdapter
    StorageAdapter -.->|If DATABASE_URL set| PG
    StorageAdapter -.->|Local default| InMemoryStore

    Routes -->|HTTP JSON /predict| MLApp
    MLApp --> Preprocessor --> MLModel

    Routes -->|HTTP JSON /query| RAGApp
    RAGApp --> DocCorpus --> Retriever --> LLMBridge
```

---

## 3. Technology Responsibility Matrix

| Layer | Technology | Primary Responsibility | Why It Exists in this Layer |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 15, React, Tailwind CSS, TypeScript, Recharts | User interface, responsive dark-mode energy console, interactive charts, reactive prediction forms. | Delivers modern operator-grade telemetry visualizations and type-safe state management. |
| **Backend Gateway** | Node.js, Express.js | Central API hub, routing, orchestration, business logic, persistence mediation. | Decouples the client UI from database connections and microservice internals. |
| **Security** | Helmet.js, CORS, Zod | HTTP security headers (`HSTS`, `XSS-Protection`, `CSP`), cross-origin policies, and strict runtime parameter validation. | Secures the perimeter and rejects physically impossible electrical values before ML ingestion. |
| **Persistence** | PostgreSQL & Repository Pattern | Structured relational storage for scenarios, predictions, alerts, audit trails, and chat turns. | Uses the Repository Pattern so the prototype runs out-of-the-box with an in-memory store if PostgreSQL is not installed locally. |
| **Machine Learning** | Python, FastAPI, Scikit-learn, Pandas, NumPy | Feature engineering (inertia proxy, net demand), Scikit-learn Random Forest regression, physics sensitivities. | Python is the scientific computing standard for electrical and ML modeling. Keeping it isolated enables independent model retraining. |
| **Domain RAG** | LangChain / Python RAG service & Embedded Retriever | Semantic chunk retrieval over curated technical literature (IEEE 1547, NERC standards, Duck Curve). | Answers operator inquiries with verified engineering literature and document citations rather than generic chatbot hallucinations. |

---

## 4. Port Allocations & Microservices

| Service | Port | Default URL | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `3000` | `http://localhost:3000` | Next.js operator analytics dashboard |
| **Backend API Gateway** | `4000` | `http://localhost:4000/api` | Express REST API & security perimeter |
| **Python ML Service** | `8000` | `http://127.0.0.1:8000` | FastAPI Scikit-learn prediction engine |
| **RAG Knowledge Service**| `8001` | `http://127.0.0.1:8001` | FastAPI domain retrieval microservice |
| **PostgreSQL (Optional)**| `5432` | `localhost:5432` | PostgreSQL database (`gridsense_db`) |

---

## 5. Quick Start (Zero-Dependency Mode)

The prototype features a resilient **Zero-Dependency Fallback Mode**: if PostgreSQL or Python are not currently running, the Express backend automatically uses an internal physics-guided calculation engine and in-memory persistence.

### Step 1: Start the Backend Gateway
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:4000
```

### Step 2: Start the Python ML Service (Optional but Recommended)
```bash
cd ml-service
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --port 8000 --host 127.0.0.1
# Running on http://127.0.0.1:8000
```

### Step 3: Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

---

## 6. Faculty / Reviewer Demonstration Flow

Follow this exact sequence to demonstrate the platform to project reviewers or recruiters:

1. **Open Overview Dashboard (`http://localhost:3000`)**:
   - Point out the **Overall Grid Stability** card, **Renewable Penetration (62%)**, and **Frequency (49.92 Hz)**.
   - Show the **24-Hour Grid Stability Trend** area chart and the **Renewable vs. Load** Duck Curve chart.
   - Highlight the **Active Alerts** preview box.

2. **Navigate to Stability Prediction**:
   - Explain the input parameters (Solar MW, Wind MW, Load Demand MW, Frequency Hz, Bus Voltage pu, Ramp Rate %/interval).
   - Click the preset button: **"Midday Duck Curve (High Solar)"**.
   - Point out how penetration rises to >100% with negative net demand.
   - Click the large **[PREDICT STABILITY RISK]** button.
   - Review the result card:
     - Computed Instability Risk Score (e.g., $98.0\%$).
     - Risk Level badge (`CRITICAL RISK`).
     - Key contributing factors breakdown (Frequency deviation, Renewable penetration, Ramp stress).
     - Recommended Operator Interpretation advisory.
     - Automated system alarms dispatched.

3. **Inspect Prediction History**:
   - Navigate to **Prediction History**.
   - Show that the newly evaluated scenario is logged at the top of the table.
   - Demonstrate the search box, risk filter buttons (`CRITICAL`, `HIGH`, `MODERATE`, `LOW`), and sorting.
   - Click **Inspect** on any row to open the modal examining full electrical operating parameters.

4. **Review and Acknowledge Alerts**:
   - Navigate to **Alerts**.
   - Filter by `CRITICAL` or `OPEN`.
   - Click **Acknowledge** or **Resolve** on an alert; show how the status and badge update in real time.

5. **Engage the AI Knowledge Assistant (RAG)**:
   - Navigate to **AI Assistant**.
   - Click the prompt chip: *"Why does renewable penetration affect grid stability?"*.
   - Point out that the answer is grounded in the indexed power-systems corpus (IEEE 1547 and NERC standards).
   - Click one of the source badges (e.g. `[Grid Stability Mitigation: 63%]`) to open the **Grounding Document Drawer** displaying the exact technical excerpt.

6. **Examine Model Transparency & Diagnostics**:
   - Navigate to **Model Information** to review the input feature definitions, engineered physics formulas, and decision boundaries.
   - Navigate to **Settings** to show the live microservices health pings (`API: OK`, `ML: ACTIVE`, `STORAGE: OK`).

---

## 7. PostgreSQL Setup (Optional Production Mode)

If you wish to run with a live PostgreSQL database:
1. Ensure PostgreSQL is running on port 5432.
2. Create database: `CREATE DATABASE gridsense_db;`
3. Execute schema: `psql -U postgres -d gridsense_db -f db/schema.sql`
4. Execute seeds: `psql -U postgres -d gridsense_db -f db/seed.sql`
5. Set `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/gridsense_db
   ```
6. Restart the backend gateway. It will automatically detect PostgreSQL and log:
   `[Storage] Successfully connected to PostgreSQL instance.`

---

## 8. Academic Integrity & Scientific Disclaimer

This application is an educational prototype and proof-of-concept developed for academic demonstration. The numerical predictions and stability thresholds are modeled using synthetic distributions derived from IEEE transmission topologies. They are not calibrated for real-world transmission system control rooms. All mock/demo data is explicitly designated as such in the source code and user interface.
#   G R I D S E N S E - A I -  
 