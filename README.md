<a name="readme-top"></a>

# LEGO — Learn And Go

![LEGO — Learn And Go](/.github/images/img_main.png "LEGO — Learn And Go")

A modern, AI-powered, gamified learning platform for mastering skills through interactive video lessons, quizzes, and live tutor sessions. Built as a Final Year Project (FYP), this platform provides an engaging user experience for learning programming, languages, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

<!-- Table of Contents -->
<details>

<summary>

# :notebook_with_decorative_cover: Table of Contents

</summary>

- [Features](#sparkles-features)
- [Folder Structure](#bangbang-folder-structure)
- [Getting Started](#toolbox-getting-started)
- [Screenshots](#camera-screenshots)
- [Tech Stack](#gear-tech-stack)
- [Architecture](#building_construction-architecture)
- [Database Schema](#database-database-schema)
- [API Documentation](#link-api-documentation)
- [Development Guidelines](#wrench-development-guidelines)
- [Project Structure](#file_folder-project-structure)
- [Contributing](#handshake-contributing)
- [License](#scroll-license)

</details>

## :sparkles: Features

- **Interactive Lessons**: Engaging language lessons with various challenge types (select, assist)
- **Progress Tracking**: Real-time tracking of user progress, points, and hearts
- **Gamification**: Hearts system, points, and streaks to motivate learning
- **Multiple Courses**: Support for multiple language courses with structured units and lessons
- **User Authentication**: Secure authentication using Clerk
- **Subscription System**: Stripe integration for premium subscriptions
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Modern UI/UX**: Clean, intuitive interface inspired by Duolingo
- **Admin Dashboard**: Admin panel for managing courses and content
- **Audio Support**: Audio challenges for listening comprehension

## :bangbang: Folder Structure

Here is the folder structure of this app.

<!--- FOLDER_STRUCTURE_START --->
```bash
lego-learn-and-go/
  |- .agents/
    |-- skills/
  |- actions/
    |-- ai.ts
    |-- challenge-progress.ts
    |-- library.ts
    |-- social.ts
    |-- tutor.ts
    |-- user-progress.ts
  |- app/
    |-- (admin)/
    |-- (auth)/
    |-- (main)/
    |-- (marketing)/
    |-- (tutor)/
    |-- api/
    |-- lesson/
    |-- apple-icon.png
    |-- favicon.ico
    |-- globals.css
    |-- icon1.png
    |-- icon2.png
    |-- layout.tsx
  |- components/
    |-- modals/
    |-- ui/
    |-- banner.tsx
    |-- bottom-navigation.tsx
    |-- empty-state.tsx
    |-- feed-wrapper.tsx
    |-- mascot.tsx
    |-- mobile-header.tsx
    |-- mobile-sidebar.tsx
    |-- navigation.tsx
    |-- promo.tsx
    |-- quests.tsx
    |-- sidebar-item.tsx
    |-- sidebar.tsx
    |-- sticky-wrapper.tsx
    |-- user-progress.tsx
  |- config/
    |-- index.ts
  |- db/
    |-- drizzle.ts
    |-- queries.ts
    |-- schema.ts
  |- drizzle/
    |-- meta/
    |-- 0000_puzzling_pete_wisdom.sql
  |- lib/
    |-- supabase/
    |-- admin.ts
    |-- ai.ts
    |-- badges.ts
    |-- utils.ts
  |- public/
  |- scripts/
    |-- generate-icons.ts
    |-- prod.ts
    |-- rls_migration.sql
    |-- rls_policies.sql
    |-- seed_courses.sql
    |-- seed_full_data.sql
    |-- setup_test_accounts.sql
    |-- verify_rls.sql
  |- store/
    |-- use-exit-modal.ts
    |-- use-hearts-modal.ts
    |-- use-practice-modal.ts
  |- supabase/
    |-- .temp/
  |- .env.example
  |- .env/.env.local
  |- .gitignore
  |- .prettierrc.json
  |- components.json
  |- constants.ts
  |- drizzle.config.ts
  |- environment.d.ts
  |- eslint.config.mjs
  |- next.config.ts
  |- package-lock.json
  |- package.json
  |- pnpm-lock.yaml
  |- pnpm-workspace.yaml
  |- postcss.config.js
  |- proxy.ts
  |- skills-lock.json
  |- tailwind.config.ts
  |- test-exit-criteria.ts
  |- test.sql
  |- tsconfig.json
  |- vercel.ts
```
<!--- FOLDER_STRUCTURE_END --->

<br />

## :toolbox: Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **Git**

### Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd FYP_LEARNING_PROJECT_1
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with the following variables:

```env
# Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"

# Neon Database URI
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/lingo?sslmode=require"

# Stripe API Key and Webhook
STRIPE_API_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Public App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk Admin User IDs (comma-separated)
CLERK_ADMIN_IDS="user_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Setting Up External Services

#### Clerk Authentication
1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the Publishable Key and Secret Key to your `.env` file
4. Configure redirect URLs in Clerk dashboard

#### Neon Database
1. Create an account at [neon.tech](https://neon.tech)
2. Create a new PostgreSQL database
3. Copy the connection string to your `.env` file
4. Ensure `?sslmode=require` is appended to the connection string

#### Stripe (Optional - for subscriptions)
1. Create an account at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Set up a webhook endpoint for your application
4. Copy the webhook secret to your `.env` file

### Database Setup

1. Push the database schema:
```bash
pnpm run db:push
```

2. Seed the database with initial data:
```bash
pnpm run db:prod
```

This will populate the database with courses, units, lessons, and challenges.

### Running the Application

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Additional Commands

- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Check code formatting
- `pnpm format:fix` - Fix code formatting
- `pnpm db:studio` - Open Drizzle Studio for database management

## :camera: Screenshots

![Modern UI/UX](/.github/images/img1.png "Modern UI/UX")

![Quests](/.github/images/img2.png "Quests")

![Shop](/.github/images/img3.png "Shop")

## :gear: Tech Stack

### Frontend
- **Next.js 16.3** - React framework for production
- **React 19.2** - UI library
- **TypeScript 6** - Type-safe JavaScript
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Reusable UI components built on Radix UI
- **Lucide React** - Icon library

### Backend & Database
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **Drizzle ORM** - Type-safe SQL toolkit
- **Next.js API Routes** - Backend API endpoints

### Authentication & Payments
- **Clerk** - Authentication and user management
- **Stripe** - Payment processing for subscriptions

### State Management
- **Zustand** - Lightweight state management
- **React Server Actions** - Server-side mutations

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **pnpm** - Fast, disk space efficient package manager

## :building_construction: Architecture

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md)

## :database: Database Schema

For detailed database schema documentation, see [DATABASE.md](DATABASE.md)

## :link: API Documentation

For detailed API documentation, see [API.md](API.md)

## :wrench: Development Guidelines

For detailed development guidelines, see [DEVELOPMENT.md](DEVELOPMENT.md)

## :file_folder: Project Structure

The project follows the Next.js App Router structure with the following key directories:

- **`app/`** - Next.js app router pages and layouts
- **`components/`** - Reusable React components
- **`actions/`** - Server actions for data mutations
- **`db/`** - Database schema and queries
- **`lib/`** - Utility functions and helpers
- **`store/`** - Client-side state management
- **`config/`** - Application configuration

## :handshake: Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## :scroll: License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## :books: Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

<p align="right">(<a href="#readme-top">back to top</a>)</p>
#   C L I E N T - s - F y p - p r o j e c t - 2 
 
 