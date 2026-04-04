// AdminDashboard.jsx — Ultra-Premium SaaS Admin Dashboard
import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import useAuth from '../hooks/useAuth'
import {
    useGetAdminStatsQuery,
    useGetAdminUsersQuery, useUpdateUserRoleMutation, useDeleteUserMutation,
    useGetAdminCoursesQuery, useDeleteAdminCourseMutation,
    useGetAdminPaymentsQuery,
    useGetAdminQuizzesQuery, useCreateAdminQuizMutation, useGetAdminQuizDetailsQuery, useUpdateAdminQuizMutation, useDeleteAdminQuizMutation,
    useAddAdminQuestionMutation, useUpdateAdminQuestionMutation, useDeleteAdminQuestionMutation,
    useGetAdminThreadsQuery, useGetAdminThreadDetailsQuery, useDeleteAdminThreadMutation, useDeleteAdminReplyMutation, useGetAdminForumStatsQuery,
    useGetAdminSessionsQuery, useDeleteAdminSessionMutation,
} from '../store/api/adminApi'

/* ── Lucide-style SVG Icons ── */
const I = {
    grid: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    book: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    card: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    file: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    chat: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    video: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><polygon points="23 7 16 12 23 17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
    trash: <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    out: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    bar: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    search: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    bolt: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" opacity="0.95"/></svg>,
    up: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/></svg>,
    dollar: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    award: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
    activity: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
}

const MENU = [
    { id: 'overview', label: 'Dashboard', icon: I.grid, section: 'Main' },
    { id: 'users', label: 'Users', icon: I.users, section: 'Management' },
    { id: 'courses', label: 'Courses', icon: I.book, section: 'Management' },
    { id: 'payments', label: 'Payments', icon: I.card, section: 'Management' },
    { id: 'quizzes', label: 'Quizzes', icon: I.file, section: 'Community' },
    { id: 'forum', label: 'Forum', icon: I.chat, section: 'Community' },
    { id: 'sessions', label: 'Sessions', icon: I.video, section: 'Community' },
]

const SUBS = { overview: 'Real-time platform analytics & insights', users: 'User accounts & role management', courses: 'Course catalog & content management', payments: 'Financial transactions & revenue', quizzes: 'Assessment & quiz management', forum: 'Community discussions & moderation', sessions: 'Live mentoring & video sessions' }

/* ── Premium Inline Styles (for gradients Tailwind can't do) ── */
const gradientBorder = (color) => ({
    background: `linear-gradient(135deg, ${color}15, ${color}05)`,
    borderLeft: `3px solid ${color}`,
})

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const AdminDashboard = () => {
    const { user, logout } = useAuth()
    const [tab, setTab] = useState('overview')
    const { data: stats, isLoading: sl } = useGetAdminStatsQuery()
    let lastSection = ''

    return (
        <div className="flex min-h-screen bg-[#f0f2f5]" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            {/* ═══ PREMIUM SIDEBAR ═══ */}
            <aside className="w-[270px] min-h-screen fixed top-0 left-0 bottom-0 z-50 flex flex-col overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #0c1029 0%, #0f1535 50%, #0c1222 100%)' }}>
                {/* Logo */}
                <div className="px-6 pt-7 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-[14px] flex items-center justify-center relative"
                            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)', boxShadow: '0 8px 24px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.1)' }}>
                            {I.bolt}
                        </div>
                        <div>
                            <div className="text-white font-black text-lg tracking-tight" style={{ letterSpacing: '-0.5px' }}>SmartElearn</div>
                            <div className="text-[9px] font-bold uppercase tracking-[2px]" style={{ color: '#4a5578' }}>Admin Console</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3.5 pt-5 pb-3 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    {MENU.map(m => {
                        const showSection = m.section !== lastSection
                        lastSection = m.section
                        const active = tab === m.id
                        return (
                            <div key={m.id}>
                                {showSection && <div className="px-3.5 pt-5 pb-2.5 text-[9px] font-extrabold uppercase tracking-[2px]" style={{ color: '#334166' }}>{m.section}</div>}
                                <button onClick={() => setTab(m.id)} className="w-full flex items-center gap-3.5 px-4 py-[11px] rounded-xl text-[13px] font-medium transition-all duration-300 relative group"
                                    style={active ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', color: '#a5b4fc', fontWeight: 600, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' } : { color: '#5a6a8a' }}>
                                    {active && <div className="absolute left-0 top-[20%] h-[60%] w-[3px] rounded-r-full" style={{ background: 'linear-gradient(180deg, #6366f1, #a855f7)' }} />}
                                    <span className={`transition-all duration-300 ${active ? 'opacity-100 scale-110' : 'opacity-50 group-hover:opacity-75'}`} style={active ? { filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.4))' } : {}}>{m.icon}</span>
                                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">{m.label}</span>
                                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#818cf8', boxShadow: '0 0 8px rgba(129,140,248,0.6)' }} />}
                                </button>
                            </div>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="px-4 pb-5 pt-3 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>

                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}>
                            {(user?.name || user?.username || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-bold text-slate-200 truncate">{user?.name || user?.username || 'Admin'}</div>
                            <div className="text-[9px] font-bold uppercase tracking-[1.5px]" style={{ color: '#4a5578' }}>Administrator</div>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.04))', border: '1px solid rgba(239,68,68,0.1)', color: '#fca5a5' }}>
                        {I.out} Sign Out
                    </button>
                </div>
            </aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <div className="flex-1 ml-[270px] min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-40 px-8 py-5 flex items-center justify-between"
                    style={{ background: 'rgba(240,242,245,0.85)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #6366f108, #6366f115)', border: '1px solid rgba(99,102,241,0.08)' }}>
                                <span className="text-indigo-500">{MENU.find(m => m.id === tab)?.icon}</span>
                            </div>
                            <div>
                                <h1 className="text-[22px] font-black text-slate-900 tracking-tight">{MENU.find(m => m.id === tab)?.label}</h1>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{SUBS[tab]}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 tracking-wide"
                            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 pb-20">
                    {tab === 'overview' && <OverviewTab stats={stats} loading={sl} />}
                    {tab === 'users' && <UsersTab />}
                    {tab === 'courses' && <CoursesTab />}
                    {tab === 'payments' && <PaymentsTab />}
                    {tab === 'quizzes' && <QuizzesTab />}
                    {tab === 'forum' && <ForumTab />}
                    {tab === 'sessions' && <SessionsTab />}
                </div>
            </div>
        </div>
    )
}

/* ── Chart Data ── */
const revenueData = [
    { month: 'Jan', revenue: 4200 }, { month: 'Feb', revenue: 5800 }, { month: 'Mar', revenue: 4500 },
    { month: 'Apr', revenue: 7200 }, { month: 'May', revenue: 8800 }, { month: 'Jun', revenue: 6500 },
    { month: 'Jul', revenue: 9200 }, { month: 'Aug', revenue: 7800 }, { month: 'Sep', revenue: 10500 },
    { month: 'Oct', revenue: 8900 }, { month: 'Nov', revenue: 11200 }, { month: 'Dec', revenue: 12800 },
]
const enrollData = [
    { month: 'Jan', enrollments: 45 }, { month: 'Feb', enrollments: 62 }, { month: 'Mar', enrollments: 55 },
    { month: 'Apr', enrollments: 78 }, { month: 'May', enrollments: 92 }, { month: 'Jun', enrollments: 68 },
    { month: 'Jul', enrollments: 85 }, { month: 'Aug', enrollments: 110 }, { month: 'Sep', enrollments: 95 },
    { month: 'Oct', enrollments: 120 }, { month: 'Nov', enrollments: 105 }, { month: 'Dec', enrollments: 140 },
]
const growthData = [
    { month: 'Jan', users: 180 }, { month: 'Feb', users: 260 }, { month: 'Mar', users: 340 },
    { month: 'Apr', users: 420 }, { month: 'May', users: 530 }, { month: 'Jun', users: 610 },
    { month: 'Jul', users: 720 }, { month: 'Aug', users: 810 }, { month: 'Sep', users: 900 },
    { month: 'Oct', users: 950 }, { month: 'Nov', users: 1000 }, { month: 'Dec', users: 1033 },
]

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl px-4 py-3 text-xs" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 36px rgba(0,0,0,0.3)' }}>
            <p className="font-bold text-white mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="font-semibold" style={{ color: p.color || '#818cf8' }}>
                    {p.name}: <span className="text-white font-extrabold">{typeof p.value === 'number' && p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value.toLocaleString()}</span>
                </p>
            ))}
        </div>
    )
}

