document.addEventListener('DOMContentLoaded', () => {
    // 1. Data Retrieval and Processing
    const rawData = localStorage.getItem('moodFixerVisits');
    let history = [];
    try {
        history = JSON.parse(rawData) || [];
    } catch (e) {
        history = [];
    }

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

    // Intensity mapping for Y-axis (1-5 scale)
    const intensityMap = {
        'Happy': 5,
        'Lovely': 5,
        'Waking Up': 4,
        'Normal': 3,
        'generic': 3,
        'Sleepy': 2,
        'Tired': 2,
        'Anxious': 1,
        'Sad': 1,
        'Angry': 1
    };

    const yAxisLabels = {
        5: 'High Morale (Happy/Lovely)',
        4: 'Waking Up',
        3: 'Normal / No Idea',
        2: 'Low Energy (Sleepy/Tired)',
        1: 'Low Morale (Sad/Angry/Anxious)'
    };

    // Filter mood entries and map to Chart.js format
    const moodEntries = history.filter(item => item.type === 'mood').reverse(); // Reverse to get chronological order
    
    const chartData = moodEntries.map(entry => {
        let intensity = intensityMap[entry.moodEmoji] || 3; // Default to normal if not found
        let timestamp = new Date(entry.timestamp);
        
        // Handle invalid dates just in case
        if (isNaN(timestamp.getTime())) {
            timestamp = new Date();
        }

        return {
            x: timestamp,
            y: intensity,
            emoji: moodEmojiMap[entry.moodEmoji] || '💭',
            moodName: entry.moodEmoji || 'Custom',
            text: entry.moodText || ''
        };
    });

    // Cache for emoji canvases to avoid recreating them on every render
    const emojiCanvasCache = {};
    function getEmojiCanvas(emoji) {
        if (!emojiCanvasCache[emoji]) {
            const canvas = document.createElement('canvas');
            canvas.width = 40;
            canvas.height = 40;
            const ctx = canvas.getContext('2d');
            
            // Render emoji centered in the canvas
            ctx.font = '28px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);
            
            emojiCanvasCache[emoji] = canvas;
        }
        return emojiCanvasCache[emoji];
    }

    // 2. Chart setup
    const ctx = document.getElementById('moodChart').getContext('2d');

    // Create a vibrant gradient for the line fill
    let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(255, 107, 107, 0.6)'); // Accent color
    gradient.addColorStop(1, 'rgba(161, 140, 209, 0.1)'); // Background mix

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Mood Intensity',
                data: chartData,
                borderColor: '#ff6b6b', // Accent color
                backgroundColor: gradient,
                borderWidth: 3,
                pointStyle: (context) => {
                    if (context.type !== 'data') return 'circle';
                    const dataPoint = context.raw;
                    if (dataPoint && dataPoint.emoji) {
                        return getEmojiCanvas(dataPoint.emoji);
                    }
                    return 'circle';
                },
                pointRadius: 14,
                pointHoverRadius: 18,
                fill: true,
                tension: 0.4 // Smooth curve
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hide legend since there's only one dataset
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#2d3748',
                    bodyColor: '#4a5568',
                    borderColor: '#ff9a9e',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        title: (context) => {
                            const date = context[0].raw.x;
                            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        },
                        label: (context) => {
                            const dataPoint = context.raw;
                            let lines = [
                                `Mood: ${dataPoint.emoji} ${dataPoint.moodName}`
                            ];
                            if (dataPoint.text) {
                                lines.push(`"${dataPoint.text}"`);
                            }
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'MMM d, yyyy h:mm a',
                        displayFormats: {
                            hour: 'MMM d, h a',
                            day: 'MMM d',
                            week: 'MMM d',
                            month: 'MMM yyyy'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#4a5568',
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 12
                        }
                    }
                },
                y: {
                    min: 0.5,
                    max: 5.5,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)',
                        drawBorder: false,
                    },
                    ticks: {
                        stepSize: 1,
                        color: '#2d3748',
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 13,
                            weight: '600'
                        },
                        callback: function(value, index, values) {
                            return yAxisLabels[value] || '';
                        }
                    }
                }
            }
        }
    });

    // Glass Entry Animation
    const glassContainer = document.querySelector('.glass-container');
    if (glassContainer) {
        glassContainer.classList.add('glass-entry');
        setTimeout(() => {
            glassContainer.classList.remove('glass-entry');
            glassContainer.classList.add('reveal-visible');
        }, 100);
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

        // Close button (✕)
        const mobileCloseBtn = document.getElementById('mobile-menu-close');
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        }
    }

    // Calculate and render stats widgets
    const totalLogsEl = document.getElementById('stat-total-logs');
    const streakEl = document.getElementById('stat-streak');
    const topMoodEl = document.getElementById('stat-top-mood');

    if (totalLogsEl) {
        totalLogsEl.textContent = moodEntries.length;
    }

    if (streakEl) {
        // Build set of logged dates in YYYY-MM-DD format
        const loggedDates = new Set();
        moodEntries.forEach(entry => {
            const dateObj = new Date(entry.timestamp);
            if (!isNaN(dateObj.getTime())) {
                loggedDates.add(dateObj.toLocaleDateString('en-CA'));
            }
        });

        let streak = 0;
        let checkDate = new Date();
        let checkDateStr = checkDate.toLocaleDateString('en-CA');

        // If today isn't logged, check if yesterday was logged to continue the streak
        if (!loggedDates.has(checkDateStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
            checkDateStr = checkDate.toLocaleDateString('en-CA');
        }

        // Count backwards as long as date is present in loggedDates
        while (loggedDates.has(checkDateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            checkDateStr = checkDate.toLocaleDateString('en-CA');
        }

        streakEl.textContent = streak > 0 ? `${streak} Day${streak > 1 ? 's' : ''}` : '0 Days';
    }

    if (topMoodEl) {
        const moodCounts = {};
        let maxCount = 0;
        let topMood = null;

        moodEntries.forEach(entry => {
            const mood = entry.moodEmoji || 'generic';
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
            if (moodCounts[mood] > maxCount) {
                maxCount = moodCounts[mood];
                topMood = mood;
            }
        });

        if (topMood) {
            const emoji = moodEmojiMap[topMood] || '💭';
            const moodLabel = topMood === 'generic' ? 'No Idea' : topMood.charAt(0).toUpperCase() + topMood.slice(1);
            topMoodEl.textContent = `${emoji} ${moodLabel}`;
        } else {
            topMoodEl.textContent = '-';
        }
    }

    // 3. Calendar Logic
    const calendarEl = document.getElementById('mood-calendar');
    const calendarTitleEl = document.getElementById('calendar-title');
    const calendarDescEl = document.getElementById('calendar-desc');

    if (calendarEl) {
        // Group mood entries by local date string (YYYY-MM-DD)
        const moodsByDate = {};
        moodEntries.forEach(entry => {
            const dateObj = new Date(entry.timestamp);
            if (!isNaN(dateObj.getTime())) {
                const dateStr = dateObj.toLocaleDateString('en-CA'); // gets YYYY-MM-DD reliably
                if (!moodsByDate[dateStr]) {
                    moodsByDate[dateStr] = [];
                }
                const emoji = moodEmojiMap[entry.moodEmoji] || '💭';
                moodsByDate[dateStr].push(emoji);
            }
        });

        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
        const daysToNextSaturday = 6 - currentDayOfWeek;
        
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + daysToNextSaturday);
        
        // 35 days total (5 weeks)
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 34);

        // Update Title and Description
        if (calendarTitleEl) {
            const startMonth = startDate.toLocaleString('default', { month: 'long' });
            const endMonth = endDate.toLocaleString('default', { month: 'long' });
            let monthText = startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;
            calendarTitleEl.textContent = `Past 30 Days (${monthText})`;
        }
        if (calendarDescEl) {
            calendarDescEl.textContent = "A visual summary of your mood entries. Multiple emojis indicate multiple check-ins on that day.";
        }

        // Add headers
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const header = document.createElement('div');
            header.className = 'cal-day cal-day-header';
            header.textContent = day;
            calendarEl.appendChild(header);
        });

        for (let i = 0; i < 35; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const cell = document.createElement('div');
            cell.className = 'cal-day';
            
            // Highlight future days (beyond today) as empty or different
            if (currentDate > today) {
                cell.style.opacity = '0.3';
            }

            const dateStr = currentDate.toLocaleDateString('en-CA');
            const dayNum = currentDate.getDate();
            
            let innerHTML = `<span class="cal-date">${dayNum}</span>`;
            
            if (moodsByDate[dateStr] && currentDate <= today) {
                cell.classList.add('has-mood');
                // Limit font size if there are many emojis to fit them in the box
                const emojis = moodsByDate[dateStr].join('');
                let fontSize = '1.5rem';
                if (emojis.length > 4) fontSize = '0.9rem';
                else if (emojis.length > 2) fontSize = '1.1rem';
                
                innerHTML += `<span class="cal-emoji" style="font-size: ${fontSize}; text-align: center; line-height: 1.2; word-break: break-all;">${emojis}</span>`;
            }

            cell.innerHTML = innerHTML;
            calendarEl.appendChild(cell);
        }
    }
});
