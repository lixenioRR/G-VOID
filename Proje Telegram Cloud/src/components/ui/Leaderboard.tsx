'use client';

import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/gameStore';

interface LeaderboardProps {
    onBack: () => void;
}

// Mock weekly leaderboard data (replace with real API)
const MOCK_ENTRIES = [
    { id: '1', name: 'VOID_MASTER', score: 842, avatar: '🟢' },
    { id: '2', name: 'NEON_RUNNER', score: 734, avatar: '🔵' },
    { id: '3', name: 'SHADOW_X', score: 691, avatar: '🟣' },
    { id: '4', name: 'CYBER_ACE', score: 555, avatar: '🔴' },
    { id: '5', name: 'GHOST_RUN', score: 488, avatar: '🟡' },
];

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const RANK_LABELS = ['1ST', '2ND', '3RD'];

export default function Leaderboard({ onBack }: LeaderboardProps) {
    const t = useTranslations('leaderboard');
    const { highScore } = useGameStore();

    const entries = MOCK_ENTRIES;

    return (
        <div className="relative flex flex-col w-full h-full bg-void-black/95 px-5 py-8 overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-void-green/40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-void-green/40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-void-green/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-void-green/40" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    id="btn-leaderboard-back"
                    onClick={onBack}
                    className="w-8 h-8 flex items-center justify-center rounded border border-void-green/30 text-void-green"
                >
                    ←
                </button>
                <h2 className="font-orbitron font-black text-void-green text-xl tracking-widest"
                    style={{ textShadow: '0 0 10px #36E27B' }}>
                    {t('title')}
                </h2>
                <span className="ml-auto font-orbitron text-void-green/40 text-[9px] tracking-widest">
                    {t('weekly')}
                </span>
            </div>

            {/* Top 3 podium */}
            <div className="flex justify-center items-end gap-3 mb-6">
                {entries.slice(0, 3).map((entry: typeof MOCK_ENTRIES[0], idx: number) => {
                    const rankColor = RANK_COLORS[idx] ?? '#36E27B';
                    const heights = ['h-20', 'h-16', 'h-12'];
                    return (
                        <div
                            key={entry.id}
                            className={`flex flex-col items-center gap-1 flex-1 ${idx === 0 ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}
                        >
                            <span className="text-xl">{entry.avatar}</span>
                            <span className="font-orbitron text-white/80 text-[9px] truncate max-w-[60px]">
                                {entry.name}
                            </span>
                            <div
                                className={`w-full ${heights[idx]} rounded-t flex items-center justify-center`}
                                style={{ background: `${rankColor}22`, border: `1px solid ${rankColor}55` }}
                            >
                                <span className="font-orbitron font-black text-sm" style={{ color: rankColor }}>
                                    {RANK_LABELS[idx]}
                                </span>
                            </div>
                            <span className="font-orbitron text-[10px]" style={{ color: rankColor }}>
                                {entry.score}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Rest of list */}
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
                {entries.slice(3).map((entry: typeof MOCK_ENTRIES[0], idx: number) => (
                    <div
                        key={entry.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded border border-void-green/10 bg-void-black/60"
                    >
                        <span className="font-orbitron text-void-green/40 text-[10px] w-6">#{idx + 4}</span>
                        <span className="text-base">{entry.avatar}</span>
                        <span className="font-orbitron text-white/70 text-[11px] flex-1 truncate">
                            {entry.name}
                        </span>
                        <span className="font-orbitron text-void-green font-bold text-sm">{entry.score}</span>
                    </div>
                ))}
            </div>

            {/* Your score */}
            {highScore > 0 && (
                <div className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded border border-void-green/30 bg-void-green/5">
                    <span className="font-orbitron text-void-green/60 text-[9px]">YOU</span>
                    <span className="font-orbitron text-white/80 text-[11px] flex-1">VOID AGENT</span>
                    <span className="font-orbitron text-void-green font-black text-sm">{highScore}</span>
                </div>
            )}
        </div>
    );
}
