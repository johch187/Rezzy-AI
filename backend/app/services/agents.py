"""
Vertex AI Agent Service for Gemini 3 Pro Preview.

This module provides a streamlined wrapper around Google Cloud Vertex AI
for generating content using Gemini models. Optimized for Cloud Run deployment.
"""

import json
import logging
import os
import re
from typing import Any, Dict, List, Optional

from app.config import get_settings

# Vertex AI imports (stable API)
try:
    import vertexai
    from vertexai.generative_models import GenerationConfig, GenerativeModel, Part
    VERTEX_AI_AVAILABLE = True
except ImportError:
    vertexai = None
    GenerationConfig = None
    GenerativeModel = None
    Part = None
    VERTEX_AI_AVAILABLE = False

# Fallback: google-genai for local development only
try:
    import google.genai as genai
    GENAI_AVAILABLE = True
except ImportError:
    genai = None
    GENAI_AVAILABLE = False

# GCP exceptions for better error handling
try:
    from google.api_core import exceptions as gcp_exceptions
    GCP_EXCEPTIONS_AVAILABLE = True
except ImportError:
    gcp_exceptions = None
    GCP_EXCEPTIONS_AVAILABLE = False

logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION CONSTANTS
# Update these values to change models/regions without modifying code logic
# ============================================================================

# Primary Gemini model
DEFAULT_GEMINI_MODEL = "gemini-3-pro-preview"

# Fallback models (tried in order if primary fails)
FALLBACK_GEMINI_MODELS: List[str] = ["gemini-2.5-pro"]

# Default GCP region for Vertex AI
# https://docs.cloud.google.com/vertex-ai/docs/general/locations#europe
DEFAULT_GCP_REGION = "europe-north1"

# Cloud Run to Vertex AI region mapping
REGION_MAPPING: Dict[str, str] = {
    "europe-north2": "europe-north1",
}

# Supported Vertex AI regions (from official documentation)
VERTEX_AI_REGIONS = frozenset({
    # United States
    "us-central1", "us-east1", "us-east4", "us-east5", "us-west1",
    "us-west2", "us-west3", "us-west4", "us-south1",
    # Canada
    "northamerica-northeast1", "northamerica-northeast2",
    # South America
    "southamerica-east1", "southamerica-west1",
    # Europe
    "europe-west1", "europe-west2", "europe-west3", "europe-west4",
    "europe-west6", "europe-west8", "europe-west9", "europe-west12",
    "europe-central2", "europe-north1", "europe-southwest1",
    # Asia Pacific
    "asia-east1", "asia-east2", "asia-northeast1", "asia-northeast2",
    "asia-northeast3", "asia-south1", "asia-south2", "asia-southeast1",
    "asia-southeast2", "australia-southeast1", "australia-southeast2",
    # Middle East
    "me-central1", "me-central2", "me-west1",
    # Africa
    "africa-south1",
    # Global (for preview models)
    "global",
})

# Generation config defaults
DEFAULT_TEMPERATURE = 0.4
DEFAULT_TOP_P = 0.95

# ============================================================================


def _is_production() -> bool:
    """Detect if running in Cloud Run or App Engine."""
    return bool(os.getenv("K_SERVICE") or os.getenv("GAE_ENV"))


def _safe_parse_json(text: str) -> Optional[Any]:
    """Parse JSON from LLM response, handling code fences."""
    if not text:
        return None
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?", "", stripped, flags=re.IGNORECASE | re.MULTILINE)
        stripped = re.sub(r"```$", "", stripped, flags=re.MULTILINE)
        stripped = stripped.strip()
    try:
        return json.loads(stripped)
    except (json.JSONDecodeError, TypeError):
        return None


