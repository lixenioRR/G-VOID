import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    type Mission,
    selectDailyMissions,
    shouldResetMissions,
    incrementMission,
    updateMissionProgress,
    getTodayNumber,
    type MissionId,
} from '@/lib/dailyMissions';
import type { SpeedTier } from '@/engine/levelGenerator';

export interface SkinDefinition {
    id: string;
    nameKey: string;
    color: string;
    glowColor: string;
    price: number;
}

export interface TrailDefinition {
    id: string;
    nameKey: string;
    color: string;
    price: number;
}

export const SKINS: SkinDefinition[] = [
    { id: 'void-agent', nameKey: 'void-agent', color: '#36E27B', glowColor: '#1aff6e', price: 0 },
    { id: 'neon-plasma', nameKey: 'neon-plasma', color: '#00D4FF', glowColor: '#00aacc', price: 500 },
    { id: 'shadow-pulse', nameKey: 'shadow-pulse', color: '#9B59B6', glowColor: '#7d3f9e', price: 1000 },
    { id: 'crimson-core', nameKey: 'crimson-core', color: '#FF3A5C', glowColor: '#cc1a3c', price: 1500 },
    { id: 'aurora', nameKey: 'aurora', color: '#FFD700', glowColor: '#d4a800', price: 2500 },
];

export const TRAILS: TrailDefinition[] = [
    { id: 'default', nameKey: 'default', color: '#36E27B', price: 0 },
    { id: 'electric-purple', nameKey: 'electric-purple', color: '#C77DFF', price: 500 },
    { id: 'plasma-blue', nameKey: 'plasma-blue', color: '#00D4FF', price: 750 },
    { id: 'inferno', nameKey: 'inferno', color: '#FF6B00', price: 1200 },
    { id: 'galaxy', nameKey: 'galaxy', color: '#FF3A5C', price: 2000 },
];

export interface GVoidUser {
    uid: string;
    name: string;
    email: string | null;
    photoURL: string | null;
    referralCode?: string;
    referralCount?: number;
}

interface GameState {
    // Game state
    score: number;
    highScore: number;
    isPlaying: boolean;
    isDead: boolean;
    isPaused: boolean;
    hasUsedContinue: boolean;
    speedTier: SpeedTier;
    sessionPlayCount: number; // resets each app open, for missions

    // Auth
    user: GVoidUser | null;

    // Economy
    voidCoins: number;
    totalCoinsEarned: number;

    // Cosmetics
    unlockedSkins: string[];
    unlockedTrails: string[];
    currentSkin: string;
    currentTrail: string;

    // Social
    referralCount: number;

    // Daily missions
    dailyMissions: Mission[];
    lastMissionReset: number; // day number (floor(Date.now()/86400000))

    // Settings
    soundEnabled: boolean;
    hapticEnabled: boolean;
    language: 'en' | 'tr';

    // Actions: game flow
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    setScore: (score: number) => void;
    setSpeedTier: (tier: SpeedTier) => void;
    triggerDeath: () => void;
    useContinue: () => void;
    resetGame: () => void;

    // Actions: auth
    setUser: (user: GVoidUser | null, firstLoginBonus?: boolean) => void;
    clearUser: () => void;

    // Actions: economy
    addCoins: (n: number) => void;
    spendCoins: (n: number) => boolean;
    addReferralBonus: () => void;

    // Actions: cosmetics
    unlockSkin: (id: string) => boolean;
    equipSkin: (id: string) => void;
    unlockTrail: (id: string) => boolean;
    equipTrail: (id: string) => void;

    // Actions: daily missions
    checkAndResetMissions: () => void;
    progressMission: (id: MissionId, delta?: number) => void;
    setMissionProgress: (id: MissionId, value: number) => void;
    claimMissionReward: (id: MissionId) => number; // returns coins awarded

    // Actions: settings
    toggleSound: () => void;
    toggleHaptic: () => void;
    setLanguage: (lang: 'en' | 'tr') => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            // Initial state
            score: 0,
            highScore: 0,
            isPlaying: false,
            isDead: false,
            isPaused: false,
            hasUsedContinue: false,
            speedTier: 0,
            sessionPlayCount: 0,
            user: null,
            voidCoins: 0,
            totalCoinsEarned: 0,
            unlockedSkins: ['void-agent'],
            unlockedTrails: ['default'],
            currentSkin: 'void-agent',
            currentTrail: 'default',
            referralCount: 0,
            dailyMissions: selectDailyMissions(getTodayNumber()),
            lastMissionReset: getTodayNumber(),
            soundEnabled: true,
            hapticEnabled: true,
            language: 'en',

