export interface LinkItem {
  name: string
  url: string
  faviconUrl: string
}

export interface ResourceItem {
  name: string
  url: string
  faviconUrl: string
}

export interface SuggestionItem {
  text: string
  source: string
}

export interface GridLayout {
  columns: number
  rows: number
}

export interface FaviconCache {
  faviconUrl: string
  timestamp: number
}

export type Mode = 'search' | 'translate' | 'resource'

export interface SearchEngines {
  [key: string]: string
}

export interface SuggestionAPI {
  url: string
  params: Record<string, string>
}