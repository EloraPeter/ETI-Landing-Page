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

        // --- Per-page SEO updates ---
        const SEO_BY_PAGE = {
            courses: {
                title: 'Courses & Upcoming Cohorts | Elora Tech Institute',
                description: 'Explore practical, career-focused technology courses and upcoming cohorts from Elora Tech Institute. Download the course catalogue and apply today.'
            },
            programs: {
                title: 'Programs | Elora Tech Institute',
                description: 'Explore ETI\'s structured technology learning pathways — Software Engineering, AI, Product Design, and more — from beginner fundamentals to real-world projects.'
            },
            services: {
                title: 'Work With ETI — Software, Web & Design Services | Elora Tech Institute',
                description: 'Need technology built for your business, startup, or organization? ETI designs and builds websites, web apps, software, UI/UX, and AI-powered solutions.'
            }
        };

        const seo = SEO_BY_PAGE[pageId];
        if (seo) {
            document.title = seo.title;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', seo.description);
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

    // ================================================================
    //  COURSE CATALOGUE PDF DOWNLOAD
    // ================================================================
    // Single source of truth for the downloadable catalogue file.
    // Replace `url` once the official ETI course catalogue PDF is ready —
    // nothing else on the page needs to change.
    const CATALOGUE_CONFIG = {
        // TODO: replace with the real path once the PDF exists, e.g.
        // '/assets/eti-course-catalogue.pdf'
        url: '',
        filename: 'ETI-Course-Catalogue.pdf'
    };

    function initCatalogueDownload() {
        const buttons = document.querySelectorAll('[data-catalogue-download]');
        if (!buttons.length) return;

        buttons.forEach(btn => {
            if (CATALOGUE_CONFIG.url) {
                btn.setAttribute('href', CATALOGUE_CONFIG.url);
                btn.setAttribute('download', CATALOGUE_CONFIG.filename);
                btn.removeAttribute('aria-disabled');
            } else {
                // No PDF supplied yet — keep the button visible but inert,
                // and tell the visitor honestly rather than 404-ing.
                btn.setAttribute('href', '#');
                btn.setAttribute('aria-disabled', 'true');
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    showToast('The course catalogue PDF is coming soon. In the meantime, browse the courses below.', 'info');
                });
            }
        });
    }

    // ================================================================
    //  UPCOMING COHORTS
    // ================================================================
    // TODO(API): This static array is a placeholder. The eventual data
    // shape should match what the ETI Cohort admin dashboard produces
    // (https://github.com/EloraPeter/ETI-cohort). When that API exists,
    // replace `getCohorts()` below with a fetch() call to it — nothing
    // in renderCohorts() or the markup needs to change, since it only
    // depends on this data shape:
    //   { id, title, program, startDate, endDate, duration, format,
    //     schedule, tuition, slots, slotsTaken, status, applicationUrl,
    //     description, featured }
    const COHORTS_DATA = [
        {
            id: 'sep-2026-web-dev-ai',
            title: 'September 2026 Web Development with AI Cohort',
            program: 'Web Development with AI',
            startDate: '2026-09-15',
            duration: '7 weeks',
            format: 'Online',
            schedule: 'Weekday evenings + weekend project labs',
            tuition: '₦250,000',
            slots: 50,
            status: 'open', // open | soon | full | coming
            applicationUrl: 'https://cohort.eloratechinstitute.com/',
            description: 'Learn modern web development enhanced with AI‑assisted workflows, frameworks, APIs, and automation tools.',
            featured: true
        },
        {
            id: 'nov-2026-python-beginners',
            title: 'November 2026 Python for Beginners Cohort',
            program: 'Python for Beginners',
            startDate: '2026-11-03',
            duration: '8 weeks',
            format: 'Hybrid',
            schedule: 'Weekday evenings',
            tuition: 'Contact ETI',
            slots: 40,
            status: 'soon',
            applicationUrl: 'https://cohort.eloratechinstitute.com/',
            description: 'Start your programming journey — fundamentals, problem‑solving, and your first real applications.',
            featured: false
        },
        {
            id: 'q1-2027-ui-ux',
            title: 'Q1 2027 UI/UX Design Cohort',
            program: 'UI/UX Design',
            startDate: 'TBA',
            duration: '10 weeks',
            format: 'Hybrid',
            schedule: 'TBA',
            tuition: 'Contact ETI',
            slots: 30,
            status: 'coming',
            applicationUrl: '',
            description: 'From user research and wireframing to high‑fidelity prototypes and design systems.',
            featured: false
        }
    ];

    // TODO(API): swap this for an async fetch to the ETI Cohort admin
    // dashboard's public endpoint once it exists, e.g.:
    //   async function getCohorts() {
    //       const res = await fetch('https://api.eloratechinstitute.com/cohorts');
    //       return res.json();
    //   }
    // renderCohorts() already awaits getCohorts(), so no other change
    // will be needed here.
    async function getCohorts() {
        return COHORTS_DATA;
    }

    const COHORT_STATUS_LABELS = {
        open: 'Applications Open',
        soon: 'Starting Soon',
        full: 'Full',
        coming: 'Coming Soon'
    };

    function formatCohortDate(dateStr) {
        if (!dateStr || dateStr === 'TBA') return 'TBA';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    async function renderCohorts() {
        const container = document.getElementById('cohortsContainer');
        if (!container) return;

        container.innerHTML = '<p class="no-cohorts">Loading upcoming cohorts…</p>';

        let cohorts = [];
        try {
            cohorts = await getCohorts();
        } catch (err) {
            container.innerHTML = '<p class="no-cohorts">Unable to load upcoming cohorts right now. Please check back soon.</p>';
            return;
        }

        if (!cohorts.length) {
            container.innerHTML = '<p class="no-cohorts">No upcoming cohorts are scheduled right now — check back soon or join our Telegram community to get notified.</p>';
            return;
        }

        container.innerHTML = cohorts.map(c => {
            const statusClass = 'status-' + (c.status || 'coming');
            const statusLabel = COHORT_STATUS_LABELS[c.status] || 'Coming Soon';
            const isActionable = c.status === 'open' || c.status === 'soon';
            const ctaLabel = c.status === 'full' ? 'Join Waitlist' : 'Apply Now';

            return `
            <div class="cohort-card${c.featured ? ' featured' : ''}">
                <span class="cohort-status ${statusClass}">${statusLabel}</span>
                <span class="cohort-program">${c.program}</span>
                <h3>${c.title}</h3>
                <p class="cohort-desc">${c.description}</p>
                <div class="cohort-meta">
                    <span><i class="far fa-calendar"></i> ${formatCohortDate(c.startDate)}</span>
                    <span><i class="far fa-clock"></i> ${c.duration}</span>
                    <span><i class="fas fa-laptop"></i> ${c.format}</span>
                    <span><i class="fas fa-tag"></i> ${c.tuition}</span>
                </div>
                <div class="cohort-actions">
                    ${isActionable && c.applicationUrl
                    ? `<a href="${c.applicationUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm"><i class="fas fa-rocket"></i> ${ctaLabel}</a>`
                    : `<a href="#" data-page="contact" class="btn btn-secondary btn-sm"><i class="fas fa-bell"></i> Get Notified</a>`
                }
                </div>
            </div>`;
        }).join('');

        // Newly-injected [data-page] links need the same nav wiring as
        // the static ones (they aren't present at initial page load).
        container.querySelectorAll('[data-page]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const page = this.dataset.page;
                if (page) {
                    navigateTo(page);
                    window.location.hash = '#' + page;
                }
            });
        });
    }

    // ================================================================
    //  PROJECT ENQUIRY FORM ("Work With ETI")
    // ================================================================
    // Submission logic is isolated here so a real backend/API can be
    // wired in later without touching the markup. Mirrors the pattern
    // already used by the contact form (POST to a JSON endpoint).
    // TODO(API): /api/project-enquiry does not exist yet — connect it
    // to ETI's backend once available.
    function initProjectForm() {
        const form = document.getElementById('projectForm');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const getVal = id => {
                const el = document.getElementById(id);
                return el ? el.value.trim() : '';
            };

            const payload = {
                name: getVal('projectName'),
                email: getVal('projectEmail'),
                phone: getVal('projectPhone'),
                organization: getVal('projectOrg'),
                service: getVal('projectService'),
                budget: getVal('projectBudget'),
                timeline: getVal('projectTimeline'),
                heardFrom: getVal('projectHeard'),
                description: getVal('projectDescription')
            };

            if (!payload.name) {
                showToast('Please enter your full name.', 'error');
                document.getElementById('projectName').focus();
                return;
            }
            if (!payload.email || !payload.email.includes('@') || !payload.email.includes('.')) {
                showToast('Please enter a valid email address.', 'error');
                document.getElementById('projectEmail').focus();
                return;
            }
            if (!payload.description) {
                showToast('Please tell us a little about your project.', 'error');
                document.getElementById('projectDescription').focus();
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            }

            try {
                const response = await fetch('/api/project-enquiry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send your request.');
                }

                showToast(`Thanks, ${payload.name}! We've received your project details and will be in touch soon.`, 'success');
                form.reset();
            } catch (err) {
                showToast(
                    err.message || 'Something went wrong sending your request. Please try again or email us directly.',
                    'error'
                );
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    // --- Initialise all ---
    initFromHash();
    initEcosystemLinks();
    initCourses();
    initCatalogueDownload();
    renderCohorts();
    initProjectForm();

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