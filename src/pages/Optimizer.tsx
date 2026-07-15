import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { PLATFORMS, Platform } from '../lib/supabase'

interface GeneratedContent {
  title: string
  description: string
  tags: string[]
  hashtags: string[]
  hook: string
  cta: string
  seoScore: number
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#ff0000',
  tiktok: '#00f2ea',
  twitter: '#1da1f2',
  instagram: '#e4405f',
  linkedin: '#0077b5',
  podcast: '#9b59b6',
  blog: '#27ae60',
  pinterest: '#bd081c',
}

const SEO_KEYWORDS = ['tutorial', 'guide', '2024', 'tips', 'best', 'how to', 'learn', 'complete', 'step by step']
const HOOK_TEMPLATES = [
  "In this video, you'll learn exactly how to {topic}...",
  "What if I told you that {topic} could change everything?",
  "Most people get {topic} completely wrong. Here's the truth...",
  "I'm going to show you {topic} in under 5 minutes...",
  "The secret to {topic} that nobody talks about...",
]
const CTA_TEMPLATES = [
  'Subscribe for more content like this!',
  'Like and share if you found this helpful!',
  'Follow for weekly tips and tutorials!',
  'Drop a comment below with your thoughts!',
  'Check the link in bio for more resources!',
]

export function Optimizer() {
  useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube')
  const [topic, setTopic] = useState('')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const currentPlatform = PLATFORMS.find(p => p.value === selectedPlatform)!

  const calculateSeoScore = (content: GeneratedContent): number => {
    let score = 0
    const title = content.title.toLowerCase()
    const description = content.description.toLowerCase()
    const tags = content.tags.join(' ').toLowerCase()
    
    // Title optimization (30 points)
    if (title.includes(topic.toLowerCase())) score += 10
    if (title.length >= 40 && title.length <= 60) score += 10
    if (SEO_KEYWORDS.some(k => title.includes(k))) score += 10

    // Description optimization (30 points)
    if (description.includes(topic.toLowerCase())) score += 10
    if (description.length >= 100 && description.length <= 200) score += 10
    if (description.includes('learn') || description.includes('tips') || description.includes('guide')) score += 10

    // Tags optimization (20 points)
    if (tags.includes(topic.toLowerCase())) score += 10
    if (content.tags.length >= 3) score += 10

    // Hook optimization (20 points)
    if (content.hook.includes(topic.toLowerCase())) score += 10
    if (content.hook.length >= 20 && content.hook.length <= 100) score += 10

    return Math.min(score, 100)
  }

  const generateContent = async () => {
    if (!topic.trim()) {
      showToast('error', 'Please enter a topic')
      return
    }

    setIsGenerating(true)
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const titleVariations = [
      `${topic}: Complete Guide for 2024`,
      `How to Master ${topic} (Step by Step)`,
      `${topic} Tutorial - Everything You Need to Know`,
      `The Ultimate ${topic} Tutorial`,
      `Learn ${topic} in 10 Minutes`,
    ]

    const randomTitle = titleVariations[Math.floor(Math.random() * titleVariations.length)]
    const description = `In this comprehensive tutorial, you'll learn everything about ${topic}. Whether you're a beginner or looking to level up your skills, this guide covers all the essential concepts and practical applications. By the end, you'll have a solid understanding of ${topic} and be able to apply it to your own projects. Perfect for developers, designers, and anyone interested in learning ${topic}.`

    const tags = [
      topic.toLowerCase().replace(/\s+/g, ''),
      topic.toLowerCase().split(' ')[0],
      SEO_KEYWORDS[Math.floor(Math.random() * SEO_KEYWORDS.length)],
      'tutorial',
      'guide',
      '2024',
    ]

    const hashtags = tags.map(t => `#${t}`)

    const hookTemplate = HOOK_TEMPLATES[Math.floor(Math.random() * HOOK_TEMPLATES.length)]
    const hook = hookTemplate.replace('{topic}', topic)

    const cta = CTA_TEMPLATES[Math.floor(Math.random() * CTA_TEMPLATES.length)]

    const content: GeneratedContent = {
      title: randomTitle,
      description,
      tags,
      hashtags,
      hook,
      cta,
      seoScore: 0,
    }

    content.seoScore = calculateSeoScore(content)
    setGeneratedContent(content)
    setIsGenerating(false)
    showToast('success', 'Content generated!')
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
      showToast('success', 'Copied to clipboard')
    } catch {
      showToast('error', 'Failed to copy')
    }
  }

  const copyAll = async () => {
    if (!generatedContent) return

    const allContent = `
Title:
${generatedContent.title}

Description:
${generatedContent.description}

Tags:
${generatedContent.tags.join(', ')}

Hashtags:
${generatedContent.hashtags.join(' ')}

Hook:
${generatedContent.hook}

CTA:
${generatedContent.cta}
    `.trim()

    await copyToClipboard(allContent, 'all')
  }

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return 'var(--color-success)'
    if (score >= 60) return 'var(--color-warning)'
    return 'var(--color-error)'
  }

  const getCharacterCount = (text: string, max: number) => {
    const count = text.length
    const percentage = (count / max) * 100
    let color = 'var(--color-success)'
    if (percentage > 100) color = 'var(--color-error)'
    else if (percentage > 90) color = 'var(--color-warning)'
    return { count, color, valid: percentage <= 100 }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <>
      <div className="main-header">
        <h1 className="main-header-title">Content Optimizer</h1>
        <div className="main-header-actions">
          <button 
            className="btn btn-primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="btn-spinner" />
                Generating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      <div className="optimizer-container">
        {/* Platform Selector */}
        <div className="platform-selector">
          <h2 className="section-title">Select Platform</h2>
          <div className="platform-tabs">
            {PLATFORMS.map(platform => (
              <button
                key={platform.value}
                className={`platform-tab ${selectedPlatform === platform.value ? 'active' : ''}`}
                onClick={() => setSelectedPlatform(platform.value as Platform)}
                style={{
                  '--platform-color': PLATFORM_COLORS[platform.value]
                } as React.CSSProperties}
              >
                <span 
                  className="platform-dot"
                  style={{ backgroundColor: PLATFORM_COLORS[platform.value] }}
                />
                {platform.label}
              </button>
            ))}
          </div>
          <div className="platform-limits">
            <span>Title: {currentPlatform.maxTitle} chars</span>
            <span>Description: {currentPlatform.maxDesc} chars</span>
            {currentPlatform.maxTags > 0 && <span>Tags: {currentPlatform.maxTags} chars</span>}
          </div>
        </div>

        {/* Topic Input */}
        <div className="topic-input-section">
          <h2 className="section-title">Topic</h2>
          <div className="topic-input-group">
            <input
              type="text"
              className="form-input"
              placeholder="Enter your content topic (e.g., 'React Hooks', 'SaaS Marketing')..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateContent()}
            />
          </div>
        </div>

        {/* Generated Content */}
        {generatedContent && (
          <div className="generated-content">
            {/* SEO Score */}
            <div className="seo-score-card">
              <div className="seo-score-header">
                <h2 className="section-title">SEO Score</h2>
                <div 
                  className="seo-score-value"
                  style={{ color: getSeoScoreColor(generatedContent.seoScore) }}
                >
                  {generatedContent.seoScore}/100
                </div>
              </div>
              <div className="seo-score-bar">
                <div 
                  className="seo-score-fill"
                  style={{ 
                    width: `${generatedContent.seoScore}%`,
                    backgroundColor: getSeoScoreColor(generatedContent.seoScore)
                  }}
                />
              </div>
              <div className="seo-tips">
                {generatedContent.seoScore < 80 && (
                  <p className="seo-tip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Tip: Include your main keyword in the title and first 100 characters of description
                  </p>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="content-section">
              <div className="content-header">
                <h3>Title</h3>
                {currentPlatform.maxTitle > 0 && (
                  <span 
                    className="char-count"
                    style={{ color: getCharacterCount(generatedContent.title, currentPlatform.maxTitle).color }}
                  >
                    {getCharacterCount(generatedContent.title, currentPlatform.maxTitle).count}/{currentPlatform.maxTitle}
                  </span>
                )}
              </div>
              <div className="content-field">
                <textarea
                  className="form-input content-textarea"
                  value={generatedContent.title}
                  onChange={(e) => setGeneratedContent({ ...generatedContent, title: e.target.value })}
                />
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(generatedContent.title, 'title')}
                >
                  {copiedField === 'title' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="content-section">
              <div className="content-header">
                <h3>Description</h3>
                {currentPlatform.maxDesc > 0 && (
                  <span 
                    className="char-count"
                    style={{ color: getCharacterCount(generatedContent.description, currentPlatform.maxDesc).color }}
                  >
                    {getCharacterCount(generatedContent.description, currentPlatform.maxDesc).count}/{currentPlatform.maxDesc}
                  </span>
                )}
              </div>
              <div className="content-field">
                <textarea
                  className="form-input content-textarea"
                  rows={4}
                  value={generatedContent.description}
                  onChange={(e) => setGeneratedContent({ ...generatedContent, description: e.target.value })}
                />
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(generatedContent.description, 'description')}
                >
                  {copiedField === 'description' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Tags */}
            {currentPlatform.maxTags > 0 && (
              <div className="content-section">
                <div className="content-header">
                  <h3>Tags</h3>
                  <span className="char-count">
                    {generatedContent.tags.join(', ').length}/{currentPlatform.maxTags}
                  </span>
                </div>
                <div className="content-field">
                  <div className="tags-display">
                    {generatedContent.tags.map(tag => (
                      <span key={tag} className="tag-item">{tag}</span>
                    ))}
                  </div>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(generatedContent.tags.join(', '), 'tags')}
                  >
                    {copiedField === 'tags' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Hashtags */}
            <div className="content-section">
              <div className="content-header">
                <h3>Hashtags</h3>
              </div>
              <div className="content-field">
                <div className="tags-display hashtags">
                  {generatedContent.hashtags.map(tag => (
                    <span key={tag} className="tag-item hashtag">{tag}</span>
                  ))}
                </div>
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(generatedContent.hashtags.join(' '), 'hashtags')}
                >
                  {copiedField === 'hashtags' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Hook */}
            <div className="content-section">
              <div className="content-header">
                <h3>Hook</h3>
                <span className="section-badge">First 3 seconds</span>
              </div>
              <div className="content-field">
                <textarea
                  className="form-input content-textarea"
                  rows={2}
                  value={generatedContent.hook}
                  onChange={(e) => setGeneratedContent({ ...generatedContent, hook: e.target.value })}
                />
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(generatedContent.hook, 'hook')}
                >
                  {copiedField === 'hook' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="content-section">
              <div className="content-header">
                <h3>Call to Action</h3>
                <span className="section-badge">End screen</span>
              </div>
              <div className="content-field">
                <input
                  type="text"
                  className="form-input"
                  value={generatedContent.cta}
                  onChange={(e) => setGeneratedContent({ ...generatedContent, cta: e.target.value })}
                />
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(generatedContent.cta, 'cta')}
                >
                  {copiedField === 'cta' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Copy All Button */}
            <div className="copy-all-section">
              <button className="btn btn-primary" onClick={copyAll}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copiedField === 'all' ? 'Copied!' : 'Copy All'}
              </button>
              <button className="btn btn-ghost" onClick={generateContent}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Regenerate
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedContent && !isGenerating && (
          <div className="optimizer-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <h2>Ready to Optimize</h2>
            <p>Enter a topic and click Generate to create optimized content for your selected platform</p>
          </div>
        )}
      </div>

      <style>{`
        .optimizer-container {
          padding: var(--space-6);
          max-width: 800px;
        }

        .section-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-4);
        }

        .platform-selector {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin-bottom: var(--space-6);
        }

        .platform-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        .platform-tab {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .platform-tab:hover {
          border-color: var(--color-border);
          color: var(--color-text-primary);
        }

        .platform-tab.active {
          border-color: var(--platform-color);
          background: var(--color-bg-card-hover);
          color: var(--color-text-primary);
        }

        .platform-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .platform-limits {
          display: flex;
          gap: var(--space-4);
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }

        .topic-input-section {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin-bottom: var(--space-6);
        }

        .topic-input-group {
          display: flex;
          gap: var(--space-3);
        }

        .topic-input-group .form-input {
          flex: 1;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .generated-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .seo-score-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }

        .seo-score-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .seo-score-value {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
        }

        .seo-score-bar {
          height: 8px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: var(--space-3);
        }

        .seo-score-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width var(--transition-slow);
        }

        .seo-tips {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .seo-tip {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
        }

        .content-section {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-3);
        }

        .content-header h3 {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
        }

        .char-count {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }

        .section-badge {
          font-size: var(--font-size-xs);
          padding: 2px var(--space-2);
          background: var(--color-accent-muted);
          color: var(--color-accent);
          border-radius: var(--radius-sm);
        }

        .content-field {
          position: relative;
        }

        .content-textarea {
          padding-right: var(--space-12);
          resize: vertical;
          min-height: 60px;
        }

        .copy-btn {
          position: absolute;
          top: var(--space-2);
          right: var(--space-2);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .copy-btn:hover {
          background: var(--color-accent-muted);
          color: var(--color-accent);
        }

        .tags-display {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          min-height: 48px;
        }

        .tag-item {
          padding: var(--space-1) var(--space-3);
          background: var(--color-bg-secondary);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
        }

        .tag-item.hashtag {
          color: var(--color-accent);
        }

        .copy-all-section {
          display: flex;
          gap: var(--space-3);
          justify-content: center;
          padding: var(--space-4) 0;
        }

        .optimizer-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-16);
          text-align: center;
          color: var(--color-text-muted);
        }

        .optimizer-empty svg {
          margin-bottom: var(--space-4);
          opacity: 0.3;
        }

        .optimizer-empty h2 {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-2);
        }

        .optimizer-empty p {
          font-size: var(--font-size-sm);
          max-width: 300px;
        }

        @media (max-width: 768px) {
          .platform-tabs {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: var(--space-2);
          }

          .platform-tab {
            white-space: nowrap;
          }

          .copy-all-section {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  )
}
