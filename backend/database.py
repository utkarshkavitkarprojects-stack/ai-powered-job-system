from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# backend/
BASE_DIR = Path(__file__).resolve().parent

# SQLite database will be created at:
# backend/jobs.db
DATABASE_URL = f"sqlite:///{BASE_DIR / 'jobs.db'}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()