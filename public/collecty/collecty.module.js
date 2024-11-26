import { CONFIG } from './collecty.config.js';

export class SectionCollecty {
    constructor() {
        this.isActive = false;
        this.sections = [];
        this.storedSections = this.getStoredSections();
        this.boundSections = new Set();
        this.headingCounts = new Map(); // To track the count of identical sections
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        
        // Automatically initialize on creation
        this.initialize();
    }

    initialize() {
        console.log('Initializing SectionCollecty');
        this.isActive = true;
        
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
                // Check added nodes
                mutation.addedNodes.forEach(node => {
                    // Check if the node is an element
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.nodeName === 'SECTION' || node.querySelector('section')) {
                            needsReinitialization = true;
                        }
                    }
                });

                // Check removed nodes
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.nodeName === 'SECTION' || node.querySelector('section')) {
                            this.cleanupSection(node);
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

        // Generate ID if it doesn't exist
        if (!section.dataset.sectionId) {
            section.dataset.sectionId = this.generateSectionId(section);
        }
        
        const isStored = await this.checkIfStored(section);
        section.style.opacity = isStored ? 
            CONFIG.styles.section.inactiveOpacity : 
            CONFIG.styles.section.activeOpacity;
        
        section.addEventListener('mouseenter', this.handleMouseEnter);
        section.addEventListener('mouseleave', this.handleMouseLeave);
        section.addEventListener('click', this.handleMouseEnter);
        
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
        this.boundSections.clear();
    }

    createFloatingMenu(section) {
        const menu = document.createElement('div');
        menu.className = 'section-collecty-menu ' + CONFIG.styles.menu.wrapper;
        Object.assign(menu.style, {
            top: CONFIG.styles.menu.position.top,
            right: CONFIG.styles.menu.position.right
        });

        const htmlBtn = this.createButton('HTML', () => this.saveAsHtml(section), 
            CONFIG.styles.menu.buttons.base + ' ' + CONFIG.styles.menu.buttons.html
        );
        
        const saveBtn = this.createButton('Save', () => this.saveToStorage(section),
            CONFIG.styles.menu.buttons.base + ' ' + CONFIG.styles.menu.buttons.save
        );
        
        menu.appendChild(htmlBtn);
        menu.appendChild(saveBtn);
        
        return menu;
    }

    createButton(text, onClick, className) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        button.addEventListener('click', onClick);
        return button;
    }

    async handleMouseEnter(event) {
        // Check if the click was on the section, not on nested elements
        if (event.type === 'click' && event.target !== event.currentTarget) {
            return;
        }

        const section = event.currentTarget;
        if (await this.checkIfStored(section)) return;
        
        section.classList.add(CONFIG.styles.section.highlight);
        section.appendChild(this.createFloatingMenu(section));
    }

    handleMouseLeave(event) {
        const section = event.target;
        section.classList.remove(CONFIG.styles.section.highlight);
        
        const menu = section.querySelector('.section-collecty-menu');
        if (menu) menu.remove();
    }

    saveAsHtml(section) {
        const cleanSection = section.cloneNode(true);
        this.cleanNode(cleanSection);
        
        const sectionId = section.dataset.sectionId;
        const heading = cleanSection.querySelector('h1, h2, h3')?.textContent.trim() || 'section';
        const fileName = `section-${heading}-${sectionId}.html`;
        
        const formattedHtml = this.formatHtml(cleanSection.outerHTML);
        const blob = new Blob([formattedHtml], { type: 'text/html' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    }

    async saveToStorage(section) {
        const sectionId = section.dataset.sectionId;
        const heading = section.querySelector('h1, h2, h3')?.textContent.trim() || 'Untitled Section';
        
        // First, remove all menus from the section
        section.querySelectorAll('.section-collecty-menu').forEach(menu => menu.remove());
        
        // Create a clone of the already cleaned section
        const cleanSection = section.cloneNode(true);
        
        // Clean up styles added by the collecty
        cleanSection.style.removeProperty('background-color');
        cleanSection.style.removeProperty('opacity');
        cleanSection.classList.remove(CONFIG.styles.section.highlight);
        
        // Clean up service attributes
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

        // Save only the cleaned HTML
        currentState.blocks[sectionId] = {
            id: sectionId,
            title: heading,
            content: this.formatHtml(cleanSection.outerHTML)
        };

        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(currentState));
            console.log('Successfully saved section:', sectionId);
            section.style.opacity = CONFIG.styles.section.inactiveOpacity;
            
            // Disable event handlers
            this.cleanupSection(section);
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
        return stored.blocks && stored.blocks[sectionId];
    }

    // Add a method for formatting HTML
    formatHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html.trim();
        
        // Clean up service attributes
        this.cleanNode(div.firstElementChild);
        
        // First, minify HTML
        const minified = this.minifyHtml(div.innerHTML);
        
        // Then, pretty print
        return this.prettyPrint(minified);
    }

    minifyHtml(html) {
        return html
            .replace(/\s+/g, ' ') // Replace multiple spaces with one
            .replace(/>\s+</g, '><') // Remove spaces between tags
            .replace(/\s+>/g, '>') // Remove spaces before closing bracket
            .replace(/<\s+/g, '<') // Remove spaces after opening bracket
            .replace(/\s+\/>/g, '/>') // Remove spaces before self-closing tag
            .replace(/"\s+/g, '"') // Remove spaces after quotes
            .replace(/\s+"/g, '"') // Remove spaces before quotes
            .replace(/\s+([\w-]+)=/g, ' $1=') // Leave one space before attributes
            .trim();
    }

    prettyPrint(html) {
        let formatted = '';
        let indent = 0;
        
        // Split HTML into tags and text
        const tokens = html.split(/(<\/?[^>]+>)/g);
        
        tokens.forEach(token => {
            if (!token.trim()) return;
            
            // Decrease indent for closing tags
            if (token.startsWith('</')) {
                indent -= CONFIG.formatting.indentSize;
            }
            
            // Add indent
            const indentString = ' '.repeat(Math.max(0, indent));
            formatted += indentString + token.trim() + '\n';
            
            // Increase indent for opening tags
            if (token.startsWith('<') && 
                !token.startsWith('</') && 
                !token.endsWith('/>') && 
                !token.includes('</')) {
                indent += CONFIG.formatting.indentSize;
            }
        });
        
        return formatted;
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
}

export default SectionCollecty;