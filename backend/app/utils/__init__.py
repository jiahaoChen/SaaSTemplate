# Export all YouTube utility functions for easier imports
# Export email utility functions
from app.utils.email import (
    EmailData,
    generate_new_account_email,
    generate_password_reset_token,
    generate_reset_password_email,
    generate_test_email,
    send_email,
    verify_password_reset_token,
)
from app.utils.youtube import (
    generate_mindmap,
    get_video_id,
    get_video_title,
    get_youtube_transcript,
    process_mindmap,
)

__all__ = [
    # YouTube utilities
    "get_video_id",
    "get_video_title",
    "get_youtube_transcript",
    "generate_mindmap",
    "process_mindmap",
    # Email utilities
    "generate_password_reset_token",
    "verify_password_reset_token",
    "send_email",
    "generate_test_email",
    "generate_reset_password_email",
    "generate_new_account_email",
    "EmailData",
]