class AgentService:
    """
    Vertex AI wrapper for Gemini models.
    
    In production (Cloud Run): Uses Vertex AI with service account credentials.
    In development: Falls back to google-genai API key if Vertex AI unavailable.
    """

    def __init__(self) -> None:
        self.is_production = _is_production()
        self._initialized = False
        
        try:
            settings = get_settings()
            self.api_key = settings.gemini_api_key
            self.project_id = settings.gcp_project_id
            self.model_name = settings.gemini_model_name or DEFAULT_GEMINI_MODEL
            self._requested_region = settings.gcp_region or DEFAULT_GCP_REGION
        except Exception as exc:
            logger.error("Failed to load settings: %s", exc)
            self.api_key = None
            self.project_id = None
            self.model_name = DEFAULT_GEMINI_MODEL
            self._requested_region = DEFAULT_GCP_REGION
        
        # Map to supported Vertex AI region
        self.location = REGION_MAPPING.get(self._requested_region, self._requested_region)
        
        # Validate region
        if self.location not in VERTEX_AI_REGIONS:
            error = f"Region '{self.location}' not supported. Use: {DEFAULT_GCP_REGION}"
            if self.is_production:
                raise RuntimeError(error)
            logger.warning(error)
        
        # Initialize Vertex AI
        self._init_vertex_ai()

    def _init_vertex_ai(self) -> None:
        """Initialize Vertex AI with proper error handling."""
        if not VERTEX_AI_AVAILABLE:
            if self.is_production:
                raise RuntimeError("Vertex AI SDK not available in production")
            logger.warning("Vertex AI SDK not installed")
            return
        
        if not self.project_id:
            if self.is_production:
                raise RuntimeError("GCP_PROJECT_ID required in production")
            logger.warning("No GCP_PROJECT_ID configured")
            return
        
        try:
            vertexai.init(project=self.project_id, location=self.location)
            
            # Verify model availability
            try:
                GenerativeModel(self.model_name)
                self._initialized = True
                logger.info("Vertex AI ready: project=%s, region=%s, model=%s",
                           self.project_id, self.location, self.model_name)
            except Exception as e:
                if "not found" in str(e).lower() or "404" in str(e):
                    # Try global location for preview models
                    logger.warning("Model not found in %s, trying global", self.location)
                    vertexai.init(project=self.project_id, location="global")
                    GenerativeModel(self.model_name)
                    self.location = "global"
                    self._initialized = True
                    logger.info("Vertex AI ready with global location")
                else:
                    raise
                    
        except Exception as exc:
            error_msg = f"Vertex AI init failed: {exc}"
            if self.is_production:
                raise RuntimeError(error_msg) from exc
            logger.warning(error_msg)

    async def _run_llm(
        self,
        prompt: str,
        system_instruction: str,
        description: str = "",
        response_mime: Optional[str] = None,
    ) -> str:
        """Execute LLM request with automatic fallback handling."""
        
        # Primary: Vertex AI
        if self._initialized and GenerativeModel is not None:
            return await self._run_vertex_ai(prompt, system_instruction, response_mime)
        
        # Fallback: google-genai (development only)
        if self.is_production:
            raise RuntimeError("Vertex AI unavailable in production")
        
        if GENAI_AVAILABLE and self.api_key:
            return await self._run_genai_fallback(prompt, system_instruction, response_mime)
        
        raise RuntimeError("No LLM backend available. Configure Vertex AI or GEMINI_API_KEY.")

    async def _run_vertex_ai(
        self,
        prompt: str,
        system_instruction: str,
        response_mime: Optional[str],
    ) -> str:
        """Execute request via Vertex AI."""
        try:
            model = GenerativeModel(
                self.model_name,
                system_instruction=system_instruction
            )
            
            config = GenerationConfig(
                response_mime_type=response_mime or "text/plain",
                temperature=DEFAULT_TEMPERATURE,
                top_p=DEFAULT_TOP_P,
            )
            
            response = model.generate_content(
                [Part.from_text(prompt)] if Part else [prompt],
                generation_config=config,
            )
            
            # Extract text from response
            if hasattr(response, "text") and response.text:
                return response.text
            
            if hasattr(response, "candidates") and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, "content") and candidate.content:
                    if hasattr(candidate.content, "parts") and candidate.content.parts:
                        return candidate.content.parts[0].text or ""
            
            return json.dumps(response, default=str)
            
        except Exception as exc:
            self._log_vertex_error(exc)
            
            # Try fallback models
            for fallback in FALLBACK_GEMINI_MODELS:
                if fallback == self.model_name:
                    continue
                try:
                    logger.warning("Trying fallback model: %s", fallback)
                    model = GenerativeModel(fallback, system_instruction=system_instruction)
                    config = GenerationConfig(
                        response_mime_type=response_mime or "text/plain",
                        temperature=DEFAULT_TEMPERATURE,
                        top_p=DEFAULT_TOP_P,
                    )
                    response = model.generate_content([prompt], generation_config=config)
                    if hasattr(response, "text") and response.text:
                        return response.text
                except Exception:
                    continue
            
            raise RuntimeError(f"All models failed. Last error: {exc}") from exc

    def _log_vertex_error(self, exc: Exception) -> None:
        """Log detailed Vertex AI errors."""
        if not GCP_EXCEPTIONS_AVAILABLE:
            logger.error("Vertex AI error: %s", exc)
            return
            
        if isinstance(exc, gcp_exceptions.PermissionDenied):
            logger.error("Permission denied - check service account has 'roles/aiplatform.user'")
        elif isinstance(exc, gcp_exceptions.ResourceExhausted):
            logger.error("Quota exceeded - check project quotas")
        elif isinstance(exc, gcp_exceptions.InvalidArgument):
            logger.error("Invalid argument - check prompt format")
        else:
            logger.error("Vertex AI error: %s", exc)

    async def _run_genai_fallback(
        self,
        prompt: str,
        system_instruction: str,
        response_mime: Optional[str],
    ) -> str:
        """Execute request via google-genai (development fallback)."""
        client = genai.Client(api_key=self.api_key)
        response = client.models.generate_content(
            model=self.model_name,
            contents=[{"role": "user", "parts": [prompt]}],
            config={
                "system_instruction": system_instruction,
                "response_mime_type": response_mime or "text/plain",
            },
        )
        return response.text or ""

    # ========================================================================
    # Public API Methods
    # ========================================================================

    async def generate_documents(
        self,
        profile: Dict[str, Any],
        options: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generate tailored resume and cover letter."""
        prompt = f"""
Create tailored documents based on:

PROFILE:
{json.dumps(profile, indent=2)}

OPTIONS:
{json.dumps(options, indent=2)}

Return JSON with keys: "resume" (markdown), "coverLetter" (markdown).
Return null for any not requested.
"""
        raw = await self._run_llm(
            prompt,
            "Generate professional resume and cover letter. Be concise, align with job description.",
            response_mime="application/json",
        )
        parsed = _safe_parse_json(raw) or {}
        return {
            "resume": parsed.get("resume"),
            "coverLetter": parsed.get("coverLetter"),
            "analysis": parsed.get("analysis"),
        }

    async def parse_resume(self, text: str) -> Dict[str, Any]:
        """Parse resume text into structured data."""
        prompt = f"""
Parse this resume into structured JSON:

{text}

Return: fullName, email, phone, experience (array: company, title, startDate, endDate, achievements),
education (array: institution, degree, fieldOfStudy, startDate, endDate), technicalSkills (array of strings).
"""
        raw = await self._run_llm(
            prompt,
            "Parse resume accurately. Return strict JSON.",
            response_mime="application/json",
        )
        return _safe_parse_json(raw) or {
            "fullName": "",
            "experience": [],
            "education": [],
            "technicalSkills": [],
        }

    async def career_path(
        self,
        profile: Dict[str, Any],
        current_role: str,
        target_role: str,
    ) -> Dict[str, Any]:
        """Build career path from current to target role with video recommendations."""
        prompt = f"""
Create a detailed career development path from '{current_role}' to '{target_role}'.

CRITICAL: Generate content SPECIFICALLY for the target role "{target_role}". 
Do NOT use generic or product management examples - tailor everything to {target_role}.

User Profile:
{json.dumps(profile, indent=2)}

Return a JSON object with this EXACT structure:
{{
  "currentRole": "{current_role}",
  "targetRole": "{target_role}",
  "path": [
    {{
      "timeframe": "Year 0-1",
      "milestoneTitle": "Short milestone name specific to {target_role} (3-5 words)",
      "milestoneDescription": "Description of this career phase toward {target_role} (2-3 sentences)",
      "actionItems": [
        {{
          "category": "Skills",
          "title": "Skill specific to {target_role}",
          "description": "How to develop this skill for {target_role}"
        }},
        {{
          "category": "Networking",
          "title": "Network in {target_role} field",
          "description": "Communities and connections relevant to {target_role}"
        }}
      ],
      "learningTopics": ["Topic 1 for {target_role}", "Topic 2 for {target_role}", "Topic 3 for {target_role}"],
      "recommendedVideos": [
        {{
          "title": "Video title relevant to {target_role}",
          "channel": "Real YouTube channel name",
          "description": "Why this helps someone becoming a {target_role}",
          "videoId": "REAL_11_CHAR_VIDEO_ID"
        }}
      ]
    }}
  ]
}}

IMPORTANT REQUIREMENTS:
- Create 3-5 milestones representing the journey to become a {target_role}
- ALL content must be specific to {target_role} - not generic career advice
- Each milestone must have 3-5 actionItems with category, title, and description
- Valid categories: "Academics", "Internships", "Projects", "Skills", "Networking", "Career", "Certifications"
- learningTopics: 3-5 topics specifically needed for {target_role}
- milestoneTitle: concise (3-6 words), specific to {target_role} journey
- actionItems: specific skills, projects, and steps needed for {target_role}
- recommendedVideos: 2-4 REAL YouTube videos with ACTUAL 11-character video IDs
- Use educational YouTube channels appropriate for the {target_role} field
- Video IDs must be real (like "dQw4w9WgXcQ") - do not make up fake IDs
"""
        raw = await self._run_llm(
            prompt,
            "Strategic career coach. Create comprehensive, actionable career development plans with specific milestones, detailed action items, and real educational YouTube video recommendations.",
            response_mime="application/json",
        )
        return _safe_parse_json(raw) or {
            "currentRole": current_role,
            "targetRole": target_role,
            "path": [],
        }

    async def networking_brief(
        self,
        profile: Dict[str, Any],
        counterpart_info: str,
    ) -> str:
        """Create networking coffee chat brief."""
        prompt = f"""
Create coffee chat brief (markdown) with: Quick Overview, Shared Touchpoints,
Smart Conversation Starters, Industry Context, Closing Ideas.

Profile: {json.dumps(profile, indent=2)}
Counterpart: {counterpart_info}
"""
        return await self._run_llm(prompt, "Warm, strategic networking coach.")

    async def networking_reach_out(
        self,
        profile: Dict[str, Any],
        counterpart_info: str,
    ) -> str:
        """Draft personalized outreach message."""
        prompt = f"""
Draft concise, personalized outreach message (no subject line):

Profile: {json.dumps(profile, indent=2)}
Counterpart: {counterpart_info}
"""
        return await self._run_llm(prompt, "Expert communicator.")

    async def analyze_application(
        self,
        resume_text: str,
        job_description: str,
    ) -> Dict[str, Any]:
        """Analyze resume fit for job description."""
        prompt = f"""
Evaluate resume vs job description. Return JSON:
fitScore (0-100), gapAnalysis (markdown), keywordOptimization (markdown), impactEnhancer (markdown).

Resume: {resume_text}
Job: {job_description}
"""
        raw = await self._run_llm(
            prompt,
            "Senior HR analyst giving honest, constructive feedback.",
            response_mime="application/json",
        )
        return _safe_parse_json(raw) or {
            "fitScore": 0,
            "gapAnalysis": "",
            "keywordOptimization": "",
            "impactEnhancer": "",
        }

    async def mentor_match(
        self,
        topic: str,
        faculty_list: str,
    ) -> List[Dict[str, Any]]:
        """Match thesis topic to faculty mentors."""
        prompt = f"""
Match thesis topic to top 3 faculty. Return JSON array: name, score (0-100), reasoning.

Topic: {topic}
Faculty: {faculty_list}
"""
        raw = await self._run_llm(
            prompt,
            "Academic advisor.",
            response_mime="application/json",
        )
        return _safe_parse_json(raw) or []

    async def negotiation_prep(
        self,
        job_title: str,
        location: str,
    ) -> Dict[str, str]:
        """Prepare salary negotiation info."""
        prompt = f"""
Provide realistic salary range and negotiation tips for '{job_title}' in '{location}'.
Return JSON: salaryRange, tips.
"""
        raw = await self._run_llm(
            prompt,
            "Salary negotiation coach.",
            response_mime="application/json",
        )
        return _safe_parse_json(raw) or {"salaryRange": "", "tips": ""}

    async def interview_story(self, brain_dump: str) -> str:
        """Refine story into STAR format answer."""
        return await self._run_llm(
            f"Refine into STAR answer with bold key metrics: {brain_dump}",
            "Storytelling coach for interviews.",
        )

    async def interview_questions(self, job_description: str) -> List[Dict[str, Any]]:
        """Generate likely interview questions."""
        prompt = f"Generate 5-7 likely interview questions (behavioral + technical) for: {job_description}"
        raw = await self._run_llm(
            prompt,
            "Hiring manager.",
            response_mime="application/json",
        )
        return _safe_parse_json(raw) or []

    async def reframe_feedback(self, feedback_text: str) -> str:
        """Reframe feedback into growth plan."""
        return await self._run_llm(
            f"Reframe into positive growth plan: {feedback_text}",
            "Growth mindset coach.",
        )

    async def video_recommendations(
        self,
        target_role: str,
        milestone: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Recommend educational videos for milestone."""
        prompt = f"""
Recommend 3-5 educational YouTube videos for milestone '{milestone.get("milestoneTitle")}' toward '{target_role}'.
Return JSON array: title, channel, description, videoId.
"""
        raw = await self._run_llm(
            prompt,
            "Practical resource curator.",
            response_mime="application/json",
        )
        return _safe_parse_json(raw) or []

    async def career_chat(
        self,
        message: str,
        profile: Dict[str, Any],
        document_history: Optional[List[Any]] = None,
    ) -> str:
        """Career coaching chat response."""
        prompt = f"""
You are Keju, expert career coach. Respond concisely with actionable advice. End with a follow-up question.

Profile: {json.dumps(profile, indent=2)}
Recent documents: {len(document_history or [])}
User: {message}
"""
        return await self._run_llm(prompt, "Personalized, encouraging career guidance.")
