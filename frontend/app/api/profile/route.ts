import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { join } from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(request: NextRequest) {
    try {
        const { filename } = await request.json();

        if (!filename) {
            return NextResponse.json({ error: 'Filename required' }, { status: 400 });
        }

        const scriptPath = join(process.cwd(), '../backend/scripts/profile_data.py');
        const filePath = join(process.cwd(), '../storage/raw', filename);

        // Command to execute python script
        const command = `python "${scriptPath}" "${filePath}"`;

        const { stdout, stderr } = await execPromise(command);

        if (stderr && stderr.trim().length > 0) {
            console.log("Profiler Stderr:", stderr);
        }

        try {
            const result = JSON.parse(stdout.trim());
            return NextResponse.json(result);
        } catch (e) {
            console.error("Failed to parse output:", stdout);
            return NextResponse.json({ error: 'Failed to parse JSON from profiler', raw: stdout }, { status: 500 });
        }

    } catch (error) {
        console.error("Profile API Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
