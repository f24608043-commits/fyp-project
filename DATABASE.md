# Database Schema Documentation

## Overview

Lingo uses PostgreSQL as its database, hosted on Neon (serverless PostgreSQL). The database schema is managed using Drizzle ORM, which provides type-safe database operations and migrations.

## Database Tables

### courses

Stores language course information.

**Columns:**
- `id` (serial, primary key) - Unique identifier for the course
- `title` (text, not null) - Course title (e.g., "Spanish", "French")
- `image_src` (text, not null) - URL to course image/flag

**Relationships:**
- One-to-many with `units`
- One-to-many with `userProgress` (via activeCourseId)

**Example:**
```sql
INSERT INTO courses (title, image_src) VALUES ('Spanish', '/flags/es.svg');
```

---

### units

Organizes course content into thematic units.

**Columns:**
- `id` (serial, primary key) - Unique identifier for the unit
- `title` (text, not null) - Unit title (e.g., "Unit 1")
- `description` (text, not null) - Unit description (e.g., "Learn the basics of Spanish")
- `course_id` (integer, foreign key) - References `courses.id`
- `order` (integer, not null) - Order of units within the course

**Constraints:**
- `course_id` references `courses.id` with cascade delete

**Relationships:**
- Many-to-one with `courses`
- One-to-many with `lessons`

**Example:**
```sql
INSERT INTO units (title, description, course_id, order) 
VALUES ('Unit 1', 'Learn the basics', 1, 1);
```

---

### lessons

Individual lessons within units.

**Columns:**
- `id` (serial, primary key) - Unique identifier for the lesson
- `title` (text, not null) - Lesson title
- `unit_id` (integer, foreign key) - References `units.id`
- `order` (integer, not null) - Order of lessons within the unit

**Constraints:**
- `unit_id` references `units.id` with cascade delete

**Relationships:**
- Many-to-one with `units`
- One-to-many with `challenges`

**Example:**
```sql
INSERT INTO lessons (title, unit_id, order) 
VALUES ('Greetings', 1, 1);
```

---

### challenges

Individual questions/exercises within lessons.

**Columns:**
- `id` (serial, primary key) - Unique identifier for the challenge
- `lesson_id` (integer, foreign key) - References `lessons.id`
- `type` (enum, not null) - Challenge type: "SELECT" or "ASSIST"
- `question` (text, not null) - Challenge question text
- `order` (integer, not null) - Order of challenges within the lesson

**Constraints:**
- `lesson_id` references `lessons.id` with cascade delete
- `type` is an enum with values: "SELECT", "ASSIST"

**Relationships:**
- Many-to-one with `lessons`
- One-to-many with `challengeOptions`
- One-to-many with `challengeProgress`

**Example:**
```sql
INSERT INTO challenges (lesson_id, type, question, order) 
VALUES (1, 'SELECT', 'What is "hello" in Spanish?', 1);
```

---

### challenge_options

Possible answers for challenges.

**Columns:**
- `id` (serial, primary key) - Unique identifier for the option
- `challenge_id` (integer, foreign key) - References `challenges.id`
- `text` (text, not null) - Option text
- `correct` (boolean, not null) - Whether this is the correct answer
- `image_src` (text, nullable) - URL to option image (optional)
- `audio_src` (text, nullable) - URL to option audio (optional)

**Constraints:**
- `challenge_id` references `challenges.id` with cascade delete

**Relationships:**
- Many-to-one with `challenges`

**Example:**
```sql
INSERT INTO challenge_options (challenge_id, text, correct) 
VALUES (1, 'Hola', true);
INSERT INTO challenge_options (challenge_id, text, correct) 
VALUES (1, 'Adiós', false);
```

---

### challenge_progress

Tracks user completion of individual challenges.

**Columns:**
- `id` (serial, primary key) - Unique identifier for the progress record
- `user_id` (text, not null) - Clerk user ID
- `challenge_id` (integer, foreign key) - References `challenges.id`
- `completed` (boolean, not null, default: false) - Completion status

**Constraints:**
- `challenge_id` references `challenges.id` with cascade delete

**Relationships:**
- Many-to-one with `challenges`

**Example:**
```sql
INSERT INTO challenge_progress (user_id, challenge_id, completed) 
VALUES ('user_123', 1, true);
```

---

### user_progress

Tracks overall user progress and statistics.

**Columns:**
- `user_id` (text, primary key) - Clerk user ID
- `user_name` (text, not null, default: "User") - User's display name
- `user_image_src` (text, not null, default: "/mascot.svg") - User's avatar URL
- `active_course_id` (integer, foreign key, nullable) - Currently active course
- `hearts` (integer, not null, default: 5) - Number of hearts remaining
- `points` (integer, not null, default: 0) - Total points earned

**Constraints:**
- `active_course_id` references `courses.id` with cascade delete
- `hearts` defaults to MAX_HEARTS (defined in constants)

**Relationships:**
- Many-to-one with `courses` (active course)

**Example:**
```sql
INSERT INTO user_progress (user_id, user_name, active_course_id, hearts, points) 
VALUES ('user_123', 'John Doe', 1, 5, 100);
```

---

### user_subscription

Manages user subscription information for premium features.

