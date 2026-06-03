import { ref, watch } from 'vue';

const theme = ref(localStorage.getItem('theme') || 'light');

export function useTheme() {
  function applyTheme(t) {
    document.documentElement.classList.toggle('dark', t === 'dark');
    localStorage.setItem('theme', t);
  }
  
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }
  
  watch(theme, applyTheme, { immediate: true });
  
  return {
    theme,
    toggleTheme
  };
}
