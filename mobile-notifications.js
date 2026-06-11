/**
 * Mood Fixer - Mobile Notifications & Mock Push System
 * Automatically detects mobile devices and requests/triggers notification features.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Robust Mobile Device Detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     (window.innerWidth <= 768 && 'ontouchstart' in window) ||
                     (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

    if (!isMobile) return; // Only execute mobile-specific logic on mobile devices

    // 2. Inject DOM Elements for Notification UI
    const bannerHTML = `
        <div id="mob-notification-banner" class="mob-notification-banner">
            <div class="mob-notification-header">
                <div class="mob-notification-icon">🔔</div>
                <div class="mob-notification-title">Enable Daily Reminders?</div>
            </div>
            <div class="mob-notification-body">
                Get daily positive vibes and mood check-in reminders on your phone! Stay inspired.
            </div>
            <div class="mob-notification-actions">
                <button id="btn-mob-notif-later" class="mob-notification-btn mob-notification-btn-secondary">Later</button>
                <button id="btn-mob-notif-enable" class="mob-notification-btn mob-notification-btn-primary">Enable</button>
            </div>
        </div>
    `;

    const mockPushHTML = `
        <div id="mock-push-notification" class="mock-push-notification">
            <div class="mock-push-icon">
                <img src="mood fix logo.png" alt="Logo" style="width: 26px; height: 26px; border-radius: 6px;">
            </div>
            <div class="mock-push-content">
                <div class="mock-push-header">
                    <span class="mock-push-app-name">Mood Fixer</span>
                    <span class="mock-push-time">now</span>
                </div>
                <div class="mock-push-title">Welcome Back! 🌟</div>
                <div class="mock-push-body">Your daily positive vibes are ready. Tap to fix your mood.</div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', bannerHTML);
    document.body.insertAdjacentHTML('beforeend', mockPushHTML);

    const banner = document.getElementById('mob-notification-banner');
    const mockPush = document.getElementById('mock-push-notification');
    const btnLater = document.getElementById('btn-mob-notif-later');
    const btnEnable = document.getElementById('btn-mob-notif-enable');

    // 3. Click handler for the Mock Notification Banner (redirects/navigates to mood step)
    mockPush.addEventListener('click', () => {
        mockPush.classList.remove('show');
        
        // If navigateToStep is available (on index.html), navigate to the mood picker step
        if (typeof navigateToStep === 'function' && typeof stepMood !== 'undefined') {
            navigateToStep(stepMood);
        } else {
            // Otherwise, navigate back to index.html and append hash
            window.location.href = 'index.html#step-mood';
        }
    });

    // 4. Trigger Web API Notification
    function triggerNativeNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(title, {
                    body: body,
                    icon: 'mood fix logo.png',
                    badge: 'mood fix logo.png'
                });
            } catch (err) {
                console.warn("Standard notification failed. Attempting service worker registration fallback...", err);
                if (navigator.serviceWorker && navigator.serviceWorker.ready) {
                    navigator.serviceWorker.ready.then(registration => {
                        registration.showNotification(title, {
                            body: body,
                            icon: 'mood fix logo.png',
                            badge: 'mood fix logo.png'
                        });
                    });
                }
            }
        }
    }

    // 5. Trigger Mock UI Notification
    function showMockNotification(title, body) {
        if (!mockPush) return;
        const titleEl = mockPush.querySelector('.mock-push-title');
        const bodyEl = mockPush.querySelector('.mock-push-body');
        
        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.textContent = body;

        setTimeout(() => {
            mockPush.classList.add('show');
        }, 1200); // Elegant delay after page load

        setTimeout(() => {
            mockPush.classList.remove('show');
        }, 6500); // Automatically dismiss after 5.3 seconds of visibility
    }

    // 6. Main Notification Flow
    const notificationsSupported = 'Notification' in window;
    const hasPermission = notificationsSupported && Notification.permission === 'granted';
    const isBlocked = notificationsSupported && Notification.permission === 'denied';

    const lastPromptTime = localStorage.getItem('moodFixerNotifPromptTime');
    const promptCooldown = 3 * 24 * 60 * 60 * 1000; // 3 days cooldown
    const shouldPrompt = !isBlocked && 
                         (!lastPromptTime || (Date.now() - parseInt(lastPromptTime) > promptCooldown));

    if (hasPermission) {
        // User has already granted permission: trigger both native and styled mock notifications
        showMockNotification("Welcome Back! 🌟", "Your daily positive vibes are ready. Let's check in!");
        triggerNativeNotification("Mood Fixer 🌟", "Welcome back! Ready to check in on your mood today?");
    } else if (notificationsSupported && !isBlocked && shouldPrompt) {
        // Request permissions: Show slide-up banner after a short delay
        setTimeout(() => {
            banner.classList.add('show');
        }, 2500);
    } else {
        // Fallback: If not supported/blocked/in cooldown, show in-app notification only
        showMockNotification("Welcome Back! 🌟", "Your daily positive vibes are ready. Let's check in!");
    }

    // 7. Interactive Banner Event Listeners
    btnLater.addEventListener('click', () => {
        banner.classList.remove('show');
        localStorage.setItem('moodFixerNotifPromptTime', Date.now().toString());
    });

    btnEnable.addEventListener('click', () => {
        if (notificationsSupported) {
            Notification.requestPermission().then(permission => {
                banner.classList.remove('show');
                localStorage.setItem('moodFixerNotifPromptTime', Date.now().toString());

                if (permission === 'granted') {
                    // Success feedback
                    setTimeout(() => {
                        showMockNotification("Notifications Enabled! 🎉", "You will now receive daily positive vibes!");
                        triggerNativeNotification("Mood Fixer 🌟", "Thank you for enabling notifications!");
                    }, 600);
                } else {
                    console.log("Notification permission denied/dismissed.");
                }
            });
        } else {
            banner.classList.remove('show');
        }
    });
});
