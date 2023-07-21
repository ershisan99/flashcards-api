const html = document.getElementsByTagName('html')[0]
let currentTheme = 'dark'

function $(el) {
  return document.querySelector(el)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function setTheme(theme) {
  html.dataset.theme = theme
  localStorage.setItem('theme', theme)
  currentTheme = theme
}

html.classList.add('dark')

const themeButton = document.createElement('button')

themeButton.innerHTML = 'Change Theme'
themeButton.onclick = () => {
  const isDark = currentTheme === 'dark'

  setTheme(isDark ? 'light' : 'dark')
}

async function main() {
  const theme = localStorage.getItem('theme') || 'dark'

  setTheme(theme)
  await delay(1000)

  const el = $('.topbar-wrapper')

  console.log(el)
  if (el) {
    const form = el.getElementsByTagName('form')[0]

    form.remove()
    el.appendChild(themeButton)
  }
}
main()
