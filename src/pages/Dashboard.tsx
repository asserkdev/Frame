import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { PIPELINE_STAGES, PLATFORMS, ProjectStatus } from '../lib/supabase'

// Mock data for initial implementation
const MOCK_PROJECTS = [
  { id: '1', title: 'Building a SaaS in 2024', content_type: 'video', platforms: ['youtube', 'tiktok'], status: 'production' as ProjectStatus, updated_at: '2024-01-15' },
  { id: '2', title: 'Top 10 VS Code Extensions', content_type: 'video', platforms: ['youtube'], status: 'research' as ProjectStatus, updated_at: '2024-01-14' },
  { id: '3', title: 'React Hooks Deep Dive', content_type: 'course', platforms: ['youtube', 'blog'], status: 'planning' as ProjectStatus, updated_at: '2024-01-13' },
  { id: '4', title: 'Productivity Tips Thread', content_type: 'social', platforms: ['twitter', 'linkedin'], status: 'review' as ProjectStatus, updated_at: '2024-01-12' },
  { id: '5', title: 'Indie Hacker Interview', content_type: 'podcast', platforms: ['podcast', 'youtube'], status: 'published' as ProjectStatus, updated_at: '2024-01-11' },
]

const MOCK_PIPELINE_COUNTS: Record<string, number> = {
  research: 3,
  outline: 2,
  script: 4,
  record: 2,
  edit: 3,
  thumbnail: 1,
  seo: 2,
  upload: 1,
  published: 12,
}