**Columns:**
- `id` (serial, primary key) - Unique identifier for the subscription
- `user_id` (text, not null, unique) - Clerk user ID
- `stripe_customer_id` (text, not null, unique) - Stripe customer ID
- `stripe_subscription_id` (text, not null, unique) - Stripe subscription ID
- `stripe_price_id` (text, not null) - Stripe price ID
- `stripe_current_period_end` (timestamp, not null) - Subscription end date

**Constraints:**
- `user_id` is unique
- `stripe_customer_id` is unique
- `stripe_subscription_id` is unique

**Example:**
```sql
INSERT INTO user_subscription 
(user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_current_period_end) 
VALUES 
('user_123', 'cus_123', 'sub_123', 'price_123', '2024-12-31 23:59:59');
```

---

## Entity Relationship Diagram

```
courses (1) ----< (many) units (1) ----< (many) lessons (1) ----< (many) challenges
    ^                                                                              |
    |                                                                              |
    |                                                                              v
    |                                                                    challenge_options
    |                                                                              |
    |                                                                              v
    |                                                                    challenge_progress
    |                                                                              |
    |                                                                              v
    +------------------------------------------------------------------------- user_progress
                                                                                     |
                                                                                     v
                                                                             user_subscription
```

## Key Relationships

### Course Structure
- **Course → Units**: One course contains multiple units
- **Unit → Lessons**: One unit contains multiple lessons
- **Lesson → Challenges**: One lesson contains multiple challenges
- **Challenge → Options**: One challenge has multiple answer options

### User Progress
- **User → Progress**: One user has one progress record
- **User → Active Course**: User selects one active course
- **User → Challenge Progress**: User has progress records for each completed challenge

### Subscription
- **User → Subscription**: One user has one subscription record (if subscribed)

## Database Indexes

Drizzle ORM automatically creates indexes for:
- Primary keys (all `id` columns)
- Foreign keys (all `_id` columns)
- Unique constraints (user_id in user_subscription)

Recommended additional indexes for performance:
```typescript
// Add these to schema.ts if needed
index("idx_challenge_progress_user", challengeProgress.userId),
index("idx_challenge_progress_challenge", challengeProgress.challengeId),
index("idx_user_progress_course", userProgress.activeCourseId),
```

## Database Operations

### Common Queries

**Get all courses:**
```typescript
const courses = await db.query.courses.findMany();
```

**Get user progress with active course:**
```typescript
const progress = await db.query.userProgress.findFirst({
  where: eq(userProgress.userId, userId),
  with: {
    activeCourse: true,
  },
});
```

**Get units for a course with lessons and challenges:**
```typescript
const units = await db.query.units.findMany({
  where: eq(units.courseId, courseId),
  with: {
    lessons: {
      with: {
        challenges: {
          with: {
            challengeOptions: true,
          },
        },
      },
    },
  },
});
```

## Migration Strategy

### Schema Changes

1. **Modify schema.ts** - Update table definitions
2. **Generate migration** - `pnpm drizzle-kit generate`
3. **Apply migration** - `pnpm drizzle-kit push`

### Seed Data

Initial data is seeded using `scripts/prod.ts`:
```bash
pnpm run db:push && pnpm run db:prod
```

## Data Integrity

### Cascade Deletes

- Deleting a course cascades to units, lessons, and challenges
- Deleting a unit cascades to lessons and challenges
- Deleting a lesson cascades to challenges and options
- Deleting a challenge cascades to options and progress records

### Validation

- All foreign keys are validated
- Enum values are enforced at database level
- Not null constraints ensure required fields
- Unique constraints prevent duplicate subscriptions

## Performance Considerations

### Query Optimization

- Use `with` clauses for eager loading relationships
- Implement proper indexing for frequently queried columns
- Use React's `cache` function to prevent duplicate queries
- Limit result sets with `limit` and `offset`

### Caching Strategy

- Database queries are cached using React's `cache` function
- Cache is invalidated using `revalidatePath` after mutations
- Consider implementing Redis for distributed caching

## Backup and Recovery

### Neon Backup

Neon provides automated backups:
- Point-in-time recovery
- Branching for development
- Automated snapshots

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Import database
psql $DATABASE_URL < backup.sql
```

## Security

### Access Control

- Database access via environment variables
- Connection strings use SSL (`sslmode=require`)
- No direct database access from client-side

### Data Privacy

- User data isolated by `user_id`
- No PII stored beyond Clerk user ID
- Subscription data encrypted at rest

## Troubleshooting

### Common Issues

**Connection errors:**
- Verify `DATABASE_URL` in `.env`
- Check SSL mode requirement
- Ensure Neon database is active

**Migration failures:**
- Check for existing data conflicts
- Verify schema changes are valid
- Review Drizzle logs

**Query performance:**
- Add indexes for slow queries
- Use `explain` to analyze query plans
- Consider connection pooling

## Maintenance

### Regular Tasks

- Monitor database size and growth
- Review and optimize slow queries
- Update statistics: `ANALYZE`
- Vacuum old data: `VACUUM`

### Monitoring

- Track query performance
- Monitor connection pool usage
- Set up alerts for errors
- Review storage usage
