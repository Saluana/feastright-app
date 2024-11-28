import { SectionCollecty } from './collecty.module.js';

// Функция для проверки URL параметров
function shouldAutoStart() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('lets') && urlParams.get('lets') === 'go';
}

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    let collecty = null;
    
    // Автоматический запуск по URL параметру
    if (shouldAutoStart()) {
        console.log('Auto-starting Collecty via URL parameter');
        collecty = new SectionCollecty();
        return;
    }
    
    // Используем IntersectionObserver вместо MutationObserver для лучшей производительности
    const startButtonObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const getStartedBtn = entry.target;
                console.log('Button found!');
                
                getStartedBtn.addEventListener('click', () => {
                    console.log('Button clicked!');
                    if (!collecty) {
                        collecty = new SectionCollecty();
                    }
                });
                
                startButtonObserver.disconnect();
            }
        });
    });

    // Начинаем наблюдение когда кнопка появится
    const checkButton = () => {
        const getStartedBtn = document.getElementById('getStarted');
        if (getStartedBtn) {
            startButtonObserver.observe(getStartedBtn);
        } else {
            // Если кнопка еще не появилась, пробуем снова через requestAnimationFrame
            requestAnimationFrame(checkButton);
        }
    };

    checkButton();
}); 