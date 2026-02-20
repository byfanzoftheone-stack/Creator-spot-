from pydantic import BaseModel
import os

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days
    # Comma-separated list of allowed origins, e.g.
    # CORS_ORIGINS="https://your-frontend.vercel.app,https://yourdomain.com"
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
    # Optional regex for dynamic preview URLs, e.g.
    # CORS_ORIGIN_REGEX="https://.*\\.vercel\\.app"
    CORS_ORIGIN_REGEX: str = os.getenv("CORS_ORIGIN_REGEX", "")

settings = Settings()
