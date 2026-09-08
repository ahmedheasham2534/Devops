/* ============================================================
   app.js — application shell: routing, init, sidebar, topbar,
   modals, splash screen, and the Progress / Quiz Results /
   Settings pages (kept here since they're primarily read-outs
   of state already modeled elsewhere, not their own subsystem).
   ============================================================ */
const App = (() => {
  let state = null;
  let currentView = 'dashboard';
  let currentParams = {};

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'path', label: 'Learning Path', icon: 'path' },
    { id: 'categories', label: 'Categories', icon: 'categories' },
    { id: 'projects', label: 'Projects', icon: 'projects' },
    { id: 'tasks', label: 'My Tasks', icon: 'tasks' },
    { id: 'progress', label: 'Progress', icon: 'progress' },
    { id: 'quiz-results', label: 'Quiz Results', icon: 'quiz' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  // ---------------- init ----------------
  function init() {
    state = Storage.load();
    if (!state.generatedEmails) state.generatedEmails = [];
    applyTheme();
    updateStreak();
    renderShell();
    navigate('dashboard');
    Notifications.startReminderEngine(() => state, () => { save(); refreshBadges(); });
    setTimeout(() => document.getElementById('splash').classList.add('hidden'), 900);
    window.addEventListener('resize', () => { if (window.innerWidth > 900) closeSidebar(); });
  }

  function updateStreak() {
    const today = new Date().toDateString();
    if (state.streak.lastActiveDate === today) return;
    const last = state.streak.lastActiveDate ? new Date(state.streak.lastActiveDate) : null;
    const isConsecutive = last && (new Date(today) - new Date(last.toDateString())) === 86400000;
    state.streak.currentStreak = isConsecutive ? state.streak.currentStreak + 1 : 1;
    state.streak.lastActiveDate = today;
    save();
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
  }

  function save() { Storage.save(state); }

  // ---------------- shell (sidebar + topbar) ----------------
  function renderShell() {
    document.getElementById('sidebar-nav').innerHTML = NAV_ITEMS.map(item => `
      <button class="nav-item" data-view="${item.id}">
        ${Utils.ICONS[item.icon]}
        <span>${item.label}</span>
        ${item.id === 'tasks' ? '<span class="nav-badge" id="task-nav-badge" style="display:none"></span>' : ''}
      </button>
    `).join('');
    document.querySelectorAll('#sidebar-nav .nav-item').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.view));
    });
    refreshBadges();
  }

  function refreshBadges() {
    const overdue = state.tasks.filter(t => Tasks.effectiveStatus(t) === 'Overdue').length;
    const badge = document.getElementById('task-nav-badge');
    if (badge) { badge.style.display = overdue > 0 ? 'inline-flex' : 'none'; badge.textContent = overdue; }
    const dot = document.getElementById('notif-dot');
    if (dot) dot.style.display = overdue > 0 ? 'block' : 'none';
  }

  function setActiveNav(view) {
    document.querySelectorAll('#sidebar-nav .nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view || (view === 'category' && btn.dataset.view === 'categories') || (view === 'lecture' && btn.dataset.view === 'categories') || (view === 'quiz' && btn.dataset.view === 'categories') || (view === 'project' && btn.dataset.view === 'projects'));
    });
  }

  const VIEW_TITLES = {
    dashboard: 'Dashboard', path: 'Learning Path', categories: 'Categories', category: 'Categories',
    lecture: 'Lecture', quiz: 'Quiz', projects: 'Projects', project: 'Project', tasks: 'My Tasks',
    progress: 'Progress', 'quiz-results': 'Quiz Results', settings: 'Settings',
  };

  // ---------------- routing ----------------
  function navigate(view, params = {}) {
    currentView = view;
    currentParams = params;
    document.getElementById('topbar-title').textContent = VIEW_TITLES[view] || 'OpsForge';
    setActiveNav(view);
    closeSidebar();
    renderCurrentView();
    window.scrollTo(0, 0);
  }

  function renderCurrentView() {
    const container = document.getElementById('view-container');
    switch (currentView) {
      case 'dashboard': Dashboard.render(container); break;
      case 'path': Learning.renderPath(container); break;
      case 'categories': Learning.renderCategoryList(container); break;
      case 'category': Learning.renderCategoryDetail(container, currentParams.id); break;
      case 'lecture': Learning.renderLecture(container, currentParams.cat, currentParams.id); break;
      case 'quiz': Learning.renderQuiz(container, currentParams.cat, currentParams.id); break;
      case 'projects': Projects.renderList(container); break;
      case 'project': Projects.renderDetail(container, currentParams.id); break;
      case 'tasks': Tasks.render(container); break;
      case 'progress': renderProgressPage(container); break;
      case 'quiz-results': renderQuizResultsPage(container); break;
      case 'settings': renderSettingsPage(container); break;
      default: Dashboard.render(container);
    }
    refreshBadges();
  }

  function rerenderCurrentView() { renderCurrentView(); refreshBadges(); }

  // shared: wire up any [data-nav] element inside a container to App.navigate
  function wireNav(container) {
    container.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(el.dataset.nav, { id: el.dataset.id, cat: el.dataset.cat });
      });
    });
  }

  // shared: wire task-row interactive elements (used by Dashboard preview + Tasks page)
  function wireTaskRows(container) {
    container.querySelectorAll('[data-action="toggle"]').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); Tasks.toggle(el.dataset.id); }));
    container.querySelectorAll('[data-action="open"]').forEach(el => el.addEventListener('click', () => Tasks.openExisting(el.dataset.id)));
    container.querySelectorAll('[data-action="edit"]').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); Tasks.openExisting(el.dataset.id); }));
    container.querySelectorAll('[data-action="delete"]').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); Tasks.deleteTask(el.dataset.id); }));
  }

  // ---------------- modal ----------------
  function openModal(innerHtml) {
    const backdrop = document.getElementById('modal-backdrop');
    document.getElementById('modal-content').innerHTML = innerHtml;
    backdrop.classList.add('open');
  }
  function closeModal() {
    document.getElementById('modal-backdrop').classList.remove('open');
  }

  // ---------------- mobile sidebar ----------------
  function openSidebar() { document.getElementById('sidebar').classList.add('open'); document.getElementById('sidebar-scrim').classList.add('show'); }
  function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebar-scrim').classList.remove('show'); }

  // ---------------- Progress page ----------------
  function renderProgressPage(container) {
    const overall = StateModel.overallProgress(state);
    const skills = StateModel.allSkills(state);
    const recentActivity = Object.entries(state.lectureProgress)
      .filter(([, v]) => v.viewedAt)
      .sort((a, b) => new Date(b[1].viewedAt) - new Date(a[1].viewedAt))
      .slice(0, 8)
      .map(([lectureId, v]) => {
        const found = StateModel.findLecture(lectureId);
        return found ? { title: found.lecture.title, cat: found.category.name, date: v.viewedAt, passed: StateModel.isLecturePassed(state, lectureId) } : null;
      }).filter(Boolean);

    container.innerHTML = `
      <div class="page-title">Progress Analytics</div>
      <div class="page-sub" style="margin-bottom:22px">A full breakdown of where you stand across the curriculum.</div>

      <div class="grid grid-4" style="margin-bottom:26px">
        <div class="card stat-card"><div class="stat-value">${overall.pct}%</div><div class="stat-label">Overall progress</div></div>
        <div class="card stat-card"><div class="stat-value">${overall.completedLectures}/${overall.totalLectures}</div><div class="stat-label">Lectures completed</div></div>
        <div class="card stat-card"><div class="stat-value">${overall.completedProjects}/${overall.totalProjects}</div><div class="stat-label">Projects completed</div></div>
        <div class="card stat-card"><div class="stat-value">${state.streak.currentStreak}</div><div class="stat-label">Day streak</div></div>
      </div>

      <div class="grid grid-4" style="margin-bottom:26px">
        <div class="card stat-card"><div class="stat-value">${overall.completedQuizzes}</div><div class="stat-label">Quizzes passed</div></div>
        <div class="card stat-card"><div class="stat-value">${overall.attemptedQuizzes}</div><div class="stat-label">Quizzes attempted</div></div>
        <div class="card stat-card"><div class="stat-value">${overall.completedTasks}/${overall.totalTasks}</div><div class="stat-label">Tasks completed</div></div>
        <div class="card stat-card"><div class="stat-value" style="color:${overall.overdueTasks > 0 ? 'var(--red)' : 'var(--text)'}">${overall.overdueTasks}</div><div class="stat-label">Overdue tasks</div></div>
      </div>

      <div class="section-head"><h3 class="section-title">Skill Breakdown</h3></div>
      <div class="card" style="margin-bottom:26px">
        ${skills.map(s => `
          <div class="skill-row">
            <div class="skill-name">${Utils.escapeHtml(s.name)}</div>
            <div class="progress-track"><div class="progress-fill ${s.pct===100?'':'amber'}" style="width:${s.pct}%;${!s.hasContent?'opacity:.35':''}"></div></div>
            <div class="skill-pct">${s.hasContent ? s.pct + '%' : '—'}</div>
          </div>`).join('')}
      </div>

      <div class="section-head"><h3 class="section-title">Category Progress</h3></div>
      <div class="grid grid-3" style="margin-bottom:26px">
        ${CATALOG.categories.map(cat => {
          const p = StateModel.categoryProgress(state, cat.id);
          return `<div class="card">
            <div class="cat-top"><div class="cat-title">${Utils.escapeHtml(cat.name)}</div><div class="cat-pct">${p.hasContent ? p.pct + '%' : '—'}</div></div>
            <div class="progress-track" style="margin:8px 0"><div class="progress-fill ${p.pct===100?'':'amber'}" style="width:${p.hasContent?p.pct:0}%"></div></div>
            <div class="cat-foot"><span>${p.hasContent ? `${p.completed}/${p.total} lectures` : 'In development'}</span></div>
          </div>`;
        }).join('')}
      </div>

      <div class="section-head"><h3 class="section-title">Recent Learning Activity</h3></div>
      ${recentActivity.length ? `<div class="card">` + recentActivity.map(a => `
        <div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border-soft);font-size:13.5px">
          <div><strong>${Utils.escapeHtml(a.title)}</strong> <span style="color:var(--text-faint)">· ${Utils.escapeHtml(a.cat)}</span></div>
          <div style="display:flex;gap:10px;align-items:center;color:var(--text-faint)">${a.passed ? '<span class="badge badge-green">Passed</span>' : ''}${Utils.formatDate(a.date)}</div>
        </div>`).join('') + `</div>`
        : `<div class="empty-state card"><div>${Utils.ICONS.empty}</div><p>No learning activity yet — open a lecture to get started.</p></div>`}
    `;
  }

  // ---------------- Quiz Results page ----------------
  function renderQuizResultsPage(container) {
    const rows = Object.entries(state.quizState).map(([lectureId, qs]) => {
      const found = StateModel.findLecture(lectureId);
      if (!found) return null;
      const lastAttempt = qs.attempts[qs.attempts.length - 1];
      return {
        lectureId, title: found.lecture.title, category: found.category.name,
        attempts: qs.attempts.length, best: qs.bestScore, latest: qs.latestScore,
        passed: qs.passed, date: lastAttempt ? lastAttempt.date : null,
      };
    }).filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = `
      <div class="page-title">Quiz Results</div>
      <div class="page-sub" style="margin-bottom:20px">Every quiz you've attempted, with your best and most recent scores.</div>
      ${rows.length ? `
      <div class="card table-wrap">
        <table class="data-table">
          <thead><tr><th>Lecture</th><th>Category</th><th>Attempts</th><th>Best</th><th>Latest</th><th>Status</th><th>Last Attempt</th></tr></thead>
          <tbody>
            ${rows.map(r => `<tr style="cursor:pointer" data-nav-row="${r.lectureId}">
              <td>${Utils.escapeHtml(r.title)}</td>
              <td style="color:var(--text-faint)">${Utils.escapeHtml(r.category)}</td>
              <td>${r.attempts}</td>
              <td>${r.best}%</td>
              <td>${r.latest}%</td>
              <td>${r.passed ? '<span class="badge badge-green">Passed</span>' : '<span class="badge badge-red">Not Passed</span>'}</td>
              <td style="color:var(--text-faint)">${Utils.formatDate(r.date)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : `<div class="empty-state card"><div>${Utils.ICONS.empty}</div><p>You haven't attempted any quizzes yet.</p></div>`}
    `;
    container.querySelectorAll('[data-nav-row]').forEach(row => {
      row.addEventListener('click', () => {
        const found = StateModel.findLecture(row.dataset.navRow);
        if (found) navigate('lecture', { cat: found.category.id, id: found.lecture.id });
      });
    });
  }

  // ---------------- Settings page ----------------
  function renderSettingsPage(container) {
    container.innerHTML = `
      <div class="page-title">Settings</div>
      <div class="page-sub" style="margin-bottom:22px">Personalize the dashboard and manage your learning data.</div>

      <div class="section-head" style="margin-top:0"><h3 class="section-title">Profile</h3></div>
      <div class="card" style="max-width:480px;margin-bottom:26px">
        <div class="field"><label>Display name</label><input type="text" id="set-name" value="${Utils.escapeHtml(state.user.name)}"></div>
      </div>

      <div class="section-head"><h3 class="section-title">Appearance</h3></div>
      <div class="card" style="max-width:480px;margin-bottom:26px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:600;font-size:13.5px">Theme</div>
          <div style="font-size:12.5px;color:var(--text-faint)">Switch between dark and light mode</div>
        </div>
        <button class="btn btn-ghost" id="set-theme-toggle">${state.settings.theme === 'dark' ? Utils.ICONS.moon + ' Dark' : Utils.ICONS.sun + ' Light'}</button>
      </div>

      <div class="section-head"><h3 class="section-title">Notifications & Reminders</h3></div>
      <div class="card" style="max-width:480px;margin-bottom:26px;display:flex;flex-direction:column;gap:16px">
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">
          <span style="font-size:13.5px;font-weight:600">In-app notifications</span>
          <input type="checkbox" id="set-notifications" ${state.settings.notifications ? 'checked' : ''}>
        </label>
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">
          <span style="font-size:13.5px;font-weight:600">Overdue task reminders</span>
          <input type="checkbox" id="set-reminders" ${state.settings.reminders ? 'checked' : ''}>
        </label>
        <div class="field" style="margin:0">
          <label>Default quiz passing score (%)</label>
          <input type="number" id="set-passscore" min="0" max="100" value="${state.settings.passScore}">
        </div>
      </div>

      <div class="section-head"><h3 class="section-title">Data</h3></div>
      <div class="card" style="max-width:480px;margin-bottom:26px;display:flex;flex-direction:column;gap:12px">
        <button class="btn btn-ghost btn-block" id="set-export">Export Learning Data</button>
        <div>
          <input type="file" id="set-import-file" accept="application/json" style="display:none">
          <button class="btn btn-ghost btn-block" id="set-import">Import Learning Data</button>
        </div>
        <button class="btn btn-danger btn-block" id="set-reset">Reset All Progress</button>
      </div>

      <div class="section-head"><h3 class="section-title">Email Notification Log</h3></div>
      <div class="page-sub" style="margin-bottom:12px">Structured email objects generated for overdue tasks — ready for a real email service to consume. No emails are actually sent from the browser.</div>
      <div class="card" style="max-width:640px">
        ${(state.generatedEmails && state.generatedEmails.length) ? state.generatedEmails.slice(-5).reverse().map(e => `
          <div style="border-bottom:1px solid var(--border-soft);padding:10px 0;font-size:12.5px">
            <div style="font-weight:700">${Utils.escapeHtml(e.email.subject)}</div>
            <div style="color:var(--text-faint)">To: ${Utils.escapeHtml(e.email.recipient)} · Generated ${Utils.formatDateTime(e.email.generatedAt)}</div>
          </div>`).join('') : '<div style="color:var(--text-faint);font-size:13px">No overdue-task emails generated yet.</div>'}
      </div>
    `;

    document.getElementById('set-name').addEventListener('change', (e) => { state.user.name = e.target.value.trim() || 'Learner'; save(); Notifications.toast('Saved', 'Display name updated.'); });
    document.getElementById('set-theme-toggle').addEventListener('click', () => {
      state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
      applyTheme(); save(); renderSettingsPage(container);
    });
    document.getElementById('set-notifications').addEventListener('change', (e) => { state.settings.notifications = e.target.checked; save(); });
    document.getElementById('set-reminders').addEventListener('change', (e) => { state.settings.reminders = e.target.checked; save(); });
    document.getElementById('set-passscore').addEventListener('change', (e) => { state.settings.passScore = Utils.clamp(parseInt(e.target.value, 10) || 80, 1, 100); save(); });

    document.getElementById('set-export').addEventListener('click', () => { Storage.exportJSON(state); Notifications.toast('Exported', 'Your learning data has been downloaded.'); });
    document.getElementById('set-import').addEventListener('click', () => document.getElementById('set-import-file').click());
    document.getElementById('set-import-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      Storage.importJSON(file, (parsed) => {
        state = Object.assign(StateModel.createDefaultState(), parsed);
        if (!state.generatedEmails) state.generatedEmails = [];
        save(); applyTheme(); renderShell(); navigate('dashboard');
        Notifications.toast('Import complete', 'Your learning data has been restored.');
      }, () => Notifications.toast('Import failed', 'That file could not be read as valid learning data.', 'warn'));
    });
    document.getElementById('set-reset').addEventListener('click', () => {
      openModal(`
        <div class="modal-title">Reset all progress?</div>
        <p style="font-size:13.5px;color:var(--text-dim)">This permanently deletes all lecture progress, quiz history, project status, and tasks. This cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="cancel-reset">Cancel</button>
          <button class="btn btn-danger" id="confirm-reset">Reset Everything</button>
        </div>
      `);
      document.getElementById('cancel-reset').addEventListener('click', closeModal);
      document.getElementById('confirm-reset').addEventListener('click', () => {
        Storage.reset();
        state = StateModel.createDefaultState();
        state.generatedEmails = [];
        save(); applyTheme(); closeModal(); renderShell(); navigate('dashboard');
        Notifications.toast('Progress reset', 'All learning data has been cleared.');
      });
    });
  }

  return {
    init,
    get state() { return state; },
    save, navigate, wireNav, wireTaskRows, openModal, closeModal, openSidebar, closeSidebar,
    rerenderCurrentView,
  };
})();

// ---------------- bootstrap ----------------
document.addEventListener('DOMContentLoaded', () => {
  App.init();

  document.getElementById('mobile-menu-btn').addEventListener('click', App.openSidebar);
  document.getElementById('notif-btn').addEventListener('click', () => App.navigate('tasks'));
  document.getElementById('sidebar-scrim').addEventListener('click', App.closeSidebar);
  document.getElementById('modal-backdrop').addEventListener('click', (e) => { if (e.target.id === 'modal-backdrop') App.closeModal(); });
  document.getElementById('theme-toggle-topbar').addEventListener('click', () => {
    App.state.settings.theme = App.state.settings.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', App.state.settings.theme);
    App.save();
    if (document.getElementById('topbar-title').textContent === 'Settings') App.rerenderCurrentView();
  });
});
