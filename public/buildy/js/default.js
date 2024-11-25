const defaultConfig = `{
    "darkMode": "class",
    "content": [],
    "theme": {
        "container": {
            "center": true,
            "padding": "2rem",
            "screens": {
                "2xl": "1400px"
            }
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
            },
            "keyframes": {
                "accordion-down": {
                    "from": {
                        "height": 0
                    },
                    "to": {
                        "height": "var(--radix-accordion-content-height)"
                    }
                },
                "accordion-up": {
                    "from": {
                        "height": "var(--radix-accordion-content-height)"
                    },
                    "to": {
                        "height": 0
                    }
                },
                "collapsible-down": {
                    "from": {
                        "height": 0
                    },
                    "to": {
                        "height": "var(--radix-collapsible-content-height)"
                    }
                },
                "collapsible-up": {
                    "from": {
                        "height": "var(--radix-collapsible-content-height)"
                    },
                    "to": {
                        "height": 0
                    }
                }
            },
            "animation": {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "collapsible-down": "collapsible-down 0.2s ease-in-out",
                "collapsible-up": "collapsible-up 0.2s ease-in-out"
            }
        }
    }
}`;

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