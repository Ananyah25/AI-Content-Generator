# backend/app/models/base_model.py
from abc import ABC, abstractmethod
from typing import AsyncGenerator

class BaseModel(ABC):
    """Base interface for all AI models"""
    
    @abstractmethod
    async def generate_content(self, prompt: str) -> str:
        """Generate content"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if model is ready"""
        pass
    
    @abstractmethod
    def get_model_name(self) -> str:
        """Get model name"""
        pass
