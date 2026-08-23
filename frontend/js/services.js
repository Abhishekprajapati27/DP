document.addEventListener('DOMContentLoaded', () => {
    // Guard: if GSAP fails to load for any reason, don't break the page
    if (typeof window.gsap === 'undefined' || !window.gsap) return;

    const cards = document.querySelectorAll('.service-card');
    const heroH1 = document.querySelector('.hero h1');
    const heroP = document.querySelector('.hero p');

    // Animate only if the elements exist
    if (heroH1) {
        gsap.from(heroH1, {
            y: 80,
            opacity: 0,
            duration: 1
        });
    }

    if (heroP) {
        gsap.from(heroP, {
            y: 80,
            opacity: 0,
            duration: 1.3
        });
    }

    if (cards.length) {
        // Ensure cards are visible immediately (prevents “only first cards show” problems)
        gsap.set(cards, { opacity: 1, y: 0 });

        gsap.from(cards, {
            opacity: 0,
            y: 100,
            duration: 1,
            stagger: 0.2
        });


        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    scale: 1.02,
                    duration: 0.3
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    scale: 1,
                    duration: 0.3
                });
            });
        });
    }
});

