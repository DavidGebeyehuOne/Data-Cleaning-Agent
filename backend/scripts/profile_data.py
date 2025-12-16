import sys
import json
import pandas as pd
import numpy as np
import argparse
import os

def ensure_serializable(obj):
    if isinstance(obj, (np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    if isinstance(obj, (np.float64, np.float32, np.float16)):
        return float(obj)
    if isinstance(obj, np.bool_):
        return bool(obj)
    if pd.isna(obj):
        return None
    return str(obj)

def load_data(filepath):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")
    
    if filepath.endswith('.csv'):
        return pd.read_csv(filepath)
    elif filepath.endswith('.xlsx') or filepath.endswith('.xls'):
        return pd.read_excel(filepath)
    elif filepath.endswith('.parquet'):
        return pd.read_parquet(filepath)
    else:
        raise ValueError("Unsupported file format")

def profile(filepath):
    try:
        df = load_data(filepath)
    except Exception as e:
        return {"error": str(e)}

    stats = {
        "rows": len(df),
        "columns": len(df.columns),
        "duplicates": df.duplicated().sum(),
        "memory_usage": df.memory_usage(deep=True).sum(),
        "column_stats": {},
        "head": df.head(10).to_dict(orient='records')
    }

    for col in df.columns:
        col_type = str(df[col].dtype)
        missing = df[col].isnull().sum()
        unique = df[col].nunique()
        
        col_stat = {
            "type": col_type,
            "missing": missing,
            "missing_pct": (missing / len(df)) * 100 if len(df) > 0 else 0,
            "unique": unique,
            "sample": df[col].dropna().head(5).tolist()
        }

        if np.issubdtype(df[col].dtype, np.number):
            try:
                q1 = df[col].quantile(0.25)
                q3 = df[col].quantile(0.75)
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
                
                col_stat.update({
                    "mean": df[col].mean(),
                    "std": df[col].std(),
                    "min": df[col].min(),
                    "max": df[col].max(),
                    "outliers": outliers
                })
            except Exception:
                pass # Skip if error in calc
            
        stats["column_stats"][col] = col_stat

    return stats

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("filepath")
    args = parser.parse_args()
    
    result = profile(args.filepath)
    print(json.dumps(result, default=ensure_serializable))
