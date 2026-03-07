/* ============================================
   SMART ATTENDANCE - MAIN APPLICATION
   ============================================ */

// ============ DATA STORE (localStorage) ============
const Store = {
    get(key, fallback = null) {
        try { return JSON.parse(localStorage.getItem('sa_' + key)) || fallback; }
        catch { return fallback; }
    },
    set(key, value) { localStorage.setItem('sa_' + key, JSON.stringify(value)); },
    remove(key) { localStorage.removeItem('sa_' + key); }
};

// ============ STATE ============
let members = Store.get('members', []);
let attendanceRecords = Store.get('records', []);
let currentMode = Store.get('mode', 'office');
let currentTheme = Store.get('theme', 'dark');
let accentColor = Store.get('accent', '#6c5ce7');

const today = () => new Date().toISOString().split('T')[0];

// ============ PARTICLE BACKGROUND ============
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            if (mouse.x !== null) {
                const dx = this.x - mouse.x, dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    this.x += dx / dist * 1.5;
                    this.y += dy / dist * 1.5;
                }
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(108, 92, 231, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(108, 92, 231, ${0.1 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
        requestAnimationFrame(animate);
    }
    animate();
}

// ============ SPLASH SCREEN ============
function initSplash() {
    setTimeout(() => {
        document.getElementById('splashScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        initAnimations();
        updateDashboard();
    }, 3000);
}

// ============ CLOCK & DATE ============
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clockTime').textContent = `${h}:${m}:${s}`;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

// ============ NAVIGATION ============
function initNavigation() {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            link.classList.add('active');
            document.getElementById('navLinks').classList.remove('show');
            initAnimations();
            if (sectionId === 'dashboard') updateDashboard();
            if (sectionId === 'records') renderRecords();
            if (sectionId === 'analytics') updateAnalytics();
        });
    });

    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('show');
    });

    window.addEventListener('scroll', () => {
        document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 10);
    });
}

// ============ MODE ============
function initMode() {
    const toggle = document.getElementById('modeToggle');
    const panel = document.getElementById('modeSelectorPanel');
    toggle.addEventListener('click', e => {
        e.stopPropagation();
        panel.classList.toggle('show');
    });
    document.addEventListener('click', () => panel.classList.remove('show'));
    panel.addEventListener('click', e => e.stopPropagation());

    document.querySelectorAll('.mode-option').forEach(opt => {
        if (opt.dataset.mode === currentMode) opt.classList.add('active');
        opt.addEventListener('click', () => {
            currentMode = opt.dataset.mode;
            Store.set('mode', currentMode);
            document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const icons = { office: 'fa-building', college: 'fa-graduation-cap', school: 'fa-school' };
            toggle.querySelector('i').className = 'fas ' + icons[currentMode];
            toggle.querySelector('.mode-label').textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
            panel.classList.remove('show');
            showToast('success', `Switched to ${currentMode} mode`);
        });
    });
}

// ============ THEME ============
function initTheme() {
    if (currentTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.setProperty('--primary', accentColor);

    document.getElementById('themeDark').addEventListener('click', () => setTheme('dark'));
    document.getElementById('themeLight').addEventListener('click', () => setTheme('light'));

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            accentColor = btn.dataset.color;
            document.documentElement.style.setProperty('--primary', accentColor);
            Store.set('accent', accentColor);
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function setTheme(theme) {
    currentTheme = theme;
    Store.set('theme', theme);
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
}

// ============ ADD MEMBER ============
function initAddMember() {
    document.getElementById('addMemberForm').addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('memberId').value.trim();
        const name = document.getElementById('memberName').value.trim();
        const dept = document.getElementById('memberDept').value.trim();
        if (!id || !name) return showToast('error', 'ID and Name are required');
        if (members.find(m => m.id === id)) return showToast('error', 'Member ID already exists');
        members.push({ id, name, dept, createdAt: new Date().toISOString() });
        Store.set('members', members);
        document.getElementById('addMemberForm').reset();
        renderAttendanceTable();
        updateDashboard();
        showToast('success', `${name} added successfully!`);
        createConfetti();
    });
}

