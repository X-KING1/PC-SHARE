# YouTube API Video Finder for LearnHub
# This script finds relevant YouTube tutorial videos for courses without videos
# and updates the Oracle database

import os
import sys

# Set Oracle environment
os.environ['ORACLE_SID'] = 'LEARNHUB'

try:
    import oracledb as oracle_driver
    print("Using oracledb driver")
except ImportError:
    print("Please install oracledb: pip install oracledb")
    sys.exit(1)

try:
    from googleapiclient.discovery import build
except ImportError:
    print("Please install google-api-python-client: pip install google-api-python-client")
    sys.exit(1)

# ============================================================
# IMPORTANT: Get your YouTube API key from Google Cloud Console
# https://console.cloud.google.com/apis/credentials
# Enable "YouTube Data API v3" for your project
# ============================================================
YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY', 'YOUR_API_KEY_HERE')

# Oracle connection settings
ORACLE_DSN = "localhost:1521/orclpdb"
ORACLE_USER = "learnhub"
ORACLE_PASSWORD = "LearnHub123"

def get_youtube_service():
    """Create YouTube API service"""
    if YOUTUBE_API_KEY == 'YOUR_API_KEY_HERE':
        print("ERROR: Please set YOUTUBE_API_KEY environment variable")
        print("Get your API key from: https://console.cloud.google.com/apis/credentials")
        return None
    return build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

def search_youtube_video(youtube, query, max_results=1):
    """Search for a YouTube tutorial video"""
    try:
        request = youtube.search().list(
            q=f"{query} tutorial course",
            part='snippet',
            type='video',
            maxResults=max_results,
            videoDuration='medium',  # 4-20 minutes
            order='relevance'
        )
        response = request.execute()
        
        if response.get('items'):
            video = response['items'][0]
            video_id = video['id']['videoId']
            return {
                'video_id': video_id,
                'youtube_url': f"https://www.youtube.com/watch?v={video_id}",
                'title': video['snippet']['title']
            }
    except Exception as e:
        print(f"  Error searching: {e}")
    return None

def get_courses_without_videos(connection):
    """Get all courses that don't have YouTube URLs"""
    cursor = connection.cursor()
    cursor.execute("""
        SELECT course_id, title, subcategory, category
        FROM courses 
        WHERE youtube_url IS NULL
        ORDER BY course_id
    """)
    courses = cursor.fetchall()
    cursor.close()
    return courses

def update_course_video(connection, course_id, video_id, youtube_url):
    """Update course with YouTube video info"""
    cursor = connection.cursor()
    cursor.execute("""
        UPDATE courses 
        SET video_id = :1, youtube_url = :2
        WHERE course_id = :3
    """, [video_id, youtube_url, course_id])
    connection.commit()
    cursor.close()

def main():
    print("=" * 60)
    print("LEARNHUB - YouTube Video Finder")
    print("=" * 60)
    
    # Initialize YouTube API
    youtube = get_youtube_service()
    if not youtube:
        return
    
    # Connect to Oracle
    try:
        connection = oracle_driver.connect(
            user=ORACLE_USER,
            password=ORACLE_PASSWORD,
            dsn=ORACLE_DSN
        )
        print("✓ Connected to Oracle database")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return
    
    # Get courses without videos
    courses = get_courses_without_videos(connection)
    print(f"\nFound {len(courses)} courses without YouTube videos\n")
    
    # Process each course
    updated = 0
    for course_id, title, subcategory, category in courses:
        # Create search query from course info
        search_query = f"{subcategory} {category}".replace('&', 'and')
        
        print(f"[{course_id}] {title}")
        print(f"    Searching: '{search_query}'...")
        
        # Search YouTube
        result = search_youtube_video(youtube, search_query)
        
        if result:
            print(f"    ✓ Found: {result['title'][:50]}...")
            print(f"    URL: {result['youtube_url']}")
            
            # Update database
            update_course_video(connection, course_id, result['video_id'], result['youtube_url'])
            updated += 1
        else:
            print(f"    ✗ No video found")
        
        print()
    
    connection.close()
    
    print("=" * 60)
    print(f"COMPLETE: Updated {updated} of {len(courses)} courses")
    print("=" * 60)

if __name__ == '__main__':
    main()
