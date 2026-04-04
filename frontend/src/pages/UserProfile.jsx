// User Profile Page - Clean white/black/blue design
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import useAuth from '../hooks/useAuth'
import { updateUserProfile, uploadUserAvatar } from '../store/authSlice'
import LoadingSpinner from '../components/LoadingSpinner'
import config from '../config'

const BACKEND_URL = config.API_BASE;

const UserProfile = () => {
    const dispatch = useDispatch()
    const { user } = useAuth()
    const fileInputRef = useRef(null)

    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({ name: '', skill_level: '' })
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                skill_level: user.skill_level || 'Beginner'
            })
        }
    }, [user])

    if (!user) {
        return <LoadingSpinner message="Loading profile..." />
    }

    const getInitials = (name) => {
        if (!name) return '?'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getAvatarUrl = () => {
        if (user.profile_image) return `${BACKEND_URL}${user.profile_image}`
        return null
    }

    const handleImageClick = () => fileInputRef.current?.click()

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowed.includes(file.type)) {
            setMessage({ text: 'Please select a valid image file (JPG, PNG, GIF, WebP)', type: 'error' })
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ text: 'Image must be less than 5MB', type: 'error' })
            return
        }
        setUploading(true)
        setMessage({ text: '', type: '' })
        try {
            const fd = new FormData()
            fd.append('avatar', file)
            await dispatch(uploadUserAvatar(fd)).unwrap()
            setMessage({ text: 'Profile picture updated!', type: 'success' })
        } catch (err) {
            setMessage({ text: err || 'Failed to upload image', type: 'error' })
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage({ text: '', type: '' })
        try {
            await dispatch(updateUserProfile(formData)).unwrap()
            setIsEditing(false)
            setMessage({ text: 'Profile updated successfully!', type: 'success' })
        } catch (err) {
            setMessage({ text: err || 'Failed to update profile', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({ name: user.name || '', skill_level: user.skill_level || 'Beginner' })
        setIsEditing(false)
        setMessage({ text: '', type: '' })
    }

    const avatarUrl = getAvatarUrl()

    return (
        <div className="up-page">
            <div className="up-container">
                {/* Header */}
                <div className="up-header">
                    <h1>My Profile</h1>
                    <p>Manage your account information</p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`up-msg up-msg-${message.type}`}>
                        <span>{message.type === 'success' ? '✓' : '✕'}</span>
                        <p>{message.text}</p>
                        <button onClick={() => setMessage({ text: '', type: '' })}>×</button>
                    </div>
                )}

                {/* Profile Card */}
                <div className="up-card">
                    <div className="up-card-top">
                        {/* Avatar */}
                        <div className="up-avatar-wrap" onClick={handleImageClick}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" className="up-avatar-img" />
                            ) : (
                                <div className="up-avatar-placeholder">
                                    {getInitials(user.name)}
                                </div>
                            )}
                            <div className="up-avatar-hover">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                    <circle cx="12" cy="13" r="4"/>
                                </svg>
                                <span>{uploading ? 'Uploading...' : 'Change'}</span>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </div>

                        {/* Name & Role */}
                        <div className="up-user-info">
                            <h2>{user.name}</h2>
                            <p className="up-email">{user.email}</p>
                            <div className="up-tags">
                                <span className="up-tag up-tag-role">
                                    {user.role === 'mentor' ? 'Mentor' : user.role === 'admin' ? 'Admin' : 'Student'}
                                </span>
                                <span className="up-tag up-tag-skill">{user.skill_level || 'Beginner'}</span>
                                <span className="up-tag up-tag-id">ID #{user.user_id}</span>
                            </div>
                        </div>

                        {!isEditing && (
                            <button className="up-edit-btn" onClick={() => setIsEditing(true)}>
                                ✏️ Edit Profile
                            </button>
                        )}
                    </div>

                    <hr className="up-divider" />

                    {/* Fields */}
                    <div className="up-fields">
                        <div className="up-field">
                            <label>Full Name</label>
                            {isEditing ? (
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="up-input" />
                            ) : (
                                <p>{user.name}</p>
                            )}
                        </div>

                        <div className="up-field">
                            <label>Email Address</label>
                            <p>{user.email}</p>
                        </div>

                        <div className="up-field">
                            <label>Skill Level</label>
                            {isEditing ? (
                                <select value={formData.skill_level} onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })} className="up-input">
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            ) : (
                                <p>{user.skill_level || 'Beginner'}</p>
                            )}
                        </div>

                        <div className="up-field">
                            <label>Account Role</label>
                            <p>{user.role === 'mentor' ? 'Mentor' : user.role === 'admin' ? 'Administrator' : 'Student'}</p>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="up-actions">
                            <button className="up-save-btn" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button className="up-cancel-btn" onClick={handleCancel}>Cancel</button>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="up-links">
                    {user.role === 'mentor' ? (
                        <>
                            <Link to="/mentor" className="up-link-card" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', fontWeight: 700, boxShadow: '0 8px 25px rgba(99,102,241,.3)' }}>
                                🎓 Mentor Studio
                            </Link>
                            <Link to="/mentor" className="up-link-card" style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: 'white', border: 'none', fontWeight: 700, boxShadow: '0 8px 25px rgba(14,165,233,.3)' }}>
                                📹 My Sessions
                            </Link>
                            <Link to="/forum" className="up-link-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', color: 'white', border: 'none', fontWeight: 700, boxShadow: '0 8px 25px rgba(245,158,11,.3)' }}>
                                💬 Forum
                            </Link>
                            <Link to="/profile" className="up-link-card" style={{ background: 'linear-gradient(135deg, #22c55e, #059669)', color: 'white', border: 'none', fontWeight: 700, boxShadow: '0 8px 25px rgba(34,197,94,.3)' }}>
                                ⚙️ Settings
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className="up-link-card">📊 Dashboard</Link>
                            <Link to="/my-learning" className="up-link-card">📖 My Learning</Link>
                            <Link to="/purchased-courses" className="up-link-card">🛒 Purchased</Link>
                            <Link to="/courses" className="up-link-card">🎓 Browse Courses</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserProfile
