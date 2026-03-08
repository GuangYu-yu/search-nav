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

export interface ThemeType {
  name: string
  label: string
}

export const THEMES: ThemeType[] = [
  { name: 'light', label: '亮色' },
  { name: 'dark', label: '暗色' },
  { name: 'red', label: '姨妈红' },
  { name: 'purple', label: '科技紫' },
  { name: 'gold', label: '尊贵金' }
]

export const SEARCH_MODES: Mode[] = ['search', 'translate', 'resource']