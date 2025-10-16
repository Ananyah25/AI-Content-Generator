# app/schemas.py
from pydantic import BaseModel, Field, validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

# Request Models
class ChatRequest(BaseModel):
    """Chat request model with validation"""
    message: str = Field(..., min_length=1, max_length=10000, description="User message")
    conversation_id: Optional[UUID] = Field(None, description="Existing conversation ID")
    stream: Optional[bool] = Field(True, description="Enable streaming response")
    content_type: Optional[str] = Field("general", description="Type of content to generate")

    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty or just whitespace')
        return v.strip()

    @validator('content_type')
    def validate_content_type(cls, v):
        allowed_types = ['blog', 'social', 'ideas', 'email', 'general']
        if v not in allowed_types:
            raise ValueError(f'Content type must be one of: {", ".join(allowed_types)}')
        return v

class QuickGenerateRequest(BaseModel):
    """Quick generation request"""
    prompt: str = Field(..., min_length=1, max_length=5000, description="Generation prompt")
    content_type: str = Field("general", description="Type of content")
    max_length: Optional[int] = Field(None, ge=10, le=5000, description="Maximum response length")

    @validator('prompt')
    def validate_prompt(cls, v):
        if not v.strip():
            raise ValueError('Prompt cannot be empty')
        return v.strip()

class ConversationCreateRequest(BaseModel):
    """Create new conversation request"""
    title: Optional[str] = Field(None, max_length=255, description="Conversation title")
    initial_message: Optional[str] = Field(None, max_length=10000, description="First message")

class ConversationUpdateRequest(BaseModel):
    """Update conversation request"""
    title: Optional[str] = Field(None, max_length=255, description="New title")
    is_archived: Optional[bool] = Field(None, description="Archive status")

# Response Models
class BaseResponse(BaseModel):
    """Base response model"""
    model_config = ConfigDict(from_attributes=True)

class MessageResponse(BaseResponse):
    """Message response model"""
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = {}

class ConversationResponse(BaseResponse):
    """Conversation response model"""
    id: UUID
    title: str
    user_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_archived: bool
    message_count: Optional[int] = 0
    last_message: Optional[str] = None

class ConversationDetailResponse(ConversationResponse):
    """Detailed conversation response with messages"""
    messages: List[MessageResponse] = []

class ConversationListResponse(BaseModel):
    """List of conversations response"""
    conversations: List[ConversationResponse]
    total_count: int
    has_more: bool = False

class ChatStreamResponse(BaseModel):
    """Streaming chat response chunk"""
    type: str  # 'start', 'chunk', 'end', 'error'
    content: str
    conversation_id: Optional[UUID] = None
    message_id: Optional[UUID] = None
    metadata: Optional[Dict[str, Any]] = {}

class QuickGenerateResponse(BaseModel):
    """Quick generation response"""
    # Fix the protected namespace warning
    model_config = ConfigDict(protected_namespaces=())
    
    content: str
    content_type: str
    generation_time: Optional[float] = None
    model_used: str
    token_count: Optional[int] = None
    metadata: Dict[str, Any] = {}

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: datetime
    version: str
    service: str
    database_status: Optional[str] = "unknown"
    ai_service_status: Optional[str] = "unknown"

class ErrorResponse(BaseModel):
    """Error response model"""
    error: Dict[str, Any]

class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None

# Pagination Models
class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")
    search: Optional[str] = Field(None, max_length=255, description="Search query")
    sort_by: Optional[str] = Field("created_at", description="Sort field")
    # FIXED: Changed regex to pattern for Pydantic v2
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$", description="Sort order")
