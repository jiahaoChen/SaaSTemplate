#!/usr/bin/env python3
"""
Development server script for the FastAPI backend.
Runs the server on port 8001 to avoid conflicts with the frontend on port 8000.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 