/* ============================================================
   tasks.js — My Tasks: create, edit, complete, delete, filter.
   ============================================================ */
const Tasks = (() => {

  function effectiveStatus(task) {
    if (task.status === 'Completed') return 'Completed';
    if (Utils.isOverdue(task.deadline, false)) return 'Overdue';
    return task.status;
  }

  function priorityBadge(p) {
    const map = { Low: 'badge-gray', Medium: 'badge-blue', High: 'badge-amber', Critical: 'badge-red' };
    return `<span class="badge ${map[p] || 'badge-gray'}">${p}</span>`;
  }

  function rowHtml(task) {
    const status = effectiveStatus(task);
    const done = status === 'Completed';
    return `<div class="task-row" data-task="${task.id}">
      <div class="task-check ${done ? 'done' : ''}" data-action="toggle" data-id="${task.id}">${done ? Utils.ICONS.check : ''}</div>
      <div class="task-body" data-action="open" data-id="${task.id}">
        <div class="task-title ${done ? 'done' : ''}">${Utils.escapeHtml(task.title)}</div>
        <div class="task-meta">
          ${task.category ? `<span>${Utils.escapeHtml(task.category)}</span>` : ''}
          ${task.deadline ? `<span>Due ${Utils.formatDate(task.deadline)}</span>` : ''}
          ${priorityBadge(task.priority)}
          ${status === 'Overdue' ? '<span class="badge badge-red">Overdue</span>' : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn" data-action="edit" data-id="${task.id}" title="Edit" style="width:30px;height:30px">✎</button>
        <button class="icon-btn" data-action="delete" data-id="${task.id}" title="Delete" style="width:30px;height:30px">${Utils.ICONS.x}</button>
      </div>
    </div>`;
  }

  function render(container) {
    const state = App.state;
    App._taskTab = App._taskTab || 'active';
    const active = state.tasks.filter(t => t.status !== 'Completed');
    const completed = state.tasks.filter(t => t.status === 'Completed');
    const overdueCount = active.filter(t => effectiveStatus(t) === 'Overdue').length;
    const list = App._taskTab === 'active' ? active : completed;

    container.innerHTML = `
      <div class="page-title">My Tasks</div>
      <div class="page-sub" style="margin-bottom:18px">Lecture, quiz, project, and personal DevOps tasks — with deadlines and browser reminders.</div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div class="tabs" style="margin-bottom:0;border-bottom:none">
          <button class="tab-btn ${App._taskTab === 'active' ? 'active' : ''}" data-tab="active" style="border-bottom:2px solid ${App._taskTab === 'active' ? 'var(--accent)' : 'transparent'}">Active (${active.length})</button>
          <button class="tab-btn ${App._taskTab === 'completed' ? 'active' : ''}" data-tab="completed" style="border-bottom:2px solid ${App._taskTab === 'completed' ? 'var(--accent)' : 'transparent'}">Completed (${completed.length})</button>
        </div>
        <button class="btn btn-primary" id="new-task-btn">+ New Task</button>
      </div>
      ${overdueCount > 0 ? `<div class="callout danger" style="margin:14px 0">${Utils.ICONS.warn} ${overdueCount} task${overdueCount > 1 ? 's are' : ' is'} overdue.</div>` : '<div style="height:14px"></div>'}

      <div id="task-list">
        ${list.length ? list.map(rowHtml).join('') : `<div class="empty-state card"><div>${Utils.ICONS.empty}</div><p>${App._taskTab === 'active' ? 'No active tasks. Create one to get started.' : 'No completed tasks yet.'}</p></div>`}
      </div>
    `;

    container.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { App._taskTab = b.dataset.tab; render(container); }));
    container.querySelector('#new-task-btn').addEventListener('click', () => openTaskModal());
    App.wireTaskRows(container);
  }

  function openTaskModal(existingTask) {
    const isEdit = !!existingTask;
    const t = existingTask || { id: null, title: '', description: '', category: '', priority: 'Medium', deadline: '', status: 'Pending' };
    const html = `
      <div class="modal-title">${isEdit ? 'Edit Task' : 'New Task'}</div>
      <div class="field"><label>Title</label><input type="text" id="f-title" value="${Utils.escapeHtml(t.title)}" placeholder="e.g. Finish VPC Peering project"></div>
      <div class="field"><label>Description</label><textarea id="f-desc" rows="3" placeholder="Optional details">${Utils.escapeHtml(t.description || '')}</textarea></div>
      <div class="field-row">
        <div class="field"><label>Category</label>
          <select id="f-category">
            <option value="">General</option>
            <option value="Lecture">Lecture</option>
            <option value="Quiz">Quiz</option>
            <option value="Project">Project</option>
            <option value="Personal">Personal</option>
          </select>
        </div>
        <div class="field"><label>Priority</label>
          <select id="f-priority">
            ${['Low', 'Medium', 'High', 'Critical'].map(p => `<option value="${p}" ${t.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>Deadline</label><input type="date" id="f-deadline" value="${t.deadline ? t.deadline.slice(0, 10) : ''}"></div>
        <div class="field"><label>Reminder</label>
          <select id="f-reminder">
            <option value="">None</option>
            <option value="on-time">On due date</option>
            <option value="1-day">1 day before</option>
          </select>
        </div>
      </div>
      <div class="modal-actions">
        ${isEdit ? '<button class="btn btn-danger" id="modal-delete">Delete</button>' : '<span></span>'}
        <div style="display:flex;gap:10px">
          <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-save">${isEdit ? 'Save Changes' : 'Create Task'}</button>
        </div>
      </div>
    `;
    App.openModal(html);
    document.getElementById('f-category').value = t.category || '';
    document.getElementById('modal-cancel').addEventListener('click', App.closeModal);
    const delBtn = document.getElementById('modal-delete');
    if (delBtn) delBtn.addEventListener('click', () => {
      App.state.tasks = App.state.tasks.filter(x => x.id !== t.id);
      App.save();
      App.closeModal();
      Notifications.toast('Task deleted', t.title);
      App.rerenderCurrentView();
    });
    document.getElementById('modal-save').addEventListener('click', () => {
      const title = document.getElementById('f-title').value.trim();
      if (!title) { Notifications.toast('Title required', 'Please enter a task title.', 'warn'); return; }
      const deadlineVal = document.getElementById('f-deadline').value;
      const payload = {
        title,
        description: document.getElementById('f-desc').value.trim(),
        category: document.getElementById('f-category').value,
        priority: document.getElementById('f-priority').value,
        deadline: deadlineVal ? new Date(deadlineVal + 'T23:59:59').toISOString() : null,
        reminder: document.getElementById('f-reminder').value,
      };
      if (isEdit) {
        Object.assign(existingTask, payload);
      } else {
        App.state.tasks.push({
          id: Utils.uid('task'), createdDate: Utils.nowISO(), status: 'Pending', completedDate: null,
          ...payload,
        });
      }
      App.save();
      App.closeModal();
      Notifications.toast(isEdit ? 'Task updated' : 'Task created', title);
      App.rerenderCurrentView();
    });
  }

  function toggle(taskId) {
    const state = App.state;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.status === 'Completed') {
      task.status = 'Pending';
      task.completedDate = null;
    } else {
      task.status = 'Completed';
      task.completedDate = Utils.nowISO();
    }
    App.save();
    App.rerenderCurrentView();
  }

  function openExisting(taskId) {
    const task = App.state.tasks.find(t => t.id === taskId);
    if (task) openTaskModal(task);
  }

  function deleteTask(taskId) {
    App.state.tasks = App.state.tasks.filter(t => t.id !== taskId);
    App.save();
    Notifications.toast('Task deleted', '');
    App.rerenderCurrentView();
  }

  return { render, rowHtml, toggle, openExisting, deleteTask, openTaskModal, effectiveStatus };
})();
