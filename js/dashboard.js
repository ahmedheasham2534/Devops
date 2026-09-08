/* ============================================================
   dashboard.js — the main dashboard view (section 4 of the spec)
   ============================================================ */
const Dashboard = (() => {

  function statCard(icon, color, value, label) {
    return `<div class="card stat-card">
      <div class="stat-top">
        <div class="stat-icon" style="background:var(--${color}-wash);color:var(--${color})">${icon}</div>
      </div>
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
    </div>`;
  }

  function categoryCard(cat, progress) {
    const badge = progress.hasContent
      ? (progress.pct === 100 ? '<span class="badge badge-green">Completed</span>' : progress.pct > 0 ? '<span class="badge badge-amber">In Progress</span>' : '<span class="badge badge-gray">Not Started</span>')
      : '<span class="badge badge-blue">In Development</span>';
    return `<div class="card category-card" data-nav="category" data-id="${cat.id}">
      <div class="cat-top">
        <div>
          <div class="cat-icon">${(Utils.ICONS.categories)}</div>
        </div>
        <div class="cat-pct">${progress.hasContent ? progress.pct + '%' : '—'}</div>
      </div>
      <div>
        <div class="cat-title">${Utils.escapeHtml(cat.name)}</div>
        <div class="cat-meta">${Utils.escapeHtml(cat.tagline)}</div>
      </div>
      <div class="progress-track"><div class="progress-fill ${progress.pct === 100 ? '' : progress.pct > 0 ? 'amber' : ''}" style="width:${progress.hasContent ? progress.pct : 0}%"></div></div>
      <div class="cat-foot">
        <span>${progress.hasContent ? `${progress.completed}/${progress.total} lectures` : 'Content coming soon'}</span>
        ${badge}
      </div>
    </div>`;
  }

  function render(container) {
    const state = App.state;
    const overall = StateModel.overallProgress(state);
    const pointer = StateModel.currentLearningPointer(state);
    const skills = StateModel.allSkills(state);

    // recommended projects: prioritize projects tied to categories with partial progress, then everything else
    const inProgressCatIds = new Set(CATALOG.categories.filter(c => {
      const p = StateModel.categoryProgress(state, c.id);
      return p.hasContent && p.pct > 0 && p.pct < 100;
    }).map(c => c.id));
    const recommended = [...PROJECTS].sort((a, b) => (inProgressCatIds.has(b.categoryId) ? 1 : 0) - (inProgressCatIds.has(a.categoryId) ? 1 : 0)).slice(0, 3);

    const pendingTasks = state.tasks.filter(t => t.status !== 'Completed').sort((a, b) => new Date(a.deadline || 8.64e15) - new Date(b.deadline || 8.64e15)).slice(0, 5);

    container.innerHTML = `
      <div class="page-title">Dashboard</div>
      <div class="page-sub" style="margin-bottom:22px">Welcome back, ${Utils.escapeHtml(state.user.name)}. Continue your DevOps journey.</div>

      <div class="hero-card">
        <div>
          <div class="hero-welcome">${overall.pct === 100 && overall.totalLectures > 0 ? 'Every developed lecture complete 🎉' : 'Your overall learning progress'}</div>
          <div class="hero-sub">${overall.completedLectures} of ${overall.totalLectures} available lectures passed · ${overall.completedProjects}/${overall.totalProjects} projects completed</div>
        </div>
        <div class="hero-ring-wrap">
          <div class="ring">
            ${Utils.ringSvg(overall.pct, 88, 8)}
            <div class="ring-value">${overall.pct}%</div>
          </div>
        </div>
      </div>

      <div class="grid grid-4" style="margin-bottom:26px">
        ${statCard(Utils.ICONS.path, 'accent', overall.completedLectures, 'Lectures completed')}
        ${statCard(Utils.ICONS.quiz, 'blue', overall.completedQuizzes, 'Quizzes passed')}
        ${statCard(Utils.ICONS.projects, 'amber', overall.completedProjects, 'Projects completed')}
        ${statCard(Utils.ICONS.tasks, overall.overdueTasks > 0 ? 'red' : 'accent', overall.completedTasks + '/' + overall.totalTasks, 'Tasks completed')}
      </div>

      ${pointer ? `
      <div class="continue-row">
        <div>
          <div class="continue-meta">${Utils.escapeHtml(pointer.categoryName)} · ${Utils.escapeHtml(pointer.unitName)}</div>
          <div class="continue-title">${Utils.escapeHtml(pointer.lecture.title)}</div>
          <div class="continue-track"><div class="progress-track"><div class="progress-fill" style="width:${StateModel.categoryProgress(state, pointer.categoryId).pct}%"></div></div></div>
        </div>
        <button class="btn btn-primary" data-nav="lecture" data-cat="${pointer.categoryId}" data-id="${pointer.lecture.id}">${Utils.ICONS.play} Continue Learning</button>
      </div>` : `
      <div class="continue-row">
        <div>
          <div class="continue-title">You've completed every available lecture 🎉</div>
          <div class="continue-meta">Check Projects for hands-on work, or explore categories still in development.</div>
        </div>
        <button class="btn btn-primary" data-nav="projects">View Projects</button>
      </div>`}

      <div class="section-head"><h3 class="section-title">Category Progress</h3><button class="link-btn" data-nav="categories">View all</button></div>
      <div class="grid grid-4">
        ${CATALOG.categories.slice(0, 8).map(cat => categoryCard(cat, StateModel.categoryProgress(state, cat.id))).join('')}
      </div>

      <div class="section-head"><h3 class="section-title">Recommended Projects</h3><button class="link-btn" data-nav="projects">View all</button></div>
      <div class="grid grid-3">
        ${recommended.map(p => Projects.cardHtml(p, state)).join('')}
      </div>

      <div class="section-head"><h3 class="section-title">Upcoming & Overdue Tasks</h3><button class="link-btn" data-nav="tasks">View all</button></div>
      ${pendingTasks.length ? pendingTasks.map(t => Tasks.rowHtml(t)).join('') : `
        <div class="empty-state card">
          <div>${Utils.ICONS.empty}</div>
          <p>No tasks yet. Add one from the Tasks page to start tracking your work.</p>
        </div>`}

      <div class="section-head"><h3 class="section-title">Skill Tracking</h3></div>
      <div class="card">
        ${skills.map(s => `
          <div class="skill-row">
            <div class="skill-name">${Utils.escapeHtml(s.name)}</div>
            <div class="progress-track"><div class="progress-fill ${s.pct === 100 ? '' : 'amber'}" style="width:${s.pct}%; ${!s.hasContent ? 'opacity:.35' : ''}"></div></div>
            <div class="skill-pct">${s.hasContent ? s.pct + '%' : '—'}</div>
          </div>`).join('')}
      </div>
    `;

    App.wireNav(container);
    App.wireTaskRows(container);
  }

  return { render };
})();
