// FILE: /src/theme.ts

export function setDarkTheme() {

  document.documentElement.classList.add('future-ui')

  localStorage.setItem('theme', 'dark')

}

export function setLightTheme() {

  document.documentElement.classList.remove('future-ui')

  localStorage.setItem('theme', 'light')

}

export function toggleTheme() {

  const isDark = document.documentElement.classList.toggle('future-ui')

  localStorage.setItem('theme', isDark ? 'dark' : 'light')

}

export function initTheme() {

  const saved = localStorage.getItem('theme')

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (saved === 'dark' || (!saved && systemDark)) setDarkTheme()

  else setLightTheme()

}

