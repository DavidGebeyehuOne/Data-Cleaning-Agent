import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Assuming we are in /frontend, storage is in ../storage/raw
    const uploadDir = join(process.cwd(), '../storage/raw');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const path = join(uploadDir, file.name);
    await writeFile(path, buffer);

    return NextResponse.json({ success: true, filename: file.name });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
