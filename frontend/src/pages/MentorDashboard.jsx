// MentorDashboard.jsx — Ultra-Premium Mentor Dashboard
import { useState, useMemo } from 'react'
import useAuth from '../hooks/useAuth'
import { useGetCoursesQuery, useGetCategoriesQuery } from '../store/api/courseApi'
import { useGetMentorSessionsQuery, useCreateSessionMutation, useDeleteSessionMutation, useCompleteSessionMutation, useUpdateSessionMutation } from '../store/api/sessionApi'
import VideoMeeting from '../components/VideoMeeting'

/* ── Inject premium CSS animations ── */
const injectStyles = () => {
    if (document.getElementById('mentor-premium-css')) return
    const style = document.createElement('style')
    style.id = 'mentor-premium-css'
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes mentorFadeIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes mentorPulse { 0%, 100% { opacity: 1; } 50% { opacity: .6; } }
        @keyframes mentorGlow { 0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,.15); } 50% { box-shadow: 0 0 35px rgba(99,102,241,.3); } }
        @keyframes mentorShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes livePulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: .5; } }
        .mentor-card { transition: all .3s cubic-bezier(.4,0,.2,1); }
        .mentor-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px -12px rgba(0,0,0,.15) !important; }
        .mentor-btn { transition: all .25s ease; }
        .mentor-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .mentor-btn:active { transform: translateY(0); }
        .mentor-input:focus { border-color: #818cf8 !important; box-shadow: 0 0 0 4px rgba(99,102,241,.12) !important; }
        .mentor-cat-btn { transition: all .2s ease; }
        .mentor-cat-btn:hover { transform: scale(1.05); }
        .mentor-course-pick { transition: all .2s ease; }
        .mentor-course-pick:hover { border-color: #818cf8 !important; background: #f5f3ff !important; transform: scale(1.02); }
    `
    document.head.appendChild(style)
}

const MentorDashboard = () => {
    useState(() => injectStyles(), [])
    const { user, isAuthenticated } = useAuth()
    const [showForm, setShowForm] = useState(false)
    const [activeSession, setActiveSession] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [form, setForm] = useState({ course_id: '', title: '', session_date: '', start_time: '', duration_minutes: 30 })
    const [editingSession, setEditingSession] = useState(null)
    const [editForm, setEditForm] = useState({ title: '', session_date: '', start_time: '', duration_minutes: 30 })

    const { data: coursesData } = useGetCoursesQuery({ page: 1, limit: 200 })
    const allCourses = coursesData?.courses || []
    const { data: categories = [] } = useGetCategoriesQuery()
    const filteredCourses = selectedCategory ? allCourses.filter(c => c.category === selectedCategory) : allCourses
    const selectedCourse = allCourses.find(c => String(c.course_id) === String(form.course_id))
    const { data: sessions = [], isLoading, refetch } = useGetMentorSessionsQuery(user?.user_id, { skip: !user?.user_id })
    const [createSession] = useCreateSessionMutation()
    const [deleteSession] = useDeleteSessionMutation()
    const [completeSession] = useCompleteSessionMutation()
    const [updateSession] = useUpdateSessionMutation()

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
        if (!form.course_id || !form.title || !form.session_date || !form.start_time) { alert('Please fill all fields'); return }
        try {
            await createSession({ ...form, course_id: Number(form.course_id), mentor_id: user.user_id, mentor_name: user.name || user.username || 'Mentor' }).unwrap()
            setForm({ course_id: '', title: '', session_date: '', start_time: '', duration_minutes: 30 })
            setShowForm(false); refetch()
        } catch { alert('Failed to create session') }
    }
    const handleDelete = async (id) => { if (window.confirm('Delete this session?')) { await deleteSession(id).unwrap(); refetch() } }
    const handleComplete = async (id) => { await completeSession(id).unwrap(); setActiveSession(null); refetch() }
    const handleEdit = (s) => { setEditingSession(s.session_id); setEditForm({ title: s.title || '', session_date: s.session_date || '', start_time: s.start_time || '', duration_minutes: s.duration_minutes || 30 }) }
    const handleUpdate = async (e) => { e.preventDefault(); try { await updateSession({ id: editingSession, ...editForm }).unwrap(); setEditingSession(null); refetch() } catch { alert('Failed to update session') } }

    if (!isAuthenticated) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '60px 48px', textAlign: 'center', border: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ fontSize: '56px', marginBottom: '20px' }}>🔒</div>
                <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '800' }}>Please log in to access the Mentor Dashboard</h2>
            </div>
        </div>
    )

    const F = "'Inter', system-ui, sans-serif"

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: F }}>

            {/* ═══ PREMIUM HERO ═══ */}
            <div style={{
                background: 'linear-gradient(135deg, #0f0c29 0%, #1a1145 30%, #302b63 60%, #24243e 100%)',
                padding: '48px 32px 56px', color: 'white', position: 'relative', overflow: 'hidden'
            }}>
                {/* Decorative orbs */}
                <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', bottom: '-80px', left: '20%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,.2) 0%, transparent 70%)', filter: 'blur(50px)' }} />

                <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            boxShadow: '0 8px 30px rgba(99,102,241,.4)', fontSize: '24px'
                        }}>🎓</div>
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.1 }}>Mentor Studio</h1>
                            <p style={{ margin: 0, opacity: .65, fontSize: '14px', fontWeight: '500' }}>Welcome, {user?.name || user?.username} — manage your live sessions</p>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '28px' }}>
                        <StatCard label="Available" count={upcoming.length} icon="📡" gradient="linear-gradient(135deg, #059669, #10b981)" shadow="rgba(16,185,129,.35)" />
                        <StatCard label="Booked" count={booked.length} icon="🔔" gradient="linear-gradient(135deg, #d97706, #f59e0b)" shadow="rgba(245,158,11,.35)" />
                        <StatCard label="Completed" count={completed.length} icon="✅" gradient="linear-gradient(135deg, #6366f1, #818cf8)" shadow="rgba(99,102,241,.35)" />
                        <StatCard label="Total" count={sessions.length} icon="📊" gradient="linear-gradient(135deg, #7c3aed, #a855f7)" shadow="rgba(168,85,247,.35)" />
                    </div>
                </div>
            </div>

            {/* ═══ CONTENT ═══ */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 80px' }}>

                {/* Create Button */}
                <button onClick={() => setShowForm(!showForm)} className="mentor-btn" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 32px',
                    background: showForm ? 'linear-gradient(135deg, #64748b, #475569)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                    boxShadow: showForm ? '0 4px 20px rgba(100,116,139,.3)' : '0 8px 30px rgba(99,102,241,.35)',
                    fontFamily: F, marginBottom: '28px', letterSpacing: '-0.2px'
                }}>
                    <span style={{ fontSize: '18px' }}>{showForm ? '✕' : '＋'}</span>
                    {showForm ? 'Cancel' : 'Create New Session'}
                </button>

                {/* ═══ CREATE FORM ═══ */}
                {showForm && (
                    <form onSubmit={handleCreate} className="mentor-card" style={{
                        background: 'white', borderRadius: '20px', padding: '32px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.04)',
                        marginBottom: '36px', animation: 'mentorFadeIn .4s ease', border: '1px solid rgba(0,0,0,.04)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', fontSize: '20px' }}>📌</div>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>New Session Slot</h3>
                                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Fill in the details to create a live session</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                            {/* Course Selector */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={S.label}>Select Course</label>
                                {form.course_id && selectedCourse && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '2px solid #86efac', borderRadius: '14px', padding: '14px 18px', marginBottom: '14px' }}>
                                        <span style={{ fontSize: '22px' }}>✅</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{selectedCourse.title}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{selectedCourse.category} · {selectedCourse.instructor}</div>
                                        </div>
                                        <button type="button" onClick={() => setForm({ ...form, course_id: '' })} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>✕</button>
                                    </div>
                                )}
                                {!form.course_id && (
                                    <>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                            <button type="button" onClick={() => setSelectedCategory('')} className="mentor-cat-btn" style={{
                                                padding: '7px 16px', borderRadius: '24px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: F,
                                                background: !selectedCategory ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9', color: !selectedCategory ? 'white' : '#64748b',
                                                boxShadow: !selectedCategory ? '0 4px 12px rgba(99,102,241,.3)' : 'none'
                                            }}>All ({allCourses.length})</button>
                                            {categories.map(cat => (
                                                <button type="button" key={cat} onClick={() => setSelectedCategory(cat)} className="mentor-cat-btn" style={{
                                                    padding: '7px 16px', borderRadius: '24px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: F,
                                                    background: selectedCategory === cat ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9', color: selectedCategory === cat ? 'white' : '#64748b',
                                                    boxShadow: selectedCategory === cat ? '0 4px 12px rgba(99,102,241,.3)' : 'none'
                                                }}>{cat} ({allCourses.filter(c => c.category === cat).length})</button>
                                            ))}
                                        </div>
                                        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {filteredCourses.map(c => (
                                                <button type="button" key={c.course_id} onClick={() => setForm({ ...form, course_id: String(c.course_id) })} className="mentor-course-pick" style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#fafbfc', border: '2px solid #e8ecf1',
                                                    borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontFamily: F
                                                }}>
                                                    <div style={{ width: '44px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📚</div>
                                                    <div style={{ overflow: 'hidden', minWidth: 0 }}>
                                                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{c.category}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        {filteredCourses.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px 0' }}>No courses found{selectedCategory ? ` in ${selectedCategory}` : ''}</p>}
                                    </>
                                )}
                            </div>
                            <FormField label="Session Title" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="e.g. React Q&A, Doubt Clearing" />
                            <FormField label="Date" type="date" value={form.session_date} onChange={v => setForm({ ...form, session_date: v })} />
                            <FormField label="Start Time" type="time" value={form.start_time} onChange={v => setForm({ ...form, start_time: v })} />
                            <div>
                                <label style={S.label}>Duration</label>
                                <select value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} className="mentor-input" style={S.input}>
                                    <option value={15}>15 min</option><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option><option value={90}>90 min</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="mentor-btn" style={{
                            marginTop: '24px', padding: '14px 36px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none',
                            borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', fontFamily: F,
                            boxShadow: '0 8px 25px rgba(34,197,94,.3)', letterSpacing: '-0.2px'
                        }}>✅ Create Session Slot</button>
                    </form>
                )}

                {/* ═══ ACTIVE VIDEO MEETING ═══ */}
                {activeSession && (
                    <div className="mentor-card" style={{
                        background: 'white', borderRadius: '20px', padding: '24px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,.1)', marginBottom: '36px',
                        border: '2px solid #fca5a5', animation: 'mentorGlow 2s infinite'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', animation: 'livePulse 1.5s infinite' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Live: {activeSession.title}</h3>
                            </div>
                            <button onClick={() => handleComplete(activeSession.session_id)} className="mentor-btn" style={{
                                padding: '10px 20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none',
                                borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', fontFamily: F,
                                boxShadow: '0 4px 15px rgba(239,68,68,.3)'
                            }}>End & Mark Complete</button>
                        </div>
                        <VideoMeeting userName={user?.name || user?.username || 'Mentor'} defaultRoom={activeSession.room_id} defaultRole="mentor" onClose={() => setActiveSession(null)} />
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'mentorPulse 1s infinite', margin: '0 auto 12px' }} />
                        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Loading sessions...</p>
                    </div>
                )}

                {/* ═══ SESSION SECTIONS ═══ */}
                {booked.length > 0 && (
                    <SectionHeader icon="🔔" title="Booked Sessions" subtitle="Students have booked these — be ready!" color="#f59e0b" count={booked.length}>
                        {booked.map(s => <SessionCard key={s.session_id} session={s} courses={allCourses} onStart={() => setActiveSession(s)} onDelete={() => handleDelete(s.session_id)} onEdit={() => handleEdit(s)} editingSession={editingSession} editForm={editForm} setEditForm={setEditForm} onUpdate={handleUpdate} onCancelEdit={() => setEditingSession(null)} type="booked" />)}
                    </SectionHeader>
                )}
                {upcoming.length > 0 && (
                    <SectionHeader icon="📡" title="Available Slots" subtitle="Waiting for students to book" color="#22c55e" count={upcoming.length}>
                        {upcoming.map(s => <SessionCard key={s.session_id} session={s} courses={allCourses} onStart={() => setActiveSession(s)} onDelete={() => handleDelete(s.session_id)} onEdit={() => handleEdit(s)} editingSession={editingSession} editForm={editForm} setEditForm={setEditForm} onUpdate={handleUpdate} onCancelEdit={() => setEditingSession(null)} type="available" />)}
                    </SectionHeader>
                )}
                {completed.length > 0 && (
                    <SectionHeader icon="✅" title="Completed" subtitle="Past sessions" color="#94a3b8" count={completed.length}>
                        {completed.map(s => <SessionCard key={s.session_id} session={s} courses={allCourses} type="completed" />)}
                    </SectionHeader>
                )}

                {/* Empty state */}
                {!isLoading && sessions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'mentorFadeIn .5s ease' }}>
                        <div style={{ width: '100px', height: '100px', margin: '0 auto 24px', borderRadius: '28px', background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px' }}>📹</div>
                        <h3 style={{ color: '#1e293b', fontSize: '22px', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.3px' }}>No sessions yet</h3>
                        <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '400px', margin: '0 auto' }}>Create your first session slot using the button above to start mentoring!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ═══════════ SUB-COMPONENTS ═══════════ */

const StatCard = ({ label, count, icon, gradient, shadow }) => (
    <div className="mentor-card" style={{
        background: gradient, borderRadius: '16px', padding: '20px 22px',
        display: 'flex', alignItems: 'center', gap: '14px',
        boxShadow: `0 8px 25px ${shadow}`, animation: 'mentorFadeIn .5s ease',
        border: '1px solid rgba(255,255,255,.15)'
    }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(6px)', fontSize: '22px' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '30px', fontWeight: '900', color: 'white', lineHeight: 1, letterSpacing: '-1px' }}>{count}</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: '3px' }}>{label}</div>
        </div>
    </div>
)

const SectionHeader = ({ icon, title, subtitle, color, count, children }) => (
    <div style={{ marginBottom: '36px', animation: 'mentorFadeIn .4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, fontSize: '20px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>{title}</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, fontWeight: '500' }}>{subtitle}</p>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', padding: '5px 14px', borderRadius: '10px', background: `${color}15`, color }}>{count}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
            {children}
        </div>
    </div>
)

const SessionCard = ({ session, courses, onStart, onDelete, onEdit, editingSession, editForm, setEditForm, onUpdate, onCancelEdit, type }) => {
    const course = courses?.find(c => c.course_id === session.course_id)
    const isEditing = editingSession === session.session_id
    const colors = { available: { bg: '#f0fdf4', border: '#86efac', accent: '#22c55e' }, booked: { bg: '#fffbeb', border: '#fcd34d', accent: '#f59e0b' }, completed: { bg: '#f8fafc', border: '#e2e8f0', accent: '#94a3b8' } }
    const c = colors[session.status] || colors.available

    return (
        <div className="mentor-card" style={{
            background: 'white', borderRadius: '18px', padding: '24px',
            boxShadow: '0 4px 20px -4px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.03)',
            border: `1px solid ${c.border}40`, position: 'relative', overflow: 'hidden'
        }}>
            {/* Top accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${c.accent}, ${c.accent}60)` }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.2px', flex: 1, paddingRight: '12px' }}>{session.title}</h4>
                <span style={{
                    fontSize: '10px', fontWeight: '800', padding: '4px 12px', borderRadius: '8px', letterSpacing: '0.5px',
                    background: c.bg, color: c.accent, textTransform: 'uppercase', border: `1px solid ${c.border}60`, whiteSpace: 'nowrap'
                }}>{session.status}</span>
            </div>

            {isEditing ? (
                <form onSubmit={onUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'mentorFadeIn .3s ease' }}>
                    <FormField label="Title" value={editForm.title} onChange={v => setEditForm({ ...editForm, title: v })} small />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <FormField label="Date" type="date" value={editForm.session_date} onChange={v => setEditForm({ ...editForm, session_date: v })} small />
                        <FormField label="Time" type="time" value={editForm.start_time} onChange={v => setEditForm({ ...editForm, start_time: v })} small />
                    </div>
                    <div>
                        <label style={{ ...S.label, fontSize: '11px' }}>Duration</label>
                        <select value={editForm.duration_minutes} onChange={e => setEditForm({ ...editForm, duration_minutes: Number(e.target.value) })} className="mentor-input" style={{ ...S.input, padding: '9px 12px', fontSize: '13px' }}>
                            <option value={15}>15 min</option><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option><option value={90}>90 min</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button type="submit" className="mentor-btn" style={{ padding: '9px 20px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', fontFamily: "'Inter', system-ui", boxShadow: '0 4px 12px rgba(34,197,94,.25)' }}>✅ Save</button>
                        <button type="button" onClick={onCancelEdit} className="mentor-btn" style={{ padding: '9px 20px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: "'Inter', system-ui" }}>Cancel</button>
                    </div>
                </form>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                        <InfoRow icon="📚" text={course?.title || `Course #${session.course_id}`} />
                        <InfoRow icon="📅" text={`${session.session_date} at ${session.start_time}`} />
                        <InfoRow icon="⏱" text={`${session.duration_minutes} minutes`} />
                        {session.student_name && <InfoRow icon="👤" text={<>Booked by: <strong style={{ color: '#0f172a' }}>{session.student_name}</strong></>} />}
                        <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: '500', fontFamily: 'monospace', marginTop: '2px' }}>Room: {session.room_id}</div>
                    </div>
                    {type !== 'completed' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '18px', flexWrap: 'wrap' }}>
                            {onStart && <ActionBtn label="🎥 Start" bg="linear-gradient(135deg, #6366f1, #8b5cf6)" shadow="rgba(99,102,241,.3)" onClick={onStart} />}
                            {onEdit && <ActionBtn label="✏️ Edit" bg="linear-gradient(135deg, #3b82f6, #2563eb)" shadow="rgba(59,130,246,.25)" onClick={onEdit} />}
                            {onDelete && <ActionBtn label="🗑 Delete" bg="linear-gradient(135deg, #f87171, #ef4444)" shadow="rgba(248,113,113,.25)" onClick={onDelete} />}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

const InfoRow = ({ icon, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{icon}</span>
        <span>{text}</span>
    </div>
)

const ActionBtn = ({ label, bg, shadow, onClick }) => (
    <button onClick={onClick} className="mentor-btn" style={{
        padding: '9px 18px', background: bg, color: 'white', border: 'none', borderRadius: '10px',
        cursor: 'pointer', fontWeight: '700', fontSize: '12px', fontFamily: "'Inter', system-ui",
        boxShadow: `0 4px 14px ${shadow}`, letterSpacing: '-0.1px'
    }}>{label}</button>
)

const FormField = ({ label, value, onChange, placeholder, type = 'text', small }) => (
    <div>
        <label style={{ ...S.label, ...(small ? { fontSize: '11px' } : {}) }}>{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="mentor-input" style={{ ...S.input, ...(small ? { padding: '9px 12px', fontSize: '13px' } : {}) }} />
    </div>
)

const S = {
    label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: {
        width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e8ecf1',
        fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fafbfc', color: '#1e293b',
        fontFamily: "'Inter', system-ui", fontWeight: '500', transition: 'all .2s ease'
    }
}

export default MentorDashboard
