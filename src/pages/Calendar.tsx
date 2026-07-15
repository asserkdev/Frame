import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { PLATFORMS, ScheduleStatus } from '../lib/supabase'

interface ScheduleItem {
  id: string
  project_id: string | null
  title: string
  description: string | null
  scheduled_date: string
  scheduled_time: string | null
  timezone: string
  platforms: string[]
  platform_metadata: Record<string, { title?: string; description?: string; tags?: string[] }>
  status: ScheduleStatus
  best_time_suggestion: boolean
  reminder_sent: boolean
  published_url: string | null
}

const MOCK_SCHEDULE: ScheduleItem[] = [
  { id: '1', project_id: 'p1', title: 'Building a SaaS App', description: 'Complete tutorial', scheduled_date: '2024-01-20', scheduled_time: '14:00', timezone: 'America/New_York', platforms: ['youtube', 'tiktok'], platform_metadata: { youtube: { title: 'How to Build a SaaS', tags: ['saas', 'tutorial'] }, tiktok: { title: 'SaaS in 60 seconds' } }, status: 'scheduled', best_time_suggestion: true, reminder_sent: false, published_url: null },
  { id: '2', project_id: 'p4', title: 'Productivity Tips Thread', description: 'Twitter thread', scheduled_date: '2024-01-21', scheduled_time: '09:00', timezone: 'America/New_York', platforms: ['twitter'], platform_metadata: { twitter: { title: '10 Productivity Tips' } }, status: 'scheduled', best_time_suggestion: true, reminder_sent: true, published_url: null },
  { id: '3', project_id: 'p5', title: 'Podcast Episode 15', description: 'Indie hacker interview', scheduled_date: '2024-01-22', scheduled_time: '06:00', timezone: 'America/New_York', platforms: ['podcast', 'youtube'], platform_metadata: { podcast: { title: 'Episode 15: John Doe' }, youtube: { title: 'Indie Hacker Interview' } }, status: 'scheduled', best_time_suggestion: true, reminder_sent: false, published_url: null },
  { id: '4', project_id: 'p2', title: 'VS Code Extensions', description: 'Video tutorial', scheduled_date: '2024-01-19', scheduled_time: '15:00', timezone: 'America/New_York', platforms: ['youtube'], platform_metadata: { youtube: { title: 'Top 10 VS Code Extensions' } }, status: 'published', best_time_suggestion: false, reminder_sent: true, published_url: 'https://youtube.com/watch?v=abc' },
  { id: '5', project_id: 'p7', title: 'AI Tools Review', description: 'Video content', scheduled_date: '2024-01-23', scheduled_time: '17:00', timezone: 'America/New_York', platforms: ['youtube', 'tiktok'], platform_metadata: { youtube: { title: 'AI Tools 2024' }, tiktok: { title: 'AI Tools Review' } }, status: 'scheduled', best_time_suggestion: false, reminder_sent: false, published_url: null },
  { id: '6', project_id: null, title: 'Design Systems Post', description: 'LinkedIn article', scheduled_date: '2024-01-24', scheduled_time: '12:00', timezone: 'America/New_York', platforms: ['linkedin'], platform_metadata: { linkedin: { title: 'Design Systems Guide' } }, status: 'scheduled', best_time_suggestion: true, reminder_sent: false, published_url: null },
  { id: '7', project_id: null, title: 'Instagram Carousel', description: 'Productivity tips', scheduled_date: '2024-01-25', scheduled_time: '11:00', timezone: 'America/New_York', platforms: ['instagram'], platform_metadata: { instagram: { title: 'Productivity Tips Carousel' } }, status: 'scheduled', best_time_suggestion: true, reminder_sent: false, published_url: null },
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

const STATUS_COLORS: Record<ScheduleStatus, string> = {
  scheduled: '#60a5fa',
  published: '#34d399',
  failed: '#f87171',
  cancelled: '#71717a',
}

const BEST_TIMES: Record<string, string[]> = {
  youtube: ['2PM', '3PM', '4PM'],
  tiktok: ['12PM', '7PM', '8PM'],
  twitter: ['8AM', '9AM', '12PM', '5PM'],
  instagram: ['11AM', '12PM', '1PM', '7PM', '8PM'],
  linkedin: ['8AM', '9AM', '12PM', '5PM'],
  podcast: ['5AM', '6AM', '7AM', '8AM'],
}

type ViewMode = 'month' | 'week'

export function Calendar() {
  useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [schedule, setSchedule] = useState<ScheduleItem[]>(MOCK_SCHEDULE)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [draggedItem, setDraggedItem] = useState<ScheduleItem | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days: (Date | null)[] = []
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getItemsForDate = (date: Date) => {
    const dateKey = formatDateKey(date)
    return schedule.filter(item => item.scheduled_date === dateKey)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const navigateWeek = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + (direction * 7))
      return newDate
    })
  }

  const handleDragStart = (item: ScheduleItem) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    if (!draggedItem) return

    const newDate = formatDateKey(date)
    setSchedule(prev => prev.map(item => 
      item.id === draggedItem.id 
        ? { ...item, scheduled_date: newDate, best_time_suggestion: false }
        : item
    ))
    showToast('success', `Rescheduled to ${date.toLocaleDateString()}`)
    setDraggedItem(null)
  }

  const updateItemStatus = (itemId: string, newStatus: ScheduleStatus) => {
    setSchedule(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    ))
    showToast('success', `Status updated to ${newStatus}`)
  }

  const getPlatformBestTimes = (platform: string) => {
    return BEST_TIMES[platform] || []
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    )
  }

  const days = viewMode === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <>
      <div className="main-header">
        <h1 className="main-header-title">Upload Calendar</h1>
        <div className="main-header-actions">
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
          </div>
          <button className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Schedule Content
          </button>
        </div>
      </div>

      <div className="calendar-container">
        {/* Calendar Header */}
        <div className="calendar-header">
          <div className="calendar-nav">
            <button 
              className="btn btn-ghost btn-icon"
              onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h2 className="calendar-title">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button 
              className="btn btn-ghost btn-icon"
              onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <button 
            className="btn btn-ghost"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className={`calendar-grid ${viewMode}`}>
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="calendar-cell empty" />
            }

            const items = getItemsForDate(date)
            
            return (
              <div 
                key={date.toISOString()}
                className={`calendar-cell ${!isCurrentMonth(date) ? 'other-month' : ''} ${isToday(date) ? 'today' : ''} ${draggedItem ? 'drop-target' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
                onClick={() => setSelectedDate(date)}
              >
                <div className="cell-date">
                  {date.getDate()}
                  {isToday(date) && <span className="today-dot" />}
                </div>
                <div className="cell-items">
                  {items.slice(0, 3).map(item => (
                    <div 
                      key={item.id}
                      className={`schedule-item ${item.status} ${item.best_time_suggestion ? 'best-time' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="item-platforms">
                        {item.platforms.map(platform => (
                          <span 
                            key={platform}
                            className="platform-indicator"
                            style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                            title={platform}
                          />
                        ))}
                      </div>
                      <span className="item-time">{item.scheduled_time}</span>
                      <span className="item-title">{item.title}</span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="more-items">+{items.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Best Time Suggestions Sidebar */}
        <div className="calendar-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Best Posting Times</h3>
            <div className="best-times-list">
              {PLATFORMS.slice(0, 5).map(platform => (
                <div key={platform.value} className="best-time-item">
                  <div className="best-time-platform">
                    <span 
                      className="platform-dot"
                      style={{ backgroundColor: PLATFORM_COLORS[platform.value] }}
                    />
                    {platform.label}
                  </div>
                  <div className="best-time-hours">
                    {getPlatformBestTimes(platform.value).map(time => (
                      <span key={time} className="time-badge">{time}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Upcoming</h3>
            <div className="upcoming-list">
              {schedule
                .filter(item => item.status === 'scheduled' && new Date(item.scheduled_date) >= new Date())
                .slice(0, 5)
                .map(item => (
                  <div key={item.id} className="upcoming-item">
                    <div className="upcoming-platforms">
                      {item.platforms.map(platform => (
                        <span 
                          key={platform}
                          className="platform-dot"
                          style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                        />
                      ))}
                    </div>
                    <div className="upcoming-info">
                      <span className="upcoming-title">{item.title}</span>
                      <span className="upcoming-date">
                        {new Date(item.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {item.scheduled_time}
                      </span>
                    </div>
                    {item.best_time_suggestion && (
                      <span className="best-time-badge" title="Best posting time">★</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Date Detail Modal */}
      {selectedDate && (
        <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
          <div className="modal calendar-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDate(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="modal-title">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>

            <div className="selected-date-items">
              {getItemsForDate(selectedDate).length === 0 ? (
                <div className="no-items">
                  <p>No content scheduled for this day</p>
                </div>
              ) : (
                getItemsForDate(selectedDate).map(item => (
                  <div key={item.id} className="schedule-detail-card">
                    <div className="detail-header">
                      <div className="detail-platforms">
                        {item.platforms.map(platform => (
                          <span 
                            key={platform}
                            className="platform-badge"
                            style={{ backgroundColor: PLATFORM_COLORS[platform] + '20', color: PLATFORM_COLORS[platform] }}
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: STATUS_COLORS[item.status] + '20', color: STATUS_COLORS[item.status] }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <h4 className="detail-title">{item.title}</h4>
                    {item.description && (
                      <p className="detail-description">{item.description}</p>
                    )}
                    <div className="detail-time">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {item.scheduled_time} ({item.timezone})
                      {item.best_time_suggestion && (
                        <span className="best-time-label">★ Best time</span>
                      )}
                    </div>
                    
                    {/* Platform Metadata */}
                    <div className="platform-metadata">
                      {item.platforms.map(platform => (
                        <div key={platform} className="metadata-item">
                          <span className="metadata-platform">{platform}</span>
                          {item.platform_metadata[platform] && (
                            <div className="metadata-details">
                              {item.platform_metadata[platform].title && (
                                <div className="metadata-field">
                                  <span className="metadata-label">Title:</span> {item.platform_metadata[platform].title}
                                </div>
                              )}
                              {item.platform_metadata[platform].tags && (
                                <div className="metadata-tags">
                                  {item.platform_metadata[platform].tags?.map(tag => (
                                    <span key={tag} className="metadata-tag">#{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="detail-actions">
                      <select 
                        className="status-select"
                        value={item.status}
                        onChange={(e) => updateItemStatus(item.id, e.target.value as ScheduleStatus)}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {item.published_url && (
                        <a 
                          href={item.published_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          View Published
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .calendar-container {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: var(--space-4);
          padding: var(--space-4);
          height: calc(100vh - var(--header-height) - var(--space-8));
        }

        .calendar-header {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-2) 0;
        }

        .calendar-nav {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .calendar-title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          min-width: 200px;
          text-align: center;
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
        }

        .view-toggle-btn:hover {
          color: var(--color-text-secondary);
        }

        .view-toggle-btn.active {
          background: var(--color-bg-card);
          color: var(--color-accent);
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
        }

        .weekday-header {
          text-align: center;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-muted);
          padding: var(--space-2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: var(--color-border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .calendar-grid.week {
          grid-template-rows: repeat(1, 1fr);
        }

        .calendar-cell {
          background: var(--color-bg-card);
          min-height: 120px;
          padding: var(--space-2);
          transition: all var(--transition-fast);
        }

        .calendar-grid.week .calendar-cell {
          min-height: 200px;
        }

        .calendar-cell:hover {
          background: var(--color-bg-card-hover);
        }

        .calendar-cell.empty {
          background: var(--color-bg-secondary);
        }

        .calendar-cell.other-month {
          background: var(--color-bg-secondary);
        }

        .calendar-cell.other-month .cell-date {
          color: var(--color-text-tertiary);
        }

        .calendar-cell.today {
          background: var(--color-accent-muted);
        }

        .calendar-cell.drop-target {
          background: var(--color-accent-subtle);
        }

        .cell-date {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
          margin-bottom: var(--space-2);
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .today-dot {
          width: 6px;
          height: 6px;
          background: var(--color-accent);
          border-radius: 50%;
        }

        .cell-items {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .schedule-item {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: 2px var(--space-2);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          cursor: grab;
          transition: all var(--transition-fast);
          overflow: hidden;
        }

        .schedule-item:hover {
          background: var(--color-accent-muted);
        }

        .schedule-item:active {
          cursor: grabbing;
        }

        .schedule-item.published {
          opacity: 0.6;
        }

        .schedule-item.failed,
        .schedule-item.cancelled {
          opacity: 0.4;
          text-decoration: line-through;
        }

        .schedule-item.best-time {
          border-left: 2px solid var(--color-accent);
        }

        .item-platforms {
          display: flex;
          gap: 2px;
          flex-shrink: 0;
        }

        .platform-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .item-time {
          color: var(--color-text-muted);
          flex-shrink: 0;
        }

        .item-title {
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .more-items {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          padding: 2px var(--space-2);
        }

        .calendar-sidebar {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .sidebar-section {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
        }

        .sidebar-title {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-3);
        }

        .best-times-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .best-time-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .best-time-platform {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }

        .platform-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .best-time-hours {
          display: flex;
          gap: var(--space-1);
        }

        .time-badge {
          font-size: var(--font-size-xs);
          padding: 2px var(--space-2);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
        }

        .upcoming-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .upcoming-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }

        .upcoming-platforms {
          display: flex;
          gap: 2px;
        }

        .upcoming-info {
          flex: 1;
          min-width: 0;
        }

        .upcoming-title {
          display: block;
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .upcoming-date {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }

        .best-time-badge {
          color: var(--color-accent);
          font-size: var(--font-size-sm);
        }

        .calendar-modal {
          max-width: 600px;
        }

        .selected-date-items {
          margin-top: var(--space-4);
        }

        .no-items {
          text-align: center;
          padding: var(--space-8);
          color: var(--color-text-muted);
        }

        .schedule-detail-card {
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          margin-bottom: var(--space-3);
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .detail-platforms {
          display: flex;
          gap: var(--space-2);
        }

        .platform-badge {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          padding: 2px var(--space-2);
          border-radius: var(--radius-sm);
          text-transform: capitalize;
        }

        .status-badge {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
          text-transform: capitalize;
        }

        .detail-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-1);
        }

        .detail-description {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-bottom: var(--space-2);
        }

        .detail-time {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-3);
        }

        .best-time-label {
          color: var(--color-accent);
          font-weight: var(--font-weight-medium);
        }

        .platform-metadata {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-3);
        }

        .metadata-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .metadata-platform {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--color-accent);
          text-transform: capitalize;
        }

        .metadata-details {
          padding-left: var(--space-3);
        }

        .metadata-field {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }

        .metadata-label {
          color: var(--color-text-muted);
        }

        .metadata-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
          margin-top: var(--space-1);
        }

        .metadata-tag {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }

        .detail-actions {
          display: flex;
          gap: var(--space-2);
        }

        .status-select {
          flex: 1;
          padding: var(--space-2);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: var(--font-size-sm);
          cursor: pointer;
        }

        .btn-sm {
          padding: var(--space-2) var(--space-3);
          font-size: var(--font-size-sm);
        }

        @media (max-width: 1024px) {
          .calendar-container {
            grid-template-columns: 1fr;
          }

          .calendar-sidebar {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .calendar-cell {
            min-height: 80px;
          }

          .item-title {
            display: none;
          }

          .calendar-grid.week .calendar-cell {
            min-height: 150px;
          }
        }
      `}</style>
    </>
  )
}
