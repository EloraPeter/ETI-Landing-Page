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

        // --- SEO updates for Courses page ---
        if (pageId === 'courses') {
            document.title = 'Courses & Programs | Elora Tech Institute';
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', 'Explore practical, career-focused technology courses and programs from Elora Tech Institute.');
            }
        } else {
            // For other pages, restore default meta if needed (optional)
            // The static meta in index.html will be used.
        }
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

    // ================================================================
    //  COURSE CATALOGUE – NEW FUNCTIONALITY
    // ================================================================

    // --- Course Data (verified from repository) ---
    // Only fields present: id, title, description, duration, format, badge, tags, category
    const COURSES_DATA = [
        {
            id: 'web-dev',
            title: 'Web Development',
            description: 'Build production-ready web applications using React, Next.js, APIs, databases, deployment, and SEO.',
            duration: '10 weeks',
            format: 'Hybrid',
            badge: 'Full‑stack',
            tags: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'TypeScript', 'Cloud'],
            category: 'web-dev'
        },
        {
            id: 'web-dev-ai',
            title: 'Web Development with AI',
            description: 'Learn modern web development enhanced with artificial intelligence. Build websites and applications faster using AI‑assisted workflows, modern frameworks, APIs, and automation tools.',
            duration: '7 weeks',
            format: 'Online',
            badge: 'AI‑Powered Development',
            tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'AI Tools'],
            category: 'web-dev'
        },
        {
            id: 'mobile-dev',
            title: 'Mobile Development',
            description: 'Build native and cross‑platform mobile applications for iOS and Android using Swift, Kotlin, and React Native. Learn the full mobile lifecycle.',
            duration: '14 weeks',
            format: 'Hybrid',
            badge: 'Native & Cross‑platform',
            tags: ['Swift', 'Kotlin', 'React Native', 'Firebase'],
            category: 'software-eng'
        },
        {
            id: 'data-science',
            title: 'Data Science',
            description: 'Learn to extract insights from data using Python, Pandas, machine learning, and data visualization. Build predictive models and data‑driven solutions.',
            duration: '16 weeks',
            format: 'Hybrid',
            badge: 'Analytics & AI',
            tags: ['Python', 'Pandas', 'Scikit‑learn', 'TensorFlow', 'Tableau'],
            category: 'data-analytics'
        },
        {
            id: 'python-beginners',
            title: 'Python for Beginners',
            description: 'Start your programming journey with Python. Learn programming fundamentals, problem‑solving, automation, and how to build your first applications.',
            duration: '8 weeks',
            format: 'Hybrid',
            badge: 'Beginner Friendly',
            tags: ['Python', 'Programming Logic', 'Automation', 'Problem Solving'],
            category: 'programming'
        },
        {
            id: 'python-maintenance',
            title: 'Python for Maintenance Engineering',
            description: 'Apply Python programming to engineering workflows. Learn data analysis, automation, equipment monitoring concepts, and tools that improve maintenance processes.',
            duration: '10 weeks',
            format: 'Hybrid',
            badge: 'Engineering Track',
            tags: ['Python', 'Engineering Automation', 'Data Analysis', 'Industrial Applications'],
            category: 'programming'
        },
        {
            id: 'ai-agents',
            title: 'Building AI Agents for Beginners',
            description: 'Understand how AI agents work and learn to build simple intelligent systems that can reason, use tools, automate tasks, and solve real‑world problems.',
            duration: '10 weeks',
            format: 'Hybrid',
            badge: 'AI Engineering',
            tags: ['AI Agents', 'LLMs', 'Python', 'Automation', 'APIs'],
            category: 'ai'
        },
        {
            id: 'prompt-eng',
            title: 'Prompt Engineering',
            description: 'Master the skill of communicating with AI effectively. Learn prompt design, AI workflows, automation strategies, and how professionals use AI tools to improve productivity.',
            duration: '6 weeks',
            format: 'Hybrid',
            badge: 'AI Productivity',
            tags: ['Prompt Design', 'ChatGPT', 'AI Workflows', 'Automation'],
            category: 'ai'
        },
        {
            id: 'ui-ux',
            title: 'UI/UX Design',
            description: 'Master the craft of product design — from user research and wireframing to high‑fidelity prototypes and design systems. Create digital products that people love.',
            duration: '10 weeks',
            format: 'Hybrid',
            badge: 'Product Design',
            tags: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
            category: 'ui-ux'
        }
    ];

    // --- Render course cards ---
    function renderCourses(filter = 'all') {
        const container = document.getElementById('courseCardContainer');
        const countDisplay = document.getElementById('resultCount');
        if (!container) return;

        let filtered = COURSES_DATA;
        if (filter !== 'all') {
            filtered = COURSES_DATA.filter(c => c.category === filter);
        }

        // Update result count
        if (countDisplay) {
            const categoryMap = {
                'all': 'All Courses',
                'web-dev': 'Web Development',
                'software-eng': 'Software Engineering',
                'ui-ux': 'UI/UX Design',
                'data-analytics': 'Data & Analytics',
                'programming': 'Programming',
                'ai': 'AI & Emerging Technology'
            };
            const label = categoryMap[filter] || 'Courses';
            countDisplay.textContent = `${label} · ${filtered.length} course${filtered.length !== 1 ? 's' : ''}`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `<p class="no-courses">No courses found for this category.</p>`;
            return;
        }

        container.innerHTML = filtered.map(c => `
            <div class="course-card">
                <div class="course-image" aria-hidden="true">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                ${c.badge ? `<span class="course-badge">${c.badge}</span>` : ''}
                <h3>${c.title}</h3>
                <p>${c.description}</p>
                <div class="course-meta">
                    <span><i class="far fa-clock"></i> ${c.duration}</span>
                    <span><i class="fas fa-laptop"></i> ${c.format}</span>
                </div>
                <div class="course-tags">
                    ${c.tags.map(t => `<span>${t}</span>`).join('')}
                </div>
                <!-- No CTA – individual course pages will be added later -->
            </div>
        `).join('');
    }

    // --- Filter button logic ---
    function initFilters() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function () {
                buttons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                renderCourses(filter);
            });
        });
    }

    // --- Init courses if the page exists ---
    function initCourses() {
        const container = document.getElementById('courseCardContainer');
        if (container) {
            renderCourses('all');
            initFilters();
        }
    }

    // --- Initialise all ---
    initFromHash();
    initEcosystemLinks();
    initCourses();

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