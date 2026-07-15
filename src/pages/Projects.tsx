import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { CONTENT_TYPES, PLATFORMS, PROJECT_STATUSES, ProjectStatus, ContentType } from '../lib/supabase'

interface Project {
  id: string
  title: string
  description: string | null
  content_type: ContentType
  platforms: string[]
  status: ProjectStatus
  priority: number
  created_at: string
  updated_at: string
  next_action: string | null
}

const MOCK_PROJECTS: Project[] = [
  { id: '1', title: 'Building a SaaS App in 2024', description: 'Complete tutorial on building a SaaS application', content_type: 'video', platforms: ['youtube', 'tiktok'], status: 'production', priority: 1, created_at: '2024-01-10', updated_at: '2024-01-15', next_action: 'Record narration' },
  { id: '2', title: 'Top 10 VS Code Extensions', description: 'Best VS Code extensions for developers', content_type: 'video', platforms: ['youtube'], status: 'research', priority: 2, created_at: '2024-01-08', updated_at: '2024-01-14', next_action: 'Research competitors' },
  { id: '3', title: 'React Hooks Deep Dive', description: 'Comprehensive course on React hooks', content_type: 'course', platforms: ['youtube', 'blog'], status: 'planning', priority: 1, created_at: '2024-01-05', updated_at: '2024-01-13', next_action: 'Create outline' },
  { id: '4', title: 'Productivity Tips Thread', description: 'Twitter thread with productivity tips', content_type: 'social', platforms: ['twitter', 'linkedin'], status: 'review', priority: 3, created_at: '2024-01-03', updated_at: '2024-01-12', next_action: 'Final review' },
  { id: '5', title: 'Indie Hacker Interview #15', description: 'Interview with successful indie hacker', content_type: 'podcast', platforms: ['podcast', 'youtube'], status: 'published', priority: 2, created_at: '2024-01-01', updated_at: '2024-01-11', next_action: null },
  { id: '6', title: 'CSS Grid Complete Guide', description: 'Full CSS Grid tutorial', content_type: 'blog', platforms: ['blog'], status: 'concept', priority: 3, created_at: '2024-01-16', updated_at: '2024-01-16', next_action: 'Initial research' },
  { id: '7', title: 'AI Tools Review 2024', description: 'Review of latest AI development tools', content_type: 'video', platforms: ['youtube', 'tiktok'], status: 'production', priority: 1, created_at: '2024-01-07', updated_at: '2024-01-15', next_action: 'Edit footage' },
  { id: '8', title: 'DevOps Best Practices', description: 'DevOps workflow and tools', content_type: 'course', platforms: ['youtube'], status: 'archived', priority: 2, created_at: '2023-12-20', updated_at: '2024-01-05', next_action: null },
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  podcast: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    </svg>
  ),
  blog: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  social: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  course: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  other: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
}

type SortOption = 'date' | 'priority' | 'status' | 'title'
type ViewMode = 'grid' | 'list'

