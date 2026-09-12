# Development Guidelines

## Overview

This document provides comprehensive guidelines for contributing to and developing the Lingo language learning platform. It covers setup procedures, coding standards, testing practices, and deployment processes.

## Prerequisites

### Required Software

- **Node.js**: v18 or higher
- **pnpm**: v11.11.0 or higher (package manager)
- **Git**: Latest version
- **Code Editor**: VS Code (recommended) with extensions

### Recommended VS Code Extensions

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind CSS autocompletion
- **Drizzle ORM** - Database query IntelliSense
- **Clerk** - Authentication helper

## Development Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd FYP_LEARNING_PROJECT_1
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"

# Database
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/lingo?sslmode=require"

# Stripe (Optional)
STRIPE_API_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
CLERK_ADMIN_IDS="user_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 4. Database Setup

Initialize the database schema:

```bash
pnpm run db:push
```

Seed the database with initial data:

```bash
pnpm run db:prod
```

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
lingo/
├── actions/              # Server actions for data mutations
├── app/                  # Next.js app router
│   ├── (auth)/          # Authentication pages
│   ├── (main)/          # Main application
│   ├── (marketing)/     # Landing pages
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes
│   └── lesson/          # Lesson components
├── components/          # React components
│   ├── modals/          # Modal components
│   └── ui/              # shadcn/ui components
├── db/                  # Database configuration
│   ├── drizzle.ts       # Database connection
│   ├── queries.ts       # Database queries
│   └── schema.ts        # Database schema
├── lib/                 # Utility functions
├── public/              # Static assets
├── scripts/             # Utility scripts
└── store/               # State management
```

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Enable strict mode in `tsconfig.json`
- Avoid `any` types - use proper type definitions
- Use interfaces for object shapes, types for unions/primitives

**Example:**
```typescript
// Good
interface UserProgress {
  userId: string;
  points: number;
  hearts: number;
}

// Bad
const userProgress: any = { ... };
```

### React Components

- Use functional components with hooks
- Prefer server components over client components when possible
- Use `"use client"` directive only when necessary (interactivity)
- Follow the single responsibility principle

**Example:**
```typescript
// Server Component (default)
export default function LessonPage() {
  return <div>Lesson content</div>;
}

// Client Component (when needed)
"use client";

export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Server Actions

- Mark server actions with `"use server"` directive
- Always validate user authentication
- Use proper error handling with descriptive messages
- Revalidate paths after mutations

**Example:**
```typescript
"use server";

export const upsertUserProgress = async (courseId: number) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  // ... database operations

  revalidatePath("/learn");
  revalidatePath("/courses");
};
```

### Database Queries

- Use Drizzle ORM for all database operations
- Use React's `cache` function for query caching
- Follow the repository pattern for complex queries
- Use proper TypeScript types from schema

**Example:**
```typescript
export const getUserProgress = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });

  return data;
});
```

### Styling

- Use Tailwind CSS for styling
- Follow the utility-first approach
- Use shadcn/ui components when possible
- Keep component-specific styles in the component file

**Example:**
```typescript
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-bold text-gray-900">Lesson Title</h2>
</div>
```

### File Naming

- Use kebab-case for file names: `user-progress.tsx`
- Use PascalCase for component names: `UserProgress.tsx`
- Use camelCase for utility functions: `getUserProgress()`
- Group related files in directories

## Code Quality

### Linting

Run ESLint to check code quality:

```bash
pnpm lint
```

Auto-fix linting issues:

```bash
pnpm lint:fix
```

### Formatting

Check code formatting:

```bash
pnpm format
```

Auto-format code:

```bash
pnpm format:fix
```

### Pre-commit Hooks

Consider setting up Husky for pre-commit hooks:

```bash
pnpm add -D husky lint-staged
npx husky install
```

## Testing

### Unit Testing

Set up unit tests for critical functions:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

### Integration Testing

Test API endpoints and server actions:

```typescript
import { describe, it, expect } from 'vitest';
import { upsertUserProgress } from '@/actions/user-progress';

describe('User Progress', () => {
  it('should create user progress', async () => {
    const result = await upsertUserProgress(1);
    expect(result).toBeDefined();
  });
});
```

