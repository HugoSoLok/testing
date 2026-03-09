import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, type Member } from '@/lib/db'

export const useMembersStore = defineStore('members', () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const members = ref<Member[]>([])

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function loadMembers(): Promise<void> {
    members.value = await db.members.orderBy('name').toArray()
  }

  async function addMember(data: Pick<Member, 'name'>): Promise<void> {
    const now = new Date().toISOString()
    await db.members.add({ name: data.name, created: now, updated: now })
    await loadMembers()
  }

  async function updateMember(id: number, changes: Pick<Member, 'name'>): Promise<void> {
    const now = new Date().toISOString()
    await db.members.update(id, { name: changes.name, updated: now })
    await loadMembers()
  }

  async function deleteMember(id: number): Promise<void> {
    const refCount = await db.expenses.where('paidBy').equals(id).count()
    if (refCount > 0) {
      throw new Error('Member has expense records and cannot be removed.')
    }
    await db.members.delete(id)
    await loadMembers()
  }

  return {
    members,
    loadMembers,
    addMember,
    updateMember,
    deleteMember,
  }
})

// Re-export db for convenience
export { db }
