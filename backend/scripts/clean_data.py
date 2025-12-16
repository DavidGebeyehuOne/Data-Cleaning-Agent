import sys
import json
import pandas as pd
import numpy as np
import argparse

def load_data(filepath):
    if filepath.endswith('.csv'):
        return pd.read_csv(filepath)
    elif filepath.endswith('.xlsx') or filepath.endswith('.xls'):
        return pd.read_excel(filepath)
    elif filepath.endswith('.parquet'):
        return pd.read_parquet(filepath)
    raise ValueError("Unsupported format")

def save_data(df, filepath):
    if filepath.endswith('.csv'):
        df.to_csv(filepath, index=False)
    elif filepath.endswith('.xlsx'):
        df.to_excel(filepath, index=False)
    elif filepath.endswith('.parquet'):
        df.to_parquet(filepath, index=False)
    else:
        # Default to csv if unknown
        df.to_csv(filepath + '.csv', index=False)

def apply_cleaning(df, plan):
    report = []
    
    for step in plan:
        action = step.get('action')
        params = step.get('params', {})
        
        try:
            if action == 'drop_duplicates':
                prev_len = len(df)
                df = df.drop_duplicates()
                report.append(f"Dropped {prev_len - len(df)} duplicate rows")
                
            elif action == 'drop_missing':
                cols = params.get('columns', df.columns)
                prev_len = len(df)
                df = df.dropna(subset=cols)
                report.append(f"Dropped {prev_len - len(df)} rows with missing values in {cols}")
                
            elif action == 'impute':
                col = params.get('column')
                strategy = params.get('strategy', 'mean')
                value = params.get('value')
                
                if col in df.columns:
                    if strategy == 'mean':
                        fill_val = df[col].mean()
                    elif strategy == 'median':
                        fill_val = df[col].median()
                    elif strategy == 'mode':
                        fill_val = df[col].mode()[0]
                    elif strategy == 'value':
                        fill_val = value
                    else:
                        fill_val = None
                    
                    if fill_val is not None:
                        missing_count = df[col].isnull().sum()
                        df[col] = df[col].fillna(fill_val)
                        report.append(f"Imputed {missing_count} missing values in {col} with {strategy} ({fill_val})")

            elif action == 'drop_columns':
                cols = params.get('columns', [])
                df = df.drop(columns=[c for c in cols if c in df.columns])
                report.append(f"Dropped columns: {cols}")
                
            elif action == 'normalize':
                col = params.get('column')
                method = params.get('method', 'minmax')
                if col in df.columns and np.issubdtype(df[col].dtype, np.number):
                    if method == 'minmax':
                        df[col] = (df[col] - df[col].min()) / (df[col].max() - df[col].min())
                    elif method == 'zscore':
                        df[col] = (df[col] - df[col].mean()) / df[col].std()
                    report.append(f"Normalized {col} using {method}")

            elif action == 'convert_type':
                col = params.get('column')
                target_type = params.get('type') # 'numeric', 'datetime', 'string'
                if col in df.columns:
                    if target_type == 'numeric':
                        df[col] = pd.to_numeric(df[col], errors='coerce')
                    elif target_type == 'datetime':
                        df[col] = pd.to_datetime(df[col], errors='coerce')
                    elif target_type == 'string':
                        df[col] = df[col].astype(str)
                    report.append(f"Converted {col} to {target_type}")
            
            elif action == 'flag_outliers':
                # Add a new column flagging outliers
                col = params.get('column')
                if col in df.columns and np.issubdtype(df[col].dtype, np.number):
                     q1 = df[col].quantile(0.25)
                     q3 = df[col].quantile(0.75)
                     iqr = q3 - q1
                     lower_bound = q1 - 1.5 * iqr
                     upper_bound = q3 + 1.5 * iqr
                     df[f"{col}_is_outlier"] = (df[col] < lower_bound) | (df[col] > upper_bound)
                     report.append(f"Flagged outliers in {col}")

        except Exception as e:
            report.append(f"Error in step {step}: {str(e)}")
            
    return df, report

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("filepath")
    parser.add_argument("output_path")
    parser.add_argument("plan")
    args = parser.parse_args()
    
    try:
        if os.path.exists(args.plan):
            with open(args.plan, 'r') as f:
                plan = json.load(f)
        else:
            plan = json.loads(args.plan)

        df = load_data(args.filepath)
        cleaned_df, report = apply_cleaning(df, plan)
        save_data(cleaned_df, args.output_path)
        
        print(json.dumps({"status": "success", "report": report}))
    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e)}))
