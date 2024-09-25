import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompts = {
  refine: `As my 'Master Prompt Engineer,' your mission is to design an optimal, personalized prompt tailored to my specific needs. You excel at refining prompts to ensure they are clear, concise, and comprehensible.

1. Review and improve the initial prompt.
2. Break down the prompt into smaller, manageable parts.
3. Answer with the refined prompt only.`,

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
  // console.log('Received request:', { text, action }); // Debug log

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
            content: `Complete the sentence precisely (max 8 words): "${text}". Do not include the original text or any other text or characters.`,
          },
        ];
        maxTokens = 32;
        temperature = 0.6;
        n = 1;
        stop = ['.', '!', '?', '\n'];
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // console.log('Sending request to OpenAI:', { messages, maxTokens, temperature }); // Debug log

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

    // console.log('Received response from OpenAI:', response); // Debug log

    const content = response.choices[0]?.message.content?.trim() || '';

    // console.log('Sending response:', { [action === 'refine' ? 'refinedContent' : 'suggestion']: content }); // Debug log

    return NextResponse.json({
      [action === 'refine' ? 'refinedContent' : 'suggestion']: content,
    });
  } catch (error) {
    console.error(`Error processing ${action} request:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to process ${action} request: ${errorMessage}` }, { status: 500 });
  }
}
