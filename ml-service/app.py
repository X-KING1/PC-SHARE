"""
LearnHub ML Microservice - Flask API Entry Point
Port: 5001

This microservice provides ML-based course recommendations.
The Node.js backend (port 5000) calls this service for recommendations.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

# Import the recommendation system class
from recommendation import FinalRecommendationSystem

app = Flask(__name__)
CORS(app)

# Initialize the recommendation system
print("🔄 Loading recommendation system...")
recommender = FinalRecommendationSystem()
print("✅ Recommendation system loaded!")

# =============================================================================
# Health Check Endpoint
# =============================================================================
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for the ML service."""
    return jsonify({
        'success': True,
        'service': 'LearnHub ML Service',
        'status': 'healthy',
        'port': 5001
    })

# =============================================================================
# Recommendation Endpoints
# =============================================================================
@app.route('/api/recommendations/<int:user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    """
    Get personalized course recommendations for a user.
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        course_id = request.args.get('course_id', None, type=int)
        
        recs_df = recommender.get_personalized_recommendations(user_id, course_id, n=limit)
        recommendations = recs_df.to_dict('records') if not recs_df.empty else []
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/recommendations/similar/<int:course_id>', methods=['GET'])
def get_similar_courses(course_id):
    """
    Get similar courses to a given course (content-based).
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        
        similar_df = recommender.get_similar_courses(course_id, n=limit)
        similar_courses = similar_df.to_dict('records') if not similar_df.empty else []
        
        return jsonify({
            'success': True,
            'course_id': course_id,
            'similar_courses': similar_courses
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/recommendations/hybrid/<int:user_id>/<int:course_id>', methods=['GET'])
def get_hybrid_recs(user_id, course_id):
    """
    Get hybrid recommendations combining collaborative filtering and content-based.
    """
    try:
        n_similar = request.args.get('n_similar', 5, type=int)
        n_personalized = request.args.get('n_personalized', 10, type=int)
        
        recs = recommender.get_course_page_recommendations(
            user_id, course_id, n_similar, n_personalized
        )
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'course_id': course_id,
            'similar_courses': recs.get('similar_courses', []),
            'recommended_for_you': recs.get('recommended_for_you', [])
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

# =============================================================================
# Run the Flask App
# =============================================================================
if __name__ == '__main__':
    print("🤖 Starting LearnHub ML Microservice on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
