# G-VOID — Telegram Mini App Game

> **Anti-Gravity Puzzle / Runner** built with Next.js 14, Matter.js, Zustand, Tailwind CSS, and the Telegram Web Apps SDK.
> 
> *"Gravity is a choice. Survival is a skill."*

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** — [Download here](https://nodejs.org/)
- A Telegram Bot (create via [@BotFather](https://t.me/BotFather))

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play in the browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🎮 Game Controls

| Action | Input |
|--------|-------|
| Flip Gravity | Tap / Click anywhere |
| Pause | Tap the ⏸ button |

---

## ⚙️ Configuration

Edit `.env.local`:

```env
NEXT_PUBLIC_BOT_USERNAME=YourBotUsername
NEXT_PUBLIC_ADSGRAM_BLOCK_ID=your-adsgram-block-id
```

---

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout + Telegram SDK init
│   └── page.tsx      # Main game screen orchestrator
├── engine/           # Core game logic (no React)
│   ├── physics.ts    # Matter.js world + gravity flip
│   ├── obstacles.ts  # Obstacle pool, spawn, collision
│   └── levelGenerator.ts  # Infinite scroll + speed
├── components/
│   ├── game/
│   │   ├── GameCanvas.tsx  # RAF loop + canvas draw
│   │   ├── Renderer.ts     # Pure canvas draw calls
│   │   └── PlayerTrail.ts  # Neon trail FX
│   └── ui/
│       ├── HUD.tsx         # In-game overlay
│       ├── MainMenu.tsx    # Home screen
│       ├── GameOver.tsx    # Death screen + ad CTA
│       ├── Leaderboard.tsx # Friends ranking
│       ├── Shop.tsx        # Skins & trails
│       └── Settings.tsx    # Sound/haptic/lang
├── store/
│   └── gameStore.ts  # Zustand persisted state
├── lib/
│   ├── telegram.ts   # Telegram SDK integration
│   └── adsgram.ts    # Rewarded ad integration
└── middleware.ts     # next-intl locale routing
messages/
├── en.json           # English strings
└── tr.json           # Turkish strings
```

---

## 💰 Monetization

- **Adsgram** — players watch a short video ad to "Continue" after death
- **Void Coins** — earned by playing (1 coin per 5 score), referrals (+500 per friend)
- **Skin Shop** — unlock character skins and trails with Void Coins

---

## 📱 Telegram Mini App Setup

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Use `/newapp` to create a Mini App
3. Set the web app URL to your deployed Next.js URL
4. Set `NEXT_PUBLIC_BOT_USERNAME` in `.env.local`

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Physics | Matter.js |
| State | Zustand (persisted) |
| Styling | Tailwind CSS |
| Platform | Telegram Web Apps SDK |
| i18n | next-intl (EN/TR) |
| Ads | Adsgram |
