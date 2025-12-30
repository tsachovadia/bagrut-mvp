import csv
import os

FILES_TO_MERGE = [
    "scripts/leads_migration.csv",
    "scripts/fb_leads_migration.csv"
]
FINAL_CSV_PATH = "scripts/final_migration.csv"

def merge_and_deduplicate():
    unique_leads = {} # facebook_user_id -> row_data
    
    field_mapping = [
        "שם מלא", "facebook_user_id", "קישור לפרופיל", "אימייל", 
        "תואר מבוקש", "תאריך הצטרפות", "גיל", "עיר", "דילמה", "טיוטת AI"
    ]

    total_skipped = 0
    total_loaded = 0

    for file_path in FILES_TO_MERGE:
        if not os.path.exists(file_path):
            print(f"Warning: {file_path} not found. Skipping.")
            continue
            
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                user_id = row.get("facebook_user_id", "").strip()
                email = row.get("אימייל", "").strip()
                
                # Use User ID as primary key, fallback to email if ID is missing (though unlikely here)
                key = user_id if user_id else f"email:{email}"
                
                if not key or key == "email:":
                    # Skip rows without any identifier
                    continue

                if key in unique_leads:
                    # Merge logic: if new row has data the existing one lacks, fill it in
                    existing = unique_leads[key]
                    for field in field_mapping:
                        if not existing[field] and row.get(field):
                            existing[field] = row[field]
                    total_skipped += 1
                else:
                    unique_leads[key] = row
                    total_loaded += 1

    with open(FINAL_CSV_PATH, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=field_mapping)
        writer.writeheader()
        writer.writerows(unique_leads.values())

    print(f"Merge Complete!")
    print(f"Total Unique Leads: {total_loaded}")
    print(f"Duplicates Merged: {total_skipped}")
    print(f"Final file saved to: {FINAL_CSV_PATH}")

if __name__ == "__main__":
    merge_and_deduplicate()
