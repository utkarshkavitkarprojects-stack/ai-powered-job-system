from sqlalchemy import text

from database import engine


AI_COLUMNS = {
    "ai_skills": "TEXT",
    "role_category": "VARCHAR(200)",
    "technical_keywords": "TEXT",
    "experience_level": "VARCHAR(100)",
    "min_experience_years": "FLOAT",
    "max_experience_years": "FLOAT",
    "ai_tags": "TEXT",
    "ai_processed": "BOOLEAN DEFAULT 0",
}


def column_exists(connection, table_name, column_name):
    result = connection.execute(
        text(f"PRAGMA table_info({table_name})")
    )

    columns = result.fetchall()

    return any(
        row[1] == column_name
        for row in columns
    )


def migrate():
    with engine.begin() as connection:

        for column_name, column_type in AI_COLUMNS.items():

            if column_exists(
                connection,
                "jobs",
                column_name,
            ):
                print(
                    f"✓ {column_name} already exists"
                )
                continue

            connection.execute(
                text(
                    f"ALTER TABLE jobs "
                    f"ADD COLUMN {column_name} "
                    f"{column_type}"
                )
            )

            print(
                f"+ Added {column_name}"
            )


if __name__ == "__main__":
    migrate()

    print(
        "\nAI database migration completed."
    )