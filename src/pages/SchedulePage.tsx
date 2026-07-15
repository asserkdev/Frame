import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { supabase, FrameSchedule, FrameIdeaSelect, ScheduleStatus } from '../lib/supabase'

const SCHEDULE_STATUSES: { value: ScheduleStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']

export function SchedulePage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [schedules, setSchedules] = useState<FrameSchedule[]>([])
  const [ideas, setIdeas] = useState<FrameIdeaSelect[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<FrameSchedule | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showPastEvents, setShowPastEvents] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    scheduled_date: '',
    status: 'scheduled' as ScheduleStatus,
    idea_id: '' as string | null,
    notes: '',
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      const [schedulesResult, ideasResult] = await Promise.all([
        supabase
          .from('frame_schedule')
          .select('*, idea:frame_ideas(title)')
          .order('scheduled_date', { ascending: true }),
        supabase
          .from('frame_ideas')
          .select('id, title')
          .order('title'),
      ])

      if (schedulesResult.error) throw schedulesResult.error
      if (ideasResult.error) throw ideasResult.error

      const schedulesWithIdeaTitle = (schedulesResult.data || []).map(schedule => ({
        ...schedule,
        idea_title: (schedule as any).idea?.title,
      }))

      setSchedules(schedulesWithIdeaTitle)
      setIdeas(ideasResult.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      showToast('error', 'Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = (date?: string) => {
    setEditingSchedule(null)
    setFormData({
      title: '',
      scheduled_date: date || new Date().toISOString().split('T')[0],
      status: 'scheduled',
      idea_id: null,
      notes: '',
    })
    setShowModal(true)
  }

  const openEditModal = (schedule: FrameSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      title: schedule.title,
      scheduled_date: schedule.scheduled_date,
      status: schedule.status,
      idea_id: schedule.idea_id,
      notes: schedule.notes || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingSchedule(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (editingSchedule) {
        const { error } = await supabase
          .from('frame_schedule')
          .update({
            title: formData.title,
            scheduled_date: formData.scheduled_date,
            status: formData.status,
            idea_id: formData.idea_id || null,
            notes: formData.notes || null,
          })
          .eq('id', editingSchedule.id)

        if (error) throw error
        showToast('success', 'Schedule updated')
      } else {
        const { error } = await supabase
          .from('frame_schedule')
          .insert({
            user_id: user.id,
            title: formData.title,
            scheduled_date: formData.scheduled_date,
            status: formData.status,
            idea_id: formData.idea_id || null,
            notes: formData.notes || null,
          })

        if (error) throw error
        showToast('success', 'Schedule created')
      }

      closeModal()
      loadData()
    } catch (error) {
      console.error('Error saving schedule:', error)
      showToast('error', 'Failed to save schedule')
    }
  }

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('frame_schedule')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSchedules(prev => prev.filter(s => s.id !== id))
      showToast('success', 'Schedule deleted')
      closeModal()
    } catch (error) {
      console.error('Error deleting schedule:', error)
      showToast('error', 'Failed to delete schedule')
    }
  }

  const navigateMonth = (delta: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + delta)
    setCurrentDate(newDate)
  }

  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const totalDays = lastDay.getDate()
    
    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = []
    
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isToday: false,
      })
    }
    
    // Current month
    const today = new Date()
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
      })
    }
    
    // Next month padding
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
      })
    }
    
    return days
  }

  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return schedules.filter(s => s.scheduled_date === dateStr)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return {
      day: date.getDate(),
      month: MONTHS[date.getMonth()].substring(0, 3),
      full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    }
  }

  const getUpcomingSchedules = () => {
    const today = new Date().toISOString().split('T')[0]
    return schedules.filter(s => {
      if (!showPastEvents && s.scheduled_date < today) return false
      return true
    })
  }

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case 'scheduled':
        return 'var(--color-accent)'
      case 'published':
        return 'var(--color-success)'
      case 'cancelled':
        return 'var(--color-text-muted)'
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    )
  }

  const calendarDays = getCalendarDays()
  const upcomingSchedules = getUpcomingSchedules()

  return (
    <>
      <div className="main-header">
        <h1 className="main-header-title">Schedule</h1>
        <div className="main-header-actions">
          <div className="view-toggle">
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
              List
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Calendar
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => openCreateModal()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Schedule
          </button>
        </div>
      </div>

      <div style={{ padding: 'var(--space-4)', overflow: 'auto', flex: 1 }}>
        {viewMode === 'list' ? (
          <div className="schedule-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showPastEvents}
                  onChange={(e) => setShowPastEvents(e.target.checked)}
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Show past events
                </span>
              </label>
            </div>

            {upcomingSchedules.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h2 className="empty-state-title">No scheduled items</h2>
                <p className="empty-state-description">
                  Plan your publishing schedule by adding dates for your ideas
                </p>
                <button className="btn btn-primary" onClick={() => openCreateModal()}>
                  Add First Schedule
                </button>
              </div>
            ) : (
              <div className="schedule-list">
                {upcomingSchedules.map(schedule => {
                  const dateInfo = formatDate(schedule.scheduled_date)
                  const isPast = schedule.scheduled_date < new Date().toISOString().split('T')[0]
                  
                  return (
                    <div
                      key={schedule.id}
                      className="schedule-item"
                      onClick={() => openEditModal(schedule)}
                      style={{ opacity: isPast && !showPastEvents ? 0.5 : 1 }}
                    >
                      <div className="schedule-date">
                        <span className="schedule-day">{dateInfo.day}</span>
                        <span className="schedule-month">{dateInfo.month}</span>
                      </div>
                      <div className="schedule-info">
                        <div className="schedule-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {schedule.title}
                          <span
                            className="status-badge"
                            style={{
                              background: `${getStatusColor(schedule.status)}20`,
                              color: getStatusColor(schedule.status),
                            }}
                          >
                            {schedule.status}
                          </span>
                        </div>
                        {schedule.idea_title && (
                          <div className="schedule-linked-idea">
                            For: {schedule.idea_title}
                          </div>
                        )}
                        {schedule.notes && (
                          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                            {schedule.notes.length > 100 ? schedule.notes.substring(0, 100) + '...' : schedule.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="calendar-container">
            <div className="schedule-month-nav" style={{ justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
              <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(-1)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h2>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(1)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="calendar-grid">
              {DAYS.map(day => (
                <div key={day} className="calendar-header-cell">{day}</div>
              ))}
              
              {calendarDays.map((day, index) => {
                const daySchedules = getSchedulesForDate(day.date)
                
                return (
                  <div
                    key={index}
                    className={`calendar-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
                    onClick={() => day.isCurrentMonth && openCreateModal(day.date.toISOString().split('T')[0])}
                    style={{ cursor: day.isCurrentMonth ? 'pointer' : 'default' }}
                  >
                    <div className="calendar-day-number">{day.date.getDate()}</div>
                    <div className="calendar-events">
                      {daySchedules.slice(0, 3).map(schedule => (
                        <div
                          key={schedule.id}
                          className="calendar-event"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(schedule)
                          }}
                          title={schedule.title}
                        >
                          {schedule.title}
                        </div>
                      ))}
                      {daySchedules.length > 3 && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', padding: '0 var(--space-2)' }}>
                          +{daySchedules.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <button className="modal-close" onClick={closeModal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="modal-title">{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</h3>

            <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Schedule title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Status</label>
                <div className="view-toggle" style={{ display: 'inline-flex' }}>
                  {SCHEDULE_STATUSES.map(status => (
                    <button
                      key={status.value}
                      type="button"
                      className={`view-toggle-btn ${formData.status === status.value ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, status: status.value })}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

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
                {editingSchedule && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => deleteSchedule(editingSchedule.id)}
                    style={{ marginRight: 'auto', background: 'var(--color-error)' }}
                  >
                    Delete
                  </button>
                )}
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSchedule ? 'Save Changes' : 'Add Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
