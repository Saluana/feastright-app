const defaultConfig = `{
    "darkMode": "class",
    "theme": {
        "fontFamily": {
            "sans": ["Nunito", "sans-serif"]
        },
        "container": {
            "center": true,
            "padding": "2rem"
        },
        "extend": {
            "colors": {
                "border": "hsl(var(--border))",
                "input": "hsl(var(--input))",
                "ring": "hsl(var(--ring))",
                "background": "hsl(var(--background))",
                "foreground": "hsl(var(--foreground))",
                "primary": {
                    "DEFAULT": "hsl(var(--primary))",
                    "foreground": "hsl(var(--primary-foreground))"
                },
                "secondary": {
                    "DEFAULT": "hsl(var(--secondary))",
                    "foreground": "hsl(var(--secondary-foreground))"
                },
                "destructive": {
                    "DEFAULT": "hsl(var(--destructive))",
                    "foreground": "hsl(var(--destructive-foreground))"
                },
                "muted": {
                    "DEFAULT": "hsl(var(--muted))",
                    "foreground": "hsl(var(--muted-foreground))"
                },
                "accent": {
                    "DEFAULT": "hsl(var(--accent))",
                    "foreground": "hsl(var(--accent-foreground))"
                },
                "popover": {
                    "DEFAULT": "hsl(var(--popover))",
                    "foreground": "hsl(var(--popover-foreground))"
                },
                "card": {
                    "DEFAULT": "hsl(var(--card))",
                    "foreground": "hsl(var(--card-foreground))"
                }
            },
            "borderRadius": {
                "xl": "calc(var(--radius) + 4px)",
                "lg": "var(--radius)",
                "md": "calc(var(--radius) - 2px)",
                "sm": "calc(var(--radius) - 4px)"
            }
        }
    }
}`;

const tailwindStylesDefault = `@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 142.1 76.2% 36.3%;
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 142.1 76.2% 36.3%;
    --radius: 0.75rem;
  }
  
  .dark {
    --background: 20 14.3% 4.1%;
    --foreground: 0 0% 95%;
    --card: 24 9.8% 10%;
    --card-foreground: 0 0% 95%;
    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 95%;
    --primary: 142.1 70.6% 45.3%;
    --primary-foreground: 144.9 80.4% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 15%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 12 6.5% 15.1%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 142.4 71.8% 29.2%;
    --border-color-dark: 240 3.7% 21.9%;
  }

  .dark .border {
    border: 1px solid hsl(var(--border-color-dark));
  }
}`;

const bodyClassesDefault = `font-sans bg-background text-foreground antialiased`;

const headSnippetDefault = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NyA0MCIgZmlsbD0iIzBlYTVlOSI+DQogICAgPHBhdGggZD0iTTIzLjUgNi41QzE3LjUgNi41IDEzLjc1IDkuNSAxMi4yNSAxNS41QzE0LjUgMTIuNSAxNy4xMjUgMTEuMzc1IDIwLjEyNSAxMi4xMjVDMjEuODM2NyAxMi41NTI5IDIzLjA2MDEgMTMuNzk0NyAyNC40MTQyIDE1LjE2OTJDMjYuNjIwMiAxNy40MDg0IDI5LjE3MzQgMjAgMzQuNzUgMjBDNDAuNzUgMjAgNDQuNSAxNyA0NiAxMUM0My43NSAxNCA0MS4xMjUgMTUuMTI1IDM4LjEyNSAxNC4zNzVDMzYuNDEzMyAxMy45NDcxIDM1LjE4OTkgMTIuNzA1MyAzMy44MzU3IDExLjMzMDhDMzEuNjI5NyA5LjA5MTU4IDI5LjA3NjYgNi41IDIzLjUgNi41Wk0xMi4yNSAyMEM2LjI1IDIwIDIuNSAyMyAxIDI5QzMuMjUgMjYgNS44NzUgMjQuODc1IDguODc1IDI1LjYyNUMxMC41ODY3IDI2LjA1MjkgMTEuODEwMSAyNy4yOTQ3IDEzLjE2NDIgMjguNjY5M0MxNS4zNzAyIDMwLjkwODQgMTcuOTIzNCAzMy41IDIzLjUgMzMuNUMyOS41IDMzLjUgMzMuMjUgMzAuNSAzNC43NSAyNC41QzMyLjUgMjcuNSAyOS44NzUgMjguNjI1IDI2Ljg3NSAyNy44NzVDMjUuMTYzMyAyNy40NDcxIDIzLjkzOTkgMjYuMjA1MyAyMi41ODU4IDI0LjgzMDdDMjAuMzc5OCAyMi41OTE2IDE3LjgyNjYgMjAgMTIuMjUgMjBaIj48L3BhdGg+DQo8L3N2Zz4=">`;
  
const bodyScriptDefault = `<script>const darkModeToggl=document.createElement('button');darkModeToggl.innerHTML='🌓';darkModeToggl.className='fixed bottom-4 left-4 bg-slate-200 dark:bg-slate-700 p-2 rounded-full text-xs focus:outline-none transition duration-300 ease-in-out transform hover:scale-110';document.body.appendChild(darkModeToggl);darkModeToggl.addEventListener('click',()=>{document.documentElement.classList.toggle('dark')});if(localStorage.theme==='dark'||(!('theme' in localStorage)&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}
darkModeToggl.addEventListener('click',()=>{if(document.documentElement.classList.contains('dark')){localStorage.theme='dark'}else{localStorage.theme='light'}});const menuToggle=document.getElementById('menuToggle');const offCanvasMenu=document.getElementById('offCanvasMenu');const closeMenu=document.getElementById('closeMenu');const menuContent=offCanvasMenu.querySelector('div:last-child');function openMenu(){offCanvasMenu.classList.remove('hidden');setTimeout(()=>{menuContent.classList.remove('-translate-x-full')},10)}
function closeMenuFunction(){menuContent.classList.add('-translate-x-full');setTimeout(()=>{offCanvasMenu.classList.add('hidden')},300)}
menuToggle.addEventListener('click',openMenu);closeMenu.addEventListener('click',closeMenuFunction);offCanvasMenu.addEventListener('click',(e)=>{if(e.target===offCanvasMenu){closeMenuFunction()}})<\/script>`;

const defaultBlocks = {
    hero: {
      title: `Hero Section`,
      content: `
<section class="mb-24 bg-neutral-100 dark:bg-neutral-800">
    <div class="container max-w-4xl mx-auto py-16 md:py-24 px-4 md:px-0 text-center">
      <h2 class="text-3xl font-bold mb-6">Ready to Start Your Channel?</h2>
      <p class="text-xl mb-8">Join our community of creators and share your passion with the world.</p>
      <button class="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold">Create Your Channel</button>
    </div>
  </section>
  `,
    }
  };