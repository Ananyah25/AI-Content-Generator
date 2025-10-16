// src/components/BlogGenerator.js
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from '../config/constants';

const BlogGenerator = ({ onBack }) => {
  const [formData, setFormData] = useState({
    topic: '',
    style: 'informative',
    length: 'medium',
  });
  const [generatedBlog, setGeneratedBlog] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const textareaRef = useRef(null);

  const lengthOptions = {
    short: { words: '50', description: 'Quick and punchy' },
    medium: { words: '100', description: 'Balanced length' },
    long: { words: '200', description: 'Detailed content' }
  };

  useEffect(() => {
    if (generatedBlog) {
      const words = generatedBlog.split(/\s+/).length;
      setWordCount(words);
    }
  }, [generatedBlog]);

  const handleGenerate = async () => {
    if (!formData.topic) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedBlog('');

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    let prompt = `Write a ${formData.length} ${formData.style} blog post about "${formData.topic}".`;
    
    prompt += ` The content should be approximately ${lengthOptions[formData.length]?.words} words.`;

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
      setGeneratedBlog(data.content || 'Blog generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      setGeneratedBlog('Error generating blog. Please try again.');
    }
    
    clearInterval(progressInterval);
    setGenerationProgress(100);
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedBlog);
      alert('Blog content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };


  const getWordCount = () => {
    return generatedBlog.split(/\s+/).length;
  };

  return (
    <div className="social-media-generator">
      <div className="social-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Home
        </button>
        <div className="header-content">
          <h1>Blog Content Generator</h1>
          <p>Create concise and engaging blog posts</p>
        </div>
      </div>

      <div className="social-content">
        <div className="generator-layout">
          {/* Content Form */}
          <div className="content-form">
            <div className="form-section">
              <h3>Content Details</h3>
              
              <div className="form-group">
                <label>Blog Topic *</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="What's your blog about?"
                  className="topic-input"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Writing Style</label>
                  <select 
                    value={formData.style}
                    onChange={(e) => setFormData({...formData, style: e.target.value})}
                  >
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="humorous">Humorous</option>
                    <option value="informative">Informative</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Length</label>
                  <select 
                    value={formData.length}
                    onChange={(e) => setFormData({...formData, length: e.target.value})}
                  >
                    {Object.entries(lengthOptions).map(([key, value]) => (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value.words})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleGenerate} 
                disabled={isGenerating || !formData.topic}
                className="generate-btn"
              >
                {isGenerating ? 'Generating...' : '🚀 Generate Blog Post'}
              </button>
            </div>
          </div>

          {/* Generated Content Preview */}
          <div className="content-preview">
            <div className="preview-header">
              <h3>Generated Content</h3>
              {generatedBlog && (
                <div className="preview-actions">
                  <button onClick={copyToClipboard} className="copy-btn">
                     Copy
                  </button>
                </div>
              )}
            </div>

            <div className="preview-container">
              {isGenerating ? (
                <div className="generation-progress">
                  <div className="progress-container">
                    <p>Generating your blog post..</p>
                    
                  </div>
                  
                </div>
              ) : generatedBlog ? (
                <div className="content-output">
                  <div className="platform-preview">
                    <div className="mb-4">
                      <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium">
                        <span>📝</span>
                        <span>Blog Post</span>
                      </span>
                      <span className="ml-3 text-sm text-gray-400">
                        {wordCount} words
                      </span>
                    </div>

                    <div className="preview-text blog-preview-text">
                      <ReactMarkdown>{generatedBlog}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="preview-placeholder">
                  <div className="placeholder-content">
                    <p>Your generated blog post will appear here</p>
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

export default BlogGenerator;