# backend/app/models/local_model.py
import torch
import os
from transformers import AutoTokenizer, AutoModelForCausalLM
from .base_model import BaseModel

class Local20KModel(BaseModel):
    def __init__(self, model_path: str = "models/content-generator-20k"):
        self.model_path = model_path
        self.model = None
        self.tokenizer = None
        self.is_loaded = False
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
    async def load_model(self):
        """Load your 20k model"""
        try:
            print(f"🔄 Loading 20K model from {self.model_path}...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None,
                low_cpu_mem_usage=True
            )
            self.is_loaded = True
            print(f"✅ 20K model loaded successfully on {self.device}")
        except Exception as e:
            print(f"❌ 20K model failed to load: {e}")
            self.is_loaded = False
    
    async def generate_content(self, prompt: str) -> str:
        """Generate with your 20K model"""
        if not self.is_loaded:
            await self.load_model()
            
        if not self.is_loaded:
            raise Exception("20K model not available")
            
        try:
            # Format prompt for your model
            formatted_prompt = f"Generate content: {prompt}\n\nOutput:"
            
            inputs = self.tokenizer.encode(formatted_prompt, return_tensors="pt").to(self.device)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_length=len(inputs[0]) + 150,
                    num_return_sequences=1,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.1,
                    top_p=0.9
                )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            response = response.replace(formatted_prompt, "").strip()
            
            return response
            
        except Exception as e:
            raise Exception(f"20K model generation failed: {e}")
    
    def is_available(self) -> bool:
        return self.is_loaded and os.path.exists(self.model_path)
    
    def get_model_name(self) -> str:
        return "Local 20K Model"
