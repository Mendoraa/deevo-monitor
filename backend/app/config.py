"""Application configuration — loaded from environment variables."""

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://deevo:deevo_secret@db:5432/deevo_cortex",
)
DATABASE_URL_SYNC = os.getenv(
    "DATABASE_URL_SYNC",
    "postgresql://deevo:deevo_secret@db:5432/deevo_cortex",
)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
APP_ENV = os.getenv("APP_ENV", "development")
