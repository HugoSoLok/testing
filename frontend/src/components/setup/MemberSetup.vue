<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast, showNotify } from 'vant'
import { useMembersStore } from '@/stores/members'
import type { Member } from '@/lib/db'

const store = useMembersStore()

// ─── Popup state ─────────────────────────────────────────────────────────────

const showPopup = ref(false)
const editingId = ref<number | null>(null)
const nameInput = ref('')

function openAdd() {
  editingId.value = null
  nameInput.value = ''
  showPopup.value = true
}

function openEdit(member: Member) {
  editingId.value = member.id!
  nameInput.value = member.name
  showPopup.value = true
}

async function handleSave() {
  const trimmed = nameInput.value.trim()
  if (!trimmed) {
    showToast('Name is required')
    return
  }
  if (trimmed.length > 50) {
    showToast('Name must be 50 characters or less')
    return
  }

  try {
    if (editingId.value !== null) {
      await store.updateMember(editingId.value, { name: trimmed })
    } else {
      await store.addMember({ name: trimmed })
    }
    showPopup.value = false
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Could not save member'
    showToast(msg)
  }
}

async function handleDelete(member: Member) {
  try {
    await store.deleteMember(member.id!)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Could not remove member'
    showNotify({ type: 'danger', message: msg })
  }
}

onMounted(() => {
  store.loadMembers()
})
</script>

<template>
  <!-- ── Member list ─────────────────────────────────────────────────────── -->
  <div class="member-setup">
    <van-cell-group inset>
      <van-swipe-cell
        v-for="member in store.members"
        :key="member.id"
      >
        <van-cell
          :title="member.name"
          clickable
          is-link
          @click="openEdit(member)"
        />

        <template #right>
          <van-button
            square
            type="danger"
            text="Delete"
            class="delete-btn"
            @click="handleDelete(member)"
          />
        </template>
      </van-swipe-cell>

      <van-cell
        v-if="store.members.length === 0"
        title="No members yet"
      />
    </van-cell-group>

    <div class="add-btn-wrap">
      <van-button
        round
        type="primary"
        icon="plus"
        block
        @click="openAdd"
      >
        Add Member
      </van-button>
    </div>
  </div>

  <!-- ── Add / Rename popup ─────────────────────────────────────────────── -->
  <van-popup
    v-model:show="showPopup"
    position="bottom"
    round
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
  >
    <div class="popup-content">
      <div class="popup-header">
        <span class="popup-title">{{ editingId !== null ? 'Rename Member' : 'Add Member' }}</span>
        <van-icon
          name="cross"
          class="popup-close"
          @click="showPopup = false"
        />
      </div>

      <van-field
        v-model="nameInput"
        label="Name"
        placeholder="e.g. Alex"
        clearable
        maxlength="50"
        autofocus
        @keyup.enter="handleSave"
      />

      <div class="popup-actions">
        <van-button
          plain
          @click="showPopup = false"
        >
          Cancel
        </van-button>
        <van-button
          type="primary"
          @click="handleSave"
        >
          Save
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.member-setup {
  padding: 12px 0;
}

.add-btn-wrap {
  padding: 16px;
}

.delete-btn {
  height: 100%;
}

.popup-content {
  padding: 16px;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.popup-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #323233;
}

.popup-close {
  font-size: 20px;
  color: #969799;
  cursor: pointer;
  padding: 4px;
}

.popup-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
}

.popup-actions .van-button {
  flex: 1;
}
</style>

