// ============================================
// DATA & CONFIGURATION
// ============================================

// Hari dalam bahasa Indonesia
const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Data Jadwal Sholat
const SHOLAT_SCHEDULE = [
    { id: 'subuh', name: 'Subuh', time: '04:30', category: 'sholat' },
    { id: 'dzuhur', name: 'Dzuhur', time: '12:00', category: 'sholat' },
    { id: 'ashar', name: 'Ashar', time: '15:30', category: 'sholat' },
    { id: 'maghrib', name: 'Maghrib', time: '18:00', category: 'sholat' },
    { id: 'isya', name: 'Isya', time: '19:00', category: 'sholat' }
];

// Data Jadwal Rutin Harian
const DAILY_ROUTINE = [
    { id: 'sarapan', name: 'Sarapan', time: '06:00', category: 'routine' },
    { id: 'sekolah', name: 'Sekolah', time: '07:00–14:00', category: 'routine' },
    { id: 'waktu_bebas', name: 'Waktu bebas/projek', time: '14:00–17:00', category: 'routine' },
    { id: 'istirahat_sore', name: 'Istirahat sore', time: '17:00–18:00', category: 'routine' },
    { id: 'istirahat_olahraga', name: 'Istirahat Olahraga', time: '16:00–16:30', category: 'routine' },
    { id: 'makan_malam', name: 'Makan malam', time: '19:30', category: 'routine' },
    { id: 'persiapan_live', name: 'Persiapan Live', time: '20:30', category: 'routine' },
    { id: 'live', name: 'Live', time: '21:00–23:00', category: 'routine' }
];

// Data Olahraga Wajib
const MANDATORY_WORKOUT = [
    { id: 'pushup', name: 'Push-up 20x', time: 'Setelah Subuh', category: 'workout' },
    { id: 'situp', name: 'Sit-up 20x', time: 'Setelah sekolah (14:15 Minggu)', category: 'workout' },
    { id: 'plank', name: 'Plank 45 detik', time: '17:30', category: 'workout' }
];

// Data Makan Teratur
const MEAL_SCHEDULE = [
    { id: 'makan_pagi', name: 'Makan pagi', time: '06:00', category: 'meal' },
    { id: 'makan_siang', name: 'Makan siang', time: '12:30', category: 'meal' },
    { id: 'makan_malam', name: 'Makan malam', time: '19:30', category: 'meal' }
];

// Data Extra Workout Kamis
const EXTRA_WORKOUT = [
    { id: 'extra_pushup', name: 'Extra Push-up +30', time: '', category: 'extra' },
    { id: 'extra_situp', name: 'Extra Sit-up +30', time: '', category: 'extra' },
    { id: 'extra_plank', name: 'Extra Plank +1 menit', time: '', category: 'extra' },
    { id: 'stretching', name: 'Stretching full-body 10 menit', time: '', category: 'extra' },
    { id: 'jalan_cepat', name: 'Jalan cepat / skipping 10 menit', time: '', category: 'extra' }
];

// Data Minum Air (8 gelas)
const WATER_GLASSES = Array.from({ length: 8 }, (_, i) => ({
    id: `water_${i + 1}`,
    name: `Gelas ${i + 1}`,
    number: i + 1
}));

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getCurrentDay() {
    return new Date().getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
}

function getCurrentDateText() {
    const now = new Date();
    const day = DAYS_ID[now.getDay()];
    const date = now.getDate();
    const month = MONTHS_ID[now.getMonth()];
    const year = now.getFullYear();
    return `${day}, ${date} ${month} ${year}`;
}

function isThursday() {
    return getCurrentDay() === 4;
}

function isSunday() {
    return getCurrentDay() === 0;
}

function getStorageKey(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];
    return `lifeMonitor_${dateStr}`;
}

