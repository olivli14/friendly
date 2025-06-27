import 'dotenv/config';
import OpenAI from "openai";
const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY
});

const response = await client.responses.create({
    model: "gpt-4.1",
    input: "Write a one-sentence bedtime story about a unicorn."
});

console.log(response.output_text);