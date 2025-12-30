import csv
import os
from datetime import datetime

FB_CSV_PATH = "/Users/syrianhammer/Library/Mobile Documents/com~apple~CloudDocs/Documents/1 Projects/Launch_Pad_MVP/DATA/Group Lead - Sheet1.csv"
OUTPUT_CSV_PATH = "scripts/fb_leads_migration.csv"

def parse_date(date_str):
    if not date_str or not isinstance(date_str, str):
        return ""
    
    date_str = date_str.strip()
    formats = [
        "%m/%d/%Y %I:%M:%S %p", # 11/27/2024 8:49:13 PM
        "%m/%d/%Y",             # 07/09/2025
        "%d/%m/%Y",             # 09/07/2025
        "%Y-%m-%d"              # 2024-12-28
    ]
    
    # Try the complex format first
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue
            
    # If no format matches, try to take the first part and check if it's MM/DD/YYYY or DD/MM/YYYY
    parts = date_str.split(' ')[0]
    if '/' in parts:
        sub_parts = parts.split('/')
        if len(sub_parts) == 3:
            # Heuristic: if first part > 12, it's DD/MM/YYYY
            # Otherwise, assume MM/DD/YYYY (common in FB exports)
            # Actually, standardizing to a safer approach:
            try:
                # Try simple splitting
                m, d, y = sub_parts
                if int(m) > 12: # Swap if it looks like DD/MM/YYYY
                    m, d = d, m
                return f"{y}-{int(m):02d}-{int(d):02d}"
            except:
                pass

    return ""

def convert_fb_to_notion():
    if not os.path.exists(FB_CSV_PATH):
        print(f"Error: {FB_CSV_PATH} not found.")
        return

    field_mapping = [
        "שם מלא", "facebook_user_id", "קישור לפרופיל", "אימייל", 
        "תואר מבוקש", "תאריך הצטרפות", "גיל", "עיר", "דילמה", "טיוטת AI"
    ]

    with open(FB_CSV_PATH, mode='r', encoding='utf-8') as infile:
        # Note: The file seems to have a trailing comma or weird headers, using DictReader
        reader = csv.DictReader(infile)
        
        output_rows = []
        for row in reader:
            out_row = {field: "" for field in field_mapping}
            
            out_row["שם מלא"] = row.get("Full Name", "")
            out_row["facebook_user_id"] = row.get("User ID", "")
            out_row["קישור לפרופיל"] = row.get("User ID", "")
            out_row["תאריך הצטרפות"] = parse_date(row.get("Date Added", ""))
            out_row["עיר"] = row.get("Location", "")
            
            # Heuristic mapping for Q&A
            for i in range(1, 4):
                q = row.get(f"Q{i}", "").lower()
                a = row.get(f"A{i}", "")
                
                if not q or not a:
                    continue
                
                if "מייל" in q or "email" in q:
                    out_row["אימייל"] = a
                elif "גיל" in q or "age" in q:
                    out_row["גיל"] = a
                elif "תואר" in q or "degree" in q or "ללמוד" in q:
                    out_row["תואר מבוקש"] = a

            output_rows.append(out_row)

    with open(OUTPUT_CSV_PATH, mode='w', encoding='utf-8', newline='') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=field_mapping)
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"Successfully converted Facebook data to {OUTPUT_CSV_PATH}")
    print(f"Total leads: {len(output_rows)}")

if __name__ == "__main__":
    convert_fb_to_notion()