function saveToStorage(data) {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage() {
    const key = getStorageKey();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {
        sholat: {},
        routine: {},
        workout: {},
        extra: {},
        meals: {},
        water: {}
    };
}

function updateChecklistState(id, category, checked) {
    const storageData = loadFromStorage();
    if (!storageData[category]) storageData[category] = {};
    storageData[category][id] = checked;
    saveToStorage(storageData);
}

function getChecklistState(id, category) {
    const storageData = loadFromStorage();
    return storageData[category] && storageData[category][id] === true;
}

// ============================================
// RENDER FUNCTIONS - INDEX.HTML
// ============================================

function renderCurrentDate() {
    const currentDayEl = document.getElementById('currentDay');
    const currentDateEl = document.getElementById('currentDate');
    
    if (currentDayEl) {
        const dayIndex = getCurrentDay();
        const dayName = DAYS_ID[dayIndex];
        currentDayEl.textContent = dayName;
        
        // Highlight special days
        if (isThursday()) {
            currentDayEl.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-dark))';
            currentDayEl.style.webkitBackgroundClip = 'text';
            currentDayEl.style.webkitTextFillColor = 'transparent';
            currentDayEl.style.backgroundClip = 'text';
        } else if (isSunday()) {
            currentDayEl.style.background = 'linear-gradient(135deg, var(--warning), #f97316)';
            currentDayEl.style.webkitBackgroundClip = 'text';
            currentDayEl.style.webkitTextFillColor = 'transparent';
            currentDayEl.style.backgroundClip = 'text';
        }
    }
    
    if (currentDateEl) {
        currentDateEl.textContent = `Tanggal: ${getCurrentDateText()}`;
    }
}

function createChecklistItem(item, category) {
    const div = document.createElement('div');
    div.className = 'checklist-item fade-in';
    div.dataset.id = item.id;
    div.dataset.category = category;
    
    const isChecked = getChecklistState(item.id, category);
    if (isChecked) div.classList.add('checked');
    
    const checkbox = document.createElement('div');
    checkbox.className = 'checklist-checkbox';
    
    const content = document.createElement('div');
    content.className = 'checklist-content';
    
    const title = document.createElement('div');
    title.className = 'checklist-title';
    title.textContent = item.name;
    
    const time = document.createElement('div');
    time.className = 'checklist-time';
    if (item.time) {
        const timeIcon = document.createElement('i');
        timeIcon.className = 'fas fa-clock';
        time.appendChild(timeIcon);
        time.appendChild(document.createTextNode(` ${item.time}`));
    }
    
    content.appendChild(title);
    if (item.time) content.appendChild(time);
    
    div.appendChild(checkbox);
    div.appendChild(content);
    
    // Add click event
    div.addEventListener('click', function() {
        const isChecked = this.classList.toggle('checked');
        updateChecklistState(item.id, category, isChecked);
        updateHealthProgress();
    });
    
    return div;
}

function renderSholatChecklist() {
    const container = document.getElementById('sholatChecklist');
    if (!container) return;
    
    container.innerHTML = '';
    SHOLAT_SCHEDULE.forEach(item => {
        container.appendChild(createChecklistItem(item, 'sholat'));
    });
}

function renderRoutineChecklist() {
    const container = document.getElementById('routineChecklist');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Adjust schedule for Sunday
    const routine = DAILY_ROUTINE.map(item => {
        if (item.id === 'sekolah' && isSunday()) {
            return { ...item, time: 'Libur (Minggu)' };
        }
        return item;
    });
    
    routine.forEach(item => {
        // Skip school on Sunday
        if (item.id === 'sekolah' && isSunday()) {
            const div = document.createElement('div');
            div.className = 'checklist-item fade-in';
            div.innerHTML = `
                <div class="checklist-checkbox"></div>
                <div class="checklist-content">
                    <div class="checklist-title" style="color: var(--warning);">Libur Sekolah</div>
                    <div class="checklist-time"><i class="fas fa-clock"></i> Libur (Minggu)</div>
                </div>
            `;
            container.appendChild(div);
        } else {
            container.appendChild(createChecklistItem(item, 'routine'));
        }
    });
}

function renderWorkoutChecklist() {
    const container = document.getElementById('workoutChecklist');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Adjust sit-up time for Sunday
    const workout = MANDATORY_WORKOUT.map(item => {
        if (item.id === 'situp' && isSunday()) {
            return { ...item, time: '14:15 (Minggu)' };
        }
        return item;
    });
    
    workout.forEach(item => {
        container.appendChild(createChecklistItem(item, 'workout'));
    });
}

function renderExtraWorkoutChecklist() {
    const container = document.getElementById('extraWorkoutChecklist');
    const card = document.getElementById('extraWorkoutCard');
    
    if (!container || !card) return;
    
    if (isThursday()) {
        card.style.display = 'block';
        container.innerHTML = '';
        
        EXTRA_WORKOUT.forEach(item => {
            container.appendChild(createChecklistItem(item, 'extra'));
        });
        
        // Add pulse animation
        card.classList.add('pulse');
    } else {
        card.style.display = 'none';
        card.classList.remove('pulse');
    }
}

