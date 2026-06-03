document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Dashboard Logic (Time, Date, History) ---

    function updateClock() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        document.getElementById('current-date').textContent = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    setInterval(updateClock, 1000);
    updateClock();

    const moodEmojiMap = {
        'Happy': '😊',
        'Sad': '😢',
        'Sleepy': '😴',
        'Waking Up': '🌅',
        'Normal': '😐',
        'Anxious': '😰',
        'Angry': '😠',
        'Tired': '😴',
        'Lovely': '🥰',
        'generic': '🤷'
    };

    function loadHistory() {
        let raw = localStorage.getItem('moodFixerVisits');
        if (!raw) return [];
        try {
            let items = JSON.parse(raw);
            if (!Array.isArray(items)) return [];
            return items.map(item => {
                if (typeof item === 'string') {
                    return { type: 'visit', timestamp: item };
                }
                return item;
            });
        } catch (e) {
            return [];
        }
    }

    function renderHistory() {
        const visitList = document.getElementById('visit-list');
        if (!visitList) return;
        visitList.innerHTML = '';

        const history = loadHistory();
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';

            let icon = '🌱';
            let title = 'Visited';
            let desc = '';

            if (item.type === 'visit') {
                icon = '🌱';
                title = 'Opened Mood Fixer';
            } else if (item.type === 'mood') {
                icon = moodEmojiMap[item.moodEmoji] || '💭';
                if (item.moodEmoji && item.moodEmoji !== 'generic') {
                    title = `Feeling ${item.moodEmoji}`;
                } else if (item.moodText) {
                    title = 'Custom Mood';
                } else {
                    title = 'No idea';
                }

                if (item.moodText && item.moodText.trim()) {
                    desc = `"${item.moodText.trim()}"`;
                }
            }

            let displayTime = '';
            try {
                const dateObj = new Date(item.timestamp);
                if (!isNaN(dateObj.getTime())) {
                    displayTime = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' +
                                  dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else {
                    displayTime = item.timestamp;
                }
            } catch (err) {
                displayTime = item.timestamp;
            }

            li.innerHTML = `
                <span class="history-icon">${icon}</span>
                <div class="history-details">
                    <div class="history-title">${title}</div>
                    ${desc ? `<div class="history-desc">${desc}</div>` : ''}
                    <div class="history-time">${displayTime}</div>
                </div>
            `;
            visitList.appendChild(li);
        });
    }

    function addMoodToHistory(moodEmoji, moodText) {
        let history = loadHistory();
        const nowStr = new Date().toLocaleString();

        history.unshift({
            type: 'mood',
            moodEmoji: moodEmoji,
            moodText: moodText,
            timestamp: nowStr
        });
        if (history.length > 15) history.pop();
        localStorage.setItem('moodFixerVisits', JSON.stringify(history));
        renderHistory();
    }

    function setupHistory() {
        let history = loadHistory();
        const now = new Date();
        const nowStr = now.toLocaleString();

        const lastVisit = history.find(item => item.type === 'visit');
        if (!lastVisit || (now.getTime() - new Date(lastVisit.timestamp).getTime() > 1000 * 60 * 60)) {
            history.unshift({ type: 'visit', timestamp: nowStr });
            if (history.length > 15) history.pop();
            localStorage.setItem('moodFixerVisits', JSON.stringify(history));
        }

        renderHistory();
    }

    setupHistory();
    
    // Initial Entry Animation for Glass Container
    const glassContainer = document.querySelector('.glass-container');
    if (glassContainer) {
        glassContainer.classList.add('glass-entry');
        setTimeout(() => {
            glassContainer.classList.remove('glass-entry');
            glassContainer.classList.add('reveal-visible');
        }, 100);
    }

    // Toggle History Sidebar
    const toggleBtn = document.getElementById('nav-history');
    const dashboard = document.getElementById('dashboard');

    if (toggleBtn && dashboard) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dashboard.classList.toggle('collapsed');
        });
    }

    // Mobile Hamburger Menu Toggle
    const hamburgerBtn = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        // Close menu when a link is clicked
        const mobLinks = mobileMenu.querySelectorAll('.mob-link');
        mobLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    // --- 2. App State & Flow ---
    let userState = {
        identity: null,
        moodEmoji: null,
        moodText: ''
    };

    const stepWelcome = document.getElementById('step-welcome');
    const stepIdentity = document.getElementById('step-identity');
    const stepMood = document.getElementById('step-mood');
    const stepResult = document.getElementById('step-result');

    function navigateToStep(targetStep) {
        const steps = [stepWelcome, stepIdentity, stepMood, stepResult];
        const currentStep = steps.find(s => !s.classList.contains('hidden'));

        if (currentStep === targetStep) return;

        // Step 1: Fade out current step
        if (currentStep) {
            currentStep.classList.add('step-exiting');
        }

        // Wait for fade out
        setTimeout(() => {
            if (currentStep) {
                currentStep.classList.add('hidden');
                currentStep.classList.remove('step-exiting');
                currentStep.classList.remove('reveal-visible');
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Step 2: Show target step (initially hidden by CSS transition state)
            targetStep.classList.remove('hidden');
            
            // Force reflow for transition
            targetStep.offsetHeight; 

            // Handle Sidebar and Logo visibility logic
            const mainLogo = document.getElementById('main-logo');
            
            if (targetStep === stepWelcome) {
                if(mainLogo) mainLogo.classList.remove('hidden-element');
            } else {
                if(mainLogo) mainLogo.classList.add('hidden-element');
            }

            // Update Active Nav Link
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => link.classList.remove('active'));
            
            if (targetStep === stepWelcome) {
                document.getElementById('nav-home')?.classList.add('active');
            } else if (targetStep === stepIdentity) {
                document.getElementById('nav-get-started')?.classList.add('active');
            } else if (targetStep === stepMood) {
                document.getElementById('nav-pick-mood')?.classList.add('active');
            } else if (targetStep === stepResult) {
                document.getElementById('nav-history')?.classList.remove('active');
            }
        }, 400);
    }

    // Header & Footer Navigation
    const homeLinks = [document.getElementById('nav-home'), document.getElementById('footer-home')];
    const getStartedLinks = [document.getElementById('nav-get-started'), document.getElementById('footer-get-started')];
    const startJourneyBtn = document.getElementById('nav-start-journey');

    if(startJourneyBtn) {
        startJourneyBtn.addEventListener('click', () => {
            navigateToStep(stepWelcome); // As per user request: Start Journey -> first page
        });
    }

    homeLinks.forEach(link => {
        if(link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToStep(stepIdentity); // As per user request: Home -> second page
            });
        }
    });

    getStartedLinks.forEach(link => {
        if(link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToStep(stepIdentity); // As per user request: Get Started -> second page
            });
        }
    });

    const pickMoodLinks = [document.getElementById('nav-pick-mood'), document.getElementById('footer-pick-mood')];
    const resultLink = document.getElementById('footer-result');

    pickMoodLinks.forEach(link => {
        if(link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToStep(stepMood);
            });
        }
    });

    if(resultLink) {
        resultLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToStep(stepResult);
        });
    }

    // Get Started Button in Welcome Step → go to identity step
    const btnGetStarted = document.getElementById('btn-get-started');
    btnGetStarted.addEventListener('click', () => {
        navigateToStep(stepIdentity);
    });

    // Identity Selection
    const identityCards = document.querySelectorAll('#step-identity .btn-option-card');
    identityCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const targetCard = e.currentTarget;
            userState.identity = targetCard.dataset.identity;

            // Visual feedback
            identityCards.forEach(b => b.classList.remove('selected'));
            targetCard.classList.add('selected');

            // Move to next step after brief delay
            setTimeout(() => {
                navigateToStep(stepMood);
            }, 500);
        });
    });

    // Mood Selection (Emoji)
    const moodBtns = document.querySelectorAll('#step-mood .emoji-btn');
    moodBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            userState.moodEmoji = e.target.dataset.mood;
            moodBtns.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
        });
    });

    const customMoodInput = document.getElementById('custom-mood');
    customMoodInput.addEventListener('input', (e) => {
        userState.moodText = e.target.value;
    });

    const btnSubmitMood = document.getElementById('btn-submit-mood');
    btnSubmitMood.addEventListener('click', () => {
        if (!userState.moodEmoji && !userState.moodText.trim()) {
            alert("Please select an emoji or type how you feel!");
            return;
        }

        // Save selected mood & custom description to history
        addMoodToHistory(userState.moodEmoji, userState.moodText);

        generateAIResponse();
        navigateToStep(stepResult);
    });

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            // Reset state visual
            moodBtns.forEach(b => b.classList.remove('selected'));
            customMoodInput.value = '';
            userState.moodEmoji = null;
            userState.moodText = '';
     
            navigateToStep(stepMood);
        });
    }

    // Copy to Clipboard logic
    const btnCopyResult = document.getElementById('btn-copy-result');
    if (btnCopyResult) {
        btnCopyResult.addEventListener('click', () => {
            const resultText = document.getElementById('result-text').textContent;
            navigator.clipboard.writeText(resultText).then(() => {
                const originalText = btnCopyResult.innerHTML;
                btnCopyResult.innerHTML = '✅ Copied!';
                setTimeout(() => {
                    btnCopyResult.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    }


    // --- 3. Simulated AI Engine ---
    // knowledgeBase is now loaded globally from data.js

    function getResponseType(text) {
        const trimmed = text.trim().toLowerCase();
        if (trimmed.startsWith('joke:-') || trimmed.startsWith('joke:')) {
            return 'joke';
        } else if (trimmed.startsWith('motivation:-') || trimmed.startsWith('motivation:')) {
            return 'motivation';
        } else if (trimmed.startsWith('fact:-') || trimmed.startsWith('fact:')) {
            return 'fact';
        }
        // If it starts with common joke patterns, treat it as a joke too
        if (trimmed.startsWith('why did') || trimmed.startsWith('what do you call') || trimmed.startsWith('why do') || trimmed.startsWith('why don\'t')) {
            return 'joke';
        }
        return 'motivation'; // default
    }

    function cleanResponseText(text) {
        return text.replace(/^(joke|motivation|fact):-\s*/i, '')
                   .replace(/^(joke|motivation|fact):\s*/i, '')
                   .trim();
    }

    function generateAIResponse() {
        let category = 'generic';
        let text = userState.moodText.toLowerCase();
        let emoji = userState.moodEmoji;

        // Simple NLP logic
        if (text.includes('sad') || text.includes('cry') || text.includes('depress') || emoji === 'Sad') {
            category = 'sad';
        } else if (text.includes('happy') || text.includes('joy') || text.includes('good') || emoji === 'Happy') {
            category = 'happy';
        } else if (text.includes('sleep') || text.includes('bed') || emoji === 'Sleepy') {
            category = 'sleepy';
        } else if (text.includes('tired') || text.includes('exhausted') || emoji === 'Tired' || emoji === 'tired') {
            category = 'tired';
        } else if (text.includes('wake') || text.includes('morning') || emoji === 'Waking Up') {
            category = 'wakingup';
        } else if (text.includes('anxious') || text.includes('panic') || text.includes('nervous') || emoji === 'Anxious') {
            category = 'anxious';
        } else if (text.includes('angry') || text.includes('mad') || text.includes('hate') || emoji === 'Angry') {
            category = 'angry';
        } else if (emoji === 'Lovely' || text.includes('love') || text.includes('lovely')) {
            category = 'lovely';
        } else if (emoji === 'generic' || emoji === 'Normal' || text.includes('normal') || text.includes('fine') || text.includes('okay')) {
            category = 'normal';
        }

        const responses = knowledgeBase[category] || knowledgeBase.generic;

        // Separate current category into jokes and motivations/facts
        const jokes = responses.filter(r => getResponseType(r) === 'joke');
        const motivationsAndFacts = responses.filter(r => getResponseType(r) !== 'joke');

        // Retrieve and increment the result counter
        let count = parseInt(localStorage.getItem('moodFixerResultCount') || '0') + 1;
        localStorage.setItem('moodFixerResultCount', count.toString());

        // Determine which set to pick from (strict alternation):
        // Odd count  (1st, 3rd, 5th…) -> Motivation / Fact first
        // Even count (2nd, 4th, 6th…) -> Joke second
        const wantsJoke = (count % 2 === 0);

        let selectedResponse = '';
        let finalType = 'motivation';

        if (wantsJoke) {
            if (jokes.length > 0) {
                selectedResponse = jokes[Math.floor(Math.random() * jokes.length)];
                finalType = 'joke';
            } else {
                // fallback to anything
                selectedResponse = responses[Math.floor(Math.random() * responses.length)];
                finalType = getResponseType(selectedResponse);
            }
        } else {
            if (motivationsAndFacts.length > 0) {
                selectedResponse = motivationsAndFacts[Math.floor(Math.random() * motivationsAndFacts.length)];
                finalType = getResponseType(selectedResponse);
            } else {
                // fallback to anything
                selectedResponse = responses[Math.floor(Math.random() * responses.length)];
                finalType = getResponseType(selectedResponse);
            }
        }

        const cleanText = cleanResponseText(selectedResponse);
        document.getElementById('result-text').textContent = cleanText;

        // Update badge visual
        const badge = document.getElementById('result-badge');
        if (badge) {
            badge.className = 'result-badge'; // Reset classes
            badge.classList.remove('hidden-element');

            if (finalType === 'joke') {
                badge.innerHTML = '😂 Joke';
                badge.classList.add('badge-joke');
            } else if (finalType === 'fact') {
                badge.innerHTML = '💡 Fact';
                badge.classList.add('badge-fact');
            } else {
                badge.innerHTML = '💪 Motivation';
                badge.classList.add('badge-motivation');
            }
        }
    }

    // --- 4. Gallery Touch Interaction ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('touchstart', function(e) {
            // Toggle active class on touch
            // First remove from others
            galleryItems.forEach(i => {
                if (i !== item) i.classList.remove('touch-active');
            });
            item.classList.toggle('touch-active');
        }, { passive: true });
    });

    // --- 5. Scroll Reveal Logic ---
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
});