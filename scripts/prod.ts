import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:54322/postgres";
console.log("DATABASE_URL:", connectionString);
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

const main = async () => {
  try {
    console.log("Seeding database for SocialLearn...");

    // Delete all existing data
    await db.delete(schema.userBadges);
    await db.delete(schema.badges);
    await db.delete(schema.friendStreaks);
    await db.delete(schema.friendships);
    await db.delete(schema.tutorSessions);
    await db.delete(schema.tutorAvailability);
    await db.delete(schema.libraryViews);
    await db.delete(schema.aiInteractions);
    await db.delete(schema.enrollments);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challenges);
    await db.delete(schema.lessons);
    await db.delete(schema.units);
    await db.delete(schema.userProgress);
    await db.delete(schema.courses);

    // Insert Courses
    const courses = await db
      .insert(schema.courses)
      .values([
        {
          title: "Python Programming",
          imageSrc: "/python.svg",
          category: "Programming",
        },
        {
          title: "JavaScript & Web Dev",
          imageSrc: "/js.svg",
          category: "Web Development",
        },
        {
          title: "Spanish Language",
          imageSrc: "/es.svg",
          category: "Language",
        },
      ])
      .returning();

    // Insert Badges
    const createdBadges = await db
      .insert(schema.badges)
      .values([
        {
          name: "First Step",
          description: "Completed your first level!",
          iconUrl: "/mascot.svg",
          criteria: { type: "level_complete", count: 1 },
        },
        {
          name: "Streak Master",
          description: "Maintained a 3-day streak!",
          iconUrl: "/mascot.svg",
          criteria: { type: "streak", days: 3 },
        },
        {
          name: "Quiz Champion",
          description: "Scored 100% on 3 quizzes!",
          iconUrl: "/mascot.svg",
          criteria: { type: "perfect_quiz", count: 3 },
        },
      ])
      .returning();

    // Seed Units and Lessons for Python Course
    const pythonCourse = courses[0];
    const pyUnits = await db
      .insert(schema.units)
      .values([
        {
          courseId: pythonCourse.id,
          title: "Unit 1: Python Fundamentals",
          description: "Learn syntax, variables, data types, and logic",
          order: 1,
        },
        {
          courseId: pythonCourse.id,
          title: "Unit 2: Functions & Data Structures",
          description: "Master lists, dicts, functions, and loops",
          order: 2,
        },
      ])
      .returning();

    // Unit 1 Lessons (Levels with YouTube Videos)
    const pyLessons = await db
      .insert(schema.lessons)
      .values([
        {
          unitId: pyUnits[0].id,
          title: "Variables & Data Types",
          order: 1,
          youtubeVideoId: "kqtD5dpn9C8", // Python for Beginners YouTube video ID
        },
        {
          unitId: pyUnits[0].id,
          title: "Numbers & Operations",
          order: 2,
          youtubeVideoId: "_uQrJ0TkZlc",
        },
        {
          unitId: pyUnits[0].id,
          title: "Strings & Print Formatting",
          order: 3,
          youtubeVideoId: "kqtD5dpn9C8",
        },
      ])
      .returning();

    // Challenges for Lesson 1
    const l1 = pyLessons[0];
    const challengesL1 = await db
      .insert(schema.challenges)
      .values([
        {
          lessonId: l1.id,
          type: "SELECT",
          question: "Which keyword is used to define a variable in Python?",
          order: 1,
          generatedBy: "admin",
        },
        {
          lessonId: l1.id,
          type: "SELECT",
          question: "What is the correct file extension for Python files?",
          order: 2,
          generatedBy: "admin",
        },
        {
          lessonId: l1.id,
          type: "ASSIST",
          question: "print(type(42)) output is <class 'int'>",
          order: 3,
          generatedBy: "admin",
        },
      ])
      .returning();

    // Options for Challenge 1
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: challengesL1[0].id,
        correct: true,
        text: "No keyword needed (just assignment x = 5)",
      },
      {
        challengeId: challengesL1[0].id,
        correct: false,
        text: "var x = 5",
      },
      {
        challengeId: challengesL1[0].id,
        correct: false,
        text: "let x = 5",
      },
    ]);

    // Options for Challenge 2
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: challengesL1[1].id,
        correct: true,
        text: ".py",
      },
      {
        challengeId: challengesL1[1].id,
        correct: false,
        text: ".pt",
      },
      {
        challengeId: challengesL1[1].id,
        correct: false,
        text: ".pyt",
      },
    ]);

    // Options for Challenge 3
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: challengesL1[2].id,
        correct: true,
        text: "True",
      },
      {
        challengeId: challengesL1[2].id,
        correct: false,
        text: "False",
      },
    ]);

    // Seed dummy tutor availability
    await db.insert(schema.tutorAvailability).values([
      { tutorId: "tutor_demo_1", dayOfWeek: 1, startTime: "10:00", endTime: "11:00" },
      { tutorId: "tutor_demo_1", dayOfWeek: 3, startTime: "14:00", endTime: "15:00" },
      { tutorId: "tutor_demo_1", dayOfWeek: 5, startTime: "16:00", endTime: "17:00" },
    ]);

    console.log("Database seeded successfully with SocialLearn courses, units, lessons (levels), challenges, and badges!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

void main();
