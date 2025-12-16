import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ProfileProps {
    profile: any;
}

export function DatasetProfile({ profile }: ProfileProps) {
    if (!profile) return null;

    const columnStats = Object.entries(profile.column_stats).map(([col, stat]: [string, any]) => ({
        name: col,
        missing: stat.missing,
        missing_pct: stat.missing_pct,
        unique: stat.unique,
        type: stat.type
    }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-sm text-gray-500">Rows</div>
                    <div className="text-2xl font-bold">{profile.rows}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-sm text-gray-500">Columns</div>
                    <div className="text-2xl font-bold">{profile.columns}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-sm text-gray-500">Duplicates</div>
                    <div className="text-2xl font-bold text-red-500">{profile.duplicates}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-sm text-gray-500">Memory</div>
                    <div className="text-2xl font-bold">{(profile.memory_usage / 1024 / 1024).toFixed(2)} MB</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Missing Values per Column</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={columnStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="missing" fill="#EF4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Column Details</h3>
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2">Column</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Missing</th>
                            <th className="px-4 py-2">Unique</th>
                            <th className="px-4 py-2">Outliers</th>
                            <th className="px-4 py-2">Sample</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(profile.column_stats).map(([col, stat]: [string, any]) => (
                            <tr key={col} className="border-b">
                                <td className="px-4 py-2 font-medium">{col}</td>
                                <td className="px-4 py-2 text-gray-500">{stat.type}</td>
                                <td className="px-4 py-2 text-red-500">{stat.missing} ({stat.missing_pct.toFixed(1)}%)</td>
                                <td className="px-4 py-2">{stat.unique}</td>
                                <td className="px-4 py-2 text-orange-500">{stat.outliers || 0}</td>
                                <td className="px-4 py-2 text-gray-400 truncate max-w-xs">{JSON.stringify(stat.sample)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
