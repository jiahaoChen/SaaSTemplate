# Public Library Feature Implementation Guide

This guide outlines the steps to implement the public library feature for MindTube, allowing users to share their mindmaps with the public.

## Overview of Changes

1. Added `is_public` field to the MindMap model in the database
2. Created an API endpoint for toggling the public status of mindmaps
3. Updated the mindmaps API to support filtering by public status
4. Updated the frontend to display public mindmaps in a separate library
5. Replaced the bookmark button with a share toggle icon

## Backend Changes

### 1. Database Update

Added the `is_public` field to the `MindMap` model in `models.py`:

```python
class MindMapBase(SQLModel):
    # ... existing fields ...
    is_public: bool = Field(default=False, description="Whether this mindmap is shared publicly")
```

Created a migration file to add the column to the database:

```python
# In alembic migration file
def upgrade():
    # Add is_public column to mindmap table with default value False
    op.add_column('mindmap', sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.text('false')))


def downgrade():
    # Remove is_public column from mindmap table
    op.drop_column('mindmap', 'is_public')
```

### Troubleshooting Database Migration

If you encounter errors related to the missing `is_public` column, make sure to run the database migration:

```bash
cd backend
source .venv/bin/activate  # Activate the virtual environment
python -m alembic upgrade head
```

You can verify the migration was successful by checking the `is_public` field on a mindmap:

```python
# Example script
from sqlmodel import Session, select
from app.core.db import engine
from app.models import MindMap

with Session(engine) as session:
    statement = select(MindMap).limit(1)
    result = session.exec(statement).first()
    if result:
        print(f"Current is_public status: {result.is_public}")
```

### 2. API Updates

Updated the read_mindmaps endpoint in `mindmaps.py` to support filtering by public status:

```python
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
        # ... existing code for user's mindmaps ...
```

Updated the read_mindmap endpoint to allow access to public mindmaps:

```python
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
```

Added a new endpoint for toggling the public status:

```python
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
```

## Frontend Changes

### 1. Updated API Client Types

Added the `public_only` parameter to the API client:

```typescript
export type MindmapsReadMindmapsData = {
  limit?: number
  skip?: number
  public_only?: boolean
}

export type MindmapsTogglePublicStatusData = {
  mindmapId: number
}

export type MindmapsTogglePublicStatusResponse = MindMapPublic
```

Added the toggle public status method to the API client:

```typescript
public static togglePublicStatus(
  data: MindmapsTogglePublicStatusData,
): CancelablePromise<MindmapsTogglePublicStatusResponse> {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/mindmaps/{mindmapId}/toggle-public",
    path: {
      mindmapId: data.mindmapId,
    },
    errors: {
      422: "Validation Error",
    },
  })
}
```

### 2. Updated UI Components

Replaced the bookmark icon with a share icon and simplified the toggle UI:

```tsx
<Box 
  title={isShared ? t("mindmap.unshare", "Remove from public library") : t("mindmap.share", "Share to public library")}
  onClick={() => onToggleShare(mindMap.id)}
  cursor="pointer"
  mr={2}
  p={2}
  borderRadius="md"
  _hover={{
    bg: useColorModeValue("gray.100", "gray.700")
  }}
>
  <Icon 
    as={FaShareAlt} 
    color={isShared ? "green.500" : "gray.400"} 
    boxSize="18px"
  />
</Box>
```

Updated the public indicator badge:

```tsx
{isShared && (
  <Box
    position="absolute"
    top={2}
    right={2}
    bg="green.500"
    color="white"
    px={2}
    py={1}
    borderRadius="md"
    fontSize="xs"
    fontWeight="bold"
    display="flex"
    alignItems="center"
  >
    <Icon as={FaShareAlt} mr={1} />
    {t("mindmap.public", "Public")}
  </Box>
)}
```

### 3. Updated API Calls

Updated the toggle share function to call the real API:

```typescript
const handleToggleShare = async (id: number) => {
  try {
    // Call the API to toggle the public status
    await MindmapsService.togglePublicStatus({
      mindmapId: id
    });
    
    // Find the mind map that was toggled
    const mindMap = mindMaps.find(m => m.id === id);
    const isCurrentlyShared = mindMap?.is_public || false;
    
    // Show appropriate message based on current state
    if (isCurrentlyShared) {
      showToast(t("mindmap.unshareSuccess", "Mind map removed from public library"), "success");
    } else {
      showToast(t("mindmap.shareSuccess", "Mind map shared to public library"), "success");
    }
    
    // Refresh the list to see the updated state
    fetchMindmaps();
  } catch (err) {
    console.error("Failed to toggle share status:", err);
    showToast(t("mindmap.shareError", "Failed to update sharing status"), "error");
  }
}
```

Updated the public library to fetch only public mindmaps:

```typescript
const fetchPublicMindmaps = async (currentPage = page) => {
  try {
    setIsLoading(true)
    setError(null)
    const skip = (currentPage - 1) * itemsPerPage
    // Use the public_only parameter to get only public mindmaps
    const response = await MindmapsService.readMindmaps({
      skip,
      limit: itemsPerPage,
      public_only: true
    })
    
    setMindMaps(response.data)
    setTotalCount(response.count)
  } catch (err) {
    setError("Failed to load public mindmaps")
    showToast(t("mindmap.loadFailed", "Failed to load"), "error")
  } finally {
    setIsLoading(false)
  }
}
```

## Deployment Instructions

1. Run the Alembic migration to add the is_public column to the database:
   ```bash
   cd backend
   python -m alembic upgrade head
   ```

2. Deploy the updated backend code with the new API endpoints.

3. Deploy the updated frontend code with the UI changes.

4. Verify that users can share mindmaps and view shared mindmaps in the public library.

## Future Improvements

1. Add ability to "like" or "star" public mindmaps
2. Add a comment system for public mindmaps
3. Add additional filtering options in the public library (e.g., by topic, popularity, etc.)
4. Add analytics for tracking views and engagement with public mindmaps 