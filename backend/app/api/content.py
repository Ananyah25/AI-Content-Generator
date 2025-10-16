# app/api/content.py

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json
import asyncio

from app.services.content_service import ContentService

router = APIRouter()
content_service = ContentService()

class ChatRequest(BaseModel):
    message: str
    stream: Optional[bool] = True

class QuickRequest(BaseModel):
    prompt: str

class ContentResponse(BaseModel):
    success: bool
    content: str
    message: str

@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Main chat endpoint with streaming support"""
    try:
        if request.stream:
            async def generate():
                yield "data: " + json.dumps({"type": "start", "content": ""}) + "\n\n"
                
                async for chunk in content_service.generate_streaming_content(request.message):
                    data = {"type": "chunk", "content": chunk}
                    yield "data: " + json.dumps(data) + "\n\n"
                    await asyncio.sleep(0.01)
                
                yield "data: " + json.dumps({"type": "end", "content": ""}) + "\n\n"
            
            return StreamingResponse(
                generate(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive"
                }
            )
        else:
            result = await content_service.generate_quick_response(request.message)
            return ContentResponse(
                success=True,
                content=result,
                message="Content generated successfully"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.post("/quick", response_model=ContentResponse)
async def quick_generate(request: QuickRequest):
    """Quick generation endpoint"""
    try:
        result = await content_service.generate_quick_response(request.prompt)
        return ContentResponse(
            success=True,
            content=result,
            message="Content generated successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Content Generator"}