function renderWaterChecklist() {
    const container = document.getElementById('waterChecklist');
    if (!container) return;
    
    container.innerHTML = '';
    
    WATER_GLASSES.forEach(glass => {
        const div = document.createElement('div');
        div.className = 'water-item fade-in';
        div.dataset.id = glass.id;
        div.dataset.category = 'water';
        
        const isChecked = getChecklistState(glass.id, 'water');
        if (isChecked) div.classList.add('checked');
        
        div.innerHTML = `
            <div class="water-number">${glass.number}</div>
            <div class="water-label">Gelas</div>
        `;
        
        div.addEventListener('click', function() {
            const isChecked = this.classList.toggle('checked');
            updateChecklistState(glass.id, 'water', isChecked);
            updateHealthProgress();
        });
        
        container.appendChild(div);
    });
}

function renderMealChecklist() {
    const container = document.getElementById('mealChecklist');
    if (!container) return;
    
    container.innerHTML = '';
    
    MEAL_SCHEDULE.forEach(item => {
        const div = document.createElement('div');
        div.className = 'meal-item fade-in';
        div.dataset.id = item.id;
        div.dataset.category = 'meals';
        
        const isChecked = getChecklistState(item.id, 'meals');
        if (isChecked) div.classList.add('checked');
        
        const checkbox = document.createElement('div');
        checkbox.className = 'meal-checkbox';
        
        const info = document.createElement('div');
        info.className = 'meal-info';
        
        const time = document.createElement('div');
        time.className = 'meal-time';
        time.textContent = item.time;
        
        const desc = document.createElement('div');
        desc.className = 'meal-desc';
        desc.textContent = item.name;
        
        info.appendChild(time);
        info.appendChild(desc);
        
        div.appendChild(checkbox);
        div.appendChild(info);
        
        div.addEventListener('click', function() {
            const isChecked = this.classList.toggle('checked');
            updateChecklistState(item.id, 'meals', isChecked);
            updateHealthProgress();
        });
        
        container.appendChild(div);
    });
}

function calculateHealthProgress() {
    const categories = ['sholat', 'routine', 'workout', 'extra', 'meals', 'water'];
    let totalItems = 0;
    let completedItems = 0;
    
    // Count total and completed items
    categories.forEach(category => {
        const storageData = loadFromStorage();
        const categoryData = storageData[category] || {};
        
        let categoryItems = 0;
        let categoryCompleted = 0;
        
        switch(category) {
            case 'sholat':
                categoryItems = SHOLAT_SCHEDULE.length;
                SHOLAT_SCHEDULE.forEach(item => {
                    if (categoryData[item.id]) categoryCompleted++;
                });
                break;
                
            case 'routine':
                // Adjust for Sunday (no school)
                let routineItems = DAILY_ROUTINE.length;
                if (isSunday()) routineItems--; // Remove school
                
                categoryItems = routineItems;
                DAILY_ROUTINE.forEach(item => {
                    if (item.id === 'sekolah' && isSunday()) return; // Skip school on Sunday
                    if (categoryData[item.id]) categoryCompleted++;
                });
                break;
                
            case 'workout':
                categoryItems = MANDATORY_WORKOUT.length;
                MANDATORY_WORKOUT.forEach(item => {
                    if (categoryData[item.id]) categoryCompleted++;
                });
                break;
                
            case 'extra':
                if (!isThursday()) break; // Skip if not Thursday
                categoryItems = EXTRA_WORKOUT.length;
                EXTRA_WORKOUT.forEach(item => {
                    if (categoryData[item.id]) categoryCompleted++;
                });
                break;
                
            case 'meals':
                categoryItems = MEAL_SCHEDULE.length;
                MEAL_SCHEDULE.forEach(item => {
                    if (categoryData[item.id]) categoryCompleted++;
                });
                break;
                
            case 'water':
                categoryItems = WATER_GLASSES.length;
                WATER_GLASSES.forEach(glass => {
                    if (categoryData[glass.id]) categoryCompleted++;
                });
                break;
        }
        
        totalItems += categoryItems;
        completedItems += categoryCompleted;
    });
    
    return {
        completed: completedItems,
        total: totalItems,
        percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    };
}

