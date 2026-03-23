// AdminDashboard.jsx — Industry-Level Admin Dashboard with Sidebar Navigation
import { useState, useMemo } from 'react'
import useAuth from '../hooks/useAuth'
import {
    useGetAdminStatsQuery,
    useGetAdminUsersQuery, useUpdateUserRoleMutation, useDeleteUserMutation,
    useGetAdminCoursesQuery, useDeleteAdminCourseMutation,
    useGetAdminPaymentsQuery,
    useGetAdminQuizzesQuery,
    useGetAdminThreadsQuery, useDeleteAdminThreadMutation,
    useGetAdminSessionsQuery, useDeleteAdminSessionMutation,
} from '../store/api/adminApi'

const MENU = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'quizzes', label: 'Quizzes', icon: '📝' },
    { id: 'forum', label: 'Forum', icon: '💬' },
    { id: 'sessions', label: 'Sessions', icon: '📹' },
]

const AdminDashboard = () => {
    const { user, logout } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')
    const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery()

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: '#f1f5f9' }}>

            {/* ═══ SIDEBAR ═══ */}
            <aside style={{
                width: '240px', minHeight: '100vh', background: '#0f172a',
                display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
                boxShadow: '4px 0 20px rgba(0,0,0,0.15)'
            }}>
                {/* Logo */}
                <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
                        }}>⚡</div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: '800', color: 'white', letterSpacing: '-0.3px' }}>LearnHub</div>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {MENU.map(item => {
                        const isActive = activeTab === item.id
                        return (
                            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '11px 14px', border: 'none', borderRadius: '10px',
                                cursor: 'pointer', fontSize: '13.5px', fontWeight: '600',
                                transition: 'all 0.2s ease',
                                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                                color: isActive ? '#a5b4fc' : '#94a3b8',
                            }}
                                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#cbd5e1' } }}
                                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' } }}
                            >
                                <span style={{ fontSize: '17px', width: '22px', textAlign: 'center' }}>{item.icon}</span>
                                {item.label}
                                {isActive && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} />}
                            </button>
                        )
                    })}
                </nav>

                {/* Bottom: User + Logout */}
                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {/* System status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', marginBottom: '12px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                        <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: '600' }}>System Online</span>
                    </div>

                    {/* User info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '14px', fontWeight: '700'
                        }}>{(user?.name || user?.username || 'A').charAt(0).toUpperCase()}</div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || user?.username || 'Admin'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Administrator</div>
                        </div>
                    </div>

                    <button onClick={logout} style={{
                        width: '100%', marginTop: '8px', padding: '9px', background: 'rgba(239,68,68,0.1)',
                        color: '#fca5a5', border: 'none', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '12px', fontWeight: '600', transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                    >🚪 Sign Out</button>
                </div>
            </aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <div style={{ flex: 1, marginLeft: '240px', minHeight: '100vh' }}>

                {/* Header */}
                <header style={{
                    background: 'white', padding: '16px 28px', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    position: 'sticky', top: 0, zIndex: 50
                }}>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                            {MENU.find(m => m.id === activeTab)?.icon} {MENU.find(m => m.id === activeTab)?.label}
                        </h1>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0', fontWeight: '500' }}>
                            {activeTab === 'overview' ? 'Platform overview and analytics' :
                             activeTab === 'users' ? 'Manage all platform users' :
                             activeTab === 'courses' ? 'Manage all courses' :
                             activeTab === 'payments' ? 'Track revenue and transactions' :
                             activeTab === 'quizzes' ? 'Manage quizzes and assessments' :
                             activeTab === 'forum' ? 'Moderate forum discussions' :
                             'Monitor live mentor sessions'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            padding: '8px 14px', background: '#f8fafc', borderRadius: '8px',
                            fontSize: '12px', color: '#64748b', fontWeight: '600', border: '1px solid #e2e8f0'
                        }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ padding: '24px 28px 60px' }}>
                    {activeTab === 'overview' && <OverviewTab stats={stats} loading={statsLoading} />}
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'courses' && <CoursesTab />}
                    {activeTab === 'payments' && <PaymentsTab />}
                    {activeTab === 'quizzes' && <QuizzesTab />}
                    {activeTab === 'forum' && <ForumTab />}
                    {activeTab === 'sessions' && <SessionsTab />}
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW TAB — Stats + Charts + Activity Feed
   ═══════════════════════════════════════════════════════════════ */
