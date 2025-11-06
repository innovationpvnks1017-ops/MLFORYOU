from pydantic import BaseSettings, Field, AnyUrl


class Settings(BaseSettings):
    SECRET_KEY: str = Field(..., min_length=32)
    DATABASE_URL: AnyUrl = Field(..., description="Database connection URL")
    API_BASE_URL: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    FRONTEND_URL: str = ""

    PORT: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
