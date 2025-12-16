import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { join } from 'path';
import util from 'util';
import fs from 'fs';

const execPromise = util.promisify(exec);

export async function POST(request: NextRequest) {
    try {
        const { filename, plan } = await request.json();

        if (!filename || !plan) {
            return NextResponse.json({ error: 'Filename and plan required' }, { status: 400 });
        }

        const scriptPath = join(process.cwd(), '../backend/scripts/clean_data.py');
        const inputPath = join(process.cwd(), '../storage/raw', filename);
        const newFilename = `cleaned_${Date.now()}_${filename}`;

        const cleanedDir = join(process.cwd(), '../storage/cleaned');
        if (!fs.existsSync(cleanedDir)) {
            fs.mkdirSync(cleanedDir, { recursive: true });
        }

        const outputPath = join(cleanedDir, newFilename);

        const reportsDir = join(process.cwd(), '../storage/reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        const planPath = join(reportsDir, `plan_${Date.now()}.json`);
        fs.writeFileSync(planPath, JSON.stringify(plan));

        const command = `python "${scriptPath}" "${inputPath}" "${outputPath}" "${planPath}"`;

        const { stdout, stderr } = await execPromise(command);

        if (stderr && stderr.trim().length > 0) {
            console.log("Clean Stderr:", stderr);
        }

        try {
            const result = JSON.parse(stdout.trim());
            return NextResponse.json({ ...result, cleaned_file: newFilename });
        } catch (e) {
            console.error("Failed to parse output:", stdout);
            return NextResponse.json({ error: 'Failed to parse JSON from cleaner', raw: stdout }, { status: 500 });
        }

    } catch (error) {
        console.error("Clean API Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
