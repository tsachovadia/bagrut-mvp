import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendTelegramToGroup(chatId: string, text: string) {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    return (await res.json()) as { ok: boolean; error_code?: number };
}

/**
 * Admin API for Telegram room/group management
 * Actions: list_rooms, create_room, update_room, send_to_room
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action } = req.body;

    switch (action) {
        case 'list_rooms':
            return handleListRooms(res);
        case 'create_room':
            return handleCreateRoom(req, res);
        case 'update_room':
            return handleUpdateRoom(req, res);
        case 'send_to_room':
            return handleSendToRoom(req, res);
        default:
            return res.status(400).json({ error: `Unknown action: ${action}` });
    }
}

async function handleListRooms(res: VercelResponse) {
    const { data, error } = await supabase
        .from('bot_groups')
        .select('*')
        .order('is_active', { ascending: false })
        .order('name');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true, rooms: data });
}

async function handleCreateRoom(req: VercelRequest, res: VercelResponse) {
    const { telegram_group_id, name, type, invite_link, description, field_tags } = req.body;

    if (!telegram_group_id || !name || !type || !invite_link) {
        return res.status(400).json({ error: 'Missing required fields: telegram_group_id, name, type, invite_link' });
    }

    const { data, error } = await supabase
        .from('bot_groups')
        .insert({
            telegram_group_id,
            name,
            type,
            invite_link,
            description: description || null,
            field_tags: field_tags || [],
            is_active: true,
            auto_moderate: true,
            member_count: 0,
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true, room: data });
}

async function handleUpdateRoom(req: VercelRequest, res: VercelResponse) {
    const { room_id, updates } = req.body;

    if (!room_id || !updates) {
        return res.status(400).json({ error: 'Missing room_id or updates' });
    }

    // Only allow safe fields to be updated
    const safeUpdates: Record<string, any> = {};
    const allowedFields = ['name', 'type', 'invite_link', 'description', 'field_tags', 'is_active', 'auto_moderate'];
    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            safeUpdates[field] = updates[field];
        }
    }

    const { data, error } = await supabase
        .from('bot_groups')
        .update(safeUpdates)
        .eq('id', room_id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true, room: data });
}

async function handleSendToRoom(req: VercelRequest, res: VercelResponse) {
    const { room_id, message } = req.body;

    if (!room_id || !message) {
        return res.status(400).json({ error: 'Missing room_id or message' });
    }

    // Get room's telegram_group_id
    const { data: room, error: roomError } = await supabase
        .from('bot_groups')
        .select('telegram_group_id, name')
        .eq('id', room_id)
        .single();

    if (roomError || !room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    // Send message to Telegram group
    const result = await sendTelegramToGroup(room.telegram_group_id, message);

    // Log the message
    await supabase.from('bot_messages_log').insert({
        bot_user_id: 'admin',
        direction: 'outgoing',
        message_type: 'room_content',
        content: message.substring(0, 500),
        campaign_id: `room_${room_id}`,
    });

    return res.status(200).json({ ok: true, telegram_result: result });
}
