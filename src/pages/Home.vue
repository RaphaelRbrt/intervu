<script setup>
  import Questions from '../components/Questions.vue'
</script>

<template>
  <main>
    <h1>Prépare <strong>ton entretien pro </strong> grâce <br/>à une <strong>série de question</strong> !</h1>
  </main>
  <Questions />
</template>

<style scoped>
  h1 {
    margin: 0 0 1.25rem 0;
    color: #00C26B;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: clamp(2rem, calc(100vw * 0.057), 8.3125rem);
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  h1 strong {
    font-weight: 700;
    color: inherit;
    border: 0.05em solid #00C26B; 
    border-radius: 20rem;
    padding: 0.01em 0.2em;
    background: transparent;
    line-height: 1.06;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  @media (min-width: 1024px) {
    h1 strong { max-width: min(65.2vw, 70ch); display: inline-block; line-height: 1.50;}
  }
  @media (max-width: 572px) {
    h1 { font-size: 1.46rem;}
  }
</style>


