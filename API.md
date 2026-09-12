# API Documentation

## Overview

Lingo provides RESTful API endpoints for managing courses, units, lessons, challenges, and handling Stripe webhooks. All API routes are protected and require admin authentication except for the Stripe webhook endpoint.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints (except webhooks) require admin authentication. The admin check is performed using Clerk user IDs defined in the `CLERK_ADMIN_IDS` environment variable.

**Authentication Method**: Clerk session validation
**Required Headers**: Clerk authentication headers (automatically handled by Clerk middleware)

## API Endpoints

### Courses

#### Get All Courses

**Endpoint**: `GET /api/courses`

**Description**: Retrieves all available courses.

**Authentication**: Admin required

**Response**:
```json
[
  {
    "id": 1,
    "title": "Spanish",
    "image_src": "/flags/es.svg"
  }
]
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized (not admin)

---

#### Create Course

**Endpoint**: `POST /api/courses`

**Description**: Creates a new course.

**Authentication**: Admin required

**Request Body**:
```json
{
  "title": "French",
  "image_src": "/flags/fr.svg"
}
```

**Response**:
```json
{
  "id": 2,
  "title": "French",
  "image_src": "/flags/fr.svg"
}
```

**Status Codes**:
- `200` - Course created successfully
- `401` - Unauthorized (not admin)

---

#### Get Course by ID

**Endpoint**: `GET /api/courses/[courseId]`

**Description**: Retrieves a specific course by ID.

**Authentication**: Admin required

**Parameters**:
- `courseId` (path parameter) - Course ID

**Response**:
```json
{
  "id": 1,
  "title": "Spanish",
  "image_src": "/flags/es.svg"
}
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized (not admin)
- `404` - Course not found

---

#### Update Course

**Endpoint**: `PUT /api/courses/[courseId]`

**Description**: Updates an existing course.

**Authentication**: Admin required

**Parameters**:
- `courseId` (path parameter) - Course ID

**Request Body**:
```json
{
  "title": "Spanish (Updated)",
  "image_src": "/flags/es.svg"
}
```

**Response**:
```json
{
  "id": 1,
  "title": "Spanish (Updated)",
  "image_src": "/flags/es.svg"
}
```

**Status Codes**:
- `200` - Course updated successfully
- `401` - Unauthorized (not admin)
- `404` - Course not found

---

#### Delete Course

**Endpoint**: `DELETE /api/courses/[courseId]`

**Description**: Deletes a course and all associated units, lessons, and challenges (cascade delete).

**Authentication**: Admin required

**Parameters**:
- `courseId` (path parameter) - Course ID

**Response**:
```json
{
  "id": 1,
  "title": "Spanish",
  "image_src": "/flags/es.svg"
}
```

**Status Codes**:
- `200` - Course deleted successfully
- `401` - Unauthorized (not admin)
- `404` - Course not found

---

### Units

#### Get All Units

**Endpoint**: `GET /api/units`

**Description**: Retrieves all units.

**Authentication**: Admin required

**Response**:
```json
[
  {
    "id": 1,
    "title": "Unit 1",
    "description": "Learn the basics",
    "course_id": 1,
    "order": 1
  }
]
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized (not admin)

---

#### Create Unit

**Endpoint**: `POST /api/units`

**Description**: Creates a new unit.

**Authentication**: Admin required

**Request Body**:
```json
{
  "title": "Unit 2",
  "description": "Intermediate Spanish",
  "course_id": 1,
  "order": 2
}
```

**Response**:
```json
{
  "id": 2,
  "title": "Unit 2",
  "description": "Intermediate Spanish",
  "course_id": 1,
  "order": 2
}
```

**Status Codes**:
- `200` - Unit created successfully
- `401` - Unauthorized (not admin)

---

#### Get Unit by ID

**Endpoint**: `GET /api/units/[unitId]`

**Description**: Retrieves a specific unit by ID.

**Authentication**: Admin required

**Parameters**:
- `unitId` (path parameter) - Unit ID

**Response**:
```json
{
  "id": 1,
  "title": "Unit 1",
  "description": "Learn the basics",
  "course_id": 1,
  "order": 1
}
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized (not admin)
- `404` - Unit not found

---

#### Update Unit

**Endpoint**: `PUT /api/units/[unitId]`

**Description**: Updates an existing unit.

**Authentication**: Admin required

**Parameters**:
- `unitId` (path parameter) - Unit ID

