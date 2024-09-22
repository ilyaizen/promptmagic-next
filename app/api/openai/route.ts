import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { text } = await req.json();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a master prompt engineer AI, you are an expert at completing sentences and providing short, concise text completions.',
        },
        {
          role: 'user',
          content: `Complete the sentence precisely (max 7 words): "${text}". Do not include the original text or any other text or characters.`,
        },
      ],
      max_tokens: 16,
      n: 1,
      stop: ['.', '!', '?', '\n'],
      temperature: 0.2,
    });

    return NextResponse.json({ suggestion: response.choices[0]?.message.content?.trim() || '' });
  } catch (error) {
    console.error('Error getting suggestion:', error);
    return NextResponse.json({ error: 'Failed to get suggestion' }, { status: 500 });
  }
}
