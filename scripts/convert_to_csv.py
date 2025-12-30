import json
import csv
import os

def convert_json_to_csv(json_path, csv_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Mapping based on the implementation plan
    field_mapping = {
        "full_name": "שם מלא",
        "facebook_user_id": "facebook_user_id",
        "profile_link": "קישור לפרופיל",
        "email": "אימייל",
        "target_degree": "תואר מבוקש",
        "joined_group_at": "תאריך הצטרפות",
        "age": "גיל",
        "city": "עיר",
        "dilemma": "דילמה",
        "ai_draft": "טיוטת AI"
    }

    # Destination CSV headers
    headers = list(field_mapping.values())

    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        
        for item in data:
            row = {}
            for sb_field, notion_field in field_mapping.items():
                val = item.get(sb_field, "")
                # Handle nulls
                if val is None:
                    val = ""
                # Handle date formatting if needed (Notion expects ISO or YYYY-MM-DD)
                if sb_field == "joined_group_at" and val:
                    # Supabase format: 2024-12-05T11:44:56+00:00 or similar
                    val = val.split('T')[0]
                row[notion_field] = val
            writer.writerow(row)

if __name__ == "__main__":
    json_file = "scripts/leads_data.json"
    csv_file = "scripts/leads_migration.csv"
    if os.path.exists(json_file):
        convert_json_to_csv(json_file, csv_file)
        print(f"Successfully converted {json_file} to {csv_file}")
    else:
        print(f"Error: {json_file} not found.")
