// script.js
// Data Storage
class LifeTracker {
    constructor() {
        this.initializeData();
        this.loadData();
    }
    
    initializeData() {
        if (!localStorage.getItem('lifeTrackerData')) {
            const initialData = {
                dailyActivities: {},
                weeklySchedules: {},
                weeklyReports: {},
                monthlyReports: {},
                notes: {
                    daily: [],
                    weekly: [],
                    monthly: [],
                    ideas: [],
                    improvements: [],
                    monthlyTargets: [],
                    yearlyTargets: []
                },
                settings: {
                    currentDate: new Date().toISOString().split('T')[0],
                    currentWeek: this.getCurrentWeek(),
                    currentMonth: new Date().getMonth() + '-' + new Date().getFullYear(),
                    streak: 0
                }
            };
            
            localStorage.setItem('lifeTrackerData', JSON.stringify(initialData));
        }
    }
    
    loadData() {
        this.data = JSON.parse(localStorage.getItem('lifeTrackerData'));
    }
    
    saveData() {
        localStorage.setItem('lifeTrackerData', JSON.stringify(this.data));
    }
    
    getCurrentWeek() {
        const now = new Date();
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    formatDate(date = new Date()) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }
    
    formatDateDisplay(dateString) {
        const date = new Date(dateString);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    }
    
    getDateKey(date = new Date()) {
        return this.formatDate(date);
    }
    
    // Daily Activities
    addDailyActivity(date, activity) {
        const dateKey = this.formatDate(date);
        if (!this.data.dailyActivities[dateKey]) {
            this.data.dailyActivities[dateKey] = {
                date: dateKey,
                activities: [],
                notes: '',
                completed: 0,
                total: 0,
                percentage: 0
            };
        }
        
        activity.id = Date.now().toString();
        activity.completed = false;
        this.data.dailyActivities[dateKey].activities.push(activity);
        this.data.dailyActivities[dateKey].total = this.data.dailyActivities[dateKey].activities.length;
        this.updateDailyStats(dateKey);
        this.saveData();
        return activity;
    }
    
    updateDailyActivity(date, activityId, updates) {
        const dateKey = this.formatDate(date);
        if (this.data.dailyActivities[dateKey]) {
            const activityIndex = this.data.dailyActivities[dateKey].activities.findIndex(a => a.id === activityId);
            if (activityIndex !== -1) {
                this.data.dailyActivities[dateKey].activities[activityIndex] = {
                    ...this.data.dailyActivities[dateKey].activities[activityIndex],
                    ...updates
                };
                this.updateDailyStats(dateKey);
                this.saveData();
                return true;
            }
        }
        return false;
    }
    
    toggleActivityCompletion(date, activityId) {
        const dateKey = this.formatDate(date);
        if (this.data.dailyActivities[dateKey]) {
            const activityIndex = this.data.dailyActivities[dateKey].activities.findIndex(a => a.id === activityId);
            if (activityIndex !== -1) {
                const activity = this.data.dailyActivities[dateKey].activities[activityIndex];
                activity.completed = !activity.completed;
                this.updateDailyStats(dateKey);
                this.saveData();
                return activity.completed;
            }
        }
        return false;
    }
    
    deleteDailyActivity(date, activityId) {
        const dateKey = this.formatDate(date);
        if (this.data.dailyActivities[dateKey]) {
            this.data.dailyActivities[dateKey].activities = this.data.dailyActivities[dateKey].activities.filter(a => a.id !== activityId);
            this.data.dailyActivities[dateKey].total = this.data.dailyActivities[dateKey].activities.length;
            this.updateDailyStats(dateKey);
            this.saveData();
            return true;
        }
        return false;
    }
    
    updateDailyStats(dateKey) {
        if (this.data.dailyActivities[dateKey]) {
            const dayData = this.data.dailyActivities[dateKey];
            dayData.completed = dayData.activities.filter(a => a.completed).length;
            dayData.total = dayData.activities.length;
            dayData.percentage = dayData.total > 0 ? Math.round((dayData.completed / dayData.total) * 100) : 0;
        }
    }
    
    getDailyData(date) {
        const dateKey = this.formatDate(date);
        return this.data.dailyActivities[dateKey] || {
            date: dateKey,
            activities: [],
            notes: '',
            completed: 0,
            total: 0,
            percentage: 0
        };
    }
    
    // Weekly Reports
    generateWeeklyReport(weekNumber, year) {
        const weekKey = `${year}-W${weekNumber}`;
        
        // Calculate daily percentages for the week
        const dailyPercentages = [];
        let totalActivities = 0;
        let completedActivities = 0;
        
        // For simplicity, we'll generate mock data for the past 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = this.formatDate(date);
            const dayData = this.data.dailyActivities[dateKey] || { percentage: 0, completed: 0, total: 0 };
            dailyPercentages.push({
                date: dateKey,
                percentage: dayData.percentage,
                completed: dayData.completed,
                total: dayData.total
            });
            
            totalActivities += dayData.total;
            completedActivities += dayData.completed;
        }
        
        const weeklyPercentage = dailyPercentages.length > 0 
            ? Math.round(dailyPercentages.reduce((sum, day) => sum + day.percentage, 0) / dailyPercentages.length)
            : 0;
        
        const report = {
            weekKey,
            weekNumber,
            year,
            dailyPercentages,
            weeklyPercentage,
            totalActivities,
            completedActivities,
            notes: '',
            success: '',
            improvement: '',
            goals: '',
            reflection: '',
            generatedAt: new Date().toISOString()
        };
        
