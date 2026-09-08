/* ============================================================
   projects.js — Project system. Briefs only (objective,
   requirements, constraints, expected outcome, mentor advice) —
   never implementation solutions. See data.js PROJECTS.
   ============================================================ */
const Projects = (() => {

  function getStatus(state, projectId) {
    return state.projectStatus[projectId] || { status: 'Not Started', startDate: null, deadline: null, completionDate: null };
  }

  function statusBadge(status) {
    const map = {
      'Not Started': 'badge-gray', 'In Progress': 'badge-amber', 'Completed': 'badge-green', 'Overdue': 'badge-red',
    };
    return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
  }

  function cardHtml(project, state) {
    const st = getStatus(state, project.id);
    const effectiveStatus = st.status !== 'Completed' && Utils.isOverdue(st.deadline, false) ? 'Overdue' : st.status;
    return `<div class="card project-card" data-nav="project" data-id="${project.id}">
      <div class="project-top">
        <div>
          <div class="project-title">${Utils.escapeHtml(project.title)}</div>
          <div class="project-cat">${Utils.escapeHtml(CATALOG.categories.find(c => c.id === project.categoryId)?.name || '')} · ${Utils.escapeHtml(project.unitName)}</div>
        </div>
      </div>
      <div class="project-desc">${Utils.escapeHtml(project.objective)}</div>
      <div class="project-foot">
        <span class="badge badge-gray">${project.difficulty}</span>
        <span class="badge badge-gray">${project.hours}</span>
        ${statusBadge(effectiveStatus)}
      </div>
    </div>`;
  }

  function renderList(container) {
    const state = App.state;
    const cats = ['all', ...new Set(PROJECTS.map(p => p.categoryId))];
    App._projectFilter = App._projectFilter || 'all';

    container.innerHTML = `
      <div class="page-title">Projects</div>
      <div class="page-sub" style="margin-bottom:18px">Hands-on projects, placed where they make educational sense. Briefs only — you design and build the solution.</div>
      <div class="tabs" id="project-tabs">
        <button class="tab-btn ${App._projectFilter === 'all' ? 'active' : ''}" data-filter="all">All (${PROJECTS.length})</button>
        ${CATALOG.categories.filter(c => PROJECTS.some(p => p.categoryId === c.id)).map(c => `
          <button class="tab-btn ${App._projectFilter === c.id ? 'active' : ''}" data-filter="${c.id}">${Utils.escapeHtml(c.name)}</button>
        `).join('')}
      </div>
      <div class="grid grid-3" id="project-grid">
        ${PROJECTS.filter(p => App._projectFilter === 'all' || p.categoryId === App._projectFilter).map(p => cardHtml(p, state)).join('')}
      </div>
    `;
    container.querySelectorAll('#project-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => { App._projectFilter = btn.dataset.filter; renderList(container); });
    });
    App.wireNav(container);
  }

  function renderDetail(container, projectId) {
    const state = App.state;
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) { container.innerHTML = '<div class="empty-state">Project not found.</div>'; return; }
    const st = getStatus(state, projectId);
    const effectiveStatus = st.status !== 'Completed' && Utils.isOverdue(st.deadline, false) ? 'Overdue' : st.status;

    container.innerHTML = `
      <div class="crumbs">
        <button data-nav="projects">Projects</button><span class="sep">/</span><span class="current">${Utils.escapeHtml(project.title)}</span>
      </div>
      <div class="project-doc">
        <div class="project-doc-head">
          <div>
            <h2>${Utils.escapeHtml(project.title)}</h2>
            <div class="project-cat">${Utils.escapeHtml(CATALOG.categories.find(c => c.id === project.categoryId)?.name || '')} · ${Utils.escapeHtml(project.unitName)}</div>
          </div>
          ${statusBadge(effectiveStatus)}
        </div>
        <div class="tags">
          <span class="badge badge-gray">${project.difficulty}</span>
          <span class="badge badge-gray">${project.hours}</span>
        </div>

        <div class="project-doc-meta-row">
          <div class="pdm-item"><span class="pdm-lbl">Start date</span><span class="pdm-val">${Utils.formatDate(st.startDate)}</span></div>
          <div class="pdm-item"><span class="pdm-lbl">Deadline</span><span class="pdm-val">${Utils.formatDate(st.deadline)}</span></div>
          <div class="pdm-item"><span class="pdm-lbl">Completed</span><span class="pdm-val">${Utils.formatDate(st.completionDate)}</span></div>
        </div>

        <div class="lecture-section"><h4>Objective</h4><p>${Utils.escapeHtml(project.objective)}</p></div>
        <div class="lecture-section"><h4>Overview</h4><p>${Utils.escapeHtml(project.overview)}</p></div>
        <div class="lecture-section"><h4>Requirements</h4><ul>${project.requirements.map(r => `<li>${Utils.escapeHtml(r)}</li>`).join('')}</ul></div>
        <div class="lecture-section"><h4>Technologies / Services Involved</h4><p>${project.technologies.map(Utils.escapeHtml).join(' · ')}</p></div>
        <div class="lecture-section"><h4>Expected Outcome</h4><p>${Utils.escapeHtml(project.expectedOutcome)}</p></div>
        <div class="lecture-section"><h4>Constraints</h4><ul>${project.constraints.map(c => `<li>${Utils.escapeHtml(c)}</li>`).join('')}</ul></div>
        <div class="lecture-section"><h4>Mentor Advice</h4><div class="callout">${project.advice.map(a => Utils.escapeHtml(a)).join('<br><br>')}</div></div>
        <div class="lecture-section"><h4>Success Criteria</h4><ul>${project.successCriteria.map(s => `<li>${Utils.escapeHtml(s)}</li>`).join('')}</ul></div>

        <div class="callout danger" style="margin-top:26px">${Utils.ICONS.warn} This is a brief, not a solution. You're expected to research and implement the approach yourself — that's the whole point of the exercise.</div>

        <div class="project-status-control">
          <label style="font-size:12.5px;color:var(--text-dim);font-weight:600">Status</label>
          <select class="status-select" id="proj-status">
            ${['Not Started', 'In Progress', 'Completed'].map(s => `<option value="${s}" ${st.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
          <label style="font-size:12.5px;color:var(--text-dim);font-weight:600;margin-left:10px">Deadline</label>
          <input type="date" id="proj-deadline" value="${st.deadline ? st.deadline.slice(0, 10) : ''}" style="background:var(--bg-elevated);border:1px solid var(--border);color:var(--text);padding:7px 10px;border-radius:6px;font-size:13px">
        </div>
      </div>
    `;
    App.wireNav(container);

    const statusSelect = container.querySelector('#proj-status');
    const deadlineInput = container.querySelector('#proj-deadline');

    function persist() {
      const state = App.state;
      const record = getStatus(state, projectId);
      const newStatus = statusSelect.value;
      if (newStatus === 'In Progress' && record.status === 'Not Started' && !record.startDate) record.startDate = Utils.nowISO();
      if (newStatus === 'Completed' && record.status !== 'Completed') record.completionDate = Utils.nowISO();
      if (newStatus !== 'Completed') record.completionDate = null;
      record.status = newStatus;
      record.deadline = deadlineInput.value ? new Date(deadlineInput.value + 'T23:59:59').toISOString() : null;
      state.projectStatus[projectId] = record;
      App.save();
      Notifications.toast('Project updated', `"${project.title}" is now ${newStatus}.`);
      renderDetail(container, projectId);
    }
    statusSelect.addEventListener('change', persist);
    deadlineInput.addEventListener('change', persist);
  }

  return { renderList, renderDetail, cardHtml, getStatus };
})();
