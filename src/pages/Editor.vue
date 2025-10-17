<script setup>
  import { ref, onMounted } from 'vue'
  import { queries, mutations, cachedRequest, client, invalidateQueries } from '@/api/graphql'
  import { QuillEditor } from '@vueup/vue-quill'
  import '@vueup/vue-quill/dist/vue-quill.snow.css'
  import LabeledEditor from '@/components/LabeledEditor.vue'
  import ConfirmModal from '@/components/ConfirmModal.vue'
  import CategoryDropdown from '@/components/CategoryDropdown.vue'

  const loading = ref(false)
  const error = ref('')
  const items = ref([])
  const selectedIds = ref(new Set())
  const search = ref('')
  const dirtyIds = ref(new Set())
  const savingIds = ref(new Set())
  const showConfirm = ref(false)
  const categories = ref([])
  const creating = ref(false)
  const newTitle = ref('')
  const newAnswer = ref('')
  const newCategoryId = ref('')

  function isSelected(id) { return selectedIds.value.has(id) }
  function toggleSelect(id) {
    if (selectedIds.value.has(id)) selectedIds.value.delete(id)
    else selectedIds.value.add(id)
    selectedIds.value = new Set(selectedIds.value)
  }
  function allSelected() { return items.value.length > 0 && items.value.length === selectedIds.value.size }
  function toggleSelectAll() {
    if (allSelected()) selectedIds.value = new Set()
    else selectedIds.value = new Set(items.value.map(i => i.id))
  }

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const data = await cachedRequest(queries.intervuQuestions, { search: search.value || undefined, skip: 0, take: 100 })
      const incoming = data?.intervuQuestions || []
      const currentById = new Map(items.value.map(i => [i.id, i]))
      const next = []
      for (const n of incoming) {
        const ex = currentById.get(n.id)
        if (ex) {
          ex.title = n.title
          ex.category = n.category
          ex.answers = n.answers
          next.push(ex)
        } else {
          next.push(n)
        }
      }
      items.value = next
      const incIds = new Set(incoming.map(i => i.id))
      selectedIds.value = new Set(Array.from(selectedIds.value).filter(id => incIds.has(id)))
      dirtyIds.value = new Set(Array.from(dirtyIds.value).filter(id => incIds.has(id)))
    } catch (e) {
      console.error(e)
      error.value = 'Erreur de chargement'
    } finally {
      loading.value = false
    }
  }

  async function loadCategories() {
    try {
      const data = await cachedRequest(queries.intervuCategories, {}, { staleMs: 10000, maxAgeMs: 60000, backgroundRevalidate: true })
      categories.value = data?.intervuCategories || []
    } catch (e) { console.error(e) }
  }

  function isDirty(it) { return dirtyIds.value.has(it.id) }
  function markDirty(it) { dirtyIds.value.add(it.id); dirtyIds.value = new Set(dirtyIds.value) }
  function isSaving(it) { return savingIds.value.has(it.id) }

  async function saveItem(it) {
    try {
      savingIds.value.add(it.id); savingIds.value = new Set(savingIds.value)
      await client.request(mutations.updateQuestion, { id: it.id, data: { title: it.title, categoryId: it.category?.id } })
      const firstAns = (it.answers && it.answers[0])
      if (firstAns) {
        await client.request(mutations.updateAnswer, { id: firstAns.id, data: { content: firstAns.content } })
      }
      invalidateQueries([[queries.intervuQuestions, { search: undefined, skip: 0, take: 100 }]])
      dirtyIds.value.delete(it.id); dirtyIds.value = new Set(dirtyIds.value)
    } catch (e) {
      console.error(e)
      alert('Erreur pendant la sauvegarde')
    } finally {
      savingIds.value.delete(it.id); savingIds.value = new Set(savingIds.value)
    }
  }

  async function deleteOne(id) {
    try {
      await client.request(mutations.deleteQuestion, { id })
      items.value = items.value.filter(i => i.id !== id)
      selectedIds.value.delete(id)
      selectedIds.value = new Set(selectedIds.value)
      invalidateQueries([[queries.intervuQuestions, { search: undefined, skip: 0, take: 100 }]])
    } catch (e) {
      console.error(e)
      alert('Suppression échouée')
    }
  }

  async function deleteSelected() {
    const ids = Array.from(selectedIds.value)
    for (const id of ids) await deleteOne(id)
  }

  function confirmDeleteSelected() {
    if (selectedIds.value.size === 0) return
    const ok = window.confirm('Confirmer la suppression de la sélection ?')
    if (ok) deleteSelected()
  }

  function getAnswerContent(it) {
    return it && it.answers && it.answers[0] ? it.answers[0].content : ''
  }
  function setAnswerContent(it, html) {
    if (!it.answers || it.answers.length === 0) {
      it.answers = [{ content: html }]
      markDirty(it)
      return
    }
    it.answers[0].content = html
    markDirty(it)
  }

  onMounted(() => { load(); loadCategories() })

  async function createItem() {
    if (!newTitle.value || !newAnswer.value || !newCategoryId.value) return
    creating.value = true
    try {
      const q = await client.request(mutations.createQuestion, { data: { title: newTitle.value, categoryId: newCategoryId.value } })
      const createdId = q?.createIntervuQuestion?.id
      if (createdId) {
        await client.request(mutations.createAnswer, { data: { questionId: createdId, content: newAnswer.value } })
      }
      newTitle.value = ''
      newAnswer.value = ''
      newCategoryId.value = ''
      invalidateQueries([
        [queries.intervuQuestions, { search: undefined, skip: 0, take: 100 }],
        [queries.intervuCategories, {}],
      ])
      await load()
    } catch (e) {
      console.error(e)
      alert('Erreur pendant la création')
    } finally {
      creating.value = false
    }
  }