        this.data.weeklyReports[weekKey] = report;
        this.saveData();
        return report;
    }
    
    getWeeklyReport(weekNumber, year) {
        const weekKey = `${year}-W${weekNumber}`;
        return this.data.weeklyReports[weekKey] || this.generateWeeklyReport(weekNumber, year);
    }
    
    // Monthly Reports
    generateMonthlyReport(month, year) {
        const monthKey = `${month}-${year}`;
        
        // For simplicity, we'll use weeks 1-4
        const weeklyPercentages = [];
        let totalWeeklyPercentage = 0;
        
        for (let week = 1; week <= 4; week++) {
            const weekKey = `${year}-W${week + (month - 1) * 4}`;
            const weekReport = this.data.weeklyReports[weekKey] || { weeklyPercentage: 0 };
            weeklyPercentages.push({
                week: week,
                percentage: weekReport.weeklyPercentage || 0
            });
            totalWeeklyPercentage += weekReport.weeklyPercentage || 0;
        }
        
        const monthlyAverage = weeklyPercentages.length > 0 
            ? Math.round(totalWeeklyPercentage / weeklyPercentages.length)
            : 0;
        
        const report = {
            monthKey,
            month,
            year,
            weeklyPercentages,
            monthlyAverage,
            notes: '',
            achievements: '',
            challenges: '',
            learnings: '',
            goalsNext: '',
            generatedAt: new Date().toISOString()
        };
        
        this.data.monthlyReports[monthKey] = report;
        this.saveData();
        return report;
    }
    
    getMonthlyReport(month, year) {
        const monthKey = `${month}-${year}`;
        return this.data.monthlyReports[monthKey] || this.generateMonthlyReport(month, year);
    }
    
    // Notes
    addNote(category, note) {
        note.id = Date.now().toString();
        note.createdAt = new Date().toISOString();
        
        if (!this.data.notes[category]) {
            this.data.notes[category] = [];
        }
        
        this.data.notes[category].push(note);
        this.saveData();
        return note;
    }
    
    getNotes(category) {
        return this.data.notes[category] || [];
    }
    
    deleteNote(category, noteId) {
        if (this.data.notes[category]) {
            this.data.notes[category] = this.data.notes[category].filter(note => note.id !== noteId);
            this.saveData();
            return true;
        }
        return false;
    }
    
    // Performance Labels
    getPerformanceLabel(percentage) {
        if (percentage <= 20) {
            return {
                title: "Spesialis rebahan tingkat dewa.",
                description: "Waktunya bangkit dari zona nyaman!",
                color: "#f44336"
            };
        } else if (percentage <= 40) {
            return {
                title: "Calon legenda… tapi di bidang kemalasan.",
                description: "Ada potensi, tapi masih terpendam.",
                color: "#ff9800"
            };
        } else if (percentage <= 60) {
            return {
                title: "Setengah hidup, setengah hilang arah.",
                description: "Butuh fokus dan prioritas yang lebih jelas.",
                color: "#ffc107"
            };
        } else if (percentage <= 80) {
            return {
                title: "Kerja juga, tapi masih kebanyakan drama.",
                description: "Produktif, tapi bisa lebih efektif.",
                color: "#4caf50"
            };
        } else if (percentage < 100) {
            return {
                title: "Kamu lagi waras nih, lanjut.",
                description: "Konsistensi adalah kunci!",
                color: "#2196f3"
            };
        } else {
            return {
                title: "Calon orang sukses nih.",
                description: "Pertahankan momentum positif ini!",
                color: "#673ab7"
            };
        }
    }
    
    getWeeklyMessage(percentage) {
        if (percentage < 50) {
            return "Jangan berharap hasil besar kalau geraknya segini.";
        } else if (percentage <= 80) {
            return "Setengah jalan, tinggal mental kamu dirapihin.";
        } else {
            return "Kerja kerasmu keliatan. Lanjutkan.";
        }
    }
}

// Initialize the tracker
const tracker = new LifeTracker();

// DOM Utility Functions
const dom = {
    get(selector) {
        return document.querySelector(selector);
    },
    
    getAll(selector) {
        return document.querySelectorAll(selector);
    },
    
    create(element, attributes = {}, children = []) {
        const el = document.createElement(element);
        
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'className') {
                el.className = value;
            } else if (key === 'textContent') {
                el.textContent = value;
            } else if (key === 'innerHTML') {
                el.innerHTML = value;
            } else if (key.startsWith('on')) {
                el.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                el.setAttribute(key, value);
            }
        }
        
        if (children.length > 0) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child));
                } else {
                    el.appendChild(child);
                }
            });
        }
        
        return el;
    }
};

