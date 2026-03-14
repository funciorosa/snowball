import { NextResponse } from 'next/server'

interface FearGreedResponse {
  data: Array<{
    value: string
    value_classification: string
    timestamp: string
  }>
}

export async function GET() {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1', {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    const json: FearGreedResponse = await res.json()
    const item = json.data[0]

    return NextResponse.json({
      value: item.value,
      valueClassification: item.value_classification,
      timestamp: item.timestamp,
    })
  } catch {
    return NextResponse.json({
      value: '52',
      valueClassification: 'Neutral',
      timestamp: Date.now().toString(),
    })
  }
}
