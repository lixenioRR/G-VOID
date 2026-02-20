'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/gameStore';
import type { MissionId } from '@/lib/dailyMissions';

interface DailyMissionsProps {
    onClose: () => void;
}

export default function DailyMissions({ onClose }: DailyMissionsProps) {
    const t = useTranslations('missions');
    const { dailyMissions, claimMissionReward, checkAndResetMissions } = useGameStore();
    const [claimedId, setClaimedId] = useState<string | null>(null);
    const [claimedAmount, setClaimedAmount] = useState(0);

    // Check for day reset on open
    useState(() => { checkAndResetMissions(); });

    const handleClaim = (id: string) => {
        const amount = claimMissionReward(id as MissionId);
        if (amount > 0) {
            setClaimedId(id);
            setClaimedAmount(amount);
            setTimeout(() => setClaimedId(null), 1800);
        }
    };

    const completedCount = dailyMissions.filter((m) => m.completed).length;
    const allClaimed = dailyMissions.every((m) => m.claimed);

    // Map mission id → translation key suffix
    const missionTitle = (id: string) => t(`m_${id}` as never);
    const missionDesc  = (id: string) => t(`m_${id}_desc` as never);

    return (
        <div className="absolute inset-0 z-40 flex flex-col bg-void-black overflow-hidden select-none">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-void-green/20">
                <div>
                    <h2 className="font-orbitron font-black text-void-green text-lg tracking-widest">{t('title')}</h2>
                    <p className="font-inter text-void-green/40 text-[10px] mt-0.5">
                        {t('subtitle')} · {completedCount}{t('of')}{dailyMissions.length} {t('completed')}
                    </p>
                </div>
                <button onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded border border-void-green/20 text-void-green/60 text-lg active:scale-90 transition-transform">
                    ×
                </button>
            </div>

            {/* Overall progress bar */}
            <div className="px-5 py-3 border-b border-void-green/10">
                <div className="w-full h-1.5 bg-void-green/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${(completedCount / dailyMissions.length) * 100}%`,
                            background: 'linear-gradient(90deg, #36E27B, #00D4FF)',
                        }} />
                </div>
            </div>

            {/* Missions list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {dailyMissions.map((mission) => {
                    const progressPct = (mission.progress / mission.target) * 100;
                    const isClaiming  = claimedId === mission.id;

                    return (
                        <div key={mission.id} className="rounded border p-4 relative overflow-hidden"
                            style={{
                                borderColor: mission.claimed ? 'rgba(54,226,123,0.15)' : mission.completed ? 'rgba(54,226,123,0.6)' : 'rgba(54,226,123,0.2)',
                                background:  mission.claimed ? 'rgba(54,226,123,0.03)' : mission.completed ? 'rgba(54,226,123,0.08)' : 'rgba(5,5,5,0.8)',
                            }}>
                            {mission.claimed && (
                                <div className="absolute inset-0 flex items-center justify-center bg-void-black/50">
                                    <span className="font-orbitron text-void-green/40 text-xs tracking-widest">{t('done')}</span>
                                </div>
                            )}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <p className="font-orbitron font-bold text-white text-sm leading-tight">
                                        {missionTitle(mission.id)}
                                    </p>
                                    <p className="font-inter text-white/40 text-[10px] mt-0.5">
                                        {missionDesc(mission.id)}
                                    </p>
                                    {!mission.claimed && (
                                        <div className="mt-2">
                                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${Math.min(100, progressPct)}%`,
                                                        background: mission.completed ? '#36E27B' : 'rgba(54,226,123,0.5)',
                                                    }} />
                                            </div>
                                            <p className="font-inter text-white/30 text-[9px] mt-1">
                                                {mission.progress} / {mission.target}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <div className="flex items-center gap-1">
                                        <span className="text-void-yellow text-xs">◆</span>
                                        <span className="font-orbitron font-bold text-void-yellow text-sm">+{mission.reward}</span>
                                    </div>
                                    {mission.completed && !mission.claimed && (
                                        <button onClick={() => handleClaim(mission.id)}
                                            className="px-3 py-1.5 rounded font-orbitron font-black text-void-black text-[9px] tracking-widest active:scale-95 transition-transform uppercase"
                                            style={{ background: '#36E27B', boxShadow: '0 0 10px #36E27B' }}>
                                            {t('claim')}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {isClaiming && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                    style={{ background: 'rgba(54,226,123,0.15)' }}>
                                    <span className="font-orbitron font-black text-void-green text-xl"
                                        style={{ textShadow: '0 0 20px #36E27B' }}>
                                        +{claimedAmount} ◆
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {allClaimed && (
                    <div className="text-center py-8">
                        <p className="font-orbitron text-void-green/60 text-sm">{t('allComplete')}</p>
                        <p className="font-inter text-void-green/30 text-xs mt-1">{t('allCompleteNote')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
