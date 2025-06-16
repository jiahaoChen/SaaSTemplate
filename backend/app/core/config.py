import secrets
import warnings
from typing import Any, Literal, cast

from pydantic import (
    AnyUrl,
    EmailStr,
    Field,
    HttpUrl,
    TypeAdapter,
    computed_field,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Use top level .env file (one level above ./backend/)
        env_file="../.env",
        env_ignore_empty=True,
        extra="ignore",
    )
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    FRONTEND_HOST: str = "http://localhost:8001"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    # Read BACKEND_CORS_ORIGINS from .env as a simple string
    # Use alias to map the environment variable name
    BACKEND_CORS_ORIGINS_STR: str = Field(default="", alias="BACKEND_CORS_ORIGINS")

    @computed_field  # type: ignore[prop-decorator]
    @property
    def BACKEND_CORS_ORIGINS(self) -> list[AnyUrl]:
        """
        Parses the _BACKEND_CORS_ORIGINS_STR (from .env) into a list of AnyUrl.
        Handles comma-separated strings and potential colon escaping.
        """
        raw_str = cast(str, self.BACKEND_CORS_ORIGINS_STR)

        def unescape_url(url_str: str) -> str:
            # Corrects '\\x3a' back to ':'
            return url_str.replace('\\x3a', ':')

        if not raw_str:
            return []

        # Split the comma-separated string and unescape each part
        # Handles "url1,url2,url3" -> unescaped ["url1", "url2", "url3"]
        # Handles "single_url" -> unescaped ["single_url"]
        parts = [i.strip() for i in raw_str.split(",")]
        str_list = [unescape_url(p) for p in parts]
        
        # Validate the list of strings into list[AnyUrl]
        # This will raise ValidationError if any URL is invalid after unescaping.
        list_any_url_adapter = TypeAdapter(list[AnyUrl])
        try:
            return list_any_url_adapter.validate_python(str_list)
        except Exception as e:
            # Log or handle the error appropriately if needed
            # For now, re-raise to see Pydantic's detailed error
            warnings.warn(f"Error validating BACKEND_CORS_ORIGINS: {e}. Input string list: {str_list}", stacklevel=1)
            raise

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        # Ensure BACKEND_CORS_ORIGINS is accessed as the property, not the internal string
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]

    PROJECT_NAME: str
    SENTRY_DSN: HttpUrl | None = None
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # Return string directly instead of MultiHostUrl object
        return f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_PORT: int = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: EmailStr | None = None
    EMAILS_FROM_NAME: EmailStr | None = None

    @model_validator(mode="after")
    def _set_default_emails_from(self) -> Self:
        if not self.EMAILS_FROM_NAME:
            self.EMAILS_FROM_NAME = self.PROJECT_NAME
        return self



    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48

    @computed_field  # type: ignore[prop-decorator]
    @property
    def emails_enabled(self) -> bool:
        return bool(self.SMTP_HOST and self.EMAILS_FROM_EMAIL)

    EMAIL_TEST_USER: EmailStr = "test@example.com"
    FIRST_SUPERUSER: EmailStr
    FIRST_SUPERUSER_PASSWORD: str

    def _check_default_secret(self, var_name: str, value: str | None) -> None:
        if value == "changethis":
            message = (
                f'The value of {var_name} is "changethis", '
                "for security, please change it, at least for deployments."
            )
            if self.ENVIRONMENT == "local":
                warnings.warn(message, stacklevel=1)
            else:
                raise ValueError(message)

    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self:
        self._check_default_secret("SECRET_KEY", self.SECRET_KEY)
        self._check_default_secret("POSTGRES_PASSWORD", self.POSTGRES_PASSWORD)
        self._check_default_secret(
            "FIRST_SUPERUSER_PASSWORD", self.FIRST_SUPERUSER_PASSWORD
        )

        return self


settings = Settings()  # type: ignore
