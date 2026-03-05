import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, type Category } from '@/lib/db'

export const useCategoriesStore = defineStore('categories', () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const categories = ref<Category[]>([])

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function loadCategories(): Promise<void> {
    categories.value = await db.categories.orderBy('name').toArray()
  }

  async function addCategory(_data: Omit<Category, 'id' | 'created' | 'updated'>): Promise<void> {
    // Stub — implemented in Phase 8 (T043)
  }

  async function updateCategory(_id: number, _changes: Partial<Omit<Category, 'id' | 'created'>>): Promise<void> {
    // Stub — implemented in Phase 8 (T043)
  }

  async function deleteCategory(_id: number): Promise<void> {
    // Stub — implemented in Phase 8 (T043); includes FK guard
  }

  return {
    categories,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  }
})

// Re-export db for convenience
export { db }