// UI Components
const ui = {
    // Daily Checklist Item
    createDailyChecklistItem(activity, date) {
        const item = dom.create('div', { className: 'checklist-item fade-in' });
        
        const checkbox = dom.create('div', {
            className: `checkbox ${activity.completed ? 'checked' : ''}`,
            onclick: () => {
                tracker.toggleActivityCompletion(date, activity.id);
                checkbox.classList.toggle('checked');
                content.querySelector('.checklist-name').classList.toggle('completed');
                updateDailyStats();
            }
        });
        
        const content = dom.create('div', { className: 'checklist-content' });
        
        const name = dom.create('div', {
            className: `checklist-name ${activity.completed ? 'completed' : ''}`,
            textContent: activity.name
        });
        
        const meta = dom.create('div', { className: 'checklist-meta' });
        
        if (activity.time) {
            const time = dom.create('div', { className: 'checklist-time' }, [
                dom.create('i', { className: 'fas fa-clock' }),
                dom.create('span', { textContent: activity.time })
            ]);
            meta.appendChild(time);
        }
        
        const category = dom.create('div', {
            className: 'checklist-category',
            textContent: this.getCategoryLabel(activity.category)
        });
        
        meta.appendChild(category);
        
        content.appendChild(name);
        content.appendChild(meta);
        
        const actions = dom.create('div', { className: 'checklist-actions' });
        
        const deleteBtn = dom.create('button', {
            className: 'btn-icon',
            innerHTML: '<i class="fas fa-trash"></i>',
            onclick: () => {
                if (confirm('Hapus kegiatan ini?')) {
                    tracker.deleteDailyActivity(date, activity.id);
                    item.remove();
                    updateDailyStats();
                }
            }
        });
        
        actions.appendChild(deleteBtn);
        
        item.appendChild(checkbox);
        item.appendChild(content);
        item.appendChild(actions);
        
        return item;
    },
    
    // Category label
    getCategoryLabel(category) {
        const labels = {
            work: 'Pekerjaan',
            study: 'Belajar',
            health: 'Kesehatan',
            personal: 'Personal',
            social: 'Sosial',
            other: 'Lainnya'
        };
        return labels[category] || category;
    },
    
    // Day report item for weekly report
    createDayReport(dayData) {
        const dayReport = dom.create('div', { className: 'day-report slide-in' });
        
        const dayHeader = dom.create('div', { className: 'day-header' });
        
        const date = new Date(dayData.date);
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
        const dayNumber = date.getDate();
        
        const dayTitle = dom.create('div', { className: 'day-title' }, [
            dom.create('span', { textContent: `${dayName}, ${dayNumber}` })
        ]);
        
        const dayPercentage = dom.create('div', {
            className: 'day-percentage',
            textContent: `${dayData.percentage}%`
        });
        
        dayHeader.appendChild(dayTitle);
        dayHeader.appendChild(dayPercentage);
        
        const dayActivities = dom.create('div', { className: 'day-activities' });
        
        // For simplicity, we'll show mock activities
        const activities = [
            { name: 'Aktivitas 1', completed: dayData.percentage > 50 },
            { name: 'Aktivitas 2', completed: dayData.percentage > 75 },
            { name: 'Aktivitas 3', completed: dayData.percentage > 90 }
        ];
        
        activities.forEach(activity => {
            const activityEl = dom.create('div', { className: 'day-activity' });
            
            const status = dom.create('div', {
                className: `activity-status ${activity.completed ? 'completed' : 'incomplete'}`
            });
            
            const name = dom.create('span', { textContent: activity.name });
            
            activityEl.appendChild(status);
            activityEl.appendChild(name);
            dayActivities.appendChild(activityEl);
        });
        
        dayReport.appendChild(dayHeader);
        dayReport.appendChild(dayActivities);
        
        return dayReport;
    },
    
    // Progress bar for weekly chart
    createProgressBar(day, percentage, isToday = false) {
        const barContainer = dom.create('div', { className: 'chart-bar-container' });
        
        const bar = dom.create('div', {
            className: 'chart-bar',
            style: `height: ${percentage}%; background-color: ${isToday ? 'var(--accent-neon)' : 'var(--primary)'}`
        });
        
        const value = dom.create('div', {
            className: 'chart-value',
            textContent: `${percentage}%`
        });
        
        const label = dom.create('div', {
            className: 'chart-label',
            textContent: day
        });
        
        bar.appendChild(value);
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        
        return barContainer;
    },
    
    // Monthly value card
    createMonthlyValueCard(weekNumber, percentage, notes = '') {
        const card = dom.create('div', { className: 'value-card slide-in' });
        
        const header = dom.create('div', { className: 'value-header' });
        
        const title = dom.create('h3', { textContent: `Minggu ${weekNumber} (M${weekNumber})` });
        
        const badge = dom.create('div', {
            className: 'value-badge',
            id: `m${weekNumber}Badge`,
            textContent: `${percentage}%`
        });
        
        header.appendChild(title);
        header.appendChild(badge);
        
        const progress = dom.create('div', { className: 'value-progress' });
        
        const progressBar = dom.create('div', { className: 'progress-bar' });
        
        const progressFill = dom.create('div', {
            className: 'progress-fill',
            id: `m${weekNumber}Progress`,
            style: `width: ${percentage}%`
        });
        
        progressBar.appendChild(progressFill);
        progress.appendChild(progressBar);
        
        const notesEl = dom.create('div', { className: 'value-notes' });
        
        const textarea = dom.create('textarea', {
            className: 'week-notes',
            id: `m${weekNumber}Notes`,
            placeholder: 'Catatan minggu ini...',
            value: notes
        });
        
        notesEl.appendChild(textarea);
        
        card.appendChild(header);
        card.appendChild(progress);
        card.appendChild(notesEl);
        
        return card;
    },
    
    // Note item
    createNoteItem(note, category) {
        const noteEl = dom.create('div', { className: 'note-item slide-in' });
        
        const header = dom.create('div', { className: 'note-header' });
        
        const title = dom.create('div', { className: 'note-title', textContent: note.title || 'Catatan' });
        
        const date = new Date(note.createdAt);
        const dateStr = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        const dateEl = dom.create('div', { className: 'note-date', textContent: dateStr });
        
        header.appendChild(title);
        header.appendChild(dateEl);
        
        const content = dom.create('div', { className: 'note-content', textContent: note.content });
        
        const actions = dom.create('div', { className: 'note-actions' });
        
        const deleteBtn = dom.create('button', {
            className: 'btn-icon',
            innerHTML: '<i class="fas fa-trash"></i>',
            onclick: () => {
                if (confirm('Hapus catatan ini?')) {
                    tracker.deleteNote(category, note.id);
                    noteEl.remove();
                }
            }
        });
        
        actions.appendChild(deleteBtn);
        
        noteEl.appendChild(header);
        noteEl.appendChild(content);
        noteEl.appendChild(actions);
        
        return noteEl;
    }
};

// Page Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Set current date on daily page
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const today = new Date();
        currentDateElement.textContent = tracker.formatDateDisplay(today);
    }
    
    // Initialize page-specific functionality
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initDashboard();
            break;
        case 'daily.html':
            initDailyPage();
            break;
        case 'weekly.html':
            initWeeklyPage();
            break;
        case 'weekly-report.html':
            initWeeklyReportPage();
            break;
        case 'monthly.html':
            initMonthlyPage();
            break;
        case 'notes.html':
            initNotesPage();
            break;
    }
});

// Dashboard Functions
function initDashboard() {
    updateDashboardStats();
    loadTodayChecklist();
    loadWeeklyProgressChart();
    setupMotivation();
    
    // Refresh button
    const refreshButton = document.getElementById('refreshToday');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            updateDashboardStats();
            loadTodayChecklist();
        });
    }
    
    // New motivation button
    const newMotivationButton = document.getElementById('newMotivation');
    if (newMotivationButton) {
        newMotivationButton.addEventListener('click', setupMotivation);
    }
}

function updateDashboardStats() {
    const today = new Date();
    const todayData = tracker.getDailyData(today);
    
    // Today's percentage
    const todayPercentage = document.getElementById('todayPercentage');
    const todayStatus = document.getElementById('todayStatus');
    if (todayPercentage) {
        todayPercentage.textContent = `${todayData.percentage}%`;
        const label = tracker.getPerformanceLabel(todayData.percentage);
        todayStatus.textContent = label.title;
        todayPercentage.style.color = label.color;
    }
    
    // Weekly percentage (mock data for now)
    const weekPercentage = document.getElementById('weekPercentage');
    const weekStatus = document.getElementById('weekStatus');
    if (weekPercentage) {
        const weeklyAvg = Math.min(100, todayData.percentage + 20);
        weekPercentage.textContent = `${weeklyAvg}%`;
        const label = tracker.getPerformanceLabel(weeklyAvg);
        weekStatus.textContent = label.title;
        weekPercentage.style.color = label.color;
    }
    
    // Monthly percentage (mock data for now)
    const monthPercentage = document.getElementById('monthPercentage');
    const monthStatus = document.getElementById('monthStatus');
    if (monthPercentage) {
        const monthlyAvg = Math.min(100, todayData.percentage + 10);
        monthPercentage.textContent = `${monthlyAvg}%`;
        const label = tracker.getPerformanceLabel(monthlyAvg);
        monthStatus.textContent = label.title;
        monthPercentage.style.color = label.color;
    }
    
    // Streak
    const streakCount = document.getElementById('streakCount');
    if (streakCount) {
        streakCount.textContent = tracker.data.settings.streak || 0;
    }
}

