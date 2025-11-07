# PR #2 Migration Instructions

## Prerequisites
1. Ensure Docker is running
2. Start PostgreSQL container:
   ```bash
   docker-compose up -d
   ```

## Running the Migration

Once the database is running, execute the following commands:

```bash
cd backend

# Generate Prisma Client (already done)
npx prisma generate

# Create and apply the initial migration
npx prisma migrate dev --name init

# Seed the database with test data
npx prisma db seed
```

## Verification

After seeding, you can verify the data using Prisma Studio:

```bash
npx prisma studio
```

This will open a browser interface where you can view all the seeded data.

## Test Credentials

After seeding, you can use these test accounts:

- **Admin:** admin@flightpro.com / password123
- **Student 1:** sarah.johnson@example.com / password123 (Student Pilot)
- **Student 2:** michael.chen@example.com / password123 (Private Pilot)
- **Student 3:** emily.rodriguez@example.com / password123 (Instrument Rated)
- **Instructor 1:** john.smith@flightpro.com / password123
- **Instructor 2:** jane.doe@flightpro.com / password123

