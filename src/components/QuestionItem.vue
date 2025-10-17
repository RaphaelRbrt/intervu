<template>
  <div class="question-item">
    <ExpandableHeader
      class="qi-header"
      :open="isOpen"
      :chevron-class="'qi-chevron'"
      :title-html="renderedQuestion"
      @click="isOpen = !isOpen"
    />

    <div v-show="isOpen" class="qi-body">
      <div class="markdown" v-html="renderedAnswer"></div>
      <div v-if="Array.isArray(categories) && categories.length" class="qi-tags">
        <span v-for="cat in categories" :key="cat" class="qi-tag">{{ String(cat).toUpperCase() }}</span>
      </div>
    </div>
  </div>
  
</template>

<script setup>
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
  import { renderMarkdownToHtml } from '@/utils/markdown'
  import ExpandableHeader from './ExpandableHeader.vue'
  import hljs from 'highlight.js'
  import 'highlight.js/styles/github.min.css'

  const props = defineProps({
    id: { type: [String, Number], required: false },
    question: { type: String, required: true },
    reponse: { type: String, required: true },
    highlightTerm: { type: [String, null], default: '' },
    categories: { type: Array, default: () => [] }
  })

  const isOpen = ref(false)

  function getStorageKey() {
    if (props.id === undefined || props.id === null) return null
    return `intervu.questionOpen.${String(props.id)}`
  }

  function loadOpenState() {
    const key = getStorageKey()
    if (!key) return
    try {
      const raw = localStorage.getItem(key)
      if (raw === '1') isOpen.value = true
      if (raw === '0') isOpen.value = false
    } catch (_) {}
  }

  function persistOpenState(val) {
    const key = getStorageKey()
    if (!key) return
    try { localStorage.setItem(key, val ? '1' : '0') } catch (_) {}
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function highlight(text, term) {
    if (!term || typeof term !== 'string' || term.trim() === '') return escapeHtml(text)
    const escaped = escapeHtml(text)
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(${safe})`, 'gi')
    return escaped.replace(re, '<strong>$1</strong>')
  }

  const renderedQuestion = computed(() => {
    const html = renderMarkdownToHtml(props.question)
    if (!props.highlightTerm || String(props.highlightTerm).trim() === '') return html
    const safe = String(props.highlightTerm).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(${safe})`, 'gi')
    return html.replace(re, '<strong>$1</strong>')
  })
  const renderedAnswer = computed(() => {
    const html = renderMarkdownToHtml(props.reponse)
    if (!props.highlightTerm || String(props.highlightTerm).trim() === '') return html
    const safe = String(props.highlightTerm).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(${safe})`, 'gi')
    return html.replace(re, '<strong>$1</strong>')
  })

  async function applyHighlighting() {
    await nextTick()
    const blocks = document.querySelectorAll('.question-item pre code')
    blocks.forEach((block) => {
      try { hljs.highlightElement(block) } catch (_) {}
    })
  }

  onMounted(() => { loadOpenState(); applyHighlighting() })
  watch(renderedAnswer, applyHighlighting)
  watch(isOpen, (v) => { persistOpenState(v) })
</script>

<style>
  .question-item {
    width: 100%;
  }
  :deep(.qi-header) {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    --eh-bg: #00C26B;
    --eh-color: #ffffff;
    --eh-height: 56px;
    --eh-radius: 30px;
    --eh-padding-x: 1rem;
    --eh-chevron-w: 25px;
    --eh-chevron-h: 13px;
  }
  .qi-body {
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
  .qi-body p {
    margin: 0;
    padding: 0;
  }
  .qi-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.5rem;
  }
  .qi-tag {
    appearance: none;
    background: #ffffff;
    color: #00C26B;
    border: 2px solid #00C26B;
    border-radius: 30px;
    padding: 0.2rem 0.6rem;
    font-size: 0.85rem;
    font-weight: 600;
  }
  .markdown pre {
    background: #ECFDF5;
    color: #0f172a;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    overflow-x: auto;
    border: 2px solid #9AE6B4;
    border-left: 4px solid #00C26B;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 1rem;
    word-break: normal;
    overflow-wrap: normal;
    hyphens: none;
    white-space: pre-wrap;
  }
  .markdown pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    border: 0;
    white-space: inherit;
    word-break: normal;
    overflow-wrap: normal;
    hyphens: none;
  }
  .markdown code {
    color: #ECFDF5;
    background-color: #5bd19c;
    border-radius: 6px;
    padding: 1px 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 0.95rem;
    white-space: pre-wrap;
  }
  code {
    color: #00C26B;
  }
</style>

