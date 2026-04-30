import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'scratch', 'model_submissions.json');

export async function GET() {
  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([]);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let submissions = [];
    
    // Ensure the scratch directory exists
    const scratchDir = path.join(process.cwd(), 'scratch');
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      submissions = JSON.parse(data);
    }
    
    submissions.push({
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      ...body,
      created_at: new Date().toISOString()
    });
    
    fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
