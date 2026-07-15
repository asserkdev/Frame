import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { SeriesStatus, EpisodeStatus, ContentType } from '../lib/supabase'

interface Series {
  id: string
  title: string
  description: string | null
  content_type: ContentType
  total_episodes: number
  completed_episodes: number
  status: SeriesStatus
  created_at: string
  updated_at: string
}

interface Episode {
  id: string
  series_id: string | null
  episode_number: number | null
  title: string
  description: string | null
  status: EpisodeStatus
  planned_date: string | null
  published_date: string | null
  thumbnail_url: string | null
  duration: number | null
}

const MOCK_SERIES: Series[] = [
  { id: '1', title: 'React Mastery Course', description: 'Complete React.js course from beginner to advanced', content_type: 'course', total_episodes: 12, completed_episodes: 8, status: 'active', created_at: '2024-01-01', updated_at: '2024-01-15' },
  { id: '2', title: 'DevOps Weekly', description: 'Weekly DevOps tips and tutorials', content_type: 'video', total_episodes: 24, completed_episodes: 15, status: 'active', created_at: '2023-10-01', updated_at: '2024-01-14' },
  { id: '3', title: 'Indie Hacker Interviews', description: 'Interviews with successful indie hackers', content_type: 'podcast', total_episodes: 20, completed_episodes: 15, status: 'active', created_at: '2023-06-01', updated_at: '2024-01-13' },
  { id: '4', title: 'CSS Deep Dives', description: 'In-depth CSS tutorials', content_type: 'video', total_episodes: 8, completed_episodes: 8, status: 'completed', created_at: '2023-01-01', updated_at: '2023-08-15' },
  { id: '5', title: 'TypeScript Patterns', description: 'Design patterns in TypeScript', content_type: 'course', total_episodes: 10, completed_episodes: 3, status: 'paused', created_at: '2023-11-01', updated_at: '2024-01-10' },
]

const MOCK_EPISODES: Record<string, Episode[]> = {
  '1': [
    { id: 'e1', series_id: '1', episode_number: 1, title: 'Introduction to React', description: 'Getting started with React fundamentals', status: 'published', planned_date: null, published_date: '2024-01-02', thumbnail_url: null, duration: 1800 },
    { id: 'e2', series_id: '1', episode_number: 2, title: 'Components & Props', description: 'Understanding React components', status: 'published', planned_date: null, published_date: '2024-01-04', thumbnail_url: null, duration: 2100 },
    { id: 'e3', series_id: '1', episode_number: 3, title: 'State & useState', description: 'Managing component state', status: 'published', planned_date: null, published_date: '2024-01-06', thumbnail_url: null, duration: 2400 },
    { id: 'e4', series_id: '1', episode_number: 4, title: 'Effects & useEffect', description: 'Side effects in React', status: 'published', planned_date: null, published_date: '2024-01-08', thumbnail_url: null, duration: 1950 },
    { id: 'e5', series_id: '1', episode_number: 5, title: 'Context API', description: 'Global state management', status: 'published', planned_date: null, published_date: '2024-01-10', thumbnail_url: null, duration: 2250 },
    { id: 'e6', series_id: '1', episode_number: 6, title: 'useReducer', description: 'Complex state logic', status: 'published', planned_date: null, published_date: '2024-01-12', thumbnail_url: null, duration: 2100 },
    { id: 'e7', series_id: '1', episode_number: 7, title: 'Custom Hooks', description: 'Building reusable hooks', status: 'published', planned_date: null, published_date: '2024-01-14', thumbnail_url: null, duration: 1800 },
    { id: 'e8', series_id: '1', episode_number: 8, title: 'Performance', description: 'Optimizing React apps', status: 'published', planned_date: null, published_date: '2024-01-16', thumbnail_url: null, duration: 2400 },
    { id: 'e9', series_id: '1', episode_number: 9, title: 'Testing', description: 'Testing React components', status: 'recorded', planned_date: null, published_date: null, thumbnail_url: null, duration: null },
    { id: 'e10', series_id: '1', episode_number: 10, title: 'TypeScript + React', description: 'Type-safe React development', status: 'in_progress', planned_date: '2024-01-22', published_date: null, thumbnail_url: null, duration: null },
    { id: 'e11', series_id: '1', episode_number: 11, title: 'Next.js Introduction', description: 'Getting started with Next.js', status: 'planned', planned_date: '2024-01-28', published_date: null, thumbnail_url: null, duration: null },
    { id: 'e12', series_id: '1', episode_number: 12, title: 'Deployment', description: 'Deploying React apps', status: 'planned', planned_date: '2024-02-04', published_date: null, thumbnail_url: null, duration: null },
  ],
  '2': [
    { id: 'd1', series_id: '2', episode_number: 1, title: 'Docker Basics', description: 'Introduction to containers', status: 'published', planned_date: null, published_date: '2023-10-05', thumbnail_url: null, duration: 1200 },
    { id: 'd2', series_id: '2', episode_number: 2, title: 'Kubernetes Intro', description: 'Container orchestration', status: 'published', planned_date: null, published_date: '2023-10-12', thumbnail_url: null, duration: 1500 },
    { id: 'd3', series_id: '2', episode_number: 3, title: 'CI/CD Pipelines', description: 'Automating deployments', status: 'published', planned_date: null, published_date: '2023-10-19', thumbnail_url: null, duration: 1350 },
  ],
}

