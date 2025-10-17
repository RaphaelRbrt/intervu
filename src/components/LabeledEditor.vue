<template>
  <div class="field">
    <div class="field-label">{{ label }}</div>
    <QuillEditor
      class="ql-wrapper"
      theme="snow"
      toolbar="full"
      :content="modelValue"
      :content-type="contentType"
      :style="{ '--min-height': minHeight }"
      @update:content="onUpdate"
    />
  </div>
</template>

<script setup>
  import { QuillEditor } from '@vueup/vue-quill'
  import '@vueup/vue-quill/dist/vue-quill.snow.css'

  const props = defineProps({
    label: { type: String, default: '' },
    modelValue: { type: String, default: '' },
    contentType: { type: String, default: 'text' },
    minHeight: { type: String, default: '80px' },
  })
  const emit = defineEmits(['update:modelValue'])

  function onUpdate(val) {
    emit('update:modelValue', val)
  }
</script>

<style scoped>
  .field { display: flex; flex-direction: column; gap: 0.4rem; }
  .field-label { font-weight: 600; color: #0f172a; }
  .ql-wrapper :deep(.ql-editor) { min-height: var(--min-height); }
  :deep(.ql-toolbar.ql-snow) { white-space: nowrap; overflow-x: auto; }
</style>


