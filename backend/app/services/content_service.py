# app/services/content_service.py

import google.generativeai as genai
import re
import os
from typing import Dict, List, AsyncGenerator
import json
from config.settings import settings

class ContentService:
    def __init__(self):
        # Initialize Gemini (existing setup - keep this working)
        api_key = settings.gemini_api_key
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(settings.gemini_model)
        
        # Try to load 20K model (optional - won't break if it fails)
        self.local_model = None
        self.local_tokenizer = None
        self.local_model_available = False
        
        try:
            model_path = os.getenv("LOCAL_MODEL_PATH", "models/content-generator-20k")
            if os.path.exists(model_path):
                print(f"ℹ️ 20K model found at {model_path}")
                # Try to import and load
                import torch
                from transformers import AutoTokenizer, AutoModelForCausalLM
                
                print(f"🔄 Loading 20K model...")
                self.local_tokenizer = AutoTokenizer.from_pretrained(model_path)
                self.local_model = AutoModelForCausalLM.from_pretrained(model_path)
                self.local_model_available = True
                print(f"✅ 20K model loaded successfully")
            else:
                print(f"ℹ️ 20K model not found at {model_path}")
        except Exception as e:
            print(f"ℹ️ 20K model not loaded: {e}")
            self.local_model_available = False

    def detect_length_requirement(self, prompt: str) -> dict:
        """Detect specific length requirements"""
        prompt_lower = prompt.lower()
        
        # Line-based requirements
        line_patterns = [
            r'(?:in |write |create |generate |make )?(?:exactly )?(?:just )?(?:only )?(\d+) lines?',
            r'(?:in |write |create |generate |make )?(one|two|three|four|five|six|seven|eight|nine|ten) lines?',
            r'(\d+)[-\s]line',
            r'(one|two|three|four|five|six|seven|eight|nine|ten)[-\s]line'
        ]
        
        for pattern in line_patterns:
            match = re.search(pattern, prompt_lower)
            if match:
                number_str = match.group(1)
                if number_str.isdigit():
                    lines = int(number_str)
                else:
                    word_map = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
                               'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10}
                    lines = word_map.get(number_str, 2)
                return {'type': 'lines', 'count': lines}
        
        # Word-based requirements
        word_patterns = [
            r'(?:in |write |create |generate |make )?(?:exactly )?(?:just )?(?:only )?(\d+) words?',
            r'(\d+)[-\s]word'
        ]
        
        for pattern in word_patterns:
            match = re.search(pattern, prompt_lower)
            if match:
                words = int(match.group(1))
                return {'type': 'words', 'count': words}
        
        return {'type': 'default'}

    async def generate_quick_response(self, prompt: str) -> str:
        """Generate a quick non-streaming response with optional 20K model"""
        try:
            # Model selection logic
            use_local = self._should_use_local_model(prompt)
            
            if use_local and self.local_model_available:
                try:
                    print(f"🔬 Attempting generation with 20K model")
                    return await self._generate_with_local_model(prompt)
                except Exception as e:
                    print(f"❌ 20K model failed: {e}, falling back to Gemini")
                    # Continue to Gemini fallback
            
            # Use Gemini (primary/fallback)
            print(f"🤖 Generating with Gemini")
            return await self._generate_with_gemini(prompt)
            
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"

    def _should_use_local_model(self, prompt: str) -> bool:
        """Decide when to use 20K model - currently always returns False"""
        # Always use Gemini for now (your 20K model has quality issues)
        return False
        
        # To enable 20K model for testing, uncomment:
        # return self.local_model_available and "test" in prompt.lower()

    async def _generate_with_local_model(self, prompt: str) -> str:
        """Generate with 20K model"""
        if not self.local_model_available:
            raise Exception("20K model not available")
        
        try:
            # Format prompt for your model
            formatted_prompt = f"Generate content: {prompt}\n\nOutput:"
            
            inputs = self.local_tokenizer.encode(formatted_prompt, return_tensors="pt")
            
            with torch.no_grad():
                outputs = self.local_model.generate(
                    inputs,
                    max_length=len(inputs[0]) + 150,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=self.local_tokenizer.eos_token_id
                )
            
            response = self.local_tokenizer.decode(outputs[0], skip_special_tokens=True)
            response = response.replace(formatted_prompt, "").strip()
            
            return response
            
        except Exception as e:
            raise Exception(f"20K model generation failed: {e}")

    async def _generate_with_gemini(self, prompt: str) -> str:
        """Generate with Gemini - your existing working code"""
        length_req = self.detect_length_requirement(prompt)
        
        # Create appropriate prompt
        if length_req['type'] == 'lines':
            final_prompt = f"Create exactly {length_req['count']} lines for: {prompt}\n\nResponse:"
        elif length_req['type'] == 'words':
            final_prompt = f"Create exactly {length_req['count']} words for: {prompt}\n\nResponse:"
        else:
            final_prompt = prompt

        # Use Gemini (your existing logic)
        response = self.model.generate_content(
            final_prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=settings.max_tokens,
                temperature=settings.temperature,
                candidate_count=1
            )
        )
        
        if hasattr(response, 'text') and response.text:
            full_response = response.text.strip()
        else:
            full_response = "Generated content successfully!"

        # Apply truncation if needed
        if length_req['type'] == 'lines':
            final_response = self._force_line_limit(full_response, length_req['count'])
        elif length_req['type'] == 'words':
            final_response = self._force_word_limit(full_response, length_req['count'])
        else:
            final_response = full_response

        return final_response

    async def generate_streaming_content(self, prompt: str) -> AsyncGenerator[str, None]:
        """Generate streaming content - your existing working code"""
        length_req = self.detect_length_requirement(prompt)
        
        # Create appropriate prompt
        if length_req['type'] == 'lines':
            final_prompt = f"Create exactly {length_req['count']} lines for: {prompt}\n\nResponse:"
        elif length_req['type'] == 'words':
            final_prompt = f"Create exactly {length_req['count']} words for: {prompt}\n\nResponse:"
        else:
            final_prompt = prompt

        try:
            response = self.model.generate_content(
                final_prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=min(800, settings.max_tokens),
                    temperature=settings.temperature,
                    candidate_count=1
                ),
                stream=True
            )

            # Collect all output first
            full_response = ""
            for chunk in response:
                if hasattr(chunk, 'text') and chunk.text:
                    full_response += chunk.text

            # Post-processing truncation
            if length_req['type'] == 'lines':
                truncated = self._force_line_limit(full_response, length_req['count'])
            elif length_req['type'] == 'words':
                truncated = self._force_word_limit(full_response, length_req['count'])
            else:
                truncated = full_response.strip()

            # Stream the final result
            for char in truncated:
                yield char

        except Exception as e:
            yield f"Error: {str(e)}"

    def _force_line_limit(self, text: str, max_lines: int) -> str:
        """Force exact line count"""
        text = text.strip()
        lines = text.split('\n')
        clean_lines = [line.strip() for line in lines if line.strip() and not self._is_intro_line(line)]
        return '\n'.join(clean_lines[:max_lines])

    def _force_word_limit(self, text: str, max_words: int) -> str:
        """Force exact word count"""
        text = text.strip()
        words = text.split()
        return ' '.join(words[:max_words])

    def _is_intro_line(self, line: str) -> bool:
        """Check if line is intro text"""
        line_lower = line.lower().strip()
        intro_phrases = ["here's", 'here is', 'here are', 'this is', 'caption:', 'response:']
        return any(line_lower.startswith(phrase) for phrase in intro_phrases)
