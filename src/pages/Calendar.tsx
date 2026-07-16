import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { supabase, PLATFORMS, FrameSchedule } from '../lib/supabase'

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


export function Calendar() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [schedule, setSchedule] = useState<FrameSchedule[]>([])
  // viewMode
  const [currentDate, setCurrentDate] = useState(new Date())
  // selectedDate
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '12:00',
    platforms: ['youtube'] as string[],
  })

  const fetchSchedule = useCallback(async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('frame_schedules')
        .select('*')
        .order('scheduled_date', { ascending: true })
      
      if (error) throw error
      setSchedule(data || [])
    } catch (error: any) {
      console.error('Error fetching schedule:', error)
      showToast('error', 'Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }, [user, showToast])

  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  const handleCreateSchedule = async () => {
    if (!newSchedule.title.trim()) {
      showToast('error', 'Please enter a title')
      return
    }

    try {
      const { error } = await supabase
        .from('frame_schedules')
        .insert({
          title: newSchedule.title,
          scheduled_date: newSchedule.scheduled_date,
          scheduled_time: newSchedule.scheduled_time,
          platforms: newSchedule.platforms,
          status: 'scheduled',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })

      if (error) throw error
      
      showToast('success', 'Schedule created')
      setShowCreateModal(false)
      setNewSchedule({
        title: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '12:00',
        platforms: ['youtube'],
      })
      fetchSchedule()
    } catch (error: any) {
      console.error('Error creating schedule:', error)
      showToast('error', 'Failed to create schedule')
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Delete this scheduled item?')) return

    try {
      const { error } = await supabase
        .from('frame_schedules')
        .delete()
        .eq('id', id)

      if (error) throw error
      showToast('success', 'Schedule deleted')
      fetchSchedule()
    } catch (error: any) {
      console.error('Error deleting schedule:', error)
      showToast('error', 'Failed to delete schedule')
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: Date[] = []
    
    // Add days from previous month
    const startPadding = firstDay.getDay()
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i))
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    // Add days from next month
    const endPadding = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i))
    }
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return schedule.filter(s => s.scheduled_date === dateStr)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const togglePlatform = (platform: string) => {
    setNewSchedule(prev => ({
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
        <h1 className="main-header-title">Calendar</h1>
        <div className="main-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Schedule
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="calendar-container">
          <div className="calendar-header">
            <button className="btn btn-ghost" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button className="btn btn-ghost" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="calendar-grid">
            {dayNames.map(day => (
              <div key={day} className="calendar-header-cell">{day}</div>
            ))}
            {days.map((date, index) => {
              const events = getEventsForDate(date)
              return (
                <div
                  key={index}
                  className={`calendar-cell ${!isCurrentMonth(date) ? 'other-month' : ''} ${isToday(date) ? 'today' : ''}`}
                >
                  <span className="calendar-day-number">{date.getDate()}</span>
                  <div className="calendar-events">
                    {events.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="calendar-event"
                        style={{ backgroundColor: PLATFORM_COLORS[event.platforms?.[0] || 'youtube'] }}
                        onClick={() => handleDeleteSchedule(event.id)}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div className="calendar-more">+{events.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
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

            <h3 className="modal-title">Add to Schedule</h3>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateSchedule(); }} style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What are you publishing?"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newSchedule.scheduled_date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={newSchedule.scheduled_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_time: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Platforms</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                  {PLATFORMS.map(platform => (
                    <button
                      key={platform.value}
                      type="button"
                      className={`btn ${newSchedule.platforms.includes(platform.value) ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => togglePlatform(platform.value)}
                    >
                      {platform.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .calendar-container {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .calendar-header h2 {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .calendar-header-cell {
          padding: var(--space-3);
          text-align: center;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .calendar-cell {
          min-height: 100px;
          padding: var(--space-2);
          border-right: 1px solid var(--color-border-subtle);
          border-bottom: 1px solid var(--color-border-subtle);
          vertical-align: top;
        }

        .calendar-cell:nth-child(7n) {
          border-right: none;
        }

        .calendar-cell.other-month {
          background: var(--color-bg-tertiary);
        }

        .calendar-cell.today {
          background: var(--color-accent-subtle);
        }

        .calendar-day-number {
          display: block;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-1);
        }

        .calendar-cell.today .calendar-day-number {
          color: var(--color-accent);
          font-weight: var(--font-weight-bold);
        }

        .calendar-events {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .calendar-event {
          font-size: 11px;
          padding: 2px 4px;
          border-radius: var(--radius-sm);
          color: white;
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .calendar-event:hover {
          opacity: 0.8;
        }

        .calendar-more {
          font-size: 10px;
          color: var(--color-text-muted);
          padding: 2px;
        }

        @media (max-width: 768px) {
          .calendar-cell {
            min-height: 60px;
            padding: var(--space-1);
          }

          .calendar-day-number {
            font-size: var(--font-size-xs);
          }

          .calendar-event {
            font-size: 9px;
            padding: 1px 2px;
          }
        }
      `}</style>
    </>
  )
}
