// TuneCasa CourseCard Component Pattern
import { Link } from 'react-router-dom'
import { getThumbnail } from '../utils/youtube'

const CourseCard = ({ course }) => {
    // Handle Oracle CLOB objects
    const getString = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        return String(value);
    };

    const thumbnail = getThumbnail(course.youtube_url, 'HQ');

    return (
        <Link to={`/course/${course.course_id}`} className="course-card animate-fade-in block no-underline text-inherit cursor-pointer">
            {/* Thumbnail */}
            <div className="h-40 overflow-hidden relative">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={getString(course.title)}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center"
                    style={{ display: thumbnail ? 'none' : 'flex' }}
                >
                    <span className="text-4xl">📚</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    {getString(course.category)}
                </span>
                <h3 className="text-lg font-bold mt-2 line-clamp-2">{getString(course.title)}</h3>
                <p className="text-gray-400 text-sm mt-2 line-clamp-2">{getString(course.description)}</p>

                <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">{course.level || 'Beginner'}</span>
                    <span className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
                        View Course →
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default CourseCard
