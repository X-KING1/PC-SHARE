// Course Model - All course-related database operations
import { getConnection } from '../config/oracle.js';

export const Course = {
    // Count total courses
    count: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute('SELECT COUNT(*) FROM courses');
            return result.rows[0][0];
        } finally {
            await connection.close();
        }
    },

    // Find all courses with pagination
    findAll: async (offset, limit) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT course_id, title, description, category, subcategory, course_level, instructor, youtube_url 
                 FROM courses 
                 ORDER BY course_id 
                 OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
                { offset, limit }
            );

            const columns = ['course_id', 'title', 'description', 'category', 'subcategory', 'level', 'instructor', 'youtube_url'];
            return result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });
        } finally {
            await connection.close();
        }
    },

    // Find single course by ID
    findById: async (id) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT course_id, title, description, category, subcategory, course_level, instructor, youtube_url, duration_minutes, rating 
                 FROM courses WHERE course_id = :id`,
                { id }
            );

            if (result.rows.length < 1) return null;

            const columns = ['course_id', 'title', 'description', 'category', 'subcategory', 'level', 'instructor', 'youtube_url', 'duration_minutes', 'rating'];
            const course = {};
            columns.forEach((col, i) => course[col] = result.rows[0][i]);
            return course;
        } finally {
            await connection.close();
        }
    },

    // Get all distinct categories
    getCategories: async () => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                'SELECT DISTINCT category FROM courses WHERE category IS NOT NULL ORDER BY category'
            );
            return result.rows.map(row => row[0]);
        } finally {
            await connection.close();
        }
    },

    // Find courses by category
    findByCategory: async (category) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT course_id, title, description, category, subcategory, course_level, instructor, youtube_url 
                 FROM courses WHERE category = :category ORDER BY title`,
                { category }
            );

            const columns = ['course_id', 'title', 'description', 'category', 'subcategory', 'level', 'instructor', 'youtube_url'];
            return result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });
        } finally {
            await connection.close();
        }
    },

    // Find similar courses (same category, different course)
    findSimilar: async (category, excludeId, limit = 10) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT course_id, title, category, subcategory, course_level, youtube_url, instructor 
                 FROM courses 
                 WHERE category = :category AND course_id != :excludeId 
                 ORDER BY DBMS_RANDOM.VALUE 
                 FETCH FIRST :limit ROWS ONLY`,
                { category, excludeId, limit }
            );

            const columns = ['course_id', 'title', 'category', 'subcategory', 'level', 'youtube_url', 'instructor'];
            return result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                obj.reason = 'Similar category';
                return obj;
            });
        } finally {
            await connection.close();
        }
    },

    // Find popular courses with interaction count
    findPopular: async (excludeId, limit = 10) => {
        const connection = await getConnection();
        try {
            const result = await connection.execute(
                `SELECT c.course_id, c.title, c.category, c.course_level, c.youtube_url, c.instructor, COUNT(ui.interaction_id) as interactions
                 FROM courses c
                 LEFT JOIN user_interactions ui ON c.course_id = ui.course_id
                 WHERE c.course_id != :excludeId
                 GROUP BY c.course_id, c.title, c.category, c.course_level, c.youtube_url, c.instructor
                 ORDER BY interactions DESC
                 FETCH FIRST :limit ROWS ONLY`,
                { excludeId, limit }
            );

            const columns = ['course_id', 'title', 'category', 'level', 'youtube_url', 'instructor', 'interactions'];
            return result.rows.map(row => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                obj.reason = 'Popular course';
                return obj;
            });
        } finally {
            await connection.close();
        }
    }
};
