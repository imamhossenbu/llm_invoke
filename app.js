import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const completion = await groq.chat.completions.create({
    temperature: 0.8,
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content:
          "Your name is Jarvis, a smart review grader. You are a helpful assistant. Your task is to analyze given reviews and return the sentiment of the review as either positive, negative, or neutral. Output must be a single word: positive, negative, or neutral. ",
      },

      {
        role: "user",
        content: `Review: these headphones arrived quicly and look great, but the left earcup stoppef working after a week of use.
        Sentiment:`,
      },
    ],
  });
  console.log(completion.choices[0].message.content);
}

main();