</script>

<template>
  <div class="editor">
    <h2>Éditer questions</h2>
    <div class="create-box">
      <LabeledEditor label="Question" v-model="newTitle" content-type="text" :min-height="'48px'" />
      <LabeledEditor label="Réponse" v-model="newAnswer" content-type="html" :min-height="'120px'" />
      <div class="create-row">
        <div class="create-col">
          <label class="create-label">Catégorie</label>
          <CategoryDropdown v-model="newCategoryId" :categories="categories" />
        </div>
        <button type="button" class="btn btn-primary" :disabled="creating || !newTitle || !newAnswer || !newCategoryId" @click="createItem">
          <span v-if="!creating">Créer</span>
          <span v-else>Création…</span>
        </button>
      </div>
    </div>
    <div class="toolbar">
      <input v-model="search" type="text" placeholder="Rechercher..." />
      <button type="button" @click="load">Recharger</button>
      <button type="button" class="btn" @click="toggleSelectAll">{{ allSelected() ? 'Tout désélectionner' : 'Tout sélectionner' }}</button>
      <button
        v-if="selectedIds.size > 0"
        type="button"
        class="btn btn-danger"
        @click="showConfirm = true"
      >Supprimer la sélection</button>
    </div>

    <div v-if="loading">Chargement…</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-if="items.length === 0">Aucun résultat</div>
      <ul class="list">
        <li v-for="it in items" :key="it.id" class="row">
          <label class="sel">
            <input type="checkbox" :checked="isSelected(it.id)" @change="toggleSelect(it.id)" />
          </label>
          <div class="editors">
            <LabeledEditor label="Question" v-model="it.title" content-type="text" :min-height="'48px'" @update:modelValue="markDirty(it)" />
            <LabeledEditor label="Réponse" :model-value="getAnswerContent(it)" content-type="html" :min-height="'120px'" @update:modelValue="val => setAnswerContent(it, val)" />
          </div>
          <button
            v-if="isDirty(it) && !isSaving(it)"
            type="button"
            class="save"
            @click="saveItem(it)"
          >Sauvegarder</button>
          <span v-else-if="isSaving(it)" class="saving">Enregistrement…</span>
          <button type="button" class="del" @click="deleteOne(it.id)">Supprimer</button>
        </li>
      </ul>
    </div>
  </div>
  <ConfirmModal
    :open="showConfirm"
    title="Supprimer la sélection"
    message="Cette action est irréversible. Confirmer la suppression ?"
    confirm-text="Supprimer"
    cancel-text="Annuler"
    @confirm="() => { showConfirm = false; deleteSelected() }"
    @close="showConfirm = false"
  />
</template>

<style scoped>
  .editor { display: grid; gap: 1rem; }
  .create-box { display: grid; gap: 0.5rem; padding: 0.75rem; border: 2px solid #9AE6B4; border-radius: 0.75rem; background: #fff; }
  .create-row { display: flex; gap: 0.5rem; align-items: flex-end; justify-content: space-between; }
  .create-col { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
  .create-label { font-weight: 600; color: #0f172a; }
    .toolbar { display: flex; gap: 0.5rem; align-items: center; flex-wrap: nowrap; overflow-x: auto; }
  .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
  .row { display: grid; grid-template-columns: auto 1fr auto auto; gap: 0.5rem; align-items: start; padding: 0.5rem; border: 1px solid #9AE6B4; border-radius: 0.5rem; background: #fff; }
  .editors { display: flex; flex-direction: column; gap: 0.75rem; }
  .field { display: flex; flex-direction: column; gap: 0.4rem; }
  .field-label { font-weight: 600; color: #0f172a; }
    .title, .answer { width: 100%; box-sizing: border-box; border: 2px solid #9AE6B4; border-radius: 0.75rem; }
  .answer :deep(.ql-editor) { min-height: 120px; }
  .title :deep(.ql-editor) { min-height: 48px; }
    .save { border: 2px solid #00C26B; background: #00C26B; color: #ffffff; border-radius: 0.75rem; padding: 0.45rem 0.9rem; cursor: pointer; font-weight: 600; }
    .saving { color: #00C26B; font-weight: 600; }
    .del { border: 2px solid #ef4444; color: #ef4444; background: #fff; border-radius: 0.75rem; padding: 0.45rem 0.9rem; cursor: pointer; }
    .toolbar input { border: 2px solid #9AE6B4; border-radius: 0.75rem; padding: 0.45rem 0.6rem; }
    .toolbar .btn { border: 2px solid #00C26B; background: #fff; color: #00C26B; border-radius: 0.75rem; padding: 0.4rem 0.8rem; white-space: nowrap; cursor: pointer; }
    .toolbar .btn:hover { background: #ECFDF5; }
    .toolbar .btn-danger { border-color: #ef4444; color: #ef4444; }
    .toolbar button:hover { background: #ECFDF5; }
  .btn-primary { border: 2px solid #00C26B; background: #00C26B; color: #fff; border-radius: 0.75rem; padding: 0.45rem 0.9rem; cursor: pointer; font-weight: 600; }
  :deep(.ql-toolbar.ql-snow) { white-space: nowrap; overflow-x: auto; }
  :deep(.ql-toolbar .ql-formats) { display: inline-flex; }
</style>


