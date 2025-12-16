import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
    try {
        const { profile } = await request.json();

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Return a heuristic based plan if no API key is present
            const heuristicPlan = [];

            // 1. Duplicates
            if (profile.duplicates > 0) {
                heuristicPlan.push({
                    action: 'drop_duplicates',
                    params: {},
                    reasoning: `Found ${profile.duplicates} duplicate rows.`
                });
            }

            // 2. Missing Values
            for (const [col, stats] of Object.entries(profile.column_stats || {}) as any) {
                if (stats.missing > 0) {
                    if (stats.type.includes('float') || stats.type.includes('int')) {
                        heuristicPlan.push({
                            action: 'impute',
                            params: { column: col, strategy: 'mean' },
                            reasoning: `Column '${col}' has ${stats.missing} missing values. Imputing with mean.`
                        });
                    } else {
                        heuristicPlan.push({
                            action: 'impute',
                            params: { column: col, strategy: 'mode' },
                            reasoning: `Column '${col}' has ${stats.missing} missing values. Imputing with mode.`
                        });
                    }
                }

                // 3. Outliers
                if (stats.outliers && stats.outliers > 0) {
                    heuristicPlan.push({
                        action: 'flag_outliers',
                        params: { column: col },
                        reasoning: `Column '${col}' has ${stats.outliers} potential outliers.`
                    });
                }
            }

            return NextResponse.json(heuristicPlan);
        }

        const openai = new OpenAI({ apiKey });

        const prompt = `
        You are an expert Data Cleaning Agent. Analyze the following dataset profile and propose a cleaning plan.
        
        Profile:
        ${JSON.stringify(profile, null, 2)}
        
        Available Actions:
        1. drop_duplicates: No params.
        2. drop_missing: params: { columns: [list of cols] }
        3. impute: params: { column: "col_name", strategy: "mean" | "median" | "mode" | "value", value: optional_val }
        4. drop_columns: params: { columns: [list of cols] }
        5. normalize: params: { column: "col_name", method: "minmax" | "zscore" }
        6. convert_type: params: { column: "col_name", type: "numeric" | "datetime" | "string" }
        7. flag_outliers: params: { column: "col_name" }

        Return a strictly valid JSON array of objects, where each object has:
        - "action": string (one of the above)
        - "params": object (parameters for the action)
        - "reasoning": string (explanation for why this action is needed)

        Prioritize fixing missing values, duplicates, and obvious outliers.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You represent a data cleaning agent. Output only JSON." },
                { role: "user", content: prompt }
            ],
            temperature: 0.2,
        });

        const content = response.choices[0].message.content;
        const jsonStr = content?.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const plan = JSON.parse(jsonStr || '[]');
            return NextResponse.json(plan);
        } catch (e) {
            return NextResponse.json({ error: "Failed to parse LLM response" }, { status: 500 });
        }

    } catch (error) {
        console.error("Plan API Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
