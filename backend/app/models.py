import uuid
from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import JSON


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    gemini_api_key: str | None = Field(default=None, max_length=255)
    preferred_gemini_model: str | None = Field(default="gemini-2.5-pro-preview-05-06", max_length=255, description="User's preferred Gemini model for generating mindmaps")


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)
    gemini_api_key: str | None = Field(default=None, max_length=255)
    preferred_gemini_model: str | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    __tablename__ = "user"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner")
    # 新增 MindMap 關聯，每個使用者可擁有多個思維導圖
    mindmaps: list["MindMap"] = Relationship(back_populates="owner")

# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


# ==========================================
# MindMap models for YouTube video mindmaps
# ==========================================

class MindMapBase(SQLModel):
    youtube_video_id: str = Field(max_length=20, description="Unique video ID from YouTube URL")
    youtube_url: str = Field(max_length=255, description="Full YouTube URL")
    video_title: str = Field(max_length=255, description="Title of the YouTube video")
    video_publish_date: datetime | None = Field(default=None, description="Publication date of the YouTube video")
    one_sentence_summary: str | None = Field(default=None, description="Concise summary of the video content")
    main_points: str | None = Field(default=None, description="Key points extracted from the transcript")
    takeaways: str | None = Field(default=None, description="Major takeaways or lessons from the video")
    markmap: str | None = Field(default=None, description="Mindmap output in Markmap format")
    # Additional fields for video metadata from oEmbed API
    author_name: str | None = Field(default=None, max_length=255, description="Name of the YouTube video author/channel")
    author_url: str | None = Field(default=None, max_length=255, description="URL to the YouTube channel")
    thumbnail_url: str | None = Field(default=None, max_length=255, description="URL to the video thumbnail image")
    video_metadata: dict | None = Field(default=None, description="Complete video metadata from the YouTube API", sa_type=JSON)
    is_public: bool = Field(default=False, description="Whether this mindmap is shared publicly")

class MindMap(MindMapBase, table=True):
    __tablename__ = "mindmap"
    id: int = Field(primary_key=True, default=None)  # SERIAL PRIMARY KEY
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )

    # Relationship with User: each MindMap is owned by one User
    owner: User | None = Relationship(back_populates="mindmaps")

class MindMapCreate(MindMapBase):
    """Schema for creating a new mindmap"""
    pass

class MindMapUpdate(SQLModel):
    """Schema for updating an existing mindmap"""
    youtube_video_id: str | None = Field(default=None, max_length=20)
    youtube_url: str | None = Field(default=None, max_length=255)
    video_title: str | None = Field(default=None, max_length=255)
    video_publish_date: datetime | None = Field(default=None)
    one_sentence_summary: str | None = Field(default=None)
    main_points: str | None = Field(default=None)
    takeaways: str | None = Field(default=None)
    markmap: str | None = Field(default=None)
    # Additional fields for video metadata
    author_name: str | None = Field(default=None, max_length=255)
    author_url: str | None = Field(default=None, max_length=255)
    thumbnail_url: str | None = Field(default=None, max_length=255)
    video_metadata: dict | None = Field(default=None, sa_type=JSON)

class MindMapPublic(MindMapBase):
    """Schema for public mindmap data"""
    id: int
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

class MindMapsPublic(SQLModel):
    """Schema for a collection of mindmaps"""
    data: list[MindMapPublic]
    count: int