### E2E Testing

Consider using Playwright for end-to-end testing:

```bash
pnpm add -D @playwright/test
```

## Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `refactor/refactor-description` - Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add user subscription feature
fix: resolve hearts not refilling issue
docs: update API documentation
refactor: simplify database queries
test: add unit tests for user progress
chore: update dependencies
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes and commit
3. Push to the remote repository
4. Create a pull request with:
   - Clear title and description
   - Related issue number
   - Screenshots for UI changes
   - Testing instructions

## Database Management

### Schema Changes

1. Update `db/schema.ts`
2. Generate migration: `pnpm drizzle-kit generate`
3. Review migration file
4. Apply migration: `pnpm drizzle-kit push`

### Database Studio

Open Drizzle Studio for database management:

```bash
pnpm run db:studio
```

### Seed Data

Reseed the database:

```bash
pnpm run db:push && pnpm run db:prod
```

## Performance Optimization

### Code Splitting

Use dynamic imports for heavy components:

```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

### Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/flag.svg"
  alt="Spanish flag"
  width={100}
  height={100}
/>
```

### Caching

- Use React's `cache` for database queries
- Implement proper revalidation strategies
- Consider CDN caching for static assets

## Security Best Practices

### Environment Variables

- Never commit `.env` files
- Use `.env.example` as a template
- Rotate secrets regularly
- Use different keys for development and production

### Authentication

- Always check user authentication in server actions
- Verify admin roles for sensitive operations
- Use Clerk middleware for route protection

### Data Validation

- Validate all user inputs
- Use TypeScript types for type safety
- Sanitize data before database operations
- Implement rate limiting for API endpoints

## Deployment

### Build for Production

```bash
pnpm build
```

### Run Production Server

```bash
pnpm start
```

### Vercel Deployment

1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

### Environment Variables for Production

Ensure all required environment variables are set:
- Clerk keys
- Database URL
- Stripe keys
- App URL

## Troubleshooting

### Common Issues

**Database Connection Error**
- Verify `DATABASE_URL` in `.env`
- Check database is running
- Ensure SSL mode is enabled

**Authentication Issues**
- Verify Clerk keys are correct
- Check redirect URLs in Clerk dashboard
- Clear browser cookies and cache

**Build Errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`
- Check TypeScript errors

**Stripe Webhook Issues**
- Verify webhook secret
- Check webhook URL is correct
- Test with Stripe CLI

## Debugging

### Server Actions

Add console logging for debugging:

```typescript
"use server";

export const upsertUserProgress = async (courseId: number) => {
  console.log('Upserting user progress for course:', courseId);
  // ... rest of the code
};
```

### Database Queries

Use Drizzle Studio to inspect database:

```bash
pnpm run db:studio
```

### Client-side Issues

Use React DevTools and browser console for debugging.

## Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Clerk Documentation](https://clerk.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

### Learning Resources

- [Next.js Learn](https://nextjs.org/learn)
- [React Tutorial](https://react.dev/learn)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/installation)

## Contributing

### Before Contributing

1. Read this documentation thoroughly
2. Set up your development environment
3. Understand the codebase structure
4. Check existing issues and pull requests

### Making Changes

1. Create a feature branch
2. Make your changes following coding standards
3. Test your changes thoroughly
4. Update documentation if needed
5. Submit a pull request

### Code Review

- Be responsive to review feedback
- Address all review comments
- Keep discussions constructive
- Learn from the review process

## Best Practices Summary

- **Write clean, readable code**
- **Follow TypeScript best practices**
- **Use server components by default**
- **Implement proper error handling**
- **Write tests for critical functionality**
- **Document complex logic**
- **Keep components small and focused**
- **Use proper naming conventions**
- **Optimize for performance**
- **Follow security best practices**

## Getting Help

If you encounter issues:

1. Check this documentation
2. Review existing GitHub issues
3. Search Stack Overflow
4. Ask in team discussions
5. Create a new issue with detailed information

---

**Happy Coding! 🚀**
