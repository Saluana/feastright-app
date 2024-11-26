document.addEventListener("DOMContentLoaded", async () => {
    // Initialize Lucide icons
    lucide.createIcons();

    try {
      // Fetch component data from localStorage
      const savedProject = JSON.parse(localStorage.getItem('componentYProject'));
      
      const componentsUrl = savedProject?.publicUrl || './shadcn-uikit.json';
      
      const response = await fetch(componentsUrl);
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки JSON: ${response.statusText}`);
      }

      const components = await response.json();
      
      if (typeof components !== 'object') {
        throw new Error('Неверный формат данных JSON');
      }

      // Get the container where components will be displayed
      const componentsContainer = document.getElementById("componentsContainer");
      
      if (!componentsContainer) {
        throw new Error('Контейнер componentsContainer не найден');
      }

      // Iterate over components and create their previews
      for (const [key, component] of Object.entries(components)) {
        componentsContainer.innerHTML += createComponentPreview(key, component);
      }

      // Initialize all components
      for (const [key, component] of Object.entries(components)) {
        initializeComponent(key, component);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }

    // Function to get state from storage
    function getStateFromStorage() {
      try {
        const storedState = localStorage.getItem("currentState");
        return storedState ? JSON.parse(storedState) : null;
      } catch (error) {
        console.error("Error parsing state from localStorage:", error);
        return null;
      }
    }

    // Function to create new block type
    function createNewBlockType(key, title, content) {
      let currentState = getStateFromStorage() || { blocks: {} };
      currentState.blocks[key] = { title, content };
      localStorage.setItem("currentState", JSON.stringify(currentState));
      console.log(`Block "${key}" saved to local storage`);
      return currentState;
    }

    // Function to create component preview
    function createComponentPreview(key, component) {
      const componentHtml = `
        <div id="component-${key}" class="bg-white dark:bg-slate-800 rounded p-6 mb-6">
          <h2 class="text-2xl font-bold mb-2">${component.title}</h2>
          <p class="mb-8">${component.excerpt}</p>
          <div class="flex flex-col md:flex-row flex-1 justify-between items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
            <div class="flex" role="group">
              <button id="previewBtn-${key}" type="button" class="px-4 py-2 text-xs font-bold text-slate-900 bg-white border-t border-b border-slate-200 hover:bg-slate-100 hover:text-sky-700 focus:z-10 focus:ring-0 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:text-white dark:hover:bg-slate-600 rounded-l-lg">
                Preview
              </button>
              <button id="htmlBtn-${key}" type="button" class="px-4 py-2 text-xs font-bold text-slate-900 bg-white border-t border-b border-slate-200 hover:bg-slate-100 hover:text-sky-700 focus:z-10 focus:ring-0 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:text-white dark:hover:bg-slate-600">
                HTML
              </button>
              <button id="hbsBtn-${key}" type="button" class="px-4 py-2 text-xs font-bold text-slate-900 bg-white border-t border-b border-slate-200 hover:bg-slate-100 hover:text-sky-700 focus:z-10 focus:ring-0 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:text-white dark:hover:bg-slate-600">
                HBS
              </button>
              <button id="contextBtn-${key}" type="button" class="px-4 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-r-lg hover:bg-slate-100 hover:text-sky-700 focus:z-10 focus:ring-0 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:text-white dark:hover:bg-slate-600">
                Context
              </button>
            </div>
            <div class="flex" role="group">
              <button id="darkModeBtn-${key}" class="p-2 text-slate-900 bg-white border-t border-b border-slate-200 hover:bg-slate-100 hover:text-sky-700 focus:z-10 focus:ring-0 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:text-white dark:hover:bg-slate-600 rounded-l-lg dark:opacity-50 dark:pointer-events-none" title="Toggle Dark Mode">
                <i data-lucide="moon" class="w-4 h-4"></i>
              </button>
              <button id="openFullPreview-${key}" class="p-2 text-slate-900 bg-white border-t border-b border-slate-200 hover:bg-slate-100 hover:text-sky-700 focus:z-10 focus:ring-0 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:text-white dark:hover:bg-slate-600" title="Open Full Preview">
                <i data-lucide="maximize" class="w-4 h-4"></i>
              </button>
              <button id="copyBtn-${key}" class="p-2 text-slate-900 bg-white border-t border-b border-slate-200 hover:bg-slate-100 hover:text-sky-700 focus:z-10 focus:ring-0 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:text-white dark:hover:bg-slate-600" title="Copy Snippet">
                <i data-lucide="copy" class="w-4 h-4"></i>
              </button>
              <button id="saveBtn-${key}" class="p-2 text-slate-900 bg-white border border-slate-200 rounded-r-lg hover:bg-slate-100 hover:text-sky-700 focus:z-10 focus:ring-0 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:text-white dark:hover:bg-slate-600" title="Save to Local Storage">
                <i data-lucide="save-all" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
          <div id="componentContainer-${key}">
            <div id="previewContent-${key}" class="transition-all duration-300 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border dark:border-slate-600 overflow-hidden">
              <meta id="viewport-meta" name="viewport" content="width=device-width, initial-scale=1.0">
            </div>
            <pre id="htmlContent-${key}" class="hidden"><code class="hljs !pb-4 text-[13px] bg-slate-900"></code></pre>
            <pre id="hbsContent-${key}" class="hidden"><code class="hljs !pb-4 text-[13px] bg-slate-900"></code></pre>
            <pre id="contextContent-${key}" class="hidden"><code class="hljs !pb-4 text-[13px] bg-slate-900 language-json"></code></pre>
          </div>
        </div>
        <div id="fullscreenModal-${key}" class="fixed inset-0 z-[55] hidden flex items-center justify-center bg-black bg-opacity-75">
          <div class="relative bg-white dark:bg-slate-900 w-full h-full overflow-y-auto">
            <button id="closeFullscreenButton-${key}" class="fixed top-0 left-0 p-1 bg-slate-900 text-slate-100 z-[55]"
              title="Close Fullscreen">
              <i data-lucide="minimize-2" class="w-4 h-4"></i>
            </button>
            <div id="fullscreenPreview-${key}" class="z-20 flex justify-center items-center min-h-screen m-0"></div>
          </div>
        </div>
      `;
      return componentHtml;
    }

    function setupFullscreenModal(key) {
      const fullscreenButton = document.getElementById(`openFullPreview-${key}`);
      const closeFullscreenButton = document.getElementById(`closeFullscreenButton-${key}`);
      const fullscreenModal = document.getElementById(`fullscreenModal-${key}`);
      const preview = document.getElementById(`previewContent-${key}`);
      const fullscreenPreview = document.getElementById(`fullscreenPreview-${key}`);

      fullscreenButton.addEventListener("click", function () {
        fullscreenPreview.innerHTML = preview.innerHTML;
        fullscreenModal.classList.remove("hidden");
      });

      closeFullscreenButton.addEventListener("click", function () {
        fullscreenModal.classList.add("hidden");
      });
    }

    // Function to parse HTML and generate HBS and Context
    function parseHTML(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const context = {};
      let hbsTemplate = html;

      const titleTags = ["h1", "h2", "h3", "h4", "h5", "h6"];
      let postTitleSet = false;

      titleTags.forEach((tag, index) => {
        doc.querySelectorAll(tag).forEach((element, i) => {
          const key = tag === "h1" && !postTitleSet ? "post_title" : `block_title_${tag}_${i + 1}`;
          context[key] = element.textContent.trim();
          hbsTemplate = hbsTemplate.replace(element.outerHTML, `<${tag}>{{${key}}}<\/${tag}>`);
          if (key === "post_title") postTitleSet = true;
        });
      });

      doc.querySelectorAll("p").forEach((element, i) => {
        const key = `paragraph_${i + 1}`;
        context[key] = element.textContent.trim();
        hbsTemplate = hbsTemplate.replace(element.outerHTML, `<p>{{${key}}}<\/p>`);
      });

      doc.querySelectorAll("span").forEach((element, i) => {
        const key = `span_${i + 1}`;
        context[key] = element.textContent.trim();
        hbsTemplate = hbsTemplate.replace(element.outerHTML, `<span>{{${key}}}<\/span>`);
      });

      doc.querySelectorAll("a").forEach((element, i) => {
        const href = element.getAttribute("href");
        const text = element.textContent.trim();
        if (href) {
          const linkKey = `link_${i + 1}`;
          context[linkKey] = { href, text };
          hbsTemplate = hbsTemplate.replace(element.outerHTML, `<a href="{{${linkKey}.href}}">{{${linkKey}.text}}<\/a>`);
        }
      });

      return { hbsTemplate, context };
    }

    // Function to initialize component
    function initializeComponent(key, component) {
      const previewContent = document.getElementById(`previewContent-${key}`);
      const htmlContent = document.getElementById(`htmlContent-${key}`);
      const hbsContent = document.getElementById(`hbsContent-${key}`);
      const contextContent = document.getElementById(`contextContent-${key}`);

      previewContent.innerHTML = component.content;
      htmlContent.querySelector("code").textContent = component.content.trim();

      const { hbsTemplate, context } = parseHTML(component.content);
      hbsContent.querySelector("code").textContent = hbsTemplate.trim();
      contextContent.querySelector("code").textContent = JSON.stringify(context, null, 2);

      setupFullscreenModal(key);

      hljs.configure({ ignoreUnescapedHTML: true });

      hljs.highlightElement(htmlContent.querySelector("code"));
      hljs.highlightElement(hbsContent.querySelector("code"));
      hljs.highlightElement(contextContent.querySelector("code"));

      // Toggle views
      const toggleView = (viewType) => {
        [previewContent, htmlContent, hbsContent, contextContent].forEach((el) => el.classList.add("hidden"));
        document.getElementById(`${viewType}Content-${key}`).classList.remove("hidden");

        // Update button styles
        [`previewBtn-${key}`, `htmlBtn-${key}`, `hbsBtn-${key}`, `contextBtn-${key}`].forEach((btnId) => {
          const btn = document.getElementById(btnId);
          btn.classList.remove("bg-sky-600", "text-white");
          btn.classList.add("bg-white", "text-slate-900", "dark:bg-slate-700", "dark:text-white");
        });

        const activeBtn = document.getElementById(`${viewType}Btn-${key}`);
        activeBtn.classList.remove("bg-white", "text-slate-900", "dark:bg-slate-700", "dark:text-white");
        activeBtn.classList.add("bg-sky-600", "text-white");

        if (viewType !== "preview") {
          hljs.highlightElement(document.getElementById(`${viewType}Content-${key}`).querySelector("code"));
        }
      };

      document.getElementById(`previewBtn-${key}`).addEventListener("click", () => toggleView("preview"));
      document.getElementById(`htmlBtn-${key}`).addEventListener("click", () => toggleView("html"));
      document.getElementById(`hbsBtn-${key}`).addEventListener("click", () => toggleView("hbs"));
      document.getElementById(`contextBtn-${key}`).addEventListener("click", () => toggleView("context"));

      // Toggle dark mode for preview area only
      document.getElementById(`darkModeBtn-${key}`).addEventListener("click", () => {
        document.getElementById(`componentContainer-${key}`).classList.toggle("dark");
      });

      // Copy snippet
      document.getElementById(`copyBtn-${key}`).addEventListener("click", () => {
        navigator.clipboard.writeText(component.content.trim()).then(() => {
          document.getElementById("copyFeedback").style.display = "block";
          setTimeout(() => {
            document.getElementById("copyFeedback").style.display = "none";
          }, 2000);
        });
      });

      // Save to local storage
      document.getElementById(`saveBtn-${key}`).addEventListener("click", () => {
        const currentState = createNewBlockType(key, component.title, component.content);
        document.getElementById("copyFeedback").textContent = "Saved to local storage!";
        document.getElementById("copyFeedback").style.display = "block";
        setTimeout(() => {
          document.getElementById("copyFeedback").style.display = "none";
          document.getElementById("copyFeedback").textContent = "Copied to clipboard!";
        }, 2000);

        // Disable the component
        disableComponent(key);
      });

      // Check if the component is already saved in local storage
      const savedState = getStateFromStorage();
      if (savedState && savedState.blocks && savedState.blocks[key]) {
        disableComponent(key);
      }

      // Initial view
      toggleView("preview");

      // Re-initialize Lucide icons
      lucide.createIcons();
    }

    // Function to disable component
    function disableComponent(key) {
      const componentElement = document.getElementById(`component-${key}`);
      componentElement.classList.add("component-disabled");

      // Update the button to show it's been added
      const saveBtn = document.getElementById(`saveBtn-${key}`);
      saveBtn.innerHTML = '<i data-lucide="check" class="text-green-500 w-4 h-4" stroke-width="4"><\/i>';
      saveBtn.disabled = true;

      // Re-initialize Lucide icons for the updated button
      lucide.createIcons();
    }

window.addEventListener("message", function(e) {
if (e.data.type === 'init' || e.data.type === 'toggleDarkMode') {
  applyDarkMode(e.data.darkMode);
}
});

function applyDarkMode(isDarkMode) {
if (isDarkMode) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

localStorage.setItem("darkMode", isDarkMode);

updateStateInStorage(isDarkMode);
}

function getStateFromStorage() {
try {
  const storedState = localStorage.getItem("currentState");
  return storedState ? JSON.parse(storedState) : null;
} catch (error) {
  console.error("Error parsing state from localStorage:", error);
  return null;
}
}

function updateStateInStorage(isDarkMode) {
const currentState = getStateFromStorage();
if (currentState) {
  currentState.darkMode = isDarkMode;
  localStorage.setItem("currentState", JSON.stringify(currentState));
}
}

const initialDarkMode = localStorage.getItem("darkMode") === "true";
applyDarkMode(initialDarkMode);
    // Config Modal
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

    const configBtn = document.getElementById("config-btn");
    const configModal = document.getElementById("config-modal");
    const configTextarea = document.getElementById("config-textarea");
    const saveConfigBtn = document.getElementById("save-config");

    const tailwindConfigSetter = new UniversalDataSetter('config-btn', 'config-modal', 'config-textarea', 'save-config', 'config');
    tailwindConfigSetter.setDefaultValue(defaultConfig);

    function applyTailwindConfig() {
      const config = tailwindConfigSetter.getSavedValue();
      let scriptElement = document.getElementById('tailwind-config');
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'tailwind-config';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = `tailwind.config = ${config};`;
    }

    tailwindConfigSetter.saveButton.addEventListener('click', () => {
      tailwindConfigSetter.saveData();
      applyTailwindConfig();
      location.reload();
    });

    applyTailwindConfig();

    // Initialize Lucide icons
    lucide.createIcons();
  });

  class UniversalDataSetter {
    constructor(buttonId, modalId, textareaId, saveButtonId, key) {
      this.button = document.getElementById(buttonId);
      this.modal = document.getElementById(modalId);
      this.textarea = document.getElementById(textareaId);
      this.saveButton = document.getElementById(saveButtonId);
      this.key = key;
  
      this.initEventListeners();
      this.loadSavedState();
    }
  
    initEventListeners() {
      this.button.addEventListener("click", () => this.openModal());
      this.modal.addEventListener("click", (e) => this.handleModalClick(e));
      this.saveButton.addEventListener("click", () => this.saveData());
    }
  
    openModal() {
      this.modal.classList.remove("hidden");
    }
  
    handleModalClick(e) {
      if (e.target === this.modal) {
        this.modal.classList.add("hidden");
      }
    }
  
    loadSavedState() {
      const currentState = JSON.parse(localStorage.getItem("currentState")) || {};
      this.textarea.value = currentState.sceleton?.[this.key] || "";
    }
  
    saveData() {
      const data = this.textarea.value;
      this.updateLocalStorage(data);
      this.modal.classList.add("hidden");
      return data;
    }
  
    updateLocalStorage(data) {
      let currentState = JSON.parse(localStorage.getItem("currentState")) || {};
      if (!currentState.sceleton) currentState.sceleton = {};
      currentState.sceleton[this.key] = data;
      localStorage.setItem("currentState", JSON.stringify(currentState));
    }
  
    getSavedValue() {
      const currentState = JSON.parse(localStorage.getItem("currentState")) || {};
      return currentState.sceleton?.[this.key] || "";
    }
  
    setDefaultValue(defaultValue) {
      let currentState = JSON.parse(localStorage.getItem("currentState")) || {};
      if (!currentState.sceleton) currentState.sceleton = {};
      if (!currentState.sceleton[this.key]) {
        currentState.sceleton[this.key] = defaultValue;
        localStorage.setItem("currentState", JSON.stringify(currentState));
      }
      this.loadSavedState();
    }
  }