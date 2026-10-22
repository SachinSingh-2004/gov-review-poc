# Guide: Sharing & Running Governance Review POC on Another PC

Follow these steps to transfer this project to another computer and run it smoothly.

---

## 📋 Prerequisites on New PC

Make sure the target PC has:
1. **Python 3.10+** (Download from [python.org](https://www.python.org/downloads/))
2. **Node.js 18+** & **npm** (Download from [nodejs.org](https://nodejs.org/))
3. **Git** (Optional, if using GitHub/GitLab)

---

## 📦 Step 1: Copying / Sharing the Source Code

### Option A: Using ZIP File (USB / Drive / Email)
1. Compress the project folder into a ZIP file.
2. ⚠️ **IMPORTANT — Exclude these folders when zipping** (to save speed & space):
   - `node_modules/`
   - `venv/` or `.venv/`
   - `__pycache__/`
   - `.pytest_cache/`
   - `dist/` / `build/`
3. Copy the ZIP file to the new PC and extract it.

### Option B: Using Git / GitHub (Recommended)
1. Push your repository to GitHub/GitLab:
   ```bash
   git init
   git add .
   git commit -m "Governance Review POC ready"
   git push origin main
   ```
2. On the new PC, clone the repository:
   ```bash
   git clone <YOUR_REPO_URL>
   ```

---

## 🚀 Step 2: Setup & Run on New PC

### A. Full Backend Setup & Run (Terminal 1)

Open PowerShell / Terminal on the new PC:

```powershell
# 1. Navigate to main backend directory
cd Audit_demo\backend

# 2. Create Python virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Initialize the central SQLite/MySQL database
cd ..\database
..\backend\venv\Scripts\python.exe init_db.py

# 6. Start the Full Backend API Server (Port 8000)
cd ..\backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

*Full Backend API will be running at:* `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`)

---

### B. Full Frontend Setup & Run (Terminal 2)

Open a **second terminal** window on the new PC:

```powershell
# 1. Navigate to root or frontend directory
cd Audit_demo

# 2. Install dependencies & start
npm run dev
# OR:
# cd frontend
# npm install
# npm run dev
```

*Full Frontend Portal will open at:* `http://localhost:5173`

---

## 🔑 Demo Personas & Roles

In the top navigation bar, use the **Persona Switcher** to seamlessly switch between full roles with active RBAC permissions:

- **System Administrator (ADMIN):** Full permissions, administration, system audit logs (`admin`)
- **Independent Auditor (AUDITOR):** Conducts audits, logs findings (`auditor_jane`)
- **Audit Manager (AUDIT_MANAGER):** Approves audits, assigns actions (`audit_mgr_mark`)
- **Project Lead (PROJECT_OWNER):** Manages project compliance, risks, and milestones (`proj_owner_sarah`)
- **Action Owner (ACTION_OWNER):** Executes corrective remediations & uploads evidence (`action_owner_alex`)
- **Executive Board VP (EXECUTIVE):** Executive review, governance health score, board reports (`executive_david`)
- **Compliance Viewer (VIEWER):** Read-only governance analytics (`viewer_sam`)

---

## 🌐 Cloud Deployment (Vercel)

The full functionalities frontend is configured for instant Vercel deployment:
- **Root Directory in Vercel:** Supported as `./` (Root), `frontend`, or `poc/gov-review-poc/frontend`.
- **API Rewrites:** Automated via `vercel.json` routing `/api/*` to the production backend.

