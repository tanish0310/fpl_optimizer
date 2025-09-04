from pydantic import BaseModel
from typing import List, Optional

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
