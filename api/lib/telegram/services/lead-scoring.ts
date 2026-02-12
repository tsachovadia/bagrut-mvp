import type { BotUser, LeadAction, LeadStage } from '../types.js';
import { updateBotUser } from '../middleware.js';

const SCORE_WEIGHTS: Record<LeadAction, number> = {
    started_bot: 5,
    selected_sector: 5,
    linked_account: 20,
    visited_web_app: 10,
    tracked_program: 10,
    deep_link_from_program: 10,
    joined_room: 15,
    used_referral: 10,
    daily_active: 2,
};

function determineStage(score: number): LeadStage {
    if (score >= 60) return 'high_intent';
    if (score >= 40) return 'simulated';
    if (score >= 20) return 'grade_entered';
    if (score >= 10) return 'engaged';
    return 'new';
}

export async function updateLeadScore(user: BotUser, action: LeadAction): Promise<{ newScore: number; newStage: LeadStage; stageChanged: boolean }> {
    const increase = SCORE_WEIGHTS[action] || 0;
    const newScore = Math.min(100, user.lead_score + increase);
    const newStage = determineStage(newScore);
    const stageChanged = newStage !== user.lead_stage;

    // Track command if not already tracked
    const commandsUsed = [...new Set([...user.commands_used, action])];

    await updateBotUser(user.id, {
        lead_score: newScore,
        lead_stage: newStage,
        commands_used: commandsUsed,
    } as Partial<BotUser>);

    return { newScore, newStage, stageChanged };
}
