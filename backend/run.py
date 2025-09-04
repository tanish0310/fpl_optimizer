
# backend/simple_run.py
import os
import sys

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

if __name__ == "__main__":
    # Change to the backend directory
    os.chdir(current_dir)
    
    # Run with uvicorn
    import uvicorn
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=False)