const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl px-4 py-3 text-xs" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 36px rgba(0,0,0,0.3)' }}>
            <p className="font-bold text-white">{payload[0].name}: <span className="font-extrabold" style={{ color: payload[0].payload.color }}>{payload[0].value.toLocaleString()}</span></p>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════════ */
const OverviewTab = ({ stats, loading }) => {
    if (loading) return <Skeleton />
    const cards = [
        { l: 'Total Users', v: stats?.total_users || 0, icon: I.users, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', shadow: 'rgba(99,102,241,0.3)', bg: '#eef2ff', color: '#4f46e5', trend: '+12%' },
        { l: 'Total Courses', v: stats?.total_courses || 0, icon: I.book, gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', shadow: 'rgba(14,165,233,0.3)', bg: '#e0f2fe', color: '#0284c7', trend: '+5%' },
        { l: 'Revenue', v: `$${(stats?.revenue?.total_revenue || 0).toLocaleString()}`, icon: I.dollar, gradient: 'linear-gradient(135deg, #10b981, #34d399)', shadow: 'rgba(16,185,129,0.3)', bg: '#d1fae5', color: '#059669', trend: '+23%' },
        { l: 'Quizzes', v: stats?.total_quizzes || 0, icon: I.file, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', shadow: 'rgba(245,158,11,0.3)', bg: '#fef3c7', color: '#d97706', trend: '+8%' },
        { l: 'Forum Posts', v: (stats?.forum?.threads || 0) + (stats?.forum?.replies || 0), icon: I.chat, gradient: 'linear-gradient(135deg, #ec4899, #f472b6)', shadow: 'rgba(236,72,153,0.3)', bg: '#fce7f3', color: '#db2777', trend: '+15%' },
        { l: 'Sessions', v: stats?.sessions?.total || 0, icon: I.video, gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', shadow: 'rgba(139,92,246,0.3)', bg: '#f3e8ff', color: '#7c3aed', trend: '+3%' },
    ]
    const tu = stats?.total_users || 1, st = stats?.role_breakdown?.students || 0, mt = stats?.role_breakdown?.mentors || 0, ad = stats?.role_breakdown?.admins || 0
    return (
        <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 mb-7">
                {cards.map((c, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl p-5 cursor-default group transition-all duration-500 hover:-translate-y-1.5"
                        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 40px ${c.shadow}25, 0 1px 3px rgba(0,0,0,0.04)` }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 opacity-[0.04]" style={{ background: c.gradient }} />
                        <div className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-4 text-white"
                            style={{ background: c.gradient, boxShadow: `0 8px 20px ${c.shadow}` }}>
                            {c.icon}
                        </div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[1px] mb-1.5" style={{ color: '#94a3b8' }}>{c.l}</p>
                        <div className="flex items-end gap-2.5">
                            <p className="text-[26px] font-black text-slate-900 leading-none tracking-tight">{c.v}</p>
                            <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5" style={{ background: '#ecfdf5', color: '#059669' }}>
                                {I.up} {c.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Premium Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-7">
                <GlassPanel className="lg:col-span-3" title="Revenue Trends" icon={I.bar} accent="#6366f1">
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v > 999 ? (v/1000).toFixed(0)+'k' : v}`} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassPanel>
                <GlassPanel className="lg:col-span-2" title="User Distribution" icon={I.users} accent="#8b5cf6">
                    <div className="flex items-center justify-center" style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={[{name:'Students',value:st,color:'#6366f1'},{name:'Mentors',value:mt||1,color:'#0ea5e9'},{name:'Admins',value:ad||1,color:'#f59e0b'}]}
                                    cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" animationBegin={0} animationDuration={1200}
                                    stroke="none">
                                    {[{c:'#6366f1'},{c:'#0ea5e9'},{c:'#f59e0b'}].map((e,i) => <Cell key={i} fill={e.c} />)}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{fontSize:12,fontWeight:600,color:'#475569'}}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 mt-2 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                        <MiniStat l="Total" v={tu} c="#0f172a" />
                        <MiniStat l="Completed" v={stats?.revenue?.completed || 0} c="#059669" />
                        <MiniStat l="Pending" v={stats?.revenue?.pending || 0} c="#d97706" />
                    </div>
                </GlassPanel>
            </div>

            {/* ── Monthly Enrollment Chart ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
                <GlassPanel title="Monthly Enrollments" icon={I.users} accent="#0ea5e9">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={enrollData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0ea5e9" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="enrollments" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassPanel>
                <GlassPanel title="Platform Growth" icon={I.activity} accent="#10b981">
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2.5} fill="url(#growthGrad)" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassPanel>
            </div>

            {/* ── Status Panels ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
                <StatusPanel title="Payment Status" icon={I.card} accent="#10b981" items={[
                    { l: 'Completed', n: stats?.revenue?.completed || 0, c: '#10b981', bg: '#ecfdf5' },
                    { l: 'Pending', n: stats?.revenue?.pending || 0, c: '#f59e0b', bg: '#fffbeb' },
                    { l: 'Failed', n: stats?.revenue?.failed || 0, c: '#ef4444', bg: '#fef2f2' },
                ]} />
                <StatusPanel title="Session Status" icon={I.video} accent="#8b5cf6" items={[
                    { l: 'Available', n: stats?.sessions?.available || 0, c: '#22c55e', bg: '#f0fdf4' },
                    { l: 'Booked', n: stats?.sessions?.booked || 0, c: '#f59e0b', bg: '#fffbeb' },
                    { l: 'Completed', n: stats?.sessions?.completed || 0, c: '#64748b', bg: '#f8fafc' },
                ]} />
                <StatusPanel title="Forum Activity" icon={I.chat} accent="#ec4899" items={[
                    { l: 'Threads', n: stats?.forum?.threads || 0, c: '#6366f1', bg: '#eef2ff' },
                    { l: 'Replies', n: stats?.forum?.replies || 0, c: '#0ea5e9', bg: '#e0f2fe' },
                    { l: 'Interactions', n: stats?.total_interactions || 0, c: '#f59e0b', bg: '#fffbeb' },
                ]} />
            </div>

            {/* ── Recent Users ── */}
            {stats?.recent_users?.length > 0 && (
                <GlassPanel title="Recent Registrations" icon={I.users} accent="#6366f1">
                    <Table heads={['ID','Name','Email','Role','Joined']}>
                        {stats.recent_users.map(u => (
                            <tr key={u.user_id} className="group hover:bg-indigo-50/30 transition-all duration-200">
                                <Td><span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">#{u.user_id}</span></Td>
                                <Td bold>{u.username}</Td>
                                <Td>{u.email}</Td>
                                <Td><RoleBadge role={u.role} /></Td>
                                <Td muted>{u.created_date ? new Date(u.created_date).toLocaleDateString() : '—'}</Td>
                            </tr>
                        ))}
                    </Table>
                </GlassPanel>
            )}
        </>
    )
}

/* ═══════════════════════════════════════════════════════
   USERS TAB
   ═══════════════════════════════════════════════════════ */
const UsersTab = () => {
    const [page, setPage] = useState(1), [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const timerRef = useRef(null)
    useEffect(() => { timerRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400); return () => clearTimeout(timerRef.current) }, [search])
    const { data, isLoading } = useGetAdminUsersQuery({ page, limit: 30, search: debouncedSearch })
    const [updateRole] = useUpdateUserRoleMutation()
    const [deleteUser] = useDeleteUserMutation()
    const users = data?.data || [], pag = data?.pagination || {}
    if (isLoading) return <Skeleton />
    return (
        <GlassPanel>
            <Toolbar count={`${pag.total || 0} users`} search={search} setSearch={setSearch} placeholder="Search users by name or email..." />
            <Table heads={['ID','Name','Email','Skill Level','Role','Actions']}>
                {users.map(u => (
                    <tr key={u.user_id} className="group hover:bg-indigo-50/30 transition-all duration-200">
                        <Td><span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">#{u.user_id}</span></Td>
                        <Td bold>{u.username}</Td>
                        <Td>{u.email}</Td>
                        <Td><span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1.5 rounded-lg border border-indigo-100">{u.skill_level || 'N/A'}</span></Td>
                        <Td>
                            <select value={u.role || 'student'} onChange={e => { if (window.confirm(`Change role to "${e.target.value}"?`)) updateRole({ id: u.user_id, role: e.target.value }) }}
                                className="px-3 py-2 rounded-xl border-2 border-slate-200 text-[11px] font-bold bg-white text-slate-700 cursor-pointer focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all appearance-none pr-7"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                                <option value="student">Student</option>
                                <option value="mentor">Mentor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </Td>
                        <Td><DelBtn onClick={() => { if (window.confirm(`Delete "${u.username}"?`)) deleteUser(u.user_id) }} /></Td>
                    </tr>
                ))}
            </Table>
            {users.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">No users found{search ? ` for "${search}"` : ''}</p>}
            <Pag page={page} total={pag.pages || 1} onChange={setPage} />
        </GlassPanel>
    )
}

/* ═══════════════════════ COURSES ═══════════════════════ */
const CoursesTab = () => {
    const [page, setPage] = useState(1), [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const timerRef = useRef(null)
    useEffect(() => { timerRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400); return () => clearTimeout(timerRef.current) }, [search])
    const { data, isLoading } = useGetAdminCoursesQuery({ page, limit: 30, search: debouncedSearch })
    const [deleteCourse] = useDeleteAdminCourseMutation()
    const courses = data?.data || [], pag = data?.pagination || {}
    if (isLoading) return <Skeleton />
    return (
        <GlassPanel>
            <Toolbar count={`${pag.total || 0} courses`} search={search} setSearch={setSearch} placeholder="Search courses by title or category..." />
            <Table heads={['ID','Title','Category','Level','Instructor','Actions']}>
                {courses.map(c => (
                    <tr key={c.course_id} className="group hover:bg-indigo-50/30 transition-all duration-200">
                        <Td><span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">#{c.course_id}</span></Td>
                        <Td bold truncate>{c.title}</Td>
                        <Td><span className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border" style={{ ...gradientBorder('#0ea5e9'), color: '#0284c7' }}>{c.category || 'N/A'}</span></Td>
                        <Td><span className="text-[11px] font-semibold text-slate-500">{c.level || 'N/A'}</span></Td>
                        <Td>{c.instructor || 'N/A'}</Td>
                        <Td><DelBtn onClick={() => { if (window.confirm(`Delete "${c.title}"?`)) deleteCourse(c.course_id) }} /></Td>
                    </tr>
                ))}
            </Table>
            {courses.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">No courses found{search ? ` for "${search}"` : ''}</p>}
            <Pag page={page} total={pag.pages || 1} onChange={setPage} />
        </GlassPanel>
    )
}

/* ═══════════════════════ PAYMENTS ═══════════════════════ */
const PaymentsTab = () => {
    const [page, setPage] = useState(1)
    const { data, isLoading } = useGetAdminPaymentsQuery({ page, limit: 30 })
    const payments = data?.data || [], rev = data?.revenue || {}, pag = data?.pagination || {}
    if (isLoading) return <Skeleton />
    const revCards = [
        { l: 'Total Revenue', v: `$${(rev.total_revenue || 0).toLocaleString()}`, g: 'linear-gradient(135deg, #10b981, #34d399)', s: 'rgba(16,185,129,0.25)', icon: I.dollar },
        { l: 'Completed', v: rev.completed || 0, g: 'linear-gradient(135deg, #22c55e, #4ade80)', s: 'rgba(34,197,94,0.25)', icon: I.award },
        { l: 'Pending', v: rev.pending || 0, g: 'linear-gradient(135deg, #f59e0b, #fbbf24)', s: 'rgba(245,158,11,0.25)', icon: I.activity },
        { l: 'Failed', v: rev.failed || 0, g: 'linear-gradient(135deg, #ef4444, #f87171)', s: 'rgba(239,68,68,0.25)', icon: I.grid },
    ]

    // Build chart data from actual payments
    const statusData = [
        { name: 'Completed', value: rev.completed || 0, color: '#10b981' },
        { name: 'Pending', value: rev.pending || 0, color: '#f59e0b' },
        { name: 'Failed', value: rev.failed || 0, color: '#ef4444' },
    ].filter(d => d.value > 0)
    if (statusData.length === 0) statusData.push({ name: 'No Data', value: 1, color: '#e2e8f0' })

    // Provider breakdown
    const providerMap = {}
    payments.forEach(p => {
        const prov = (p.provider || 'other').charAt(0).toUpperCase() + (p.provider || 'other').slice(1)
        if (!providerMap[prov]) providerMap[prov] = { name: prov, amount: 0, count: 0 }
        providerMap[prov].amount += Number(p.amount) || 0
        providerMap[prov].count += 1
    })
    const providerData = Object.values(providerMap)

    // Monthly revenue from actual payments
    const monthlyMap = {}
    payments.forEach(p => {
        if (p.created_date) {
            const d = new Date(p.created_date)
            const key = d.toLocaleString('en-US', { month: 'short' })
            if (!monthlyMap[key]) monthlyMap[key] = { month: key, revenue: 0, count: 0 }
            monthlyMap[key].revenue += Number(p.amount) || 0
            monthlyMap[key].count += 1
        }
    })
    const monthlyData = Object.values(monthlyMap)

    return (
        <>
            {/* Revenue Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
                {revCards.map((c, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl p-6 text-white cursor-default hover:-translate-y-1 transition-all duration-500"
                        style={{ background: c.g, boxShadow: `0 12px 28px ${c.s}` }}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 bg-white/10" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full translate-y-6 -translate-x-6 bg-white/5" />
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3 backdrop-blur-sm">{c.icon}</div>
                            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/70 mb-1">{c.l}</p>
                            <p className="text-3xl font-black tracking-tight">{c.v}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
                {/* Payment Status Donut */}
                <GlassPanel title="Payment Status" icon={I.card} accent="#10b981">
                    <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none" animationDuration={1200}>
                                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{fontSize:11,fontWeight:600,color:'#475569'}}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassPanel>

                {/* Provider Breakdown Bar Chart */}
                <GlassPanel title="Revenue by Provider" icon={I.dollar} accent="#6366f1">
                    <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={providerData.length > 0 ? providerData : [{name:'No Data',amount:0}]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="provGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="amount" fill="url(#provGrad)" radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassPanel>

                {/* Monthly Revenue Trend */}
                <GlassPanel title="Monthly Revenue" icon={I.bar} accent="#0ea5e9">
                    <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData.length > 0 ? monthlyData : [{month:'N/A',revenue:0}]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="payRevGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#payRevGrad)" dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#0ea5e9', strokeWidth: 3, stroke: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassPanel>
            </div>

            {/* Transaction Table */}
            <GlassPanel title="All Transactions" icon={I.card} accent="#6366f1">
                <Table heads={['ID','User','Course','Provider','Amount','Status','Date']}>
                    {payments.map(p => (
                        <tr key={p.payment_id} className="group hover:bg-indigo-50/30 transition-all duration-200">
                            <Td><span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">#{p.payment_id}</span></Td>
                            <Td bold>{p.username || `User #${p.user_id}`}</Td>
                            <Td truncate>{p.course_title || `Course #${p.course_id}`}</Td>
                            <Td>
                                <span className="text-[9px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider"
                                    style={p.provider === 'stripe' ? { background: 'linear-gradient(135deg, #635bff15, #635bff08)', color: '#635bff', border: '1px solid #635bff20' } : { background: 'linear-gradient(135deg, #5C2D9115, #5C2D9108)', color: '#5C2D91', border: '1px solid #5C2D9120' }}>
                                    {p.provider || 'N/A'}
                                </span>
                            </Td>
                            <Td><span className="font-extrabold text-slate-900 text-[15px]">${p.amount || 0}</span></Td>
                            <Td><StatusBadge s={p.status} /></Td>
                            <Td muted>{p.created_date ? new Date(p.created_date).toLocaleDateString() : '—'}</Td>
                        </tr>
                    ))}
                </Table>
                <Pag page={page} total={pag.pages || 1} onChange={setPage} />
            </GlassPanel>
        </>
    )
}

/* ═══════════════════════ QUIZZES ═══════════════════════ */
const QuizzesTab = () => {
    const { data: quizzes = [], isLoading } = useGetAdminQuizzesQuery()
    const [createQuiz] = useCreateAdminQuizMutation()
    const [updateQuiz] = useUpdateAdminQuizMutation()
    const [deleteQuiz] = useDeleteAdminQuizMutation()
    const [addQuestion] = useAddAdminQuestionMutation()
    const [deleteQuestion] = useDeleteAdminQuestionMutation()
    const [showCreate, setShowCreate] = useState(false)
    const [editId, setEditId] = useState(null)
    const [detailId, setDetailId] = useState(null)

    if (isLoading) return <Skeleton />
    return (
        <>
            <GlassPanel>
                <div className="flex items-center justify-between mb-6">
                    <span className="text-[15px] font-extrabold text-slate-900">Total: {quizzes.length} quizzes</span>
                    <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Create Quiz
                    </button>
                </div>
                <Table heads={['ID','Title','Course','Pass Score','Questions','Attempts','Actions']}>
                    {quizzes.map(q => (
                        <tr key={q.quiz_id} className="group hover:bg-indigo-50/30 transition-all duration-200">
                            <Td><span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">#{q.quiz_id}</span></Td>
                            <Td bold>
                                <button onClick={() => setDetailId(detailId === q.quiz_id ? null : q.quiz_id)} className="text-left hover:text-indigo-600 transition-colors">{q.title}</button>
                            </Td>
                            <Td truncate>{q.course_title || 'N/A'}</Td>
                            <Td><span className="text-[12px] font-bold text-slate-700">{q.passing_score}%</span></Td>
                            <Td><span className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5' }}>{q.question_count} Q</span></Td>
                            <Td><span className="text-[12px] font-bold text-slate-600">{q.attempt_count || 0}</span></Td>
                            <Td>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditId(q.quiz_id)} className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-all" title="Edit">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <DelBtn onClick={() => { if (window.confirm(`Delete quiz "${q.title}"? This will also delete all questions and attempts.`)) deleteQuiz(q.quiz_id) }} />
                                </div>
                            </Td>
                        </tr>
                    ))}
                </Table>
                {quizzes.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">No quizzes yet. Create your first quiz!</p>}
            </GlassPanel>

            {/* Quiz Detail Expansion */}
            {detailId && <QuizDetailPanel quizId={detailId} onClose={() => setDetailId(null)} />}

            {/* Create Quiz Modal */}
            {showCreate && <QuizFormModal onClose={() => setShowCreate(false)} onSubmit={async (data) => { await createQuiz(data); setShowCreate(false) }} />}

            {/* Edit Quiz Modal */}
            {editId && <QuizEditModal quizId={editId} onClose={() => setEditId(null)} onSave={updateQuiz} onAddQuestion={addQuestion} onDeleteQuestion={deleteQuestion} />}
        </>
    )
}

/* ── Quiz Detail Panel (expandable) ── */
const QuizDetailPanel = ({ quizId, onClose }) => {
    const { data: quiz, isLoading } = useGetAdminQuizDetailsQuery(quizId)
    if (isLoading) return <div className="mt-4 p-6 rounded-2xl bg-white border border-slate-100 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/3 mb-3"/><div className="h-3 bg-slate-50 rounded w-1/2"/></div>
    if (!quiz) return null
    return (
        <div className="mt-4 rounded-2xl p-6 transition-all" style={{ background: 'white', border: '1px solid rgba(99,102,241,0.1)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)' }}>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h4 className="text-[16px] font-extrabold text-slate-900">{quiz.title}</h4>
                    <p className="text-[12px] text-slate-400 mt-0.5">{quiz.description || 'No description'} • Pass: {quiz.passing_score}% • Time: {quiz.time_limit_minutes}min • Course: {quiz.course_title || 'N/A'}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div className="space-y-3">
                {quiz.questions?.length > 0 ? quiz.questions.map((q, idx) => (
                    <div key={q.question_id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[13px] font-bold text-slate-800 mb-2"><span className="text-indigo-500 mr-2">Q{idx + 1}.</span>{q.question_text}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {['A','B','C','D'].map(opt => (
                                <div key={opt} className={`text-[11px] px-3 py-2 rounded-lg font-medium ${q.correct_answer === opt ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' : 'bg-white text-slate-500 border border-slate-100'}`}>
                                    <span className="font-bold mr-1.5">{opt}.</span>{q[`option_${opt.toLowerCase()}`]}
                                </div>
                            ))}
                        </div>
                    </div>
                )) : <p className="text-center text-slate-400 text-sm py-4">No questions added yet</p>}
            </div>
        </div>
    )
}

/* ── Create Quiz Modal ── */
const QuizFormModal = ({ onClose, onSubmit }) => {
    const [form, setForm] = useState({ course_id: '', title: '', description: '', passing_score: 70, time_limit: 30 })
    const [questions, setQuestions] = useState([{ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' }])
    const [saving, setSaving] = useState(false)
    const addQ = () => setQuestions([...questions, { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' }])
    const removeQ = (i) => setQuestions(questions.filter((_, idx) => idx !== i))
    const updateQ = (i, field, val) => { const nq = [...questions]; nq[i] = { ...nq[i], [field]: val }; setQuestions(nq) }
    const handleSubmit = async () => {
        if (!form.course_id || !form.title) return alert('Course ID and title are required')
        if (questions.some(q => !q.question_text)) return alert('All questions need text')
        setSaving(true)
        await onSubmit({ ...form, course_id: parseInt(form.course_id), passing_score: parseInt(form.passing_score), time_limit: parseInt(form.time_limit), questions })
        setSaving(false)
    }
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-7" onClick={e => e.stopPropagation()}
                style={{ background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.15)', scrollbarWidth: 'thin' }}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[18px] font-black text-slate-900">Create New Quiz</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>
                {/* Quiz Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <ModalInput label="Course ID" value={form.course_id} onChange={v => setForm({...form, course_id: v})} placeholder="e.g. 1" />
                    <ModalInput label="Title" value={form.title} onChange={v => setForm({...form, title: v})} placeholder="Quiz title" />
                    <ModalInput label="Description" value={form.description} onChange={v => setForm({...form, description: v})} placeholder="Optional description" />
                    <div className="grid grid-cols-2 gap-3">
                        <ModalInput label="Pass Score %" value={form.passing_score} onChange={v => setForm({...form, passing_score: v})} type="number" />
                        <ModalInput label="Time (min)" value={form.time_limit} onChange={v => setForm({...form, time_limit: v})} type="number" />
                    </div>
                </div>
                {/* Questions */}
                <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-[14px] font-extrabold text-slate-800">Questions ({questions.length})</h4>
                    <button onClick={addQ} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Question
                    </button>
                </div>
                <div className="space-y-4 mb-6">
                    {questions.map((q, i) => (
                        <div key={i} className="p-4 rounded-xl border-2 border-slate-100 relative">
                            {questions.length > 1 && <button onClick={() => removeQ(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
                            <p className="text-[11px] font-bold text-indigo-500 mb-2">Question {i + 1}</p>
                            <input value={q.question_text} onChange={e => updateQ(i, 'question_text', e.target.value)} placeholder="Question text..." className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-100 text-[13px] text-slate-900 mb-3 focus:outline-none focus:border-indigo-300" />
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {['A','B','C','D'].map(opt => (
                                    <input key={opt} value={q[`option_${opt.toLowerCase()}`]} onChange={e => updateQ(i, `option_${opt.toLowerCase()}`, e.target.value)}
                                        placeholder={`Option ${opt}`} className="px-3 py-2 rounded-lg border-2 border-slate-100 text-[12px] text-slate-900 focus:outline-none focus:border-indigo-300" />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500">Correct:</span>
                                {['A','B','C','D'].map(opt => (
                                    <button key={opt} onClick={() => updateQ(i, 'correct_answer', opt)}
                                        className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${q.correct_answer === opt ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{opt}</button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[12px] font-bold border-2 border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-[1.03] disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                        {saving ? 'Creating...' : 'Create Quiz'}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ── Edit Quiz Modal ── */
const QuizEditModal = ({ quizId, onClose, onSave, onAddQuestion, onDeleteQuestion }) => {
    const { data: quiz, isLoading } = useGetAdminQuizDetailsQuery(quizId)
    const [form, setForm] = useState(null)
    const [newQ, setNewQ] = useState(null)
    const [saving, setSaving] = useState(false)
    useEffect(() => { if (quiz) setForm({ title: quiz.title, description: quiz.description || '', passing_score: quiz.passing_score, time_limit: quiz.time_limit_minutes, course_id: quiz.course_id }) }, [quiz])
    if (isLoading || !form) return null
    const handleSave = async () => { setSaving(true); await onSave({ id: quizId, ...form, passing_score: parseInt(form.passing_score), time_limit: parseInt(form.time_limit) }); setSaving(false); onClose() }
    const handleAddQ = async () => {
        if (!newQ?.question_text) return alert('Question text required')
        await onAddQuestion({ quizId, ...newQ })
        setNewQ(null)
    }
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-7" onClick={e => e.stopPropagation()}
                style={{ background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.15)', scrollbarWidth: 'thin' }}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[18px] font-black text-slate-900">Edit Quiz #{quizId}</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>
                {/* Quiz Fields */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <ModalInput label="Title" value={form.title} onChange={v => setForm({...form, title: v})} />
                    <ModalInput label="Description" value={form.description} onChange={v => setForm({...form, description: v})} />
                    <ModalInput label="Pass Score %" value={form.passing_score} onChange={v => setForm({...form, passing_score: v})} type="number" />
                    <ModalInput label="Time Limit (min)" value={form.time_limit} onChange={v => setForm({...form, time_limit: v})} type="number" />
                </div>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl text-[12px] font-bold text-white mb-6 transition-all hover:scale-[1.03] disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {/* Existing Questions */}
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[14px] font-extrabold text-slate-800">Questions ({quiz.questions?.length || 0})</h4>
                    <button onClick={() => setNewQ({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' })}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Question
                    </button>
                </div>
                <div className="space-y-3 mb-4">
                    {quiz.questions?.map((q, idx) => (
                        <div key={q.question_id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-[13px] font-bold text-slate-800"><span className="text-indigo-500 mr-2">Q{idx + 1}.</span>{q.question_text}</p>
                                <div className="flex gap-3 mt-2 flex-wrap">
                                    {['A','B','C','D'].map(opt => (
                                        <span key={opt} className={`text-[10px] px-2 py-1 rounded ${q.correct_answer === opt ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-white text-slate-400'}`}>
                                            {opt}: {q[`option_${opt.toLowerCase()}`]}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => { if (window.confirm('Delete this question?')) onDeleteQuestion(q.question_id) }}
                                className="ml-3 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                            </button>
                        </div>
                    ))}
                </div>
                {/* Add Question Inline */}
                {newQ && (
                    <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/30 mb-4">
                        <p className="text-[11px] font-bold text-indigo-500 mb-2">New Question</p>
                        <input value={newQ.question_text} onChange={e => setNewQ({...newQ, question_text: e.target.value})} placeholder="Question text..." className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-100 text-[13px] text-slate-900 mb-3 focus:outline-none focus:border-indigo-300 bg-white" />
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {['A','B','C','D'].map(opt => (
                                <input key={opt} value={newQ[`option_${opt.toLowerCase()}`]} onChange={e => setNewQ({...newQ, [`option_${opt.toLowerCase()}`]: e.target.value})}
                                    placeholder={`Option ${opt}`} className="px-3 py-2 rounded-lg border-2 border-slate-100 text-[12px] text-slate-900 bg-white focus:outline-none focus:border-indigo-300" />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[11px] font-bold text-slate-500">Correct:</span>
                            {['A','B','C','D'].map(opt => (
                                <button key={opt} onClick={() => setNewQ({...newQ, correct_answer: opt})}
                                    className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${newQ.correct_answer === opt ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>{opt}</button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAddQ} className="px-4 py-2 rounded-lg text-[11px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-all">Add</button>
                            <button onClick={() => setNewQ(null)} className="px-4 py-2 rounded-lg text-[11px] font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const ModalInput = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label className="block text-[10px] font-bold uppercase tracking-[1px] text-slate-400 mb-1.5">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-[13px] font-medium text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
    </div>
)

/* ═══════════════════════ FORUM ═══════════════════════ */
const ForumTab = () => {
    const { data: threads = [], isLoading } = useGetAdminThreadsQuery()
    const { data: forumStats } = useGetAdminForumStatsQuery()
    const [deleteThread] = useDeleteAdminThreadMutation()
    const [expandedThread, setExpandedThread] = useState(null)
    if (isLoading) return <Skeleton />
    return (
        <>
            {/* Forum Stats Summary */}
            {forumStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatMini label="Total Threads" value={forumStats.total_threads} gradient="linear-gradient(135deg, #ec4899, #f472b6)" />
                    <StatMini label="Total Replies" value={forumStats.total_replies} gradient="linear-gradient(135deg, #6366f1, #818cf8)" />
                    <StatMini label="Total Posts" value={forumStats.total_threads + forumStats.total_replies} gradient="linear-gradient(135deg, #0ea5e9, #38bdf8)" />
                    <StatMini label="Active Users" value={forumStats.most_active?.length || 0} gradient="linear-gradient(135deg, #10b981, #34d399)" />
                </div>
            )}
            <GlassPanel title={`${threads.length} Threads`} icon={I.chat} accent="#ec4899">
                <Table heads={['ID','Title','Author','Content','Votes','Replies','Actions']}>
                    {threads.map(t => (
                        <tr key={t.THREAD_ID} className="group hover:bg-indigo-50/30 transition-all duration-200">
                            <Td><span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">#{t.THREAD_ID}</span></Td>
                            <Td bold truncate>
                                <button onClick={() => setExpandedThread(expandedThread === t.THREAD_ID ? null : t.THREAD_ID)} className="text-left hover:text-indigo-600 transition-colors">{t.TITLE}</button>
                            </Td>
                            <Td>{t.AUTHOR}</Td>
                            <Td><span className="text-[11px] text-slate-400 max-w-[180px] block truncate">{typeof t.CONTENT === 'string' ? t.CONTENT.substring(0, 60) : '...'}...</span></Td>
                            <Td>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mr-1">↑{t.UPVOTES || 0}</span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">↓{t.DOWNVOTES || 0}</span>
                            </Td>
                            <Td><span className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg" style={{ background: '#eef2ff', color: '#4f46e5', border: '1px solid #e0e7ff' }}>{t.REPLY_COUNT || 0}</span></Td>
                            <Td>
                                <div className="flex gap-2">
                                    <button onClick={() => setExpandedThread(expandedThread === t.THREAD_ID ? null : t.THREAD_ID)} className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-all" title="View details">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    </button>
                                    <DelBtn onClick={() => { if (window.confirm('Delete this thread and all replies?')) deleteThread(t.THREAD_ID) }} />
                                </div>
                            </Td>
                        </tr>
                    ))}
                </Table>
                {threads.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">No forum threads yet</p>}
            </GlassPanel>

            {/* Thread Detail Expansion */}
            {expandedThread && <ThreadDetailPanel threadId={expandedThread} onClose={() => setExpandedThread(null)} />}

            {/* Most Active Users */}
            {forumStats?.most_active?.length > 0 && (
                <GlassPanel title="Most Active Posters" icon={I.users} accent="#8b5cf6" className="mt-5">
                    <div className="space-y-2">
                        {forumStats.most_active.map((u, i) => (
                            <div key={u.author} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ec4899'][i] || '#64748b' }}>{i + 1}</span>
                                    <span className="text-[13px] font-bold text-slate-700">{u.author}</span>
                                </div>
                                <span className="text-[12px] font-extrabold text-slate-900">{u.count} posts</span>
                            </div>
                        ))}
                    </div>
                </GlassPanel>
            )}
        </>
    )
}

/* ── Thread Detail Panel ── */
const ThreadDetailPanel = ({ threadId, onClose }) => {
    const { data: thread, isLoading } = useGetAdminThreadDetailsQuery(threadId)
    const [deleteReply] = useDeleteAdminReplyMutation()
    if (isLoading) return <div className="mt-4 p-6 rounded-2xl bg-white border border-slate-100 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/3 mb-3"/><div className="h-3 bg-slate-50 rounded w-1/2"/></div>
    if (!thread) return null
    return (
        <div className="mt-4 rounded-2xl p-6" style={{ background: 'white', border: '1px solid rgba(236,72,153,0.1)', boxShadow: '0 4px 20px rgba(236,72,153,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-[16px] font-extrabold text-slate-900">{thread.TITLE}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">by {thread.AUTHOR} • {thread.CREATED_DATE ? new Date(thread.CREATED_DATE).toLocaleDateString() : ''} • ↑{thread.UPVOTES || 0} ↓{thread.DOWNVOTES || 0}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            {/* Thread Content */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{typeof thread.CONTENT === 'string' ? thread.CONTENT : 'No content'}</p>
            </div>
            {/* Replies */}
            <h5 className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider mb-3">Replies ({thread.replies?.length || 0})</h5>
            <div className="space-y-2">
                {thread.replies?.length > 0 ? thread.replies.map(r => (
                    <div key={r.REPLY_ID} className="flex items-start justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-all">
                        <div className="flex-1">
                            <p className="text-[11px] font-bold text-indigo-600 mb-1">{r.AUTHOR} <span className="text-slate-300 font-normal">• {r.CREATED_DATE ? new Date(r.CREATED_DATE).toLocaleDateString() : ''}</span></p>
                            <p className="text-[12px] text-slate-600 whitespace-pre-wrap">{typeof r.CONTENT === 'string' ? r.CONTENT : ''}</p>
                        </div>
                        <button onClick={() => { if (window.confirm('Delete this reply?')) deleteReply(r.REPLY_ID) }}
                            className="ml-3 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                        </button>
                    </div>
                )) : <p className="text-center text-slate-400 text-sm py-3">No replies yet</p>}
            </div>
        </div>
    )
}

const StatMini = ({ label, value, gradient }) => (
    <div className="rounded-2xl p-5 text-white cursor-default hover:-translate-y-1 transition-all duration-500" style={{ background: gradient, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-white/70 mb-1">{label}</p>
        <p className="text-2xl font-black">{value}</p>
    </div>
)

/* ═══════════════════════ SESSIONS ═══════════════════════ */
const SessionsTab = () => {
    const { data: sessions = [], isLoading } = useGetAdminSessionsQuery()
    const [deleteSession] = useDeleteAdminSessionMutation()
    if (isLoading) return <Skeleton />
    return (
        <GlassPanel title={`${sessions.length} Sessions`} icon={I.video} accent="#8b5cf6">
            <Table heads={['ID','Title','Mentor','Student','Schedule','Status','Actions']}>
                {sessions.map(s => (
                    <tr key={s.session_id} className="group hover:bg-indigo-50/30 transition-all duration-200">
                        <Td><span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">#{s.session_id}</span></Td>
                        <Td bold>{s.title}</Td>
                        <Td>{s.mentor_name}</Td>
                        <Td>{s.student_name || <span className="text-slate-300 italic">Unbooked</span>}</Td>
                        <Td muted>{s.session_date} {s.start_time}</Td>
                        <Td><SessionBadge s={s.status} /></Td>
                        <Td>{s.status !== 'completed' && <DelBtn onClick={() => { if (window.confirm('Delete?')) deleteSession(s.session_id) }} />}</Td>
                    </tr>
                ))}
            </Table>
        </GlassPanel>
    )
}

/* ═══════════════════════════════════════════════════════
   SHARED PREMIUM COMPONENTS
   ═══════════════════════════════════════════════════════ */
const GlassPanel = ({ children, title, icon, accent, className = '' }) => (
    <div className={`rounded-2xl p-7 transition-all duration-300 ${className}`}
        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}>
        {title && (
            <h3 className="text-[14px] font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent ? `${accent}10` : '#f1f5f9', color: accent || '#64748b' }}>{icon}</div>
                {title}
            </h3>
        )}
        {children}
    </div>
)

const Table = ({ heads, children }) => (
    <div className="overflow-x-auto -mx-1">
        <table className="w-full text-[13px]">
            <thead>
                <tr>
                    {heads.map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-[9px] font-extrabold uppercase tracking-[1.5px]"
                            style={{ color: '#94a3b8', borderBottom: '2px solid #f1f5f9' }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">{children}</tbody>
        </table>
    </div>
)

const Td = ({ children, bold, truncate, muted }) => (
    <td className={`px-4 py-4 ${bold ? 'font-bold text-slate-900' : 'text-slate-500'} ${truncate ? 'max-w-[240px] truncate' : ''} ${muted ? 'text-[11px] text-slate-400 font-medium' : ''}`}>{children}</td>
)

const Toolbar = ({ count, search, setSearch, placeholder }) => (
    <div className="flex items-center justify-between mb-6">
        <div>
            <span className="text-[15px] font-extrabold text-slate-900">Total: {count}</span>
        </div>
        <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300">{I.search}</span>
            <input placeholder={placeholder} value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-xl text-[13px] text-slate-900 w-80 transition-all duration-300 placeholder:text-slate-300 focus:outline-none"
                style={{ border: '2px solid #e2e8f0', background: '#fafbfc' }}
                onFocus={e => { e.target.style.borderColor = '#818cf8'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.08)' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#fafbfc'; e.target.style.boxShadow = 'none' }} />
        </div>
    </div>
)

const RoleBadge = ({ role }) => {
    const styles = { admin: { bg: 'linear-gradient(135deg, #fef3c715, #fef3c740)', color: '#b45309', border: '#fde68a' }, mentor: { bg: 'linear-gradient(135deg, #e0f2fe15, #e0f2fe40)', color: '#0369a1', border: '#bae6fd' }, student: { bg: 'linear-gradient(135deg, #f1f5f915, #f1f5f940)', color: '#475569', border: '#e2e8f0' } }
    const s = styles[role] || styles.student
    return <span className="text-[9px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{role || 'student'}</span>
}

const StatusBadge = ({ s }) => {
    const styles = { completed: { c: '#059669', bg: '#ecfdf5', bc: '#a7f3d0', dot: '#10b981' }, pending: { c: '#d97706', bg: '#fffbeb', bc: '#fde68a', dot: '#f59e0b' }, failed: { c: '#dc2626', bg: '#fef2f2', bc: '#fecaca', dot: '#ef4444' } }
    const st = styles[s] || styles.pending
    return <span className="inline-flex items-center gap-2 text-[9px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider" style={{ background: st.bg, color: st.c, border: `1px solid ${st.bc}` }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot, boxShadow: `0 0 6px ${st.dot}50` }} />{s || 'unknown'}
    </span>
}

const SessionBadge = ({ s }) => {
    const styles = { available: { c: '#16a34a', bg: '#f0fdf4', bc: '#bbf7d0' }, booked: { c: '#d97706', bg: '#fffbeb', bc: '#fde68a' }, completed: { c: '#475569', bg: '#f8fafc', bc: '#e2e8f0' } }
    const st = styles[s] || styles.completed
    return <span className="text-[9px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider" style={{ background: st.bg, color: st.c, border: `1px solid ${st.bc}` }}>{s}</span>
}

const DelBtn = ({ onClick }) => (
    <button onClick={onClick} className="p-2.5 rounded-xl transition-all duration-300 group/del hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #fef2f2, #fff5f5)', border: '1px solid #fecaca', color: '#f87171' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #fecaca, #fecaca80)'; e.currentTarget.style.color = '#dc2626' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #fef2f2, #fff5f5)'; e.currentTarget.style.color = '#f87171' }}>
        {I.trash}
    </button>
)

const DistBar = ({ label, count, total, gradient }) => {
    const pct = Math.round((count / total) * 100) || 0
    return (
        <div>
            <div className="flex justify-between mb-2">
                <span className="text-[13px] font-bold text-slate-700">{label}</span>
                <span className="text-[13px] font-extrabold text-slate-900">{count} <span className="text-slate-300 font-medium text-[11px]">({pct}%)</span></span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, background: gradient, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            </div>
        </div>
    )
}

const MiniStat = ({ l, v, c }) => (
    <div className="flex-1 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[1.5px] mb-1" style={{ color: '#94a3b8' }}>{l}</p>
        <p className="text-xl font-black" style={{ color: c }}>{v}</p>
    </div>
)

const StatusPanel = ({ title, icon, accent, items }) => (
    <GlassPanel title={title} icon={icon} accent={accent}>
        <div className="space-y-2.5">
            {items.map(item => (
                <div key={item.l} className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 cursor-default hover:scale-[1.01]"
                    style={{ background: item.bg, border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.c}20`; e.currentTarget.style.boxShadow = `0 4px 12px ${item.c}10` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.c, boxShadow: `0 0 8px ${item.c}40` }} />
                        <span className="text-[13px] font-semibold text-slate-600">{item.l}</span>
                    </div>
                    <span className="text-lg font-black text-slate-900">{item.n}</span>
                </div>
            ))}
        </div>
    </GlassPanel>
)

const Pag = ({ page, total, onChange }) => {
    if (total <= 1) return null
    const ps = []
    for (let i = Math.max(1, page - 2); i <= Math.min(total, page + 2); i++) ps.push(i)
    return (
        <div className="flex items-center justify-center gap-2 mt-7 pt-6" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <button disabled={page <= 1} onClick={() => onChange(page - 1)}
                className="px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ background: 'white', border: '2px solid #e2e8f0', color: '#64748b' }}
                onMouseEnter={e => { if (page > 1) { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#6366f1' } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}>
                ← Prev
            </button>
            {ps.map(p => (
                <button key={p} onClick={() => onChange(p)}
                    className="w-10 h-10 rounded-xl text-[12px] font-bold transition-all duration-300"
                    style={p === page ? { background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white', boxShadow: '0 8px 20px rgba(99,102,241,0.3)', border: 'none' }
                        : { background: 'white', border: '2px solid #e2e8f0', color: '#64748b' }}
                    onMouseEnter={e => { if (p !== page) { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.color = '#6366f1' } }}
                    onMouseLeave={e => { if (p !== page) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' } }}>
                    {p}
                </button>
            ))}
            <button disabled={page >= total} onClick={() => onChange(page + 1)}
                className="px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ background: 'white', border: '2px solid #e2e8f0', color: '#64748b' }}
                onMouseEnter={e => { if (page < total) { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#6366f1' } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}>
                Next →
            </button>
        </div>
    )
}

const Skeleton = () => (
    <div className="grid grid-cols-3 gap-5">
        {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl p-7 h-36" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="w-11 h-11 rounded-[14px] bg-slate-100 mb-4 animate-pulse" />
                <div className="w-3/5 h-3 bg-slate-100 rounded-md mb-3 animate-pulse" />
                <div className="w-2/5 h-6 bg-slate-100 rounded-md animate-pulse" />
            </div>
        ))}
    </div>
)

export default AdminDashboard