const EPISODE_STATUS_COLORS: Record<EpisodeStatus, string> = {
  planned: '#60a5fa',
  in_progress: '#fbbf24',
  recorded: '#f472b6',
  edited: '#a78bfa',
  published: '#34d399',
}

const SERIES_STATUS_COLORS: Record<SeriesStatus, string> = {
  active: '#34d399',
  completed: '#818cf8',
  paused: '#fbbf24',
  archived: '#71717a',
}

export function Series() {
  useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [series, setSeries] = useState<Series[]>(MOCK_SERIES)
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [showCreateSeriesModal, setShowCreateSeriesModal] = useState(false)
  const [newSeries, setNewSeries] = useState({
    title: '',
    description: '',
    content_type: 'video' as ContentType,
    total_episodes: 10,
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (selectedSeries) {
      setEpisodes(MOCK_EPISODES[selectedSeries.id] || [])
    }
  }, [selectedSeries])

  const handleSeriesClick = (s: Series) => {
    setSelectedSeries(s.id === selectedSeries?.id ? null : s)
  }

  const updateEpisodeStatus = (episodeId: string, newStatus: EpisodeStatus) => {
    setEpisodes(prev => prev.map(e => 
      e.id === episodeId ? { ...e, status: newStatus } : e
    ))
    showToast('success', `Episode status updated to ${newStatus.replace('_', ' ')}`)
  }

  const handleCreateSeries = () => {
    if (!newSeries.title.trim()) {
      showToast('error', 'Please enter a series title')
      return
    }

    const series: Series = {
      id: String(Date.now()),
      title: newSeries.title,
      description: newSeries.description || null,
      content_type: newSeries.content_type,
      total_episodes: newSeries.total_episodes,
      completed_episodes: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setSeries(prev => [series, ...prev])
    setShowCreateSeriesModal(false)
    setNewSeries({ title: '', description: '', content_type: 'video', total_episodes: 10 })
    showToast('success', 'Series created successfully')
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
        <h1 className="main-header-title">Series & Episodes</h1>
        <div className="main-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateSeriesModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Series
          </button>
        </div>
      </div>

      <div className="series-container">
        <div className="series-layout">
          {/* Series List */}
          <div className="series-list-panel">
            <h2 className="panel-title">All Series</h2>
            <div className="series-list">
              {series.map(s => (
                <div 
                  key={s.id}
                  className={`series-item ${selectedSeries?.id === s.id ? 'selected' : ''}`}
                  onClick={() => handleSeriesClick(s)}
                >
                  <div className="series-item-header">
                    <span 
                      className="series-status-dot"
                      style={{ backgroundColor: SERIES_STATUS_COLORS[s.status] }}
                    />
                    <h3 className="series-item-title">{s.title}</h3>
                  </div>
                  <div className="series-progress-container">
                    <div className="series-progress-bar">
                      <div 
                        className="series-progress-fill"
                        style={{ width: `${(s.completed_episodes / s.total_episodes) * 100}%` }}
                      />
                    </div>
                    <span className="series-progress-text">
                      {s.completed_episodes}/{s.total_episodes}
                    </span>
                  </div>
                  <div className="series-item-meta">
                    <span className="series-type-badge">{s.content_type}</span>
                    <span className="series-status-badge" style={{ color: SERIES_STATUS_COLORS[s.status] }}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Episode Timeline */}
          <div className="episode-timeline-panel">
            {selectedSeries ? (
              <>
                <div className="episode-panel-header">
                  <div>
                    <h2 className="panel-title">{selectedSeries.title}</h2>
                    <p className="episode-panel-subtitle">
                      {selectedSeries.description}
                    </p>
                  </div>
                  <div className="episode-panel-stats">
                    <div className="stat-item">
                      <span className="stat-value">{selectedSeries.completed_episodes}</span>
                      <span className="stat-label">Published</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{selectedSeries.total_episodes - selectedSeries.completed_episodes}</span>
                      <span className="stat-label">Remaining</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{selectedSeries.total_episodes}</span>
                      <span className="stat-label">Total</span>
                    </div>
                  </div>
                </div>

                {/* Milestone Bar */}
                <div className="milestone-bar">
                  {[25, 50, 75].map(milestone => {
                    const reached = selectedSeries.completed_episodes >= (selectedSeries.total_episodes * milestone / 100)
                    return (
                      <div key={milestone} className={`milestone ${reached ? 'reached' : ''}`}>
                        <div className="milestone-marker">
                          {reached ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <span>{milestone}%</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="episode-timeline">
                  {episodes.map(episode => (
                    <div key={episode.id} className="episode-card">
                      <div className="episode-number">
                        EP {episode.episode_number?.toString().padStart(2, '0')}
                      </div>
                      <div className="episode-content">
                        <div className="episode-header">
                          <h4 className="episode-title">{episode.title}</h4>
                          <span 
                            className="episode-status-badge"
                            style={{ 
                              backgroundColor: EPISODE_STATUS_COLORS[episode.status] + '20',
                              color: EPISODE_STATUS_COLORS[episode.status]
                            }}
                          >
                            {episode.status.replace('_', ' ')}
                          </span>
                        </div>
                        {episode.description && (
                          <p className="episode-description">{episode.description}</p>
                        )}
                        <div className="episode-meta">
                          {episode.planned_date && (
                            <span className="episode-date">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                              </svg>
                              {new Date(episode.planned_date).toLocaleDateString()}
                            </span>
                          )}
                          {episode.published_date && (
                            <span className="episode-date published">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              {new Date(episode.published_date).toLocaleDateString()}
                            </span>
                          )}
                          {episode.duration && (
                            <span className="episode-duration">
                              {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>
                        <div className="episode-actions">
                          <select 
                            className="episode-status-select"
                            value={episode.status}
                            onChange={(e) => updateEpisodeStatus(episode.id, e.target.value as EpisodeStatus)}
                          >
                            <option value="planned">Planned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="recorded">Recorded</option>
                            <option value="edited">Edited</option>
                            <option value="published">Published</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-timeline">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <h3>Select a series</h3>
                <p>Choose a series from the list to view and manage episodes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Series Modal */}
      {showCreateSeriesModal && (
        <div className="modal-overlay" onClick={() => setShowCreateSeriesModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateSeriesModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="modal-title">Create New Series</h3>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateSeries(); }} style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Series Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter series title..."
                  value={newSeries.title}
                  onChange={(e) => setNewSeries({ ...newSeries, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Description (optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Describe your series..."
                  value={newSeries.description}
                  onChange={(e) => setNewSeries({ ...newSeries, description: e.target.value })}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Content Type</label>
                <select
                  className="form-input"
                  value={newSeries.content_type}
                  onChange={(e) => setNewSeries({ ...newSeries, content_type: e.target.value as ContentType })}
                >
                  <option value="video">Video</option>
                  <option value="podcast">Podcast</option>
                  <option value="course">Course</option>
                  <option value="blog">Blog</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Total Episodes</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="100"
                  value={newSeries.total_episodes}
                  onChange={(e) => setNewSeries({ ...newSeries, total_episodes: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateSeriesModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Series
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .series-container {
          padding: var(--space-6);
          height: calc(100vh - var(--header-height) - var(--space-12));
        }

        .series-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: var(--space-6);
          height: 100%;
        }

        .series-list-panel {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          overflow-y: auto;
        }

        .panel-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-4);
        }

        .series-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .series-item {
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .series-item:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border);
        }

        .series-item.selected {
          border-color: var(--color-accent);
          background: var(--color-accent-muted);
        }

        .series-item-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .series-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .series-item-title {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .series-progress-container {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .series-progress-bar {
          flex: 1;
          height: 6px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .series-progress-fill {
          height: 100%;
          background: var(--color-accent);
          border-radius: var(--radius-full);
          transition: width var(--transition-slow);
        }

        .series-progress-text {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          min-width: 40px;
          text-align: right;
        }

        .series-item-meta {
          display: flex;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
        }

        .series-type-badge {
          color: var(--color-text-muted);
          text-transform: capitalize;
        }

        .series-status-badge {
          text-transform: capitalize;
          font-weight: var(--font-weight-medium);
        }

        .episode-timeline-panel {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          overflow-y: auto;
        }

        .episode-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-4);
        }

        .episode-panel-subtitle {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-top: var(--space-1);
        }

        .episode-panel-stats {
          display: flex;
          gap: var(--space-4);
        }

        .stat-item {
          text-align: center;
        }

        .stat-item .stat-value {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-accent);
        }

        .stat-item .stat-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }

        .milestone-bar {
          display: flex;
          justify-content: space-between;
          margin: var(--space-6) 0;
          padding: 0 var(--space-4);
          position: relative;
        }

        .milestone-bar::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-bg-tertiary);
          transform: translateY(-50%);
          z-index: 0;
        }

        .milestone {
          position: relative;
          z-index: 1;
        }

        .milestone-marker {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-bg-tertiary);
          border: 2px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          font-weight: var(--font-weight-semibold);
        }

        .milestone.reached .milestone-marker {
          background: var(--color-accent);
          border-color: var(--color-accent);
          color: var(--color-bg-primary);
        }

        .episode-timeline {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .episode-card {
          display: flex;
          gap: var(--space-4);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          transition: all var(--transition-fast);
        }

        .episode-card:hover {
          background: var(--color-bg-card-hover);
        }

        .episode-number {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-bold);
          color: var(--color-accent);
          min-width: 48px;
        }

        .episode-content {
          flex: 1;
        }

        .episode-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-2);
        }

        .episode-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
        }

        .episode-status-badge {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
          text-transform: capitalize;
        }

        .episode-description {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-bottom: var(--space-2);
        }

        .episode-meta {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-3);
        }

        .episode-date,
        .episode-duration {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }

        .episode-date.published {
          color: var(--color-success);
        }

        .episode-actions {
          display: flex;
          gap: var(--space-2);
        }

        .episode-status-select {
          padding: var(--space-2);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          font-size: var(--font-size-xs);
          cursor: pointer;
        }

        .episode-status-select:focus {
          outline: none;
          border-color: var(--color-accent);
        }

        .empty-timeline {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--color-text-muted);
          text-align: center;
        }

        .empty-timeline svg {
          margin-bottom: var(--space-4);
          opacity: 0.5;
        }

        .empty-timeline h3 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          margin-bottom: var(--space-2);
        }

        .empty-timeline p {
          font-size: var(--font-size-sm);
        }

        @media (max-width: 1024px) {
          .series-layout {
            grid-template-columns: 1fr;
          }

          .series-list-panel {
            max-height: 300px;
          }
        }

        @media (max-width: 768px) {
          .episode-panel-header {
            flex-direction: column;
            gap: var(--space-4);
          }

          .episode-panel-stats {
            width: 100%;
            justify-content: space-around;
          }
        }
      `}</style>
    </>
  )
}