**Request Body**:
```json
{
  "title": "Unit 1 (Updated)",
  "description": "Learn the basics of Spanish",
  "course_id": 1,
  "order": 1
}
```

**Response**:
```json
{
  "id": 1,
  "title": "Unit 1 (Updated)",
  "description": "Learn the basics of Spanish",
  "course_id": 1,
  "order": 1
}
```

**Status Codes**:
- `200` - Unit updated successfully
- `401` - Unauthorized (not admin)
- `404` - Unit not found

---

#### Delete Unit

**Endpoint**: `DELETE /api/units/[unitId]`

**Description**: Deletes a unit and all associated lessons and challenges (cascade delete).

**Authentication**: Admin required

**Parameters**:
- `unitId` (path parameter) - Unit ID

**Response**:
```json
{
  "id": 1,
  "title": "Unit 1",
  "description": "Learn the basics",
  "course_id": 1,
  "order": 1
}
```

**Status Codes**:
- `200` - Unit deleted successfully
- `401` - Unauthorized (not admin)
- `404` - Unit not found

---

### Lessons

#### Get All Lessons

**Endpoint**: `GET /api/lessons`

**Description**: Retrieves all lessons.

**Authentication**: Admin required

**Response**:
```json
[
  {
    "id": 1,
    "title": "Greetings",
    "unit_id": 1,
    "order": 1
  }
]
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized (not admin)

---

#### Create Lesson

**Endpoint**: `POST /api/lessons`

**Description**: Creates a new lesson.

**Authentication**: Admin required

**Request Body**:
```json
{
  "title": "Numbers",
  "unit_id": 1,
  "order": 2
}
```

**Response**:
```json
{
  "id": 2,
  "title": "Numbers",
  "unit_id": 1,
  "order": 2
}
```

**Status Codes**:
- `200` - Lesson created successfully
- `401` - Unauthorized (not admin)

---

#### Get Lesson by ID

**Endpoint**: `GET /api/lessons/[lessonId]`

**Description**: Retrieves a specific lesson by ID.

**Authentication**: Admin required

**Parameters**:
- `lessonId` (path parameter) - Lesson ID

**Response**:
```json
{
  "id": 1,
  "title": "Greetings",
  "unit_id": 1,
  "order": 1
}
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized (not admin)
- `404` - Lesson not found

---

#### Update Lesson

**Endpoint**: `PUT /api/lessons/[lessonId]`

**Description**: Updates an existing lesson.

**Authentication**: Admin required

**Parameters**:
- `lessonId` (path parameter) - Lesson ID

**Request Body**:
```json
{
  "title": "Greetings (Updated)",
  "unit_id": 1,
  "order": 1
}
```

**Response**:
```json
{
  "id": 1,
  "title": "Greetings (Updated)",
  "unit_id": 1,
  "order": 1
}
```

**Status Codes**:
- `200` - Lesson updated successfully
- `401` - Unauthorized (not admin)
- `404` - Lesson not found

---

#### Delete Lesson

**Endpoint**: `DELETE /api/lessons/[lessonId]`

**Description**: Deletes a lesson and all associated challenges (cascade delete).

**Authentication**: Admin required

**Parameters**:
- `lessonId` (path parameter) - Lesson ID

**Response**:
```json
{
  "id": 1,
  "title": "Greetings",
  "unit_id": 1,
  "order": 1
}
```

**Status Codes**:
- `200` - Lesson deleted successfully
- `401` - Unauthorized (not admin)
- `404` - Lesson not found

---

### Challenges

#### Get All Challenges

**Endpoint**: `GET /api/challenges`

**Description**: Retrieves all challenges.

**Authentication**: Admin required

**Response**:
```json
[
  {
    "id": 1,
    "lesson_id": 1,
    "type": "SELECT",
    "question": "What is 'hello' in Spanish?",
    "order": 1
  }
]
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized (not admin)

---

#### Create Challenge

**Endpoint**: `POST /api/challenges`

**Description**: Creates a new challenge.

**Authentication**: Admin required

**Request Body**:
```json
{
  "lesson_id": 1,
  "type": "SELECT",
  "question": "What is 'goodbye' in Spanish?",
  "order": 2
}
```

**Response**:
```json
{
  "id": 2,
  "lesson_id": 1,
  "type": "SELECT",
  "question": "What is 'goodbye' in Spanish?",
  "order": 2
}
```

**Status Codes**:
- `200` - Challenge created successfully
- `401` - Unauthorized (not admin)

---

#### Get Challenge by ID

**Endpoint**: `GET /api/challenges/[challengeId]`

**Description**: Retrieves a specific challenge by ID.

**Authentication**: Admin required

**Parameters**:
- `challengeId` (path parameter) - Challenge ID

**Response**:
```json
{
  "id": 1,
  "lesson_id": 1,
  "type": "SELECT",
  "question": "What is 'hello' in Spanish?",
  "order": 1
}
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized (not admin)
- `404` - Challenge not found