function updateHealthProgress() {
    const progress = calculateHealthProgress();
    
    // Update progress bar
    const progressFill = document.getElementById('healthProgressFill');
    if (progressFill) {
        progressFill.style.width = `${progress.percentage}%`;
        progressFill.textContent = `${progress.percentage}%`;
        
        // Update color based on percentage
        if (progress.percentage < 50) {
            progressFill.style.background = 'linear-gradient(90deg, var(--danger), #ef4444)';
        } else if (progress.percentage < 80) {
            progressFill.style.background = 'linear-gradient(90deg, var(--warning), #f59e0b)';
        } else if (progress.percentage < 100) {
            progressFill.style.background = 'linear-gradient(90deg, var(--success), #10b981)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, var(--primary), var(--secondary))';
        }
    }
    
    // Update stats
    const completedCount = document.getElementById('completedCount');
    const totalCount = document.getElementById('totalCount');
    const healthPercentage = document.getElementById('healthPercentage');
    
    if (completedCount) completedCount.textContent = progress.completed;
    if (totalCount) totalCount.textContent = progress.total;
    if (healthPercentage) {
        healthPercentage.textContent = `${progress.percentage}%`;
        
        // Update color
        if (progress.percentage < 50) {
            healthPercentage.style.color = 'var(--danger)';
        } else if (progress.percentage < 80) {
            healthPercentage.style.color = 'var(--warning)';
        } else if (progress.percentage < 100) {
            healthPercentage.style.color = 'var(--success)';
        } else {
            healthPercentage.style.color = 'var(--primary)';
        }
    }
    
    // Update message
    const healthMessage = document.getElementById('healthMessage');
    if (healthMessage) {
        let message = '';
        let borderColor = '';
        
        if (progress.percentage < 50) {
            message = 'Disiplinmu robek. Perbaiki sekarang.';
            borderColor = 'var(--danger)';
        } else if (progress.percentage < 80) {
            message = 'Masih hidup, tapi jadwal badan kamu kacau.';
            borderColor = 'var(--warning)';
        } else if (progress.percentage < 100) {
            message = 'Tubuh mulai stabil. Jangan kendor.';
            borderColor = 'var(--success)';
        } else {
            message = 'Badannmu kelas unggulan. Lanjutkan.';
            borderColor = 'var(--primary)';
        }
        
        healthMessage.textContent = message;
        healthMessage.style.borderLeftColor = borderColor;
        
        // Add pulse animation for low percentage
        if (progress.percentage < 50) {
            healthMessage.classList.add('pulse');
        } else {
            healthMessage.classList.remove('pulse');
        }
    }
}

// ============================================
// RENDER FUNCTIONS - WEEKLY.HTML
// ============================================

function renderWeeklyDays() {
    const container = document.getElementById('weeklyDays');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card fade-in';
        
        const dayName = DAYS_ID[i];
        if (i === 4) dayCard.classList.add('thursday');
        if (i === 0) dayCard.classList.add('sunday');
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        
        const dayNameEl = document.createElement('div');
        dayNameEl.className = 'day-name';
        dayNameEl.textContent = dayName;
        
        const daySchedule = document.createElement('div');
        daySchedule.className = 'day-schedule';
        
        // Generate schedule for this day
        let scheduleHTML = '';
        
        // Sholat schedule
        scheduleHTML += '<strong>Sholat:</strong><br>';
        SHOLAT_SCHEDULE.forEach(s => {
            scheduleHTML += `• ${s.name}: ${s.time}<br>`;
        });
        
        // Routine schedule (adjust for Sunday)
        scheduleHTML += '<br><strong>Rutin:</strong><br>';
        DAILY_ROUTINE.forEach(r => {
            if (i === 0 && r.id === 'sekolah') {
                scheduleHTML += '• Sekolah: Libur<br>';
            } else {
                scheduleHTML += `• ${r.name}: ${r.time}<br>`;
            }
        });
        
        // Workout schedule
        scheduleHTML += '<br><strong>Olahraga:</strong><br>';
        MANDATORY_WORKOUT.forEach(w => {
            scheduleHTML += `• ${w.name}<br>`;
        });
        
        // Extra workout for Thursday
        if (i === 4) {
            scheduleHTML += '<br><strong>Extra Workout:</strong><br>';
            EXTRA_WORKOUT.forEach(ew => {
                scheduleHTML += `• ${ew.name}<br>`;
            });
        }
        
        daySchedule.innerHTML = scheduleHTML;
        
        dayHeader.appendChild(dayNameEl);
        dayCard.appendChild(dayHeader);
        dayCard.appendChild(daySchedule);
        container.appendChild(dayCard);
    }
}

