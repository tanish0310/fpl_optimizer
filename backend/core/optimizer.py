import pandas as pd
import pulp
from typing import Dict, List

class FPLOptimizer:
    def __init__(self):
        self.budget = 100.0
        self.formation = {
            'GKP': 2, 'DEF': 5, 'MID': 5, 'FWD': 3
        }
        self.max_per_team = 3
    
    def optimize_team(self, players_df: pd.DataFrame, predictions: Dict[int, float]) -> Dict:
        """Simple team optimization"""
        
        # Filter to players with predictions
        available_players = players_df[players_df['id'].isin(predictions.keys())].copy()
        available_players['predicted_points'] = available_players['id'].map(predictions)
        available_players['price'] = available_players['now_cost'] / 10  # Convert to millions
        
        # Create problem
        prob = pulp.LpProblem("FPL_Team", pulp.LpMaximize)
        
        # Decision variables
        player_vars = {}
        for idx, row in available_players.iterrows():
            player_vars[row['id']] = pulp.LpVariable(f"player_{row['id']}", cat='Binary')
        
        # Objective: maximize predicted points
        prob += pulp.lpSum([
            available_players[available_players['id'] == pid]['predicted_points'].iloc[0] * var
            for pid, var in player_vars.items()
        ])
        
        # Constraints
        
        # Budget constraint
        prob += pulp.lpSum([
            available_players[available_players['id'] == pid]['price'].iloc[0] * var
            for pid, var in player_vars.items()
        ]) <= self.budget
        
        # Position constraints
        for position, count in self.formation.items():
            position_players = available_players[available_players['position_name'] == position]['id'].tolist()
            prob += pulp.lpSum([player_vars[pid] for pid in position_players if pid in player_vars]) == count
        
        # Team constraint (max 3 from same team)
        for team in available_players['team'].unique():
            team_players = available_players[available_players['team'] == team]['id'].tolist()
            prob += pulp.lpSum([player_vars[pid] for pid in team_players if pid in player_vars]) <= self.max_per_team
        
        # Solve
        prob.solve(pulp.PULP_CBC_CMD(msg=0))
        
        # Extract solution
        selected_players = []
        total_cost = 0
        total_predicted_points = 0
        
        for pid, var in player_vars.items():
            if var.value() == 1:
                player_info = available_players[available_players['id'] == pid].iloc[0]
                selected_players.append({
                    'id': pid,
                    'name': player_info['web_name'],
                    'position': player_info['position_name'],
                    'team': player_info['team'],
                    'price': player_info['price'],
                    'predicted_points': predictions[pid]
                })
                total_cost += player_info['price']
                total_predicted_points += predictions[pid]
        
        return {
            'status': 'Optimal' if prob.status == pulp.LpStatusOptimal else 'Failed',
            'players': sorted(selected_players, key=lambda x: x['position']),
            'total_cost': round(total_cost, 1),
            'total_predicted_points': round(total_predicted_points, 1),
            'remaining_budget': round(self.budget - total_cost, 1)
        }
