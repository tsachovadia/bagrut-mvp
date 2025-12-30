import csv

# List of names that were marked as "Done" in the user's run
SUCCESSFUL_NAMES = [
    "Rei Walz", "שיר חליפה", "Noam Dror", "טליה אמיר", "נועם מאיר", "IntellAcademix", "יעקב עסיס", 
    "מאיה בביזאייב", "טל אור", "Aviel Levi", "Yuval Nevo", "הדס פלדמן", "Yaron Karavani", "Eden Berger", 
    "אורי זוארץ", "סמיון חריסטיוק", "Amit Yoav Telmon", "Inbar Rachamimov", "Noa Logsi", "Shahd Khaled", 
    "שיראל שטרן", "Roniamar", "Vera Metzner", "עדן חמו", "Elya Sofferr", "Qe Ij", "Hadar Karandian", 
    "אסמאעיל ריטה ריטה חד׳ר", "עדי טויטו", "Shilo Cohen", "איתי חזן", "Ro Ron", "הלל פיידמן", "רותם גל", 
    "Gal David", "Ora Alene", "דנה צרבסקי", "Benny Rosu", "Linor Adi", "Elizaveta Shporina", "Romi Abramovich", 
    "מיכל רובין", "Yoni Cohen", "Rosa Davidovich", "דוד מצליח", "ריטה קגנוביץ", "הדס דוד", "Eli Erlanger", 
    "מאי גולן", "Haim Levy", "Yael Haslavsky", "Aviad Feuchtwanger", "Genya Shkolnik", "عآئشه مصآروه", 
    "ליה עממי", "Dolev Dolev", "דורין שאער", "דניאל פורטנוי", "שירה שכטר", "לירם ויצמן", "McFarland Lester", 
    "Yaffa Cuffer", "נעמי וולאס", "Noa Groissman", "ליאן טואלט", "שימרית פריזה", "דניאל דגן", "Talya Paskal", 
    "RU BA", "Natasha Talinkivich", "Tamar Go", "Itay Margolin", "Orel Oved", "רוני ויסבלום", "אליאב דהן", 
    "Lina Samir", "קרן לוי", "Jimmy Kulick Sr.", "Sebby Michale", "שגיא כהן", "מיכל כהן", "Erez Bismuth", 
    "Hila Hut", "Nitzan Aizen", "Gal Or", "Osher Arniv", "אריאל אלקין", "ליאור לוגסי", "נטלי שבח", "Tamar Nov", 
    "דניאל חברסון", "קים אשורוב", "Dor Dahan", "Sh Dana", "ששון יצחק", "Keren", "Shir Damesek", "Mazal Bayo", 
    "Idk Idek", "Inbal Achunov", "אייל זהב", "Nad Ban", "Ido Rosenberg", "Maor Mougraby", "סמואל יאר", 
    "ליהיא פרג", "Tomer Froman", "דוויד קופרפילד", "lior Tanami", "רון יוסף", "עדן רבינוביץ", "Tommy Levin", 
    "Yahel Shalom Levi", "Kobi Ariel", "Dalit Adi", "רוני אברך", "Noya Tabib", "לירון אבן צור", "Assaf Tlv", 
    "Eva", "מתן גולדנברג", "Dana Yakov", "שחר דוד", "Yedidya S Kasai", "Maya Sk", "Suzan Awabde", 
    "ישראל ישראלי", "נועם גבאי", "Uugolek", "Tomer Tarnovsky", "Ophir Aviram", "ליאל חגג", "שי קסה", 
    "Bharat Baid", "Rachel Caro", "Shai Minai", "יעקב מלדה", "יהושע כהן", "עדי אלדר", "עילי נח", "נועה ארנון", 
    "Lihi Amar", "Ofek Hugi", "Ka Mi", "Ella Osherov", "נתן פוקס", "Batya Schwartz", "שנהב קובני", "Or Elias", 
    "Saleh Az", "אביגיל מקגון", "אוהד יונה", "שי לוי", "יאיר הרשקוביץ", "Lisa Cowan", "ליאור שמעוני", 
    "Divi Cam", "שירה כץ", "Tami Tami", "תמר סירי", "Rose Dan", "אור אוריה", "שיילי פישר", "Yair BN", 
    "An Isk", "Shimon Edri", "Ab Mostafa", "עלמה לוין", "Shira Amar", "Catalina Patolsky", "Avital Miron", 
    "Kayt Kh", "Inbal Ohev Shalom", "Lynn Rendel Singer", "Wasem Sharkawi", "צח עובדיה", "JD Gozum", 
    "Opal Ben Harush", "Yael Somech", "Ko Be", "Daphna Vamos", "קורל קורל שפרלינג", "Ravit Yosefi", 
    "שאלה מהלב אל הלב", "דוד דודי", "Aviv Harush", "Renana Naamat", "רומי צ'ודנובסקי", "מרדכי שושן", 
    "Sasha Lukashev", "Miki Landa", "אהרון סיני", "Ron Gilad", "גל הלפרין", "Alon Finkel", "רואה חשבון ומעבר", 
    "Yuliya Naftali", "Ofir Hasson", "Shay Hadar", "מחמד אלגלאוי", "ניר הורביץ", "איילון שמש", "Eitan Aman", 
    "אנה יצוק", "Martin", "Adi Cohen", "Yael Sicsu", "Roni Benhaim", "גלית איילון", "Sami Majadly", "Mar Azim", 
    "Lamees Abdelhade", "Racheli Racheli", "Din Mi", "Leenoy Cohen", "דבורי הול", "Itz Tesumole", "גיא", 
    "עדן שטה", "Yonatan Carmi Medina", "Or Or", "אושר נגט", "Mika Bursztyn", "Victoria Kyei", "אילה ישר", 
    "Chen Kahansky", "מוחמד סוהיל", "Bar Zharur", "Areen Ghanayem", "Guillaume Mais", "Ali Ali", 
    "Àntonia Gregory", "Kamr Abu", "Olga Wyberman", "בנימין פיקרסגי", "מיטל אר", "יניר וולף", "Zulya Khaimova", 
    "צליל שיבי", "Dan Meiri", "Chen Nakash", "שונטל עמרני", "Tal Chazanovich", "רוני מימון", "ישראל אטיאס", 
    "Elizabeth Roumiantsev", "ברק יוסף", "Ofir Ben Avi", "Shir Abdayev", "Omer Yehuda", "Natalie Sharabi", 
    "שירה אויזרט", "אלרועי אורבך", "Ani Ot", "Adar Chakle", "מאי אלמוג", "Talya Cohen Zedek", "Liat Alma", 
    "גלית עזרא", "חיה לוי", "Aviel Reznikovski", "מאיה רוזנברג", "Nicole Veprynsky", "Yuval Elemelch", 
    "בתאל בן ארוש", "Revital Borochov", "Inessa Ulianov", "Nicole Grakovski", "שלי קמחי", "אריאל ספירא", 
    "Danielle Miron", "Guy Elgresy", "מישאל חלילי", "מיטל תורג׳מן", "Yoav Minkovsky", "הילה פייגין", 
    "Sabra Bastone", "סוזי אור-יה", "Nicole Meerov", "Sagi Varsano", "Sigalit Avissar", "שמחה צנז", 
    "רחל אלמו", "יובל ירון", "Anna Batushansky", "Salvation Pablo", "זוהר שמואל", "Rotem Agmon", 
    "רועי גברילידיס", "Odi HR", "Abdallah Awedah", "Daniel Fialchuk", "Shir Tzror", "Shiri Roth"
]

# Note: Added empty strings as they appeared in log as "..."
SUCCESSFUL_NAMES = set([n.strip() for n in SUCCESSFUL_NAMES if n.strip()])

def filter_remaining():
    source = "scripts/final_migration.csv"
    output = "scripts/remaining_leads.csv"
    
    with open(source, mode='r', encoding='utf-8') as f:
        reader = list(csv.DictReader(f))
        fieldnames = reader[0].keys()
        
        remaining = []
        skipped_count = 0
        
        for row in reader:
            name = row["שם מלא"].strip()
            if name in SUCCESSFUL_NAMES:
                skipped_count += 1
                continue
            remaining.append(row)
            
    with open(output, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(remaining)
        
    print(f"Filtered {len(remaining)} leads remaining.")
    print(f"Skipped {skipped_count} leads that are already in Notion.")

if __name__ == "__main__":
    filter_remaining()
    print("Done!")
