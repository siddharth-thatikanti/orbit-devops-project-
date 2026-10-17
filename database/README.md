# Database setup

This application uses PostgreSQL.

1. Install and start PostgreSQL.
2. Create the database and user (run in `psql` as a PostgreSQL administrator):

```sql
CREATE USER orbituser WITH PASSWORD '${DB_PASSWORD:?Set DB_PASSWORD in .env}';
CREATE DATABASE orbit OWNER orbituser;
```

3. Apply the schema from the project root:

```bash
psql -h localhost -U orbituser -d orbit -f database/schema.sql
```

Keep the database password consistent with `backend/.env`. Use a stronger password for any non-local environment.
