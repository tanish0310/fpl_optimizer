from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import joblib
import os
import sys
import traceback
import logging

# Setup detailed logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Get the absolute path to the backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
core_dir = os.path.join(backend_dir, 'core')
api_dir = os.path.join(backend_dir, 'api')

# Add paths to Python path
sys.path.insert(0, backend_dir)
sys.path.insert(0, core_dir)
sys.path.insert(0, api_dir)

# Import local modules
from data_collector import SimpleFPLCollector
from optimizer import FPLOptimizer

# Define models directly in main.py
class Player(BaseModel):
    id: int
    name: str
    position: str
    team: str
    price: float
    predicted_points: float

class OptimizationRequest(BaseModel):
    budget: float = 100.0
    exclude_players: List[int] = []
    formation_preference: Optional[str] = None

class TeamResponse(BaseModel):
    status: str
    players: List[Player]
    total_cost: float
    total_predicted_points: float
    remaining_budget: float

# Global variables
predictor = None
optimizer = None
current_players = None
current_predictions = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Enhanced lifespan event handler with fixture difficulty"""
    # Startup
    global predictor, optimizer, current_players, current_predictions
    
    logger.info("🚀 Starting Enhanced FPL Optimizer API...")
    
    # Load or collect player data
    try:
        players_path = os.path.join(backend_dir, '..', 'data', 'players.csv')
        current_players = pd.read_csv(players_path)
        logger.info(f"✅ Loaded {len(current_players)} players")
    except FileNotFoundError:
        logger.info("📥 Collecting fresh player data...")
        data_dir = os.path.join(backend_dir, '..', 'data')
        models_dir = os.path.join(backend_dir, '..', 'models')
        os.makedirs(data_dir, exist_ok=True)
        os.makedirs(models_dir, exist_ok=True)
        
        collector = SimpleFPLCollector()
        current_players = collector.get_all_data()
        gameweeks = collector.get_player_history(max_players=300)  # More data
        fixtures = collector.get_fixtures()
    
    # Load or train enhanced model
    try:
        model_path = os.path.join(backend_dir, '..', 'models', 'enhanced_predictor.pkl')
        predictor = joblib.load(model_path)
        logger.info("✅ Loaded enhanced trained model")
        
        # Verify model has required attributes
        if not hasattr(predictor, 'models') or not predictor.models:
            raise FileNotFoundError("Model missing position-specific models")
            
    except FileNotFoundError:
        logger.info("🤖 Training enhanced position-specific model...")
        
        # Import the enhanced predictor
        try:
            from predictor import EnhancedPredictor
        except ImportError:
            # Fallback to simple predictor if enhanced not available
            logger.warning("Enhanced predictor not found, using simple predictor")
            from predictor import SimplePredictor

        predictor = SimplePredictor()
        
        # Load required data
        try:
            gameweeks_path = os.path.join(backend_dir, '..', 'data', 'gameweeks.csv')
            gameweeks = pd.read_csv(gameweeks_path)
            
            fixtures_path = os.path.join(backend_dir, '..', 'data', 'fixtures.csv')
            if os.path.exists(fixtures_path):
                fixtures = pd.read_csv(fixtures_path)
            else:
                logger.info("📥 Collecting fixture data...")
                collector = SimpleFPLCollector()
                fixtures = collector.get_fixtures()
                
        except FileNotFoundError:
            logger.info("📥 Collecting missing data...")
            collector = SimpleFPLCollector()
            gameweeks = collector.get_player_history(max_players=300)
            fixtures = collector.get_fixtures()
        
        # Create enhanced features and train
        logger.info("🔧 Creating enhanced features...")
        features = predictor.create_features(current_players, gameweeks, fixtures)
        
        if not features.empty:
            logger.info("🎯 Training position-specific models...")
            predictor.train(features)
        else:
            logger.error("❌ No features created, cannot train model")
            raise ValueError("Failed to create training features")
    
    # Initialize optimizer
    optimizer = FPLOptimizer()
    
    # Generate predictions with enhanced model
    try:
        gameweeks_path = os.path.join(backend_dir, '..', 'data', 'gameweeks.csv')
        gameweeks = pd.read_csv(gameweeks_path)
        
        fixtures_path = os.path.join(backend_dir, '..', 'data', 'fixtures.csv')
        if os.path.exists(fixtures_path):
            fixtures = pd.read_csv(fixtures_path)
        else:
            collector = SimpleFPLCollector()
            fixtures = collector.get_fixtures()
            
    except FileNotFoundError:
        logger.info("📥 Collecting data for predictions...")
        collector = SimpleFPLCollector()
        gameweeks = collector.get_player_history(max_players=300)
        fixtures = collector.get_fixtures()
    
    # Generate current predictions
    logger.info("🔮 Generating enhanced predictions...")
    features = predictor.create_features(current_players, gameweeks, fixtures)
    
    if not features.empty and 'id' in features.columns:
        predictions_array = predictor.predict(features)
        current_predictions = dict(zip(features['id'], predictions_array))
        logger.info(f"✅ Generated {len(current_predictions)} predictions")
    else:
        logger.error("❌ Could not generate predictions")
        current_predictions = {}
    
    logger.info("🎉 Enhanced FPL Optimizer API ready!")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Enhanced FPL Optimizer API...")

app = FastAPI(
    title="Enhanced FPL Optimizer API",
    description="AI-powered Fantasy Premier League team optimizer with fixture difficulty and position-specific models",
    version="2.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Enhanced CORS configuration for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    """Enhanced health check endpoint"""
    model_status = "loaded" if predictor and hasattr(predictor, 'models') else "not loaded"
    predictions_count = len(current_predictions) if current_predictions else 0
    
    return {
        "status": "healthy", 
        "message": "Enhanced FPL Optimizer API is running",
        "model_status": model_status,
        "predictions_available": predictions_count,
        "version": "2.1.0"
    }

@app.get("/api/players")
async def get_players():
    """Get all players with enhanced predictions"""
    if current_players is None:
        raise HTTPException(status_code=500, detail="Player data not loaded")
    
    players_with_predictions = current_players.copy()
    players_with_predictions['predicted_points'] = players_with_predictions['id'].map(
        lambda x: current_predictions.get(x, 0)
    )
    
    # Add enhanced value calculation
    players_with_predictions['value'] = (
        players_with_predictions['predicted_points'] / 
        (players_with_predictions['now_cost'] / 10)
    ).round(2)
    
    # Add prediction confidence (higher for players with more data)
    players_with_predictions['prediction_confidence'] = players_with_predictions['total_points'].apply(
        lambda x: min(1.0, x / 50.0)  # Scale confidence based on total points
    ).round(2)
    
    return players_with_predictions.to_dict('records')

@app.post("/api/optimize", response_model=TeamResponse)
async def optimize_team(request: OptimizationRequest):
    """Enhanced team optimization with detailed logging"""
    try:
        logger.info(f"🔍 Received optimization request: budget={request.budget}, exclude={request.exclude_players}")
        
        if optimizer is None or current_predictions is None:
            logger.error("❌ Optimizer or predictions not initialized")
            raise HTTPException(status_code=500, detail="Optimizer not initialized")
        
        logger.info(f"✅ Have {len(current_predictions)} player predictions")
        logger.info(f"✅ Current players shape: {current_players.shape}")
        
        # Filter predictions based on exclude list
        filtered_predictions = {
            pid: score for pid, score in current_predictions.items() 
            if pid not in request.exclude_players
        }
        
        logger.info(f"✅ Filtered to {len(filtered_predictions)} eligible players")
        
        # Add prediction quality check
        valid_predictions = {k: v for k, v in filtered_predictions.items() if v > 0}
        if len(valid_predictions) < 50:
            logger.warning(f"⚠️ Only {len(valid_predictions)} players have positive predictions")
        
        # Run optimization
        result = optimizer.optimize_team(current_players, filtered_predictions)
        
        logger.info(f"🔍 Optimization status: {result.get('status', 'Unknown')}")
        
        if result['status'] != 'Optimal':
            logger.error(f"❌ Optimization failed: {result}")
            raise HTTPException(status_code=400, detail=f"Optimization failed: {result}")
        
        logger.info(f"✅ Found {len(result['players'])} players in optimal team")
        
        # Debug: Print first player data structure
        if result['players']:
            logger.info(f"🔍 Sample player data: {result['players'][0]}")
        
        # Enhanced player data conversion with validation
        players_data = []
        for i, player_data in enumerate(result['players']):
            try:
                logger.debug(f"Processing player {i+1}: {player_data}")
                
                # Enhanced type conversion with validation
                player_data['team'] = str(player_data['team'])
                player_data['price'] = float(player_data['price'])
                player_data['predicted_points'] = max(0.0, float(player_data['predicted_points']))
                
                # Validate required fields
                required_fields = ['id', 'name', 'position', 'team', 'price', 'predicted_points']
                for field in required_fields:
                    if field not in player_data:
                        raise ValueError(f"Missing required field: {field}")
                
                players_data.append(Player(**player_data))
                
            except Exception as e:
                logger.error(f"❌ Error creating Player object for player {i+1}: {e}")
                logger.error(f"Player data: {player_data}")
                raise
        
        # Enhanced response with validation
        response = TeamResponse(
            status=result['status'],
            players=players_data,
            total_cost=float(result['total_cost']),
            total_predicted_points=float(result['total_predicted_points']),
            remaining_budget=float(result['remaining_budget'])
        )
        
        logger.info(f"✅ Successfully created enhanced response with {len(response.players)} players")
        
        # Log team composition for validation
        positions = {}
        for player in response.players:
            positions[player.position] = positions.get(player.position, 0) + 1
        
        logger.info(f"📊 Team composition: {positions}")
        
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log the full error details
        logger.error(f"💥 OPTIMIZATION ERROR: {e}")
        logger.error(f"💥 Full traceback:")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.get("/api/analytics/position-stats")
async def get_position_analytics():
    """Enhanced analytics with position-specific insights"""
    if current_players is None or current_predictions is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    analytics_data = current_players.copy()
    analytics_data['predicted_points'] = analytics_data['id'].map(
        lambda x: current_predictions.get(x, 0)
    )
    analytics_data['price'] = analytics_data['now_cost'] / 10
    
    # Enhanced position statistics
    position_stats = analytics_data.groupby('position_name').agg({
        'predicted_points': ['mean', 'max', 'std', 'count'],
        'price': ['mean', 'max', 'min'],
        'total_points': ['mean', 'max'],
        'form': 'mean',
        'selected_by_percent': 'mean'
    }).round(2)
    
    position_stats.columns = ['_'.join(col).strip() for col in position_stats.columns]
    
    # Add value metrics
    result = position_stats.reset_index()
    result['avg_value'] = (result['predicted_points_mean'] / result['price_mean']).round(2)
    
    return result.to_dict('records')

@app.get("/api/top-players/{position}")
async def get_top_players(position: str, limit: int = 10):
    """Enhanced top players with prediction insights"""
    if current_players is None or current_predictions is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # Filter by position
    position_players = current_players[current_players['position_name'] == position.upper()].copy()
    
    # Add predictions and enhanced metrics
    position_players['predicted_points'] = position_players['id'].map(
        lambda x: current_predictions.get(x, 0)
    )
    
    position_players['value'] = (
        position_players['predicted_points'] / (position_players['now_cost'] / 10)
    ).round(2)
    
    position_players['form_score'] = (
        position_players['form'].astype(float) * 0.3 + 
        position_players['predicted_points'] * 0.7
    ).round(2)
    
    # Get top players by predicted points
    top_players = position_players.nlargest(limit, 'predicted_points')
    
    return top_players[[
        'id', 'web_name', 'team', 'now_cost', 'total_points', 
        'predicted_points', 'value', 'form', 'form_score'
    ]].to_dict('records')

@app.post("/api/refresh-data")
async def refresh_data():
    """Enhanced data refresh with fixture updates"""
    try:
        logger.info("🔄 Refreshing FPL data...")
        
        collector = SimpleFPLCollector()
        global current_players, current_predictions
        
        # Refresh all data sources
        current_players = collector.get_all_data()
        gameweeks = collector.get_player_history(max_players=300)
        fixtures = collector.get_fixtures()
        
        # Regenerate enhanced predictions
        if predictor:
            features = predictor.create_features(current_players, gameweeks, fixtures)
            predictions_array = predictor.predict(features)
            current_predictions = dict(zip(features['id'], predictions_array))
            
            logger.info(f"✅ Refreshed {len(current_predictions)} predictions")
        
        return {
            "message": "Enhanced data refreshed successfully",
            "players_updated": len(current_players),
            "predictions_updated": len(current_predictions)
        }
        
    except Exception as e:
        logger.error(f"❌ Data refresh failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model-info")
async def get_model_info():
    """Get information about the trained model"""
    if predictor is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    model_info = {
        "model_type": "Enhanced Position-Specific Random Forest",
        "version": "2.1.0",
        "features_used": len(predictor.feature_cols) if predictor.feature_cols else 0,
        "position_models": {}
    }
    
    if hasattr(predictor, 'models'):
        position_names = {1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD'}
        for pos_num, model in predictor.models.items():
            pos_name = position_names.get(pos_num, f"Position_{pos_num}")
            model_info["position_models"][pos_name] = {
                "n_estimators": model.n_estimators if hasattr(model, 'n_estimators') else "Unknown",
                "trained": True
            }
    
    return model_info

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)





