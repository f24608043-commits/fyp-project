# Architecture Documentation

## Overview

Lingo is a modern language learning platform built with Next.js 16, React 19, TypeScript, and PostgreSQL. The application follows a server-first architecture with React Server Components and Server Actions for data mutations.

## System Architecture

### Frontend Layer

**Framework**: Next.js 16 with App Router
- **Server Components**: Most components are server-rendered for optimal performance
- **Client Components**: Interactive components use `"use client"` directive
- **Streaming**: Progressive rendering with Suspense boundaries

**UI Framework**:
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built accessible components on Radix UI
- **Lucide React**: Icon library

**State Management**:
- **Zustand**: Client-side state for modals and UI state
- **React Server Actions**: Server-side state mutations
- **React Cache**: Query caching for database operations

### Backend Layer

**API Routes**: Next.js API routes in `app/api/` directory
- Stripe webhook handling
- Admin API endpoints

**Server Actions**: Located in `actions/` directory
- `challenge-progress.ts` - Challenge completion tracking
- `user-progress.ts` - User progress and hearts management
- `user-subscription.ts` - Subscription management

### Database Layer

**ORM**: Drizzle ORM
- Type-safe database queries
- Schema definition in `db/schema.ts`
- Query functions in `db/queries.ts`

**Database**: Neon PostgreSQL
- Serverless PostgreSQL database
- Connection pooling via Neon

### Authentication Layer

**Provider**: Clerk
- User authentication and session management
- Admin role management
- OAuth integration

### Payment Layer

**Provider**: Stripe
- Subscription management
- Webhook handling for payment events

## Component Architecture

### Page Structure

```
app/
├── (auth)/           # Authentication pages (sign-in, sign-up)
├── (main)/           # Main application pages
│   ├── courses/      # Course selection
│   ├── learn/        # Learning dashboard
│   ├── shop/         # Hearts shop
│   ├── quests/       # Daily quests
│   └── leaderboard/  # Leaderboard
├── (marketing)/      # Landing pages
├── admin/            # Admin dashboard
├── api/              # API routes
└── lesson/           # Lesson interface
```

### Component Hierarchy

**Layout Components**:
- `app/layout.tsx` - Root layout with Clerk provider
- `app/(main)/layout.tsx` - Main app layout with sidebar
- `app/lesson/layout.tsx` - Lesson-specific layout

**Shared Components**:
- `components/sidebar.tsx` - Navigation sidebar
- `components/header.tsx` - Top navigation
- `components/user-progress.tsx` - User progress display
- `components/feed-wrapper.tsx` - Content wrapper

**Lesson Components**:
- `app/lesson/page.tsx` - Main lesson page
- `app/lesson/challenge.tsx` - Challenge display
- `app/lesson/quiz.tsx` - Quiz interface
- `app/lesson/header.tsx` - Lesson header
- `app/lesson/footer.tsx` - Lesson footer

**Modal Components**:
- `components/modals/exit-modal.tsx` - Exit confirmation
- `components/modals/hearts-modal.tsx` - Hearts refill
- `components/modals/practice-modal.tsx` - Practice mode

## Data Flow

### User Progress Flow

1. User selects a course → `upsertUserProgress` action
2. System creates/updates `userProgress` record
3. User navigates to lesson → `getCourseProgress` query
4. Lesson loads challenges → `getLesson` query
5. User completes challenge → `upsertChallengeProgress` action
6. Progress updates → `revalidatePath` for cache invalidation

### Authentication Flow

1. User signs in → Clerk authentication
2. Session established → Clerk middleware
3. User data fetched → `currentUser()` from Clerk
4. User progress loaded → `getUserProgress` query
5. Protected routes → Clerk middleware

### Subscription Flow

1. User subscribes → Stripe checkout
2. Payment processed → Stripe webhook
3. Webhook received → `app/api/stripe/route.ts`
4. Subscription created → `upsertUserSubscription` action
5. Premium features unlocked → `getUserSubscription` check

## Key Patterns

### Server Actions

Server actions are used for all data mutations:

```typescript
"use server";

export const upsertUserProgress = async (courseId: number) => {
  const { userId } = await auth();
  // ... validation and database operations
  revalidatePath("/learn");
};
```

### Query Caching

Database queries use React's `cache` function:

```typescript
export const getUserProgress = cache(async () => {
  const { userId } = await auth();
  // ... database query
});
```

### Error Handling

Server actions throw errors for validation failures:

```typescript
if (!userId) throw new Error("Unauthorized.");
if (!course) throw new Error("Course not found.");
```

### Cache Invalidation

After mutations, relevant paths are revalidated:

```typescript
revalidatePath("/learn");
revalidatePath("/courses");
```

## Security

### Authentication
- Clerk handles authentication
- Protected routes via Clerk middleware
- Admin role checks via `CLERK_ADMIN_IDS`

### Authorization
- Server actions check user authentication
- Admin-only routes verify admin status
- User data isolated by `userId`

### Data Validation
- Input validation in server actions
- Type safety via TypeScript
- SQL injection prevention via Drizzle ORM

## Performance Optimizations

### Server Components
- Most components are server-rendered
- Reduced client-side JavaScript
- Faster initial page load

### Caching
- React cache for database queries
- Next.js data cache for API responses
- Revalidation on data mutations

### Code Splitting
- Next.js automatic code splitting
- Dynamic imports for heavy components
- Route-based splitting

### Image Optimization
- Next.js Image component
- Automatic optimization and lazy loading
- Responsive images

## Scalability Considerations

### Database
- Neon PostgreSQL serverless scaling
- Connection pooling
- Query optimization via indexes

### API
- Server actions for efficient mutations
- Edge-ready deployment
- CDN caching for static assets

### Authentication
- Clerk handles authentication at scale
- Session management
- Rate limiting

## Deployment Architecture

### Production Deployment
- **Platform**: Vercel
- **Database**: Neon PostgreSQL
- **Authentication**: Clerk
- **Payments**: Stripe
- **CDN**: Vercel Edge Network

### Environment Variables
- All secrets stored in environment variables
- Clerk keys for authentication
- Database URL for PostgreSQL
- Stripe keys for payments

## Monitoring & Observability

### Error Tracking
- Server action error handling
- User-facing error messages
- Console logging for debugging

### Performance
- Next.js built-in analytics
- Database query performance
- Page load metrics

## Future Enhancements

### Planned Features
- Real-time collaboration
- Advanced analytics dashboard
- Mobile app (React Native)
- AI-powered language practice
- Voice recognition for pronunciation

### Architecture Improvements
- GraphQL API layer
- Microservices for specific features
- Advanced caching strategies
- WebSocket integration for real-time features
