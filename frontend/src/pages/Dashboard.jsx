// Student Dashboard — Ultra-Premium Analytical Dashboard
// Purple/Black/White • Recharts • Real Data
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import useAuth from '../hooks/useAuth'
import { useGetDashboardDataQuery } from '../store/api/dashboardApi'

/* ── Icons ── */
const I = {
    book: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    check: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    medal: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
    zap: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" opacity="0.9"/></svg>,
    trophy: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2Z"/></svg>,
    up: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/></svg>,
    bar: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    activity: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    clock: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    bolt: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" opacity="0.95"/></svg>,
}

const BADGE_COLORS = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700' }

/* ── Custom Tooltips ── */
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl px-4 py-3 text-xs" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 36px rgba(0,0,0,0.3)' }}>
            <p className="font-bold text-white mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="font-semibold" style={{ color: p.color || '#a78bfa' }}>
                    {p.name}: <span className="text-white font-extrabold">{p.value}</span>
                </p>
            ))}
        </div>
    )
}

const PieTooltipC = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl px-4 py-3 text-xs" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 36px rgba(0,0,0,0.3)' }}>
            <p className="font-bold text-white">{payload[0].name}: <span className="font-extrabold" style={{ color: payload[0].payload.color }}>{payload[0].value}</span></p>
        </div>
    )
}

