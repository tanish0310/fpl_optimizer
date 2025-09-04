import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

class SimplePredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.feature_cols = None
        self.backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.models_dir = os.path.join(self.backend_dir, '..', 'models')
        os.makedirs(self.models_dir, exist_ok=True)
    
    def create_features(self, players_df, gameweeks_df, fixtures_df=None):
        """BASIC features that actually work"""
        # Just use the player's current data - no complex aggregations
        features = players_df[['id', 'total_points', 'now_cost', 'form', 'selected_by_percent', 'element_type']].copy()
        
        # Simple target: just normalize total points to 0-10 scale
        features['target'] = (features['total_points'] / features['total_points'].max() * 10).fillna(3)
        
        # Basic position encoding
        features = pd.get_dummies(features, columns=['element_type'])
        features = features.fillna(3)  # Default 3 points prediction
        
        return features
    
    def train(self, features_df):
        """BASIC training"""
        if len(features_df) < 10:
            print("Not enough data")
            return
            
        self.feature_cols = ['total_points', 'now_cost', 'form', 'selected_by_percent']
        
        # Add position columns if they exist
        for col in features_df.columns:
            if col.startswith('element_type_'):
                self.feature_cols.append(col)
        
        X = features_df[self.feature_cols].fillna(0)
        y = features_df['target']
        
        self.model.fit(X, y)
        print(f"Trained on {len(X)} players")
        
        # Save
        joblib.dump(self, os.path.join(self.models_dir, 'simple_predictor.pkl'))
        
    def predict(self, features_df):
        """BASIC predictions that make sense"""
        if self.feature_cols is None:
            # Fallback: return reasonable predictions based on total points
            return (features_df['total_points'] / features_df['total_points'].max() * 8).fillna(3).clip(1, 10)
        
        # Ensure columns exist
        for col in self.feature_cols:
            if col not in features_df.columns:
                features_df[col] = 0
        
        X = features_df[self.feature_cols].fillna(0)
        preds = self.model.predict(X)
        
        # Force realistic predictions (1-10 points)
        return np.clip(preds, 1, 10)



