import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'scratch', 'model_config.json');

export async function GET() {
  try {
    if (!fs.existsSync(configPath)) {
      return NextResponse.json({ showButton: true });
    }
    const data = fs.readFileSync(configPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ showButton: true });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Ensure the scratch directory exists
    const scratchDir = path.join(process.cwd(), 'scratch');
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