/* ── Glass Panel Component ── */
const GlassPanel = ({ children, title, icon, accent = '#a855f7', className = '' }) => (
    <div className={`rounded-2xl p-6 transition-all duration-300 ${className}`}
        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {title && (
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 6px 16px ${accent}30` }}>
                    {icon}
                </div>
                <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight">{title}</h3>
            </div>
        )}
        {children}
    </div>
)

/* ── Mini Stat ── */
const MiniStat = ({ l, v, c }) => (
    <div className="flex-1 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{l}</p>
        <p className="text-[18px] font-black" style={{ color: c }}>{v}</p>
    </div>
)

/* ════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ════════════════════════════════════════════════════════ */
const Dashboard = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loaded, setLoaded] = useState(false)

    const { data: dashboard, isLoading } = useGetDashboardDataQuery(user?.user_id, {
        skip: !user?.user_id,
    })

    useEffect(() => { setTimeout(() => setLoaded(true), 100) }, [])

    if (!user || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f2f5' }}>
                <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white animate-pulse"
                        style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                        {I.bolt}
                    </div>
                    <p className="text-sm font-bold text-slate-400">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    const stats = dashboard?.stats || { purchasedCourses: 0, quizzesCompleted: 0, certificatesEarned: 0, totalXP: 0, totalBadges: 0 }
    const level = dashboard?.studentLevel || { level: 1, title: 'Seedling', icon: '🌱', totalXP: 0, progressPercent: 0 }
    const courseProgress = dashboard?.courseProgress || []
    const badges = dashboard?.badges || []
    const certificates = dashboard?.certificates || []
    const recentActivity = dashboard?.recentActivity || []
    const streak = dashboard?.streak || { current: 0, weeklyActiveDays: [] }

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

    const timeAgo = (dateStr) => {
        if (!dateStr) return 'Recently'
        const diff = Date.now() - new Date(dateStr).getTime()
        const m = Math.floor(diff / 60000)
        if (m < 60) return `${m}m ago`
        const h = Math.floor(m / 60)
        if (h < 24) return `${h}h ago`
        const d = Math.floor(h / 24)
        return d < 7 ? `${d}d ago` : new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    /* ── Chart Data ── */
    // Quiz scores per course bar chart
    const quizScoreData = courseProgress.flatMap(c =>
        c.quizzes.map(q => ({
            name: `${c.title.split(' ')[0]} (${q.difficulty?.charAt(0).toUpperCase()})`,
            score: q.best_score || 0,
            passing: q.passing_score || 70,
            fill: q.passed ? '#a855f7' : '#ef4444'
        }))
    )

    // Badge distribution donut
    const badgeDist = [
        { name: 'Bronze', value: badges.filter(b => b.type === 'bronze').length, color: '#CD7F32' },
        { name: 'Silver', value: badges.filter(b => b.type === 'silver').length, color: '#C0C0C0' },
        { name: 'Gold', value: badges.filter(b => b.type === 'gold').length, color: '#FFD700' },
    ].filter(d => d.value > 0)
    if (badgeDist.length === 0) badgeDist.push({ name: 'None', value: 1, color: '#e2e8f0' })

    // Course completion donut
    const courseDist = [
        { name: 'Completed', value: courseProgress.filter(c => c.certificateEarned).length, color: '#0ea5e9' },
        { name: 'In Progress', value: courseProgress.filter(c => !c.certificateEarned).length, color: '#cbd5e1' },
    ].filter(d => d.value > 0)
    if (courseDist.length === 0) courseDist.push({ name: 'None', value: 1, color: '#e2e8f0' })

    // XP breakdown per course
    const xpPerCourse = courseProgress.map(c => {
        let xp = 0
        c.quizzes.forEach(q => {
            if (q.passed) {
                if (q.difficulty === 'easy') xp += 10
                else if (q.difficulty === 'medium') xp += 20
                else if (q.difficulty === 'hard') xp += 30
                else xp += 15
            }
        })
        if (c.certificateEarned) xp += 50
        return { name: c.title.length > 18 ? c.title.slice(0, 18) + '…' : c.title, xp }
    })

    // Radial bar for level progress
    const levelRadial = [{ name: 'XP', value: level.progressPercent, fill: '#0ea5e9' }]

    // Stats cards
    const statCards = [
        { l: 'Courses Enrolled', v: stats.purchasedCourses, icon: I.book, gradient: 'linear-gradient(135deg, #a855f7, #c084fc)', shadow: 'rgba(168,85,247,0.3)', trend: `${courseProgress.filter(c => c.certificateEarned).length} certified` },
        { l: 'Quizzes Passed', v: stats.quizzesCompleted, icon: I.check, gradient: 'linear-gradient(135deg, #10b981, #34d399)', shadow: 'rgba(16,185,129,0.3)', trend: 'All levels' },
        { l: 'Badges Earned', v: stats.totalBadges, icon: I.medal, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', shadow: 'rgba(245,158,11,0.3)', trend: `${badges.filter(b => b.type === 'gold').length} gold` },
        { l: 'Total XP', v: stats.totalXP, icon: I.zap, gradient: 'linear-gradient(135deg, #ec4899, #f472b6)', shadow: 'rgba(236,72,153,0.3)', trend: level.title },
        { l: 'Certificates', v: stats.certificatesEarned, icon: I.trophy, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', shadow: 'rgba(99,102,241,0.3)', trend: 'Verified' },
        { l: 'Day Streak', v: streak.current, icon: I.activity, gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', shadow: 'rgba(14,165,233,0.3)', trend: 'Active' },
    ]

    return (
        <div className="min-h-screen" style={{ background: '#f0f2f5', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

            {/* ═══ HEADER ═══ */}
            <header className="sticky top-0 z-40 px-8 py-5 flex items-center justify-between"
                style={{ background: 'rgba(240,242,245,0.85)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold relative"
                        style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 8px 24px rgba(168,85,247,0.35)' }}>
                        {getInitials(user.name)}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{greeting}</p>
                        <h1 className="text-[22px] font-black text-slate-900 tracking-tight -mt-0.5">{user.name}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(168,85,247,0.04))', border: '1px solid rgba(168,85,247,0.12)', color: '#a855f7' }}>
                        {level.icon} Level {level.level} — {level.title}
                    </div>
                    <div className="px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 tracking-wide"
                        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        🔥 {streak.current} Day Streak
                    </div>
                    <div className="px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-500"
                        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </header>

            {/* ═══ CONTENT ═══ */}
            <div className="p-8 pb-20">

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 mb-7">
                    {statCards.map((c, i) => (
                        <div key={i} className="relative overflow-hidden rounded-2xl p-5 cursor-default group transition-all duration-500 hover:-translate-y-1.5"
                            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 40px ${c.shadow}25, 0 1px 3px rgba(0,0,0,0.04)` }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 opacity-[0.04]" style={{ background: c.gradient }} />
                            <div className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-4 text-white"
                                style={{ background: c.gradient, boxShadow: `0 8px 20px ${c.shadow}` }}>
                                {c.icon}
                            </div>
                            <p className="text-[10px] font-extrabold uppercase tracking-[1px] mb-1.5 text-slate-400">{c.l}</p>
                            <div className="flex items-end gap-2.5">
                                <p className="text-[26px] font-black text-slate-900 leading-none tracking-tight">{c.v}</p>
                                <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5"
                                    style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                                    {c.trend}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Charts Row 1: XP Level + Quiz Scores + Badge Dist ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-7">

                    {/* XP Level (Radial + Info) */}
                    <GlassPanel className="lg:col-span-2" title="Level Progress" icon={I.zap} accent="#a855f7">
                        <div className="flex items-center gap-6">
                            <div style={{ width: 160, height: 160 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={14} data={levelRadial} startAngle={90} endAngle={-270}>
                                        <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={10} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="relative -mt-[105px] text-center">
                                    <p className="text-[28px] leading-none">{level.icon}</p>
                                    <p className="text-[11px] font-extrabold text-slate-500 mt-1">Lv.{level.level}</p>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-[20px] font-black text-slate-900 mb-1">{level.title}</p>
                                <p className="text-[12px] text-slate-400 font-bold mb-4">{level.totalXP} XP earned total</p>
                                <div className="w-full h-2.5 rounded-full bg-slate-100 mb-2 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${level.progressPercent}%`, background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)' }} />
                                </div>
                                <p className="text-[11px] text-slate-400 font-semibold">
                                    {level.nextLevel ? `${level.xpToNext} XP to ${level.nextLevel.icon} ${level.nextLevel.title}` : '🏆 Maximum level!'}
                                </p>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Quiz Performance Area Chart */}
                    <GlassPanel className="lg:col-span-3" title="Quiz Performance" icon={I.bar} accent="#0ea5e9">
                        {quizScoreData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={quizScoreData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ r: 5, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, fill: '#0ea5e9', strokeWidth: 3, stroke: '#fff' }} name="Score" />
                                    <Area type="monotone" dataKey="passing" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="5 5" fill="url(#passGrad)" dot={false} name="Pass Mark" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-slate-300 text-sm font-semibold">No quiz data yet</div>
                        )}
                    </GlassPanel>
                </div>

                {/* ── Charts Row 2: Course Completion + XP by Course + Badges ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">

                    {/* Course Completion — Premium Donut with center label */}
                    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        {/* Gradient header */}
                        <div className="px-5 py-3" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-md bg-white/15 flex items-center justify-center text-white">{I.book}</div>
                                    <h3 className="text-[13px] font-extrabold text-white">Course Completion</h3>
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                                    {certificates.length}/{courseProgress.length}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="relative" style={{ height: 150 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <defs>
                                            <linearGradient id="courseGrad" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#0ea5e9" />
                                                <stop offset="100%" stopColor="#0284c7" />
                                            </linearGradient>
                                        </defs>
                                        <Pie data={courseDist} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none" animationDuration={1200}>
                                            {courseDist.map((d, i) => <Cell key={i} fill={i === 0 ? 'url(#courseGrad)' : '#e2e8f0'} />)}
                                        </Pie>
                                        <Tooltip content={<PieTooltipC />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-[22px] font-black text-slate-900 leading-none">{courseProgress.length > 0 ? Math.round(courseProgress.reduce((a, c) => a + c.progressPercent, 0) / courseProgress.length) : 0}%</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Complete</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <div className="flex-1 text-center p-2 rounded-lg" style={{ background: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                                    <p className="text-[14px] font-black text-slate-900">{courseProgress.length}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Enrolled</p>
                                </div>
                                <div className="flex-1 text-center p-2 rounded-lg" style={{ background: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                                    <p className="text-[14px] font-black" style={{ color: '#0ea5e9' }}>{certificates.length}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Certified</p>
                                </div>
                                <div className="flex-1 text-center p-2 rounded-lg" style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                                    <p className="text-[14px] font-black text-emerald-600">{stats.quizzesCompleted}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Passed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* XP Distribution — Premium horizontal bars with header */}
                    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div className="px-5 py-3" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-md bg-white/15 flex items-center justify-center text-white">{I.zap}</div>
                                    <h3 className="text-[13px] font-extrabold text-white">XP Breakdown</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[16px] font-black text-white leading-none">{stats.totalXP}</p>
                                    <p className="text-[7px] font-bold text-white/60 uppercase">Total XP</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            {xpPerCourse.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={130}>
                                        <BarChart data={xpPerCourse} layout="vertical" margin={{ top: 0, right: 15, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="xpGrad" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#0ea5e9" />
                                                    <stop offset="100%" stopColor="#38bdf8" />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                            <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155', fontWeight: 700 }} axisLine={false} tickLine={false} width={110} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Bar dataKey="xp" fill="url(#xpGrad)" radius={[0, 10, 10, 0]} barSize={28} name="XP" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="flex gap-2 mt-2">
                                        {xpPerCourse.map((c, i) => (
                                            <div key={i} className="flex-1 text-center p-2 rounded-lg" style={{ background: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                                                <p className="text-[14px] font-black" style={{ color: '#0ea5e9' }}>{c.xp}</p>
                                                <p className="text-[7px] font-bold text-slate-400 uppercase truncate">{c.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-[220px] text-slate-300 text-sm font-semibold">No XP earned yet</div>
                            )}
                        </div>
                    </div>

                    {/* Badge Collection — Premium cards with gradient header */}
                    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div className="px-5 py-3" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-md bg-white/15 flex items-center justify-center text-white">{I.medal}</div>
                                    <h3 className="text-[13px] font-extrabold text-white">Badge Collection</h3>
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                                    {badges.length} Earned
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            {badges.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <p className="text-[30px] mb-1 opacity-30">🏅</p>
                                    <p className="text-sm font-bold text-slate-300">Pass quizzes to earn badges</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {['gold', 'silver', 'bronze'].map(type => {
                                        const typeBadges = badges.filter(b => b.type === type)
                                        if (typeBadges.length === 0) return null
                                        return (
                                            <div key={type}>
                                                <p className="text-[9px] font-extrabold uppercase tracking-widest mb-2" style={{ color: BADGE_COLORS[type] }}>
                                                    {type === 'gold' ? '🥇' : type === 'silver' ? '🥈' : '🥉'} {type} — {typeBadges.length}
                                                </p>
                                                <div className="space-y-2">
                                                    {typeBadges.map((b, i) => (
                                                        <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg transition-all duration-200 hover:shadow-md cursor-default"
                                                            style={{ background: `linear-gradient(135deg, ${BADGE_COLORS[b.type]}08, ${BADGE_COLORS[b.type]}03)`, border: `1px solid ${BADGE_COLORS[b.type]}20` }}>
                                                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                                                                style={{ background: `linear-gradient(135deg, ${BADGE_COLORS[b.type]}, ${BADGE_COLORS[b.type]}bb)`, boxShadow: `0 4px 12px ${BADGE_COLORS[b.type]}30` }}>
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-extrabold text-slate-800 truncate">{b.course_title}</p>
                                                                <p className="text-[9px] font-bold text-slate-400">{b.difficulty.charAt(0).toUpperCase() + b.difficulty.slice(1)} Quiz</p>
                                                            </div>
                                                            <span className="text-[9px] font-extrabold px-2 py-1 rounded-md" style={{ background: `${BADGE_COLORS[b.type]}15`, color: BADGE_COLORS[b.type] }}>
                                                                {type.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Course Progress Cards + Activity ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">

                    {/* Course Progress Cards (2 cols) */}
                    <div className="lg:col-span-2">
                        <GlassPanel title="Course Progress" icon={I.book} accent="#a855f7">
                            {courseProgress.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-[40px] mb-3 opacity-30">📚</p>
                                    <p className="text-sm font-bold text-slate-400 mb-4">Start your learning journey</p>
                                    <Link to="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.03]"
                                        style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 4px 14px rgba(168,85,247,0.3)' }}>
                                        Browse Courses →
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {courseProgress.map(course => (
                                        <div key={course.course_id}
                                            className="rounded-xl p-5 border border-slate-100 cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:border-purple-200"
                                            style={{ background: '#fafafa' }}
                                            onClick={() => navigate(`/purchased-courses?play=${course.course_id}`)}>
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[13px] font-extrabold text-slate-900 truncate">{course.title}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{course.instructor} · {course.category}</p>
                                                </div>
                                                {course.certificateEarned && (
                                                    <span className="flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-1.5 rounded-lg uppercase tracking-wider shrink-0"
                                                        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(168,85,247,0.05))', color: '#a855f7', border: '1px solid rgba(168,85,247,0.15)' }}>
                                                        🏆 Certified
                                                    </span>
                                                )}
                                            </div>
                                            {/* Progress bar */}
                                            <div className="mb-3">
                                                <div className="flex justify-between mb-1.5">
                                                    <span className="text-[10px] font-bold text-slate-400">Progress</span>
                                                    <span className="text-[10px] font-extrabold" style={{ color: '#a855f7' }}>{course.progressPercent}%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-700"
                                                        style={{ width: `${course.progressPercent}%`, background: course.certificateEarned ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #a855f7, #7c3aed)' }} />
                                                </div>
                                            </div>
                                            {/* Quiz level pills */}
                                            <div className="flex gap-2">
                                                {['easy', 'medium', 'hard'].map(diff => {
                                                    const q = course.quizzes.find(qu => qu.difficulty === diff)
                                                    const passed = q?.passed
                                                    return (
                                                        <div key={diff} className="flex-1 text-center py-2 rounded-lg border"
                                                            style={{
                                                                background: passed ? '#f0fdf4' : '#f8fafc',
                                                                borderColor: passed ? '#bbf7d0' : '#e2e8f0',
                                                            }}>
                                                            <div className="text-[12px]">{passed ? '✅' : !q ? '🔒' : '⏳'}</div>
                                                            <div className="text-[9px] font-bold mt-0.5" style={{ color: passed ? '#16a34a' : '#94a3b8' }}>
                                                                {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                                            </div>
                                                            {q?.best_score != null && (
                                                                <div className="text-[8px] text-slate-400 font-semibold">{q.best_score}pt</div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </GlassPanel>
                    </div>

                    {/* Recent Activity + Certs */}
                    <div className="space-y-5">
                        {/* Certificates */}
                        <GlassPanel title="Certificates" icon={I.trophy} accent="#6366f1">
                            {certificates.length === 0 ? (
                                <p className="text-center text-slate-300 text-sm font-semibold py-6">Complete all quiz levels to earn certificates</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {certificates.map((cert, i) => (
                                        <div key={i}
                                            className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200 group hover:shadow-md"
                                            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.04), rgba(99,102,241,0.02))', border: '1px solid rgba(168,85,247,0.08)' }}
                                            onClick={() => navigate('/certificate', { state: { courseTitle: cert.course_title, instructorName: cert.instructor, allLevelsPassed: true, score: 0, percentage: 100 } })}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                                                style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', boxShadow: '0 4px 12px rgba(168,85,247,0.25)' }}>
                                                🏆
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-extrabold text-slate-900 truncate">{cert.course_title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{cert.instructor}</p>
                                            </div>
                                            <span className="text-[9px] font-extrabold px-2.5 py-1.5 rounded-lg"
                                                style={{ background: '#f3e8ff', color: '#7c3aed' }}>VIEW</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </GlassPanel>

                        {/* Activity */}
                        <GlassPanel title="Recent Activity" icon={I.clock} accent="#0ea5e9">
                            {recentActivity.length === 0 ? (
                                <p className="text-center text-slate-300 text-sm font-semibold py-6">Activity will appear here</p>
                            ) : (
                                <div className="space-y-1 max-h-[240px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                    {recentActivity.slice(0, 8).map((a, i) => (
                                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-all">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                                style={{ background: a.type === 'quiz_complete' ? '#f3e8ff' : '#ecfdf5' }}>
                                                {a.type === 'quiz_complete' ? '✅' : '🛒'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-slate-700 truncate">
                                                    {a.type === 'quiz_complete' ? `Passed "${a.detail}"` : `Enrolled "${a.detail}"`}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {a.type === 'quiz_complete' && a.extra ? `Score: ${a.extra} · ` : ''}{timeAgo(a.date)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </GlassPanel>
                    </div>
                </div>

                {/* ── Weekly Activity + Quick Nav ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Weekly Activity */}
                    <GlassPanel title="Weekly Activity" icon={I.activity} accent="#10b981">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                                    const dayAbbrevs = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
                                    const todayIdx = (new Date().getDay() + 6) % 7
                                    const isActive = streak.weeklyActiveDays?.some(d => d?.toUpperCase()?.startsWith(dayAbbrevs[i]?.substring(0, 2)))
                                    const isToday = i === todayIdx
                                    return (
                                        <div key={day} className="text-center">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 text-xs font-bold transition-all"
                                                style={{
                                                    background: isToday ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : isActive ? '#0f172a' : '#f1f5f9',
                                                    color: isToday || isActive ? '#fff' : '#cbd5e1',
                                                    boxShadow: isToday ? '0 4px 12px rgba(168,85,247,0.35)' : 'none',
                                                }}>
                                                {isActive && !isToday ? '✓' : day.charAt(0)}
                                            </div>
                                            <span className="text-[9px] font-bold" style={{ color: isToday ? '#a855f7' : '#94a3b8' }}>{day}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="text-center px-6">
                                <p className="text-[32px] font-black text-slate-900 leading-none">🔥 {streak.current}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Day Streak</p>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Quick Navigation */}
                    <GlassPanel title="Quick Access" icon={I.bar} accent="#8b5cf6">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { to: '/purchased-courses', icon: '📚', title: 'My Courses', sub: 'Continue learning', accent: '#a855f7' },
                                { to: '/courses', icon: '🎓', title: 'Browse', sub: 'Discover courses', accent: '#0ea5e9' },
                                { to: '/certificate', icon: '🏆', title: 'Certificates', sub: 'View achievements', accent: '#f59e0b' },
                                { to: '/forum', icon: '💬', title: 'Forum', sub: 'Join discussions', accent: '#10b981' },
                            ].map((nav, i) => (
                                <Link key={i} to={nav.to}
                                    className="flex items-center gap-3 p-4 rounded-xl no-underline transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-md"
                                    style={{ background: `${nav.accent}06`, border: `1px solid ${nav.accent}12` }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                        style={{ background: `${nav.accent}12` }}>{nav.icon}</div>
                                    <div>
                                        <p className="text-[12px] font-extrabold text-slate-900">{nav.title}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold">{nav.sub}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
