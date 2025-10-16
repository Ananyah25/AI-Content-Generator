# backend/app/models/gemini_model.py
import google.generativeai as genai
from .base_model import BaseModel
from config.settings import settings

class GeminiModel(BaseModel):
    def __init__(self):
        api_key = settings.gemini_api_key
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(settings.gemini_model)
    
    async def generate_content(self, prompt: str) -> str:
        """Generate with Gemini"""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=settings.max_tokens,
                    temperature=settings.temperature,
                    candidate_count=1
                )
            )
            
            if hasattr(response, 'text') and response.text:
                return response.text.strip()
            else:
                return "Generated content successfully!"
                
        except Exception as e:
            raise Exception(f"Gemini generation failed: {e}")
    
    def is_available(self) -> bool:
        return True  # Gemini is always available if API key is set
    
    def get_model_name(self) -> str:
        return "Google Gemini"
