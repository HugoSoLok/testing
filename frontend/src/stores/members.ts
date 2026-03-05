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

  async function addMember(_data: Pick<Member, 'name'>): Promise<void> {
    // Stub — implemented in Phase 9 (T046)
  }

  async function updateMember(_id: number, _changes: Pick<Member, 'name'>): Promise<void> {
    // Stub — implemented in Phase 9 (T046)
  }

  async function deleteMember(_id: number): Promise<void> {
    // Stub — implemented in Phase 9 (T046); includes FK guard
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