export function Projects() {
  useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    content_type: 'video' as ContentType,
    platforms: ['youtube'] as string[],
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredProjects = projects
    .filter(project => {
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      const matchesType = typeFilter === 'all' || project.content_type === typeFilter
      const matchesPlatform = platformFilter === 'all' || project.platforms.includes(platformFilter)
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesType && matchesPlatform && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return a.priority - b.priority
        case 'status':
          return a.status.localeCompare(b.status)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'date':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

  const getStatusColor = (status: string) => {
    const statusInfo = PROJECT_STATUSES.find(s => s.value === status)
    return statusInfo?.color || '#71717a'
  }

  const handleCreateProject = () => {
    if (!newProject.title.trim()) {
      showToast('error', 'Please enter a project title')
      return
    }

    const project: Project = {
      id: String(Date.now()),
      title: newProject.title,
      description: newProject.description || null,
      content_type: newProject.content_type,
      platforms: newProject.platforms,
      status: 'concept',
      priority: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      next_action: 'Initial research',
    }

    setProjects(prev => [project, ...prev])
    setShowCreateModal(false)
    setNewProject({ title: '', description: '', content_type: 'video', platforms: ['youtube'] })
    showToast('success', 'Project created successfully')
  }

  const togglePlatform = (platform: string) => {
    setNewProject(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
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
        <h1 className="main-header-title">Projects</h1>
        <div className="main-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </button>
        </div>
      </div>

      <div className="projects-container">
        {/* Filters Bar */}
        <div className="projects-filters">
          <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              className="form-input filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              {PROJECT_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select 
              className="form-input filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ContentType | 'all')}
            >
              <option value="all">All Types</option>
              {CONTENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select 
              className="form-input filter-select"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="all">All Platforms</option>
              {PLATFORMS.map(platform => (
                <option key={platform.value} value={platform.value}>{platform.label}</option>
              ))}
            </select>

            <select 
              className="form-input filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>

          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Projects Display */}
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <h2 className="empty-state-title">No projects found</h2>
            <p className="empty-state-description">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || platformFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first project to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && platformFilter === 'all' && (
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                Create Project
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="projects-grid">
            {filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <span className="project-type-badge" style={{ color: 'var(--color-accent)' }}>
                    {CONTENT_TYPE_ICONS[project.content_type]}
                    {CONTENT_TYPES.find(t => t.value === project.content_type)?.label}
                  </span>
                  <span 
                    className="project-status-badge"
                    style={{ backgroundColor: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}
                  >
                    {PROJECT_STATUSES.find(s => s.value === project.status)?.label}
                  </span>
                </div>
                <h3 className="project-card-title">{project.title}</h3>
                {project.description && (
                  <p className="project-card-description">{project.description}</p>
                )}
                <div className="project-card-platforms">
                  {project.platforms.map(platform => (
                    <span 
                      key={platform}
                      className="project-platform-badge"
                      style={{ backgroundColor: PLATFORM_COLORS[platform] + '20', color: PLATFORM_COLORS[platform] }}
                    >
                      {platform}
                    </span>
                  ))}
                </div>
                {project.next_action && (
                  <div className="project-card-next-action">
                    <span className="next-action-label">Next:</span> {project.next_action}
                  </div>
                )}
                <div className="project-card-footer">
                  <span className="project-date">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="projects-list">
            {filteredProjects.map(project => (
              <div key={project.id} className="project-list-item">
                <div className="project-list-main">
                  <div className="project-list-type">
                    {CONTENT_TYPE_ICONS[project.content_type]}
                  </div>
                  <div className="project-list-info">
                    <h3 className="project-list-title">{project.title}</h3>
                    {project.description && (
                      <p className="project-list-description">{project.description}</p>
                    )}
                  </div>
                </div>
                <div className="project-list-platforms">
                  {project.platforms.map(platform => (
                    <span 
                      key={platform}
                      className="platform-dot"
                      style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                      title={platform}
                    />
                  ))}
                </div>
                <span 
                  className="project-list-status"
                  style={{ backgroundColor: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}
                >
                  {PROJECT_STATUSES.find(s => s.value === project.status)?.label}
                </span>
                {project.next_action && (
                  <div className="project-list-action">
                    <span className="next-action-label">Next:</span> {project.next_action}
                  </div>
                )}
                <div className="project-list-date">
                  {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="modal-title">Create New Project</h3>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }} style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Project Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter project title..."
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Description (optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Brief description of the project..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Content Type</label>
                <div className="view-toggle" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {CONTENT_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      className={`view-toggle-btn ${newProject.content_type === type.value ? 'active' : ''}`}
                      onClick={() => setNewProject({ ...newProject, content_type: type.value as ContentType })}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Platforms</label>
                <div className="platform-selector">
                  {PLATFORMS.map(platform => (
                    <button
                      key={platform.value}
                      type="button"
                      className={`platform-option ${newProject.platforms.includes(platform.value) ? 'selected' : ''}`}
                      onClick={() => togglePlatform(platform.value)}
                      style={{
                        borderColor: newProject.platforms.includes(platform.value) ? PLATFORM_COLORS[platform.value] : undefined,
                        backgroundColor: newProject.platforms.includes(platform.value) ? PLATFORM_COLORS[platform.value] + '20' : undefined,
                      }}
                    >
                      <span 
                        className="platform-dot"
                        style={{ backgroundColor: PLATFORM_COLORS[platform.value] }}
                      />
                      {platform.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .projects-container {
          padding: var(--space-6);
        }

        .projects-filters {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .filter-select {
          width: auto;
          min-width: 140px;
          padding: var(--space-2) var(--space-3);
          font-size: var(--font-size-sm);
        }

        .view-toggle {
          display: flex;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          padding: 2px;
        }

        .view-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-2);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .view-toggle-btn:hover {
          color: var(--color-text-secondary);
        }

        .view-toggle-btn.active {
          background: var(--color-bg-card);
          color: var(--color-accent);
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-4);
        }

        .project-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          transition: all var(--transition-fast);
        }

        .project-card:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .project-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-3);
        }

        .project-type-badge {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .project-status-badge {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
        }

        .project-card-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-2);
        }

        .project-card-description {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-bottom: var(--space-3);
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .project-card-platforms {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .project-platform-badge {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          padding: 2px var(--space-2);
          border-radius: var(--radius-sm);
          text-transform: capitalize;
        }

        .project-card-next-action {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          padding: var(--space-2);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-3);
        }

        .next-action-label {
          color: var(--color-accent);
          font-weight: var(--font-weight-medium);
        }

        .project-card-footer {
          display: flex;
          justify-content: flex-end;
        }

        .project-date {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
        }

        .projects-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .project-list-item {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          transition: all var(--transition-fast);
        }

        .project-list-item:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border);
        }

        .project-list-main {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          flex: 1;
          min-width: 0;
        }

        .project-list-type {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-accent-muted);
          border-radius: var(--radius-md);
          color: var(--color-accent);
          flex-shrink: 0;
        }

        .project-list-info {
          min-width: 0;
        }

        .project-list-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
        }

        .project-list-description {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-top: var(--space-1);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .project-list-platforms {
          display: flex;
          gap: var(--space-1);
        }

        .platform-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .project-list-status {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
          white-space: nowrap;
        }

        .project-list-action {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          min-width: 200px;
        }

        .project-list-date {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
          min-width: 80px;
          text-align: right;
        }

        .platform-selector {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .platform-option {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .platform-option:hover {
          border-color: var(--color-border);
        }

        .platform-option.selected {
          color: var(--color-text-primary);
        }

        @media (max-width: 768px) {
          .projects-filters {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-group {
            flex-direction: column;
          }
          
          .filter-select {
            width: 100%;
          }
          
          .project-list-item {
            flex-wrap: wrap;
          }
          
          .project-list-action {
            min-width: 100%;
            margin-top: var(--space-2);
          }
        }
      `}</style>
    </>
  )
}
