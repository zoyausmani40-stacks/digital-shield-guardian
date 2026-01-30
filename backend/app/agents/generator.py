import json
from typing import Dict, Any, Optional
from langchain_google_genai import ChatGoogleGenerativeAI

_llm = None

def get_llm():
    """Lazy initialization of LLM"""
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0
        )
    return _llm

def output_generator_agent(
    evidence: Dict[str, Any],
    feedback: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Output Generator Agent

    - Generates or revises a structured cyber risk assessment
    - If evaluator feedback is provided, revises the output accordingly
    - Outputs JSON only (no prose)
    """

    revision_instruction = ""
    if feedback is not None:
        revision_instruction = f"""
You have received evaluator feedback indicating issues with the previous output.

Issues identified:
{json.dumps(feedback.get("issues", []), indent=2)}

Suggested changes:
{json.dumps(feedback.get("suggested_changes", {}), indent=2)}

Revise the output to strictly address these issues.
Do NOT introduce new claims.
"""

    prompt = f"""
You are a cyber risk analysis agent.

Your job:
- Analyze the provided evidence
- Compute a cyber risk score between 0 and 100
- Assign a risk level (Low, Medium, High)
- List the main risk factors
- Suggest concrete mitigation steps

{revision_instruction}

STRICT RULES:
- Use ONLY the evidence provided
- Do NOT invent facts
- Do NOT mention tools or APIs
- Do NOT output explanations outside JSON
- Output MUST be valid JSON
- Do NOT use markdown or code blocks

Risk level thresholds:
- 0–30: Low
- 31–60: Medium
- 61–100: High

Evidence:
{json.dumps(evidence, indent=2)}

Return JSON in EXACTLY this format:
{{
  "risk_score": number,
  "risk_level": "Low|Medium|High",
  "risk_factors": [string],
  "mitigations": [string]
}}
"""

    llm = get_llm()
    response = llm.invoke(prompt)
    raw = response.content.strip()

    # Gemini sometimes adds code fences
    if raw.startswith("```"):
        raw = raw.strip("```").strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return {
            "risk_score": 0,
            "risk_level": "Low",
            "risk_factors": [],
            "mitigations": ["Unable to generate risk assessment due to parsing error"]
        }

    return parsed
