import Groq from "groq-sdk";
import Instructor from "@instructor-ai/instructor";
import { z } from "zod";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// const client = Instructor({
//   client: groq,
// });

// const SentimentSchema = z.object({
//   sentiment: z.enum(["positive", "negative", "neutral"]),
// });

async function main() {

    const res = await groq.chat.completions.create({
      response_format: { type: "json_object" },
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `You are an interview grader assistant. Your task is to generate candidate evaluation score. Output must be follwing JSON structure:
            {
            "confidence":number (1-10 scale),
            "accuracy":number (1-10 scale),
            "pass":bollean(true or false)
            }
            The response must:
            1. Include all fields shown above
            2. Use only the exact field names shown,
            3. Follow the exact data types specified
            4. Contain ONLY the JSON object and nothing else
            `,
        },
        {
          role: "user",
          content: `
            Q: What dores === don in Javascript?
            A: It checks strict equality-both value and type match.

            Q: How do you create a promise that resolves after 1 second?
            A: const p = new Promise (r=> setTimeout(r,1000));

            Q: What is hoisting?
            A: Javascript moves declarations (but not initializations) to the top of their scope before code runs.


            Q: Why use let instead of var?
            A: Let is block-scoped, avoiding the function-scope quirks and re-declaration issues of var.
            `,
        },
      ],
    });

    const content = res?.choices?.[0]?.message?.content;

    console.log(content)
  
}

main();


