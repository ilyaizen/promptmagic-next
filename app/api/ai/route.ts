import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompts = {
  refine: `Assume the role of my 'Prompt Engineer,' tasked with aiding me in designing an optimal, personalized prompt that suits my needs perfectly. You, ChatGPT, will be the implementer of this prompt. Our collaborative process will consist of:

Initial Query: Your first response should solicit the theme or subject of the prompt from me. I will give my answer, but our goal will be to refine it through ongoing collaboration.
Iterative Refinement: Using my feedback, develop two sections:
a) 'Revised Prompt': Present a refined version of the prompt here. It should be clear, concise, and comprehendible.
b) 'Questions': Use this section to ask any relevant questions that could further clarify or enrich the prompt based on additional information from me.
Continuous Improvement: We will maintain this iterative process. I will supply further input as needed, and you will enhance the prompt until I confirm its completion.

Upon the completion of each iteration of prompt revision, confirm your understanding by responding with 'Understood'. Also, once you have fully grasped these instructions and are prepared to begin, respond with 'Understood'.`,

  complete:
    'You are a master prompt engineer AI, you are an expert at completing sentences and providing short, concise text completions.',
};

type Message = {
  role: string;
  content: string;
  name?: string;
};

export async function POST(req: Request) {
  const { text, action } = await req.json();
  console.log('Received request:', { text, action }); // Debug log

  try {
    let messages, maxTokens, temperature, n, stop;

    switch (action) {
      case 'refine':
        messages = [
          { role: 'system', content: systemPrompts.refine },
          { role: 'user', content: `Please review and improve the following prompt:\n\n${text}` },
        ];
        maxTokens = 1000;
        temperature = 0.7;
        break;
      case 'complete':
        messages = [
          { role: 'system', content: systemPrompts.complete },
          {
            role: 'user',
            content: `Complete the sentence precisely (max 7 words): "${text}". Do not include the original text or any other text or characters.`,
          },
        ];
        maxTokens = 16;
        temperature = 0.2;
        n = 1;
        stop = ['.', '!', '?', '\n'];
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log('Sending request to OpenAI:', { messages, maxTokens, temperature }); // Debug log

    const typedMessages: ChatCompletionMessageParam[] = messages.map(
      (msg: Message) =>
        ({
          role: msg.role as ChatCompletionMessageParam['role'],
          content: msg.content,
        }) as ChatCompletionMessageParam
    );

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: typedMessages,
      max_tokens: maxTokens,
      temperature,
      ...(n && { n }),
      ...(stop && { stop }),
    });

    console.log('Received response from OpenAI:', response); // Debug log

    const content = response.choices[0]?.message.content?.trim() || '';

    console.log('Sending response:', { [action === 'refine' ? 'refinedContent' : 'suggestion']: content }); // Debug log

    return NextResponse.json({
      [action === 'refine' ? 'refinedContent' : 'suggestion']: content,
    });
  } catch (error) {
    console.error(`Error processing ${action} request:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to process ${action} request: ${errorMessage}` }, { status: 500 });
  }
}
