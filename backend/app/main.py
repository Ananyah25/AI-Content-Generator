# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import content
from config.settings import settings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Content Generator API", version="1.0.0")

# CORS middleware using settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # Use the parsed list from settings
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(content.router, prefix="/api/content", tags=["content"])

@app.get("/")
async def root():
    return {"message": "Content Generator API is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.environment,
        "api_version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
