import requests
import pandas as pd
import json
import os
from datetime import datetime

class SimpleFPLCollector:
    def __init__(self):
        self.base_url = "https://fantasy.premierleague.com/api/"
        # Get the backend directory path
        self.backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.data_dir = os.path.join(self.backend_dir, '..', 'data')
        
        # Ensure data directory exists
        os.makedirs(self.data_dir, exist_ok=True)
    
    def get_all_data(self):
        """Get all player data"""
        print("📥 Fetching FPL player data...")
        
        bootstrap = requests.get(f"{self.base_url}bootstrap-static/").json()
        
        # Extract players with position names
        players = pd.DataFrame(bootstrap['elements'])
        players['position_name'] = players['element_type'].map({1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD'})
        
        # Save to CSV
        players_path = os.path.join(self.data_dir, 'players.csv')
        players.to_csv(players_path, index=False)
        print(f"✅ Saved {len(players)} players to {players_path}")
        
        return players
    
    def get_fixtures(self):
        """Get fixture data with difficulty ratings"""
        print("📥 Fetching fixture data...")
        
        try:
            fixtures_data = requests.get(f"{self.base_url}fixtures/").json()
            fixtures_df = pd.DataFrame(fixtures_data)
            
            fixtures_path = os.path.join(self.data_dir, 'fixtures.csv')
            fixtures_df.to_csv(fixtures_path, index=False)
            print(f"✅ Saved {len(fixtures_df)} fixtures to {fixtures_path}")
            
            return fixtures_df
        except Exception as e:
            print(f"❌ Error fetching fixtures: {e}")
            return pd.DataFrame()
    
    def get_player_history(self, max_players=500):  # INCREASED from 300
        """Get historical data for more players to fix insufficient data issue"""
        players_path = os.path.join(self.data_dir, 'players.csv')
        
        try:
            players = pd.read_csv(players_path)
        except FileNotFoundError:
            players = self.get_all_data()
        
        # Get more players by total points AND minutes (active players)
        active_players = players[players['minutes'] > 50]  # Players with game time
        top_players = active_players.nlargest(max_players, 'total_points')['id'].tolist()
        
        all_history = []
        
        print(f"📥 Collecting history for top {len(top_players)} active players...")
        
        for i, player_id in enumerate(top_players):
            if i % 50 == 0:
                print(f"Progress: {i+1}/{len(top_players)}")
            
            try:
                data = requests.get(f"{self.base_url}element-summary/{player_id}/").json()
                history = pd.DataFrame(data['history'])
                
                if not history.empty:
                    history['player_id'] = player_id
                    all_history.append(history)
                    
            except Exception as e:
                continue  # Skip failed requests
        
        if all_history:
            gameweeks_df = pd.concat(all_history, ignore_index=True)
            gameweeks_path = os.path.join(self.data_dir, 'gameweeks.csv')
            gameweeks_df.to_csv(gameweeks_path, index=False)
            print(f"✅ Saved {len(gameweeks_df)} gameweek records to {gameweeks_path}")
            return gameweeks_df
        else:
            print("❌ No gameweek data collected")
            return pd.DataFrame()
    # In your data collector
    def get_team_mapping(self):
        bootstrap = requests.get(f"{self.base_url}bootstrap-static/").json()
        teams = {team['id']: team['name'] for team in bootstrap['teams']}
        return teams



