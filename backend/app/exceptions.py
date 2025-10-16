# app/exceptions.py
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
import logging
from datetime import datetime
import traceback

logger = logging.getLogger(__name__)

# Custom Exception Classes
class ContentGeneratorException(Exception):
    """Base exception for the Content Generator application"""
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class AIServiceException(ContentGeneratorException):
    """Exception raised when AI service fails"""
    pass

class DatabaseException(ContentGeneratorException):
    """Exception raised for database operations"""
    pass

class ValidationException(ContentGeneratorException):
    """Exception raised for input validation errors"""
    pass

class RateLimitException(ContentGeneratorException):
    """Exception raised when rate limit is exceeded"""
    pass

# Exception Handlers
async def ai_service_exception_handler(request: Request, exc: AIServiceException):
    """Handle AI service specific exceptions"""
    logger.error(f"AI Service error: {exc.message}")
    
    return JSONResponse(
        status_code=503,
        content={
            "error": {
                "message": "AI service temporarily unavailable. Please try again in a moment.",
                "error_code": exc.error_code or "AI_SERVICE_ERROR",
                "timestamp": datetime.utcnow().isoformat(),
                "type": "service_error"
            }
        }
    )

async def database_exception_handler(request: Request, exc: DatabaseException):
    """Handle database exceptions"""
    logger.error(f"Database error: {exc.message}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "message": "Database operation failed. Please try again.",
                "error_code": exc.error_code or "DATABASE_ERROR",
                "timestamp": datetime.utcnow().isoformat(),
                "type": "database_error"
            }
        }
    )

async def validation_exception_handler(request: Request, exc: ValidationException):
    """Handle validation exceptions"""
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "message": exc.message,
                "error_code": exc.error_code or "VALIDATION_ERROR",
                "timestamp": datetime.utcnow().isoformat(),
                "type": "validation_error"
            }
        }
    )

async def rate_limit_exception_handler(request: Request, exc: RateLimitException):
    """Handle rate limiting exceptions"""
    return JSONResponse(
        status_code=429,
        content={
            "error": {
                "message": "Rate limit exceeded. Please wait before sending another message.",
                "error_code": "RATE_LIMIT_EXCEEDED",
                "timestamp": datetime.utcnow().isoformat(),
                "type": "rate_limit_error",
                "retry_after": 60
            }
        }
    )

async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected error: {str(exc)}", extra={
        "traceback": traceback.format_exc(),
        "path": request.url.path,
        "method": request.method
    })
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "message": "An unexpected error occurred. Please try again.",
                "error_code": "INTERNAL_SERVER_ERROR",
                "timestamp": datetime.utcnow().isoformat(),
                "type": "server_error"
            }
        }
    )
