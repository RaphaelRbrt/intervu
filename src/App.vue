<script setup>
  import Header from './components/Header.vue';
</script>

<template>
  <Header />
  <router-view />

  
</template>

<style>
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: #FFF6ED;
    padding: 1.5rem;
    font-family: 'Inter', sans-serif;
  }
  main {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
  main h1 {
    justify-content: flex-end;
    text-align: left;
    font-size: clamp(2rem, 6vw, 4.5rem);
    color: #00C26B;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    line-height: 1.5;
  }

  main h1 strong{
    display: inline-block;
    border-width: 2px;
    border-style: solid;
    border-color: #00C26B;
    box-sizing: border-box;
    border-radius: 2rem; 
  }

  main h1 strong:last-child{
    margin-top: 0.5rem;
  }

</style>
