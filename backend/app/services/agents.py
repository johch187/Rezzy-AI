import json
import logging
import os
import re
from typing import Any, Dict, Optional

from app.config import get_settings

try:
    import vertexai
    # Use stable API instead of preview
    from vertexai.generative_models import GenerationConfig, GenerativeModel, Part
except ImportError:
    vertexai = None  # type: ignore
    GenerationConfig = None  # type: ignore
    GenerativeModel = None  # type: ignore
    Part = None  # type: ignore

try:
    import google.genai as genai
except ImportError:
    genai = None  # type: ignore

# Import GCP exceptions for better error handling
try:
    from google.api_core import exceptions as gcp_exceptions
except ImportError:
    gcp_exceptions = None  # type: ignore


logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION CONSTANTS - Update these to change models/regions easily
# ============================================================================

# Default Gemini model (primary model to use)
DEFAULT_GEMINI_MODEL = "gemini-3-pro-preview"

# Fallback Gemini models (tried in order if primary model fails)
FALLBACK_GEMINI_MODELS = ["gemini-2.5-pro"]

# Default GCP region for Vertex AI
# Note: europe-north1 is supported according to Vertex AI documentation
# https://docs.cloud.google.com/vertex-ai/docs/general/locations#europe
DEFAULT_GCP_REGION = "europe-north1"  # Changed from us-central1 to match your deployment

# Region mapping: Map Cloud Run regions to Vertex AI regions
# Some Cloud Run regions don't have Vertex AI support, so we map them
CLOUD_RUN_TO_VERTEX_AI_REGION_MAP = {
    'europe-north2': 'europe-north1',  # Cloud Run supports europe-north2, but Vertex AI doesn't
}

# Vertex AI supported regions (from official documentation)
# https://docs.cloud.google.com/vertex-ai/docs/general/locations#europe
VERTEX_AI_SUPPORTED_REGIONS = {
    # United States
    'us-central1', 'us-east1', 'us-east4', 'us-east5', 'us-west1', 'us-west2', 
    'us-west3', 'us-west4', 'us-south1',
    # Canada
    'northamerica-northeast1', 'northamerica-northeast2',
    # South America
    'southamerica-east1', 'southamerica-west1',
    # Europe (including europe-north1)
    'europe-west1', 'europe-west2', 'europe-west3', 'europe-west4', 'europe-west6',
    'europe-west8', 'europe-west9', 'europe-west12', 'europe-central2',
    'europe-north1', 'europe-southwest1',
    # Asia Pacific
    'asia-east1', 'asia-east2', 'asia-northeast1', 'asia-northeast2', 'asia-northeast3',
    'asia-south1', 'asia-south2', 'asia-southeast1', 'asia-southeast2',
    'australia-southeast1', 'australia-southeast2',
    # Middle East
    'me-central1', 'me-central2', 'me-west1',
    # Africa
    'africa-south1',
    # Global (for preview models)
    'global'
}

# ============================================================================

# Detect if we're running in production (Cloud Run)
def _is_production() -> bool:
    """Detect if running in Cloud Run production environment."""
    # Cloud Run sets K_SERVICE environment variable
    return bool(os.getenv("K_SERVICE")) or bool(os.getenv("GAE_ENV"))


def _fallback_mock(message: str) -> Dict[str, Any]:
    return {"text": f"[mock] {message}"}


def _safe_parse_json(text: str) -> Any:
    if not text:
        return None
    stripped = text.strip()
    # Remove code fences if present
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?", "", stripped, flags=re.IGNORECASE | re.MULTILINE)
        stripped = re.sub(r"```$", "", stripped, flags=re.MULTILINE)
        stripped = stripped.strip()
    try:
        return json.loads(stripped)
    except Exception:
        return None


