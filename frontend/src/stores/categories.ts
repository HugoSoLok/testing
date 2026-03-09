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

  async function addCategory(data: Omit<Category, 'id' | 'created' | 'updated'>): Promise<void> {
    const now = new Date().toISOString()
    await db.categories.add({ ...data, created: now, updated: now })
    await loadCategories()
  }

  async function updateCategory(id: number, changes: Partial<Omit<Category, 'id' | 'created'>>): Promise<void> {
    const now = new Date().toISOString()
    await db.categories.update(id, { ...changes, updated: now })
    await loadCategories()
  }

  async function deleteCategory(id: number): Promise<void> {
    const refCount = await db.expenses.where('categoryId').equals(id).count()
    if (refCount > 0) {
      throw new Error('Category has expense records and cannot be deleted.')
    }
    await db.categories.delete(id)
    await loadCategories()
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
