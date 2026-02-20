'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore, SKINS, TRAILS } from '@/store/gameStore';

interface ShopProps {
    onBack: () => void;
}

type Tab = 'skins' | 'trails';

export default function Shop({ onBack }: ShopProps) {
    const t = useTranslations('shop');
    const ts = useTranslations('skins');
    const tt = useTranslations('trails');
    const [activeTab, setActiveTab] = useState<Tab>('skins');
    const [toast, setToast] = useState('');

    const {
        voidCoins,
        unlockedSkins,
        unlockedTrails,
        currentSkin,
        currentTrail,
        unlockSkin,
        equipSkin,
        unlockTrail,
        equipTrail,
    } = useGameStore();

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2000);
    };

    const handleSkin = (skinId: string) => {
        if (currentSkin === skinId) return;
        if (unlockedSkins.includes(skinId)) {
            equipSkin(skinId);
        } else {
            const success = unlockSkin(skinId);
            if (!success) showToast(t('insufficientCoins'));
            else equipSkin(skinId);
        }
    };

    const handleTrail = (trailId: string) => {
        if (currentTrail === trailId) return;
        if (unlockedTrails.includes(trailId)) {
            equipTrail(trailId);
        } else {
            const success = unlockTrail(trailId);
            if (!success) showToast(t('insufficientCoins'));
            else equipTrail(trailId);
        }
    };

    return (
        <div className="relative flex flex-col w-full h-full bg-void-black/95 px-5 py-8 overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-void-green/40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-void-green/40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-void-green/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-void-green/40" />

            {/* Toast notification */}
            {toast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded bg-void-red/80 font-orbitron text-white text-[10px] tracking-widest">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    id="btn-shop-back"
                    onClick={onBack}
                    className="w-8 h-8 flex items-center justify-center rounded border border-void-green/30 text-void-green"
                >
                    ←
                </button>
                <h2 className="font-orbitron font-black text-void-green text-xl tracking-widest"
                    style={{ textShadow: '0 0 10px #36E27B' }}>
                    {t('title')}
                </h2>
                {/* Coin balance */}
                <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded border border-void-yellow/30 bg-void-yellow/5">
                    <span className="text-void-yellow text-xs">◆</span>
                    <span className="font-orbitron font-bold text-void-yellow text-xs">
                        {voidCoins.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {(['skins', 'trails'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        id={`btn-tab-${tab}`}
                        onClick={() => setActiveTab(tab)}
                        className={`
              flex-1 py-2 rounded font-orbitron text-[10px] tracking-widest uppercase transition-all
              ${activeTab === tab
                                ? 'bg-void-green text-void-black font-black'
                                : 'border border-void-green/20 text-void-green/40'}
            `}
                    >
                        {tab === 'skins' ? t('skins') : t('trails')}
                    </button>
                ))}
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1">
                {activeTab === 'skins'
                    ? SKINS.map((skin) => {
                        const owned = unlockedSkins.includes(skin.id);
                        const active = currentSkin === skin.id;
                        return (
                            <button
                                key={skin.id}
                                id={`btn-skin-${skin.id}`}
                                onClick={() => handleSkin(skin.id)}
                                className={`
                    relative flex flex-col items-center gap-2 p-4 rounded border transition-all active:scale-95
                    ${active ? 'border-void-green bg-void-green/10' : 'border-void-green/20 bg-void-black/60'}
                  `}
                            >
                                {/* Preview circle */}
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center"
                                    style={{
                                        background: `radial-gradient(circle at 35% 35%, white, ${skin.color} 40%, transparent)`,
                                        boxShadow: `0 0 20px ${skin.glowColor}`,
                                    }}
                                />
                                <span className="font-orbitron text-white/80 text-[9px] tracking-widest text-center">
                                    {ts(skin.nameKey as 'void-agent')}
                                </span>
                                {owned ? (
                                    <span className={`font-orbitron text-[8px] ${active ? 'text-void-green font-black' : 'text-white/40'}`}>
                                        {active ? t('equipped') : t('equip')}
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-0.5">
                                        <span className="text-void-yellow text-[9px]">◆</span>
                                        <span className="font-orbitron text-void-yellow text-[9px] font-bold">
                                            {skin.price}
                                        </span>
                                    </div>
                                )}
                                {!owned && (
                                    <div className="absolute top-2 right-2 text-[10px]">🔒</div>
                                )}
                            </button>
                        );
                    })
                    : TRAILS.map((trail) => {
                        const owned = unlockedTrails.includes(trail.id);
                        const active = currentTrail === trail.id;
                        return (
                            <button
                                key={trail.id}
                                id={`btn-trail-${trail.id}`}
                                onClick={() => handleTrail(trail.id)}
                                className={`
                    relative flex flex-col items-center gap-2 p-4 rounded border transition-all active:scale-95
                    ${active ? 'border-void-green bg-void-green/10' : 'border-void-green/20 bg-void-black/60'}
                  `}
                            >
                                {/* Trail preview */}
                                <div className="w-14 h-4 flex items-center">
                                    {[...Array(7)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="rounded-full mx-0.5 flex-shrink-0"
                                            style={{
                                                width: `${(7 - i) * 2 + 2}px`,
                                                height: `${(7 - i) * 2 + 2}px`,
                                                background: trail.color,
                                                opacity: (i + 1) / 7,
                                                boxShadow: `0 0 4px ${trail.color}`,
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="font-orbitron text-white/80 text-[9px] tracking-widest text-center">
                                    {tt(trail.nameKey as 'default')}
                                </span>
                                {owned ? (
                                    <span className={`font-orbitron text-[8px] ${active ? 'text-void-green font-black' : 'text-white/40'}`}>
                                        {active ? t('equipped') : t('equip')}
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-0.5">
                                        <span className="text-void-yellow text-[9px]">◆</span>
                                        <span className="font-orbitron text-void-yellow text-[9px] font-bold">
                                            {trail.price}
                                        </span>
                                    </div>
                                )}
                                {!owned && (
                                    <div className="absolute top-2 right-2 text-[10px]">🔒</div>
                                )}
                            </button>
                        );
                    })}
            </div>
        </div>
    );
}
