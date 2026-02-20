from pydantic import BaseModel

class StatsOut(BaseModel):
    total: int
    todo: int
    doing: int
    done: int
    done_today: int
    productivity_score: int
