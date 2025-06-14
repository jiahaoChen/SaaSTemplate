from datetime import datetime
import httpx
import google.generativeai as genai
from sqlmodel import Session
import logging
from sqlmodel import create_engine
from contextlib import contextmanager
import asyncio
import tempfile
import os
import json
from typing import List, Dict, Any

from app.core.config import settings
from app.models import MindMap

from sqlmodel import select
from app.models import User

# yt-dlp for YouTube subtitle extraction
import yt_dlp

# Set up logger
logger = logging.getLogger(__name__)

# Create a session factory for background tasks
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)

@contextmanager
def get_background_session():
    """Create a new session for background tasks."""
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()

async def get_video_id(video_id_or_url: str) -> str:
    """Extract video ID from the YouTube URL or return it if it's already an ID."""
    logger.debug(f"Extracting video ID from: {video_id_or_url}")
    # Check if the input is a valid video ID (assuming a valid ID is 11 characters long)
    if len(video_id_or_url) == 11 and all(c.isalnum() for c in video_id_or_url):
        logger.debug(f"Input appears to be a valid video ID: {video_id_or_url}")
        return video_id_or_url

    # Check for the 'youtu.be' format
    if "youtu.be/" in video_id_or_url:
        video_id = video_id_or_url.split("youtu.be/")[1].split("?")[0]
        logger.debug(f"Extracted video ID from youtu.be URL: {video_id}")
        return video_id

    # Otherwise, extract the video ID from the standard URL format
    if "v=" in video_id_or_url:
        video_id = video_id_or_url.split("v=")[1].split("&")[0]
        logger.debug(f"Extracted video ID from standard URL: {video_id}")
        return video_id

    logger.error(f"Invalid YouTube URL format: {video_id_or_url}")
    raise ValueError("Invalid YouTube URL format")


async def get_video_info(video_id: str) -> dict | None:
    """Get comprehensive video information from YouTube oEmbed API.
    Returns a dictionary containing video details including title, author, 
    thumbnails, and embed information, or None if the request fails.
    """
    logger.debug(f"Getting video info for ID: {video_id}")
    max_retries = 3
    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries):
            try:
                api_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
                logger.debug(f"Attempt {attempt+1}/{max_retries}: Requesting {api_url}")
                response = await client.get(
                    api_url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                    },
                )

                if response.status_code == 200:
                    logger.debug(f"Successfully retrieved video info for {video_id}")
                    return response.json()
                else:
                    logger.warning(f"Failed to get video info: HTTP {response.status_code}")

            except Exception as e:
                logger.error(f"Error getting video info (attempt {attempt+1}): {str(e)}")
                if attempt == max_retries - 1:  # Last attempt
                    return None
                continue
    logger.error(f"All attempts to get video info failed for {video_id}")
    return None


async def get_video_title(video_id: str) -> str | None:
    """Get video title from YouTube with retries."""
    logger.debug(f"Getting video title for ID: {video_id}")
    video_info = await get_video_info(video_id)
    if video_info:
        logger.debug(f"Retrieved title: {video_info.get('title')}")
        return video_info.get("title")
    logger.warning(f"Could not retrieve title for video {video_id}")
    return None