function setupWeeklyCalculator() {
    const calculateBtn = document.getElementById('calculateWeekly');
    const scoreInput = document.getElementById('weeklyScore');
    const resultScore = document.getElementById('weeklyResultScore');
    const resultLabel = document.getElementById('weeklyResultLabel');
    
    if (!calculateBtn || !scoreInput) return;
    
    calculateBtn.addEventListener('click', function() {
        let score = parseInt(scoreInput.value) || 0;
        if (score < 0) score = 0;
        if (score > 100) score = 100;
        
        // Update score display
        if (resultScore) {
            resultScore.textContent = score;
            resultScore.style.color = getScoreColor(score);
        }
        
        // Update label
        let label = '';
        let borderColor = '';
        
        if (score < 50) {
            label = 'Pemalas bersertifikat. Sistem hidupmu error.';
            borderColor = 'var(--danger)';
        } else if (score < 80) {
            label = 'Masih mentok setengah rajin.';
            borderColor = 'var(--warning)';
        } else if (score < 100) {
            label = 'Kerja keras terlihat. Tinggal mentalnya.';
            borderColor = 'var(--success)';
        } else {
            label = 'Calon orang sukses nih… tapi jangan GR.';
            borderColor = 'var(--primary)';
        }
        
        if (resultLabel) {
            resultLabel.innerHTML = `<span class="label-text">${label}</span>`;
            resultLabel.style.borderLeftColor = borderColor;
        }
    });
    
    // Validate input on change
    scoreInput.addEventListener('input', function() {
        let value = parseInt(this.value) || 0;
        if (value < 0) this.value = 0;
        if (value > 100) this.value = 100;
    });
}

function getScoreColor(score) {
    if (score < 50) return 'var(--danger)';
    if (score < 80) return 'var(--warning)';
    if (score < 100) return 'var(--success)';
    return 'var(--primary)';
}

// ============================================
// RENDER FUNCTIONS - MONTHLY.HTML
// ============================================

function setupMonthlyCalculator() {
    const calculateBtn = document.getElementById('calculateMonthly');
    const m1Input = document.getElementById('m1');
    const m2Input = document.getElementById('m2');
    const m3Input = document.getElementById('m3');
    const m4Input = document.getElementById('m4');
    
    if (!calculateBtn) return;
    
    calculateBtn.addEventListener('click', function() {
        const m1 = parseInt(m1Input.value) || 0;
        const m2 = parseInt(m2Input.value) || 0;
        const m3 = parseInt(m3Input.value) || 0;
        const m4 = parseInt(m4Input.value) || 0;
        
        const average = Math.round((m1 + m2 + m3 + m4) / 4);
        
        // Update average display
        const averageEl = document.getElementById('monthlyAverage');
        if (averageEl) {
            averageEl.textContent = average;
            averageEl.style.color = getScoreColor(average);
        }
        
        // Update label
        const labelEl = document.getElementById('monthlyLabel');
        if (labelEl) {
            let label = '';
            let borderColor = '';
            
            if (average < 50) {
                label = 'Pemalas tingkat akhir. Satu bulan hilang begitu saja.';
                borderColor = 'var(--danger)';
            } else if (average < 80) {
                label = 'Kemauan ada, eksekusi payah.';
                borderColor = 'var(--warning)';
            } else if (average < 100) {
                label = 'Disiplin kuat, kamu bergerak.';
                borderColor = 'var(--success)';
            } else {
                label = 'Kamu bukan manusia biasa. Model disiplin.';
                borderColor = 'var(--primary)';
            }
            
            labelEl.innerHTML = `<span class="label-text">${label}</span>`;
            labelEl.style.borderLeftColor = borderColor;
        }
        
        // Update stats
        updateMonthlyStats(m1, m2, m3, m4, average);
    });
    
    // Setup input validation
    [m1Input, m2Input, m3Input, m4Input].forEach(input => {
        input.addEventListener('input', function() {
            let value = parseInt(this.value) || 0;
            if (value < 0) this.value = 0;
            if (value > 100) this.value = 100;
        });
    });
}

