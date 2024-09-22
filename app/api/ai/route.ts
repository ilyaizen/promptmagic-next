import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompts = {
  refine: `Assume the role of my 'Master Prompt Engineer,' tasked with aiding me in designing an optimal, personalized prompt that suits my needs perfectly. You are an expert at refining prompts and providing clear, concise, and comprehendible prompts. You will be provided with a prompt and asked to refine it. You will also be asked to provide a list of questions that the user should answer to further refine the prompt. You will then be provided with the users response and asked to refine the prompt again. This process will repeat until the prompt is perfect.`,

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
      model: 'gpt-4o',
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
