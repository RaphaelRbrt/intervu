<template>
  <div class="category-item">
    <ExpandableHeader class="ci-header" :open="isOpen" :chevron-class="'ci-chevron'" @click="onToggleOpen">
      {{ title }}
    </ExpandableHeader>

    <div v-show="isOpen" class="ci-body">
      <div class="ci-tags">
        <button
          v-for="cat in categories"
          :key="cat"
          class="ci-tag"
          :class="{ active: cat === selected }"
          type="button"
          @click="onClick(cat)"
        >
          {{ cat ? cat.toUpperCase() : cat }}
        </button>
      </div>
    </div>
  </div>
  
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import ExpandableHeader from './ExpandableHeader.vue'

  defineProps({
    title: { type: String, default: 'Catégorie' },
    categories: { type: Array, default: () => [] }
  })

  const emit = defineEmits(['select'])

  const isOpen = ref(false)
  const selected = ref('')

  function onToggleOpen() {
    isOpen.value = !isOpen.value
    try { localStorage.setItem('intervu.categoriesOpen', isOpen.value ? '1' : '0') } catch (_) {}
  }

  function onClick(cat) {
    const next = (selected.value === cat ? '' : cat)
    selected.value = next
    try { localStorage.setItem('intervu.selectedCategory', next) } catch (_) {}
    emit('select', next)
  }

  onMounted(() => {
    try {
      selected.value = localStorage.getItem('intervu.selectedCategory') || ''
      const savedOpen = localStorage.getItem('intervu.categoriesOpen')
      if (savedOpen === '1') isOpen.value = true
    } catch (_) {}
  })
</script>

<style scoped>
  .category-item {
    width: 100%;
  }
  .ci-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    --eh-bg: #00C26B;
    --eh-color: #ffffff;
    --eh-height: 35px;
    --eh-radius: 41px;
    --eh-padding-x: 1rem;
    --eh-chevron-w: 25px;
    --eh-chevron-h: 13px;
  }
  .ci-chevron {
    width: 10rem;
    height: 10rem;
  }
  .ci-body {
    width: 100%;
    box-sizing: border-box;
    padding: 0.9rem 1rem 1rem 1rem;
    background: #ffffff;
    border-bottom: 2px solid #9AE6B4;
    border-left: 2px solid #9AE6B4;
    border-right: 2px solid #9AE6B4;
    border-radius: 0 0 30px 30px;
    line-height: 1.35;
  }
  .ci-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .ci-tag {
    appearance: none;
    background: #ffffff;
    color: #00C26B;
    border: 2px solid #00C26B;
    border-radius: 30px;
    padding: 0.2rem 0.6rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, filter 0.2s ease;
  }
  .ci-tag:hover {
    background: #00C26B;
    color: #ffffff;
  }
  .ci-tag.active {
    background: #00C26B;
    color: #ffffff;
  }
  .ci-tag:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 194, 107, 0.2);
  }
</style>

