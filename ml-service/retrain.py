"""
CF Model Auto-Retrain Script
Run this daily/weekly to update the CF model with new Oracle data

Usage:
  python retrain_cf_model.py

Schedule with Windows Task Scheduler or cron job
"""
import cx_Oracle
import pandas as pd
import numpy as np
import pickle
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import svds
import os
from datetime import datetime

os.environ['ORACLE_HOME'] = r'C:\WINDOWS.X64_193000_db_home'

def retrain_cf_model():
    print("=" * 60)
    print(f"CF MODEL RETRAINING - {datetime.now()}")
    print("=" * 60)
    print()
    
    # 1. Load data from Oracle
    print("1. Loading data from Oracle...")
    conn = cx_Oracle.connect('learnhub', 'LearnHub123', '127.0.0.1:1521/orclpdb')
    cur = conn.cursor()
    
    # Get ratings
    cur.execute("""
        SELECT user_id, course_id, rating 
        FROM user_interactions 
        WHERE rating IS NOT NULL
    """)
    ratings = pd.DataFrame(cur.fetchall(), columns=['user_id', 'course_id', 'rating'])
    print(f"   Loaded {len(ratings)} ratings")
    print(f"   Users: {ratings['user_id'].nunique()}")
    print(f"   Courses: {ratings['course_id'].nunique()}")
    
    conn.close()
    
    # 2. Create user-item matrix
    print()
    print("2. Creating user-item matrix...")
    user_ids = ratings['user_id'].unique()
    course_ids = sorted(ratings['course_id'].unique())
    
    user_map = {uid: i for i, uid in enumerate(user_ids)}
    course_map = {cid: i for i, cid in enumerate(course_ids)}
    
    # Create sparse matrix
    rows = ratings['user_id'].map(user_map)
    cols = ratings['course_id'].map(course_map)
    data = ratings['rating'].values
    
    matrix = csr_matrix((data, (rows, cols)), shape=(len(user_ids), len(course_ids)))
    print(f"   Matrix shape: {matrix.shape}")
    
    # 3. Train SVD model
    print()
    print("3. Training SVD model...")
    k = min(50, min(matrix.shape) - 1)  # Number of latent factors
    U, sigma, Vt = svds(matrix.astype(float), k=k)
    sigma = np.diag(sigma)
    
    # Predict all ratings
    predictions_matrix = np.dot(np.dot(U, sigma), Vt)
    print(f"   Predictions shape: {predictions_matrix.shape}")
    
    # 4. Create predictions DataFrame
    print()
    print("4. Creating predictions DataFrame...")
    predictions_df = pd.DataFrame(
        predictions_matrix,
        index=user_ids,
        columns=course_ids
    )
    
    # Clip predictions to valid range
    predictions_df = predictions_df.clip(1, 5)
    
    # 5. Save model
    print()
    print("5. Saving model...")
    model = {
        'predictions': predictions_df,
        'user_map': user_map,
        'course_map': course_map,
        'trained_at': datetime.now().isoformat()
    }
    
    # Backup old model
    old_path = 'models/cf_advanced_model.pkl'
    backup_path = f'models/cf_advanced_model_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pkl'
    
    if os.path.exists(old_path):
        os.rename(old_path, backup_path)
        print(f"   Backed up old model to: {backup_path}")
    
    with open(old_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"   Saved new model to: {old_path}")
    
    print()
    print("=" * 60)
    print("CF MODEL RETRAINED SUCCESSFULLY!")
    print(f"   Users: {len(user_ids)}")
    print(f"   Courses: {len(course_ids)}")
    print("=" * 60)
    
    return True

if __name__ == '__main__':
    retrain_cf_model()