const OverviewTab = ({ stats, loading }) => {
    if (loading) return <LoadingSkeleton />

    const cards = [
        { label: 'Total Users', value: stats?.total_users || 0, icon: '👥', color: '#6366f1', bg: '#eef2ff', trend: '+12%' },
        { label: 'Total Courses', value: stats?.total_courses || 0, icon: '📚', color: '#0ea5e9', bg: '#e0f2fe', trend: '+5%' },
        { label: 'Revenue', value: `$${(stats?.revenue?.total_revenue || 0).toLocaleString()}`, icon: '💰', color: '#10b981', bg: '#d1fae5', trend: '+23%' },
        { label: 'Quizzes', value: stats?.total_quizzes || 0, icon: '📝', color: '#f59e0b', bg: '#fef3c7', trend: '+8%' },
        { label: 'Forum Posts', value: (stats?.forum?.threads || 0) + (stats?.forum?.replies || 0), icon: '💬', color: '#ec4899', bg: '#fce7f3', trend: '+15%' },
        { label: 'Sessions', value: stats?.sessions?.total || 0, icon: '📹', color: '#8b5cf6', bg: '#f3e8ff', trend: '+3%' },
    ]

    const totalUsers = stats?.total_users || 1
    const students = stats?.role_breakdown?.students || 0
    const mentors = stats?.role_breakdown?.mentors || 0
    const admins = stats?.role_breakdown?.admins || 0

    return (
        <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {cards.map((c, i) => (
                    <div key={i} style={{
                        background: 'white', borderRadius: '14px', padding: '20px',
                        border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden',
                        cursor: 'default', transition: 'all 0.25s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                    >
                        <div style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '52px', opacity: 0.06 }}>{c.icon}</div>
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '10px', background: c.bg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', marginBottom: '12px'
                        }}>{c.icon}</div>
                        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <p style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{c.value}</p>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', background: '#d1fae520', padding: '2px 6px', borderRadius: '4px' }}>↑ {c.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {/* Revenue Chart */}
                <div style={panelStyle}>
                    <h3 style={panelTitleStyle}>📈 Revenue Overview</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', padding: '0 8px' }}>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, i) => {
                            const heights = [45, 62, 48, 75, 90, 68, 95]
                            return (
                                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <div style={{
                                        width: '100%', height: `${heights[i]}%`,
                                        background: `linear-gradient(180deg, #6366f1, #818cf8)`,
                                        borderRadius: '6px 6px 2px 2px', minHeight: '20px',
                                        transition: 'all 0.3s', cursor: 'pointer', opacity: 0.85
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scaleY(1.05)' }}
                                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scaleY(1)' }}
                                    />
                                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>{month}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* User Distribution */}
                <div style={panelStyle}>
                    <h3 style={panelTitleStyle}>👥 User Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
                        <DistBar label="Students" count={students} total={totalUsers} color="#6366f1" />
                        <DistBar label="Mentors" count={mentors} total={totalUsers} color="#0ea5e9" />
                        <DistBar label="Admins" count={admins} total={totalUsers} color="#f59e0b" />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                        <MiniStat label="Total" value={totalUsers} color="#0f172a" />
                        <MiniStat label="Completed" value={stats?.revenue?.completed || 0} color="#10b981" />
                        <MiniStat label="Pending" value={stats?.revenue?.pending || 0} color="#f59e0b" />
                    </div>
                </div>
            </div>

            {/* Session & Payment Status Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <StatusPanel title="💰 Payment Status" items={[
                    { label: 'Completed', count: stats?.revenue?.completed || 0, color: '#10b981' },
                    { label: 'Pending', count: stats?.revenue?.pending || 0, color: '#f59e0b' },
                    { label: 'Failed', count: stats?.revenue?.failed || 0, color: '#ef4444' },
                ]} />
                <StatusPanel title="📹 Session Status" items={[
                    { label: 'Available', count: stats?.sessions?.available || 0, color: '#22c55e' },
                    { label: 'Booked', count: stats?.sessions?.booked || 0, color: '#f59e0b' },
                    { label: 'Completed', count: stats?.sessions?.completed || 0, color: '#64748b' },
                ]} />
                <div style={panelStyle}>
                    <h3 style={panelTitleStyle}>💬 Forum Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <StatRow icon="📄" label="Threads" value={stats?.forum?.threads || 0} />
                        <StatRow icon="💬" label="Replies" value={stats?.forum?.replies || 0} />
                        <StatRow icon="⭐" label="Interactions" value={stats?.total_interactions || 0} />
                    </div>
                </div>
            </div>

            {/* Recent Users */}
            {stats?.recent_users?.length > 0 && (
                <div style={panelStyle}>
                    <h3 style={panelTitleStyle}>🆕 Recent Registrations</h3>
                    <table style={tableStyle}>
                        <thead><tr>{['ID', 'Name', 'Email', 'Role', 'Joined'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                        <tbody>
                            {stats.recent_users.map(u => (
                                <tr key={u.user_id} style={trHoverStyle}>
                                    <td style={tdStyle}><span style={{ color: '#94a3b8', fontWeight: '600' }}>#{u.user_id}</span></td>
                                    <td style={{ ...tdStyle, fontWeight: '600', color: '#0f172a' }}>{u.username}</td>
                                    <td style={tdStyle}>{u.email}</td>
                                    <td style={tdStyle}><RoleBadge role={u.role} /></td>
                                    <td style={{ ...tdStyle, fontSize: '12px', color: '#94a3b8' }}>{u.created_date ? new Date(u.created_date).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}

/* ═══════════════════════════════════════════════════════════════
   USERS TAB
   ═══════════════════════════════════════════════════════════════ */
const UsersTab = () => {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const { data, isLoading } = useGetAdminUsersQuery({ page, limit: 30 })
    const [updateRole] = useUpdateUserRoleMutation()
    const [deleteUser] = useDeleteUserMutation()
    const users = data?.data || []
    const pagination = data?.pagination || {}
    const filtered = search ? users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) : users

    if (isLoading) return <LoadingSkeleton />
    return (
        <div style={panelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ ...panelTitleStyle, margin: 0 }}>Total: {pagination.total || 0} users</h3>
                <input placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={searchStyle} />
            </div>
            <table style={tableStyle}>
                <thead><tr>{['ID', 'Name', 'Email', 'Skill Level', 'Role', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {filtered.map(u => (
                        <tr key={u.user_id} style={trHoverStyle}>
                            <td style={tdStyle}><span style={{ color: '#94a3b8', fontWeight: '600' }}>#{u.user_id}</span></td>
                            <td style={{ ...tdStyle, fontWeight: '600', color: '#0f172a' }}>{u.username}</td>
                            <td style={tdStyle}>{u.email}</td>
                            <td style={tdStyle}><span style={{ fontSize: '11px', background: '#f1f5f9', padding: '3px 10px', borderRadius: '6px', fontWeight: '600', color: '#475569' }}>{u.skill_level || 'N/A'}</span></td>
                            <td style={tdStyle}>
                                <select value={u.role || 'student'} onChange={e => { if (window.confirm(`Change role to "${e.target.value}"?`)) updateRole({ id: u.user_id, role: e.target.value }) }}
                                    style={{ padding: '5px 10px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: 'white', color: '#334155' }}>
                                    <option value="student">Student</option>
                                    <option value="mentor">Mentor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td style={tdStyle}>
                                <button onClick={() => { if (window.confirm(`Delete "${u.username}"?`)) deleteUser(u.user_id) }} style={dangerBtnStyle}>🗑</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination page={page} total={pagination.pages || 1} onChange={setPage} />
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   COURSES TAB
   ═══════════════════════════════════════════════════════════════ */
const CoursesTab = () => {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const { data, isLoading } = useGetAdminCoursesQuery({ page, limit: 30 })
    const [deleteCourse] = useDeleteAdminCourseMutation()
    const courses = data?.data || []
    const pagination = data?.pagination || {}
    const filtered = search ? courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase())) : courses

    if (isLoading) return <LoadingSkeleton />
    return (
        <div style={panelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ ...panelTitleStyle, margin: 0 }}>Total: {pagination.total || 0} courses</h3>
                <input placeholder="🔍 Search courses..." value={search} onChange={e => setSearch(e.target.value)} style={searchStyle} />
            </div>
            <table style={tableStyle}>
                <thead><tr>{['ID', 'Title', 'Category', 'Level', 'Instructor', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {filtered.map(c => (
                        <tr key={c.course_id} style={trHoverStyle}>
                            <td style={tdStyle}><span style={{ color: '#94a3b8', fontWeight: '600' }}>#{c.course_id}</span></td>
                            <td style={{ ...tdStyle, fontWeight: '600', color: '#0f172a', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                            <td style={tdStyle}><span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0284c7', padding: '3px 10px', borderRadius: '6px', fontWeight: '600' }}>{c.category || 'N/A'}</span></td>
                            <td style={tdStyle}>{c.level || 'N/A'}</td>
                            <td style={tdStyle}>{c.instructor || 'N/A'}</td>
                            <td style={tdStyle}>
                                <button onClick={() => { if (window.confirm(`Delete "${c.title}"?`)) deleteCourse(c.course_id) }} style={dangerBtnStyle}>🗑</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination page={page} total={pagination.pages || 1} onChange={setPage} />
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   PAYMENTS TAB
   ═══════════════════════════════════════════════════════════════ */
const PaymentsTab = () => {
    const [page, setPage] = useState(1)
    const { data, isLoading } = useGetAdminPaymentsQuery({ page, limit: 30 })
    const payments = data?.data || []
    const revenue = data?.revenue || {}
    const pagination = data?.pagination || {}

    if (isLoading) return <LoadingSkeleton />
    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
                <MiniCard label="Total Revenue" value={`$${(revenue.total_revenue || 0).toLocaleString()}`} color="#10b981" icon="💰" />
                <MiniCard label="Completed" value={revenue.completed || 0} color="#22c55e" icon="✅" />
                <MiniCard label="Pending" value={revenue.pending || 0} color="#f59e0b" icon="⏳" />
                <MiniCard label="Failed" value={revenue.failed || 0} color="#ef4444" icon="❌" />
            </div>
            <div style={panelStyle}>
                <h3 style={panelTitleStyle}>All Transactions</h3>
                <table style={tableStyle}>
                    <thead><tr>{['ID', 'User', 'Course', 'Provider', 'Amount', 'Status', 'Date'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.payment_id} style={trHoverStyle}>
                                <td style={tdStyle}><span style={{ color: '#94a3b8', fontWeight: '600' }}>#{p.payment_id}</span></td>
                                <td style={{ ...tdStyle, fontWeight: '600', color: '#0f172a' }}>{p.username || `User #${p.user_id}`}</td>
                                <td style={{ ...tdStyle, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.course_title || `Course #${p.course_id}`}</td>
                                <td style={tdStyle}><ProviderBadge provider={p.provider} /></td>
                                <td style={{ ...tdStyle, fontWeight: '700', color: '#0f172a' }}>${p.amount || 0}</td>
                                <td style={tdStyle}><PaymentStatus status={p.status} /></td>
                                <td style={{ ...tdStyle, fontSize: '12px', color: '#94a3b8' }}>{p.created_date ? new Date(p.created_date).toLocaleDateString() : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination page={page} total={pagination.pages || 1} onChange={setPage} />
            </div>
        </>
    )
}

/* ═══════════════════════════════════════════════════════════════
   QUIZZES TAB
   ═══════════════════════════════════════════════════════════════ */
const QuizzesTab = () => {
    const { data: quizzes = [], isLoading } = useGetAdminQuizzesQuery()
    if (isLoading) return <LoadingSkeleton />
    return (
        <div style={panelStyle}>
            <h3 style={panelTitleStyle}>Total: {quizzes.length} quizzes</h3>
            <table style={tableStyle}>
                <thead><tr>{['ID', 'Title', 'Course', 'Pass Score', 'Questions', 'Attempts'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {quizzes.map(q => (
                        <tr key={q.quiz_id} style={trHoverStyle}>
                            <td style={tdStyle}><span style={{ color: '#94a3b8', fontWeight: '600' }}>#{q.quiz_id}</span></td>
                            <td style={{ ...tdStyle, fontWeight: '600', color: '#0f172a' }}>{q.title}</td>
                            <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.course_title || 'N/A'}</td>
                            <td style={tdStyle}>{q.passing_score}%</td>
                            <td style={tdStyle}><span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px' }}>{q.question_count} Q</span></td>
                            <td style={tdStyle}>{q.attempt_count || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   FORUM TAB
   ═══════════════════════════════════════════════════════════════ */
const ForumTab = () => {
    const { data: threads = [], isLoading } = useGetAdminThreadsQuery()
    const [deleteThread] = useDeleteAdminThreadMutation()
    if (isLoading) return <LoadingSkeleton />
    return (
        <div style={panelStyle}>
            <h3 style={panelTitleStyle}>Total: {threads.length} threads</h3>
            <table style={tableStyle}>
                <thead><tr>{['ID', 'Title', 'Author', 'Votes', 'Replies', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {threads.map(t => (
                        <tr key={t.THREAD_ID} style={trHoverStyle}>
                            <td style={tdStyle}><span style={{ color: '#94a3b8', fontWeight: '600' }}>#{t.THREAD_ID}</span></td>
                            <td style={{ ...tdStyle, fontWeight: '600', color: '#0f172a', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.TITLE}</td>
                            <td style={tdStyle}>{t.AUTHOR}</td>
                            <td style={tdStyle}>
                                <span style={{ color: '#10b981', fontWeight: '700' }}>+{t.UPVOTES || 0}</span>
                                <span style={{ color: '#cbd5e1', margin: '0 4px' }}>/</span>
                                <span style={{ color: '#ef4444', fontWeight: '700' }}>-{t.DOWNVOTES || 0}</span>
                            </td>
                            <td style={tdStyle}>{t.REPLY_COUNT || 0}</td>
                            <td style={tdStyle}>
                                <button onClick={() => { if (window.confirm('Delete this thread?')) deleteThread(t.THREAD_ID) }} style={dangerBtnStyle}>🗑</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   SESSIONS TAB
   ═══════════════════════════════════════════════════════════════ */
const SessionsTab = () => {
    const { data: sessions = [], isLoading } = useGetAdminSessionsQuery()
    const [deleteSession] = useDeleteAdminSessionMutation()
    if (isLoading) return <LoadingSkeleton />
    return (
        <div style={panelStyle}>
            <h3 style={panelTitleStyle}>Total: {sessions.length} sessions</h3>
            <table style={tableStyle}>
                <thead><tr>{['ID', 'Title', 'Mentor', 'Student', 'Date', 'Status', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {sessions.map(s => (
                        <tr key={s.session_id} style={trHoverStyle}>
                            <td style={tdStyle}><span style={{ color: '#94a3b8', fontWeight: '600' }}>#{s.session_id}</span></td>
                            <td style={{ ...tdStyle, fontWeight: '600', color: '#0f172a' }}>{s.title}</td>
                            <td style={tdStyle}>{s.mentor_name}</td>
                            <td style={tdStyle}>{s.student_name || '—'}</td>
                            <td style={{ ...tdStyle, fontSize: '12px' }}>{s.session_date} {s.start_time}</td>
                            <td style={tdStyle}><SessionStatus status={s.status} /></td>
                            <td style={tdStyle}>
                                {s.status !== 'completed' && (
                                    <button onClick={() => { if (window.confirm('Delete?')) deleteSession(s.session_id) }} style={dangerBtnStyle}>🗑</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
const RoleBadge = ({ role }) => {
    const c = { admin: { bg: '#fef3c7', text: '#d97706' }, mentor: { bg: '#e0f2fe', text: '#0284c7' }, student: { bg: '#f1f5f9', text: '#475569' } }[role] || { bg: '#f1f5f9', text: '#475569' }
    return <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px', background: c.bg, color: c.text, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{role || 'student'}</span>
}

const PaymentStatus = ({ status }) => {
    const c = { completed: '#10b981', pending: '#f59e0b', failed: '#ef4444' }[status] || '#64748b'
    return <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px', background: c + '15', color: c, textTransform: 'uppercase' }}>{status || 'unknown'}</span>
}

const SessionStatus = ({ status }) => {
    const c = { completed: '#64748b', booked: '#d97706', available: '#16a34a' }[status] || '#64748b'
    return <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px', background: c + '15', color: c, textTransform: 'uppercase' }}>{status}</span>
}

const ProviderBadge = ({ provider }) => {
    const c = provider === 'stripe' ? { bg: '#635bff20', text: '#635bff' } : { bg: '#5C2D9120', text: '#5C2D91' }
    return <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px', background: c.bg, color: c.text }}>{(provider || 'N/A').toUpperCase()}</span>
}

const DistBar = ({ label, count, total, color }) => {
    const pct = Math.round((count / total) * 100) || 0
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{label}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color }}>{count} <span style={{ color: '#cbd5e1', fontWeight: '400' }}>({pct}%)</span></span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}90)`, borderRadius: '99px', transition: 'width 0.8s ease' }} />
            </div>
        </div>
    )
}

const MiniStat = ({ label, value, color }) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
        <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', margin: '0 0 2px', textTransform: 'uppercase' }}>{label}</p>
        <p style={{ fontSize: '18px', fontWeight: '800', color, margin: 0 }}>{value}</p>
    </div>
)

const StatusPanel = ({ title, items }) => (
    <div style={panelStyle}>
        <h3 style={panelTitleStyle}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fafbfc', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{item.count}</span>
                </div>
            ))}
        </div>
    </div>
)

const StatRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fafbfc', borderRadius: '8px' }}>
        <span style={{ fontSize: '13px', color: '#475569' }}>{icon} {label}</span>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{value}</span>
    </div>
)

const MiniCard = ({ label, value, color, icon }) => (
    <div style={{ background: 'white', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', transition: 'all 0.25s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', margin: '0 0 6px', textTransform: 'uppercase' }}>{icon} {label}</p>
        <p style={{ fontSize: '22px', fontWeight: '800', color, margin: 0 }}>{value}</p>
    </div>
)

const Pagination = ({ page, total, onChange }) => {
    if (total <= 1) return null
    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <button disabled={page <= 1} onClick={() => onChange(page - 1)} style={{ ...pagBtnStyle, opacity: page <= 1 ? 0.4 : 1 }}>← Prev</button>
            <span style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Page {page} of {total}</span>
            <button disabled={page >= total} onClick={() => onChange(page + 1)} style={{ ...pagBtnStyle, opacity: page >= total ? 0.4 : 1 }}>Next →</button>
        </div>
    )
}

const LoadingSkeleton = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', height: '120px' }}>
                <div style={{ width: '60%', height: '12px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '14px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '40%', height: '28px', background: '#f1f5f9', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
            </div>
        ))}
        <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
    </div>
)

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const panelStyle = { background: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }
const panelTitleStyle = { fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' }
const thStyle = { padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f1f5f9', background: '#fafbfc' }
const tdStyle = { padding: '12px 14px', color: '#475569', borderBottom: '1px solid #f8fafc' }
const trHoverStyle = { transition: 'background 0.15s', cursor: 'default' }
const searchStyle = { padding: '9px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '13px', outline: 'none', width: '260px', background: '#fafbfc', transition: 'border-color 0.2s' }
const dangerBtnStyle = { padding: '6px 10px', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }
const pagBtnStyle = { padding: '8px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#334155' }

export default AdminDashboard
