# config/settings.py

from pydantic_settings import BaseSettings
from pydantic import Field, field_validator, ConfigDict
from typing import List, Union
from functools import lru_cache

class Settings(BaseSettings):
    """
    Application settings configuration using Pydantic Settings.
    Automatically loads from environment variables and .env file.
    """
    
    # Use only model_config (not both model_config and Config class)
    model_config = ConfigDict(
        extra='ignore',
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False
    )
    
    # REQUIRED SETTINGS
    gemini_api_key: str = Field(
        ...,  # Required field
        env="GEMINI_API_KEY",
        description="Google Gemini API key"
    )
    
    # API CONFIGURATION
    secret_key: str = Field(
        default="your-secret-key-change-in-production",
        env="SECRET_KEY",
        description="Secret key for JWT tokens"
    )
    
    environment: str = Field(
        default="development",
        env="ENVIRONMENT",
        description="Environment (development, staging, production)"
    )
    
    # Fix CORS origins handling
    cors_origins: Union[List[str], str] = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        env="CORS_ORIGINS",
        description="Allowed CORS origins (comma-separated string or list)"
    )
    
    # GEMINI CONFIGURATION
    gemini_model: str = Field(
        default="gemini-2.0-flash-exp",
        env="GEMINI_MODEL",
        description="Gemini model to use"
    )
    
    max_tokens: int = Field(
        default=4096,
        env="MAX_TOKENS",
        description="Maximum tokens for generation"
    )
    
    temperature: float = Field(
        default=0.7,
        env="TEMPERATURE",
        description="Temperature for generation (0.0-2.0)"
    )
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            # Split comma-separated string into list
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Global settings instance
settings = get_settings()
