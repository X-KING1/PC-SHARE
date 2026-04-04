// Professional Certificate Page — SmartLearn
// Inspired by Udemy, Coursera, HarvardX/edX, LinkedIn Learning
import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Certificate = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const certRef = useRef(null)
    const [downloading, setDownloading] = useState(false)

    const { score, percentage, quiz, quizTitle, courseTitle, instructorName, allLevelsPassed } = location.state || {}

    // Guard: redirect if certificate page is accessed without completing all 3 levels
    if (!allLevelsPassed) {
        return (
            <div style={{
                minHeight: '100vh', background: '#f5f5f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Inter', system-ui, sans-serif",
            }}>
                <div style={{ textAlign: 'center', maxWidth: 450, padding: 40, background: 'white', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>Certificate Locked</h2>
                    <p style={{ fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
                        You must pass all 3 quiz levels<br />(Easy, Medium & Hard) to earn your certificate.
                    </p>
                    <button onClick={() => navigate('/purchased-courses')} style={{
                        padding: '12px 28px', fontSize: 14, fontWeight: 700,
                        background: 'linear-gradient(135deg, #5624d0, #7c3aed)',
                        color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(86,36,208,0.3)',
                    }}>
                        Go to My Courses
                    </button>
                </div>
            </div>
        )
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const certId = `SL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const recipientName = user?.name || 'Student Name'
    // Strip difficulty suffix (e.g., "- Easy Quiz", "- Hard Quiz") to show only subject name
    const cleanTitle = (title) => title ? title.replace(/\s*-\s*(Easy|Medium|Hard)\s*(Quiz)?$/i, '').trim() : null
    const course = cleanTitle(courseTitle) || cleanTitle(quizTitle) || cleanTitle(quiz?.title) || 'Course Completion'
    const instructor = instructorName || 'Dr. Gyanendra Basnet'

    // PDF Download
    const handleDownload = async () => {
        setDownloading(true)
        try {
            const html2canvas = (await import('html2canvas')).default
            const { jsPDF } = await import('jspdf')
            const el = certRef.current

            // html2canvas doesn't support background-clip:text — swap to solid gold before capture
            const gradientEls = el.querySelectorAll('*')
            const saved = []
            gradientEls.forEach(node => {
                const s = node.style
                if (s.webkitBackgroundClip === 'text' || s.backgroundClip === 'text') {
                    saved.push({ node, bg: s.background, clip: s.webkitBackgroundClip, fill: s.webkitTextFillColor })
                    s.background = 'none'
                    s.webkitBackgroundClip = 'unset'
                    s.webkitTextFillColor = 'unset'
                    s.color = '#d4af37'
                }
            })

            const canvas = await html2canvas(el, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false,
                windowWidth: 1100,
                windowHeight: 800,
            })

            // Restore original gradient styles
            saved.forEach(({ node, bg, clip, fill }) => {
                node.style.background = bg
                node.style.webkitBackgroundClip = clip
                node.style.webkitTextFillColor = fill
                node.style.color = ''
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
            const w = pdf.internal.pageSize.getWidth()
            const h = pdf.internal.pageSize.getHeight()
            pdf.addImage(imgData, 'PNG', 0, 0, w, h)
            pdf.save(`SmartLearn_Certificate_${recipientName.replace(/\s+/g, '_')}.pdf`)
        } catch (err) {
            console.error('Download error:', err)
        }
        setDownloading(false)
    }

    // Print
    const handlePrint = () => window.print()

    /* ─── SVG Corner Ornament ───────────────────────────── */
    const CornerOrnament = ({ style }) => (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ position: 'absolute', ...style }}>
            <path d="M4 4C4 4 20 4 30 14C40 24 28 36 18 26C8 16 4 4 4 4Z" fill="#d4af37" opacity="0.35" />
            <path d="M4 4Q4 50 4 80" stroke="url(#g1)" strokeWidth="1.5" fill="none" />
            <path d="M4 4Q50 4 80 4" stroke="url(#g1)" strokeWidth="1.5" fill="none" />
            <path d="M10 10C10 10 24 12 32 22C40 32 30 42 22 32C14 22 10 10 10 10Z" fill="#d4af37" opacity="0.2" />
            <circle cx="8" cy="8" r="3" fill="#d4af37" opacity="0.5" />
            <path d="M4 50C4 50 10 42 18 44C26 46 24 56 16 54C8 52 4 50 4 50Z" fill="#d4af37" opacity="0.15" />
            <path d="M50 4C50 4 42 10 44 18C46 26 56 24 54 16C52 8 50 4 50 4Z" fill="#d4af37" opacity="0.15" />
            <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="50%" stopColor="#f5d77a" />
                    <stop offset="100%" stopColor="#d4af37" />
                </linearGradient>
            </defs>
        </svg>
    )

    /* ─── Gold Seal SVG ─────────────────────────────────── */
    const GoldSeal = () => (
        <div style={{ position: 'relative', width: 110, height: 110 }}>
            <svg width="110" height="110" viewBox="0 0 110 110">
                {/* Outer ring */}
                {[...Array(24)].map((_, i) => {
                    const angle = (i * 15) * Math.PI / 180
                    const r1 = 48, r2 = 54
                    const cx = 55, cy = 55
                    return (
                        <polygon key={i}
                            points={`${cx + r1 * Math.cos(angle)},${cy + r1 * Math.sin(angle)} ${cx + r2 * Math.cos(angle + 0.12)},${cy + r2 * Math.sin(angle + 0.12)} ${cx + r1 * Math.cos(angle + 0.26)},${cy + r1 * Math.sin(angle + 0.26)}`}
                            fill="#d4af37" opacity="0.8" />
                    )
                })}
                {/* Inner dark circle */}
                <circle cx="55" cy="55" r="42" fill="#1a1a2e" />
                {/* Inner gold ring */}
                <circle cx="55" cy="55" r="38" fill="none" stroke="#d4af37" strokeWidth="1.5" />
                <circle cx="55" cy="55" r="35" fill="none" stroke="#d4af37" strokeWidth="0.5" opacity="0.5" />
                {/* Star */}
                <polygon points="55,22 59.5,40 78,40 63.5,50 68.5,68 55,57 41.5,68 46.5,50 32,40 50.5,40"
                    fill="#d4af37" opacity="0.9" />
                {/* Laurel leaves - left */}
                {[0, 1, 2, 3].map(i => (
                    <ellipse key={`ll${i}`} cx={42 - i * 2} cy={70 + i * 4} rx="4" ry="8"
                        fill="#d4af37" opacity="0.4" transform={`rotate(${25 + i * 8}, ${42 - i * 2}, ${70 + i * 4})`} />
                ))}
                {/* Laurel leaves - right */}
                {[0, 1, 2, 3].map(i => (
                    <ellipse key={`lr${i}`} cx={68 + i * 2} cy={70 + i * 4} rx="4" ry="8"
                        fill="#d4af37" opacity="0.4" transform={`rotate(${-25 - i * 8}, ${68 + i * 2}, ${70 + i * 4})`} />
                ))}
                {/* Text on seal */}
                <text x="55" y="78" textAnchor="middle" fill="#d4af37"
                    style={{ fontSize: '7px', fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: '1.5px' }}>
                    VERIFIED
                </text>
            </svg>
        </div>
    )

    /* ─── QR Code SVG (stylized placeholder) ────────────── */
    const QRCode = () => (
        <svg width="70" height="70" viewBox="0 0 70 70" style={{ opacity: 0.6 }}>
            <rect width="70" height="70" fill="white" rx="4" />
            <rect x="5" y="5" width="20" height="20" rx="2" fill="#1a1a2e" />
            <rect x="8" y="8" width="14" height="14" rx="1" fill="white" />
            <rect x="10" y="10" width="10" height="10" rx="1" fill="#1a1a2e" />
            <rect x="45" y="5" width="20" height="20" rx="2" fill="#1a1a2e" />
            <rect x="48" y="8" width="14" height="14" rx="1" fill="white" />
            <rect x="50" y="10" width="10" height="10" rx="1" fill="#1a1a2e" />
            <rect x="5" y="45" width="20" height="20" rx="2" fill="#1a1a2e" />
            <rect x="8" y="48" width="14" height="14" rx="1" fill="white" />
            <rect x="10" y="50" width="10" height="10" rx="1" fill="#1a1a2e" />
            {/* data dots */}
            {[30, 35, 40, 45, 50, 55].map(x =>
                [30, 35, 40, 45, 50, 55, 60].map(y =>
                    Math.random() > 0.4 ? <rect key={`${x}${y}`} x={x} y={y} width="4" height="4" fill="#1a1a2e" rx="0.5" /> : null
                )
            )}
            <rect x="30" y="5" width="4" height="4" fill="#1a1a2e" />
            <rect x="36" y="5" width="4" height="4" fill="#1a1a2e" />
            <rect x="30" y="11" width="4" height="4" fill="#1a1a2e" />
            <rect x="30" y="17" width="4" height="4" fill="#1a1a2e" />
            <rect x="36" y="17" width="4" height="4" fill="#1a1a2e" />
        </svg>
    )

    /* ─── Decorative Gold Line ──────────────────────────── */
    const GoldDivider = ({ width = '60%', margin = '20px auto' }) => (
        <div style={{
            width, margin, height: '2px', position: 'relative',
            background: 'linear-gradient(90deg, transparent, #d4af37, #f5d77a, #d4af37, transparent)',
        }}>
            <div style={{
                position: 'absolute', left: '50%', top: '-4px', transform: 'translateX(-50%)',
                width: 10, height: 10, background: '#d4af37', borderRadius: '50%', opacity: 0.6,
            }} />
        </div>
    )

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f5f5f0',
            padding: '20px 20px',
            fontFamily: "'Inter', system-ui, sans-serif",
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
        }}>
            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=Great+Vibes&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            {/* ═══ Certificate Card ═══ */}
            <div ref={certRef} id="certificate-print" style={{
                width: '100%',
                maxWidth: 850,
                aspectRatio: '1.414 / 1',
                background: 'linear-gradient(135deg, #fffdf5 0%, #faf6eb 30%, #f8f2e3 60%, #faf6eb 100%)',
                borderRadius: 6,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 25px 80px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.08)',
                padding: 0,
            }}>

                {/* Subtle paper texture overlay */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E")`,
                    opacity: 0.5,
                }} />

                {/* Gold border */}
                <div style={{
                    position: 'absolute', inset: 14, zIndex: 1,
                    border: '2px solid #d4af37',
                    borderRadius: 2,
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', inset: 18, zIndex: 1,
                    border: '0.5px solid #d4af3755',
                    borderRadius: 2,
                    pointerEvents: 'none',
                }} />

                {/* Corner ornaments */}
                <CornerOrnament style={{ top: 8, left: 8 }} />
                <CornerOrnament style={{ top: 8, right: 8, transform: 'scaleX(-1)' }} />
                <CornerOrnament style={{ bottom: 8, left: 8, transform: 'scaleY(-1)' }} />
                <CornerOrnament style={{ bottom: 8, right: 8, transform: 'scale(-1)' }} />

                {/* ─── Content ──────────────────────────────── */}
                <div style={{
                    position: 'relative', zIndex: 2,
                    padding: '48px 60px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    height: '100%', boxSizing: 'border-box',
                    justifyContent: 'space-between',
                }}>

                    {/* Header: Logo + Title */}
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
                            <img src="/smartlearn-logo.png" alt="SmartLearn" style={{ height: 72, objectFit: 'contain' }}
                                onError={e => { e.target.style.display = 'none' }} />
                        </div>

                        {/* Certificate Type */}
                        <div style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase',
                            background: 'linear-gradient(135deg, #d4af37, #f5d77a, #d4af37)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            marginBottom: 4,
                        }}>
                            Certificate of Completion
                        </div>

                        <GoldDivider width="40%" margin="12px auto 0" />
                    </div>

                    {/* Body */}
                    <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, marginTop: -10 }}>
                        <p style={{
                            fontSize: 13, color: '#666', fontWeight: 400, letterSpacing: 1,
                            margin: 0,
                        }}>
                            This is to certify that
                        </p>

                        {/* Recipient Name */}
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 44, fontWeight: 700,
                            color: '#1a1a2e',
                            margin: '6px 0',
                            lineHeight: 1.1,
                        }}>
                            {recipientName}
                        </h1>

                        <p style={{ fontSize: 13, color: '#666', margin: '2px 0 10px', letterSpacing: 0.5 }}>
                            has successfully completed the course
                        </p>

                        {/* Course Title */}
                        <h2 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 26, fontWeight: 600,
                            color: '#2d2d5e',
                            margin: '0 0 6px',
                            maxWidth: 700,
                            lineHeight: 1.3,
                        }}>
                            {course}
                        </h2>

                        {/* Professional description */}
                        <p style={{ fontSize: 12, color: '#888', margin: '8px 0 0', maxWidth: 500, lineHeight: 1.6 }}>
                            and has demonstrated proficiency in all course requirements,
                            including assessments and practical evaluations.
                        </p>

                        <GoldDivider width="30%" margin="16px auto 0" />
                    </div>

                    {/* Footer: Signature / Seal / Date / QR */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        alignItems: 'end',
                        width: '100%',
                        gap: 20,
                    }}>
                        {/* Left: Signature */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontFamily: "'Great Vibes', cursive",
                                fontSize: 28, color: '#1a1a2e',
                                marginBottom: 2,
                            }}>
                                {instructor}
                            </div>
                            <div style={{
                                width: '80%', height: 1, margin: '0 auto 6px',
                                background: 'linear-gradient(90deg, transparent, #1a1a2e, transparent)',
                            }} />
                            <p style={{ fontSize: 10, color: '#888', margin: 0, fontWeight: 500 }}>Course Instructor</p>
                            <p style={{ fontSize: 9, color: '#aaa', margin: '2px 0 0' }}>SmartLearn Academy</p>
                        </div>

                        {/* Center: Seal */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <GoldSeal />
                        </div>

                        {/* Right: Date + ID + QR */}
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <QRCode />
                            <div>
                                <p style={{ fontSize: 10, color: '#888', margin: 0 }}>{currentDate}</p>
                                <p style={{ fontSize: 8, color: '#aaa', margin: '3px 0 0', fontFamily: 'monospace', letterSpacing: 1 }}>
                                    ID: {certId}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Action Buttons ═══ */}
            <div className="no-print" style={{
                maxWidth: 1050, margin: '28px auto 0',
                display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap',
            }}>
                <button onClick={handleDownload} disabled={downloading} style={{
                    padding: '13px 32px', fontSize: 14, fontWeight: 700,
                    background: downloading ? '#ccc' : 'linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)',
                    color: 'white', border: 'none', borderRadius: 10,
                    cursor: downloading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 20px rgba(26,26,46,0.25)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'transform 0.2s',
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {downloading ? 'Generating PDF...' : 'Download PDF'}
                </button>

                <button onClick={handlePrint} style={{
                    padding: '13px 32px', fontSize: 14, fontWeight: 700,
                    background: 'white', color: '#1a1a2e',
                    border: '2px solid #1a1a2e', borderRadius: 10,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print
                </button>

                <button onClick={() => navigate(-1)} style={{
                    padding: '13px 32px', fontSize: 14, fontWeight: 700,
                    background: 'white', color: '#666',
                    border: '2px solid #e0e0e0', borderRadius: 10,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </button>
            </div>

            {/* Print styles */}
            <style>{`
                @media print {
                    html, body { margin: 0 !important; padding: 0 !important; }
                    body > * { display: none !important; }
                    body > #root { display: block !important; }
                    #root > * { display: none !important; }
                    #root > div > div { display: block !important; }
                    nav, header, .navbar, footer, button { display: none !important; }
                    #certificate-print {
                        display: block !important;
                        visibility: visible !important;
                        position: fixed !important;
                        left: 0 !important; top: 0 !important;
                        width: 100vw !important; height: 100vh !important;
                        max-width: none !important;
                        margin: 0 !important; padding: 0 !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        aspect-ratio: auto !important;
                    }
                    #certificate-print * { visibility: visible !important; }
                    .no-print { display: none !important; }
                }
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=Great+Vibes&family=Inter:wght@300;400;500;600;700&display=swap');
            `}</style>
        </div>
    )
}

export default Certificate
