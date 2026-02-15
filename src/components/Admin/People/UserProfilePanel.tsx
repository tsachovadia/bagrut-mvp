import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Globe,
  Bot,
  Link2,
  ArrowDownLeft,
  ArrowUpRight,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { UnifiedPerson } from '@/hooks/useUnifiedPeople';

// ── Types ──────────────────────────────────────────────────

interface UserProfilePanelProps {
  userId: string | null;
  onClose: () => void;
}

interface BotMessage {
  id: string;
  bot_user_id: string;
  direction: 'incoming' | 'outgoing';
  message_type: string | null;
  content: string | null;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────

const JOURNEY_MAP: Record<string, string> = {
  anonymous: 'אנונימי',
  explorer: 'חוקר',
  comparator: 'משווה',
  decider: 'מחליט',
};

const TEMP_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  hot: { bg: 'bg-red-900/40 border-red-800', text: 'text-red-400', label: 'חם' },
  warm: { bg: 'bg-yellow-900/40 border-yellow-800', text: 'text-yellow-400', label: 'חמים' },
  cold: { bg: 'bg-blue-900/40 border-blue-800', text: 'text-blue-400', label: 'קר' },
};

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שע׳`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `לפני ${days} ימים`;
  return `לפני ${Math.floor(days / 30)} חודשים`;
}

// Tag color palette (deterministic from string)
const TAG_COLORS = [
  'bg-blue-900/40 text-blue-400 border-blue-800',
  'bg-green-900/40 text-green-400 border-green-800',
  'bg-purple-900/40 text-purple-400 border-purple-800',
  'bg-orange-900/40 text-orange-400 border-orange-800',
  'bg-pink-900/40 text-pink-400 border-pink-800',
  'bg-teal-900/40 text-teal-400 border-teal-800',
];

function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) - hash) + tag.charCodeAt(i);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

// ── Component ──────────────────────────────────────────────

export const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ userId, onClose }) => {
  const [profile, setProfile] = useState<UnifiedPerson | null>(null);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Fetch profile when userId changes
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setMessages([]);
      return;
    }

    setLoading(true);
    supabase
      .from('unified_profiles')
      .select('*')
      .eq('canonical_id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else {
          setProfile(data as UnifiedPerson);
        }
        setLoading(false);
      });
  }, [userId]);

  // Fetch bot messages when profile loads and has a bot_user_id
  useEffect(() => {
    if (!profile?.bot_user_id) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    supabase
      .from('bot_messages_log')
      .select('id, bot_user_id, direction, message_type, content, created_at')
      .eq('bot_user_id', profile.bot_user_id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching messages:', error);
          setMessages([]);
        } else {
          setMessages((data as BotMessage[]) || []);
        }
        setMessagesLoading(false);
      });
  }, [profile?.bot_user_id]);

  // Score color
  const scoreColor = (score: number) => {
    if (score >= 60) return 'text-orange-400';
    if (score >= 30) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <AnimatePresence>
      {userId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[400px] bg-gray-900 border-r border-gray-700 z-50 flex flex-col shadow-2xl"
            dir="rtl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 left-3 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            ) : !profile ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                לא נמצא פרופיל
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* ── Summary Card ───────────────────── */}
                <div className="p-4 border-b border-gray-800 space-y-4">
                  {/* Name + source */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-200 text-sm font-bold flex-shrink-0">
                      {profile.display_name?.[0] || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-bold text-gray-100 truncate">
                        {profile.display_name || 'ללא שם'}
                        {profile.last_name ? ` ${profile.last_name}` : ''}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        {profile.web_profile_id && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-900/30 border border-blue-800 px-1.5 py-0.5 rounded">
                            <Globe className="w-3 h-3" /> אתר
                          </span>
                        )}
                        {profile.bot_user_id && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-900/30 border border-green-800 px-1.5 py-0.5 rounded">
                            <Bot className="w-3 h-3" /> בוט
                          </span>
                        )}
                        {profile.is_linked && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-purple-400 bg-purple-900/30 border border-purple-800 px-1.5 py-0.5 rounded">
                            <Link2 className="w-3 h-3" /> מקושר
                          </span>
                        )}
                      </div>
                      {profile.email && (
                        <div className="text-[10px] text-gray-500 mt-1 truncate">{profile.email}</div>
                      )}
                      {profile.phone && (
                        <div className="text-[10px] text-gray-500 font-mono">{profile.phone}</div>
                      )}
                      {profile.telegram_username && (
                        <div className="text-[10px] text-gray-500">@{profile.telegram_username}</div>
                      )}
                    </div>
                  </div>

                  {/* Score + temperature + journey */}
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className={`text-2xl font-black ${scoreColor(profile.lead_score ?? 0)}`}>
                        {profile.lead_score ?? 0}
                      </div>
                      <div className="text-[9px] text-gray-500 font-medium">ניקוד</div>
                    </div>

                    <div className="h-8 w-px bg-gray-800" />

                    {profile.temperature && TEMP_STYLES[profile.temperature] && (
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${TEMP_STYLES[profile.temperature].bg} ${TEMP_STYLES[profile.temperature].text}`}>
                        {TEMP_STYLES[profile.temperature].label}
                      </span>
                    )}

                    {profile.journey_stage && (
                      <span className="inline-flex px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-medium border border-gray-700">
                        {JOURNEY_MAP[profile.journey_stage] || profile.journey_stage}
                      </span>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-800/60 rounded-lg p-2.5 border border-gray-700/50">
                      <div className="text-[9px] text-gray-500 font-medium mb-0.5">ממוצע בגרות</div>
                      <div className="text-sm font-bold text-gray-200">
                        {profile.bagrut_avg_raw != null ? Number(profile.bagrut_avg_raw).toFixed(1) : '-'}
                      </div>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-2.5 border border-gray-700/50">
                      <div className="text-[9px] text-gray-500 font-medium mb-0.5">פסיכומטרי</div>
                      <div className="text-sm font-bold text-gray-200">
                        {profile.psycho_total ?? '-'}
                      </div>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-2.5 border border-gray-700/50">
                      <div className="text-[9px] text-gray-500 font-medium mb-0.5">מעקב תוכניות</div>
                      <div className="text-sm font-bold text-gray-200">
                        {profile.tracked_programs?.length ?? 0}
                      </div>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-2.5 border border-gray-700/50">
                      <div className="text-[9px] text-gray-500 font-medium mb-0.5">הודעות בוט</div>
                      <div className="text-sm font-bold text-gray-200">
                        {profile.bot_messages ?? 0}
                      </div>
                    </div>
                  </div>

                  {/* Routing tags */}
                  {profile.lead_routing_tags && profile.lead_routing_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.lead_routing_tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${tagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Activity Timeline ──────────────── */}
                <div className="p-4">
                  <h3 className="text-xs font-bold text-gray-300 mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                    פעילות בוט
                  </h3>

                  {messagesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 text-xs">
                      אין הודעות בוט
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
                        >
                          {/* Direction icon */}
                          <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center ${
                            msg.direction === 'incoming'
                              ? 'bg-blue-900/40 text-blue-400'
                              : 'bg-green-900/40 text-green-400'
                          }`}>
                            {msg.direction === 'incoming' ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {msg.message_type && (
                                <span className="text-[9px] font-medium text-gray-500 bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded">
                                  {msg.message_type}
                                </span>
                              )}
                              <span className="text-[9px] text-gray-600">
                                {relativeTime(msg.created_at)}
                              </span>
                            </div>
                            {msg.content && (
                              <p className="text-[11px] text-gray-400 mt-0.5 truncate leading-relaxed">
                                {msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