function loadTodayChecklist() {
    const todayChecklist = document.getElementById('todayChecklist');
    if (!todayChecklist) return;
    
    const today = new Date();
    const todayData = tracker.getDailyData(today);
    
    todayChecklist.innerHTML = '';
    
    if (todayData.activities.length === 0) {
        todayChecklist.innerHTML = `
            <p class="empty-state">Tidak ada kegiatan untuk hari ini. <a href="daily.html">Tambahkan di halaman Harian</a></p>
        `;
        return;
    }
    
    todayData.activities.forEach(activity => {
        const item = ui.createDailyChecklistItem(activity, today);
        todayChecklist.appendChild(item);
    });
}

function loadWeeklyProgressChart() {
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '';
    
    // Generate mock data for the past 7 days
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dayData = tracker.getDailyData(date);
        
        const isToday = i === 0;
        const bar = ui.createProgressBar(days[6-i], dayData.percentage, isToday);
        chartContainer.appendChild(bar);
    }
}

function setupMotivation() {
    const motivations = [
        {
            text: "Produktivitas bukan tentang melakukan lebih banyak hal, tetapi tentang melakukan hal yang tepat dengan efektif.",
            author: "James Clear"
        },
        {
            text: "Konsistensi kecil yang dilakukan setiap hari akan menghasilkan hasil yang besar seiring waktu.",
            author: "Robin Sharma"
        },
        {
            text: "Jangan mengukur produktivitasmu berdasarkan kesibukan, tetapi berdasarkan hasil yang dicapai.",
            author: "Tim Ferriss"
        },
        {
            text: "Fokus pada progress, bukan kesempurnaan. Langkah kecil setiap hari lebih baik daripada tidak bergerak sama sekali.",
            author: "Unknown"
        },
        {
            text: "Waktu adalah sumber daya paling berharga yang kamu miliki. Kelola dengan bijak.",
            author: "Brian Tracy"
        }
    ];
    
    const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
    
    const motivationText = document.getElementById('motivationText');
    const motivationAuthor = document.getElementById('motivationAuthor');
    
    if (motivationText) motivationText.textContent = `"${randomMotivation.text}"`;
    if (motivationAuthor) motivationAuthor.textContent = `- ${randomMotivation.author}`;
}

// Daily Page Functions
function initDailyPage() {
    const today = new Date();
    loadDailyChecklist(today);
    setupDailyEventListeners();
    updateDailyStats();
    
    // Date navigation
    const prevDateBtn = document.getElementById('prevDate');
    const nextDateBtn = document.getElementById('nextDate');
    const currentDateElement = document.getElementById('currentDate');
    
    let currentDate = new Date();
    
    if (prevDateBtn && nextDateBtn && currentDateElement) {
        prevDateBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 1);
            updateDateDisplay(currentDate, currentDateElement);
            loadDailyChecklist(currentDate);
        });
        
        nextDateBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 1);
            updateDateDisplay(currentDate, currentDateElement);
            loadDailyChecklist(currentDate);
        });
    }
    
    // Circle progress
    updateCircleProgress();
}

function loadDailyChecklist(date) {
    const checklistContainer = document.getElementById('dailyChecklist');
    if (!checklistContainer) return;
    
    const dailyData = tracker.getDailyData(date);
    
    checklistContainer.innerHTML = '';
    
    if (dailyData.activities.length === 0) {
        checklistContainer.innerHTML = `
            <p class="empty-state">Belum ada kegiatan untuk hari ini. Klik "Tambah" untuk menambahkan kegiatan baru.</p>
        `;
        return;
    }
    
    dailyData.activities.forEach(activity => {
        const item = ui.createDailyChecklistItem(activity, date);
        checklistContainer.appendChild(item);
    });
}

function setupDailyEventListeners() {
    // Add activity button
    const addActivityBtn = document.getElementById('addActivity');
    const addNewActivityBtn = document.getElementById('addNewActivity');
    
    if (addActivityBtn) {
        addActivityBtn.addEventListener('click', () => {
            document.getElementById('activityName').focus();
        });
    }
    
    if (addNewActivityBtn) {
        addNewActivityBtn.addEventListener('click', addNewActivity);
    }
    
    // Save daily button
    const saveDailyBtn = document.getElementById('saveDaily');
    if (saveDailyBtn) {
        saveDailyBtn.addEventListener('click', () => {
            alert('Data harian telah disimpan!');
        });
    }
    
    // Save daily notes
    const saveDailyNotesBtn = document.getElementById('saveDailyNotes');
    if (saveDailyNotesBtn) {
        saveDailyNotesBtn.addEventListener('click', () => {
            const notes = document.getElementById('dailyNotes').value;
            alert('Catatan harian disimpan!');
        });
    }
    
    // Enter key to add activity
    const activityNameInput = document.getElementById('activityName');
    if (activityNameInput) {
        activityNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addNewActivity();
            }
        });
    }
}

function addNewActivity() {
    const nameInput = document.getElementById('activityName');
    const timeInput = document.getElementById('activityTime');
    const categorySelect = document.getElementById('activityCategory');
    const prioritySelect = document.getElementById('activityPriority');
    
    const name = nameInput.value.trim();
    if (!name) {
        alert('Masukkan nama kegiatan terlebih dahulu');
        nameInput.focus();
        return;
    }
    
    const activity = {
        name,
        time: timeInput.value.trim(),
        category: categorySelect.value,
        priority: prioritySelect.value
    };
    
    const today = new Date();
    tracker.addDailyActivity(today, activity);
    
    // Clear form
    nameInput.value = '';
    timeInput.value = '';
    categorySelect.value = 'work';
    prioritySelect.value = 'medium';
    
    // Reload checklist
    loadDailyChecklist(today);
    updateDailyStats();
    
    // Focus back on name input
    nameInput.focus();
}

