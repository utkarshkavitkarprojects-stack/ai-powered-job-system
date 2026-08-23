import json
import re
from typing import Any, Dict, List

import fitz
from google import genai


# ============================================================
# TEXT EXTRACTION
# ============================================================

def extract_resume_text(pdf_bytes: bytes) -> str:
    """
    Extract text from an uploaded PDF using PyMuPDF.
    """

    if not pdf_bytes:
        raise ValueError("Uploaded PDF is empty.")

    try:
        document = fitz.open(
            stream=pdf_bytes,
            filetype="pdf",
        )

        pages = []

        for page in document:
            text = page.get_text("text")

            if text:
                pages.append(text)

        document.close()

        resume_text = "\n".join(pages).strip()

    except Exception as exc:
        raise ValueError(
            f"Unable to read PDF: {exc}"
        )

    if not resume_text:
        raise ValueError(
            "No readable text was found in the PDF."
        )

    # Protect the Gemini request from extremely large PDFs.
    return resume_text[:30000]


# ============================================================
# GEMINI RESPONSE HELPERS
# ============================================================

def clean_llm_response(text: str) -> str:

    if not text:
        return ""

    text = text.strip()

    if text.startswith("```json"):
        text = text[7:].strip()

    elif text.startswith("```"):
        text = text[3:].strip()

    if text.endswith("```"):
        text = text[:-3].strip()

    return text.strip()


def parse_json_response(text: str) -> Dict[str, Any]:

    text = clean_llm_response(text)

    try:
        return json.loads(text)

    except json.JSONDecodeError:

        match = re.search(
            r"\{.*\}",
            text,
            re.DOTALL,
        )

        if not match:
            raise ValueError(
                "Gemini did not return valid JSON."
            )

        try:
            return json.loads(
                match.group(0)
            )

        except json.JSONDecodeError as exc:
            raise ValueError(
                "Unable to parse Gemini profile response."
            ) from exc


# ============================================================
# RESUME ANALYSIS
# ============================================================

def analyze_resume(
    resume_text: str,
    api_key: str,
    model: str = "gemini-2.5-flash",
) -> Dict[str, Any]:
    """
    Analyze a resume using the user's Gemini API key.

    IMPORTANT:
    The API key exists only for this request.
    It is never stored in SQLite.
    """

    if not api_key or not api_key.strip():
        raise ValueError(
            "Gemini API key is required."
        )

    client = genai.Client(
        api_key=api_key.strip()
    )

    prompt = f"""
You are an expert technical recruiter, resume parser, and career analyst.

Analyze the following resume carefully.

RESUME:
{resume_text}

Return ONLY valid JSON using exactly this structure:

{{
    "name": "",
    "email": "",
    "phone": "",

    "profile_summary": "",

    "skills": [],

    "technologies": [],

    "experience": [
      {{
        "company": "company name",
        "role": "job title",
        "start_date": "YYYY-MM",
        "end_date": "YYYY-MM or present",
        "description": "short summary"
       }}
    ],

    "education": [
        {{
            "degree": "",
            "institution": "",
            "year": ""
        }}
    ],

    "certifications": [],

    "preferred_roles": [],

    "preferred_locations": [],

    "preferred_domains": [],

    "preferred_employment_types": [],

    "experience_level": "",

    "total_experience_years": 0.0,

    "keywords": []
}}

IMPORTANT EXTRACTION RULES:

1. Extract the candidate's exact name from the resume.
2. Extract email address exactly as written.
3. Extract phone number exactly as written.
4. Extract ALL relevant professional experience.
5. Calculate total professional experience from the employment history when possible.
6. Do NOT return 0 years if the resume clearly contains professional employment.
7. Include the candidate's current/recent role in preferred_roles when appropriate.
8. Infer realistic target roles from the candidate's actual skills and experience.
9. Examples of possible target roles include:
   - Data Analyst
   - Data Scientist
   - Machine Learning Engineer
   - Business Analyst
   - BI Analyst
   - AI/ML Engineer
   Only select roles genuinely supported by the resume.
10. Infer relevant domains from the resume when strongly supported.
11. Extract important job-search keywords including:
   - programming languages
   - ML/AI technologies
   - analytics tools
   - cloud technologies
   - deployment technologies
   - business/domain keywords
   - methodologies
12. Do not invent technologies or experience.
13. Do not treat university projects as professional employment.
14. Do not treat courses as professional employment.
15. Normalize duplicate skills and technologies.
16. Preserve structured education objects.
17. Infer experience level conservatively:
   - internship
   - entry level
   - junior
   - mid level
   - senior
18. If a field genuinely cannot be determined, return an empty string, empty list, or null.
19. Return valid JSON only.
20. For every experience entry, extract start_date and end_date.
21. Use YYYY-MM format whenever possible.
22. If employment is ongoing, use "present" as end_date.
23. Do not calculate total_experience_years yourself. Python will calculate it from the dates.
24. If exact month is unavailable but year is available, use YYYY-01 for start_date and YYYY-12 for completed employment, or YYYY-01 for present employment.
"""
    try:

        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )

    except Exception as exc:

        raise ValueError(
            f"Gemini resume analysis failed: {exc}"
        )

    response_text = getattr(
        response,
        "text",
        None,
    )

    if not response_text:
        response_text = str(response)

    profile = parse_json_response(
        response_text
    )

    return normalize_profile(
        profile
    )


