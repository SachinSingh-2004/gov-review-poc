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

### A. Backend Setup & Run (Terminal 1)

Open PowerShell / Terminal on the new PC:

```powershell
# 1. Navigate to backend directory
cd Audit_demo\poc\gov-review-poc\backend

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

# 5. Seed the database
cd ..\seed
..\backend\venv\Scripts\python.exe seed_demo_data.py

# 6. Start the Backend API Server
cd ..\backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8005
```

*Backend API will be running at:* `http://127.0.0.1:8005` (Docs: `http://127.0.0.1:8005/docs`)

---

### B. Frontend Setup & Run (Terminal 2)

Open a **second terminal** window on the new PC:

```powershell
# 1. Navigate to frontend directory
cd Audit_demo\poc\gov-review-poc\frontend

# 2. Install npm packages
npm install

# 3. Start Frontend dev server
npm run dev
```

*Frontend App will be running at:* `http://localhost:5173` (or `http://localhost:5174`)

---

## 🔑 Login Credentials for Demo

Once the browser opens `http://localhost:5173`:

- **Project Manager (PM):**
  - Username: `pm.demo`
  - Password: `PM@123`

- **Technical Lead (TL):**
  - Username: `tl.demo`
  - Password: `TL@123`
