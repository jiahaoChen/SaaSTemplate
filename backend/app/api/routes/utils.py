from typing import Any
from fastapi import APIRouter, Depends
from pydantic.networks import EmailStr

from app.api.deps import get_current_active_superuser, CurrentUser
from app.models import Message
from app.utils import generate_test_email, send_email
from app.core.config import settings

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post(
    "/test-email/",
    dependencies=[Depends(get_current_active_superuser)],
    status_code=201,
)
def test_email(email_to: EmailStr) -> Message:
    """
    Test emails.
    """
    email_data = generate_test_email(email_to=email_to)
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")


@router.get("/health-check/")
async def health_check() -> bool:
    return True


@router.get("/gemini-models", response_model=list[str])
def get_available_gemini_models(
    current_user: CurrentUser,  # Requires authentication
) -> Any:
    """
    Retrieve the list of available Gemini models configured in the system.
    """
    return settings.AVAILABLE_GEMINI_MODELS
