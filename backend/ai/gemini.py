import os
from typing import Optional

from dotenv import load_dotenv
from google import genai


# Load variables from backend/.env
load_dotenv()


DEFAULT_MODEL = "gemini-2.5-flash"


def get_gemini_client(api_key: Optional[str] = None):
    """
    Create a Gemini client.

    Priority:
    1. API key supplied at runtime
    2. GEMINI_API_KEY from .env / environment
    """

    key = api_key or os.getenv("GEMINI_API_KEY")

    if not key:
        raise ValueError(
            "Gemini API key is required."
        )

    return genai.Client(api_key=key)


def get_gemini_model() -> str:
    """
    Return the configured Gemini model.
    """

    return os.getenv(
        "GEMINI_MODEL",
        DEFAULT_MODEL,
    )


def generate_text(
    prompt: str,
    api_key: Optional[str] = None,
) -> str:
    """
    Generate a text response from Gemini.
    """

    client = get_gemini_client(api_key)

    response = client.models.generate_content(
        model=get_gemini_model(),
        contents=prompt,
    )

    return response.text or ""