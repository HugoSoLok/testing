<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast, showNotify } from 'vant'
import LucideIcon from '@/components/common/LucideIcon.vue'
import { useCategoriesStore } from '@/stores/categories'
import type { Category } from '@/lib/db'

const store = useCategoriesStore()

// ─── Allowed palette ─────────────────────────────────────────────────────────

const COLOURS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#10B981', '#14B8A6', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  '#F43F5E', '#6B7280',
]

const ICONS = [
  'UtensilsCrossed', 'Coffee', 'Pizza', 'ShoppingCart',
  'ShoppingBag', 'Car', 'Bus', 'Plane',
  'Bike', 'Home', 'Building', 'Sofa',
  'Heart', 'Activity', 'Pill', 'Tv',
  'Music', 'Gamepad2', 'Film', 'DollarSign',
  'CreditCard', 'Wallet', 'PiggyBank', 'Briefcase',
  'Monitor', 'Zap', 'Droplets', 'Flame',
  'Wifi', 'BookOpen', 'GraduationCap', 'Tag',
  'Gift', 'Package', 'Star', 'MoreHorizontal',
]

// ─── Popup state ─────────────────────────────────────────────────────────────

const showPopup = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  name: '',
  colour: COLOURS[0],
  icon: ICONS[0],
})

function resetForm() {
  form.name = ''
  form.colour = COLOURS[0]
  form.icon = ICONS[0]
  editingId.value = null
}

function openAdd() {
  resetForm()
  showPopup.value = true
}

function openEdit(cat: Category) {
  editingId.value = cat.id!
  form.name = cat.name
  form.colour = cat.colour
  form.icon = cat.icon
  showPopup.value = true
}

async function handleSave() {
  const trimmed = form.name.trim()
  if (!trimmed) {
    showToast('Category name is required')
    return
  }
  if (trimmed.length > 50) {
    showToast('Name must be 50 characters or less')
    return
  }

  try {
    if (editingId.value !== null) {
      await store.updateCategory(editingId.value, {
        name: trimmed,
        colour: form.colour,
        icon: form.icon,
      })
    } else {
      await store.addCategory({
        name: trimmed,
        colour: form.colour,
        icon: form.icon,
      })
    }
    showPopup.value = false
    resetForm()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Could not save category'
    showToast(msg)
  }
}

async function handleDelete(cat: Category) {
  try {
    await store.deleteCategory(cat.id!)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Could not delete category'
    showNotify({ type: 'danger', message: msg })
  }
}

onMounted(() => {
  store.loadCategories()
})
</script>

<template>
  <!-- ── Category list ─────────────────────────────────────────────────────── -->
  <div class="category-setup">
    <van-cell-group inset>
      <van-swipe-cell
        v-for="cat in store.categories"
        :key="cat.id"
      >
        <van-cell
          :title="cat.name"
          clickable
          @click="openEdit(cat)"
        >
          <template #icon>
            <span
              class="cat-icon"
              :style="{ color: cat.colour, backgroundColor: cat.colour + '20' }"
            >
              <LucideIcon
                :name="cat.icon"
                :size="20"
              />
            </span>
          </template>
          <template #value>
            <span
              class="colour-swatch"
              :style="{ backgroundColor: cat.colour }"
            />
          </template>
        </van-cell>

        <template #right>
          <van-button
            square
            type="danger"
            text="Delete"
            class="delete-btn"
            @click="handleDelete(cat)"
          />
        </template>
      </van-swipe-cell>

      <van-cell
        v-if="store.categories.length === 0"
        title="No categories yet"
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
        Add Category
      </van-button>
    </div>
  </div>

  <!-- ── Add / Edit popup ──────────────────────────────────────────────────── -->
  <van-popup
    v-model:show="showPopup"
    position="bottom"
    round
    :style="{ maxHeight: '85vh', overflowY: 'auto' }"
  >
    <div class="popup-content">
      <div class="popup-header">
        <span class="popup-title">{{ editingId !== null ? 'Edit Category' : 'Add Category' }}</span>
        <van-icon
          name="cross"
          class="popup-close"
          @click="showPopup = false"
        />
      </div>

      <!-- Name field -->
      <van-field
        v-model="form.name"
        label="Name"
        placeholder="e.g. Groceries"
        clearable
        maxlength="50"
      />

      <!-- Colour picker -->
      <div class="section-label">
        Colour
      </div>
      <div class="colour-grid">
        <button
          v-for="c in COLOURS"
          :key="c"
          class="colour-option"
          :class="{ selected: form.colour === c }"
          :style="{ backgroundColor: c }"
          @click="form.colour = c"
        />
      </div>

      <!-- Icon picker -->
      <div class="section-label">
        Icon
      </div>
      <div class="icon-grid">
        <button
          v-for="iconName in ICONS"
          :key="iconName"
          class="icon-option"
          :class="{ selected: form.icon === iconName }"
          :style="form.icon === iconName ? { color: form.colour, backgroundColor: form.colour + '20' } : {}"
          @click="form.icon = iconName"
        >
          <LucideIcon
            :name="iconName"
            :size="22"
          />
        </button>
      </div>

      <!-- Preview -->
      <div class="preview-row">
        <span class="preview-label">Preview:</span>
        <span
          class="cat-icon"
          :style="{ color: form.colour, backgroundColor: form.colour + '20' }"
        >
          <LucideIcon
            :name="form.icon"
            :size="20"
          />
        </span>
        <span class="preview-name">{{ form.name || '—' }}</span>
      </div>

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
.category-setup {
  padding: 12px 0;
}

.cat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
}

.colour-swatch {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.add-btn-wrap {
  padding: 16px;
}

.delete-btn {
  height: 100%;
}

/* Popup */
.popup-content {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
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

.section-label {
  font-size: 0.825rem;
  color: #969799;
  padding: 12px 12px 6px;
}

/* Colour grid */
.colour-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 12px 8px;
}

.colour-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  outline: none;
  cursor: pointer;
  transition: transform 0.1s;
}

.colour-option.selected {
  border-color: #fff;
  box-shadow: 0 0 0 2px currentColor;
  transform: scale(1.15);
}

/* Icon grid */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 0 12px 8px;
}

.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f7f8fa;
  border: none;
  cursor: pointer;
  color: #323233;
  transition: background 0.15s;
}

.icon-option.selected {
  border: 2px solid currentColor;
}

/* Preview */
.preview-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

.preview-label {
  font-size: 0.85rem;
  color: #969799;
}

.preview-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #323233;
}

/* Popup actions */
.popup-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
}

.popup-actions .van-button {
  flex: 1;
}
</style>
