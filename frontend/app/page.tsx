'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DatasetProfile } from '@/components/DatasetProfile';
import { CleaningPlan } from '@/components/CleaningPlan';
import { Sparkles, BarChart2, CheckCircle, FileText, Download, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function Home() {
  const [step, setStep] = useState<'upload' | 'profile' | 'plan' | 'clean' | 'done'>('upload');
  const [filename, setFilename] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [plan, setPlan] = useState<any[]>([]);
  const [cleanedFile, setCleanedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string[]>([]);

  const handleUpload = async (file: string) => {
    setFilename(file);
    setStep('profile');
    fetchProfile(file);
  };

  const fetchProfile = async (file: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file })
      });
      const data = await res.json();
      setProfile(data);
      setStep('profile');
    } catch (e) {
      alert("Failed to profile data");
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });
      const data = await res.json();
      setPlan(data);
      setStep('plan');
    } catch (e) {
      alert("Failed to plan cleaning");
    } finally {
      setLoading(false);
    }
  };

  const executePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, plan })
      });
      const data = await res.json();

      if (data.status === 'success' || data.cleaned_file) {
        setCleanedFile(data.cleaned_file);
        setReport(data.report || []);
        setStep('done');
      } else {
        alert("Cleaning failed: " + (data.error || 'Unknown error'));
      }
    } catch (e) {
      alert("Failed to execute cleaning");
    } finally {
      setLoading(false);
    }
  };

  const removePlanStep = (index: number) => {
    setPlan(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-lg shadow-blue-600/20">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Antigravity Agent
            </h1>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-500">
            {['Upload', 'Profile', 'Plan', 'Clean'].map((s, i) => {
              const steps = ['upload', 'profile', 'plan', 'clean', 'done'];
              const currentIdx = steps.indexOf(step);
              const thisIdx = steps.indexOf(s.toLowerCase());
              return (
                <div key={s} className={clsx("flex items-center gap-2 transition-colors", currentIdx >= thisIdx ? "text-blue-600" : "")}>
                  <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-all duration-300", currentIdx >= thisIdx ? "bg-blue-600 text-white border-blue-600 scale-110" : "bg-white border-slate-300")}>
                    {i + 1}
                  </div>
                  <span className="hidden sm:inline">{s}</span>
                </div>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {step === 'upload' && (
          <div className="max-w-2xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-extrabold mb-4 text-slate-900 tracking-tight">Clean your Data with AI</h2>
              <p className="text-slate-500 text-lg">Upload your raw dataset (CSV, Excel, Parquet) and let our intelligent agent profile, diagnose, and clean it for you.</p>
            </div>
            <div className="bg-white p-2 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <FileUpload onUpload={handleUpload} />
            </div>
          </div>
        )}

        {loading && step === 'profile' && !profile && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500">Profiling your data...</p>
          </div>
        )}

        {(step === 'profile' || step === 'plan' || step === 'done') && profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-2 space-y-6">
              {step === 'profile' && (
                <>
                  <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart2 className="text-blue-600" />
                        Data Health Profile
                      </h2>
                      <p className="text-slate-500 mt-1">Overview of data quality issues</p>
                    </div>
                    <button
                      onClick={generatePlan}
                      disabled={loading}
                      className="group bg-blue-600 hover:bg-blue-700 text-white pl-6 pr-4 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? 'Analyzing...' : <>Generate Plan <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                  </div>
                  <DatasetProfile profile={profile} />
                </>
              )}

              {step === 'plan' && (
                <CleaningPlan
                  plan={plan}
                  onApply={executePlan}
                  onRemoveStep={removePlanStep}
                  loading={loading}
                />
              )}

              {step === 'done' && (
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-10 text-center shadow-lg shadow-green-100">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-green-900 mb-2">Cleaning Complete!</h2>
                    <p className="text-green-700 mb-8 max-w-md mx-auto">Your dataset has been successfully processed. Review the changelog below.</p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <a href={`/api/download/${cleanedFile}`} className="flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 font-semibold shadow-xl shadow-green-600/20 transition-all hover:-translate-y-1">
                        <Download size={20} />
                        Download Cleaned File
                      </a>
                      <button onClick={() => { setStep('upload'); setProfile(null); }} className="px-8 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-700 transition-colors">
                        Process Another File
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <FileText className="text-slate-400" /> Change Log
                    </h3>
                    <ul className="space-y-3">
                      {report.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700 p-3 bg-slate-50 rounded-lg">
                          <span className="text-green-500 font-bold mt-0.5">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-4">Current Context</h3>
                <div className="flex items-center gap-4 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="bg-white p-2.5 rounded-lg border shadow-sm">
                    <FileText className="text-blue-500" size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-semibold text-slate-900 truncate" title={filename || ''}>{filename}</div>
                    <div className="text-xs text-slate-500">Active Dataset</div>
                  </div>
                </div>

                {step === 'profile' && (
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm leading-relaxed">
                    <p>Our agent has analyzed your data structure. Review the stats to understand missing values and distribution before asking the AI to plan a cleanup.</p>
                  </div>
                )}

                {step === 'plan' && (
                  <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg text-sm leading-relaxed">
                    <p>The AI has generated a custom plan based on your data profile. You can modify or remove steps you don't agree with before execution.</p>
                  </div>
                )}

                {profile && (
                  <div className="mt-6 border-t pt-6 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">Data Quality Score</span>
                        <span className="font-bold text-slate-900">
                          {((1 - (profile.column_stats ? Object.values(profile.column_stats).reduce((acc: any, curr: any) => acc + curr.missing_pct, 0) / (Object.keys(profile.column_stats).length || 1) / 100 : 0)) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: `${((1 - (profile.column_stats ? Object.values(profile.column_stats).reduce((acc: any, curr: any) => acc + curr.missing_pct, 0) / (Object.keys(profile.column_stats).length || 1) / 100 : 0)) * 100).toFixed(0)}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
