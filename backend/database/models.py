from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from .db_setup import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    steam_id = Column(String, nullable=True)
    is_admin = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserGameStats(Base):
    __tablename__ = "user_game_stats"
    id = Column(Integer, primary_key=True, index=True)
    steam_id = Column(String, index=True)
    app_id = Column(Integer, index=True)
    game_name = Column(String)
    achievements_unlocked = Column(Integer)
    total_achievements = Column(Integer)
    playtime_hours = Column(Integer)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())