import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    const validToken = process.env.ADMIN_API_TOKEN || process.env.VITE_ADMIN_API_TOKEN;
    if (authHeader !== `Bearer ${validToken}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Count users at each funnel stage by checking which fields are populated
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('bagrut_grades, psycho_score_total, tracked_programs, major_subjects, email_primary, phone_primary');

        const { data: botUsers } = await supabase
            .from('bot_users')
            .select('grades, psychometric, tracked_programs, lead_stage, rooms_joined');

        const webProfiles = profiles || [];
        const bots = botUsers || [];

        // Web funnel stages
        const totalWeb = webProfiles.length;
        const enteredGrades = webProfiles.filter(p =>
            Array.isArray(p.bagrut_grades) && (p.bagrut_grades as any[]).length > 0
        ).length;
        const enteredPsycho = webProfiles.filter(p =>
            p.psycho_score_total && p.psycho_score_total > 0
        ).length;
        const trackedProgram = webProfiles.filter(p =>
            Array.isArray(p.tracked_programs) && p.tracked_programs.length > 0
        ).length;
        const authenticated = webProfiles.filter(p => p.email_primary).length;
        const sharedPhone = webProfiles.filter(p => p.phone_primary).length;

        // Bot funnel stages
        const totalBot = bots.length;
        const botEnteredGrades = bots.filter(b =>
            Array.isArray(b.grades) && (b.grades as any[]).length > 0
        ).length;
        const botEnteredPsycho = bots.filter(b =>
            b.psychometric && (b.psychometric as any).general > 0
        ).length;
        const botTracked = bots.filter(b =>
            Array.isArray(b.tracked_programs) && b.tracked_programs.length > 0
        ).length;
        const botJoinedRoom = bots.filter(b =>
            Array.isArray(b.rooms_joined) && b.rooms_joined.length > 0
        ).length;

        return res.status(200).json({
            web: [
                { name: 'total_users', count: totalWeb, label: 'משתמשים רשומים' },
                { name: 'entered_grades', count: enteredGrades, label: 'הזינו ציונים' },
                { name: 'entered_psychometric', count: enteredPsycho, label: 'הזינו פסיכומטרי' },
                { name: 'tracked_program', count: trackedProgram, label: 'עוקבים אחרי תוכנית' },
                { name: 'authenticated', count: authenticated, label: 'נרשמו (אימייל)' },
                { name: 'shared_phone', count: sharedPhone, label: 'שיתפו טלפון' },
            ],
            bot: [
                { name: 'total_bot_users', count: totalBot, label: 'משתמשי בוט' },
                { name: 'entered_grades', count: botEnteredGrades, label: 'הזינו ציונים' },
                { name: 'entered_psychometric', count: botEnteredPsycho, label: 'הזינו פסיכומטרי' },
                { name: 'tracked_program', count: botTracked, label: 'עוקבים אחרי תוכנית' },
                { name: 'joined_room', count: botJoinedRoom, label: 'הצטרפו לקבוצה' },
            ],
        });
    } catch (error: any) {
        console.error('Funnel metrics error:', error);
        return res.status(500).json({ error: error.message });
    }
}