async def get_youtube_transcript(video_id: str, quick_check: bool = False) -> str | None:
    """Fetch YouTube video transcript using yt-dlp.
    
    Args:
        video_id: YouTube video ID
        quick_check: If True, only try basic language combinations for faster validation
    """
    logger.debug(f"Getting transcript for video ID: {video_id}")
    
    # Define language preferences based on quick_check
    if quick_check:
        # For quick validation, try fewer languages
        preferred_languages = ['en', 'zh', 'es']
    else:
        # For full processing, try comprehensive language list
        preferred_languages = [
            'en', 'zh', 'es',           # Primary languages
            'en-US', 'en-GB',           # English variants
            'zh-CN', 'zh-TW',           # Chinese variants  
            'es', 'pt', 'fr',           # Romance languages
            'de', 'ja', 'ko',           # Other common languages
        ]
    
    # Create a temporary directory for yt-dlp operations
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            # Configure yt-dlp options
            ydl_opts = {
                'writesubtitles': True,
                'writeautomaticsub': True,
                'subtitleslangs': preferred_languages,
                'subtitlesformat': 'vtt',
                'skip_download': True,  # Don't download video, only subtitles
                'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
                'quiet': True,  # Reduce yt-dlp output
                'no_warnings': True,
            }
            
            # Create yt-dlp instance
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                video_url = f"https://www.youtube.com/watch?v={video_id}"
                logger.debug(f"Extracting info for URL: {video_url}")
                
                # Extract video info first to check subtitle availability
                try:
                    info = ydl.extract_info(video_url, download=False)
                    if not info:
                        logger.error(f"Could not extract video info for {video_id}")
                        return None
                        
                    # Check if subtitles are available
                    subtitles = info.get('subtitles', {})
                    automatic_captions = info.get('automatic_captions', {})
                    
                    if not subtitles and not automatic_captions:
                        logger.warning(f"No subtitles or automatic captions available for video {video_id}")
                        return None
                        
                    # Find the best available subtitle language
                    available_langs = list(subtitles.keys()) + list(automatic_captions.keys())
                    logger.debug(f"Available subtitle languages: {available_langs}")
                    
                    selected_lang = None
                    # Try to find preferred language in order
                    for lang in preferred_languages:
                        if lang in available_langs:
                            selected_lang = lang
                            logger.debug(f"Selected subtitle language: {selected_lang}")
                            break
                    
                    if not selected_lang and available_langs:
                        # If no preferred language found, use the first available
                        selected_lang = available_langs[0]
                        logger.debug(f"Using first available language: {selected_lang}")
                    
                    if not selected_lang:
                        logger.warning(f"No suitable subtitle language found for video {video_id}")
                        return None
                        
                except Exception as e:
                    logger.error(f"Error extracting video info for {video_id}: {str(e)}")
                    return None
                
                # Download subtitles
                try:
                    # Update options to download only the selected language
                    ydl_opts['subtitleslangs'] = [selected_lang]
                    
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl_download:
                        logger.debug(f"Downloading subtitles for language: {selected_lang}")
                        ydl_download.download([video_url])
                        
                    # Find the downloaded subtitle file
                    subtitle_files = []
                    for file in os.listdir(temp_dir):
                        if file.endswith('.vtt') and selected_lang in file:
                            subtitle_files.append(os.path.join(temp_dir, file))
                            
                    if not subtitle_files:
                        logger.warning(f"No subtitle files found after download for video {video_id}")
                        return None
                        
                    # Read and parse the subtitle file
                    subtitle_file = subtitle_files[0]
                    logger.debug(f"Reading subtitle file: {subtitle_file}")
                    
                    with open(subtitle_file, 'r', encoding='utf-8') as f:
                        vtt_content = f.read()
                        
                    # Parse VTT content to extract text with timestamps
                    transcript = parse_vtt_content(vtt_content)
                    
                    if not transcript:
                        logger.warning(f"No transcript content extracted from VTT file for video {video_id}")
                        return None
                        
                    transcript_lines = transcript.split('\n')
                    logger.info(f"Successfully extracted transcript with {len(transcript_lines)} entries for video {video_id}")
                    return transcript
                    
                except Exception as e:
                    logger.error(f"Error downloading subtitles for video {video_id}: {str(e)}")
                    return None
                    
        except Exception as e:
            logger.error(f"Unexpected error getting transcript for video {video_id}: {str(e)}")
            return None


