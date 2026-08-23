from database import SessionLocal
from models import Job
from ai.job_processor import process_unclassified_jobs


db = SessionLocal()

try:

    result = process_unclassified_jobs(
        db,
        limit=3,
    )

    print("\nAI PROCESSING RESULT")
    print(result)

    jobs = (
        db.query(Job)
        .filter(
            Job.ai_processed == True
        )
        .limit(3)
        .all()
    )

    for job in jobs:

        print("\n------------------------------")
        print("TITLE:", job.title)
        print("ROLE:", job.role_category)
        print("SKILLS:", job.ai_skills)
        print("KEYWORDS:", job.technical_keywords)
        print("EXPERIENCE:", job.experience_level)
        print("TAGS:", job.ai_tags)

finally:

    db.close()