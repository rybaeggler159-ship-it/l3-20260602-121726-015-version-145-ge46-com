(() => {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            nav.classList.toggle('is-open');
            navToggle.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;
        const show = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
        };
        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => show(index + 1), 5200);
        };
        dots.forEach((dot, i) => dot.addEventListener('click', () => {
            show(i);
            start();
        }));
        if (prev) {
            prev.addEventListener('click', () => {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', () => {
                show(index + 1);
                start();
            });
        }
        start();
    }

    document.querySelectorAll('[data-filter-root]').forEach((root) => {
        const section = root.closest('.section') || document;
        const cards = Array.from(section.querySelectorAll('[data-card]'));
        const search = root.querySelector('[data-search-input]');
        const year = root.querySelector('[data-year-filter]');
        const apply = () => {
            const q = search ? search.value.trim().toLowerCase() : '';
            const y = year ? year.value : '';
            cards.forEach((card) => {
                const haystack = `${card.dataset.title || ''} ${card.dataset.genre || ''} ${card.dataset.region || ''} ${card.dataset.type || ''} ${card.dataset.year || ''}`.toLowerCase();
                const cardYear = Number(card.dataset.year || 0);
                const matchSearch = !q || haystack.includes(q);
                const matchYear = !y || (y === 'older' ? cardYear < 2022 : String(cardYear) === y);
                card.hidden = !(matchSearch && matchYear);
            });
        };
        if (search) {
            search.addEventListener('input', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
    });
})();
