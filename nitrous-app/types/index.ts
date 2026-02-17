// Event types
export interface Event {
  id: string
  title: string
  location: string
  date: string
  time?: string
  isLive: boolean
  category: EventCategory
  thumbnail?: string
}

export type EventCategory = 'motorsport' | 'water' | 'air' | 'offroad'

// Category types
export interface Category {
  id: string
  name: string
  slug: EventCategory
  icon: string
  liveCount: number
  description: string
  color: CategoryColor
}

export type CategoryColor = 'cyan' | 'blue' | 'purple' | 'orange'

// Journey types
export interface Journey {
  id: string
  title: string
  category: string
  description: string
  badge: 'EXCLUSIVE' | 'MEMBERS ONLY' | 'LIMITED'
  slotsLeft: number
  date: string
  price: number
  thumbnail?: string
}

// Merch types
export interface MerchItem {
  id: string
  name: string
  icon: string
  price: number
  category: 'apparel' | 'accessories' | 'collectibles'
}

// Hero nav card types
export interface NavCard {
  id: string
  label: string
  icon: string
  href: string
  color: 'grey' | 'red' | 'cyan' | 'orange' | 'blue' | 'gold'
  progress: number
}
