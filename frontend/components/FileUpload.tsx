import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
    onUpload: (filename: string) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                onUpload(data.filename);
            } else {
                alert("Upload failed: " + data.message);
            }
        } catch (e) {
            alert("Error uploading file");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <label className="flex flex-col items-center w-full h-full justify-center">
                {loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                ) : (
                    <>
                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-gray-500 font-medium">Click to upload or drag & drop</span>
                        <span className="text-gray-400 text-sm mt-1">CSV, Excel, Parquet</span>
                    </>
                )}
                <input type="file" className="hidden" onChange={handleChange} accept=".csv,.xlsx,.parquet" disabled={loading} />
            </label>
        </div>
    );
}
