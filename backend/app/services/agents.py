import json
import re
from typing import Any, Dict, Optional

from app.config import get_settings


try:
    from google.adk.agents import LlmAgent
    from google.adk.models import Gemini
    from google.adk.runners import InMemoryRunner
    from google.adk.sessions import Session
except ImportError:
    LlmAgent = None  # type: ignore

try:
    import google.genai as genai
except ImportError:
    genai = None  # type: ignore


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
    Wrapper around Google ADK (preferred) with a google-genai fallback.
    Uses Gemini 3.0 Pro for higher-quality outputs.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self.api_key = settings.gemini_api_key
        self.model_name = "gemini-3.0-pro"

    def _ensure_api_key(self) -> None:
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured.")

    async def _run_llm(
        self,
        prompt: str,
        system_instruction: str,
        description: str,
        response_mime: Optional[str] = None,
    ) -> str:
        self._ensure_api_key()

        # Preferred path: ADK
        if LlmAgent is not None:
            model = Gemini(model=self.model_name, api_key=self.api_key)
            agent = LlmAgent(
                name="keju_agent",
                model=model,
                description=description,
                instruction=system_instruction,
            )
            runner = InMemoryRunner(agent=agent, session=Session(user_id="keju-backend"))
            result = await runner.run_async(prompt)
            if hasattr(result, "response") and hasattr(result.response, "text"):
                return result.response.text or ""
            if hasattr(result, "text"):
                return result.text or ""
            return json.dumps(result, default=str)

        # Fallback: google-genai
        if genai is None:
            return json.dumps(_fallback_mock("google-genai not installed"))

        client = genai.Client(api_key=self.api_key)
        resp = client.models.generate_content(
            model=self.model_name,
            contents=[{"role": "user", "parts": [prompt]}],
            config={"system_instruction": system_instruction, "response_mime_type": response_mime or "text/plain"},
        )
        return resp.text or ""

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
