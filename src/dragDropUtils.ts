/** 查找拖拽目标位置（书签/引擎通用，通过 itemSelector 区分） */
export function findDropTarget(
  cx: number, cy: number, container: HTMLElement, 
  itemSelector: string
): { item: HTMLElement; position: 'before' | 'over' | 'after' } | null {
  const source = container.querySelector<HTMLElement>(".drag-source, .dragging")
  const allItems = [...container.querySelectorAll<HTMLElement>(itemSelector)]

  const visBounds = document.querySelector(".modal-content")?.getBoundingClientRect()
  if (visBounds && (cx < visBounds.left || cx > visBounds.right || cy < visBounds.top || cy > visBounds.bottom)) {
    return null
  }

  const elBelow = document.elementFromPoint(cx, cy)
  const directItem = elBelow?.closest<HTMLElement>(itemSelector)
  if (directItem && directItem !== source) {
    const rect = directItem.getBoundingClientRect()
    const relX = (cx - rect.left) / rect.width
    if (relX < 0.25) return { item: directItem, position: 'before' }
    if (relX > 0.75) return { item: directItem, position: 'after' }
    return { item: directItem, position: 'over' }
  }

  let nearest: { item: HTMLElement; position: 'before' | 'after'; dist: number } | null = null
  for (const item of allItems) {
    if (item === source) continue
    const rect = item.getBoundingClientRect()
    const dx = cx < rect.left ? rect.left - cx : cx > rect.right ? cx - rect.right : 0
    const dy = cy < rect.top ? rect.top - cy : cy > rect.bottom ? cy - rect.bottom : 0
    const d2d = Math.sqrt(dx * dx + dy * dy)
    let position: 'before' | 'after'
    if (dx > 0 || dy > 0) {
      position = (dx > dy ? (cx < rect.left ? 'before' : 'after') : (cy < rect.top ? 'before' : 'after'))
    } else {
      position = cx < rect.left ? 'before' : 'after'
    }
    if (!nearest || d2d < nearest.dist) {
      nearest = { item, position, dist: d2d }
    }
  }
  return nearest ? { item: nearest.item, position: nearest.position } : null
}

export function applyDropIndicator(container: HTMLElement, item: HTMLElement, position: 'before' | 'over' | 'after'): void {
  container.querySelectorAll(".drag-over, .drag-before, .drag-after").forEach(el => {
    if (el !== item) {
      el.classList.remove("drag-over", "drag-before", "drag-after")
    }
  })
  item.classList.remove("drag-over", "drag-before", "drag-after")
  if (position === 'before') item.classList.add("drag-before")
  else if (position === 'after') item.classList.add("drag-after")
  else item.classList.add("drag-over")
}

export function clearDropIndicators(container: HTMLElement): void {
  container.querySelectorAll(".drag-over, .drag-before, .drag-after").forEach(el => {
    el.classList.remove("drag-over", "drag-before", "drag-after")
  })
}