<template>
  <main style="max-width:720px;margin:40px auto;font-family:system-ui">
    <h1>Clientes (API real)</h1>

    <div v-if="pending">Carregando...</div>
    <div v-else>
      <ul v-if="customers?.length">
        <li v-for="c in customers" :key="c.id">{{ c.name }} — {{ c.email }}</li>
      </ul>
      <p v-else>Nenhum cliente ainda.</p>
    </div>

    <form @submit.prevent="create" style="margin-top:16px">
      <label>Nome <input v-model="form.name" required /></label>
      <label style="margin-left:12px">Email <input v-model="form.email" required type="email" /></label>
      <button :disabled="creating" style="margin-left:12px">Adicionar</button>
    </form>

    <p v-if="err" style="color:#b00;white-space:pre-wrap">{{ err }}</p>
  </main>
</template>

<script setup lang="ts">
import { useRuntimeConfig, useFetch, ref, reactive } from '#imports'
import { $fetch } from 'ofetch'

const cfg = useRuntimeConfig()

const { data: customers, pending, refresh } = await useFetch(
  () => `${cfg.public.apiBase}/customers`,
  { server: false }
)

const form = reactive({ name: 'Cliente Demo', email: 'demo@example.com' })
const creating = ref(false)
const err = ref('')

async function create() {
  err.value = ''
  creating.value = true
  try {
    await $fetch(`${cfg.public.apiBase}/customers`, { method: 'POST', body: form })
    await refresh()
  } catch (e: any) {
    err.value = e?.data?.message || e?.message || String(e)
  } finally {
    creating.value = false
  }
}
</script>
