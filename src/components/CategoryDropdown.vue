<template>
  <div class="cd-wrapper" ref="root">
    <button type="button" class="cd-button" @click="toggle" :aria-expanded="String(open)">
      <span class="cd-label">{{ selectedLabel }}</span>
      <span class="cd-chevron" :class="{ open }" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </span>
    </button>
    <div v-show="open" class="cd-menu" role="listbox">
      <button
        v-for="c in orderedCategories"
        :key="c.id"
        type="button"
        class="cd-item"
        :aria-selected="c.id === modelValue ? 'true' : 'false'"
        @click="select(c.id)"
      >
        {{ displayName(c.name) }}
      </button>
      <div v-if="orderedCategories.length === 0" class="cd-empty">Aucune catégorie</div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

  const props = defineProps({
    modelValue: { type: String, default: '' },
    categories: { type: Array, default: () => [] }
  })
  const emit = defineEmits(['update:modelValue'])

  const open = ref(false)
  const root = ref(null)

  function toggle() { open.value = !open.value }
  function select(id) { emit('update:modelValue', id); open.value = false }

  function onDocumentClick(e) {
    const el = root.value
    if (!el) return
    if (!el.contains(e.target)) open.value = false
  }

  function onDocumentKeydown(e) {
    if (e.key === 'Escape') open.value = false
  }

  function displayName(name) {
    const n = String(name || '')
    return n.toUpperCase()
  }

  const selectedLabel = computed(() => {
    const found = props.categories.find(c => c.id === props.modelValue)
    return found ? displayName(found.name) : 'Sélectionne une catégorie'
  })

  const orderedCategories = computed(() => {
    const cats = props.categories.slice()
    const priority = ['git', 'js']
    cats.sort((a, b) => {
      const ai = priority.indexOf((a?.name || '').toLowerCase())
      const bi = priority.indexOf((b?.name || '').toLowerCase())
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    return cats
  })

  watch(() => props.modelValue, () => {})

  onMounted(() => {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onDocumentKeydown)
  })
  onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onDocumentKeydown)
  })
</script>

<style scoped>
  .cd-wrapper { position: relative; width: 100%; }
  .cd-button {
    width: 100%;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1rem;
    border: 2px solid #00C26B; border-radius: 0.75rem; background: #fff; cursor: pointer;
    color: #0f172a; font-weight: 500;
  }
  .cd-button:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(0, 194, 107, 0.2); }
  .cd-chevron { transition: transform 0.2s ease; }
  .cd-chevron.open { transform: rotate(90deg); }
  .cd-menu {
    position: absolute; z-index: 10; margin-top: 0.5rem; width: 100%;
    background: #fff; border: 2px solid #9AE6B4; border-radius: 0.75rem; overflow: hidden;
    max-height: 14rem; overflow-y: auto;
  }
  .cd-item {
    width: 100%; text-align: left; background: #fff; border: none; cursor: pointer;
    padding: 0.65rem 0.9rem; color: #0f172a;
  }
  .cd-item:hover, .cd-item[aria-selected="true"] { background: #ECFDF5; }
  .cd-empty { padding: 0.75rem 0.9rem; color: #64748b; }
</style>