const MOCK_UPCOMING = [
  { id: '1', title: 'SaaS Tutorial Part 1', scheduled_date: '2024-01-20', platforms: ['youtube'] },
  { id: '2', title: 'VS Code Tips Thread', scheduled_date: '2024-01-21', platforms: ['twitter'] },
  { id: '3', title: 'Podcast Episode 15', scheduled_date: '2024-01-22', platforms: ['podcast', 'youtube'] },
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

export function Dashboard() {
  useAuth()
  useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [projects] = useState(MOCK_PROJECTS)
  const [pipelineCounts] = useState(MOCK_PIPELINE_COUNTS)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const stats = {
    inProgress: projects.filter(p => ['production', 'planning', 'research'].includes(p.status)).length,
    scheduledThisWeek: 5,
    completedToday: 1,
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      concept: '#a78bfa',
      research: '#60a5fa',
      planning: '#fbbf24',
      production: '#f472b6',
      review: '#a3e635',
      published: '#34d399',
      archived: '#71717a',
    }
    return colors[status] || '#71717a'
  }

  const getContentIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
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
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      ),
      blog: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
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
    }
    return icons[type] || icons.video
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
        <h1 className="main-header-title">Dashboard</h1>
        <div className="main-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/projects')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Pipeline Overview */}
        <section className="dashboard-section">
          <h2 className="section-title">Content Pipeline</h2>
          <div className="pipeline-overview">
            {PIPELINE_STAGES.map((stage) => (
              <div 
                key={stage.value} 
                className="pipeline-stage-card"
                onClick={() => navigate('/pipeline')}
                style={{ cursor: 'pointer' }}
              >
                <div className="pipeline-stage-count" style={{ color: 'var(--color-accent)' }}>
                  {pipelineCounts[stage.value] || 0}
                </div>
                <div className="pipeline-stage-label">{stage.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="dashboard-section">
          <h2 className="section-title">Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
                {stats.inProgress}
              </div>
              <div className="stat-label">Projects In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                {stats.scheduledThisWeek}
              </div>
              <div className="stat-label">Scheduled This Week</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                {stats.completedToday}
              </div>
              <div className="stat-label">Completed Today</div>
            </div>
          </div>
        </section>

        <div className="dashboard-grid">
          {/* Recent Projects */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Recent Projects</h2>
              <button className="btn btn-ghost" onClick={() => navigate('/projects')}>
                View All
              </button>
            </div>
            <div className="recent-projects-list">
              {projects.slice(0, 5).map((project) => (
                <div 
                  key={project.id} 
                  className="recent-project-card"
                  onClick={() => navigate('/projects')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="project-type-icon">
                    {getContentIcon(project.content_type)}
                  </div>
                  <div className="project-info">
                    <div className="project-title">{project.title}</div>
                    <div className="project-meta">
                      <span 
                        className="project-status-dot"
                        style={{ backgroundColor: getStatusColor(project.status) }}
                      />
                      {project.status}
                    </div>
                  </div>
                  <div className="project-platforms">
                    {project.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="platform-dot"
                        style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                        title={platform}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions & Upcoming */}
          <section className="dashboard-sidebar">
            <div className="quick-actions-card">
              <h2 className="section-title">Quick Actions</h2>
              <div className="quick-actions-list">
                <button className="quick-action-btn" onClick={() => navigate('/projects')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Project
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/calendar')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Schedule Content
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/trending')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  Find Trending Topics
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/optimizer')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Optimize Content
                </button>
              </div>
            </div>

            <div className="upcoming-schedule-card">
              <h2 className="section-title">Upcoming Schedule</h2>
              <div className="upcoming-list">
                {MOCK_UPCOMING.map((item) => (
                  <div key={item.id} className="upcoming-item">
                    <div className="upcoming-date">
                      {new Date(item.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="upcoming-title">{item.title}</div>
                    <div className="upcoming-platforms">
                      {item.platforms.map((p) => (
                        <span
                          key={p}
                          className="platform-badge"
                          style={{ backgroundColor: PLATFORM_COLORS[p] + '20', color: PLATFORM_COLORS[p] }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--space-4)' }} onClick={() => navigate('/calendar')}>
                View Calendar
              </button>
            </div>
          </section>
        </div>

        {/* Platform Distribution */}
        <section className="dashboard-section">
          <h2 className="section-title">Platform Distribution</h2>
          <div className="platform-distribution">
            {PLATFORMS.map((platform) => {
              const count = projects.filter(p => p.platforms.includes(platform.value)).length
              const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0
              return (
                <div key={platform.value} className="platform-dist-item">
                  <div className="platform-dist-info">
                    <span className="platform-dist-name">{platform.label}</span>
                    <span className="platform-dist-count">{count} projects</span>
                  </div>
                  <div className="platform-dist-bar">
                    <div 
                      className="platform-dist-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: PLATFORM_COLORS[platform.value]
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <style>{`
        .dashboard-container {
          padding: var(--space-6);
          max-width: 1400px;
        }

        .dashboard-section {
          margin-bottom: var(--space-8);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .section-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-4);
        }

        .pipeline-overview {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: var(--space-3);
        }

        .pipeline-stage-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          text-align: center;
          transition: all var(--transition-fast);
        }

        .pipeline-stage-card:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-accent);
          transform: translateY(-2px);
        }

        .pipeline-stage-count {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
        }

        .pipeline-stage-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          margin-top: var(--space-1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
        }

        .stat-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          text-align: center;
        }

        .stat-value {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-top: var(--space-2);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: var(--space-6);
        }

        .recent-projects-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .recent-project-card {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          transition: all var(--transition-fast);
        }

        .recent-project-card:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border);
        }

        .project-type-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-accent-muted);
          border-radius: var(--radius-md);
          color: var(--color-accent);
        }

        .project-info {
          flex: 1;
          min-width: 0;
        }

        .project-title {
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-meta {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          text-transform: capitalize;
          margin-top: var(--space-1);
        }

        .project-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .project-platforms {
          display: flex;
          gap: var(--space-1);
        }

        .platform-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dashboard-sidebar {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .quick-actions-card,
        .upcoming-schedule-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }

        .quick-actions-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .quick-action-btn:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-accent);
        }

        .upcoming-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .upcoming-item {
          padding: var(--space-3);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }

        .upcoming-date {
          font-size: var(--font-size-xs);
          color: var(--color-accent);
          font-weight: var(--font-weight-medium);
        }

        .upcoming-title {
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
          margin-top: var(--space-1);
        }

        .upcoming-platforms {
          display: flex;
          gap: var(--space-1);
          margin-top: var(--space-2);
        }

        .platform-badge {
          font-size: var(--font-size-xs);
          padding: 2px var(--space-2);
          border-radius: var(--radius-sm);
          font-weight: var(--font-weight-medium);
        }

        .platform-distribution {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
        }

        .platform-dist-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .platform-dist-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .platform-dist-name {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
        }

        .platform-dist-count {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }

        .platform-dist-bar {
          height: 6px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .platform-dist-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width var(--transition-slow);
        }

        @media (max-width: 1200px) {
          .pipeline-overview {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .dashboard-sidebar {
            flex-direction: row;
          }
          
          .quick-actions-card,
          .upcoming-schedule-card {
            flex: 1;
          }
        }

        @media (max-width: 768px) {
          .pipeline-overview {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .dashboard-sidebar {
            flex-direction: column;
          }
          
          .platform-distribution {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
