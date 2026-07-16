import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { supabase, FrameSeries } from '../lib/supabase'

export function Series() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [series, setSeries] = useState<FrameSeries[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSeries, setNewSeries] = useState({
    title: '',
    description: '',
    content_type: 'video',
  })

  const fetchSeries = useCallback(async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('frame_series')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setSeries(data || [])
    } catch (error: any) {
      console.error('Error fetching series:', error)
      showToast('error', 'Failed to load series')
    } finally {
      setLoading(false)
    }
  }, [user, showToast])

  useEffect(() => {
    fetchSeries()
  }, [fetchSeries])

  const handleCreateSeries = async () => {
    if (!newSeries.title.trim()) {
      showToast('error', 'Please enter a title')
      return
    }

    try {
      const { error } = await supabase
        .from('frame_series')
        .insert({
          title: newSeries.title,
          description: newSeries.description || null,
          content_type: newSeries.content_type,
        })

      if (error) throw error
      
      showToast('success', 'Series created')
      setShowCreateModal(false)
      setNewSeries({ title: '', description: '', content_type: 'video' })
      fetchSeries()
    } catch (error: any) {
      console.error('Error creating series:', error)
      showToast('error', 'Failed to create series')
    }
  }

  const handleDeleteSeries = async (id: string) => {
    if (!confirm('Delete this series?')) return

    try {
      const { error } = await supabase
        .from('frame_series')
        .delete()
        .eq('id', id)

      if (error) throw error
      showToast('success', 'Series deleted')
      fetchSeries()
    } catch (error: any) {
      console.error('Error deleting series:', error)
      showToast('error', 'Failed to delete series')
    }
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
        <h1 className="main-header-title">Series</h1>
        <div className="main-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Series
          </button>
        </div>
      </div>

      <div className="main-content">
        {series.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <h2 className="empty-state-title">No series yet</h2>
            <p className="empty-state-description">
              Create your first series to organize multi-episode content
            </p>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Series
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {series.map(s => (
              <div key={s.id} className="project-card">
                <div className="project-card-header">
                  <span className="project-status-badge" style={{ backgroundColor: '#a78bfa20', color: '#a78bfa' }}>
                    {s.content_type}
                  </span>
                  <span className="project-status-badge" style={{ backgroundColor: '#34d39920', color: '#34d399' }}>
                    {s.status}
                  </span>
                </div>
                <h3 className="project-card-title">{s.title}</h3>
                {s.description && (
                  <p className="project-card-description">{s.description}</p>
                )}
                <div className="project-card-footer">
                  <span className="project-date">
                    {s.completed_episodes}/{s.total_episodes} episodes
                  </span>
                  <button 
                    className="btn btn-small btn-dangerous"
                    onClick={() => handleDeleteSeries(s.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="modal-title">Create New Series</h3>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateSeries(); }} style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Series name..."
                  value={newSeries.title}
                  onChange={(e) => setNewSeries({ ...newSeries, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  placeholder="What is this series about?"
                  value={newSeries.description}
                  onChange={(e) => setNewSeries({ ...newSeries, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Content Type</label>
                <select
                  className="form-input"
                  value={newSeries.content_type}
                  onChange={(e) => setNewSeries({ ...newSeries, content_type: e.target.value })}
                >
                  <option value="video">Video</option>
                  <option value="podcast">Podcast</option>
                  <option value="blog">Blog</option>
                  <option value="course">Course</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
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
    </>
  )
}
