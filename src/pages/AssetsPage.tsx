import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { supabase, FrameAsset, FrameIdeaSelect, AssetType } from '../lib/supabase'

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'link', label: 'Link' },
  { value: 'file', label: 'File' },
  { value: 'note', label: 'Note' },
]

export function AssetsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [assets, setAssets] = useState<FrameAsset[]>([])
  const [ideas, setIdeas] = useState<FrameIdeaSelect[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState<FrameAsset | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')
  const [formData, setFormData] = useState({
    title: '',
    asset_type: 'link' as AssetType,
    url: '',
    notes: '',
    idea_id: '' as string | null,
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      const [assetsResult, ideasResult] = await Promise.all([
        supabase
          .from('frame_assets')
          .select('*, idea:frame_ideas(title)')
          .order('created_at', { ascending: false }),
        supabase
          .from('frame_ideas')
          .select('id, title')
          .order('title'),
      ])

      if (assetsResult.error) throw assetsResult.error
      if (ideasResult.error) throw ideasResult.error

      const assetsWithIdeaTitle = (assetsResult.data || []).map(asset => ({
        ...asset,
        idea_title: (asset as any).idea?.title,
      }))

      setAssets(assetsWithIdeaTitle)
      setIdeas(ideasResult.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      showToast('error', 'Failed to load assets')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingAsset(null)
    setFormData({
      title: '',
      asset_type: 'link',
      url: '',
      notes: '',
      idea_id: null,
    })
    setShowModal(true)
  }

  const openEditModal = (asset: FrameAsset) => {
    setEditingAsset(asset)
    setFormData({
      title: asset.title,
      asset_type: asset.asset_type,
      url: asset.url || '',
      notes: asset.notes || '',
      idea_id: asset.idea_id,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingAsset(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (editingAsset) {
        const { error } = await supabase
          .from('frame_assets')
          .update({
            title: formData.title,
            asset_type: formData.asset_type,
            url: formData.url || null,
            notes: formData.notes || null,
            idea_id: formData.idea_id || null,
          })
          .eq('id', editingAsset.id)

        if (error) throw error
        showToast('success', 'Asset updated')
      } else {
        const { error } = await supabase
          .from('frame_assets')
          .insert({
            user_id: user.id,
            title: formData.title,
            asset_type: formData.asset_type,
            url: formData.url || null,
            notes: formData.notes || null,
            idea_id: formData.idea_id || null,
          })

        if (error) throw error
        showToast('success', 'Asset created')
      }

      closeModal()
      loadData()
    } catch (error) {
      console.error('Error saving asset:', error)
      showToast('error', 'Failed to save asset')
    }
  }

  const deleteAsset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('frame_assets')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAssets(prev => prev.filter(a => a.id !== id))
      showToast('success', 'Asset deleted')
    } catch (error) {
      console.error('Error deleting asset:', error)
      showToast('error', 'Failed to delete asset')
    }
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || asset.asset_type === typeFilter
    return matchesSearch && matchesType
  })

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'link':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )
      case 'file':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        )
      case 'note':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        )
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
        <h1 className="main-header-title">Assets</h1>
        <div className="main-header-actions">
          <div className="search-bar">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${typeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All
            </button>
            {ASSET_TYPES.map(type => (
              <button
                key={type.value}
                className={`view-toggle-btn ${typeFilter === type.value ? 'active' : ''}`}
                onClick={() => setTypeFilter(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Asset
          </button>
        </div>
      </div>

      <div className="asset-grid" style={{ padding: 'var(--space-6)' }}>
        {filteredAssets.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            <h2 className="empty-state-title">No assets yet</h2>
            <p className="empty-state-description">
              Add reference links, files, and notes to support your creative work
            </p>
            <button className="btn btn-primary" onClick={openCreateModal}>
              Add Your First Asset
            </button>
          </div>
        ) : (
          filteredAssets.map(asset => (
            <div key={asset.id} className="asset-card">
              <div className="asset-card-header">
                <div className="asset-icon">
                  {getAssetIcon(asset.asset_type)}
                </div>
                <div className="asset-info">
                  <div className="asset-title">{asset.title}</div>
                  <div className="asset-type">{asset.asset_type}</div>
                </div>
                <div className="dropdown">
                  <button
                    className="btn btn-icon btn-ghost"
                    onClick={() => openEditModal(asset)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>
                </div>
              </div>

              {asset.url && (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="asset-link"
                  onClick={(e) => {
                    if (!asset.url?.startsWith('http')) {
                      e.preventDefault()
                      showToast('info', 'Invalid URL format')
                    }
                  }}
                >
                  {asset.url.length > 50 ? asset.url.substring(0, 50) + '...' : asset.url}
                </a>
              )}

              {asset.notes && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                  {asset.notes.length > 100 ? asset.notes.substring(0, 100) + '...' : asset.notes}
                </p>
              )}

              {asset.idea_title && (
                <div className="asset-linked-idea">
                  Linked to: {asset.idea_title}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="modal-title">{editingAsset ? 'Edit Asset' : 'Add Asset'}</h3>

            <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Asset title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Type</label>
                <div className="view-toggle" style={{ display: 'inline-flex' }}>
                  {ASSET_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      className={`view-toggle-btn ${formData.asset_type === type.value ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, asset_type: type.value })}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.asset_type === 'link' && (
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Link to Idea (optional)</label>
                <select
                  className="form-input"
                  value={formData.idea_id || ''}
                  onChange={(e) => setFormData({ ...formData, idea_id: e.target.value || null })}
                >
                  <option value="">No linked idea</option>
                  {ideas.map(idea => (
                    <option key={idea.id} value={idea.id}>
                      {idea.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="modal-footer" style={{ marginTop: 0 }}>
                {editingAsset && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => deleteAsset(editingAsset.id)}
                    style={{ marginRight: 'auto', background: 'var(--color-error)' }}
                  >
                    Delete
                  </button>
                )}
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAsset ? 'Save Changes' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