# ============================================================
# PROFILE NORMALIZATION
# ============================================================

def normalize_string_list(
    value: Any,
) -> List[str]:

    if not value:
        return []

    if isinstance(value, str):
        value = [value]

    if not isinstance(value, list):
        return []

    result = []

    for item in value:

        if isinstance(item, dict):
            continue

        text = str(item).strip()

        if text and text.lower() not in {
            x.lower()
            for x in result
        }:
            result.append(text)

    return result


def normalize_profile(
    profile: Dict[str, Any],
) -> Dict[str, Any]:

    return {

        "name":
            str(
                profile.get(
                    "name",
                    "",
                )
            ).strip(),

        "email":
            str(
                profile.get(
                    "email",
                    "",
                )
            ).strip(),

        "phone":
            str(
                profile.get(
                    "phone",
                    "",
                )
            ).strip(),

        "profile_summary":
            str(
                profile.get(
                    "profile_summary",
                    "",
                )
            ).strip(),

        "skills":
            normalize_string_list(
                profile.get("skills")
            ),

        "technologies":
            normalize_string_list(
                profile.get("technologies")
            ),

        "experience":
            profile.get(
                "experience",
                [],
            ),

        "education":
            profile.get(
                "education",
                [],
            ),

        "certifications":
            normalize_string_list(
                profile.get(
                    "certifications"
                )
            ),

        "preferred_roles":
            normalize_string_list(
                profile.get(
                    "preferred_roles"
                )
            ),

        "preferred_locations":
            normalize_string_list(
                profile.get(
                    "preferred_locations"
                )
            ),

        "preferred_domains":
            normalize_string_list(
                profile.get(
                    "preferred_domains"
                )
            ),

        "preferred_employment_types":
            normalize_string_list(
                profile.get(
                    "preferred_employment_types"
                )
            ),

        "experience_level":
            str(
                profile.get(
                    "experience_level",
                    "",
                )
            ).strip(),

        "total_experience_years":
            safe_float(
                profile.get(
                    "total_experience_years"
                )
            ),

        "keywords":
            normalize_string_list(
                profile.get(
                    "keywords"
                )
            ),
    }

def safe_float(
    value: Any,
):

    try:
        if value is None:
            return None

        return float(value)

    except (
        TypeError,
        ValueError,
    ):
        return None


# ============================================================
# PROFILE JSON SERIALIZATION
# ============================================================

def json_string(
    value: Any,
) -> str:

    return json.dumps(
        value if value is not None else [],
        ensure_ascii=False,
    )