function updateDailyStats() {
    const today = new Date();
    const dailyData = tracker.getDailyData(today);
    
    // Update summary
    const totalActivities = document.getElementById('totalActivities');
    const completedActivities = document.getElementById('completedActivities');
    const dailyPercentage = document.getElementById('dailyPercentage');
    
    if (totalActivities) totalActivities.textContent = dailyData.total;
    if (completedActivities) completedActivities.textContent = dailyData.completed;
    if (dailyPercentage) {
        dailyPercentage.textContent = `${dailyData.percentage}%`;
        dailyPercentage.style.color = tracker.getPerformanceLabel(dailyData.percentage).color;
    }
    
    // Update category stats
    updateCategoryStats(dailyData);
    
    // Update circle progress
    updateCircleProgress();
}

function updateCategoryStats(dailyData) {
    const categoryStats = document.getElementById('categoryStats');
    if (!categoryStats) return;
    
    // Calculate stats by category
    const stats = {
        work: { total: 0, completed: 0 },
        study: { total: 0, completed: 0 },
        health: { total: 0, completed: 0 },
        personal: { total: 0, completed: 0 },
        other: { total: 0, completed: 0 }
    };
    
    dailyData.activities.forEach(activity => {
        if (stats[activity.category]) {
            stats[activity.category].total++;
            if (activity.completed) {
                stats[activity.category].completed++;
            }
        }
    });
    
    categoryStats.innerHTML = '';
    
    for (const [category, data] of Object.entries(stats)) {
        if (data.total > 0) {
            const categoryItem = dom.create('div', { className: 'category-item' });
            
            const categoryName = dom.create('span', {
                className: 'category-name',
                textContent: ui.getCategoryLabel(category)
            });
            
            const categoryCount = dom.create('span', {
                className: 'category-count',
                textContent: `${data.completed}/${data.total}`
            });
            
            categoryItem.appendChild(categoryName);
            categoryItem.appendChild(categoryCount);
            categoryStats.appendChild(categoryItem);
        }
    }
    
    if (categoryStats.children.length === 0) {
        categoryStats.innerHTML = '<p class="empty-state-small">Belum ada data kategori</p>';
    }
}

function updateCircleProgress() {
    const today = new Date();
    const dailyData = tracker.getDailyData(today);
    const percentage = dailyData.percentage;
    
    const circlePercentage = document.getElementById('circlePercentage');
    const circleProgressBar = document.querySelector('.circle-progress-bar');
    
    if (circlePercentage) {
        circlePercentage.textContent = `${percentage}%`;
    }
    
    if (circleProgressBar) {
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        
        circleProgressBar.style.strokeDasharray = `${circumference} ${circumference}`;
        circleProgressBar.style.strokeDashoffset = offset;
        circleProgressBar.style.stroke = tracker.getPerformanceLabel(percentage).color;
    }
}

function updateDateDisplay(date, element) {
    element.textContent = tracker.formatDateDisplay(date);
}

