from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# Database engine-specific configurations
engine_args = {}
if settings.DB_ENGINE == "sqlite":
    engine_args = {"connect_args": {"check_same_thread": False}}
elif settings.DB_ENGINE in ["postgresql", "mysql"]:
    engine_args = {"pool_pre_ping": True, "pool_recycle": 300}

engine = create_engine(
    settings.DB_URL,
    **engine_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()