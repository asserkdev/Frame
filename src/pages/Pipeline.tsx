import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { PIPELINE_STAGES, CONTENT_TYPES, PLATFORMS, PipelineStage, ContentType } from '../lib/supabase'

interface PipelineItem {
  id: string
  title: string
  content_type: ContentType
  platforms: string[]
  stage: PipelineStage
  project_id: string
}

const MOCK_PIPELINE_ITEMS: PipelineItem[] = [
  { id: '1', title: 'Building a SaaS App', content_type: 'video', platforms: ['youtube', 'tiktok'], stage: 'script', project_id: 'p1' },
  { id: '2', title: 'Top 10 VS Code Tips', content_type: 'video', platforms: ['youtube'], stage: 'record', project_id: 'p2' },
  { id: '3', title: 'React Hooks Tutorial', content_type: 'course', platforms: ['youtube', 'blog'], stage: 'edit', project_id: 'p3' },
  { id: '4', title: 'Productivity Thread', content_type: 'social', platforms: ['twitter', 'linkedin'], stage: 'research', project_id: 'p4' },
  { id: '5', title: 'Indie Hacker Interview', content_type: 'podcast', platforms: ['podcast'], stage: 'outline', project_id: 'p5' },
  { id: '6', title: 'CSS Grid Guide', content_type: 'blog', platforms: ['blog'], stage: 'thumbnail', project_id: 'p6' },
  { id: '7', title: 'AI Tools Review', content_type: 'video', platforms: ['youtube', 'tiktok'], stage: 'seo', project_id: 'p7' },
  { id: '8', title: 'DevOps Basics', content_type: 'video', platforms: ['youtube'], stage: 'upload', project_id: 'p8' },
  { id: '9', title: 'Career Advice', content_type: 'podcast', platforms: ['podcast', 'youtube'], stage: 'published', project_id: 'p9' },
  { id: '10', title: 'TypeScript Tips', content_type: 'video', platforms: ['youtube'], stage: 'script', project_id: 'p10' },
  { id: '11', title: 'Startup Story', content_type: 'social', platforms: ['twitter'], stage: 'record', project_id: 'p11' },
  { id: '12', title: 'API Design Patterns', content_type: 'course', platforms: ['youtube', 'blog'], stage: 'research', project_id: 'p12' },
]

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

const CONTENT_TYPE_ICONS: Record<ContentType, JSX.Element> = {
  video: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  podcast: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    </svg>
  ),
  blog: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  social: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  course: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  other: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
}

