(function () {
    'use strict';

    // --- Ecosystem page external links (single source of truth) ---
    // Update URLs here — do not hardcode them elsewhere in the page.
    var ECOSYSTEM_LINKS = {
        community: 'https://t.me/eloratechinstitute',
        // Not live yet: set this once the ETI documentation Google Drive
        // folder exists, then re-run initEcosystemLinks (or reload).
        documentation: 'https://drive.google.com/drive/folders/1a1MxFSQQhHxj6E6ur1deg09lZVHtX9bU?usp=sharing'
    };

    // --- DOM refs ---
    const header = document.getElementById('siteHeader');
    const navLinks = document.getElementById('navLinks');
    const mobileToggle = document.getElementById('mobileToggle');
    const pages = document.querySelectorAll('.page-section');
    const navAnchors = document.querySelectorAll('[data-page]');
    const contactForm = document.getElementById('contactForm');

    // --- Page navigation ---
    function navigateTo(pageId) {
        // Hide all pages
        pages.forEach(p => p.classList.remove('active'));

        // Show target
        const target = document.getElementById('page-' + pageId);
        if (target) target.classList.add('active');

        // Update nav active state
        navAnchors.forEach(a => {
            a.classList.toggle('active', a.dataset.page === pageId);
        });

        // Close mobile menu
        navLinks.classList.remove('open');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Nav click handler ---
    navAnchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) navigateTo(page);
            // Update URL hash
            if (page) window.location.hash = '#' + page;
        });
    });

    // --- Mobile toggle ---
    mobileToggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
        const icon = this.querySelector('i');
        if (navLinks.classList.contains('open')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // --- Header scroll effect ---
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Toast system ---
    const toastContainer = document.getElementById('toastContainer');

    function showToast(message, type = 'info', duration = 4500) {
        if (!toastContainer) return;

        const types = {
            success: { icon: 'fa-check-circle', label: 'Success' },
            error: { icon: 'fa-exclamation-circle', label: 'Error' },
            info: { icon: 'fa-info-circle', label: 'Info' }
        };

        const config = types[type] || types.info;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${config.icon}"></i></div>
        <div class="toast-content">
            <strong>${config.label}</strong>
            <p>${message}</p>
        </div>
        <button class="toast-close" aria-label="Close"><i class="fas fa-times"></i></button>
    `;

        // Auto-remove after duration
        toastContainer.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', function () {
            toast.remove();
        });

        // Auto dismiss
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, duration);
    }

    // --- Contact form handler with proper error handling ---
    // --- Contact form handler with backend API ---
    if (contactForm) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Gather fields
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const subject = document.getElementById('contactSubject').value;
            const message = document.getElementById('contactMessage').value.trim();

            // --- Validation ---
            if (!name) {
                showToast('Please enter your full name.', 'error');
                document.getElementById('contactName').focus();
                return;
            }
            if (!email) {
                showToast('Please enter your email address.', 'error');
                document.getElementById('contactEmail').focus();
                return;
            }
            if (!email.includes('@') || !email.includes('.')) {
                showToast('Please enter a valid email address (e.g., name@domain.com).', 'error');
                document.getElementById('contactEmail').focus();
                return;
            }
            if (!message) {
                showToast('Please write a message.', 'error');
                document.getElementById('contactMessage').focus();
                return;
            }

            // --- Show loading state ---
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            }

            try {
                // --- Send to backend API ---
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, subject, message }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send message.');
                }

                // --- Success ---
                showToast(
                    `Thank you, ${name}! We've received your message and will respond within 24 hours.`,
                    'success'
                );
                contactForm.reset();

            } catch (err) {
                // --- Error ---
                showToast(
                    err.message || 'Something went wrong. Please try again later.',
                    'error'
                );
            } finally {
                // --- Reset button state ---
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    // --- Handle initial page from URL hash ---
    function initFromHash() {
        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById('page-' + hash)) {
            navigateTo(hash);
        } else {
            navigateTo('home');
        }
    }

    // --- Hash change ---
    window.addEventListener('hashchange', function () {
        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById('page-' + hash)) {
            navigateTo(hash);
        }
    });

    // --- Wire up Ecosystem page links from ECOSYSTEM_LINKS ---
    function initEcosystemLinks() {
        var communityLink = document.getElementById('ecosystemCommunityLink');
        if (communityLink && ECOSYSTEM_LINKS.community) {
            communityLink.href = ECOSYSTEM_LINKS.community;
        }

        // Documentation has no real destination yet — leave the card as a
        // plain, non-clickable div (its current behavior) until
        // ECOSYSTEM_LINKS.documentation is set above.
        var docCard = document.getElementById('ecosystemDocumentationLink');
        if (docCard && ECOSYSTEM_LINKS.documentation) {
            var docLink = document.createElement('a');
            docLink.id = docCard.id;
            docLink.className = docCard.className;
            docLink.href = ECOSYSTEM_LINKS.documentation;
            docLink.target = '_blank';
            docLink.rel = 'noopener noreferrer';
            docLink.innerHTML = docCard.innerHTML;
            docCard.replaceWith(docLink);
        }
    }

    // --- Init ---
    initFromHash();
    initEcosystemLinks();

    // --- Logo click goes home ---
    document.querySelectorAll('.logo').forEach(logo => {
        logo.addEventListener('click', function (e) {
            e.preventDefault();
            navigateTo('home');
            window.location.hash = '#home';
        });
    });

    // --- Close mobile menu on outside click ---
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.header-inner')) {
            navLinks.classList.remove('open');
            const icon = mobileToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        }
    });

})();
