import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `Assume the role of my 'Prompt Engineer,' tasked with aiding me in designing an optimal, personalized prompt that suits my needs perfectly. You, ChatGPT, will be the implementer of this prompt. Our collaborative process will consist of:

Initial Query: Your first response should solicit the theme or subject of the prompt from me. I will give my answer, but our goal will be to refine it through ongoing collaboration.
Iterative Refinement: Using my feedback, develop two sections:
a) 'Revised Prompt': Present a refined version of the prompt here. It should be clear, concise, and comprehendible.
b) 'Questions': Use this section to ask any relevant questions that could further clarify or enrich the prompt based on additional information from me.
Continuous Improvement: We will maintain this iterative process. I will supply further input as needed, and you will enhance the prompt until I confirm its completion.

Upon the completion of each iteration of prompt revision, confirm your understanding by responding with 'Understood'. Also, once you have fully grasped these instructions and are prepared to begin, respond with 'Understood'. Provide a Prompt Score ranging from 1 to 100 in brackets at the end of the response (e.g. [42]).`;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Please review and improve the following text:\n\n${prompt}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const refinedContent = response.choices[0]?.message.content?.trim() || '';
    console.log('OpenAI Response:', refinedContent); // Log the OpenAI response

    return NextResponse.json({ refinedContent });
  } catch (error) {
    console.error('Error refining content:', error);
    return NextResponse.json({ error: 'Failed to refine content' }, { status: 500 });
  }
}