function updateMonthlyStats(m1, m2, m3, m4, average) {
    // Find best week
    const scores = [m1, m2, m3, m4];
    const maxScore = Math.max(...scores);
    const bestWeekIndex = scores.indexOf(maxScore) + 1;
    
    const bestWeekEl = document.getElementById('bestWeek');
    if (bestWeekEl) {
        bestWeekEl.textContent = `M${bestWeekIndex} (${maxScore})`;
        bestWeekEl.style.color = getScoreColor(maxScore);
    }
    
    // Calculate trend
    const trendEl = document.getElementById('monthlyTrend');
    if (trendEl) {
        let trend = '';
        let trendColor = '';
        
        if (m4 > m1) {
            trend = '↑ Meningkat';
            trendColor = 'var(--success)';
        } else if (m4 < m1) {
            trend = '↓ Menurun';
            trendColor = 'var(--danger)';
        } else {
            trend = '→ Stabil';
            trendColor = 'var(--warning)';
        }
        
        trendEl.textContent = trend;
        trendEl.style.color = trendColor;
    }
    
    // Calculate consistency
    const consistencyEl = document.getElementById('consistency');
    if (consistencyEl) {
        const mean = average;
        const deviations = scores.map(score => Math.abs(score - mean));
        const avgDeviation = deviations.reduce((a, b) => a + b) / scores.length;
        const consistency = Math.max(0, 100 - avgDeviation);
        
        consistencyEl.textContent = `${Math.round(consistency)}%`;
        consistencyEl.style.color = getScoreColor(consistency);
    }
    
    // Update analysis
    const analysisEl = document.getElementById('monthlyAnalysis');
    if (analysisEl) {
        let analysis = '';
        
        if (average >= 80) {
            analysis = 'Performa luar biasa! Konsistensi bulan ini menunjukkan disiplin yang kuat. Pertahankan momentum ini untuk bulan depan dengan menetapkan target yang lebih tinggi.';
        } else if (average >= 60) {
            analysis = 'Performa cukup baik. Terlihat usaha konsisten, tapi masih ada ruang untuk peningkatan. Fokus pada minggu dengan skor terendah dan identifikasi area yang perlu perbaikan.';
        } else {
            analysis = 'Perlu evaluasi serius. Identifikasi penyebab performa rendah dan buat rencana perbaikan untuk bulan depan. Mulai dari hal kecil yang konsisten dan fokus pada satu perubahan positif setiap minggu.';
        }
        
        analysisEl.textContent = analysis;
    }
}

// ============================================
// INITIALIZATION FUNCTIONS
// ============================================

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                navMenu.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
}

function initCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            renderCurrentDate();
            renderSholatChecklist();
            renderRoutineChecklist();
            renderWorkoutChecklist();
            renderExtraWorkoutChecklist();
            renderWaterChecklist();
            renderMealChecklist();
            updateHealthProgress();
            break;
            
        case 'weekly.html':
            renderWeeklyDays();
            setupWeeklyCalculator();
            break;
            
        case 'monthly.html':
            setupMonthlyCalculator();
            break;
    }
}

// ============================================
// MAIN INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize current page
    initCurrentPage();
    
    // Add fade-in animation to all cards
    setTimeout(function() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(function(card, index) {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }, 100);
    
    // Add animation to checklist items
    setTimeout(function() {
        const checklistItems = document.querySelectorAll('.checklist-item, .water-item, .meal-item');
        checklistItems.forEach(function(item, index) {
            item.style.animationDelay = `${index * 0.05}s`;
            item.classList.add('fade-in');
        });
    }, 200);
});

// ============================================
// UTILITY FUNCTIONS FOR DEBUGGING
// ============================================

function resetDailyChecklist() {
    if (confirm('Reset semua checklist hari ini?')) {
        const key = getStorageKey();
        localStorage.removeItem(key);
        location.reload();
    }
}

function exportDailyData() {
    const data = loadFromStorage();
    const progress = calculateHealthProgress();
    
    const exportData = {
        date: new Date().toISOString(),
        day: DAYS_ID[getCurrentDay()],
        data: data,
        progress: progress,
        summary: {
            sholat: Object.values(data.sholat || {}).filter(Boolean).length + '/' + SHOLAT_SCHEDULE.length,
            routine: Object.values(data.routine || {}).filter(Boolean).length + '/' + (DAILY_ROUTINE.length - (isSunday() ? 1 : 0)),
            workout: Object.values(data.workout || {}).filter(Boolean).length + '/' + MANDATORY_WORKOUT.length,
            extra: isThursday() ? Object.values(data.extra || {}).filter(Boolean).length + '/' + EXTRA_WORKOUT.length : 'N/A',
            meals: Object.values(data.meals || {}).filter(Boolean).length + '/' + MEAL_SCHEDULE.length,
            water: Object.values(data.water || {}).filter(Boolean).length + '/' + WATER_GLASSES.length
        }
    };
    
    console.log('Daily Data Export:', exportData);
    alert('Data harian telah diekspor ke console (F12 untuk melihat)');
}

// Make functions available globally for debugging
window.resetDailyChecklist = resetDailyChecklist;
window.exportDailyData = exportDailyData;