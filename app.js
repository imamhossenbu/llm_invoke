import Groq from "groq-sdk";
import readline from "readline";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

/**
 * ------------------------
 * Tavily Search
 * ------------------------
 */
async function tavilySearch(query) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      include_answer: true,
    }),
  });

  const data = await response.json();

  return (
    data.answer ||
    data.results?.map((r) => r.content).join("\n") ||
    "No result found"
  );
}

/**
 * ------------------------
 * Agent
 * ------------------------
 */
async function runAgent(messages) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",

    messages: [
      {
        role: "system",
        content: `
You are a helpful AI assistant.

RULES:
1. If web search needed respond ONLY in this format:
SEARCH: search query

2. Do NOT explain before SEARCH

3. For normal chat respond normally.

Examples:

User: weather in chittagong
Assistant: SEARCH: current weather in chittagong

User: who is messi
Assistant: Lionel Messi is a footballer.
        `,
      },

      ...messages,
    ],
  });


  return completion.choices[0].message.content;
}

/**
 * ------------------------
 * Readline
 * ------------------------
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

/**
 * ------------------------
 * Main Loop
 * ------------------------
 */
async function main() {
  const messages = [];

  while (true) {
    const userInput = await ask("\nYou: ");

    if (userInput.toLowerCase() === "exit") {
      break;
    }

    messages.push({
      role: "user",
      content: userInput,
    });

    const response = await runAgent(messages);


    /**
     * ------------------------
     * SEARCH FLOW
     * ------------------------
     */
    if (response.startsWith("SEARCH:")) {
      const query = response.replace("SEARCH:", "").trim();

      console.log("\n🔎 Searching:", query);

      const searchResult = await tavilySearch(query);

      messages.push({
        role: "assistant",
        content: response,
      });

      messages.push({
        role: "user",
        content: `
Web Search Result:
${searchResult}

Now answer the user properly.
        `,
      });

      const finalAnswer = await runAgent(messages);

      console.log("\nAI:", finalAnswer);

      messages.push({
        role: "assistant",
        content: finalAnswer,
      });

      continue;
    }

    /**
     * ------------------------
     * NORMAL CHAT
     * ------------------------
     */
    console.log("\nAI:", response);

    messages.push({
      role: "assistant",
      content: response,
    });
  }

  rl.close();
}

main();
