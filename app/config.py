from pydantic_settings import BaseSettings
from pydantic import Field, PostgresDsn, MySQLDsn, field_validator
from pathlib import Path
from typing import Optional, Union

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "My FastAPI App"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    RELOAD: bool = False
    
    # Files settings
    BASE_DIR: str = str(Path(__file__).parent.parent)  # Better base path resolution
    FRONTEND_DIR: str = "out"
    
    # Database config
    DB_ENGINE: str = "sqlite"
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_NAME: str = "app.db"
    DB_PATH: str = "db"  # Relative to BASE_DIR

    @property
    def DB_URL(self) -> str:
        """Generate the appropriate database URL based on the engine."""
        db_path = str(Path(self.BASE_DIR) / Path(self.DB_PATH) / self.DB_NAME)
        if self.DB_ENGINE == "sqlite":
            return f"sqlite:///{db_path}"
        elif self.DB_ENGINE == "postgresql":
            if not all([self.DB_HOST, self.DB_PORT, self.DB_USER, self.DB_PASSWORD]):
                raise ValueError("Missing required PostgreSQL configuration")
            return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        elif self.DB_ENGINE == "mysql":
            if not all([self.DB_HOST, self.DB_PORT, self.DB_USER, self.DB_PASSWORD]):
                raise ValueError("Missing required MySQL configuration")
            return f"mysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        else:
            raise ValueError(f"Unsupported database engine: {self.DB_ENGINE}")

    @property
    def FRONTEND_PATH(self) -> Path:
        """Get absolute path to frontend directory."""
        return Path(self.BASE_DIR) / self.FRONTEND_DIR

    class Config:
        env_file = ".env"  # Standard convention is to use .env
        env_file_encoding = "utf-8"
        extra = "forbid"  # Prevent extra fields

    @field_validator('DB_PATH', 'FRONTEND_DIR', mode='before')
    def validate_paths(cls, v: str) -> str:
        """Ensure paths exist and return absolute paths."""
        if v:
            path = Path(v)
            path.mkdir(parents=True, exist_ok=True)
            return str(path.absolute())
        return v

# Create an instance of Settings
settings = Settings()