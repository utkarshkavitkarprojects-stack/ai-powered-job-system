import json

from sqlalchemy.orm import Session

from models import Job
from ai.job_classifier import classify_job


def process_job(
    db: Session,
    job: Job,
):
    """
    Classify one job using Gemini
    and persist the structured AI signals.
    """

    description = (
        job.description
        or job.formatted_description
        or ""
    ).strip()

    if not description:
        return False

    result = classify_job(description)

    job.ai_skills = json.dumps(
        result.get("skills", []),
        ensure_ascii=False,
    )

    job.role_category = (
        result.get("role_category")
    )

    job.technical_keywords = json.dumps(
        result.get("technical_keywords", []),
        ensure_ascii=False,
    )

    job.experience_level = (
        result.get("experience_level")
    )

    job.min_experience_years = (
        result.get("min_experience_years")
    )

    job.max_experience_years = (
        result.get("max_experience_years")
    )

    job.ai_tags = json.dumps(
        result.get("tags", []),
        ensure_ascii=False,
    )

    job.ai_processed = True

    db.commit()
    db.refresh(job)

    return True


def process_unclassified_jobs(
    db: Session,
    limit: int = 10,
):
    """
    Process a limited number of unclassified jobs.

    Limit is intentional so we don't accidentally
    burn the Gemini API quota on the entire dataset.
    """

    jobs = (
        db.query(Job)
        .filter(
            Job.ai_processed == False
        )
        .limit(limit)
        .all()
    )

    processed = 0
    failed = 0

    for job in jobs:

        try:

            success = process_job(
                db,
                job,
            )

            if success:
                processed += 1

        except Exception as error:

            failed += 1

            print(
                f"Failed job {job.job_id}: {error}"
            )

    return {
        "requested": limit,
        "found": len(jobs),
        "processed": processed,
        "failed": failed,
    }