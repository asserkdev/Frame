import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { TopicStatus } from '../lib/supabase'

interface TrendingTopic {
  id: string
  title: string
  source_url: string | null
  source_platform: string | null
  themes: string[] | null
  tags: string[] | null
  notes: string | null
  extracted_content: string | null
  relevance_score: number
  status: TopicStatus
  linked_project_id: string | null
  created_at: string
  updated_at: string
}


const STATUS_COLORS: Record<TopicStatus, string> = {
  collected: '#60a5fa',
  reviewed: '#fbbf24',
  used: '#34d399',
  archived: '#71717a',
}

const PLATFORM_ICONS: Record<string, JSX.Element> = {
  TechCrunch: <span className="platform-icon tc">TC</span>,
  Medium: <span className="platform-icon medium">M</span>,
  Twitter: <span className="platform-icon twitter">X</span>,
  'Dev.to': <span className="platform-icon devto">DEV</span>,
  Reddit: <span className="platform-icon reddit">R</span>,
  Stratechery: <span className="platform-icon stratechery">S</span>,
}

export function Trending() {
  useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [topics, setTopics] = useState<TrendingTopic[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedTopic, setExtractedTopic] = useState<Partial<TrendingTopic> | null>(null)
  const [statusFilter, setStatusFilter] = useState<TopicStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null)
  const [editingTags, setEditingTags] = useState<string[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredTopics = topics.filter(topic => {
    const matchesStatus = statusFilter === 'all' || topic.status === statusFilter
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.themes?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      topic.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const extractFromUrl = async () => {
    if (!urlInput.trim()) {
      showToast('error', 'Please enter a URL')
      return
    }

    setIsExtracting(true)
    
    // Simulate URL extraction
    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockExtracted: Partial<TrendingTopic> = {
      title: extractTitleFromUrl(urlInput),
      source_url: urlInput,
      source_platform: detectPlatform(urlInput),
      themes: extractThemes(urlInput),
      tags: extractTags(urlInput),
      extracted_content: 'Extracted content preview from the URL...',
      relevance_score: Math.floor(Math.random() * 30) + 70,
    }

    setExtractedTopic(mockExtracted)
    setIsExtracting(false)
    showToast('success', 'URL extracted successfully')
  }

  const extractTitleFromUrl = (url: string): string => {
    const domains: Record<string, string> = {
      'techcrunch': 'TechCrunch Article on Tech Trends',
      'medium': 'Medium Article Analysis',
      'twitter': 'Trending Twitter Discussion',
      'dev.to': 'Dev.to Developer Article',
      'reddit': 'Reddit Community Discussion',
      'youtube': 'YouTube Video Analysis',
    }
    
    for (const [domain, title] of Object.entries(domains)) {
      if (url.toLowerCase().includes(domain)) return title
    }
    return 'New Trending Topic'
  }

  const detectPlatform = (url: string): string => {
    const platforms: Record<string, string> = {
      'techcrunch': 'TechCrunch',
      'medium.com': 'Medium',
      'twitter.com': 'Twitter',
      'x.com': 'Twitter',
      'dev.to': 'Dev.to',
      'reddit.com': 'Reddit',
      'youtube.com': 'YouTube',
    }
    
    for (const [domain, platform] of Object.entries(platforms)) {
      if (url.toLowerCase().includes(domain)) return platform
    }
    return 'Web'
  }

  const extractThemes = (url: string): string[] => {
    const themeMap: Record<string, string[]> = {
      'techcrunch': ['Technology', 'Startups', 'Innovation'],
      'medium': ['Ideas', 'Perspectives', 'Stories'],
      'twitter': ['Discussions', 'Trends', 'Community'],
      'dev.to': ['Development', 'Programming', 'Code'],
      'reddit': ['Community', 'Discussions', 'AMA'],
    }
    
    for (const [domain, themes] of Object.entries(themeMap)) {
      if (url.toLowerCase().includes(domain)) return themes
    }
    return ['Trending', 'Popular', 'Viral']
  }

  const extractTags = (_url: string): string[] => {
    return ['trending', 'viral', 'popular']
  }

  const addExtractedTopic = () => {
    if (!extractedTopic) return

    const newTopic: TrendingTopic = {
      id: String(Date.now()),
      title: extractedTopic.title || 'Untitled Topic',
      source_url: extractedTopic.source_url || null,
      source_platform: extractedTopic.source_platform || null,
      themes: extractedTopic.themes || null,
      tags: extractedTopic.tags || null,
      notes: null,
      extracted_content: extractedTopic.extracted_content || null,
      relevance_score: extractedTopic.relevance_score || 50,
      status: 'collected',
      linked_project_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setTopics(prev => [newTopic, ...prev])
    setExtractedTopic(null)
    setUrlInput('')
    showToast('success', 'Topic added to collection')
  }

  const updateTopicStatus = (topicId: string, newStatus: TopicStatus) => {
    setTopics(prev => prev.map(t => 
      t.id === topicId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
    ))
    showToast('success', `Status updated to ${newStatus}`)
  }

  const startEditingTags = (topic: TrendingTopic) => {
    setSelectedTopic(topic)
    setEditingTags(topic.tags || [])
  }

  const saveTags = () => {
    if (!selectedTopic) return
    setTopics(prev => prev.map(t => 
      t.id === selectedTopic.id ? { ...t, tags: editingTags, updated_at: new Date().toISOString() } : t
    ))
    setSelectedTopic(null)
    setEditingTags([])
    showToast('success', 'Tags updated')
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'var(--color-success)'
    if (score >= 70) return 'var(--color-warning)'
    return 'var(--color-error)'
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
        <h1 className="main-header-title">Trending Topics</h1>
        <div className="main-header-actions">
          <button className="btn btn-primary" onClick={() => setStatusFilter('collected')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            Find Topics
          </button>
        </div>
      </div>

      <div className="trending-container">
        {/* URL Input Section */}
        <div className="url-input-section">
          <h2 className="section-title">Collect from URL</h2>
          <div className="url-input-group">
            <input
              type="url"
              className="form-input"
              placeholder="Paste article URL (TechCrunch, Medium, Dev.to, etc.)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && extractFromUrl()}
            />
            <button 
              className="btn btn-primary"
              onClick={extractFromUrl}
              disabled={isExtracting}
            >
              {isExtracting ? (
                <div className="btn-spinner" />
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Extract
                </>
              )}
            </button>
          </div>

          {/* Extracted Preview */}
          {extractedTopic && (
            <div className="extracted-preview">
              <div className="extracted-header">
                <h3>Extracted Topic</h3>
                <div className="extracted-score" style={{ color: getScoreColor(extractedTopic.relevance_score || 0) }}>
                  {extractedTopic.relevance_score}% relevance
                </div>
              </div>
              <div className="extracted-content">
                <div className="extracted-field">
                  <label>Title</label>
                  <p>{extractedTopic.title}</p>
                </div>
                <div className="extracted-field">
                  <label>Platform</label>
                  <p>{extractedTopic.source_platform}</p>
                </div>
                <div className="extracted-field">
                  <label>Themes</label>
                  <div className="theme-tags">
                    {extractedTopic.themes?.map(theme => (
                      <span key={theme} className="theme-tag">{theme}</span>
                    ))}
                  </div>
                </div>
                <div className="extracted-field">
                  <label>Tags</label>
                  <div className="tag-chips">
                    {extractedTopic.tags?.map(tag => (
                      <span key={tag} className="tag-chip">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="extracted-actions">
                <button className="btn btn-ghost" onClick={() => setExtractedTopic(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={addExtractedTopic}>
                  Add to Collection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="trending-filters">
          <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              className={`view-toggle-btn ${statusFilter === 'collected' ? 'active' : ''}`}
              onClick={() => setStatusFilter('collected')}
            >
              Collected
            </button>
            <button
              className={`view-toggle-btn ${statusFilter === 'reviewed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('reviewed')}
            >
              Reviewed
            </button>
            <button
              className={`view-toggle-btn ${statusFilter === 'used' ? 'active' : ''}`}
              onClick={() => setStatusFilter('used')}
            >
              Used
            </button>
          </div>
        </div>

        {/* Topics Grid */}
        {filteredTopics.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <h2 className="empty-state-title">No topics found</h2>
            <p className="empty-state-description">
              {searchQuery ? 'Try adjusting your search' : 'Paste a URL above to collect trending topics'}
            </p>
          </div>
        ) : (
          <div className="topics-grid">
            {filteredTopics.map(topic => (
              <div key={topic.id} className="topic-card">
                <div className="topic-header">
                  <div className="topic-platform">
                    {PLATFORM_ICONS[topic.source_platform || ''] || <span className="platform-icon web">WEB</span>}
                    <span>{topic.source_platform}</span>
                  </div>
                  <span 
                    className="topic-status"
                    style={{ 
                      backgroundColor: STATUS_COLORS[topic.status] + '20',
                      color: STATUS_COLORS[topic.status]
                    }}
                  >
                    {topic.status}
                  </span>
                </div>

                <h3 className="topic-title">{topic.title}</h3>

                {/* Themes */}
                <div className="topic-themes">
                  {topic.themes?.map(theme => (
                    <span key={theme} className="theme-badge">{theme}</span>
                  ))}
                </div>

                {/* Tags */}
                <div className="topic-tags">
                  {topic.tags?.map(tag => (
                    <span key={tag} className="tag-badge">#{tag}</span>
                  ))}
                </div>

                {/* Relevance Score */}
                <div className="topic-relevance">
                  <div className="relevance-bar">
                    <div 
                      className="relevance-fill"
                      style={{ 
                        width: `${topic.relevance_score}%`,
                        backgroundColor: getScoreColor(topic.relevance_score)
                      }}
                    />
                  </div>
                  <span className="relevance-value" style={{ color: getScoreColor(topic.relevance_score) }}>
                    {topic.relevance_score}%
                  </span>
                </div>

                {/* Actions */}
                <div className="topic-actions">
                  <select 
                    className="status-select"
                    value={topic.status}
                    onChange={(e) => updateTopicStatus(topic.id, e.target.value as TopicStatus)}
                  >
                    <option value="collected">Collected</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="used">Used</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button 
                    className="btn btn-ghost btn-icon"
                    onClick={() => startEditingTags(topic)}
                    title="Edit tags"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                  </button>
                  {topic.source_url && (
                    <a 
                      href={topic.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-icon"
                      title="Open source"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  )}
                </div>

                <div className="topic-meta">
                  Added {new Date(topic.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Tags Modal */}
      {selectedTopic && (
        <div className="modal-overlay" onClick={() => setSelectedTopic(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTopic(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="modal-title">Edit Tags</h3>
            <p className="modal-subtitle">{selectedTopic.title}</p>

            <div className="tags-editor">
              <input
                type="text"
                className="form-input"
                placeholder="Add a tag and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const newTag = e.currentTarget.value.trim().replace(/^#/, '')
                    if (!editingTags.includes(newTag)) {
                      setEditingTags([...editingTags, newTag])
                    }
                    e.currentTarget.value = ''
                  }
                }}
              />
              <div className="editing-tags">
                {editingTags.map(tag => (
                  <span key={tag} className="editing-tag">
                    #{tag}
                    <button onClick={() => setEditingTags(editingTags.filter(t => t !== tag))}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedTopic(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveTags}>
                Save Tags
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .trending-container {
          padding: var(--space-6);
        }

        .url-input-section {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin-bottom: var(--space-6);
        }

        .section-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-4);
        }

        .url-input-group {
          display: flex;
          gap: var(--space-3);
        }

        .url-input-group .form-input {
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

        .extracted-preview {
          margin-top: var(--space-5);
          padding: var(--space-4);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }

        .extracted-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .extracted-header h3 {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
        }

        .extracted-score {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
        }

        .extracted-content {
          display: grid;
          gap: var(--space-3);
        }

        .extracted-field label {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: var(--space-1);
        }

        .extracted-field p {
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
        }

        .theme-tags,
        .tag-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .theme-tag {
          font-size: var(--font-size-xs);
          padding: 2px var(--space-2);
          background: var(--color-accent-muted);
          color: var(--color-accent);
          border-radius: var(--radius-sm);
        }

        .tag-chip {
          font-size: var(--font-size-xs);
          padding: 2px var(--space-2);
          background: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          border-radius: var(--radius-sm);
        }

        .extracted-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border-subtle);
        }

        .trending-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
        }

        .view-toggle {
          display: flex;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          padding: 2px;
        }

        .view-toggle-btn {
          padding: var(--space-2) var(--space-3);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-transform: capitalize;
        }

        .view-toggle-btn:hover {
          color: var(--color-text-secondary);
        }

        .view-toggle-btn.active {
          background: var(--color-bg-card);
          color: var(--color-accent);
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-4);
        }

        .topic-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          transition: all var(--transition-fast);
        }

        .topic-card:hover {
          border-color: var(--color-border);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .topic-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-3);
        }

        .topic-platform {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }

        .platform-icon {
          width: 20px;
          height: 20px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: var(--font-weight-bold);
        }

        .platform-icon.tc { background: #00a562; color: white; }
        .platform-icon.medium { background: #00ab6c; color: white; }
        .platform-icon.twitter { background: #1da1f2; color: white; }
        .platform-icon.devto { background: #0a0a0a; color: white; }
        .platform-icon.reddit { background: #ff4500; color: white; }
        .platform-icon.stratechery { background: #2563eb; color: white; }
        .platform-icon.web { background: var(--color-bg-tertiary); color: var(--color-text-muted); }

        .topic-status {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
          text-transform: capitalize;
        }

        .topic-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-3);
          line-height: 1.4;
        }

        .topic-themes {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
          margin-bottom: var(--space-2);
        }

        .theme-badge {
          font-size: var(--font-size-xs);
          padding: 2px var(--space-2);
          background: var(--color-accent-muted);
          color: var(--color-accent);
          border-radius: var(--radius-sm);
        }

        .topic-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
          margin-bottom: var(--space-3);
        }

        .tag-badge {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }

        .topic-relevance {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .relevance-bar {
          flex: 1;
          height: 4px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .relevance-fill {
          height: 100%;
          border-radius: var(--radius-full);
        }

        .relevance-value {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          min-width: 32px;
        }

        .topic-actions {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .status-select {
          flex: 1;
          padding: var(--space-2);
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: var(--font-size-sm);
          cursor: pointer;
        }

        .status-select:focus {
          outline: none;
          border-color: var(--color-accent);
        }

        .topic-meta {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
        }

        .modal-subtitle {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-top: var(--space-1);
          margin-bottom: var(--space-4);
        }

        .tags-editor {
          margin-bottom: var(--space-4);
        }

        .editing-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-3);
        }

        .editing-tag {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          background: var(--color-accent-muted);
          color: var(--color-accent);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
        }

        .editing-tag button {
          background: transparent;
          border: none;
          color: var(--color-accent);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          transition: opacity var(--transition-fast);
        }

        .editing-tag button:hover {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .url-input-group {
            flex-direction: column;
          }

          .trending-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .topics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
