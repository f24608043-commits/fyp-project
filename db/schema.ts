import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { MAX_HEARTS } from "@/constants";

export const roleEnum = pgEnum("user_role", ["learner", "tutor", "admin"]);
export const generatedByEnum = pgEnum("generated_by", ["ai", "admin"]);
export const friendshipStatusEnum = pgEnum("friendship_status", ["pending", "accepted"]);
export const tutorSessionStatusEnum = pgEnum("tutor_session_status", [
  "requested",
  "confirmed",
  "completed",
  "cancelled",
]);

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
  category: text("category").default("programming"),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  userProgress: many(userProgress),
  units: many(units),
  enrollments: many(enrollments),
  tutorSessions: many(tutorSessions),
}));

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  courseId: integer("course_id")
    .references(() => courses.id, {
      onDelete: "cascade",
    })
    .notNull(),
  order: integer("order").notNull(),
});

export const unitsRelations = relations(units, ({ many, one }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id")
    .references(() => units.id, {
      onDelete: "cascade",
    })
    .notNull(),
  order: integer("order").notNull(),
  youtubeVideoId: text("youtube_video_id"),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
  libraryViews: many(libraryViews),
}));

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, {
      onDelete: "cascade",
    })
    .notNull(),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
  generatedBy: generatedByEnum("generated_by").default("admin"),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, {
      onDelete: "cascade",
    })
    .notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export const challengeOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  })
);

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, {
      onDelete: "cascade",
    })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const challengeProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  })
);

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("Learner"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  role: roleEnum("role").notNull().default("learner"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  hearts: integer("hearts").notNull().default(MAX_HEARTS),
  points: integer("points").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: timestamp("last_active_date"),
});

export const userProgressRelations = relations(userProgress, ({ one, many }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
  badges: many(userBadges),
  enrollments: many(enrollments),
}));

// Badges
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url").notNull(),
  criteria: jsonb("criteria").notNull(),
});

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  badgeId: integer("badge_id")
    .references(() => badges.id, { onDelete: "cascade" })
    .notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

// Social & Friends
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  userIdA: text("user_id_a").notNull(),
  userIdB: text("user_id_b").notNull(),
  status: friendshipStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const friendStreaks = pgTable("friend_streaks", {
  id: serial("id").primaryKey(),
  friendshipId: integer("friendship_id")
    .references(() => friendships.id, { onDelete: "cascade" })
    .notNull(),
  currentStreak: integer("current_streak").notNull().default(0),
  lastJointActivityDate: timestamp("last_joint_activity_date"),
});

// Tutor Booking & Availability
export const tutorAvailability = pgTable("tutor_availability", {
  id: serial("id").primaryKey(),
  tutorId: text("tutor_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ...
  startTime: text("start_time").notNull(), // e.g., "14:00"
  endTime: text("end_time").notNull(), // e.g., "15:00"
});

export const tutorSessions = pgTable("tutor_sessions", {
  id: serial("id").primaryKey(),
  tutorId: text("tutor_id").notNull(),
  learnerId: text("learner_id").notNull(),
  courseId: integer("course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: tutorSessionStatusEnum("status").notNull().default("requested"),
  meetingLink: text("meeting_link"),
});

export const tutorSessionsRelations = relations(tutorSessions, ({ one }) => ({
  course: one(courses, {
    fields: [tutorSessions.courseId],
    references: [courses.id],
  }),
}));

// Library Tracking (strict view tracking, never alters userProgress)
export const libraryViews = pgTable("library_views", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const libraryViewsRelations = relations(libraryViews, ({ one }) => ({
  lesson: one(lessons, {
    fields: [libraryViews.lessonId],
    references: [lessons.id],
  }),
}));

// AI Logging
export const aiInteractions = pgTable("ai_interactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'quiz_gen' | 'grading' | 'feedback'
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  provider: text("provider").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Multi-course enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: integer("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));
