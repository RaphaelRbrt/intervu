<template>
  <div class="search-input">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target && $event.target.value ? $event.target.value : ($event.target ? $event.target.value : ''))"
      :placeholder="placeholder"
      type="text"
    />
    <span class="icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </span>
  </div>
  
</template>

<script setup>
  defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' }
  })
  defineEmits(['update:modelValue'])
</script>

<style scoped>
  .search-input {
    position: relative;
    width: 100%;
  }
  .search-input input {
    width: 100%;
    box-sizing: border-box;
    border: 2px solid #9AE6B4;
    height: 35px;
    border-radius: 41px;
    padding: 0 2.5rem 0 1rem;
    background: #ffffff;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    font-size: 1rem;
    color: #0f172a;
  }
  .search-input input::placeholder {
    color: #8FA3A7;
  }
  .search-input input:focus {
    border-color: #00C26B;
    box-shadow: 0 0 0 3px rgba(0, 194, 107, 0.15);
  }
  .search-input .icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    color: #00C26B;
  }
  .search-input .icon svg {
    width: 19px;
    height: 19px;
  }
</style>