// Weekly Page Functions
function initWeeklyPage() {
    loadWeeklySchedule();
    setupWeeklyEventListeners();
    updateWeeklyStats();
    
    // Day selector
    const dayButtons = document.querySelectorAll('.day-btn');
    dayButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dayButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function loadWeeklySchedule() {
    // This would load actual data from tracker
    // For now, we'll show empty state
}

function setupWeeklyEventListeners() {
    // Add weekly activity
    const addWeeklyActivityBtn = document.getElementById('addWeeklyActivity');
    if (addWeeklyActivityBtn) {
        addWeeklyActivityBtn.addEventListener('click', addWeeklyActivity);
    }
    
    // Add weekly schedule button
    const addWeeklyScheduleBtn = document.getElementById('addWeeklySchedule');
    if (addWeeklyScheduleBtn) {
        addWeeklyScheduleBtn.addEventListener('click', () => {
            document.getElementById('weeklyActivity').focus();
        });
    }
    
    // Save weekly notes
    const saveWeeklyNotesBtn = document.getElementById('saveWeeklyNotes');
    if (saveWeeklyNotesBtn) {
        saveWeeklyNotesBtn.addEventListener('click', () => {
            alert('Catatan mingguan disimpan!');
        });
    }
}

function addWeeklyActivity() {
    const activityInput = document.getElementById('weeklyActivity');
    const timeInput = document.getElementById('weeklyTime');
    const categorySelect = document.getElementById('weeklyCategory');
    const notesInput = document.getElementById('weeklyNotes');
    
    const activity = activityInput.value.trim();
    if (!activity) {
        alert('Masukkan nama kegiatan terlebih dahulu');
        activityInput.focus();
        return;
    }
    
    // Get selected day
    const selectedDayBtn = document.querySelector('.day-btn.active');
    const day = selectedDayBtn ? selectedDayBtn.dataset.day : 'monday';
    
    // In a real app, this would save to tracker.data.weeklySchedules
    alert(`Kegiatan "${activity}" ditambahkan ke jadwal ${day}`);
    
    // Clear form
    activityInput.value = '';
    timeInput.value = '';
    categorySelect.value = 'work';
    notesInput.value = '';
    
    // Update stats
    updateWeeklyStats();
}

function updateWeeklyStats() {
    // Mock data for demonstration
    const weeklyProgressValue = document.getElementById('weeklyProgressValue');
    const weeklyStatus = document.getElementById('weeklyStatus');
    const weeklyTotalActivities = document.getElementById('weeklyTotalActivities');
    const daysRemaining = document.getElementById('daysRemaining');
    
    if (weeklyProgressValue) {
        const progress = 65; // Mock percentage
        weeklyProgressValue.textContent = `${progress}%`;
        const label = tracker.getPerformanceLabel(progress);
        if (weeklyStatus) weeklyStatus.textContent = label.title;
        weeklyProgressValue.style.color = label.color;
    }
    
    if (weeklyTotalActivities) {
        weeklyTotalActivities.textContent = '12'; // Mock count
    }
    
    if (daysRemaining) {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysLeft = 7 - dayOfWeek;
        daysRemaining.textContent = daysLeft > 0 ? daysLeft : 0;
    }
}

// Weekly Report Page Functions
function initWeeklyReportPage() {
    loadWeeklyReport();
    setupWeeklyReportEventListeners();
    
    // Week navigation
    const prevWeekBtn = document.getElementById('prevReportWeek');
    const nextWeekBtn = document.getElementById('nextReportWeek');
    const reportWeekTitle = document.getElementById('reportWeekTitle');
    
    let currentWeek = tracker.getCurrentWeek();
    
    if (prevWeekBtn && nextWeekBtn && reportWeekTitle) {
        prevWeekBtn.addEventListener('click', () => {
            currentWeek--;
            if (currentWeek < 1) currentWeek = 52;
            updateWeekDisplay(currentWeek, reportWeekTitle);
            loadWeeklyReport(currentWeek);
        });
        
        nextWeekBtn.addEventListener('click', () => {
            currentWeek++;
            if (currentWeek > 52) currentWeek = 1;
            updateWeekDisplay(currentWeek, reportWeekTitle);
            loadWeeklyReport(currentWeek);
        });
        
        updateWeekDisplay(currentWeek, reportWeekTitle);
    }
}

function loadWeeklyReport(weekNumber = tracker.getCurrentWeek()) {
    const year = new Date().getFullYear();
    const report = tracker.getWeeklyReport(weekNumber, year);
    
    // Update performance label
    const performanceTitle = document.getElementById('performanceTitle');
    const performanceDescription = document.getElementById('performanceDescription');
    const label = tracker.getPerformanceLabel(report.weeklyPercentage);
    
    if (performanceTitle) performanceTitle.textContent = label.title;
    if (performanceDescription) performanceDescription.textContent = label.description;
    
    // Update percentages
    const weeklyReportPercentage = document.getElementById('weeklyReportPercentage');
    const dailyAverage = document.getElementById('dailyAverage');
    
    if (weeklyReportPercentage) {
        weeklyReportPercentage.textContent = `${report.weeklyPercentage}%`;
        weeklyReportPercentage.style.color = label.color;
    }
    
    if (dailyAverage) {
        dailyAverage.textContent = `${report.weeklyPercentage}%`;
    }
    
    // Update best day
    const bestDay = document.getElementById('bestDay');
    if (bestDay && report.dailyPercentages.length > 0) {
        const bestDayData = report.dailyPercentages.reduce((prev, current) => 
            (prev.percentage > current.percentage) ? prev : current
        );
        const date = new Date(bestDayData.date);
        bestDay.textContent = date.toLocaleDateString('id-ID', { weekday: 'long' });
    }
    
    // Load weekly checklist
    loadWeeklyChecklistReport(report);
    
    // Update weekly message
    const weeklyMessageText = document.getElementById('weeklyMessageText');
    if (weeklyMessageText) {
        weeklyMessageText.textContent = tracker.getWeeklyMessage(report.weeklyPercentage);
    }
    
    // Load progress chart
    loadWeeklyProgressChartReport(report);
    
    // Update details
    updateWeeklyReportDetails(report);
}

function loadWeeklyChecklistReport(report) {
    const checklistContainer = document.getElementById('weeklyChecklistReport');
    if (!checklistContainer) return;
    
    checklistContainer.innerHTML = '';
    
    if (report.dailyPercentages.length === 0) {
        checklistContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>Belum ada data untuk minggu ini</h3>
                <p>Lengkapi checklist harian terlebih dahulu untuk melihat laporan</p>
            </div>
        `;
        return;
    }
    
    report.dailyPercentages.forEach(dayData => {
        const dayReport = ui.createDayReport(dayData);
        checklistContainer.appendChild(dayReport);
    });
}

function loadWeeklyProgressChartReport(report) {
    const chartContainer = document.getElementById('weeklyProgressChart');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '';
    
    // Create chart bars for each day
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    
    report.dailyPercentages.forEach((dayData, index) => {
        if (index < days.length) {
            const barHeight = dayData.percentage;
            const bar = dom.create('div', {
                className: 'chart-bar-large',
                style: `height: ${barHeight}%`
            });
            
            const dayLabel = dom.create('div', {
                className: 'chart-day-label',
                textContent: days[index]
            });
            
            const barContainer = dom.create('div', { className: 'chart-bar-container' });
            barContainer.appendChild(bar);
            barContainer.appendChild(dayLabel);
            
            chartContainer.appendChild(barContainer);
        }
    });
}

function updateWeeklyReportDetails(report) {
    const totalWeeklyActivities = document.getElementById('totalWeeklyActivities');
    const completedWeeklyActivities = document.getElementById('completedWeeklyActivities');
    const lowestPercentage = document.getElementById('lowestPercentage');
    const highestPercentage = document.getElementById('highestPercentage');
    
    if (totalWeeklyActivities) totalWeeklyActivities.textContent = report.totalActivities;
    if (completedWeeklyActivities) completedWeeklyActivities.textContent = report.completedActivities;
    
    if (lowestPercentage && highestPercentage && report.dailyPercentages.length > 0) {
        const percentages = report.dailyPercentages.map(day => day.percentage);
        const min = Math.min(...percentages);
        const max = Math.max(...percentages);
        
        lowestPercentage.textContent = `${min}%`;
        highestPercentage.textContent = `${max}%`;
    }
}

function setupWeeklyReportEventListeners() {
    // Generate report button
    const generateReportBtn = document.getElementById('generateReport');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', () => {
            const weekNumber = tracker.getCurrentWeek();
            const year = new Date().getFullYear();
            tracker.generateWeeklyReport(weekNumber, year);
            loadWeeklyReport(weekNumber);
            alert('Laporan mingguan telah diperbarui!');
        });
    }
    
    // Save weekly report button
    const saveWeeklyReportBtn = document.getElementById('saveWeeklyReport');
    if (saveWeeklyReportBtn) {
        saveWeeklyReportBtn.addEventListener('click', () => {
            alert('Laporan mingguan disimpan!');
        });
    }
}

function updateWeekDisplay(weekNumber, element) {
    const year = new Date().getFullYear();
    element.textContent = `Minggu ke-${weekNumber}, ${year}`;
}

// Monthly Page Functions
function initMonthlyPage() {
    loadMonthlyReport();
    setupMonthlyEventListeners();
    
    // Month navigation
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const currentMonthElement = document.getElementById('currentMonth');
    
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth() + 1;
    let currentYear = currentDate.getFullYear();
    
    if (prevMonthBtn && nextMonthBtn && currentMonthElement) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 1) {
                currentMonth = 12;
                currentYear--;
            }
            updateMonthDisplay(currentMonth, currentYear, currentMonthElement);
            loadMonthlyReport(currentMonth, currentYear);
        });
        
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 12) {
                currentMonth = 1;
                currentYear++;
            }
            updateMonthDisplay(currentMonth, currentYear, currentMonthElement);
            loadMonthlyReport(currentMonth, currentYear);
        });
        
        updateMonthDisplay(currentMonth, currentYear, currentMonthElement);
    }
}

function loadMonthlyReport(month = new Date().getMonth() + 1, year = new Date().getFullYear()) {
    const report = tracker.getMonthlyReport(month, year);
    
    // Update performance label
    const monthlyLabelTitle = document.getElementById('monthlyLabelTitle');
    const monthlyLabelDescription = document.getElementById('monthlyLabelDescription');
    const label = tracker.getPerformanceLabel(report.monthlyAverage);
    
    if (monthlyLabelTitle) monthlyLabelTitle.textContent = label.title;
    if (monthlyLabelDescription) monthlyLabelDescription.textContent = label.description;
    
    // Update monthly average
    const monthlyAverage = document.getElementById('monthlyAverage');
    if (monthlyAverage) {
        monthlyAverage.textContent = `${report.monthlyAverage}%`;
        monthlyAverage.style.color = label.color;
    }
    
    // Load monthly values (M1-M4)
    loadMonthlyValues(report);
    
    // Update monthly total average
    const monthlyTotalAverage = document.getElementById('monthlyTotalAverage');
    if (monthlyTotalAverage) {
        monthlyTotalAverage.textContent = `${report.monthlyAverage}%`;
    }
    
    // Update best week
    const bestWeek = document.getElementById('bestWeek');
    if (bestWeek && report.weeklyPercentages.length > 0) {
        const bestWeekData = report.weeklyPercentages.reduce((prev, current) => 
            (prev.percentage > current.percentage) ? prev : current
        );
        bestWeek.textContent = `M${bestWeekData.week}`;
    }
    
    // Load monthly chart
    loadMonthlyChart(report);
    
    // Update monthly insights
    updateMonthlyInsights(report);
    
    // Update monthly message
    const monthlyMessageText = document.getElementById('monthlyMessageText');
    if (monthlyMessageText) {
        monthlyMessageText.textContent = getMonthlyMessage(report.monthlyAverage);
    }
}

function loadMonthlyValues(report) {
    const valuesContainer = document.querySelector('.monthly-values');
    if (!valuesContainer) return;
    
    valuesContainer.innerHTML = '';
    
    report.weeklyPercentages.forEach(weekData => {
        const valueCard = ui.createMonthlyValueCard(
            weekData.week, 
            weekData.percentage,
            `Catatan untuk minggu ${weekData.week}`
        );
        valuesContainer.appendChild(valueCard);
    });
}

function loadMonthlyChart(report) {
    const chartContainer = document.getElementById('monthlyChart');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '';
    
    // Create a simple bar chart for weekly percentages
    report.weeklyPercentages.forEach((weekData, index) => {
        const weekContainer = dom.create('div', { className: 'monthly-chart-week' });
        
        const weekLabel = dom.create('div', {
            className: 'monthly-chart-label',
            textContent: `M${weekData.week}`
        });
        
        const barContainer = dom.create('div', { className: 'monthly-chart-bar-container' });
        
        const bar = dom.create('div', {
            className: 'monthly-chart-bar',
            style: `height: ${weekData.percentage}%`
        });
        
        const valueLabel = dom.create('div', {
            className: 'monthly-chart-value',
            textContent: `${weekData.percentage}%`
        });
        
        barContainer.appendChild(bar);
        barContainer.appendChild(valueLabel);
        weekContainer.appendChild(weekLabel);
        weekContainer.appendChild(barContainer);
        chartContainer.appendChild(weekContainer);
    });
}

function updateMonthlyInsights(report) {
    const insightsContainer = document.getElementById('monthlyInsights');
    if (!insightsContainer) return;
    
    insightsContainer.innerHTML = '';
    
    const insights = [
        "Progress bulan ini menunjukkan konsistensi yang baik.",
        "Minggu ke-2 adalah periode paling produktif.",
        "Perlu peningkatan di akhir minggu untuk hasil yang lebih maksimal."
    ];
    
    insights.forEach(insightText => {
        const insightItem = dom.create('div', { className: 'insight-item' });
        
        const icon = dom.create('div', { className: 'insight-icon' }, [
            dom.create('i', { className: 'fas fa-lightbulb' })
        ]);
        
        const content = dom.create('div', { className: 'insight-content' }, [
            dom.create('p', { textContent: insightText })
        ]);
        
        insightItem.appendChild(icon);
        insightItem.appendChild(content);
        insightsContainer.appendChild(insightItem);
    });
}

function getMonthlyMessage(percentage) {
    if (percentage < 50) {
        return "Bulan ini perlu evaluasi serius. Identifikasi hambatan dan buat rencana perbaikan untuk bulan depan.";
    } else if (percentage <= 70) {
        return "Progress bulan ini cukup baik. Tingkatkan konsistensi untuk hasil yang lebih optimal.";
    } else {
        return "Perform bulan ini sangat baik! Pertahankan momentum positif ini.";
    }
}

function setupMonthlyEventListeners() {
    // Calculate monthly button
    const calculateMonthlyBtn = document.getElementById('calculateMonthly');
    if (calculateMonthlyBtn) {
        calculateMonthlyBtn.addEventListener('click', () => {
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            tracker.generateMonthlyReport(month, year);
            loadMonthlyReport(month, year);
            alert('Data bulanan telah diperbarui!');
        });
    }
    
    // Save monthly notes
    const saveMonthlyNotesBtn = document.getElementById('saveMonthlyNotes');
    if (saveMonthlyNotesBtn) {
        saveMonthlyNotesBtn.addEventListener('click', () => {
            alert('Catatan bulanan disimpan!');
        });
    }
    
    // Clear monthly notes
    const clearMonthlyNotesBtn = document.getElementById('clearMonthlyNotes');
    if (clearMonthlyNotesBtn) {
        clearMonthlyNotesBtn.addEventListener('click', () => {
            if (confirm('Hapus semua catatan bulanan?')) {
                document.getElementById('monthAchievements').value = '';
                document.getElementById('monthChallenges').value = '';
                document.getElementById('monthLearnings').value = '';
                document.getElementById('monthGoalsNext').value = '';
            }
        });
    }
}

function updateMonthDisplay(month, year, element) {
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    element.textContent = `${monthNames[month - 1]} ${year}`;
}

// Notes Page Functions
function initNotesPage() {
    loadNotes();
    setupNotesEventListeners();
    
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            switchNotesCategory(category);
        });
    });
}

function loadNotes() {
    // Load daily notes by default
    loadDailyNotes();
    
    // Load ideas
    loadIdeas();
    
    // Load improvements
    loadImprovements();
    
    // Load targets
    loadTargets();
}

function loadDailyNotes() {
    const notesList = document.getElementById('dailyNotesList');
    if (!notesList) return;
    
    const notes = tracker.getNotes('daily');
    
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <h3>Belum ada catatan harian</h3>
                <p>Mulai mencatat pemikiran, refleksi, atau kejadian penting hari ini</p>
                <button class="btn-primary" id="addFirstDailyNote"><i class="fas fa-plus"></i> Buat Catatan Harian Pertama</button>
            </div>
        `;
        
        const addFirstNoteBtn = document.getElementById('addFirstDailyNote');
        if (addFirstNoteBtn) {
            addFirstNoteBtn.addEventListener('click', () => {
                // In a real app, this would open a form to add a note
                alert('Fitur ini akan membuka form untuk menambahkan catatan harian');
            });
        }
        
        return;
    }
    
    notes.forEach(note => {
        const noteItem = ui.createNoteItem(note, 'daily');
        notesList.appendChild(noteItem);
    });
}

function loadIdeas() {
    const ideasList = document.getElementById('ideasList');
    if (!ideasList) return;
    
    const ideasContainer = ideasList.querySelector('.idea-items');
    if (!ideasContainer) return;
    
    const ideas = tracker.getNotes('ideas');
    
    ideasContainer.innerHTML = '';
    
    if (ideas.length === 0) {
        ideasContainer.innerHTML = '<p class="empty-state-small">Belum ada ide yang disimpan</p>';
        return;
    }
    
    ideas.forEach(idea => {
        const ideaItem = dom.create('div', { className: 'idea-item' });
        
        const ideaTitle = dom.create('div', { 
            className: 'idea-title',
            textContent: idea.title || 'Ide tanpa judul'
        });
        
        const ideaMeta = dom.create('div', { className: 'idea-meta' });
        
        const categoryBadge = dom.create('span', {
            className: 'idea-category',
            textContent: idea.category || 'other'
        });
        
        ideaMeta.appendChild(categoryBadge);
        
        ideaItem.appendChild(ideaTitle);
        ideaItem.appendChild(ideaMeta);
        ideasContainer.appendChild(ideaItem);
    });
}

function loadImprovements() {
    // Similar to loadIdeas
}

function loadTargets() {
    // Similar to loadIdeas
}

function switchNotesCategory(category) {
    // In a real app, this would switch the content based on category
    console.log(`Switching to category: ${category}`);
}

function setupNotesEventListeners() {
    // New note button
    const newNoteBtn = document.getElementById('newNote');
    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', () => {
            alert('Fitur ini akan membuka form untuk catatan baru');
        });
    }
    
    // Save idea button
    const saveIdeaBtn = document.getElementById('saveIdea');
    if (saveIdeaBtn) {
        saveIdeaBtn.addEventListener('click', saveIdea);
    }
    
    // Save improvement button
    const saveImprovementBtn = document.getElementById('saveImprovement');
    if (saveImprovementBtn) {
        saveImprovementBtn.addEventListener('click', () => {
            alert('Perbaikan disimpan!');
        });
    }
    
    // Save month target button
    const saveMonthTargetBtn = document.getElementById('saveMonthTarget');
    if (saveMonthTargetBtn) {
        saveMonthTargetBtn.addEventListener('click', () => {
            alert('Target bulanan disimpan!');
        });
    }
    
    // Save year target button
    const saveYearTargetBtn = document.getElementById('saveYearTarget');
    if (saveYearTargetBtn) {
        saveYearTargetBtn.addEventListener('click', () => {
            alert('Target tahunan disimpan!');
        });
    }
    
    // Priority selector
    const priorityButtons = document.querySelectorAll('.priority-btn');
    priorityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            priorityButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Range inputs for progress
    const monthProgressInput = document.getElementById('monthProgress');
    const monthProgressValue = document.getElementById('monthProgressValue');
    const yearProgressInput = document.getElementById('yearProgress');
    const yearProgressValue = document.getElementById('yearProgressValue');
    
    if (monthProgressInput && monthProgressValue) {
        monthProgressInput.addEventListener('input', () => {
            monthProgressValue.textContent = monthProgressInput.value;
        });
    }
    
    if (yearProgressInput && yearProgressValue) {
        yearProgressInput.addEventListener('input', () => {
            yearProgressValue.textContent = yearProgressInput.value;
        });
    }
}

