<template>
  <button
    type="button"
    class="exp-button"
    :class="{ open }"
    :aria-expanded="String(open)"
    @click="$emit('click')"
  >
    <span class="eh-title" v-if="titleHtml" v-html="titleHtml"></span>
    <span v-else class="eh-title"><slot /></span>
    <span :class="[chevronClass, 'exp-chevron', { open }]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </span>
  </button>
</template>

<script setup>
  const props = defineProps({
    open: { type: Boolean, default: false },
    chevronClass: { type: String, default: 'exp-chevron' },
    titleHtml: { type: String, default: '' }
  })
  defineEmits(['click'])
</script>

<style scoped>
  .exp-button {
    --eh-bg: #00C26B;
    --eh-color: #ffffff;
    --eh-height: 56px;
    --eh-radius: 30px;
    --eh-padding-x: 1rem;
    --eh-chevron-w: 25px;
    --eh-chevron-h: 13px;

    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    background: var(--eh-bg);
    color: var(--eh-color);
    height: var(--eh-height);
    border-radius: var(--eh-radius);
    padding: 0 var(--eh-padding-x);
    border: none;
    transition: filter 0.15s ease, box-shadow 0.2s ease;
  }
  .exp-button:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(0, 194, 107, 0.2); }
  .exp-button:hover { filter: brightness(0.95); }
  .exp-button.open { border-radius: var(--eh-radius) var(--eh-radius) 0 0; }
  .eh-title {
    text-align: left;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
  }
  .exp-chevron { display: inline-flex; transform: rotate(0deg); transition: transform 0.2s ease; color: inherit; }
  .exp-chevron svg { width: 1.2rem; height: 1.2rem; }
  .exp-chevron.open, .qi-chevron.open, .ci-chevron.open { transform: rotate(90deg); }
</style>


