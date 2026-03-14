import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are Sabrina, a friendly chibi ice queen AI assistant for the Snowball crypto trading app. You are an expert in:
- The snowball compound method (2% daily target to grow a $1000 account)
- Crypto trading basics (BTC/ETH/SOL)
- How to read trading signals and entry/exit points
- The snowball calendar visualization (daily performance tracking)
- Risk management with $1000 capital
- Wave challenges and arena tournaments
- Binance basics for beginners

Keep responses warm, encouraging, and concise (2-4 sentences max unless explaining a concept). Use ❄️ ✦ 🌊 occasionally. Always remind users you are not a financial advisor when giving specific trade advice. Be supportive of their trading journey!`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json() as { messages: Message[] }

    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: formattedMessages,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    return NextResponse.json({ content: content.text })
  } catch (error) {
    console.error('Sabrina API error:', error)
    return NextResponse.json(
      { content: "Sorry, I'm having trouble connecting right now ❄ Please try again in a moment!" },
      { status: 200 }
    )
  }
}
