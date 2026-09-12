import { z } from "zod";
import db from "@/db/drizzle";
import { aiInteractions } from "@/db/schema";

export const QuizQuestionSchema = z.object({
  question: z.string().min(3),
  type: z.enum(["SELECT", "ASSIST"]),
  options: z.array(
    z.object({
      text: z.string().min(1),
      correct: z.boolean(),
    })
  ).min(2),
});

export const QuizGenResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1),
});

export type GeneratedQuiz = z.infer<typeof QuizGenResponseSchema>;

export async function generateQuizQuestions({
  userId,
  lessonTitle,
  courseCategory,
  description,
}: {
  userId: string;
  lessonTitle: string;
  courseCategory: string;
  description?: string;
}): Promise<GeneratedQuiz> {
  const startTime = Date.now();
  const prompt = `Generate 5 multiple choice quiz questions for a lesson titled "${lessonTitle}" in the course category "${courseCategory}". ${description ? `Description: ${description}.` : ""}
Format MUST be strictly valid JSON matching this structure:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "SELECT",
      "options": [
        { "text": "Option 1", "correct": true },
        { "text": "Option 2", "correct": false },
        { "text": "Option 3", "correct": false }
      ]
    }
  ]
}`;

  // 1. Try OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are an expert tutor creating quiz questions. Respond ONLY in valid JSON matching the requested schema." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        const parsed = JSON.parse(content);
        const validated = QuizGenResponseSchema.parse(parsed);

        await db.insert(aiInteractions).values({
          userId,
          type: "quiz_gen",
          prompt,
          response: JSON.stringify(validated),
          provider: "openai",
          latencyMs: Date.now() - startTime,
        });

        return validated;
      }
    } catch (err) {
      console.warn("OpenAI generation failed, attempting Groq/OpenRouter...", err);
    }
  }

  // 2. Try Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are an expert tutor creating quiz questions. Respond ONLY in valid JSON matching the requested schema." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        const parsed = JSON.parse(content);
        const validated = QuizGenResponseSchema.parse(parsed);

        await db.insert(aiInteractions).values({
          userId,
          type: "quiz_gen",
          prompt,
          response: JSON.stringify(validated),
          provider: "groq",
          latencyMs: Date.now() - startTime,
        });

        return validated;
      }
    } catch (err) {
      console.warn("Groq generation failed, attempting OpenRouter...", err);
    }
  }

  // 3. Try OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            { role: "system", content: "You are an expert tutor creating quiz questions. Respond ONLY in valid JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        const parsed = JSON.parse(content);
        const validated = QuizGenResponseSchema.parse(parsed);

        await db.insert(aiInteractions).values({
          userId,
          type: "quiz_gen",
          prompt,
          response: JSON.stringify(validated),
          provider: "openrouter",
          latencyMs: Date.now() - startTime,
        });

        return validated;
      }
    } catch (err) {
      console.warn("OpenRouter generation failed, falling back to curated questions...", err);
    }
  }

  // 4. Deterministic Fallback Questions
  const fallbackQuestions: GeneratedQuiz = {
    questions: [
      {
        question: `What is the primary concept covered in "${lessonTitle}"?`,
        type: "SELECT",
        options: [
          { text: `Core fundamentals of ${lessonTitle}`, correct: true },
          { text: "Unrelated advanced server setup", correct: false },
          { text: "Legacy syntax deprecated in 2010", correct: false },
        ],
      },
      {
        question: `Why is understanding ${lessonTitle} important in ${courseCategory}?`,
        type: "SELECT",
        options: [
          { text: "It forms the foundation for subsequent units and practices", correct: true },
          { text: "It is only required for legacy compilers", correct: false },
          { text: "It has no practical significance", correct: false },
        ],
      },
      {
        question: `Identify the true statement regarding "${lessonTitle}":`,
        type: "ASSIST",
        options: [
          { text: "Applying best practices ensures clean and maintainable logic", correct: true },
          { text: "Errors should always be ignored silently", correct: false },
        ],
      },
      {
        question: `Which method or technique is best practice when practicing ${lessonTitle}?`,
        type: "SELECT",
        options: [
          { text: "Consistent testing and hands-on coding", correct: true },
          { text: "Copying without reviewing", correct: false },
          { text: "Skipping documentation and syntax rules", correct: false },
        ],
      },
      {
        question: `True or False: Mastering ${lessonTitle} helps unlock advanced topics in ${courseCategory}.`,
        type: "ASSIST",
        options: [
          { text: "True", correct: true },
          { text: "False", correct: false },
        ],
      },
    ],
  };

  await db.insert(aiInteractions).values({
    userId,
    type: "quiz_gen",
    prompt,
    response: JSON.stringify(fallbackQuestions),
    provider: "fallback_curated",
    latencyMs: Date.now() - startTime,
  });

  return fallbackQuestions;
}

export async function generateFeedbackExplanation({
  userId,
  question,
  wrongAnswer,
  correctAnswer,
}: {
  userId: string;
  question: string;
  wrongAnswer: string;
  correctAnswer: string;
}): Promise<string> {
  const startTime = Date.now();
  const prompt = `Explain concisely why "${correctAnswer}" is correct instead of "${wrongAnswer}" for the question: "${question}". Keep explanation under 2 sentences.`;

  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const explanation = data.choices?.[0]?.message?.content?.trim();
        if (explanation) {
          await db.insert(aiInteractions).values({
            userId,
            type: "feedback",
            prompt,
            response: explanation,
            provider: "openai",
            latencyMs: Date.now() - startTime,
          });
          return explanation;
        }
      }
    } catch {
      // Fallback to Groq
    }
  }

  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const explanation = data.choices?.[0]?.message?.content?.trim();
        if (explanation) {
          await db.insert(aiInteractions).values({
            userId,
            type: "feedback",
            prompt,
            response: explanation,
            provider: "groq",
            latencyMs: Date.now() - startTime,
          });
          return explanation;
        }
      }
    } catch {
      // Fallback
    }
  }

  return `"${correctAnswer}" is correct because it follows the fundamental rules covered in this lesson.`;
}
