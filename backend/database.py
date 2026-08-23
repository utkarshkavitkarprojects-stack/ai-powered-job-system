import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

# Render:
#   DATABASE_URL = PostgreSQL connection string
#
# Local development:
#   Falls back to SQLite automatically.
DATABASE_URL = os.getenv("DATABASE_URL")


if DATABASE_URL:
    # Render PostgreSQL
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
    )

else:
    # Local SQLite
    DATABASE_URL = f"sqlite:///{BASE_DIR / 'jobs.db'}"

    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False
        },
    )


# ============================================================
# SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ============================================================
# BASE MODEL
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()