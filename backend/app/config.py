from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "ScamSense API"
    VERSION: str = "1.0.0"

    ENV: str = "development"
    DEBUG: bool = True

    MODEL_NAME: str = "google/muril-base-cased"

    DATABASE_URL: str = "sqlite:///./scamsense.db"

    VT_API_KEY: str = ""
    URLSCAN_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()