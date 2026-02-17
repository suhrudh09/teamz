# NITROUS — Next.js Master Guide

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Key Concepts](#key-concepts)
3. [Component Patterns](#component-patterns)
4. [Data Flow](#data-flow)
5. [Styling Strategy](#styling-strategy)
6. [Performance Optimization](#performance-optimization)
7. [Next Steps](#next-steps)

---

## Project Architecture

### Folder Structure Explained

```
nitrous-app/
├── app/                    ← Routes & Server Components
│   ├── layout.tsx         ← Wraps entire app (fonts, metadata)
│   ├── page.tsx           ← Homepage (/)
│   ├── globals.css        ← Global styles
│   └── api/               ← Backend endpoints
├── components/            ← Reusable UI components
│   ├── Nav.tsx           ← Navigation bar
│   └── Nav.module.css    ← Scoped styles for Nav
├── lib/                   ← Utilities & helpers
│   └── data.ts           ← Mock data (events, categories)
├── types/                 ← TypeScript definitions
│   └── index.ts          ← Shared types (Event, Category, etc.)
├── public/                ← Static assets
│   └── hero-car.png      ← Images served as /hero-car.png
└── styles/                ← Additional stylesheets
```

### Why This Structure?

**Colocation Principle:** Keep things close to where they're used.
- `Nav.tsx` + `Nav.module.css` live together
- Types live in `/types` because they're shared across many files
- Data lives in `/lib` because it's utility code

**App Router Benefits:**
- File = route automatically
- Server components by default (faster)
- Layouts persist across navigation (Nav doesn't re-render)

---

## Key Concepts

### 1. Server Components vs Client Components

**Server Components (default in App Router):**
```tsx
// This runs on the SERVER
export default function Nav() {
  return <nav>...</nav>
}
```
- Renders on server first
- No JavaScript sent to browser (smaller bundle)
- Can't use `useState`, `useEffect`, event handlers
- Great for: Static content, data fetching, SEO

**Client Components (opt-in with 'use client'):**
```tsx
'use client'
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```
- Runs in browser
- Can use React hooks, event handlers
- Great for: Interactive UI, animations, forms

**When to use which?**
- Nav → Server (static)
- Hero → Server (mostly static, images)
- EventCard with "Watch Live" button → Client (interactive)
- Category hover effects → Client (CSS animations work, but state-driven animations need client)

**Rule:** Start with Server Component, only add `'use client'` when you need interactivity.

---

### 2. CSS Modules

**What are they?**
```tsx
// Nav.tsx
import styles from './Nav.module.css'
<div className={styles.nav}>
```

```css
/* Nav.module.css */
.nav { background: black; }
```

**What Next.js does:**
- Converts `.nav` → `.Nav_nav__a1b2c3` (unique hash)
- Prevents style conflicts
- Only loads CSS for rendered components (code splitting)

**Why not global CSS?**
- `.nav` in `Nav.module.css` won't clash with `.nav` in `Hero.module.css`
- Easier to delete components (styles go with them)

**When to use global CSS?**
- CSS variables (`:root`)
- Resets (`* { margin: 0 }`)
- Keyframes (`@keyframes bounce`)
- Utility classes (`.container`, `.reveal`)

---

### 3. TypeScript

**What is it?**
JavaScript with types. Catches errors before runtime.

**Without TypeScript:**
```javascript
function getEvent(id) {
  // What is id? String? Number? Who knows.
  // What does this return? Also who knows.
  return events.find(e => e.id === id)
}
```

**With TypeScript:**
```typescript
function getEvent(id: string): Event | undefined {
  // TypeScript KNOWS id is a string
  // TypeScript KNOWS return is Event or undefined
  // You get autocomplete for Event.title, Event.date, etc.
  return events.find(e => e.id === id)
}
```

**Real example from our code:**
```typescript
// types/index.ts
export interface Event {
  id: string
  title: string
  isLive: boolean
}

// lib/data.ts
import type { Event } from '@/types'

export const events: Event[] = [
  { id: '1', title: 'Daytona', isLive: true }
  // TypeScript errors if you forget a field or use wrong type
]
```

**Benefits:**
- Autocomplete in VS Code
- Catches typos (`event.titl` → error)
- Refactoring is safe (rename Event.title → renames everywhere)
- Self-documenting code

---

### 4. Data Fetching Patterns

**Current (Mock Data):**
```typescript
// lib/data.ts
export const events: Event[] = [...]

// app/page.tsx
import { events } from '@/lib/data'
// Use events directly
```

**Next (API Route):**
```typescript
// app/api/events/route.ts
export async function GET() {
  const events = await database.query('SELECT * FROM events')
  return Response.json(events)
}

// app/page.tsx
async function getEvents() {
  const res = await fetch('http://localhost:3000/api/events')
  return res.json()
}

export default async function Home() {
  const events = await getEvents()
  return <div>{events.map(...)}</div>
}
```

**Final (Database):**
```typescript
// lib/db.ts
import { sql } from '@vercel/postgres'

export async function getEvents() {
  const { rows } = await sql`SELECT * FROM events WHERE is_live = true`
  return rows as Event[]
}

// app/page.tsx
import { getEvents } from '@/lib/db'

export default async function Home() {
  const events = await getEvents() // Runs on server
  return <div>{events.map(...)}</div>
}
```

**Progression:**
1. Hardcoded array (now) → Fast to prototype
2. API route (next) → Simulates real backend
3. Database (production) → Real data

---

### 5. Image Optimization

**Bad (plain HTML):**
```html
<img src="/hero-car.png" alt="Car" />
```
- Sends full-size image (2MB)
- No lazy loading
- No format optimization

**Good (Next.js Image):**
```tsx
import Image from 'next/image'

<Image
  src="/hero-car.png"
  alt="Nitrous car"
  fill
  priority
  className="hero-img"
/>
```

**What Next.js does:**
- Converts to WebP/AVIF (smaller)
- Generates multiple sizes (responsive)
- Lazy loads (below fold)
- `priority` flag for above-fold images (loads first)
- `fill` makes it fill parent container

**Result:** 2MB image → 200KB WebP, loads 10x faster

---

## Component Patterns

### Pattern 1: Pure Presentational Component
```tsx
// components/EventCard.tsx
import type { Event } from '@/types'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div>
      <h3>{event.title}</h3>
      <p>{event.location}</p>
    </div>
  )
}
```
- Props in, JSX out
- No state, no side effects
- Easy to test

### Pattern 2: Container Component
```tsx
// app/events/page.tsx
import { getEvents } from '@/lib/data'
import EventCard from '@/components/EventCard'

export default async function EventsPage() {
  const events = await getEvents() // Data fetching
  
  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
```
- Fetches data
- Passes data to presentational components
- Handles layout

### Pattern 3: Interactive Component
```tsx
'use client'
import { useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search events..."
    />
  )
}
```
- Needs 'use client'
- Manages internal state
- Handles user interactions

---

## Styling Strategy

### 1. CSS Variables for Theming
```css
:root {
  --cyan: #00e5ff;
}

.button {
  background: var(--cyan);
}
```
Change `--cyan` once → updates everywhere

### 2. CSS Modules for Components
```tsx
import styles from './Card.module.css'
<div className={styles.card}>
```
Scoped, no conflicts

### 3. Global CSS for Foundations
```css
/* globals.css */
body { background: var(--void); }
@keyframes bounce { ... }
```
Shared across entire app

### 4. Inline Styles for Dynamic Values
```tsx
<div style={{ width: `${progress}%` }} />
```
Only when value changes at runtime

---

## Performance Optimization

### 1. Code Splitting (Automatic)
Next.js splits code by route:
- `/` loads Homepage code
- `/events` loads Events page code
- User only downloads what they visit

### 2. Image Optimization (Next/Image)
- Automatic WebP conversion
- Responsive images
- Lazy loading

### 3. Server Components (Default)
- Less JavaScript to browser
- Faster page loads
- Better SEO

### 4. Streaming (Advanced)
```tsx
import { Suspense } from 'react'

<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>
```
Page loads, slow part streams in later

---

## Next Steps

### Phase 1: Build All Components (Current)
- [x] Nav
- [ ] Hero with animated background
- [ ] Category cards
- [ ] Event list
- [ ] Journey cards
- [ ] Merch grid
- [ ] Footer

### Phase 2: Add Interactivity
- [ ] Search bar (filter events)
- [ ] Category filter (client component)
- [ ] "Watch Live" button (opens modal)
- [ ] Hover animations with Framer Motion

### Phase 3: Real Data
- [ ] Create API routes (`/api/events`)
- [ ] Connect to database (Postgres/Supabase)
- [ ] Implement real-time updates (WebSockets)

### Phase 4: Advanced Features
- [ ] User authentication (Clerk/Auth.js)
- [ ] Payment integration (Stripe for passes)
- [ ] Admin dashboard (manage events)
- [ ] Analytics (track views)

---

## Common Next.js Patterns

### Dynamic Routes
```
app/events/[id]/page.tsx → /events/123
```
```tsx
export default function EventPage({ params }: { params: { id: string } }) {
  const event = getEvent(params.id)
  return <div>{event.title}</div>
}
```

### Layouts (Nested)
```
app/layout.tsx         ← Wraps everything
app/events/layout.tsx  ← Only wraps /events/*
```

### API Routes
```typescript
// app/api/events/route.ts
export async function GET() {
  return Response.json({ events })
}

export async function POST(request: Request) {
  const body = await request.json()
  // Create event
  return Response.json({ success: true })
}
```

### Metadata for SEO
```tsx
export const metadata = {
  title: 'Events - Nitrous',
  description: 'Browse all racing events',
}
```

---

## Debugging Tips

### 1. Check Terminal
Next.js shows errors in terminal where you ran `npm run dev`

### 2. Check Browser Console
Runtime errors appear in DevTools console (F12)

### 3. TypeScript Errors
Hover over red squiggles in VS Code to see error

### 4. Hot Reload Not Working?
- Save the file (Cmd+S / Ctrl+S)
- Check terminal for errors
- Restart dev server if stuck

---

## Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs
- **CSS Modules:** https://github.com/css-modules/css-modules

---

**You now understand:**
✓ Next.js project structure
✓ Server vs Client Components
✓ TypeScript basics
✓ CSS Modules
✓ Component patterns
✓ Data fetching strategies

**Next:** Build the Hero component with animations!
