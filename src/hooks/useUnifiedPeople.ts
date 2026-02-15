import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface UnifiedPerson {
  canonical_id: string;
  display_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  telegram_chat_id: string | null;
  telegram_username: string | null;
  bagrut_grades: unknown;
  bagrut_avg_raw: number | null;
  psycho_total: number | null;
  psycho_quant: number | null;
  psycho_eng: number | null;
  sector: string | null;
  lead_score: number | null;
  lead_stage: string | null;
  temperature: string | null;
  journey_stage: string | null;
  gap_analysis: unknown;
  lead_routing_tags: string[] | null;
  web_last_active: string | null;
  bot_last_active: string | null;
  bot_messages: number | null;
  bot_commands: string[] | null;
  rooms_joined: string[] | null;
  tracked_programs: string[] | null;
  consent_marketing: boolean | null;
  first_seen: string | null;
  web_profile_id: string | null;
  bot_user_id: string | null;
  is_linked: boolean | null;
}

export interface UseUnifiedPeopleParams {
  search?: string;
  temperature?: string;
  journeyStage?: string;
  source?: 'web' | 'bot' | 'both' | 'all';
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  limit?: number;
}

export function useUnifiedPeople(params: UseUnifiedPeopleParams = {}) {
  const {
    search,
    temperature,
    journeyStage,
    source = 'all',
    sortBy = 'lead_score',
    sortDir = 'desc',
    limit = 50,
  } = params;

  const [people, setPeople] = useState<UnifiedPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('unified_profiles')
        .select('*', { count: 'exact' });

      // Search filter: ilike on multiple columns
      if (search && search.trim().length > 0) {
        const term = `%${search.trim()}%`;
        query = query.or(
          `display_name.ilike.${term},email.ilike.${term},phone.ilike.${term},telegram_username.ilike.${term}`
        );
      }

      // Temperature filter
      if (temperature) {
        query = query.eq('temperature', temperature);
      }

      // Journey stage filter
      if (journeyStage) {
        query = query.eq('journey_stage', journeyStage);
      }

      // Source filter
      if (source === 'web') {
        query = query.not('web_profile_id', 'is', null).is('bot_user_id', null);
      } else if (source === 'bot') {
        query = query.is('web_profile_id', null).not('bot_user_id', 'is', null);
      } else if (source === 'both') {
        query = query.not('web_profile_id', 'is', null).not('bot_user_id', 'is', null);
      }
      // 'all' — no source filter

      // Sort
      query = query.order(sortBy, { ascending: sortDir === 'asc', nullsFirst: false });

      // Limit
      query = query.limit(limit);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setPeople((data as UnifiedPerson[]) || []);
      setTotal(count ?? 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'שגיאה בטעינת נתונים';
      console.error('useUnifiedPeople error:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, temperature, journeyStage, source, sortBy, sortDir, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { people, loading, error, refresh, total };
}
