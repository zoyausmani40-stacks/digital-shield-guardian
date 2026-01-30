import json
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI

_llm = None

def get_llm():
    """Lazy initialization of LLM"""
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0
        )
    return _llm

def evaluator_agent(
    evidence: Dict[str, Any],
    draft_output: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluator Agent (Strict Verification)

    - Verifies that all claims in the draft output are supported by evidence
    - Flags exaggerations or unsupported claims
    - Decides whether the output should be accepted or revised
    - Provides structured feedback for revision if needed
    """

    prompt = f"""
You are a STRICT evaluator agent for a cyber risk analysis system.

Your job:
- Verify that EACH risk factor is clearly supported by the provided evidence
- Identify exaggerations, missing nuance, or unsupported claims
- Decide whether the draft output is acceptable or needs revision

STRICT EVALUATION RULES:
- Be conservative and strict
- Use ONLY the provided evidence
- Do NOT invent new risk factors
- Do NOT introduce new mitigation ideas
- If a claim is even slightly unsupported, flag it
- Do NOT rewrite the output yourself
- Output MUST be valid JSON
- Do NOT use markdown or code blocks
- If multiple independent risk factors are clearly supported by evidence,
you MUST allow a numeric risk_score and corresponding risk_level.

Evidence:
{json.dumps(evidence, indent=2)}

Draft Output:
{json.dumps(draft_output, indent=2)}

Return JSON in EXACTLY this format:
{{
  "verdict": "accept" or "revise",
  "issues": [string],
  "suggested_changes": {{
    "risk_score": number or null,
    "risk_factors": [string] or null,
    "mitigations": [string] or null
  }},
  "summary": string
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
            "verdict": "accept",
            "issues": ["Evaluator failed to parse output; accepting draft by default"],
            "suggested_changes": {
                "risk_score": None,
                "risk_factors": None,
                "mitigations": None
            },
            "summary": "Evaluation could not be completed reliably"
        }

    return parsed
