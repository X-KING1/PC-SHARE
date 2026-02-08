// TuneCasa Courses Page Pattern with RTK Query
// Supports filtering by category from URL
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGetCoursesQuery, useGetCategoriesQuery } from '../store/api/courseApi'
import CourseCard from '../components/CourseCard'

const Courses = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')

    // Get category from URL on mount
    useEffect(() => {
        const category = searchParams.get('category')
        if (category) {
            setSelectedCategory(category)
        }
    }, [searchParams])

    // RTK Query hooks
    const { data, isLoading, isError } = useGetCoursesQuery({ page: 1, limit: 400 })
    const { data: categories = [] } = useGetCategoriesQuery()

    // Filter courses by search and category
    const courses = data?.courses || []
    const filteredCourses = courses.filter(course => {
        const matchesSearch = !searchQuery ||
            course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory = !selectedCategory ||
            course.category?.toLowerCase() === selectedCategory.toLowerCase()

        return matchesSearch && matchesCategory
    })

    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
        if (category) {
            setSearchParams({ category })
        } else {
            setSearchParams({})
        }
    }

    return (
        <div className="courses-page">
            <div className="courses-container">
                {/* Header */}
                <div className="courses-header">
                    <h1 className="courses-title">
                        {selectedCategory || 'All Courses'}
                    </h1>
                    <p className="courses-subtitle">
                        {selectedCategory
                            ? `Explore courses in ${selectedCategory}`
                            : 'Explore our collection of courses and start learning today.'
                        }
                    </p>
                </div>

                {/* Filters */}
                <div className="courses-filters">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="courses-search"
                    />

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="courses-select"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Category Pills */}
                {categories.length > 0 && (
                    <div className="category-pills">
                        <button
                            className={`category-pill ${!selectedCategory ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('')}
                        >
                            All
                        </button>
                        {categories.slice(0, 8).map((cat, index) => (
                            <button
                                key={index}
                                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Courses Grid */}
                {isLoading ? (
                    <div className="courses-loading">
                        <div className="spinner"></div>
                        <p>Loading courses...</p>
                    </div>
                ) : isError ? (
                    <div className="courses-error">
                        Failed to load courses
                    </div>
                ) : (
                    <>
                        <p className="courses-count">{filteredCourses.length} courses found</p>
                        <div className="courses-grid">
                            {filteredCourses.map((course) => (
                                <CourseCard key={course.course_id} course={course} />
                            ))}
                        </div>
                        {filteredCourses.length === 0 && (
                            <div className="courses-empty">
                                <p>No courses found matching your criteria.</p>
                                <button onClick={() => {
                                    setSearchQuery('')
                                    handleCategoryChange('')
                                }}>Clear filters</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Courses
