import { CONFIG } from './buildy.config.js';

export class SectionCollector {
    constructor() {
        this.isActive = false;
        this.sections = [];
        this.storedSections = this.getStoredSections();
        this.boundSections = new Set();
        this.headingCounts = new Map(); // Для отслеживания количества одинаковых секций
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // Автоматически инициализируем при создании
        this.initialize();
    }

    initialize() {
        console.log('Initializing SectionCollector');
        this.isActive = true;
        
        // Наблюдае за изменениями в DOM
        this.observeDOM();
        
        // Инициализируем существующие секции
        this.initializeSections();
    }

    observeDOM() {
        if (this.domObserver) {
            this.domObserver.disconnect();
        }

        this.domObserver = new MutationObserver((mutations) => {
            let needsReinitialization = false;

            mutations.forEach((mutation) => {
                // Проверяем добавленные узлы
                mutation.addedNodes.forEach(node => {
                    // Проверяем, является ли узел элементом
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.nodeName === 'SECTION' || node.querySelector('section')) {
                            needsReinitialization = true;
                        }
                    }
                });

                // Проверяем удаленные узлы
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

        // Генерируем ID, если его еще нет
        if (!section.dataset.sectionId) {
            section.dataset.sectionId = this.generateSectionId(section);
        }
        
        const isStored = await this.checkIfStored(section);
        section.style.opacity = isStored ? 
            CONFIG.styles.section.inactiveOpacity : 
            CONFIG.styles.section.activeOpacity;
        
        section.addEventListener('mouseenter', this.handleMouseEnter);
        section.addEventListener('mouseleave', this.handleMouseLeave);
        section.addEventListener('touchstart', this.handleTouchStart);
        section.addEventListener('touchend', this.handleTouchEnd);
        section.addEventListener('touchcancel', this.handleTouchEnd);
        
        this.boundSections.add(section);
    }

    cleanupSection(section) {
        if (!this.boundSections.has(section)) return;
        
        section.removeEventListener('mouseenter', this.handleMouseEnter);
        section.removeEventListener('mouseleave', this.handleMouseLeave);
        section.removeEventListener('touchstart', this.handleTouchStart);
        section.removeEventListener('touchend', this.handleTouchEnd);
        section.removeEventListener('touchcancel', this.handleTouchEnd);
        
        this.boundSections.delete(section);
    }

    // При необходимости можно добавить метод destroy
    destroy() {
        this.domObserver?.disconnect();
        this.boundSections.forEach(section => {
            this.cleanupSection(section);
        });
        this.boundSections.clear();
    }

    createFloatingMenu(section) {
        const menu = document.createElement('div');
        menu.className = 'section-collector-menu ' + CONFIG.styles.menu.wrapper;
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
        const section = event.target;
        if (await this.checkIfStored(section)) return;
        
        section.classList.add(CONFIG.styles.section.highlight);
        section.appendChild(this.createFloatingMenu(section));
    }

    handleMouseLeave(event) {
        const section = event.target;
        section.classList.remove(CONFIG.styles.section.highlight);
        
        const menu = section.querySelector('.section-collector-menu');
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
        
        // Создаем клон секции для очистки
        const cleanSection = section.cloneNode(true);
        
        // Удаляем интерфейс коллектора
        const menu = cleanSection.querySelector('.section-collector-menu');
        if (menu) menu.remove();
        
        // Очищаем стили, добавленные коллектором
        cleanSection.style.removeProperty('background-color');
        cleanSection.style.removeProperty('opacity');
        cleanSection.classList.remove(CONFIG.styles.section.highlight);
        
        // Очищаем от служебных атрибутов
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

        // Сохраняем только очищенный HTML
        currentState.blocks[sectionId] = {
            id: sectionId,
            title: heading,
            content: this.formatHtml(cleanSection.outerHTML)
        };

        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(currentState));
            console.log('Successfully saved section:', sectionId);
            section.style.opacity = CONFIG.styles.section.inactiveOpacity;
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

    // Добавим метод для форматирования HTML
    formatHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html.trim();
        
        // Очищаем от служебных атрибутов
        this.cleanNode(div.firstElementChild);
        
        // Сначала минифицируем HTML
        const minified = this.minifyHtml(div.innerHTML);
        
        // Затем форматируем
        return this.prettyPrint(minified);
    }

    minifyHtml(html) {
        return html
            .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
            .replace(/>\s+</g, '><') // Убираем пробелы между тегами
            .replace(/\s+>/g, '>') // Убираем пробелы перед закрывающей скобкой
            .replace(/<\s+/g, '<') // Убираем пробелы после открывающей скобки
            .replace(/\s+\/>/g, '/>') // Убираем пробелы перед самозакрывающимся тегом
            .replace(/"\s+/g, '"') // Убираем пробелы после кавычек
            .replace(/\s+"/g, '"') // Убираем пробелы перед кавычками
            .replace(/\s+([\w-]+)=/g, ' $1=') // Оставляем один пробел перед атрибутами
            .trim();
    }

    prettyPrint(html) {
        let formatted = '';
        let indent = 0;
        
        // Разбиваем HTML на теги и текст
        const tokens = html.split(/(<\/?[^>]+>)/g);
        
        tokens.forEach(token => {
            if (!token.trim()) return;
            
            // Уменьшаем отступ для закрывающих тегов
            if (token.startsWith('</')) {
                indent -= CONFIG.formatting.indentSize;
            }
            
            // Добавляем отступ
            const indentString = ' '.repeat(Math.max(0, indent));
            formatted += indentString + token.trim() + '\n';
            
            // Увеличиваем отступ для открывающих тегов
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
        
        if (node.nodeType === 1) { // Если это элемент
            Array.from(node.attributes).forEach(attr => {
                // Сохраняем только необходимые атрибуты
                if (attr.name.startsWith('data-v-') || 
                    (attr.name.startsWith('data-') && attr.name !== 'data-section-id') ||
                    attr.name.startsWith('v-') ||
                    attr.name === 'style' ||
                    attr.name === 'class' && (
                        attr.value.includes('section-collector') ||
                        attr.value.includes(CONFIG.styles.section.highlight)
                    )) {
                    node.removeAttribute(attr.name);
                }
            });
            
            // Рекурсивно обрабатываем дочерние элементы
            Array.from(node.children).forEach(child => this.cleanNode(child));
        }
    }

    generateSectionId(section) {
        // Получаем базовый ключ из заголовка или первого параграфа
        let baseKey = section.querySelector('h1, h2, h3')?.textContent.trim() || 
                     section.querySelector('p')?.textContent.trim()?.slice(0, 30) || 
                     'section';
        
        // Нормализуем ключ
        baseKey = baseKey.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        
        // Получаем и увеличиваем счетчик для этого ключа
        const count = this.headingCounts.get(baseKey) || 0;
        this.headingCounts.set(baseKey, count + 1);
        
        // Формируем финальный ID
        return count > 0 ? `${baseKey}_${count}` : baseKey;
    }

    // Генерируем хеш на основе контента секции
    async generateContentHash(content) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    handleTouchStart(event) {
        event.preventDefault();
        this.handleMouseEnter(event);
    }

    handleTouchEnd(event) {
        event.preventDefault();
        this.handleMouseLeave(event);
    }
}

export default SectionCollector;