import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'

marked.setOptions({
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  gfm: true,
  breaks: true
})

export function renderMarkdownToHtml(markdown) {
  const dirty = marked.parse(String(markdown || ''))
  return DOMPurify.sanitize(dirty)
}