---

#### Update Challenge

**Endpoint**: `PUT /api/challenges/[challengeId]`

**Description**: Updates an existing challenge.

**Authentication**: Admin required

**Parameters**:
- `challengeId` (path parameter) - Challenge ID

**Request Body**:
```json
{
  "lesson_id": 1,
  "type": "SELECT",
  "question": "What is 'hello' in Spanish? (Updated)",
  "order": 1
}
```

**Response**:
```json
{
  "id": 1,
  "lesson_id": 1,
  "type": "SELECT",
  "question": "What is 'hello' in Spanish? (Updated)",
  "order": 1
}
```

**Status Codes**:
- `200` - Challenge updated successfully
- `401` - Unauthorized (not admin)
- `404` - Challenge not found

---

#### Delete Challenge

**Endpoint**: `DELETE /api/challenges/[challengeId]`

**Description**: Deletes a challenge and all associated options (cascade delete).

**Authentication**: Admin required

**Parameters**:
- `challengeId` (path parameter) - Challenge ID

**Response**:
```json
{
  "id": 1,
  "lesson_id": 1,
  "type": "SELECT",
  "question": "What is 'hello' in Spanish?",
  "order": 1
}
```

**Status Codes**:
- `200` - Challenge deleted successfully
- `401` - Unauthorized (not admin)
- `404` - Challenge not found

---

### Challenge Options

#### Get All Challenge Options

**Endpoint**: `GET /api/challengeOptions`

**Description**: Retrieves all challenge options.

**Authentication**: Admin required

**Response**:
```json
[
  {
    "id": 1,
    "challenge_id": 1,
    "text": "Hola",
    "correct": true,
    "image_src": null,
    "audio_src": null
  }
]
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized (not admin)

---

#### Create Challenge Option

**Endpoint**: `POST /api/challengeOptions`

**Description**: Creates a new challenge option.

**Authentication**: Admin required

**Request Body**:
```json
{
  "challenge_id": 1,
  "text": "Adiós",
  "correct": false,
  "image_src": null,
  "audio_src": null
}
```

**Response**:
```json
{
  "id": 2,
  "challenge_id": 1,
  "text": "Adiós",
  "correct": false,
  "image_src": null,
  "audio_src": null
}
```

**Status Codes**:
- `200` - Challenge option created successfully
- `401` - Unauthorized (not admin)

---

#### Get Challenge Option by ID

**Endpoint**: `GET /api/challengeOptions/[challengeOptionId]`

**Description**: Retrieves a specific challenge option by ID.

**Authentication**: Admin required

**Parameters**:
- `challengeOptionId` (path parameter) - Challenge option ID

**Response**:
```json
{
  "id": 1,
  "challenge_id": 1,
  "text": "Hola",
  "correct": true,
  "image_src": null,
  "audio_src": null
}
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized (not admin)
- `404` - Challenge option not found

---

#### Update Challenge Option

**Endpoint**: `PUT /api/challengeOptions/[challengeOptionId]`

**Description**: Updates an existing challenge option.

**Authentication**: Admin required

**Parameters**:
- `challengeOptionId` (path parameter) - Challenge option ID

**Request Body**:
```json
{
  "challenge_id": 1,
  "text": "Hola (Updated)",
  "correct": true,
  "image_src": null,
  "audio_src": null
}
```

**Response**:
```json
{
  "id": 1,
  "challenge_id": 1,
  "text": "Hola (Updated)",
  "correct": true,
  "image_src": null,
  "audio_src": null
}
```

**Status Codes**:
- `200` - Challenge option updated successfully
- `401` - Unauthorized (not admin)
- `404` - Challenge option not found

---

#### Delete Challenge Option

**Endpoint**: `DELETE /api/challengeOptions/[challengeOptionId]`

**Description**: Deletes a challenge option.

**Authentication**: Admin required

**Parameters**:
- `challengeOptionId` (path parameter) - Challenge option ID

**Response**:
```json
{
  "id": 1,
  "challenge_id": 1,
  "text": "Hola",
  "correct": true,
  "image_src": null,
  "audio_src": null
}
```

