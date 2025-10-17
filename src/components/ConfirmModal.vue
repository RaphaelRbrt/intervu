<template>
  <div v-if="open" class="cm-backdrop" @click.self="onClose">
    <div class="cm-modal" role="dialog" aria-modal="true" aria-labelledby="cm-title">
      <h3 id="cm-title">{{ title }}</h3>
      <p class="cm-message">{{ message }}</p>
      <div class="cm-actions">
        <button type="button" class="cm-btn cm-cancel" @click="onClose">{{ cancelText }}</button>
        <button type="button" class="cm-btn cm-confirm" @click="$emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </div>
  
</template>

<script setup>
  const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, default: 'Confirmation' },
    message: { type: String, default: 'Êtes-vous sûr ?' },
    confirmText: { type: String, default: 'Confirmer' },
    cancelText: { type: String, default: 'Annuler' }
  })
  const emit = defineEmits(['confirm', 'close'])

  function onClose() { emit('close') }
</script>

<style scoped>
  .cm-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center; z-index: 50;
  }
  .cm-modal {
    width: min(520px, 92vw);
    background: #fff; border-radius: 0.75rem; padding: 1rem; border: 2px solid #9AE6B4;
  }
  h3 { margin: 0 0 0.5rem 0; color: #00C26B; }
  .cm-message { margin: 0 0 1rem 0; color: #0f172a; }
  .cm-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .cm-btn { border: 2px solid #00C26B; background: #fff; color: #00C26B; border-radius: 0.75rem; padding: 0.45rem 0.9rem; cursor: pointer; }
  .cm-btn:hover { background: #ECFDF5; }
  .cm-cancel { border-color: #9AE6B4; color: #0f172a; }
  .cm-confirm { background: #00C26B; color: #fff; }
</style>


