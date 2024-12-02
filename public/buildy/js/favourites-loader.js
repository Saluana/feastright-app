// favourites-loader.js
(async function() {
    const FAVOURITES_KEY = 'uiblocksFavourites';
    const CURRENT_STATE_KEY = 'currentState';
    const GET_BLOCKS_BTN_ID = 'getBlocksBtn';
    const HIDDEN_BTN_ID = 'letsGoBtn';
    
    // Утилиты для работы с хранилищем
    const storage = {
        getFavourites() {
            try {
                return JSON.parse(localStorage.getItem(FAVOURITES_KEY) || '[]');
            } catch (e) {
                console.error('Error parsing favourites:', e);
                return [];
            }
        },
        
        getCurrentState() {
            try {
                return JSON.parse(localStorage.getItem(CURRENT_STATE_KEY) || '{"blocks":{}}');
            } catch (e) {
                console.error('Error parsing current state:', e);
                return { blocks: {} };
            }
        }
    };

    // Проверка наличия новых блоков и управление видимостью кнопок
    function checkNewBlocks() {
        const favourites = storage.getFavourites();
        const currentState = storage.getCurrentState();
        
        // Считаем количество неимпортированных блоков
        const newBlocksCount = favourites.filter(id => !currentState.blocks[id]).length;
        
        // Управляем видимостью кнопок через классы
        const getBlocksBtn = document.getElementById(GET_BLOCKS_BTN_ID);
        const hiddenBtn = document.getElementById(HIDDEN_BTN_ID);
        
        console.log('New blocks count:', newBlocksCount);
        
        if (newBlocksCount > 0) {
            console.log('Showing Get UI Blocks button');
            // Показываем кнопку импорта и скрываем Let's Go
            getBlocksBtn?.classList.remove('hidden');
            hiddenBtn?.classList.add('hidden');
            
            // Добавляем обработчик только если его еще нет
            if (!getBlocksBtn.hasAttribute('data-handler-attached')) {
                getBlocksBtn.setAttribute('data-handler-attached', 'true');
                getBlocksBtn.addEventListener('click', async () => {
                    getBlocksBtn.disabled = true;
                    try {
                        await processBlocks();
                        window.location.reload();
                    } catch (e) {
                        console.error('Error processing blocks:', e);
                        getBlocksBtn.disabled = false;
                    }
                });
            }
        } else {
            console.log('Showing Let\'s Go button');
            // Скрываем кнопку импорта и показываем Let's Go
            getBlocksBtn?.classList.add('hidden');
            hiddenBtn?.classList.remove('hidden');
        }
    }

    // Основной процесс импорта
    async function processBlocks() {
        const favourites = storage.getFavourites();
        const currentState = storage.getCurrentState();

        for (const fullId of favourites) {
            if (currentState.blocks[fullId]) continue;

            const { url, id } = parseBlockId(fullId);
            const pageData = await loadPageData(url);

            if (!pageData?.blocks) {
                console.warn(`No blocks found for ${url}`);
                continue;
            }

            const matchingBlock = Object.values(pageData.blocks)
                .find(block => block.id.startsWith(id.split('_')[0]));

            if (matchingBlock) {
                currentState.blocks[fullId] = {
                    id: fullId,
                    title: matchingBlock.title,
                    content: matchingBlock.content
                };
            }
        }

        localStorage.setItem(CURRENT_STATE_KEY, JSON.stringify(currentState));
    }

    // Вспомогательные функции
    function parseBlockId(fullId) {
        const [url, , ...rest] = fullId.split('_');
        const id = rest.slice(0, -1).join('_');
        return { url, id };
    }

    async function loadPageData(url) {
        try {
            const response = await fetch(`/api/pages/${url}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.error(`Error loading page ${url}:`, e);
            return null;
        }
    }

    // Запускаем проверку когда DOM загружен
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkNewBlocks);
    } else {
        checkNewBlocks();
    }
})();