            // Game flow
            startGame: () =>
                set((s) => ({
                    isPlaying: true,
                    isDead: false,
                    isPaused: false,
                    score: 0,
                    hasUsedContinue: false,
                    speedTier: 0,
                    sessionPlayCount: s.sessionPlayCount + 1,
                })),

            pauseGame: () => set({ isPaused: true }),
            resumeGame: () => set({ isPaused: false }),

            setScore: (score) =>
                set((s) => {
                    const updated: Partial<GameState> = {
                        score,
                        highScore: Math.max(s.highScore, score),
                    };
                    return updated;
                }),

            setSpeedTier: (tier) => set({ speedTier: tier }),

            triggerDeath: () =>
                set((s) => ({
                    isDead: true,
                    isPlaying: false,
                    highScore: Math.max(s.highScore, s.score),
                })),

            useContinue: () =>
                set({ isDead: false, isPlaying: true, hasUsedContinue: true }),

            resetGame: () =>
                set({ score: 0, isPlaying: false, isDead: false, isPaused: false, hasUsedContinue: false, speedTier: 0 }),

            // Auth
            setUser: (user, firstLoginBonus = false) =>
                set((s) => ({
                    user,
                    voidCoins: firstLoginBonus ? s.voidCoins + 200 : s.voidCoins,
                    totalCoinsEarned: firstLoginBonus ? s.totalCoinsEarned + 200 : s.totalCoinsEarned,
                })),

            clearUser: () => set({ user: null }),

            // Economy
            addCoins: (n) =>
                set((s) => ({ voidCoins: s.voidCoins + n, totalCoinsEarned: s.totalCoinsEarned + n })),

            spendCoins: (n) => {
                const { voidCoins } = get();
                if (voidCoins < n) return false;
                set({ voidCoins: voidCoins - n });
                return true;
            },

            addReferralBonus: () =>
                set((s) => ({
                    voidCoins: s.voidCoins + 500,
                    totalCoinsEarned: s.totalCoinsEarned + 500,
                    referralCount: s.referralCount + 1,
                })),

            // Cosmetics
            unlockSkin: (id) => {
                const skin = SKINS.find((s) => s.id === id);
                if (!skin) return false;
                const success = get().spendCoins(skin.price);
                if (success) set((s) => ({ unlockedSkins: [...s.unlockedSkins, id] }));
                return success;
            },

            equipSkin: (id) => set({ currentSkin: id }),

            unlockTrail: (id) => {
                const trail = TRAILS.find((t) => t.id === id);
                if (!trail) return false;
                const success = get().spendCoins(trail.price);
                if (success) set((s) => ({ unlockedTrails: [...s.unlockedTrails, id] }));
                return success;
            },

            equipTrail: (id) => set({ currentTrail: id }),

            // Daily missions
            checkAndResetMissions: () => {
                const { lastMissionReset } = get();
                if (shouldResetMissions(lastMissionReset)) {
                    const day = getTodayNumber();
                    set({ dailyMissions: selectDailyMissions(day), lastMissionReset: day });
                }
            },

            progressMission: (id, delta = 1) =>
                set((s) => ({
                    dailyMissions: incrementMission(s.dailyMissions, id, delta),
                })),

            setMissionProgress: (id, value) =>
                set((s) => ({
                    dailyMissions: updateMissionProgress(s.dailyMissions, id, value),
                })),

            claimMissionReward: (id) => {
                const mission = get().dailyMissions.find((m) => m.id === id);
                if (!mission || !mission.completed || mission.claimed) return 0;
                const reward = mission.reward;
                set((s) => ({
                    dailyMissions: s.dailyMissions.map((m) =>
                        m.id === id ? { ...m, claimed: true } : m
                    ),
                    voidCoins: s.voidCoins + reward,
                    totalCoinsEarned: s.totalCoinsEarned + reward,
                }));
                return reward;
            },

            // Settings
            toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
            toggleHaptic: () => set((s) => ({ hapticEnabled: !s.hapticEnabled })),
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'g-void-store',
            partialize: (state) => ({
                highScore: state.highScore,
                voidCoins: state.voidCoins,
                totalCoinsEarned: state.totalCoinsEarned,
                unlockedSkins: state.unlockedSkins,
                unlockedTrails: state.unlockedTrails,
                currentSkin: state.currentSkin,
                currentTrail: state.currentTrail,
                referralCount: state.referralCount,
                soundEnabled: state.soundEnabled,
                hapticEnabled: state.hapticEnabled,
                language: state.language,
                dailyMissions: state.dailyMissions,
                lastMissionReset: state.lastMissionReset,
                user: state.user,
            }),
        }
    )
);
