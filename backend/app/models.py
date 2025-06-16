import uuid
from datetime import datetime
from typing import Annotated, Any

from pydantic import EmailStr
from sqlalchemy import String, Text, JSON
from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class UserBase(SQLModel):
    email: Annotated[str, Field(unique=True, index=True, max_length=255, sa_type=String(255))]
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    # Enhanced profile fields from mock data
    avatar: str | None = Field(default=None, max_length=500)
    signature: str | None = Field(default=None, max_length=255)
    title: str | None = Field(default=None, max_length=255)  # Job title
    group: str | None = Field(default=None, max_length=255)  # Organization group
    notify_count: int = Field(default=0)
    unread_count: int = Field(default=0)
    country: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)


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
    signature: str | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    __tablename__ = "user"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner")

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
        foreign_key="user.id", nullable=False
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


# Simple Notice/Notification model
class NoticeBase(SQLModel):
    title: str = Field(max_length=255)
    description: str | None = Field(default=None, max_length=500)
    avatar: str | None = Field(default=None, max_length=500)
    notice_type: str = Field(max_length=50)  # notification, message, event
    read: bool = Field(default=False)


class NoticeCreate(NoticeBase):
    pass


class Notice(NoticeBase, table=True):
    __tablename__ = "notice"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.now)


class NoticePublic(NoticeBase):
    id: uuid.UUID
    created_at: datetime


class NoticesPublic(SQLModel):
    data: list[NoticePublic]
    count: int


# Simple Rule model (for table list data)
class RuleBase(SQLModel):
    name: str = Field(max_length=255)
    owner: str = Field(max_length=255)
    desc: str | None = Field(default=None, max_length=500)
    call_no: int = Field(default=0)
    status: int = Field(default=0)
    progress: int = Field(default=0)


class RuleCreate(RuleBase):
    pass


class Rule(RuleBase, table=True):
    __tablename__ = "rule"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class RulePublic(RuleBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class RulesPublic(SQLModel):
    data: list[RulePublic]
    count: int
    success: bool = True
