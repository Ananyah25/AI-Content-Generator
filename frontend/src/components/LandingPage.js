// src/components/LandingPage.js
import React from 'react';

const LandingPage = ({ onNavigate }) => {
  const contentOptions = [
    {
      id: 'social',
      title: 'Social Media Content',
      description: 'Create engaging posts, captions, and tweets for all platforms',
      icon: '📱',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'blog',
      title: 'Blog & Articles',
      description: 'Generate comprehensive blog posts and articles',
      icon: '📝',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }
  ];

  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Create Amazing Content with 
            <span className="gradient-text"> AI Power</span>
          </h1>
          <p className="hero-description">
            Generate high-quality content for social media, blogs, marketing campaigns, 
            and more. Powered by advanced AI technology.
          </p>
          
        </div>
      </div>

      <div className="content-options">
        <div className="section-header">
          <h2>Choose Your Content Type</h2>
          <p>Select the type of content you want to generate</p>
        </div>

        <div className="options-grid">
          {contentOptions.map((option) => (
            <div 
              key={option.id}
              className="content-card"
              onClick={() => {
                // Navigate based on content type
                if (option.id === 'blog') {
                  onNavigate('blog');
                } else if (option.id === 'social') {
                  onNavigate('social');
                } else {
                  onNavigate('chat', option.id); // Marketing, business, etc.
                }
              }}
              style={{ background: option.gradient }}
            >
              <div className="card-content">
                <div className="card-icon">{option.icon}</div>
                <h3 className="card-title">{option.title}</h3>
                <p className="card-description">{option.description}</p>
                
                
                
                <div className="card-action">
                  <span>Get Started →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