**Status Codes**:
- `200` - Challenge option deleted successfully
- `401` - Unauthorized (not admin)
- `404` - Challenge option not found

---

### Webhooks

#### Stripe Webhook

**Endpoint**: `POST /api/webhooks/stripe`

**Description**: Handles Stripe webhook events for subscription management.

**Authentication**: None (uses Stripe signature verification)

**Headers**:
- `Stripe-Signature` - Stripe webhook signature for verification

**Handled Events**:

**1. checkout.session.completed**
- Triggered when a user completes a subscription checkout
- Creates a new user subscription record in the database
- Extracts subscription details from Stripe session

**2. invoice.payment_succeeded**
- Triggered when a subscription payment succeeds
- Updates the existing subscription with new period end date
- Handles subscription renewals

**Request Body**: Raw Stripe event JSON

**Response**:
- `200` - Webhook processed successfully
- `400` - Invalid webhook signature or missing required data

**Example Payload (checkout.session.completed)**:
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_123",
      "metadata": {
        "userId": "user_123"
      },
      "subscription": "sub_123"
    }
  }
}
```

**Error Response**:
```json
{
  "message": "Webhook error: Invalid signature"
}
```

---

## Server Actions

In addition to REST API endpoints, Lingo uses React Server Actions for client-server communication. These are defined in the `actions/` directory.

### User Progress Actions

#### upsertUserProgress
- **Location**: `actions/user-progress.ts`
- **Description**: Creates or updates user progress when selecting a course
- **Parameters**: `courseId: number`
- **Returns**: Redirects to `/learn`

#### reduceHearts
- **Location**: `actions/user-progress.ts`
- **Description**: Reduces user hearts when answering incorrectly
- **Parameters**: `challengeId: number`
- **Returns**: Error object if hearts are depleted or user has subscription

#### refillHearts
- **Location**: `actions/user-progress.ts`
- **Description**: Refills user hearts using points
- **Parameters**: None
- **Returns**: Success or error

### Challenge Progress Actions

#### upsertChallengeProgress
- **Location**: `actions/challenge-progress.ts`
- **Description**: Records challenge completion
- **Parameters**: `challengeId: number`
- **Returns**: Success or error

### Subscription Actions

#### upsertUserSubscription
- **Location**: `actions/user-subscription.ts`
- **Description**: Creates or updates user subscription
- **Parameters**: Subscription data
- **Returns**: Success or error

---

## Error Handling

### Standard Error Responses

All API endpoints return consistent error responses:

**Unauthorized (401)**:
```json
{
  "message": "Unauthorized."
}
```

**Not Found (404)**:
```json
{
  "message": "Resource not found."
}
```

**Bad Request (400)**:
```json
{
  "message": "Invalid request data."
}
```

**Server Error (500)**:
```json
{
  "message": "Internal server error."
}
```

### Webhook Errors

**Invalid Signature (400)**:
```json
{
  "message": "Webhook error: Invalid signature"
}
```

**Missing User ID (400)**:
```json
{
  "message": "User id is required."
}
```

---

## Rate Limiting

Currently, there is no explicit rate limiting implemented. Consider implementing rate limiting for production deployments to prevent abuse.

## CORS

API endpoints follow Next.js default CORS policies. Configure custom CORS rules in `next.config.ts` if needed for external integrations.

## Testing

### Example cURL Commands

**Get all courses**:
```bash
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer <your-token>"
```

**Create a course**:
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"title": "German", "image_src": "/flags/de.svg"}'
```

**Test Stripe webhook**:
```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: <signature>" \
  -d '{"type": "checkout.session.completed", ...}'
```

---

## Security Considerations

1. **Admin Authentication**: All endpoints (except webhooks) require admin authentication
2. **Input Validation**: Request bodies are validated against database schema types
3. **SQL Injection Prevention**: Drizzle ORM provides protection against SQL injection
4. **Webhook Verification**: Stripe webhooks are verified using signature validation
5. **Environment Variables**: Sensitive data (API keys, secrets) stored in environment variables

---

## Future API Enhancements

### Planned Features
- Public API for course content (read-only)
- User progress API for analytics
- Leaderboard API endpoint
- Achievement/badge system API
- Social features API (friends, sharing)

### Potential Improvements
- GraphQL API layer
- API versioning
- Comprehensive API documentation with Swagger/OpenAPI
- API key authentication for external integrations
- Request/response logging and monitoring
