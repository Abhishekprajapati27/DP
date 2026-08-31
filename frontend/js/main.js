// ===================================================
// Main JavaScript - Animations & Swap Motion Slider
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial GSAP Entrance Animations
    if (typeof gsap !== "undefined") {
        gsap.from(".navbar", {
            y: -80,
            duration: 0.8,
            opacity: 0,
            ease: "power2.out"
        });

        gsap.from(".hero h1", {
            y: 40,
            duration: 1,
            opacity: 0,
            delay: 0.2,
            ease: "power3.out"
        });

        gsap.from(".hero-subtitle", {
            y: 30,
            duration: 1,
            opacity: 0,
            delay: 0.35,
            ease: "power3.out"
        });

        gsap.from(".hero-buttons .btn", {
            y: 30,
            duration: 0.8,
            opacity: 0,
            stagger: 0.15,
            delay: 0.5,
            ease: "power2.out"
        });
    }

    // 2. Transformation Gallery Swap Motion Slider
    initTransformationSlider();
});

function initTransformationSlider() {
    const slider = document.getElementById("transformationSlider");
    const track = document.getElementById("sliderTrack");
    const prevBtn = document.getElementById("sliderPrevBtn");
    const nextBtn = document.getElementById("sliderNextBtn");
    const dotsContainer = document.getElementById("sliderDots");

    if (!slider || !track) return;

    let slides = Array.from(track.querySelectorAll(".slide"));
    let currentIndex = 0;
    let autoPlayTimer = null;
    const intervalTime = 3500; // 3.5 seconds swap interval

    // Build Dots
    function buildDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = "";
        slides.forEach((_, idx) => {
            const dot = document.createElement("div");
            dot.className = `dot ${idx === currentIndex ? "active" : ""}`;
            dot.addEventListener("click", () => {
                goToSlide(idx);
                resetAutoPlay();
            });
            dotsContainer.appendChild(dot);
        });
    }

    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll(".dot");
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    function goToSlide(newIndex, direction = "next") {
        if (newIndex === currentIndex || newIndex < 0 || newIndex >= slides.length) return;

        const currentSlide = slides[currentIndex];
        const nextSlide = slides[newIndex];

        // Animate Out current slide
        currentSlide.classList.remove("active");
        currentSlide.classList.add("slide-out");

        setTimeout(() => {
            currentSlide.classList.remove("slide-out");
        }, 700);

        // Animate In next slide
        nextSlide.classList.add("active");

        currentIndex = newIndex;
        updateDots();
    }

    function nextSlide() {
        const nextIdx = (currentIndex + 1) % slides.length;
        goToSlide(nextIdx, "next");
    }

    function prevSlide() {
        const prevIdx = (currentIndex - 1 + slides.length) % slides.length;
        goToSlide(prevIdx, "prev");
    }

    // Button Listeners
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            nextSlide();
            resetAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            prevSlide();
            resetAutoPlay();
        });
    }

    // Auto Play Controls
    function startAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(nextSlide, intervalTime);
    }

    function pauseAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    function resetAutoPlay() {
        pauseAutoPlay();
        startAutoPlay();
    }

    slider.addEventListener("mouseenter", pauseAutoPlay);
    slider.addEventListener("mouseleave", startAutoPlay);

    // Touch Swipe Support for Mobile
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
        pauseAutoPlay();
    }, { passive: true });

    slider.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoPlay();
    }, { passive: true });

    function handleSwipe() {
        if (touchEndX < touchStartX - 40) {
            nextSlide();
        }
        if (touchEndX > touchStartX + 40) {
            prevSlide();
        }
    }

    // Initialize
    buildDots();
    startAutoPlay();

    // Optionally fetch dynamic images from API to append to slider
    fetchDynamicGalleryImages(track, slides, buildDots);
}

async function fetchDynamicGalleryImages(track, slides, onNewSlidesAdded) {
    try {
        const res = await fetch("/api/gallery");
        if (!res.ok) return;
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
            // Append dynamic gallery images that are photos
            data.filter(item => item.media_type === 'image' && item.media_url).forEach(item => {
                const slideDiv = document.createElement("div");
                slideDiv.className = "slide";
                slideDiv.innerHTML = `
                    <img src="${item.media_url}" alt="${item.title || 'Dry Cleaning Result'}">
                    <div class="transformation-badge">
                        <span>✨ ${item.title || 'Verified Clean Result'}</span>
                    </div>
                `;
                track.appendChild(slideDiv);
                slides.push(slideDiv);
            });
            onNewSlidesAdded();
        }
    } catch (e) {
        // Fallback to static slides silently
    }
}