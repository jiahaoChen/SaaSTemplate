from datetime import datetime
import logging
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Message,
    MindMap,
    MindMapCreate,
    MindMapPublic,
    MindMapsPublic,
    MindMapUpdate,
)
from app.utils import (
    get_video_id,
    get_youtube_transcript,
    process_mindmap,
)
from app.core.config import settings

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mindmaps", tags=["mindmaps"])


@router.get("/", response_model=MindMapsPublic)
async def read_mindmaps(
    session: SessionDep, 
    current_user: CurrentUser, 
    skip: int = 0, 
    limit: int = 100,
    public_only: bool = False
) -> Any:
    """
    Retrieve mindmaps for the current user.
    If public_only is True, retrieve only public mindmaps from all users.
    """
    if public_only:
        # Count total public mindmaps
        count_statement = (
            select(func.count())
            .select_from(MindMap)
            .where(col(MindMap.is_public) == True)
        )
        count = session.exec(count_statement).one()

        # Get paginated public mindmaps
        statement = (
            select(MindMap)
            .where(col(MindMap.is_public) == True)
            .offset(skip)
            .limit(limit)
            .order_by(col(MindMap.updated_at).desc())
        )
    else:
        # Count total mindmaps for the user
        count_statement = (
            select(func.count())
            .select_from(MindMap)
            .where(col(MindMap.user_id) == current_user.id)
        )
        count = session.exec(count_statement).one()

        # Get paginated mindmaps
        statement = (
            select(MindMap)
            .where(col(MindMap.user_id) == current_user.id)
            .offset(skip)
            .limit(limit)
            .order_by(col(MindMap.updated_at).desc())
        )

    mindmaps = session.exec(statement).all()
    return MindMapsPublic(data=mindmaps, count=count)


@router.post("/", response_model=MindMapPublic)
async def create_mindmap(
    *,
    session: SessionDep,
    background_tasks: BackgroundTasks,
    mindmap_in: MindMapCreate,
    current_user: CurrentUser,
    level: int = 3,
    language: str = "en",
) -> Any:
    """
    Create new mindmap based on a YouTube video.

    This endpoint will:
    1. Create a new mindmap record
    2. Trigger a background task to fetch the transcript and generate the mindmap
    3. Return the initial mindmap object immediately
    """
    logger.info(f"Creating mindmap for URL: {mindmap_in.youtube_url}, user: {current_user.id}")
    
    # Handle invalid YouTube URL
    if not mindmap_in.youtube_url or not ("youtube.com" in mindmap_in.youtube_url or "youtu.be" in mindmap_in.youtube_url):
        logger.warning(f"Invalid YouTube URL provided: {mindmap_in.youtube_url}")
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL. Please provide a valid YouTube video URL",
        )

    # Create initial mindmap object
    mindmap = MindMap.model_validate(
        {**mindmap_in.model_dump(), "user_id": current_user.id}
    )
    logger.debug(f"Created initial mindmap object: {mindmap.model_dump()}")

    # Get video ID for validation
    try:
        logger.debug(f"Extracting video ID from URL: {mindmap_in.youtube_url}")
        video_id = await get_video_id(mindmap_in.youtube_url)
        mindmap.youtube_video_id = video_id
        logger.debug(f"Successfully extracted video ID: {video_id}")
    except ValueError as e:
        logger.error(f"Failed to extract video ID: {str(e)}")
        raise HTTPException(
            status_code=400, detail="Could not extract video ID from the provided URL"
        )

    # Validate transcript availability before creating the mindmap (quick check)
    logger.debug(f"Checking transcript availability for video ID: {video_id}")
    transcript = await get_youtube_transcript(video_id, quick_check=True)
    if not transcript:
        logger.warning(f"No transcript available for video ID: {video_id}")
        raise HTTPException(
            status_code=400, 
            detail="This video does not have transcripts/subtitles available. Please try with a different video that has captions enabled."
        )

    # Save the initial mindmap to get an ID
    logger.debug("Saving initial mindmap to database")
    session.add(mindmap)
    session.commit()
    session.refresh(mindmap)
    logger.info(f"Created mindmap with ID: {mindmap.id}")

    # Start background task to process mindmap
    logger.info(f"Adding background task to process mindmap ID: {mindmap.id}")
    try:
        background_tasks.add_task(
            process_mindmap,
            mindmap_id=mindmap.id,
            youtube_url=mindmap_in.youtube_url,
            session=None,
            level=level,
            language=language,
        )
        logger.debug(f"Background task added successfully for mindmap ID: {mindmap.id}")
    except Exception as e:
        logger.error(f"Error adding background task: {str(e)}", exc_info=True)
        # We don't raise an exception here as the mindmap was created successfully
        # The client can still poll for updates

    return mindmap


@router.get("/{mindmap_id}", response_model=MindMapPublic)
async def read_mindmap(
    *, session: SessionDep, mindmap_id: int, current_user: CurrentUser
) -> Any:
    """
    Get a specific mindmap by id.
    Users can access:
    1. Their own mindmaps
    2. Any public mindmaps
    3. Any mindmap if they are a superuser
    """
    mindmap = session.get(MindMap, mindmap_id)

    if not mindmap:
        raise HTTPException(status_code=404, detail="MindMap not found")

    # Check if user owns this mindmap, if it's public, or if the user is a superuser
    if mindmap.user_id != current_user.id and not mindmap.is_public and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not enough permissions to access this mindmap"
        )

    return mindmap