// ============ ATTENDANCE TABLE ============
function renderAttendanceTable(filter = '') {
    const tbody = document.getElementById('attendanceBody');
    const empty = document.getElementById('tableEmpty');
    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(filter.toLowerCase()) ||
        m.id.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = filtered.map(m => {
        const rec = getTodayRecord(m.id);
        const status = rec ? rec.status : 'unmarked';
        const time = rec ? rec.time : '--:--';
        return `<tr>
            <td><strong>${m.id}</strong></td>
            <td>${m.name}</td>
            <td>${m.dept || '-'}</td>
            <td><span class="status-badge ${status}">
                <i class="fas fa-${status === 'present' ? 'check-circle' : status === 'absent' ? 'times-circle' : status === 'late' ? 'clock' : 'minus-circle'}"></i>
                ${status.charAt(0).toUpperCase() + status.slice(1)}
            </span></td>
            <td>${time}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn present-btn" title="Present" onclick="markStatus('${m.id}','present')"><i class="fas fa-check"></i></button>
                    <button class="action-btn absent-btn" title="Absent" onclick="markStatus('${m.id}','absent')"><i class="fas fa-times"></i></button>
                    <button class="action-btn late-btn" title="Late" onclick="markStatus('${m.id}','late')"><i class="fas fa-clock"></i></button>
                    <button class="action-btn delete-btn" title="Remove" onclick="removeMember('${m.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function getTodayRecord(memberId) {
    return attendanceRecords.find(r => r.memberId === memberId && r.date === today());
}

// ============ MARK STATUS ============
window.markStatus = function(memberId, status) {
    const now = new Date();
    const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const existing = attendanceRecords.findIndex(r => r.memberId === memberId && r.date === today());
    if (existing >= 0) attendanceRecords[existing] = { ...attendanceRecords[existing], status, time };
    else attendanceRecords.push({ memberId, date: today(), status, time });
    Store.set('records', attendanceRecords);
    renderAttendanceTable();
    updateDashboard();
    addActivity(memberId, status, time);
    const member = members.find(m => m.id === memberId);
    showToast(status === 'absent' ? 'error' : 'success', `${member?.name} marked as ${status}`);
};

window.removeMember = function(memberId) {
    if (!confirm('Remove this member?')) return;
    members = members.filter(m => m.id !== memberId);
    attendanceRecords = attendanceRecords.filter(r => r.memberId !== memberId);
    Store.set('members', members);
    Store.set('records', attendanceRecords);
    renderAttendanceTable();
    updateDashboard();
    showToast('info', 'Member removed');
};

// ============ MARK ALL PRESENT ============
function initMarkAll() {
    document.getElementById('markAllPresent').addEventListener('click', () => {
        if (members.length === 0) return showToast('error', 'No members to mark');
        members.forEach(m => markStatus(m.id, 'present'));
        showToast('success', 'All members marked present!');
        createConfetti();
    });
}

// ============ SEARCH ============
function initSearch() {
    document.getElementById('searchMember').addEventListener('input', e => {
        renderAttendanceTable(e.target.value);
    });
}

// ============ DASHBOARD UPDATE ============
function updateDashboard() {
    const todayRecords = attendanceRecords.filter(r => r.date === today());
    const present = todayRecords.filter(r => r.status === 'present').length;
    const absent = todayRecords.filter(r => r.status === 'absent').length;
    const late = todayRecords.filter(r => r.status === 'late').length;
    const total = members.length;

    animateNumber('totalPresent', present);
    animateNumber('totalAbsent', absent);
    animateNumber('totalLate', late);
    animateNumber('totalMembers', total);

    // Update rings
    const pct = total > 0 ? (present / total * 100) : 0;
    const aPct = total > 0 ? (absent / total * 100) : 0;
    const lPct = total > 0 ? (late / total * 100) : 0;
    document.querySelector('.present-ring').setAttribute('stroke-dasharray', `${pct}, 100`);
    document.querySelector('.absent-ring').setAttribute('stroke-dasharray', `${aPct}, 100`);
    document.querySelector('.late-ring').setAttribute('stroke-dasharray', `${lPct}, 100`);

    updateWeeklyChart();
}

function animateNumber(id, target) {
    const el = document.getElementById(id);
    const current = parseInt(el.textContent) || 0;
    const diff = target - current;
    const steps = 30;
    let step = 0;
    const timer = setInterval(() => {
        step++;
        el.textContent = Math.round(current + (diff * step / steps));
        if (step >= steps) { el.textContent = target; clearInterval(timer); }
    }, 20);
}

// ============ WEEKLY CHART ============
function updateWeeklyChart() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const dayOfWeek = now.getDay();
    days.forEach((day, i) => {
        const d = new Date(now);
        const diff = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek) + i;
        d.setDate(now.getDate() + diff);
        const dateStr = d.toISOString().split('T')[0];
        const dayRecords = attendanceRecords.filter(r => r.date === dateStr);
        const pCount = dayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        const aCount = dayRecords.filter(r => r.status === 'absent').length;
        const total = members.length || 1;
        const barGroup = document.querySelector(`.bar-group[data-day="${day}"]`);
        if (barGroup) {
            const bars = barGroup.querySelectorAll('.bar');
            bars[0].style.height = (pCount / total * 100) + '%';
            bars[1].style.height = (aCount / total * 100) + '%';
        }
    });
}

// ============ ACTIVITY FEED ============
let activities = Store.get('activities', []);

function addActivity(memberId, status, time) {
    const member = members.find(m => m.id === memberId);
    activities.unshift({ name: member?.name || memberId, status, time, date: today() });
    if (activities.length > 20) activities = activities.slice(0, 20);
    Store.set('activities', activities);
    renderActivities();
}

function renderActivities() {
    const feed = document.getElementById('activityFeed');
    const todayActivities = activities.filter(a => a.date === today());
    if (todayActivities.length === 0) {
        feed.innerHTML = '<div class="activity-empty"><i class="fas fa-inbox"></i><p>No recent activity</p></div>';
        return;
    }
    feed.innerHTML = todayActivities.slice(0, 10).map(a => `
        <div class="activity-item">
            <div class="activity-dot ${a.status}"></div>
            <div class="activity-text"><strong>${a.name}</strong> marked as <strong>${a.status}</strong></div>
            <span class="activity-time">${a.time}</span>
        </div>
    `).join('');
}

// ============ RECORDS ============
function renderRecords() {
    const tbody = document.getElementById('recordsBody');
    const empty = document.getElementById('recordsEmpty');
    const statusFilter = document.getElementById('recordStatusFilter').value;
    const dateFrom = document.getElementById('recordDateFrom').value;
    const dateTo = document.getElementById('recordDateTo').value;

    let filtered = [...attendanceRecords];
    if (statusFilter !== 'all') filtered = filtered.filter(r => r.status === statusFilter);
    if (dateFrom) filtered = filtered.filter(r => r.date >= dateFrom);
    if (dateTo) filtered = filtered.filter(r => r.date <= dateTo);
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = filtered.map(r => {
        const member = members.find(m => m.id === r.memberId);
        return `<tr>
            <td>${r.date}</td>
            <td>${r.memberId}</td>
            <td>${member?.name || 'Unknown'}</td>
            <td>${member?.dept || '-'}</td>
            <td><span class="status-badge ${r.status}">
                <i class="fas fa-${r.status === 'present' ? 'check-circle' : r.status === 'absent' ? 'times-circle' : 'clock'}"></i>
                ${r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </span></td>
            <td>${r.time}</td>
        </tr>`;
    }).join('');
}

function initRecords() {
    document.getElementById('filterRecords').addEventListener('click', renderRecords);
    document.getElementById('exportRecords').addEventListener('click', exportCSV);
}

function exportCSV() {
    if (attendanceRecords.length === 0) return showToast('error', 'No records to export');
    let csv = 'Date,ID,Name,Department,Status,Time\n';
    attendanceRecords.forEach(r => {
        const m = members.find(m2 => m2.id === r.memberId);
        csv += `${r.date},${r.memberId},"${m?.name || ''}","${m?.dept || ''}",${r.status},${r.time}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `attendance_${today()}.csv`;
    a.click();
    showToast('success', 'Records exported!');
}

// ============ ANALYTICS ============
function updateAnalytics() {
    renderTrendChart();
    renderTopAttendees();
    updateOverallStats();
}

function renderTrendChart() {
    const canvas = document.getElementById('trendCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const days = 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayRecs = attendanceRecords.filter(r => r.date === dateStr);
        const pct = members.length > 0 ? (dayRecs.filter(r => r.status === 'present' || r.status === 'late').length / members.length * 100) : 0;
        data.push(pct);
    }

    const w = canvas.width, h = canvas.height;
    const pad = 40, graphW = w - pad * 2, graphH = h - pad * 2;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    for (let i = 0; i <= 4; i++) {
        const y = pad + (graphH / 4) * i;
        ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y);
        ctx.strokeStyle = currentTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        ctx.stroke();
        ctx.fillStyle = currentTheme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
        ctx.font = '10px Inter';
        ctx.fillText((100 - 25 * i) + '%', 5, y + 4);
    }

    // Area fill
    const gradient = ctx.createLinearGradient(0, pad, 0, h - pad);
    gradient.addColorStop(0, 'rgba(108, 92, 231, 0.3)');
    gradient.addColorStop(1, 'rgba(108, 92, 231, 0.0)');

    ctx.beginPath();
    ctx.moveTo(pad, pad + graphH);
    data.forEach((val, i) => {
        const x = pad + (graphW / (data.length - 1)) * i;
        const y = pad + graphH - (val / 100 * graphH);
        ctx.lineTo(x, y);
    });
    ctx.lineTo(pad + graphW, pad + graphH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((val, i) => {
        const x = pad + (graphW / (data.length - 1)) * i;
        const y = pad + graphH - (val / 100 * graphH);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dots
    data.forEach((val, i) => {
        const x = pad + (graphW / (data.length - 1)) * i;
        const y = pad + graphH - (val / 100 * graphH);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#6c5ce7';
        ctx.fill();
    });
}

function renderTopAttendees() {
    const container = document.getElementById('topAttendees');
    if (members.length === 0 || attendanceRecords.length === 0) {
        container.innerHTML = '<div class="attendee-empty"><i class="fas fa-award"></i><p>No data yet</p></div>';
        return;
    }
    const rates = members.map(m => {
        const total = attendanceRecords.filter(r => r.memberId === m.id).length;
        const present = attendanceRecords.filter(r => r.memberId === m.id && (r.status === 'present' || r.status === 'late')).length;
        return { ...m, rate: total > 0 ? (present / total * 100) : 0 };
    }).sort((a, b) => b.rate - a.rate).slice(0, 5);

    container.innerHTML = rates.map((m, i) => `
        <div class="top-attendee-item">
            <div class="rank-badge ${i < 3 ? 'rank-' + (i + 1) : 'rank-other'}">${i + 1}</div>
            <div class="attendee-info">
                <div class="attendee-name">${m.name}</div>
                <div class="attendee-dept">${m.dept || '-'}</div>
            </div>
            <div class="attendee-rate">${m.rate.toFixed(0)}%</div>
        </div>
    `).join('');
}

function updateOverallStats() {
    const totalRecs = attendanceRecords.length;
    const presentRecs = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const absentRecs = attendanceRecords.filter(r => r.status === 'absent').length;
    const pct = totalRecs > 0 ? (presentRecs / totalRecs * 100) : 0;
    const uniqueDates = [...new Set(attendanceRecords.map(r => r.date))].length;

    document.getElementById('overallPresentPercent').textContent = pct.toFixed(0) + '%';
    document.querySelector('.overall-present-ring').setAttribute('stroke-dasharray', `${pct}, 100`);
    document.getElementById('totalDaysTracked').textContent = uniqueDates;
    document.getElementById('totalCheckins').textContent = presentRecs;
    document.getElementById('totalAbsences').textContent = absentRecs;
}

// ============ FAB + MODAL ============
function initFab() {
    const fab = document.getElementById('fabBtn');
    const modal = document.getElementById('quickAddModal');
    const close = document.getElementById('closeModal');
    const search = document.getElementById('quickSearch');

    fab.addEventListener('click', () => { modal.classList.add('show'); search.focus(); renderQuickResults(''); });
    close.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });

    search.addEventListener('input', e => renderQuickResults(e.target.value));
}

function renderQuickResults(query) {
    const container = document.getElementById('quickResults');
    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) || m.id.toLowerCase().includes(query.toLowerCase())
    );
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:20px;color:var(--text-muted)">No members found</p>';
        return;
    }
    container.innerHTML = filtered.map(m => {
        const rec = getTodayRecord(m.id);
        const status = rec ? rec.status : 'unmarked';
        return `<div class="quick-result-item">
            <div><strong>${m.name}</strong> <span style="color:var(--text-muted);font-size:0.8rem">${m.id}</span></div>
            <div class="action-btns">
                <button class="action-btn present-btn" onclick="markStatus('${m.id}','present');renderQuickResults('${m.name}')"><i class="fas fa-check"></i></button>
                <button class="action-btn absent-btn" onclick="markStatus('${m.id}','absent');renderQuickResults('${m.name}')"><i class="fas fa-times"></i></button>
                <button class="action-btn late-btn" onclick="markStatus('${m.id}','late');renderQuickResults('${m.name}')"><i class="fas fa-clock"></i></button>
            </div>
        </div>`;
    }).join('');
}

