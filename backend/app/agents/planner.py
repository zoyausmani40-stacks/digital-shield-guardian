import json
from typing import Dict, Any, List
from langchain_google_genai import ChatGoogleGenerativeAI

ALLOWED_TASKS = [
    "check_breach_exposure",
    "analyze_github_public_data",
    "check_username_reuse",
    "analyze_bio_exposure"
]

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

def planner_agent_llm(user_input: Dict[str, Any]) -> Dict[str, Any]:
    """
    LLM-based Planner Agent using Gemini

    - Decides which analysis tasks are relevant
    - Enforces a strict JSON output schema
    - Sanitizes output to prevent hallucinated tasks
    """

    prompt = f"""
You are a planner agent for a cyber risk analysis system.

Your ONLY job:
- Look at the user input
- Decide which analysis tasks apply

STRICT RULES:
- You may ONLY select tasks from the allowed list below
- Do NOT invent new tasks
- Do NOT explain your reasoning
- Do NOT use markdown or code blocks
- Output MUST be valid JSON and nothing else

Allowed tasks:
{ALLOWED_TASKS}

User input:
{json.dumps(user_input, indent=2)}

Return JSON in EXACTLY this format:
{{
  "tasks": [string],
  "notes": [string]
}}
"""

    llm = get_llm()
    response = llm.invoke(prompt)

    raw = response.content.strip()

    # Gemini sometimes adds code fences; remove them safely
    if raw.startswith("```"):
        raw = raw.strip("```").strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return {
            "normalized_input": user_input,
            "tasks": [],
            "notes": ["Planner LLM returned invalid JSON"]
        }

    raw_tasks = parsed.get("tasks", [])
    notes = parsed.get("notes", [])

    # Enforce whitelist
    tasks: List[str] = [t for t in raw_tasks if t in ALLOWED_TASKS]

    if not tasks:
        notes.append("No valid tasks selected by planner")

    return {
        "normalized_input": user_input,
        "tasks": tasks,
        "notes": notes
    }
