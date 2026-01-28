// Timeline Animations with Performance Optimizations
document.addEventListener('DOMContentLoaded', function() {
    const timeline = document.querySelector('[data-timeline]');
    if (!timeline) return;

    const progressFill = timeline.querySelector('.timeline-progress__fill');
    const nodes = timeline.querySelectorAll('.process-node');

    // Performance optimization: Use Intersection Observer for scroll-triggered animations
    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px',
        threshold: 0.1
    };

    let animatedNodes = new Set();

    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedNodes.has(entry.target)) {
                // Use requestAnimationFrame for smooth animations
                requestAnimationFrame(() => {
                    const step = parseInt(entry.target.dataset.step);

                    // Animate the node
                    entry.target.style.animationPlayState = 'running';
                    animatedNodes.add(entry.target);

                    // Update progress bar based on visible nodes
                    updateProgressBar(step);
                });
            }
        });
    }, observerOptions);

    // Observe each node
    nodes.forEach(node => {
        // Initially pause animations
        node.style.animationPlayState = 'paused';
        node.querySelector('.process-node__connector').style.animationPlayState = 'paused';
        node.querySelector('.process-node__pulse').style.animationPlayState = 'paused';

        timelineObserver.observe(node);
    });

    // Update progress bar height based on visible nodes
    function updateProgressBar(step) {
        const totalSteps = nodes.length;
        const progressPercentage = (step / totalSteps) * 100;

        // Use CSS transforms for better performance (GPU acceleration)
        progressFill.style.height = `${progressPercentage}%`;
    }

    // Add hover interactions with debouncing for performance
    let hoverTimeout;
    nodes.forEach(node => {
        node.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                // Pause pulse animation on hover
                const pulse = this.querySelector('.process-node__pulse');
                if (pulse) {
                    pulse.style.animationPlayState = 'paused';
                }
            }, 50);
        });

        node.addEventListener('mouseleave', function() {
            clearTimeout(hoverTimeout);
            // Resume pulse animation
            const pulse = this.querySelector('.process-node__pulse');
            if (pulse && animatedNodes.has(this)) {
                pulse.style.animationPlayState = 'running';
            }
        });
    });

    // Optional: Add click interaction to expand node details
    nodes.forEach(node => {
        const content = node.querySelector('.process-node__content');

        node.addEventListener('click', function(e) {
            // Prevent event bubbling
            e.stopPropagation();

            // Toggle active state
            this.classList.toggle('process-node--active');

            // Smooth transition for content expansion
            if (this.classList.contains('process-node--active')) {
                content.style.transform = 'translateX(15px) scale(1.02)';
            } else {
                content.style.transform = '';
            }
        });
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        timelineObserver.disconnect();
    });
});

// Performance monitoring (optional, remove in production)
if (window.performance && performance.mark) {
    performance.mark('recruitment-timeline-loaded');
}