export function Pipeline() {
  useAuth()
  const { showToast } = useToast()
  useNavigate()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<PipelineItem[]>(MOCK_PIPELINE_ITEMS)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<PipelineStage | null>(null)
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'all'>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredItems = items.filter(item => {
    const matchesType = contentTypeFilter === 'all' || item.content_type === contentTypeFilter
    const matchesPlatform = platformFilter === 'all' || item.platforms.includes(platformFilter)
    return matchesType && matchesPlatform
  })

  const getItemsByStage = (stage: PipelineStage) => {
    return filteredItems.filter(item => item.stage === stage)
  }

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(stage)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault()
    if (draggedItem) {
      setItems(prev => prev.map(item => 
        item.id === draggedItem ? { ...item, stage } : item
      ))
      showToast('success', `Moved to ${stage}`)
    }
    setDraggedItem(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverColumn(null)
  }

  const moveToNextStage = (item: PipelineItem) => {
    const currentIndex = PIPELINE_STAGES.findIndex(s => s.value === item.stage)
    if (currentIndex < PIPELINE_STAGES.length - 1) {
      const nextStage = PIPELINE_STAGES[currentIndex + 1].value
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, stage: nextStage as PipelineStage } : i
      ))
      showToast('success', `Moved to ${nextStage}`)
    }
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      research: '#60a5fa',
      outline: '#a78bfa',
      script: '#f472b6',
      record: '#fbbf24',
      edit: '#fb923c',
      thumbnail: '#a3e635',
      seo: '#34d399',
      upload: '#22d3ee',
      published: '#818cf8',
    }
    return colors[stage] || '#a78bfa'
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
        <h1 className="main-header-title">Content Pipeline</h1>
        <div className="main-header-actions">
          <select 
            className="form-input"
            style={{ width: 'auto', minWidth: '140px' }}
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value as ContentType | 'all')}
          >
            <option value="all">All Types</option>
            {CONTENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select 
            className="form-input"
            style={{ width: 'auto', minWidth: '140px' }}
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="all">All Platforms</option>
            {PLATFORMS.map(platform => (
              <option key={platform.value} value={platform.value}>{platform.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pipeline-container">
        <div className="kanban-board">
          {PIPELINE_STAGES.map((stage) => {
            const stageItems = getItemsByStage(stage.value as PipelineStage)
            const isOver = dragOverColumn === stage.value
            
            return (
              <div 
                key={stage.value}
                className={`kanban-column ${isOver ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, stage.value as PipelineStage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.value as PipelineStage)}
              >
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <span 
                      className="kanban-column-dot"
                      style={{ backgroundColor: getStageColor(stage.value) }}
                    />
                    {stage.label}
                  </div>
                  <span className="kanban-column-count">{stageItems.length}</span>
                </div>
                <div className="kanban-column-content">
                  {stageItems.length === 0 ? (
                    <div className="kanban-empty">
                      <p>No items</p>
                    </div>
                  ) : (
                    stageItems.map(item => (
                      <div 
                        key={item.id}
                        className={`kanban-card ${draggedItem === item.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="kanban-card-header">
                          <span className="kanban-card-type">
                            {CONTENT_TYPE_ICONS[item.content_type]}
                          </span>
                          <button 
                            className="kanban-card-move"
                            onClick={() => moveToNextStage(item)}
                            title="Move to next stage"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </div>
                        <div className="kanban-card-title">{item.title}</div>
                        <div className="kanban-card-platforms">
                          {item.platforms.map(platform => (
                            <span 
                              key={platform}
                              className="kanban-platform-dot"
                              style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                              title={platform}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        .pipeline-container {
          padding: var(--space-4);
          height: calc(100vh - var(--header-height) - var(--space-8));
          overflow-x: auto;
        }

        .kanban-board {
          display: flex;
          gap: var(--space-3);
          min-width: max-content;
          height: 100%;
        }

        .kanban-column {
          width: 260px;
          min-width: 260px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          transition: all var(--transition-fast);
        }

        .kanban-column.drag-over {
          background: var(--color-bg-tertiary);
          box-shadow: inset 0 0 0 2px var(--color-accent);
        }

        .kanban-column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .kanban-column-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
        }

        .kanban-column-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .kanban-column-count {
          background: var(--color-bg-tertiary);
          color: var(--color-text-muted);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
          min-width: 20px;
          text-align: center;
        }

        .kanban-column-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .kanban-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80px;
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-tertiary);
          font-size: var(--font-size-sm);
        }

        .kanban-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          cursor: grab;
          transition: all var(--transition-fast);
        }

        .kanban-card:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .kanban-card.dragging {
          opacity: 0.5;
          cursor: grabbing;
        }

        .kanban-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .kanban-card-type {
          color: var(--color-text-muted);
        }

        .kanban-card-move {
          background: transparent;
          border: none;
          color: var(--color-text-tertiary);
          cursor: pointer;
          padding: 2px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .kanban-card-move:hover {
          background: var(--color-accent-muted);
          color: var(--color-accent);
        }

        .kanban-card-title {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
          line-height: 1.4;
          margin-bottom: var(--space-2);
        }

        .kanban-card-platforms {
          display: flex;
          gap: var(--space-1);
        }

        .kanban-platform-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .kanban-column {
            width: 220px;
            min-width: 220px;
          }
        }
      `}</style>
    </>
  )
}