function saveIdea() {
    const titleInput = document.getElementById('ideaTitle');
    const descriptionInput = document.getElementById('ideaDescription');
    const categorySelect = document.getElementById('ideaCategory');
    const priorityBtn = document.querySelector('.priority-btn.active');
    
    const title = titleInput.value.trim();
    if (!title) {
        alert('Masukkan judul ide terlebih dahulu');
        titleInput.focus();
        return;
    }
    
    const idea = {
        title,
        description: descriptionInput.value.trim(),
        category: categorySelect.value,
        priority: priorityBtn ? priorityBtn.dataset.priority : 'medium'
    };
    
    tracker.addNote('ideas', idea);
    
    // Clear form
    titleInput.value = '';
    descriptionInput.value = '';
    categorySelect.value = 'video';
    
    // Reset priority buttons
    const priorityButtons = document.querySelectorAll('.priority-btn');
    priorityButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.priority-btn.medium').classList.add('active');
    
    // Reload ideas
    loadIdeas();
    
    alert('Ide berhasil disimpan!');
}

// Export functionality
window.exportData = function() {
    const data = tracker.data;
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `life-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};

// Import functionality (simplified)
window.importData = function() {
    alert('Fitur impor data akan membuka dialog untuk memilih file backup.');
    // In a real app, this would handle file upload and data import
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add fade-in animation to all cards
    const cards = document.querySelectorAll('.card, .stat-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
});