def parse_vtt_content(vtt_content: str) -> str:
    """Parse VTT subtitle content and extract text with timestamps.
    
    Args:
        vtt_content: Raw VTT file content
        
    Returns:
        Formatted transcript with timestamps
    """
    lines = vtt_content.split('\n')
    transcript_entries = []
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip VTT header and empty lines
        if not line or line.startswith('WEBVTT') or line.startswith('NOTE'):
            i += 1
            continue
            
        # Check if this is a timestamp line (contains -->)
        if '-->' in line:
            timestamp_line = line
            i += 1
            
            # Collect subtitle text (may span multiple lines)
            text_lines = []
            while i < len(lines) and lines[i].strip() and '-->' not in lines[i]:
                text_line = lines[i].strip()
                # Remove VTT formatting tags
                text_line = remove_vtt_tags(text_line)
                if text_line:
                    text_lines.append(text_line)
                i += 1
                
            if text_lines:
                # Extract start time from timestamp
                start_time = extract_start_time(timestamp_line)
                text = ' '.join(text_lines)
                
                if start_time is not None and text:
                    transcript_entries.append(f"[{start_time:.2f}s] {text}")
        else:
            i += 1
    
    return '\n'.join(transcript_entries)


def remove_vtt_tags(text: str) -> str:
    """Remove VTT formatting tags from text."""
    import re
    # Remove HTML-like tags and VTT positioning/styling tags
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'&lt;[^&]+&gt;', '', text)
    return text.strip()


def extract_start_time(timestamp_line: str) -> float | None:
    """Extract start time in seconds from VTT timestamp line."""
    try:
        # VTT timestamp format: 00:00:01.000 --> 00:00:05.000
        start_part = timestamp_line.split('-->')[0].strip()
        
        # Parse time format: HH:MM:SS.mmm or MM:SS.mmm
        time_parts = start_part.replace(',', '.').split(':')
        
        if len(time_parts) == 3:  # HH:MM:SS.mmm
            hours = int(time_parts[0])
            minutes = int(time_parts[1])
            seconds = float(time_parts[2])
            return hours * 3600 + minutes * 60 + seconds
        elif len(time_parts) == 2:  # MM:SS.mmm
            minutes = int(time_parts[0])
            seconds = float(time_parts[1])
            return minutes * 60 + seconds
        else:
            return None
    except (ValueError, IndexError):
        return None


