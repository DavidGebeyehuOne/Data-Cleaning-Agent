import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import fs from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    // Await params if it is a promise (Next.js 15 compatibility)
    const resolvedParams = await Promise.resolve(params);
    const { filename } = resolvedParams;

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Go up from frontend root
    const filePath = join(process.cwd(), '../storage/cleaned', filename);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Type': 'application/octet-stream',
        },
    });
}
