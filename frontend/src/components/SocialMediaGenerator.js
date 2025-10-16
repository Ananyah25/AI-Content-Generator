// src/components/SocialMediaGenerator.js
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from '../config/constants';

const SocialMediaGenerator = ({ onBack }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [contentType, setContentType] = useState('post');
  const [formData, setFormData] = useState({
    topic: '',
    tone: 'casual',
    length: 'short',
    includeHashtags: true,
    includeEmojis: true,
    audience: 'general'
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);


  // Length options for content generation
// ADD this after the platforms array:
const lengthOptions = {
  short: { words: '50', description: 'Quick and punchy' },
  medium: { words: '150', description: 'Balanced length' },
  long: { words: '250', description: 'Detailed content' }
};


  const handleGenerate = async (customPrompt = null) => {
    if (!formData.topic && !customPrompt) return;
    
    setIsGenerating(true);
    
let prompt = customPrompt || `Create a ${formData.tone} social media post about ${formData.topic}.`;    
    // Add platform-specific requirements
  prompt += ` Keep it engaging and suitable for social media platforms.`;
  prompt += ` Make it ${formData.length} length (approximately ${lengthOptions[formData.length]?.words} words).`;

    if (formData.includeHashtags) {
      prompt += ' Include relevant hashtags.';
    }
    
    if (formData.includeEmojis) {
      prompt += ' Include appropriate emojis.';
    }
    
    prompt += ` Target audience: ${formData.audience}. Tone: ${formData.tone}.`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/content/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: prompt,
          stream: false 
        })
      });
      
      const data = await response.json();
      setGeneratedContent(data.content || 'Content generated successfully!');
    } catch (error) {
      setGeneratedContent('Error generating content. Please try again.');
    }
    
    setIsGenerating(false);
  };

  

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      alert('Content copied to clipboard!');
    } catch (err) {
    }
  };

  const getCharCount = () => {
    return generatedContent.length;
  };

  

  
  return (
    <div className="social-media-generator">
      <div className="social-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Home
        </button>
        <div className="header-content">
          <h1>Social Media Content Generator</h1>
          <p>Create engaging content for all your social platforms</p>
        </div>
      </div>

      <div className="social-content">
        {/* Platform Selection */}
       

        <div className="generator-layout">
          {/* Content Form */}
          <div className="content-form">
            <div className="form-section">
              <h3>Content Details</h3>
              
              <div className="form-group">
                <label>Topic/Subject</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="What do you want to post about?"
                  className="topic-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tone</label>
                  <select 
                    value={formData.tone}
                    onChange={(e) => setFormData({...formData, tone: e.target.value})}
                  >
                   <option value="casual">Casual</option>
  <option value="professional">Professional</option>
  <option value="humorous">Humorous</option>
  <option value="informative">Informative</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Length</label>
    <select
      value={formData.length}
      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
    >
      {Object.entries(lengthOptions).map(([key, value]) => (
        <option key={key} value={key}>
          {key.charAt(0).toUpperCase() + key.slice(1)} ({value.words} words)
        </option>
      ))}
    </select>
                </div>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.includeHashtags}
                    onChange={(e) => setFormData({...formData, includeHashtags: e.target.checked})}
                  />
                  <span className="checkmark"></span>
                  Include Hashtags
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.includeEmojis}
                    onChange={(e) => setFormData({...formData, includeEmojis: e.target.checked})}
                  />
                  <span className="checkmark"></span>
                  Include Emojis
                </label>
              </div>

              <button 
                onClick={() => handleGenerate()} 
                disabled={isGenerating || !formData.topic}
                className="generate-btn"
              >
                {isGenerating ? 'Generating...' : ' Generate Content'}
              </button>
            </div>
          </div>

          {/* Generated Content Preview */}
          <div className="content-preview">
            <div className="preview-header">
              <h3>Generated Content</h3>
              {generatedContent && (
                <div className="preview-actions">
                  
                  <button onClick={copyToClipboard} className="copy-btn">
                     Copy
                  </button>
                </div>
              )}
            </div>

            <div className="preview-container">
              {generatedContent ? (
                <div className="content-output">
                  <div className="platform-preview">
                    {/* Simple content info without platform badge */}
<div className="mb-4">
  <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium">
    <span>📱</span>
    <span>Social Media Content</span>
  </span>
  <span className="ml-3 text-sm text-gray-400">
    {formData.length.charAt(0).toUpperCase() + formData.length.slice(1)} length ({lengthOptions[formData.length]?.words} words)
  </span>
</div>

                    <div className="preview-text">
                      <ReactMarkdown>{generatedContent}</ReactMarkdown>
                    </div>
                    
                  </div>
                  
                
                </div>
              ) : (
                <div className="preview-placeholder">
                  <div className="placeholder-content">
                    
                    <p>Your generated content will appear here</p>
                    <small>Enter a topic and click generate to start</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaGenerator;