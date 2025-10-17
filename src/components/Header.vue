<script setup>
  import logo from '@/assets/images/logo.svg';
</script>

<template>
  <header>
    <RouterLink to="/">
      <img :src="logo" alt="logo" />
    </RouterLink>
  </header>
</template>



<style scoped>
  header {
    display: flex;
    justify-content: flex-end ;
    align-items: center;
    padding: 0.1rem;
  }
  img {
    width: 3.5rem;
  }
</style>