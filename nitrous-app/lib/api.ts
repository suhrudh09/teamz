import type { Event, Category, Journey, MerchItem } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'API request failed')
    }
    
    return res.json()
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

// Events API
export async function getEvents(category?: string): Promise<Event[]> {
  const query = category ? `?category=${category}` : ''
  const data = await fetchAPI<{ events: Event[]; count: number }>(`/events${query}`)
  return data.events
}

export async function getLiveEvents(): Promise<Event[]> {
  const data = await fetchAPI<{ events: Event[]; count: number }>('/events/live')
  return data.events
}

export async function getEventById(id: string): Promise<Event> {
  return fetchAPI<Event>(`/events/${id}`)
}

// Categories API
export async function getCategories(): Promise<Category[]> {
  const data = await fetchAPI<{ categories: Category[]; count: number }>('/categories')
  return data.categories
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return fetchAPI<Category>(`/categories/${slug}`)
}

// Journeys API
export async function getJourneys(): Promise<Journey[]> {
  const data = await fetchAPI<{ journeys: Journey[]; count: number }>('/journeys')
  return data.journeys
}

export async function getJourneyById(id: string): Promise<Journey> {
  return fetchAPI<Journey>(`/journeys/${id}`)
}

export async function bookJourney(id: string, token: string): Promise<{ message: string; journey: Journey }> {
  return fetchAPI<{ message: string; journey: Journey }>(`/journeys/${id}/book`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// Merch API
export async function getMerchItems(): Promise<MerchItem[]> {
  const data = await fetchAPI<{ items: MerchItem[]; count: number }>('/merch')
  return data.items
}

export async function getMerchItemById(id: string): Promise<MerchItem> {
  return fetchAPI<MerchItem>(`/merch/${id}`)
}

// Auth API
export async function register(email: string, password: string, name: string) {
  return fetchAPI<{ user: any; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
}

export async function login(email: string, password: string) {
  return fetchAPI<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getCurrentUser(token: string) {
  return fetchAPI<any>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
