<template>
  <div class="main-container">
    <div class="questions-block">
        <SearchInput v-model="query" placeholder="Rechercher une question" />
        <div class="questions-list">
            <template v-if="loading">
              <span>Chargement…</span>
            </template>
            <template v-else-if="error">
              <span>{{ error }}</span>
            </template>
          <template v-else>
            <div v-if="questions.length === 0">Aucun résultat trouvé.</div>
            <template v-else>
              <QuestionItem
                v-for="q in questions"
                :key="q.id"
                :id="q.id"
                :question="q.title"
                :reponse="(q.answers && q.answers[0] && q.answers[0].content) || 'Pas de réponse pour le moment.'"
                :categories="q.category && q.category.name ? [q.category.name] : []"
                :highlight-term="query || selectedCategory"
              />
            </template>
            </template>
        </div>
    </div>
   
    <div class="categories-block">
      <CategoryItem
        :categories="categories"
        @select="onSelectCategory"
      />
    </div>
  </div>
  
</template>

<script setup>
  import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
  import SearchInput from './SearchInput.vue'
  import QuestionItem from './QuestionItem.vue'
  import CategoryItem from './CategoryItem.vue'
  import { queries, cachedRequest, subscribeQuery } from '@/api/graphql'
  
  const query = ref('')
  const selectedCategory = ref('')
  const loading = ref(false)
  const error = ref('')
  const questions = ref([])
  const categories = ref([])
  const searchTerm = computed(() => (query.value || undefined))
  let unsubscribe = null
  let debounceTimer = null

  function onSelectCategory(cat) {
    selectedCategory.value = cat
    try { localStorage.setItem('intervu.selectedCategory', selectedCategory.value) } catch (_) {}
    fetchQuestions()
  }

  function getVariables() {
    return { search: searchTerm.value, skip: 0, take: 50 }
  }

  async function fetchQuestions() {
    loading.value = true
    error.value = ''
    try {
      const data = await cachedRequest(queries.intervuQuestions, getVariables(), { staleMs: 10000, maxAgeMs: 60000, backgroundRevalidate: true })
      const all = data?.intervuQuestions || []
      const byCategory = selectedCategory.value
        ? all.filter(q => q.category && q.category.name === selectedCategory.value)
        : all
      const term = (query.value || '').trim().toLowerCase()
      questions.value = term
        ? byCategory.filter(q => {
            const title = String(q.title || '').toLowerCase()
            const answer = String((q.answers && q.answers[0] && q.answers[0].content) || '').toLowerCase()
            return title.includes(term) || answer.includes(term)
          })
        : byCategory
    } catch (e) {
      error.value = 'Erreur lors du chargement des questions.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    try {
      const data = await cachedRequest(queries.intervuCategories, {}, { staleMs: 10000, maxAgeMs: 60000, backgroundRevalidate: true })
      categories.value = (data?.intervuCategories || []).map(c => c.name)
    } catch (e) {
      console.error(e)
    }
  }

  watch(query, () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      fetchQuestions()
      if (unsubscribe) unsubscribe()
      unsubscribe = subscribeQuery(queries.intervuQuestions, getVariables(), (data) => {
        const all = (data?.intervuQuestions) || []
        const byCategory = selectedCategory.value
          ? all.filter(q => q.category && q.category.name === selectedCategory.value)
          : all
        const term = (query.value || '').trim().toLowerCase()
        questions.value = term
          ? byCategory.filter(q => {
              const title = String(q.title || '').toLowerCase()
              const answer = String((q.answers && q.answers[0] && q.answers[0].content) || '').toLowerCase()
              return title.includes(term) || answer.includes(term)
            })
          : byCategory
      })
    }, 300)
  })

  watch(selectedCategory, () => {
    fetchQuestions()
    if (unsubscribe) unsubscribe()
    unsubscribe = subscribeQuery(queries.intervuQuestions, getVariables(), (data) => {
      const all = (data?.intervuQuestions) || []
      const byCategory = selectedCategory.value
        ? all.filter(q => q.category && q.category.name === selectedCategory.value)
        : all
      const term = (query.value || '').trim().toLowerCase()
      questions.value = term
        ? byCategory.filter(q => {
            const title = String(q.title || '').toLowerCase()
            const answer = String((q.answers && q.answers[0] && q.answers[0].content) || '').toLowerCase()
            return title.includes(term) || answer.includes(term)
          })
        : byCategory
    })
  })

  onMounted(() => {
    try {
      const saved = localStorage.getItem('intervu.selectedCategory') || ''
      selectedCategory.value = saved
    } catch (_) {}
    fetchCategories()
    fetchQuestions()
    unsubscribe = subscribeQuery(queries.intervuQuestions, getVariables(), (data) => {
      const all = data?.intervuQuestions || []
      const byCategory = selectedCategory.value
        ? all.filter(q => q.category && q.category.name === selectedCategory.value)
        : all
      const term = (query.value || '').trim().toLowerCase()
      questions.value = term
        ? byCategory.filter(q => {
            const title = String(q.title || '').toLowerCase()
            const answer = String((q.answers && q.answers[0] && q.answers[0].content) || '').toLowerCase()
            return title.includes(term) || answer.includes(term)
          })
        : byCategory
    })
  })

  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
    if (debounceTimer) clearTimeout(debounceTimer)
  })
</script>

<style scoped>
  h2 {
    margin-bottom: 0.75rem;
    color: #00C26B;
    font-family: 'Inter', sans-serif;
    font-size: 3.25rem;
    line-height: 1.1;
  }
  .main-container {
    display: flex;
    margin-top: 9rem;
    width: 100%;
    flex-direction: row;
    gap: 1rem;
  }
  .questions-list {
    margin-top: 1rem;
    display: grid;
    gap: 0.5rem;
  }
  .questions-block {
    width: 80%;
  }
  .categories-block {
    width: 20%;
  }

  @media (max-width: 768px) {
    .main-container {
      flex-direction: column;
    }
    .categories-block {
      order: -1;
      width: 100%;
      margin-top: 0;
      margin-bottom: 1rem;
    }
    .questions-block {
      width: 100%;
    }
  }
</style>