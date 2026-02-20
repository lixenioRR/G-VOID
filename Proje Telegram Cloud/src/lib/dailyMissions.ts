// src/lib/dailyMissions.ts
// Daily missions system — 3 missions chosen per day, reset at midnight

export type MissionId =
    | 'play_today'
    | 'score_50'
    | 'score_100'
    | 'reach_hyper'
    | 'play_3_times'
    | 'beat_record'
    | 'score_25';

export interface Mission {
    id: MissionId;
    title: string;
    description: string;
    reward: number;       // coins
    target: number;       // goal value
    progress: number;     // current progress
    completed: boolean;
    claimed: boolean;
}

/** All available missions — each day 3 are selected */
export const MISSION_POOL: Omit<Mission, 'progress' | 'completed' | 'claimed'>[] = [
    {
        id: 'play_today',
        title: '🎮 Bugün Oyna',
        description: 'Bir oyun oyna',
        reward: 50,
        target: 1,
    },
    {
        id: 'score_25',
        title: '⚡ Hızlı Başlangıç',
        description: '25 puana ulaş',
        reward: 75,
        target: 25,
    },
    {
        id: 'score_50',
        title: '🎯 50 Puan Şampiyonu',
        description: '50 puana ulaş',
        reward: 150,
        target: 50,
    },
    {
        id: 'score_100',
        title: '💯 100 Puan Ustası',
        description: '100 puana ulaş',
        reward: 300,
        target: 100,
    },
    {
        id: 'reach_hyper',
        title: '🔥 HYPER Modu',
        description: 'HYPER hızına ulaş (50 puan)',
        reward: 200,
        target: 1,
    },
    {
        id: 'play_3_times',
        title: '🔄 Israr Et',
        description: '3 kez oyna',
        reward: 100,
        target: 3,
    },
    {
        id: 'beat_record',
        title: '🏆 Rekoru Kır',
        description: 'Kendi rekorunu geç',
        reward: 400,
        target: 1,
    },
];

/**
 * Select 3 missions for today.
 * Same 3 missions for the whole day (seed = day number).
 */
export function selectDailyMissions(dayNumber: number): Mission[] {
    // Seeded pseudo-random selection (deterministic per day)
    const seed = dayNumber * 1234567;
    const indices: number[] = [];
    let s = seed;

    while (indices.length < 3) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        const idx = s % MISSION_POOL.length;
        if (!indices.includes(idx)) {
            indices.push(idx);
        }
    }

    return indices.map((i) => ({
        ...MISSION_POOL[i],
        progress: 0,
        completed: false,
        claimed: false,
    }));
}

/** Returns today's day number (UTC, resets at midnight) */
export function getTodayNumber(): number {
    return Math.floor(Date.now() / 86_400_000);
}

/** Whether missions need to be reset (new day) */
export function shouldResetMissions(lastReset: number): boolean {
    return getTodayNumber() > lastReset;
}

/** Update mission progress and mark complete if target reached */
export function updateMissionProgress(
    missions: Mission[],
    id: MissionId,
    progress: number
): Mission[] {
    return missions.map((m) => {
        if (m.id !== id || m.claimed) return m;
        const newProgress = Math.min(m.target, progress);
        return {
            ...m,
            progress: newProgress,
            completed: newProgress >= m.target,
        };
    });
}

/** Increment a mission's progress by delta */
export function incrementMission(
    missions: Mission[],
    id: MissionId,
    delta = 1
): Mission[] {
    return missions.map((m) => {
        if (m.id !== id || m.claimed || m.completed) return m;
        const newProgress = Math.min(m.target, m.progress + delta);
        return {
            ...m,
            progress: newProgress,
            completed: newProgress >= m.target,
        };
    });
}