// ============ TOAST ============
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type]} toast-icon"></i><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 400); }, 3000);
}

// ============ CONFETTI ============
function createConfetti() {
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position:fixed;z-index:99999;width:10px;height:10px;
            border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
            background:hsl(${Math.random() * 360}, 80%, 60%);
            left:${Math.random() * 100}vw;top:-10px;
            pointer-events:none;
            animation:confettiFall ${1.5 + Math.random()}s ease-out forwards;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
    if (!document.getElementById('confettiStyle')) {
        const style = document.createElement('style');
        style.id = 'confettiStyle';
        style.textContent = `@keyframes confettiFall{
            0%{transform:translateY(0) rotate(0deg);opacity:1}
            100%{transform:translateY(100vh) rotate(${360 + Math.random() * 360}deg);opacity:0}
        }`;
        document.head.appendChild(style);
    }
}

// ============ SCROLL ANIMATIONS ============
function initAnimations() {
    const els = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => entry.target.classList.add('animated'), delay);
            }
        });
    }, { threshold: 0.1 });
    els.forEach(el => { el.classList.remove('animated'); observer.observe(el); });
}

// ============ SETTINGS ============
function initSettings() {
    document.getElementById('clearAllData').addEventListener('click', () => {
        if (!confirm('Are you sure? This will erase all data.')) return;
        members = []; attendanceRecords = []; activities = [];
        Store.set('members', []); Store.set('records', []); Store.set('activities', []);
        renderAttendanceTable(); updateDashboard(); renderRecords();
        showToast('info', 'All data cleared');
    });

    document.getElementById('exportAllData').addEventListener('click', () => {
        const data = { members, records: attendanceRecords, activities, mode: currentMode };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `smart_attendance_backup_${today()}.json`;
        a.click();
        showToast('success', 'Data exported!');
    });

    document.getElementById('importData').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.members) { members = data.members; Store.set('members', members); }
                if (data.records) { attendanceRecords = data.records; Store.set('records', attendanceRecords); }
                if (data.activities) { activities = data.activities; Store.set('activities', activities); }
                renderAttendanceTable(); updateDashboard(); renderActivities();
                showToast('success', 'Data imported successfully!');
            } catch { showToast('error', 'Invalid file format'); }
        };
        reader.readAsText(file);
    });
}

// ============ INITIALIZE ============
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initSplash();
    updateClock();
    setInterval(updateClock, 1000);
    initNavigation();
    initMode();
    initTheme();
    initAddMember();
    initMarkAll();
    initSearch();
    initFab();
    initRecords();
    initSettings();
    renderAttendanceTable();
    renderActivities();
});
