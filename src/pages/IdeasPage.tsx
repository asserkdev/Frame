import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { supabase, FrameIdea, IdeaStatus } from '../lib/supabase'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const STATUS_OPTIONS: { value: IdeaStatus; label: string; className: string }[] = [
  { value: 'idea', label: 'Idea', className: 'idea' },
  { value: 'in-progress', label: 'In Progress', className: 'in-progress' },
  { value: 'ready', label: 'Ready', className: 'ready' },
  { value: 'published', label: 'Published', className: 'published' },
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '')
}

export function IdeasPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [ideas, setIdeas] = useState<FrameIdea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<FrameIdea | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all')
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your idea notes here...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (!selectedIdea) return
      
      const html = editor.getHTML()
      const wordCount = stripHtml(html).split(/\s+/).filter(Boolean).length
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        if (html !== lastSavedRef.current) {
          await saveIdea({ content: html, word_count: wordCount })
        }
      }, 1000)
    },
  })

  useEffect(() => {
    if (user) {
      loadIdeas()
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [user])

  useEffect(() => {
    if (selectedIdea && editor) {
      const currentContent = editor.getHTML()
      if (currentContent !== selectedIdea.content) {
        editor.commands.setContent(selectedIdea.content || '')
      }
      lastSavedRef.current = selectedIdea.content || ''
    }
  }, [selectedIdea?.id, editor])

  const loadIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('frame_ideas')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setIdeas(data || [])
      
      if (data && data.length > 0 && !selectedIdea) {
        setSelectedIdea(data[0])
      }
    } catch (error) {
      console.error('Error loading ideas:', error)
      showToast('error', 'Failed to load ideas')
    } finally {
      setLoading(false)
    }
  }

  const saveIdea = async (updates: Partial<FrameIdea>) => {
    if (!selectedIdea) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('frame_ideas')
        .update(updates)
        .eq('id', selectedIdea.id)

      if (error) throw error

      setIdeas(prev => prev.map(idea => 
        idea.id === selectedIdea.id 
          ? { ...idea, ...updates, updated_at: new Date().toISOString() }
          : idea
      ))
      setSelectedIdea(prev => prev ? { ...prev, ...updates } : null)
      lastSavedRef.current = updates.content || lastSavedRef.current
    } catch (error) {
      console.error('Error saving idea:', error)
      showToast('error', 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const createIdea = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('frame_ideas')
        .insert({
          user_id: user.id,
          title: 'Untitled Idea',
          content: '',
          status: 'idea',
        })
        .select()
        .single()

      if (error) throw error

      setIdeas(prev => [data, ...prev])
      setSelectedIdea(data)
    } catch (error) {
      console.error('Error creating idea:', error)
      showToast('error', 'Failed to create idea')
    }
  }

  const deleteIdea = async () => {
    if (!selectedIdea) return

    try {
      const { error } = await supabase
        .from('frame_ideas')
        .delete()
        .eq('id', selectedIdea.id)

      if (error) throw error

      setIdeas(prev => prev.filter(i => i.id !== selectedIdea.id))
      setSelectedIdea(null)
      setShowDeleteModal(false)
      showToast('success', 'Idea deleted')
      
      if (ideas.length > 1) {
        const remaining = ideas.filter(i => i.id !== selectedIdea.id)
        setSelectedIdea(remaining[0])
      }
    } catch (error) {
      console.error('Error deleting idea:', error)
      showToast('error', 'Failed to delete idea')
    }
  }

  const updateTitle = (title: string) => {
    if (!selectedIdea) return
    setSelectedIdea(prev => prev ? { ...prev, title } : null)
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveIdea({ title })
    }, 500)
  }

  const updateStatus = (status: IdeaStatus) => {
    saveIdea({ status })
  }

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stripHtml(idea.content).toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <>
      <div className="ideas-sidebar">
        <div className="ideas-sidebar-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: 'none' }}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={createIdea} style={{ marginLeft: 'var(--space-2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <div style={{ padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div className="status-selector">
            <span
              className={`status-badge ${statusFilter === 'all' ? 'selected' : ''}`}
              onClick={() => setStatusFilter('all')}
              style={{ background: statusFilter === 'all' ? 'var(--color-bg-tertiary)' : 'transparent' }}
            >
              All
            </span>
            {STATUS_OPTIONS.map(opt => (
              <span
                key={opt.value}
                className={`status-badge ${statusFilter === opt.value ? 'selected' : ''}`}
                onClick={() => setStatusFilter(opt.value)}
                style={{ background: statusFilter === opt.value ? 'var(--color-bg-tertiary)' : 'transparent' }}
              >
                {opt.label}
              </span>
            ))}
          </div>
        </div>

        <div className="ideas-sidebar-content">
          {filteredIdeas.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="empty-state-title" style={{ fontSize: 'var(--font-size-base)' }}>
                {searchQuery ? 'No matching ideas' : 'No ideas yet'}
              </p>
              <p className="empty-state-description" style={{ fontSize: 'var(--font-size-xs)' }}>
                {searchQuery ? 'Try a different search term' : 'Create your first idea to get started'}
              </p>
            </div>
          ) : (
            filteredIdeas.map(idea => (
              <div
                key={idea.id}
                className={`idea-card ${selectedIdea?.id === idea.id ? 'active' : ''}`}
                onClick={() => setSelectedIdea(idea)}
              >
                <div className="idea-card-title">{idea.title}</div>
                <div className="idea-card-meta">
                  <span className={`status-badge ${idea.status}`}>{idea.status}</span>
                  <span>{formatDate(idea.updated_at)}</span>
                </div>
                {idea.content && (
                  <div className="idea-card-excerpt">
                    {stripHtml(idea.content)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="main-content">
        {selectedIdea ? (
          <div className="editor-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {saving ? 'Saving...' : 'Autosaved'}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowDeleteModal(true)}
                  style={{ color: 'var(--color-error)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>

            <input
              type="text"
              className="editor-title"
              placeholder="Idea title..."
              value={selectedIdea.title}
              onChange={(e) => updateTitle(e.target.value)}
            />

            <div className="editor-meta">
              <div className="status-selector">
                {STATUS_OPTIONS.map(opt => (
                  <span
                    key={opt.value}
                    className={`status-badge ${opt.className} ${selectedIdea.status === opt.value ? 'selected' : ''}`}
                    onClick={() => updateStatus(opt.value)}
                  >
                    {opt.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="editor-body">
              <EditorContent editor={editor} />
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ flex: 1 }}>
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 className="empty-state-title">Select an idea</h2>
            <p className="empty-state-description">
              Choose an idea from the sidebar or create a new one
            </p>
            <button className="btn btn-primary" onClick={createIdea}>
              Create New Idea
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Delete Idea</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Are you sure you want to delete "{selectedIdea?.title}"? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn" onClick={deleteIdea} style={{ background: 'var(--color-error)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
