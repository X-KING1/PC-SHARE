// MentorDashboard.jsx — Mentor page for managing live session time slots
import { useState, useMemo } from 'react'
import useAuth from '../hooks/useAuth'
import { useGetCoursesQuery, useGetCategoriesQuery } from '../store/api/courseApi'
import { useGetMentorSessionsQuery, useCreateSessionMutation, useDeleteSessionMutation, useCompleteSessionMutation } from '../store/api/sessionApi'
import VideoMeeting from '../components/VideoMeeting'

const MentorDashboard = () => {
    const { user, isAuthenticated } = useAuth()
    const [showForm, setShowForm] = useState(false)
    const [activeSession, setActiveSession] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [form, setForm] = useState({ course_id: '', title: '', session_date: '', start_time: '', duration_minutes: 30 })

    const { data: coursesData } = useGetCoursesQuery({ page: 1, limit: 200 })
    const allCourses = coursesData?.courses || []
    const { data: categories = [] } = useGetCategoriesQuery()
    const filteredCourses = selectedCategory
        ? allCourses.filter(c => c.category === selectedCategory)
        : allCourses
    const selectedCourse = allCourses.find(c => String(c.course_id) === String(form.course_id))
    const { data: sessions = [], isLoading, refetch } = useGetMentorSessionsQuery(user?.user_id, { skip: !user?.user_id })
    const [createSession] = useCreateSessionMutation()
    const [deleteSession] = useDeleteSessionMutation()
    const [completeSession] = useCompleteSessionMutation()

    // Categorize sessions
    const { upcoming, booked, completed } = useMemo(() => {
        const up = [], bk = [], cp = []
        sessions.forEach(s => {
            if (s.status === 'completed') cp.push(s)
            else if (s.status === 'booked') bk.push(s)
            else up.push(s)
        })
        return { upcoming: up, booked: bk, completed: cp }
    }, [sessions])

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!form.course_id || !form.title || !form.session_date || !form.start_time) {
            alert('Please fill all fields')
            return
        }
        try {
            await createSession({
                ...form,
                course_id: Number(form.course_id),
                mentor_id: user.user_id,
                mentor_name: user.name || user.username || 'Mentor'
            }).unwrap()
            setForm({ course_id: '', title: '', session_date: '', start_time: '', duration_minutes: 30 })
            setShowForm(false)
            refetch()
        } catch (err) {
            alert('Failed to create session')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Delete this session?')) {
            await deleteSession(id).unwrap()
            refetch()
        }
    }

    const handleComplete = async (id) => {
        await completeSession(id).unwrap()
        setActiveSession(null)
        refetch()
    }

    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: '#1e293b' }}>Please log in to access the Mentor Dashboard</h2>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: '60px' }}>
            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #5624d0 50%, #7c3aed 100%)',
                padding: '40px 32px', color: 'white'
            }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>🎓 Mentor Dashboard</h1>
                    <p style={{ opacity: 0.9, marginTop: '8px', fontSize: '15px' }}>
                        Welcome back, {user?.name || user?.username}! Manage your live sessions here.
                    </p>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
                        <StatBadge label="Available" count={upcoming.length} color="#22c55e" />
                        <StatBadge label="Booked" count={booked.length} color="#f59e0b" />
                        <StatBadge label="Completed" count={completed.length} color="#6b7280" />
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
                {/* Create Button */}
                <button onClick={() => setShowForm(!showForm)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '14px 28px', background: '#5624d0', color: 'white', border: 'none',
                        borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(86,36,208,0.3)', marginBottom: '24px'
                    }}>
                    {showForm ? '✕ Cancel' : '＋ Create New Session'}
                </button>

                {/* Create Form */}
                {showForm && (
                    <form onSubmit={handleCreate} style={{
                        background: 'white', borderRadius: '14px', padding: '28px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '32px'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginTop: 0, marginBottom: '20px' }}>📌 New Session Slot</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {/* Course Selector — Category-based */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Select Course</label>

                                {/* Selected Course Badge */}
                                {form.course_id && selectedCourse && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        background: '#f0fdf4', border: '2px solid #22c55e',
                                        borderRadius: '10px', padding: '10px 14px', marginBottom: '12px'
                                    }}>
                                        <span style={{ fontSize: '20px' }}>✅</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{selectedCourse.title}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedCourse.category} · {selectedCourse.instructor}</div>
                                        </div>
                                        <button type="button" onClick={() => setForm({ ...form, course_id: '' })}
                                            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                                    </div>
                                )}

                                {/* Category Tabs */}
                                {!form.course_id && (
                                    <>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                            <button type="button" onClick={() => setSelectedCategory('')}
                                                style={{
                                                    padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                                    fontWeight: '600', fontSize: '12px',
                                                    background: !selectedCategory ? '#5624d0' : '#e2e8f0',
                                                    color: !selectedCategory ? 'white' : '#475569'
                                                }}>All ({allCourses.length})</button>
                                            {categories.map(cat => {
                                                const count = allCourses.filter(c => c.category === cat).length
                                                return (
                                                    <button type="button" key={cat} onClick={() => setSelectedCategory(cat)}
                                                        style={{
                                                            padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                                            fontWeight: '600', fontSize: '12px',
                                                            background: selectedCategory === cat ? '#5624d0' : '#e2e8f0',
                                                            color: selectedCategory === cat ? 'white' : '#475569'
                                                        }}>{cat} ({count})</button>
                                                )
                                            })}
                                        </div>

                                        {/* Course Cards */}
                                        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {filteredCourses.map(c => (
                                                <button type="button" key={c.course_id}
                                                    onClick={() => setForm({ ...form, course_id: String(c.course_id) })}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '10px',
                                                        padding: '10px', background: '#f8fafc', border: '2px solid #e2e8f0',
                                                        borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                                                        transition: 'border-color 0.15s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#5624d0'}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                                >
                                                    <div style={{
                                                        width: '50px', height: '36px', borderRadius: '6px', overflow: 'hidden',
                                                        background: '#e2e8f0', flexShrink: 0
                                                    }}>
                                                        {c.thumbnail && <img src={c.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    </div>
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.category}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {filteredCourses.length === 0 && (
                                            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '16px 0' }}>
                                                No courses found{selectedCategory ? ` in ${selectedCategory}` : ''}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>Session Title</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. React Q&A, Doubt Clearing" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Date</label>
                                <input type="date" value={form.session_date} onChange={e => setForm({ ...form, session_date: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Start Time</label>
                                <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Duration (minutes)</label>
                                <select value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} style={inputStyle}>
                                    <option value={15}>15 min</option>
                                    <option value={30}>30 min</option>
                                    <option value={45}>45 min</option>
                                    <option value={60}>60 min</option>
                                    <option value={90}>90 min</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" style={{
                            marginTop: '20px', padding: '12px 32px', background: '#16a34a',
                            color: 'white', border: 'none', borderRadius: '10px',
                            fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                        }}>
                            ✅ Create Session Slot
                        </button>
                    </form>
                )}

                {/* Active Video Meeting */}
                {activeSession && (
                    <div style={{
                        background: 'white', borderRadius: '14px', padding: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '32px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                                🔴 Live: {activeSession.title}
                            </h3>
                            <button onClick={() => handleComplete(activeSession.session_id)}
                                style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                                End & Mark Complete
                            </button>
                        </div>
                        <VideoMeeting
                            userName={user?.name || user?.username || 'Mentor'}
                            defaultRoom={activeSession.room_id}
                            defaultRole="mentor"
                            onClose={() => setActiveSession(null)}
                        />
                    </div>
                )}

                {/* Loading */}
                {isLoading && <p style={{ color: '#6b7280' }}>Loading sessions...</p>}

                {/* Booked Sessions */}
                {booked.length > 0 && (
                    <SessionSection title="🔔 Booked Sessions" subtitle="Students have booked these — be ready!" color="#f59e0b">
                        {booked.map(s => (
                            <SessionCard key={s.session_id} session={s} courses={allCourses}
                                onStart={() => setActiveSession(s)}
                                onDelete={() => handleDelete(s.session_id)}
                                type="booked" />
                        ))}
                    </SessionSection>
                )}

                {/* Available Slots */}
                {upcoming.length > 0 && (
                    <SessionSection title="📅 Available Slots" subtitle="Waiting for students to book" color="#22c55e">
                        {upcoming.map(s => (
                            <SessionCard key={s.session_id} session={s} courses={allCourses}
                                onStart={() => setActiveSession(s)}
                                onDelete={() => handleDelete(s.session_id)}
                                type="available" />
                        ))}
                    </SessionSection>
                )}

                {/* Completed */}
                {completed.length > 0 && (
                    <SessionSection title="✅ Completed" subtitle="Past sessions" color="#6b7280">
                        {completed.map(s => (
                            <SessionCard key={s.session_id} session={s} courses={allCourses} type="completed" />
                        ))}
                    </SessionSection>
                )}

                {!isLoading && sessions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
                        <h3 style={{ color: '#475569', fontSize: '18px', fontWeight: '600' }}>No sessions yet</h3>
                        <p>Create your first session slot using the button above!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Subcomponents
const StatBadge = ({ label, count, color }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '8px'
    }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }} />
        <span style={{ fontWeight: '600', fontSize: '14px' }}>{count} {label}</span>
    </div>
)

const SessionSection = ({ title, subtitle, color, children }) => (
    <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '4px', height: '28px', borderRadius: '2px', background: color }} />
            <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{title}</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{subtitle}</p>
            </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {children}
        </div>
    </div>
)

const SessionCard = ({ session, courses, onStart, onDelete, type }) => {
    const course = courses.find(c => c.course_id === session.course_id)
    const statusColors = { available: '#22c55e', booked: '#f59e0b', completed: '#6b7280' }

    return (
        <div style={{
            background: 'white', borderRadius: '12px', padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            borderLeft: `4px solid ${statusColors[session.status] || '#5624d0'}`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{session.title}</h4>
                <span style={{
                    fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px',
                    background: statusColors[session.status] + '20', color: statusColors[session.status],
                    textTransform: 'uppercase'
                }}>{session.status}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                <span>📚 {course?.title || `Course #${session.course_id}`}</span>
                <span>📅 {session.session_date} at {session.start_time}</span>
                <span>⏱ {session.duration_minutes} minutes</span>
                {session.student_name && <span>👤 Booked by: <strong style={{ color: '#1e293b' }}>{session.student_name}</strong></span>}
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Room: {session.room_id}</span>
            </div>
            {type !== 'completed' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    {(type === 'booked' || type === 'available') && onStart && (
                        <button onClick={onStart}
                            style={{
                                padding: '8px 16px', background: '#5624d0', color: 'white',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: '600', fontSize: '13px'
                            }}>
                            🎥 Start Session
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={onDelete}
                            style={{
                                padding: '8px 16px', background: '#fee2e2', color: '#dc2626',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: '600', fontSize: '13px'
                            }}>
                            🗑 Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }
const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', background: 'white', color: '#1e293b'
}

export default MentorDashboard
