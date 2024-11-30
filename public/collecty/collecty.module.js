import { CONFIG } from './collecty.config.js';

export class SectionCollecty {
    constructor() {
        this.isActive = false;
        this.sections = [];
        this.storedSections = this.getStoredSections();
        this.boundSections = new Set();
        this.boundButtons = new Set();
        this.headingCounts = new Map(); // To track the count of identical sections
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.initializeNavbarButton = this.initializeNavbarButton.bind(this);
        this.cleanupNavbarButton = this.cleanupNavbarButton.bind(this);
        
        // Automatically initialize on creation
        this.initialize();
    }

    initialize() {
        console.log('Initializing SectionCollecty');
        this.isActive = true;
        
        // Initialize navbar button first
        const navbarEnd = document.querySelector('[data-navbar-end]');
        if (navbarEnd) {
            this.initializeNavbarButton(navbarEnd);
        }
        
        // Observe DOM changes
        this.observeDOM();
        
        // Initialize existing sections
        this.initializeSections();
    }

    observeDOM() {
        if (this.domObserver) {
            this.domObserver.disconnect();
        }

        this.domObserver = new MutationObserver((mutations) => {
            let needsReinitialization = false;

            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Проверяем секции
                        if (node.nodeName === 'SECTION' || node.querySelector('section')) {
                            needsReinitialization = true;
                        }
                        // Проверяем навбар
                        const navbarEnd = node.querySelector('[data-navbar-end]') || 
                                        (node.matches('[data-navbar-end]') ? node : null);
                        if (navbarEnd) {
                            this.initializeNavbarButton(navbarEnd);
                        }
                    }
                });

                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.nodeName === 'SECTION' || node.querySelector('section')) {
                            this.cleanupSection(node);
                        }
                        if (node.querySelector('[data-buildy-button]')) {
                            this.cleanupNavbarButton(node);
                        }
                    }
                });
            });

            if (needsReinitialization) {
                this.initializeSections();
            }
        });

        this.domObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    initializeSections() {
        Array.from(document.getElementsByTagName('section')).forEach(async section => {
            await this.initializeSection(section);
        });
    }

    async initializeSection(section) {
        if (this.boundSections.has(section)) return;

        if (!section.dataset.sectionId) {
            section.dataset.sectionId = this.generateSectionId(section);
        }
        
        const isStored = await this.checkIfStored(section);
        
        section.style.opacity = isStored ? CONFIG.styles.section.inactiveOpacity : CONFIG.styles.section.activeOpacity;
        
        if (!isStored) {
            section.addEventListener('mouseenter', this.handleMouseEnter);
            section.addEventListener('mouseleave', this.handleMouseLeave);
            section.addEventListener('click', this.handleMouseEnter);
        }
        
        this.boundSections.add(section);
    }

    cleanupSection(section) {
        if (!this.boundSections.has(section)) return;
        
        section.removeEventListener('mouseenter', this.handleMouseEnter);
        section.removeEventListener('mouseleave', this.handleMouseLeave);
        section.removeEventListener('click', this.handleMouseEnter);
        
        this.boundSections.delete(section);
    }

    // If necessary, you can add a destroy method
    destroy() {
        this.domObserver?.disconnect();
        this.boundSections.forEach(section => {
            this.cleanupSection(section);
        });
        this.boundButtons.forEach(button => {
            this.cleanupNavbarButton(button);
        });
        this.boundSections.clear();
        this.boundButtons.clear();
        localStorage.removeItem(CONFIG.collectyState);
    }

    async createFloatingMenu(section) {
        const menu = document.createElement('div');
        menu.className = 'section-collecty-menu ' + CONFIG.styles.menu.wrapper;
        Object.assign(menu.style, {
            top: CONFIG.styles.menu.position.top,
            right: CONFIG.styles.menu.position.right
        });

        const isStored = await this.checkIfStored(section);
        const button = document.createElement('button');
        button.className = CONFIG.styles.menu.button;
        
        if (isStored) {
            button.innerHTML = `
                Saved 
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>
            `;
            button.disabled = true;
        } else {
            button.innerHTML = `
                Save Block
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/></svg>
            `;
            button.addEventListener('click', () => this.saveToStorage(section));
        }
        
        menu.appendChild(button);
        return menu;
    }

    async handleMouseEnter(event) {
        if (event.type === 'click' && event.target !== event.currentTarget) {
            return;
        }

        const section = event.currentTarget;
        const isStored = await this.checkIfStored(section);
        
        if (isStored) {
            section.style.opacity = CONFIG.styles.section.inactiveOpacity;
            return;
        }
        
        section.classList.add(CONFIG.styles.section.highlight);
        const menu = await this.createFloatingMenu(section);
        section.appendChild(menu);
    }

    handleMouseLeave(event) {
        const section = event.target;
        section.classList.remove(CONFIG.styles.section.highlight);
        
        const menu = section.querySelector('.section-collecty-menu');
        if (menu) menu.remove();
    }

    async saveToStorage(section) {
        const sectionId = section.dataset.sectionId;
        const heading = section.querySelector('h1, h2, h3')?.textContent.trim() || 'Untitled Section';
        
        // Remove all menus from the section
        section.querySelectorAll('.section-collecty-menu').forEach(menu => menu.remove());
        
        // Create a clone of the section
        const cleanSection = section.cloneNode(true);
        
        // Clean up styles and service attributes
        cleanSection.style.removeProperty('background-color');
        cleanSection.style.removeProperty('opacity');
        cleanSection.classList.remove(CONFIG.styles.section.highlight);
        this.cleanNode(cleanSection);
        
        let currentState = this.getStoredSections();
        
        if (!currentState.blocks) {
            currentState = {
                blocks: {},
                layout: [],
                sceleton: {
                    lang: "en",
                    title: "My Website",
                    description: "Welcome to my website",
                    headSnippet: "",
                    bodyStartSnippet: "",
                    bodyClasses: "font-sans bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100",
                    config: "{}"
                }
            };
        }

        currentState.blocks[sectionId] = {
            id: sectionId,
            title: heading,
            content: cleanSection.outerHTML
        };

        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(currentState));
            console.log('Successfully saved section:', sectionId);
            section.style.opacity = CONFIG.styles.section.inactiveOpacity;
            
            // Disable event handlers
            this.cleanupSection(section);
            
            // Update the menu to show saved state
            const menu = await this.createFloatingMenu(section);
            if (menu) section.appendChild(menu);
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }

    getStoredSections() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{"blocks":{},"layout":[],"sceleton":{}}');
        } catch (e) {
            console.error('Error parsing stored sections:', e);
            return {
                blocks: {},
                layout: [],
                sceleton: {}
            };
        }
    }

    async checkIfStored(section) {
        const sectionId = section.dataset.sectionId;
        if (!sectionId) return false;
        
        const stored = this.getStoredSections();
        const isStored = Boolean(stored.blocks && stored.blocks[sectionId]);
        
        if (isStored) {
            section.style.opacity = CONFIG.styles.section.inactiveOpacity;
            this.cleanupSection(section);
        }
        
        return isStored;
    }

    cleanNode(node) {
        if (!node) return;
        
        if (node.nodeType === 1) { // If it's an element
            Array.from(node.attributes).forEach(attr => {
                // Save only necessary attributes
                if (attr.name.startsWith('data-v-') || 
                    (attr.name.startsWith('data-') && attr.name !== 'data-section-id') ||
                    attr.name.startsWith('v-') ||
                    attr.name === 'style' ||
                    attr.name === 'class' && (
                        attr.value.includes('section-collecty') ||
                        attr.value.includes(CONFIG.styles.section.highlight)
                    )) {
                    node.removeAttribute(attr.name);
                }
            });
            
            // Recursively process child elements
            Array.from(node.children).forEach(child => this.cleanNode(child));
        }
    }

    generateSectionId(section) {
        // Get the base key from the heading or first paragraph
        let baseKey = section.querySelector('h1, h2, h3')?.textContent.trim() || 
                     section.querySelector('p')?.textContent.trim()?.slice(0, 30) || 
                     'section';
        
        // Normalize the key
        baseKey = baseKey.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        
        // Get and increase the counter for this key
        const count = this.headingCounts.get(baseKey) || 0;
        this.headingCounts.set(baseKey, count + 1);
        
        // Form the final ID
        return count > 0 ? `${baseKey}_${count}` : baseKey;
    }

    // Generate a hash based on the section content
    async generateContentHash(content) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    initializeNavbarButton(navbarEnd) {
        if (!navbarEnd || this.boundButtons.has(navbarEnd)) return;

        const button = document.createElement('button');
        button.setAttribute('data-buildy-button', '');
        button.className = 'inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary bg-primary/20 hover:bg-accent hover:text-accent-foreground h-9 w-9';
        button.title = 'Go to BuildY';
        
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-puzzle">
                <path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>
            </svg>
        `;

        button.addEventListener('click', () => {
            window.location.href = '/buildy';
        });

        const darkModeButton = navbarEnd.querySelector('[data-dark-mode]');
        if (darkModeButton) {
            darkModeButton.parentNode.insertBefore(button, darkModeButton);
            this.boundButtons.add(navbarEnd);
        }
    }

    cleanupNavbarButton(node) {
        this.boundButtons.delete(node);
    }
}

export default SectionCollecty;