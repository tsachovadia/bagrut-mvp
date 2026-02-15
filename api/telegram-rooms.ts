import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function telegramApi(method: string, body: Record<string, any>) {
    const res = await fetch(`${TELEGRAM_BASE}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return (await res.json()) as { ok: boolean; result?: any; error_code?: number; description?: string };
}

async function sendTelegramToGroup(chatId: string, text: string, messageThreadId?: number) {
    const body: Record<string, any> = { chat_id: chatId, text, parse_mode: 'HTML' };
    if (messageThreadId) body.message_thread_id = messageThreadId;
    return telegramApi('sendMessage', body);
}

/**
 * Admin API for Telegram room/group management
 * Actions: list_rooms, create_room, update_room, send_to_room, create_topic, send_to_topic, close_topic, reopen_topic
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_SECRET || process.env.VITE_ADMIN_API_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY}`) {
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
        case 'create_topic':
            return handleCreateTopic(req, res);
        case 'send_to_topic':
            return handleSendToTopic(req, res);
        case 'close_topic':
            return handleToggleTopic(req, res, false);
        case 'reopen_topic':
            return handleToggleTopic(req, res, true);
        case 'broadcast_to_topics':
            return handleBroadcastToTopics(req, res);
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

    // Get room's telegram_group_id + forum_topic_id
    const { data: room, error: roomError } = await supabase
        .from('bot_groups')
        .select('telegram_group_id, name, forum_topic_id')
        .eq('id', room_id)
        .single();

    if (roomError || !room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    // Send message to Telegram group (or topic within it)
    const result = await sendTelegramToGroup(
        room.telegram_group_id,
        message,
        room.forum_topic_id || undefined
    );

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

/**
 * Create a forum topic in the parent supergroup via Telegram API and save to DB
 */
async function handleCreateTopic(req: VercelRequest, res: VercelResponse) {
    const { parent_group_id, name, description, field_tags, type } = req.body;

    if (!parent_group_id || !name) {
        return res.status(400).json({ error: 'Missing parent_group_id or name' });
    }

    // Get parent group
    const { data: parent, error: parentError } = await supabase
        .from('bot_groups')
        .select('telegram_group_id, invite_link, is_forum')
        .eq('id', parent_group_id)
        .single();

    if (parentError || !parent) {
        return res.status(404).json({ error: 'Parent group not found' });
    }

    if (!parent.is_forum) {
        return res.status(400).json({ error: 'Parent group is not a forum-enabled supergroup' });
    }

    // Create topic via Telegram API
    const topicResult = await telegramApi('createForumTopic', {
        chat_id: parent.telegram_group_id,
        name,
    });

    if (!topicResult.ok || !topicResult.result) {
        return res.status(500).json({
            error: 'Failed to create Telegram topic',
            details: topicResult.description,
        });
    }

    const forumTopicId = topicResult.result.message_thread_id;

    // Save topic as a child row in bot_groups
    const { data: topic, error: insertError } = await supabase
        .from('bot_groups')
        .insert({
            telegram_group_id: parent.telegram_group_id,
            name,
            type: type || 'field',
            invite_link: parent.invite_link, // Same invite link as parent
            description: description || null,
            field_tags: field_tags || [],
            is_active: true,
            auto_moderate: true,
            member_count: 0,
            is_forum: false,
            forum_topic_id: forumTopicId,
            parent_group_id,
        })
        .select()
        .single();

    if (insertError) {
        return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ ok: true, topic, forum_topic_id: forumTopicId });
}

/**
 * Send a message to a specific forum topic
 */
async function handleSendToTopic(req: VercelRequest, res: VercelResponse) {
    const { topic_id, message } = req.body;

    if (!topic_id || !message) {
        return res.status(400).json({ error: 'Missing topic_id or message' });
    }

    const { data: topic, error: topicError } = await supabase
        .from('bot_groups')
        .select('telegram_group_id, forum_topic_id, name')
        .eq('id', topic_id)
        .not('forum_topic_id', 'is', null)
        .single();

    if (topicError || !topic) {
        return res.status(404).json({ error: 'Topic not found' });
    }

    const result = await sendTelegramToGroup(
        topic.telegram_group_id,
        message,
        topic.forum_topic_id
    );

    await supabase.from('bot_messages_log').insert({
        bot_user_id: 'admin',
        direction: 'outgoing',
        message_type: 'topic_content',
        content: message.substring(0, 500),
        campaign_id: `topic_${topic_id}`,
    });

    return res.status(200).json({ ok: true, telegram_result: result });
}

/**
 * Close or reopen a forum topic
 */
async function handleToggleTopic(req: VercelRequest, res: VercelResponse, reopen: boolean) {
    const { topic_id } = req.body;

    if (!topic_id) {
        return res.status(400).json({ error: 'Missing topic_id' });
    }

    const { data: topic, error: topicError } = await supabase
        .from('bot_groups')
        .select('telegram_group_id, forum_topic_id')
        .eq('id', topic_id)
        .not('forum_topic_id', 'is', null)
        .single();

    if (topicError || !topic) {
        return res.status(404).json({ error: 'Topic not found' });
    }

    const method = reopen ? 'reopenForumTopic' : 'closeForumTopic';
    const result = await telegramApi(method, {
        chat_id: topic.telegram_group_id,
        message_thread_id: topic.forum_topic_id,
    });

    // Update is_active in DB
    await supabase
        .from('bot_groups')
        .update({ is_active: reopen })
        .eq('id', topic_id);

    return res.status(200).json({ ok: true, telegram_result: result });
}

/**
 * Broadcast a message to multiple forum topics
 */
async function handleBroadcastToTopics(req: VercelRequest, res: VercelResponse) {
    const { message, topic_ids, exclude_topic_ids, topic_type } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Missing message' });
    }

    let query = supabase
        .from('bot_groups')
        .select('id, telegram_group_id, forum_topic_id, name')
        .eq('is_active', true)
        .not('forum_topic_id', 'is', null);

    if (topic_ids && Array.isArray(topic_ids) && topic_ids.length > 0) {
        query = query.in('id', topic_ids);
    }

    if (topic_type) {
        query = query.eq('type', topic_type);
    }

    const { data: topics, error } = await query;

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!topics || topics.length === 0) {
        return res.status(200).json({ ok: true, sent_count: 0, message: 'No active topics found matching criteria' });
    }

    // Filter excludes in memory if needed
    const finalTopics = exclude_topic_ids && Array.isArray(exclude_topic_ids)
        ? topics.filter(t => !exclude_topic_ids.includes(t.id))
        : topics;

    let sentCount = 0;
    const errors: any[] = [];

    for (const topic of finalTopics) {
        try {
            await sendTelegramToGroup(
                topic.telegram_group_id,
                message,
                topic.forum_topic_id
            );
            sentCount++;
            // Small delay to be nice to Telegram API
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err: any) {
            console.error(`Failed to send to topic ${topic.id}:`, err);
            errors.push({ topic_id: topic.id, error: err.message });
        }
    }

    // Log the broadcast
    await supabase.from('bot_messages_log').insert({
        bot_user_id: 'admin',
        direction: 'outgoing',
        message_type: 'broadcast',
        content: message.substring(0, 500),
        campaign_id: `broadcast_${Date.now()}`,
        metadata: {
            sent_count: sentCount,
            target_count: finalTopics.length,
            topic_type
        }
    });

    return res.status(200).json({
        ok: true,
        sent_count: sentCount,
        total_targets: finalTopics.length,
        errors: errors.length > 0 ? errors : undefined
    });
}

