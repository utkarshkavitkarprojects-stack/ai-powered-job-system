import json
from typing import Any, Dict, Optional

from ai.gemini import generate_text


JOB_CLASSIFICATION_PROMPT = """
You are an expert job-market classification system.

Analyze the job description below and return ONLY valid JSON.

Extract:

1. skills
   - Technical and relevant professional skills
   - Include programming languages, frameworks, databases,
     cloud platforms, ML/AI technologies, analytics tools,
     and other meaningful technologies.

2. role_category
   - Choose the most appropriate category.
   - Examples:
     Data Science
     Data Analytics
     Machine Learning
     AI / Generative AI
     Software Engineering
     Data Engineering
     Business Analytics
     Business Intelligence
     DevOps / MLOps
     Cloud Engineering
     Product / Business
     Other

3. technical_keywords
   - Important technical terms from the job description.

4. experience_level
   - Choose one:
     Fresher
     Entry Level
     Mid Level
     Senior
     Lead
     Unknown

5. min_experience_years
   - Numeric value if explicitly available.
   - Otherwise null.

6. max_experience_years
   - Numeric value if explicitly available.
   - Otherwise null.

7. tags
   - 5 to 15 concise discovery tags.
   - Examples:
     Python
     Machine Learning
     SQL
     Generative AI
     Fresher
     Remote
     AWS

Return exactly this structure:

{
  "skills": [],
  "role_category": "",
  "technical_keywords": [],
  "experience_level": "",
  "min_experience_years": null,
  "max_experience_years": null,
  "tags": []
}

Rules:
- Return JSON only.
- Do not add markdown.
- Do not invent skills that are not reasonably supported by the description.
- Normalize duplicate skills.
- Prefer standard technology names.
- If information is unavailable, use [] or null.

JOB DESCRIPTION:
"""


def _clean_json_response(text: str) -> str:
    """
    Remove accidental markdown code fences from Gemini output.
    """

    text = text.strip()

    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


def classify_job(
    job_description: str,
    api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Analyze one job description using Gemini.

    Returns structured classification data.
    """

    if not job_description or not job_description.strip():
        return {
            "skills": [],
            "role_category": "Other",
            "technical_keywords": [],
            "experience_level": "Unknown",
            "min_experience_years": None,
            "max_experience_years": None,
            "tags": [],
        }

    prompt = (
        JOB_CLASSIFICATION_PROMPT
        + "\n"
        + job_description[:30000]
    )

    response = generate_text(
        prompt,
        api_key=api_key,
    )

    cleaned = _clean_json_response(response)

    try:
        result = json.loads(cleaned)

    except json.JSONDecodeError as exc:
        raise ValueError(
            "Gemini returned invalid JSON for job classification."
        ) from exc

    return {
        "skills": result.get("skills", []),
        "role_category": result.get(
            "role_category",
            "Other",
        ),
        "technical_keywords": result.get(
            "technical_keywords",
            [],
        ),
        "experience_level": result.get(
            "experience_level",
            "Unknown",
        ),
        "min_experience_years": result.get(
            "min_experience_years"
        ),
        "max_experience_years": result.get(
            "max_experience_years"
        ),
        "tags": result.get("tags", []),
    }