/* ============================================================
   notifications.js — toast UI + the in-browser reminder engine
   + the email notification OBJECT architecture (see section 14
   of the spec: we build the object, we do NOT send real email —
   no fake API is implemented; this is the integration point a
   real backend/email service would hook into later).
   ============================================================ */
const Notifications = (() => {
  const alreadyToasted = new Set(); // runtime-only, per session — avoids toast spam on every re-render

  function toast(title, message, type = 'ok') {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'warn' ? ' warn' : '');
    el.innerHTML = `
      <div style="margin-top:2px;color:${type === 'warn' ? 'var(--red)' : 'var(--accent)'}">${type === 'warn' ? Utils.ICONS.warn : Utils.ICONS.check}</div>
      <div>
        <div class="toast-title">${Utils.escapeHtml(title)}</div>
        <div>${Utils.escapeHtml(message)}</div>
      </div>
      <button class="toast-close" aria-label="Dismiss">${Utils.ICONS.x}</button>
    `;
    el.querySelector('.toast-close').addEventListener('click', () => el.remove());
    stack.appendChild(el);
    setTimeout(() => el.remove(), 7000);
  }

  /**
   * Builds the structured email notification object described in the
   * spec. This is intentionally NOT wired to any real email transport —
   * no fake API call is made. A real backend/email service (SES, SendGrid,
   * etc.) would consume objects of exactly this shape.
   */
  function buildOverdueEmail(task, settings) {
    return {
      recipient: settings.email || `${(settings.name || 'learner').toLowerCase().replace(/\s+/g, '.')}@example.com`,
      subject: `Task overdue: ${task.title}`,
      brand: 'OpsForge Academy',
      taskTitle: task.title,
      deadline: task.deadline,
      status: 'Overdue',
      body:
`Hello ${settings.name || 'there'},

Your task:

"${task.title}"

has passed its deadline and is still marked as incomplete.

Deadline: ${Utils.formatDate(task.deadline)}

Please complete the task and update your learning dashboard.

Best regards,
OpsForge Academy
Learning Management System`,
      generatedAt: Utils.nowISO(),
    };
  }

  /**
   * Called periodically. Looks for tasks that have just become overdue
   * and (a) shows a toast, (b) generates the email notification object
   * (stored in state so it's inspectable, e.g. from Settings), and stops
   * doing so once a task is marked Completed — per spec section 14.
   */
  function scanForOverdue(state, onStateChanged) {
    if (!state.settings.notifications) return;
    let changed = false;
    state.tasks.forEach(task => {
      if (task.status === 'Completed') return;
      const overdue = Utils.isOverdue(task.deadline, false);
      if (!overdue) return;
      if (alreadyToasted.has(task.id)) return;
      alreadyToasted.add(task.id);
      toast('Task overdue', `"${task.title}" has passed its deadline.`, 'warn');
      if (!state.generatedEmails) state.generatedEmails = [];
      const alreadyGenerated = state.generatedEmails.some(e => e.taskId === task.id);
      if (!alreadyGenerated) {
        state.generatedEmails.push({ taskId: task.id, email: buildOverdueEmail(task, state.settings) });
        changed = true;
      }
    });
    if (changed && onStateChanged) onStateChanged();
  }

  let intervalHandle = null;
  function startReminderEngine(getState, onStateChanged) {
    if (intervalHandle) clearInterval(intervalHandle);
    scanForOverdue(getState(), onStateChanged);
    intervalHandle = setInterval(() => scanForOverdue(getState(), onStateChanged), 60 * 1000);
  }

  return { toast, buildOverdueEmail, scanForOverdue, startReminderEngine };
})();
