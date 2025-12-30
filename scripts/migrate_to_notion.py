import csv
import json
import time
import getpass
import requests

# Configuration
DATABASE_ID = "55d3d0a9-d603-4b87-aaa3-c812a8b2207e"
CSV_PATH = "scripts/remaining_leads.csv"

def create_notion_page(notion_token, properties):
    url = "https://api.notion.com/v1/pages"
    headers = {
        "Authorization": f"Bearer {notion_token}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    payload = {
        "parent": {"database_id": DATABASE_ID},
        "properties": properties
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        print(f"Error creating page: {response.text}")
        return False
    return True

def format_properties(row):
    """
    Formats CSV row to Notion properties structure.
    """
    props = {}
    
    # Title field
    if row.get("שם מלא"):
        props["שם מלא"] = {"title": [{"text": {"content": row["שם מלא"]}}]}
    
    # URL field
    if row.get("קישור לפרופיל"):
        props["קישור לפרופיל"] = {"url": row["קישור לפרופיל"]}
    
    # Date field
    if row.get("תאריך הצטרפות"):
        props["תאריך הצטרפות"] = {"date": {"start": row["תאריך הצטרפות"]}}
    
    # Rich Text fields
    rich_text_fields = ["facebook_user_id", "אימייל", "תואר מבוקש", "גיל", "עיר", "דילמה", "טיוטת AI"]
    for field in rich_text_fields:
        val = row.get(field, "")
        if val:
            # Handle potential long text or special characters
            props[field] = {"rich_text": [{"text": {"content": str(val)[:2000]}}]} # Notion limit per block
            
    return props

def main():
    print("--- Notion Data Migration Tool ---")
    notion_token = getpass.getpass("Enter your Notion Integration Token: ")
    
    if not notion_token:
        print("Token is required.")
        return

    leads = []
    try:
        with open(CSV_PATH, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            leads = list(reader)
    except FileNotFoundError:
        print(f"Error: {CSV_PATH} not found. Please run the export script first.")
        return

    total = len(leads)
    print(f"Found {total} leads to migrate.")
    
    # To avoid duplicates if the script is re-run, you might want to implement a check here.
    # For now, we proceed with the migration.
    
    success_count = 0
    for i, lead in enumerate(leads):
        name = lead.get("שם מלא", "Unknown")
        print(f"[{i+1}/{total}] Migrating: {name}...", end="", flush=True)
        
        props = format_properties(lead)
        if create_notion_page(notion_token, props):
            print(" Done.")
            success_count += 1
        else:
            print(" Failed.")
        
        # Notion rate limit is 3 requests per second
        time.sleep(0.34)

    print(f"\nMigration complete! {success_count}/{total} leads migrated.")

if __name__ == "__main__":
    main()