async def generate_mindmap(
    transcript: str, video_title: str, level: int = 3, language: str = "en", user_api_key: str = None, requested_model_name: str | None = None
) -> dict | None:
    """Generate mindmap from transcript using LLM API.

    Args:
        transcript: Video transcript text
        video_title: Title of the video
        level: Depth of the mindmap (1-5)
        language: Target language for the mindmap
        user_api_key: User's personal Gemini API key (optional)
        requested_model_name: Specific Gemini model name requested by the user (optional)

    Returns:
        dict | None: A dictionary containing the mindmap data in the format:
        {
            "markmap": str,
            "summary": str,
            "takeaways": list[str]
        }
        Returns None if generation fails.
    """
    logger.debug(f"Generating mindmap for video: {video_title}, level: {level}, language: {language}")
    try:
        # Verify API key exists
        if not user_api_key and not settings.AI_API_KEY:
            logger.error("No API key available for Gemini")
            return {
                "error": "No API key available. Please set your Gemini API key in your profile settings."
            }
            
        # Configure the Gemini API with user's key if available, otherwise use system key
        api_key = user_api_key if user_api_key else settings.AI_API_KEY
        if not api_key:
            logger.error("API key is empty or None")
            return {
                "error": "API key is missing. Please set your Gemini API key in your profile settings or contact the administrator."
            }
            
        logger.debug(f"Using {'user' if user_api_key else 'system'} API key for Gemini")
        genai.configure(api_key=api_key)

        # Determine the model to use
        model_name_to_use = settings.AI_MODEL_NAME  # Default
        if requested_model_name and requested_model_name in settings.AVAILABLE_GEMINI_MODELS:
            model_name_to_use = requested_model_name
            logger.info(f"Using requested Gemini model: {model_name_to_use}")
        elif requested_model_name:
            logger.warning(
                f"Requested Gemini model '{requested_model_name}' is not available or invalid. "
                f"Falling back to default model: {settings.AI_MODEL_NAME}. "
                f"Available models: {settings.AVAILABLE_GEMINI_MODELS}"
            )
        else:
            logger.info(f"Using default Gemini model: {model_name_to_use}")

        # Initialize the model
        logger.debug(f"Initializing Gemini model: {model_name_to_use}")
        if not model_name_to_use: # Should not happen if AI_MODEL_NAME is set in config
            logger.error("Gemini model name is not configured properly (neither default nor requested is valid).")
            return {
                "error": "AI model name is not configured. Please contact the administrator."
            }
            
        model = genai.GenerativeModel(model_name_to_use)

        prompt = f"""
        Create a mindmap in markmap format about the video content from the transcript.
        Follow these specific requirements:
        1. Include timestamps for EVERY node in the format [XX.XXs] at the end of each node text, where XX.XX is the seconds into the video.
        2. For each node or topic, find the most relevant timestamp in the transcript.
        3. Make the mindmap {level} levels deep.
        4. Translate all content to {language}.
        5. Format the output as json for better structure.

        Example node format: "Introduction to the topic [45.30s]"
        """

        content = f"""
        title: {video_title}
        content: Transcript: {transcript}
        prompt: {prompt}
        Please return a valid JSON response in the following format:
        {{
            "markmap": "...",
            "summary": "...",
            "takeaways": ["..."]
        }}
        """

        # Generate content using Gemini
        logger.debug("Sending request to Gemini API")
        response = await model.generate_content_async(
            content,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        logger.debug("Received response from Gemini API")

        # Return the generated mindmap data
        return response.text
    except Exception as e:
        logger.error(f"Error generating mindmap: {str(e)}", exc_info=True)
        error_message = str(e)
        
        # Check for specific error types
        if "429" in error_message or "quota" in error_message.lower():
            # This is a quota error
            return {
                "error": f"API quota exceeded. Please try again later or update your API key in settings. Error: {error_message}"
            }
        
        return {"error": f"An unexpected error occurred while generating the mindmap: {error_message}"}


async def process_mindmap(
    mindmap_id: int,
    youtube_url: str,
    session: Session = None,
    level: int = 3,
    language: str = "en",
    requested_model_name: str | None = None,
) -> None:
    """Background task to process and update mindmap."""
    logger.info(f"Starting mindmap processing for ID: {mindmap_id}, URL: {youtube_url}, Model: {requested_model_name or 'default'}")
    
    # Create a new session specifically for this background task
    # This is necessary because the session passed from the endpoint might be closed
    # by the time this background task runs
    with get_background_session() as bg_session:
        try:
            # Get mindmap from DB with the new session
            mindmap = bg_session.get(MindMap, mindmap_id)
            if not mindmap:
                logger.error(f"Mindmap not found in database: {mindmap_id}")
                return

            # Extract video ID and fetch details
            logger.debug(f"Extracting video ID from URL: {youtube_url}")
            video_id = await get_video_id(youtube_url)
            logger.info(f"Extracted video ID: {video_id}")

            # Get comprehensive video info
            logger.debug(f"Fetching video information for ID: {video_id}")
            video_info = await get_video_info(video_id)
            if video_info:
                logger.debug(f"Successfully retrieved video info: {video_info.get('title')}")
                mindmap.video_title = video_info.get("title", "")
                mindmap.youtube_video_id = video_id
                # Store additional video metadata
                mindmap.author_name = video_info.get("author_name")
                mindmap.author_url = video_info.get("author_url")
                mindmap.thumbnail_url = video_info.get("thumbnail_url")
                # Store the full metadata as JSON
                mindmap.video_metadata = dict(video_info)  # Ensure it's a dict type
            else:
                logger.warning(f"Could not retrieve video info for ID: {video_id}")

            # Get transcript (full processing with all language combinations)
            logger.debug(f"Fetching transcript for video ID: {video_id}")
            transcript = await get_youtube_transcript(video_id, quick_check=False)
            if not transcript:
                # Update mindmap with a more detailed error message
                logger.error(f"Could not retrieve transcript for video ID: {video_id}")
                
                # Provide a user-friendly error message
                error_message = (
                    "Could not retrieve transcript for this video. "
                    "This could be because:\n"
                    "• The video doesn't have captions/subtitles\n"
                    "• Transcripts are disabled by the creator\n"
                    "• The video is private or unavailable\n"
                    "• YouTube is temporarily blocking transcript requests\n\n"
                    "Please try with a different video that has captions enabled."
                )
                
                mindmap.markmap = f"Error: {error_message}"
                bg_session.add(mindmap)
                bg_session.commit()
                logger.info(f"Updated mindmap {mindmap_id} with transcript error")
                return

            # Get the user's API key (if available)
            logger.debug(f"Getting API key for user ID: {mindmap.user_id}")       
            user_query = select(User).where(User.id == mindmap.user_id)
            user = bg_session.exec(user_query).first()
            
            user_api_key = None
            user_preferred_model = None
            if user:
                user_api_key = user.gemini_api_key
                user_preferred_model = user.preferred_gemini_model
                logger.debug(f"User API key available: {bool(user_api_key)}")
                if user_preferred_model:
                    logger.info(f"User ID {user.id} has preferred model: {user_preferred_model}")
            
            # Determine model to use: user's preference > requested_model_name param > default
            model_to_request = requested_model_name # from function parameter
            if user_preferred_model:
                model_to_request = user_preferred_model
                logger.info(f"Using user's preferred model for mindmap generation: {model_to_request}")
            elif requested_model_name:
                 logger.info(f"Using model specified in process_mindmap call: {model_to_request}")
            else:
                logger.info(f"No specific model requested by user or call, will use default from settings.")


            # Generate mindmap
            logger.info(f"Generating mindmap for video: {mindmap.video_title or 'YouTube Video'} using model: {model_to_request or settings.AI_MODEL_NAME}")
            mindmap_data = await generate_mindmap(
                transcript=transcript,
                video_title=mindmap.video_title or "YouTube Video",
                level=level,
                language=language,
                user_api_key=user_api_key,
                requested_model_name=model_to_request # Pass the determined model
            )

            if isinstance(mindmap_data, dict) and mindmap_data.get("error"):
                # Handle API key error
                logger.error(f"API key error: {mindmap_data.get('error')}")
                
                # Format the error message for the frontend
                error_message = mindmap_data.get('error')
                
                # Set the error message in the mindmap
                mindmap.markmap = f"Error: {error_message}"
                mindmap.updated_at = datetime.utcnow()
                bg_session.add(mindmap)
                bg_session.commit()
                logger.info(f"Updated mindmap {mindmap_id} with API key error")
                return

            if mindmap_data:
                try:
                    # Parse the JSON string into a dictionary if it's a string
                    if isinstance(mindmap_data, str):
                        import json
                        logger.debug("Parsing JSON response from Gemini")
                        mindmap_data = json.loads(mindmap_data)
                        logger.debug(f"JSON parsed successfully: {list(mindmap_data.keys())}")

                    # Update mindmap with all available data
                    mindmap.markmap = mindmap_data.get("markmap", "Error: Invalid mindmap format")
                    mindmap.one_sentence_summary = mindmap_data.get("summary", "")
                    mindmap.takeaways = mindmap_data.get("takeaways", [])
                    logger.debug("Mindmap data extracted from response")
                except Exception as e:
                    logger.error(f"Error parsing mindmap data: {str(e)}", exc_info=True)
                    mindmap.markmap = "Error: Could not parse mindmap data."
            else:
                logger.error("Failed to generate mindmap: No data returned")
                mindmap.markmap = "Error: Could not generate mindmap."

            # Update mindmap
            logger.debug("Updating mindmap in database")
            mindmap.updated_at = datetime.utcnow()
            bg_session.add(mindmap)
            bg_session.commit()
            logger.info(f"Successfully updated mindmap {mindmap_id} in database")
        except Exception as e:
            # Log the error
            logger.error(f"Error processing mindmap: {str(e)}", exc_info=True)
            # Try to update the mindmap with the error if possible
            try:
                mindmap = bg_session.get(MindMap, mindmap_id)
                if mindmap:
                    mindmap.markmap = f"Error: Failed to process mindmap: {str(e)}"
                    mindmap.updated_at = datetime.utcnow()
                    bg_session.add(mindmap)
                    bg_session.commit()
                    logger.info(f"Updated mindmap {mindmap_id} with error message")
            except Exception as inner_e:
                logger.error(f"Failed to update mindmap with error: {str(inner_e)}")