@router.patch("/{mindmap_id}", response_model=MindMapPublic)
async def update_mindmap(
    *,
    session: SessionDep,
    mindmap_id: int,
    mindmap_in: MindMapUpdate,
    current_user: CurrentUser,
) -> Any:
    """
    Update a YouTube mindmap.
    """
    mindmap = session.get(MindMap, mindmap_id)

    if not mindmap:
        raise HTTPException(status_code=404, detail="MindMap not found")

    # Check if user owns this mindmap or is a superuser
    if mindmap.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not enough permissions to update this mindmap"
        )

    # Update only the provided fields
    update_data = mindmap_in.model_dump(exclude_unset=True)

    # Always update the updated_at timestamp
    update_data["updated_at"] = datetime.utcnow()

    mindmap.sqlmodel_update(update_data)
    session.add(mindmap)
    session.commit()
    session.refresh(mindmap)

    return mindmap


@router.delete("/{mindmap_id}", response_model=Message)
async def delete_mindmap(
    *, session: SessionDep, mindmap_id: int, current_user: CurrentUser
) -> Any:
    """
    Delete a mindmap.
    """
    mindmap = session.get(MindMap, mindmap_id)

    if not mindmap:
        raise HTTPException(status_code=404, detail="MindMap not found")

    # Check if user owns this mindmap or is a superuser
    if mindmap.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not enough permissions to delete this mindmap"
        )

    session.delete(mindmap)
    session.commit()

    return Message(message="MindMap deleted successfully")


@router.post("/{mindmap_id}/regenerate", response_model=Message)
async def regenerate_mindmap(
    *,
    session: SessionDep,
    background_tasks: BackgroundTasks,
    mindmap_id: int,
    current_user: CurrentUser,
    level: int = 3,
    language: str = "en",
) -> Any:
    """
    Regenerate a mindmap to ensure it has properly formatted timestamps.
    
    This is useful for:
    1. Updating mindmaps that were created with an older version of the system
    2. Improving timestamp accuracy in the mindmap
    3. Fixing mindmaps with missing or improperly formatted timestamps
    """
    logger.info(f"Regenerating mindmap ID: {mindmap_id} for user: {current_user.id}")
    
    mindmap = session.get(MindMap, mindmap_id)

    if not mindmap:
        logger.warning(f"Mindmap not found: {mindmap_id}")
        raise HTTPException(status_code=404, detail="MindMap not found")

    # Check if user owns this mindmap or is a superuser
    if mindmap.user_id != current_user.id and not current_user.is_superuser:
        logger.warning(f"Permission denied for user {current_user.id} to regenerate mindmap {mindmap_id}")
        raise HTTPException(
            status_code=403, detail="Not enough permissions to regenerate this mindmap"
        )

    # Start background task to reprocess mindmap
    logger.info(f"Adding background task to regenerate mindmap ID: {mindmap_id}")
    try:
        background_tasks.add_task(
            process_mindmap,
            mindmap_id=mindmap.id,
            youtube_url=mindmap.youtube_url,
            session=None,
            level=level,
            language=language,
        )
        logger.debug(f"Background task added successfully for mindmap regeneration ID: {mindmap_id}")
    except Exception as e:
        logger.error(f"Error adding background task for regeneration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="Failed to start mindmap regeneration process"
        )

    return Message(message="Mindmap regeneration started. The updated mindmap will be available shortly.")


@router.post("/{mindmap_id}/debug", response_model=Message)
async def debug_mindmap_processing(
    *,
    session: SessionDep,
    mindmap_id: int,
    current_user: CurrentUser,
    level: int = 3,
    language: str = "en",
) -> Any:
    """
    Debug endpoint to manually process a mindmap.
    This is a synchronous version of the background task for debugging purposes.
    Only available in local environment.
    """
    # Only allow in local environment
    if settings.ENVIRONMENT != "local":
        raise HTTPException(
            status_code=403, 
            detail="Debug endpoint only available in local environment"
        )
        
    logger.info(f"DEBUG: Manually processing mindmap ID: {mindmap_id}")
    
    mindmap = session.get(MindMap, mindmap_id)
    if not mindmap:
        logger.warning(f"Mindmap not found: {mindmap_id}")
        raise HTTPException(status_code=404, detail="MindMap not found")

    # Check if user owns this mindmap or is a superuser
    if mindmap.user_id != current_user.id and not current_user.is_superuser:
        logger.warning(f"Permission denied for user {current_user.id} to debug mindmap {mindmap_id}")
        raise HTTPException(
            status_code=403, detail="Not enough permissions to debug this mindmap"
        )

    try:
        # Process mindmap synchronously for debugging
        await process_mindmap(
            mindmap_id=mindmap.id,
            youtube_url=mindmap.youtube_url,
            level=level,
            language=language,
        )
        return Message(message="Mindmap processing completed. Check logs for details.")
    except Exception as e:
        logger.error(f"Error in debug processing: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process mindmap: {str(e)}"
        )


@router.post("/{mindmap_id}/toggle-public", response_model=MindMapPublic)
async def toggle_public_status(
    *, session: SessionDep, mindmap_id: int, current_user: CurrentUser
) -> Any:
    """
    Toggle the public status of a mindmap.
    """
    mindmap = session.get(MindMap, mindmap_id)

    if not mindmap:
        raise HTTPException(status_code=404, detail="MindMap not found")

    # Check if user owns this mindmap
    if mindmap.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not enough permissions to update this mindmap"
        )

    # Toggle the is_public status
    mindmap.is_public = not mindmap.is_public
    
    # Update the timestamp
    mindmap.updated_at = datetime.utcnow()
    
    session.add(mindmap)
    session.commit()
    session.refresh(mindmap)

    return mindmap
