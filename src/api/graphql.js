import { GraphQLClient, gql } from 'graphql-request'

function getBaseUrl() {
  const viteUrl = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ? String(import.meta.env.VITE_API_URL) : ''
  if (viteUrl) {
    if (/^https?:\/\//i.test(viteUrl)) return viteUrl.replace(/\/$/, '')
    try {
      if (typeof window !== 'undefined' && window.location && window.location.origin) {
        return new URL(viteUrl, window.location.origin).toString().replace(/\/$/, '')
      }
    } catch (_) {}
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/api`
  }
  return 'http://localhost:3000/api'
}

const baseUrl = getBaseUrl()
export const graphQLEndpoint = `${baseUrl}/graphql`

const apiToken = (import.meta && import.meta.env && import.meta.env.VITE_API_TOKENS) ? String(import.meta.env.VITE_API_TOKENS) : ''

export const client = new GraphQLClient(graphQLEndpoint, {
  headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {}
})

// --- Cache mémoire simple avec SWR (stale-while-revalidate) ---
const cacheStore = new Map() // key -> { ts: number, data: any }
const listenersByKey = new Map() // key -> Set<fn>

export function getCacheKey(query, variables) {
  return JSON.stringify({ q: String(query), v: variables || {} })
}

export function subscribeQuery(query, variables, callback) {
  const key = getCacheKey(query, variables)
  if (!listenersByKey.has(key)) listenersByKey.set(key, new Set())
  listenersByKey.get(key).add(callback)
  return () => {
    const set = listenersByKey.get(key)
    if (set) {
      set.delete(callback)
      if (set.size === 0) listenersByKey.delete(key)
    }
  }
}

function notifyKey(key) {
  const set = listenersByKey.get(key)
  if (!set) return
  const entry = cacheStore.get(key)
  for (const fn of set) {
    try { fn(entry?.data) } catch (_) {}
  }
}

export async function cachedRequest(query, variables = {}, options = {}) {
  const { staleMs = 10000, maxAgeMs = 60000, backgroundRevalidate = true } = options
  const key = getCacheKey(query, variables)
  const now = Date.now()
  const entry = cacheStore.get(key)

  if (entry) {
    const age = now - entry.ts
    if (age < staleMs) {
      return entry.data
    }
    if (age < maxAgeMs) {
      if (backgroundRevalidate) {
        // rafraîchit en arrière-plan
        client.request(query, variables).then((fresh) => {
          cacheStore.set(key, { ts: Date.now(), data: fresh })
          notifyKey(key)
        }).catch(() => {})
      }
      return entry.data
    }
    // trop vieux: on va chercher frais
  }

  const fresh = await client.request(query, variables)
  cacheStore.set(key, { ts: Date.now(), data: fresh })
  notifyKey(key)
  return fresh
}

export function invalidateQueries(pairs) {
  // pairs: Array<[query, variables]>
  for (const [q, v] of pairs) {
    const key = getCacheKey(q, v || {})
    cacheStore.delete(key)
    notifyKey(key)
  }
}

export const queries = {
  intervuQuestions: gql`
    query IntervuQuestions($search: String, $skip: Int, $take: Int) {
      intervuQuestions(search: $search, skip: $skip, take: $take) {
        id
        title
        createdAt
        category { id name }
        answers { id content createdAt }
      }
    }
  `,
  intervuCategories: gql`
    query IntervuCategories {
      intervuCategories { id name }
    }
  `,
}

export const mutations = {
  createCategory: gql`
    mutation CreateCategory($data: CategoryCreateInput!) {
      createIntervuCategory(data: $data) { id name }
    }
  `,
  createQuestion: gql`
    mutation CreateQuestion($data: QuestionCreateInput!) {
      createIntervuQuestion(data: $data) { id title category { id name } }
    }
  `,
  createAnswer: gql`
    mutation CreateAnswer($data: AnswerCreateInput!) {
      createIntervuAnswer(data: $data) { id content question { id } }
    }
  `,
  updateQuestion: gql`
    mutation UpdateQuestion($id: ID!, $data: QuestionUpdateInput!) {
      updateIntervuQuestion(id: $id, data: $data) { id title category { id name } }
    }
  `,
  deleteQuestion: gql`
    mutation DeleteQuestion($id: ID!) {
      deleteIntervuQuestion(id: $id)
    }
  `,
  updateAnswer: gql`
    mutation UpdateAnswer($id: ID!, $data: AnswerUpdateInput!) {
      updateIntervuAnswer(id: $id, data: $data) { id content question { id } }
    }
  `,
  deleteAnswer: gql`
    mutation DeleteAnswer($id: ID!) {
      deleteIntervuAnswer(id: $id)
    }
  `,
}


