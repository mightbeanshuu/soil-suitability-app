# Soil Suitability Application

A real-time full-stack web application that combines local sensor data (N, P, K, pH) with datasets to evaluate soil suitability for different crops and provide remediations.

## Prerequisites
- Node.js (v18 or higher)
- Python 3.9+
- Git

## Getting Started

### 1. Start the Backend

Open a terminal and run the following commands:

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install the required Python packages
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will run at `http://localhost:8000`.

### 2. Start the Frontend

Open a new terminal and run the following commands:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will start and usually be accessible at `http://localhost:5173`.