class AgentService:
    """
    Wrapper around Vertex AI (preferred via service account/ADC) with a google-genai API key fallback.
    Uses Gemini Pro for higher-quality outputs.
    """

    def __init__(self) -> None:
        try:
            settings = get_settings()
        except Exception as exc:
            logger.error("Failed to load settings during AgentService init: %s", exc)
            # Use defaults to allow app to start, but LLM calls will fail with clear error
            self.api_key = None
            self.project_id = None
            self.location = DEFAULT_GCP_REGION
            self.model_name = DEFAULT_GEMINI_MODEL
            self.vertex_model = None
            return
        
        self.api_key = settings.gemini_api_key
        self.project_id = settings.gcp_project_id
        
        # Use configured region or default (now defaults to europe-north1)
        requested_region = settings.gcp_region or DEFAULT_GCP_REGION
        
        # Use configured model name or default
        self.model_name = getattr(settings, 'gemini_model_name', None) or DEFAULT_GEMINI_MODEL
        
        self.vertex_model: Optional[GenerativeModel] = None
        self.vertex_ai_initialized = False

        # Prefer Vertex AI with application default credentials (e.g., Cloud Run service account).
        self.is_production = _is_production()
        
        # Map Cloud Run regions to Vertex AI regions if needed
        # Use mapped region if available, otherwise use requested region
        self.location = CLOUD_RUN_TO_VERTEX_AI_REGION_MAP.get(requested_region, requested_region)
        
        # Store requested region for later use
        self.requested_region = requested_region
        
        # Validate region is supported by Vertex AI
        if self.location not in VERTEX_AI_SUPPORTED_REGIONS:
            error_msg = (
                f"Region '{self.location}' is not supported by Vertex AI. "
                f"Supported regions: {', '.join(sorted(VERTEX_AI_SUPPORTED_REGIONS))}. "
            )
            if requested_region != self.location:
                error_msg += f"Note: Cloud Run region '{requested_region}' was mapped to '{self.location}'."
            else:
                error_msg += f"Please set GCP_REGION to a supported region (e.g., '{DEFAULT_GCP_REGION}' for Europe)."
            
            if self.is_production:
                logger.error("CRITICAL: %s", error_msg)
                raise RuntimeError(error_msg)
            else:
                logger.warning("%s", error_msg)
        
        if vertexai is not None and self.project_id:
            try:
                vertexai.init(project=self.project_id, location=self.location)
                # Try to initialize model to verify it exists (but don't store it yet)
                # We'll create model instances per-request with system_instruction
                try:
                    test_model = GenerativeModel(self.model_name)
                    # If successful, model exists in this region
                    self.vertex_ai_initialized = True
                    if self.requested_region != self.location:
                        logger.info(
                            "Vertex AI initialized: project=%s, Cloud Run region=%s mapped to Vertex AI region=%s",
                            self.project_id, self.requested_region, self.location
                        )
                    else:
                        logger.info("Vertex AI initialized successfully for project %s in region %s", self.project_id, self.location)
                except Exception as model_check_error:
                    # Model might not be available in this region, try 'global' location
                    if "not found" in str(model_check_error).lower() or "404" in str(model_check_error):
                        logger.warning("Model '%s' not found in region %s, trying 'global' location", self.model_name, self.location)
                        try:
                            vertexai.init(project=self.project_id, location="global")
                            test_model = GenerativeModel(self.model_name)
                            self.location = "global"  # Update location to global
                            self.vertex_ai_initialized = True
                            logger.info("Vertex AI initialized with 'global' location for model '%s'", self.model_name)
                        except Exception as global_error:
                            logger.error("Model '%s' also not found in 'global' location: %s", self.model_name, global_error)
                            self.vertex_ai_initialized = False
                    else:
                        raise
            except Exception as exc:  # pragma: no cover - initialization happens at runtime
                error_msg = str(exc)
                # Check if it's a region-related error
                if "Unsupported region" in error_msg or "region" in error_msg.lower():
                    # Suggest appropriate region based on requested region
                    if "europe" in self.requested_region.lower():
                        suggested_region = DEFAULT_GCP_REGION  # europe-north1
                    else:
                        suggested_region = "us-central1"
                    error_msg += f" Try setting GCP_REGION={suggested_region} in your Cloud Run environment variables."
                
                if self.is_production:
                    logger.error("CRITICAL: Vertex AI init failed in production. Error: %s", error_msg)
                    raise RuntimeError(
                        f"Vertex AI initialization failed in production. "
                        f"Check service account permissions and project configuration. {error_msg}"
                    ) from exc
                else:
                    logger.warning("Vertex AI init failed; falling back to API key client: %s", exc)
        elif not self.api_key:
            if self.is_production:
                raise RuntimeError(
                    "CRITICAL: No Vertex AI project_id configured in production. "
                    "Set GCP_PROJECT_ID and GCP_REGION environment variables. "
                    "API key fallback is not allowed in production."
                )
            logger.warning("AgentService: No Vertex AI project_id and no GEMINI_API_KEY fallback configured. LLM features will be unavailable.")

    async def _run_llm(
        self,
        prompt: str,
        system_instruction: str,
        description: str,
        response_mime: Optional[str] = None,
    ) -> str:
        # Preferred path: Vertex AI with service account / ADC (no API key).
        if self.vertex_ai_initialized and GenerationConfig is not None:
            try:
                # Create generation config
                generation_config = GenerationConfig(
                        response_mime_type=response_mime or "text/plain",
                        temperature=0.4,
                        top_p=0.95,
                )
                
                # In Vertex AI SDK, system_instruction should be passed when creating the model instance
                # Create a model instance with system_instruction for this request
                # This is the correct pattern for the latest SDK
                # Ensure Vertex AI is initialized with correct location
                if not self.vertex_ai_initialized:
                    # Re-initialize if needed
                    vertexai.init(project=self.project_id, location=self.location)
                    self.vertex_ai_initialized = True
                
                model_with_system = None
                model_error = None
                
                # Try to create model instance - handle region/model availability issues
                try:
                    model_with_system = GenerativeModel(
                        self.model_name,
                        system_instruction=system_instruction
                    )
                except Exception as initial_error:
                    model_error = initial_error
                    error_str = str(initial_error).lower()
                    
                    # If model not found, try 'global' location (required for some preview models)
                    if ("not found" in error_str or "404" in error_str) and self.location != "global":
                        logger.warning("Model '%s' not found in region %s, trying 'global' location", self.model_name, self.location)
                        try:
                            vertexai.init(project=self.project_id, location="global")
                            model_with_system = GenerativeModel(
                                self.model_name,
                                system_instruction=system_instruction
                            )
                            self.location = "global"  # Update location for future requests
                            logger.info("Successfully using model '%s' in 'global' location", self.model_name)
                        except Exception as global_error:
                            logger.warning("Model '%s' also not found in 'global' location: %s", self.model_name, global_error)
                            model_error = global_error
                    
                    # If still not found, try fallback models
                    if model_with_system is None:
                        error_str = str(model_error).lower()
                        if "not found" in error_str or "404" in error_str or "does not have access" in error_str:
                            logger.warning("Model '%s' not available. Trying fallback models...", self.model_name)
                            # Try fallback models in order of preference (using configured fallback models)
                            fallback_models = FALLBACK_GEMINI_MODELS
                            model_found = False
                            
                            # Reset to original location for fallback attempts
                            if self.location == "global":
                                vertexai.init(project=self.project_id, location=self.requested_region)
                                self.location = self.requested_region
                            
                            for fallback_model in fallback_models:
                                if fallback_model == self.model_name:
                                    continue  # Skip if already tried
                                try:
                                    logger.warning("Trying fallback model: %s", fallback_model)
                                    model_with_system = GenerativeModel(
                                        fallback_model,
                                        system_instruction=system_instruction
                                    )
                                    logger.info("Successfully using fallback model: %s", fallback_model)
                                    model_found = True
                                    break
                                except Exception as fallback_error:
                                    logger.warning("Fallback model %s also failed: %s", fallback_model, fallback_error)
                                    # Try global location for fallback too
                                    if "not found" in str(fallback_error).lower():
                                        try:
                                            vertexai.init(project=self.project_id, location="global")
                                            model_with_system = GenerativeModel(
                                                fallback_model,
                                                system_instruction=system_instruction
                                            )
                                            self.location = "global"
                                            logger.info("Successfully using fallback model %s in 'global' location", fallback_model)
                                            model_found = True
                                            break
                                        except Exception:
                                            continue
                            
                            if not model_found:
                                raise RuntimeError(
                                    f"Model '{self.model_name}' not available in region {self.location} or 'global', "
                                    f"and fallback models also failed. "
                                    f"Please check: 1) Model is available in your region, "
                                    f"2) Vertex AI API is enabled, 3) Service account has permissions. "
                                    f"Note: Gemini 3 Pro may not be available in all regions yet. "
                                    f"Original error: {model_error}"
                                ) from model_error
                        else:
                            raise
                
                # Use the successfully created model
                if model_with_system is None:
                    raise RuntimeError("Failed to create model instance") from model_error
                
                # Use Part objects for proper prompt formatting (latest SDK pattern)
                # String prompts are automatically converted, but explicit Part is more robust
                prompt_parts = [prompt] if Part is None else [Part.from_text(prompt)]
                
                # Generate content with the model instance that has system_instruction
                response = model_with_system.generate_content(
                    prompt_parts,
                    generation_config=generation_config,
                )
                
                # Handle response according to latest SDK structure
                # Try direct .text attribute first (convenience method)
                if hasattr(response, "text") and response.text:
                    return response.text
                
                # Fallback to explicit structure (latest SDK pattern)
                if hasattr(response, "candidates") and response.candidates:
                    candidate = response.candidates[0]
                    if hasattr(candidate, "content") and candidate.content:
                        if hasattr(candidate.content, "parts") and candidate.content.parts:
                            part = candidate.content.parts[0]
                            if hasattr(part, "text"):
                                return part.text or ""
                
                # Last resort: serialize response
                return json.dumps(response, default=str)
            except Exception as exc:  # pragma: no cover - runtime path
                # Provide more specific error messages based on exception type
                error_type = type(exc).__name__
                error_msg = str(exc)
                
                if gcp_exceptions:
                    if isinstance(exc, gcp_exceptions.PermissionDenied):
                        logger.error("CRITICAL: Vertex AI permission denied. Check service account has 'roles/aiplatform.user' role.")
                    elif isinstance(exc, gcp_exceptions.ResourceExhausted):
                        logger.error("CRITICAL: Vertex AI quota exceeded. Check your project quotas.")
                    elif isinstance(exc, gcp_exceptions.InvalidArgument):
                        logger.error("CRITICAL: Vertex AI invalid argument. Check prompt format and model configuration.")
                
                if self.is_production:
                    logger.error("CRITICAL: Vertex AI request failed in production. Error type: %s, Message: %s", error_type, error_msg)
                    raise RuntimeError(
                        f"Vertex AI request failed in production ({error_type}). "
                        f"Check service account permissions and project configuration. Error: {error_msg}"
                    ) from exc
                else:
                    logger.error("Vertex AI request failed; falling back to API key client. Error: %s", exc)

        # Fallback: google-genai API key path (ONLY for local dev, NOT allowed in production).
        if self.is_production:
            raise RuntimeError(
                "CRITICAL: Vertex AI is not available and API key fallback is not allowed in production. "
                "Ensure Vertex AI is properly configured with service account permissions."
            )
        
        if genai is not None and self.api_key:
            client = genai.Client(api_key=self.api_key)
            resp = client.models.generate_content(
                model=self.model_name,
                contents=[{"role": "user", "parts": [prompt]}],
                config={"system_instruction": system_instruction, "response_mime_type": response_mime or "text/plain"},
            )
            return resp.text or ""

        raise RuntimeError(
            "No Vertex AI access (check service account roles/project) and GEMINI_API_KEY not provided for fallback."
        )

    async def generate_documents(self, profile: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        You are an expert career writer. Create tailored documents based on:
        PROFILE JSON:
        {json.dumps(profile, indent=2)}

        OPTIONS:
        {json.dumps(options, indent=2)}

        Output JSON with keys "resume" (markdown) and "coverLetter" (markdown). If not requested, return null for that key.
        """
        system = "Generate tailored resume and cover letter. Be concise and align with the job description."
        raw = await self._run_llm(prompt, system, description="Document generator", response_mime="application/json")
        parsed = _safe_parse_json(raw) or {"resume": None, "coverLetter": None}
        return {
            "resume": parsed.get("resume"),
            "coverLetter": parsed.get("coverLetter"),
            "analysis": parsed.get("analysis"),
        }

    async def parse_resume(self, text: str) -> Dict[str, Any]:
        prompt = f"""
        Parse the following resume text into structured JSON fields matching the app schema.
        Resume text:
        {text}

        Return JSON with keys: fullName, email, phone, experience (array with company,title,startDate,endDate,achievements),
        education (array with institution,degree,fieldOfStudy,startDate,endDate),
        technicalSkills (array of strings).
        """
        system = "You are a meticulous resume parser. Return strict JSON."
        raw = await self._run_llm(prompt, system, description="Resume parser", response_mime="application/json")
        parsed = _safe_parse_json(raw)
        return parsed or {"fullName": "", "experience": [], "education": [], "technicalSkills": []}

    async def career_path(self, profile: Dict[str, Any], current_role: str, target_role: str) -> Dict[str, Any]:
        prompt = f"""
        Build a realistic career path from '{current_role}' to '{target_role}' based on this profile:
        {json.dumps(profile, indent=2)}

        Return JSON with keys: currentRole, targetRole, path (array of milestones with timeframe, milestoneTitle, milestoneDescription, actionItems: category,title,description).
        """
        system = "You are a strategic career coach producing actionable milestones."
        raw = await self._run_llm(prompt, system, description="Career path planner", response_mime="application/json")
        parsed = _safe_parse_json(raw)
        return parsed or {"currentRole": current_role, "targetRole": target_role, "path": []}

    async def networking_brief(self, profile: Dict[str, Any], counterpart_info: str) -> str:
        prompt = f"""
        Create a coffee chat brief in markdown with sections: Quick Overview, Shared Touchpoints, Smart Conversation Starters, Industry Context, Closing Ideas.
        Profile: {json.dumps(profile, indent=2)}
        Counterpart: {counterpart_info}
        """
        system = "You are a warm, strategic networking coach."
        return await self._run_llm(prompt, system, description="Networking brief")

    async def networking_reach_out(self, profile: Dict[str, Any], counterpart_info: str) -> str:
        prompt = f"""
        Draft a concise, personalized outreach message (no subject line) using this profile and counterpart info.
        Profile: {json.dumps(profile, indent=2)}
        Counterpart: {counterpart_info}
        """
        system = "You are an expert communicator."
        return await self._run_llm(prompt, system, description="Reach-out writer")

    async def analyze_application(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        prompt = f"""
        Evaluate resume vs job description. Provide JSON: fitScore (0-100), gapAnalysis (markdown), keywordOptimization (markdown), impactEnhancer (markdown).
        Resume: {resume_text}
        Job: {job_description}
        """
        system = "You are a senior HR analyst giving honest, constructive feedback."
        raw = await self._run_llm(prompt, system, description="Application fit analysis", response_mime="application/json")
        parsed = _safe_parse_json(raw)
        return parsed or {"fitScore": 0, "gapAnalysis": "", "keywordOptimization": "", "impactEnhancer": ""}

    async def mentor_match(self, topic: str, faculty_list: str) -> Any:
        prompt = f"""
        Match thesis topic to top 3 faculty mentors. Return JSON array of objects: name, score (0-100), reasoning.
        Topic: {topic}
        Faculty: {faculty_list}
        """
        system = "You are an academic advisor."
        raw = await self._run_llm(prompt, system, description="Mentor matcher", response_mime="application/json")
        parsed = _safe_parse_json(raw)
        return parsed or []

    async def negotiation_prep(self, job_title: str, location: str) -> Dict[str, str]:
        prompt = f"""
        Provide realistic salary range and negotiation tips for role '{job_title}' in '{location}'. Return JSON: salaryRange, tips.
        """
        system = "You are a salary negotiation coach."
        raw = await self._run_llm(prompt, system, description="Negotiation prep", response_mime="application/json")
        parsed = _safe_parse_json(raw)
        return parsed or {"salaryRange": "", "tips": ""}

    async def interview_story(self, brain_dump: str) -> str:
        prompt = f"Refine this story into a STAR answer with bold key metrics. {brain_dump}"
        system = "You are a storytelling coach for interviews."
        return await self._run_llm(prompt, system, description="Interview STAR")

    async def interview_questions(self, job_description: str) -> Any:
        prompt = f"Generate 5-7 likely interview questions (behavioral + technical) for this JD: {job_description}"
        system = "You are a hiring manager."
        raw = await self._run_llm(prompt, system, description="Interview questions", response_mime="application/json")
        parsed = _safe_parse_json(raw)
        return parsed or []

    async def reframe_feedback(self, feedback_text: str) -> str:
        prompt = f"Reframe this feedback into a positive growth plan: {feedback_text}"
        system = "You are a growth mindset coach."
        return await self._run_llm(prompt, system, description="Feedback reframer")

    async def video_recommendations(self, target_role: str, milestone: Dict[str, Any]) -> Any:
        prompt = f"""
        Recommend 3-5 high-quality educational YouTube videos to help reach the milestone '{milestone.get("milestoneTitle")}' on the path to '{target_role}'.
        Include JSON array of objects: title, channel, description (why it helps), videoId (plausible 11-char ID).
        """
        system = "You are a concise, practical resource curator."
        raw = await self._run_llm(prompt, system, description="Video recommendations", response_mime="application/json")
        parsed = _safe_parse_json(raw)
        return parsed or []

    async def career_chat(self, message: str, profile: Dict[str, Any], document_history: Optional[list] = None) -> str:
        prompt = f"""
        You are Keju, an expert career coach. Respond concisely with actionable advice. Always end with a follow-up question.
        Profile: {json.dumps(profile, indent=2)}
        Recent documents count: {len(document_history or [])}
        User message: {message}
        """
        system = "Provide personalized, encouraging, and specific career guidance."
        return await self._run_llm(prompt, system, description="Career coach")
