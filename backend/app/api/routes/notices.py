from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Notice, NoticeCreate, NoticePublic, NoticesPublic

router = APIRouter(tags=["notices"])


@router.get("/notices", response_model=NoticesPublic)
def read_notices(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> NoticesPublic:
    """
    Retrieve notices for the current user.
    """
    count_statement = select(Notice).where(Notice.user_id == current_user.id)
    count = len(session.exec(count_statement).all())
    
    statement = select(Notice).where(Notice.user_id == current_user.id).offset(skip).limit(limit)
    notices = session.exec(statement).all()
    
    return NoticesPublic(data=notices, count=count)


@router.post("/notices", response_model=NoticePublic)
def create_notice(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    notice_in: NoticeCreate,
) -> NoticePublic:
    """
    Create new notice.
    """
    notice = Notice.model_validate(notice_in.model_dump())
    notice.user_id = current_user.id
    session.add(notice)
    session.commit()
    session.refresh(notice)
    return notice


@router.get("/notices/{notice_id}", response_model=NoticePublic)
def read_notice(
    notice_id: str,
    session: SessionDep,
    current_user: CurrentUser,
) -> NoticePublic:
    """
    Get notice by ID.
    """
    notice = session.get(Notice, notice_id)
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    if notice.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return notice


@router.delete("/notices/{notice_id}")
def delete_notice(
    notice_id: str,
    session: SessionDep,
    current_user: CurrentUser,
) -> dict[str, str]:
    """
    Delete a notice.
    """
    notice = session.get(Notice, notice_id)
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    if notice.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    session.delete(notice)
    session.commit()
    return {"message": "Notice deleted successfully"} 