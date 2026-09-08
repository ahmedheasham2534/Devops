/* ============================================================
   learning.js — Learning Path, Categories, Units, Lectures.
   Handles browsing the curriculum and rendering lecture content.
   Quiz rendering lives in quiz.js for the engine, but the
   quiz VIEW (DOM) is rendered from here since it's part of the
   same learning flow.
   ============================================================ */
const Learning = (() => {

  // ---------- Categories list (also used by sidebar "Categories") ----------
  function renderCategoryList(container) {
    const state = App.state;
    container.innerHTML = `
      <div class="page-title">Categories</div>
      <div class="page-sub" style="margin-bottom:22px">The full DevOps curriculum — 13 categories from Linux fundamentals to production capstones.</div>
      <div class="grid grid-4">
        ${CATALOG.categories.map(cat => categoryCardFull(cat, StateModel.categoryProgress(state, cat.id))).join('')}
      </div>
    `;
    App.wireNav(container);
  }

  function categoryCardFull(cat, progress) {
    const badge = progress.hasContent
      ? (progress.pct === 100 ? '<span class="badge badge-green">Completed</span>' : progress.pct > 0 ? '<span class="badge badge-amber">In Progress</span>' : '<span class="badge badge-gray">Not Started</span>')
      : '<span class="badge badge-blue">In Development</span>';
    return `<div class="card category-card" data-nav="category" data-id="${cat.id}">
      <div class="cat-top">
        <div class="cat-icon">${Utils.ICONS.categories}</div>
        <div class="cat-pct">${progress.hasContent ? progress.pct + '%' : '—'}</div>
      </div>
      <div>
        <div class="cat-title">${Utils.escapeHtml(cat.name)}</div>
        <div class="cat-meta">${Utils.escapeHtml(cat.tagline)}</div>
      </div>
      <div class="progress-track"><div class="progress-fill ${progress.pct === 100 ? '' : progress.pct > 0 ? 'amber' : ''}" style="width:${progress.hasContent ? progress.pct : 0}%"></div></div>
      <div class="cat-foot"><span>${cat.units.length} unit${cat.units.length !== 1 ? 's' : ''}</span>${badge}</div>
    </div>`;
  }

  // ---------- Learning Path: same as categories but framed as a path ----------
  function renderPath(container) {
    const state = App.state;
    const overall = StateModel.overallProgress(state);
    container.innerHTML = `
      <div class="page-title">Learning Path</div>
      <div class="page-sub" style="margin-bottom:22px">${overall.completedLectures} of ${overall.totalLectures} lectures completed across the curriculum.</div>
      <div class="grid grid-2">
        ${CATALOG.categories.map(cat => {
          const p = StateModel.categoryProgress(state, cat.id);
          return `<div class="card" style="cursor:pointer" data-nav="category" data-id="${cat.id}">
            <div class="cat-top">
              <div>
                <div class="cat-title">${Utils.escapeHtml(cat.name)}</div>
                <div class="cat-meta">${cat.units.length} units</div>
              </div>
              <div class="cat-pct">${p.hasContent ? p.pct + '%' : '—'}</div>
            </div>
            <div class="progress-track" style="margin-top:10px"><div class="progress-fill ${p.pct===100?'':'amber'}" style="width:${p.hasContent?p.pct:0}%"></div></div>
          </div>`;
        }).join('')}
      </div>
    `;
    App.wireNav(container);
  }

  // ---------- Category detail: units + lectures ----------
  function renderCategoryDetail(container, categoryId) {
    const state = App.state;
    const cat = CATALOG.categories.find(c => c.id === categoryId);
    if (!cat) { container.innerHTML = '<div class="empty-state">Category not found.</div>'; return; }
    const progress = StateModel.categoryProgress(state, categoryId);

    container.innerHTML = `
      <div class="crumbs">
        <button data-nav="categories">Categories</button><span class="sep">/</span><span class="current">${Utils.escapeHtml(cat.name)}</span>
      </div>
      <div class="page-title">${Utils.escapeHtml(cat.name)}</div>
      <div class="page-sub" style="margin-bottom:18px">${Utils.escapeHtml(cat.tagline)}</div>
      ${progress.hasContent ? `
      <div class="card" style="margin-bottom:24px;max-width:420px">
        <div class="stat-top" style="margin-bottom:8px"><span style="font-size:13px;color:var(--text-dim)">Category progress</span><span class="cat-pct">${progress.pct}%</span></div>
        <div class="progress-track"><div class="progress-fill ${progress.pct===100?'':'amber'}" style="width:${progress.pct}%"></div></div>
      </div>` : `<div class="callout info" style="max-width:520px;margin-bottom:24px">${Utils.ICONS.warn} This category's curriculum is fully mapped out below, but lecture content is still in development. Check back soon.</div>`}

      ${cat.units.map(unit => renderUnitBlock(cat, unit, state)).join('')}

      <div class="section-head"><h3 class="section-title">Recommended Projects</h3></div>
      <div class="grid grid-3">
        ${PROJECTS.filter(p => p.categoryId === categoryId).map(p => Projects.cardHtml(p, state)).join('') || '<div class="empty-state card"><p>No projects mapped to this category yet.</p></div>'}
      </div>
    `;
    App.wireNav(container);
    container.querySelectorAll('.unit-head').forEach(h => {
      h.addEventListener('click', () => {
        const body = h.nextElementSibling;
        body.classList.toggle('open');
      });
    });
  }

  function renderUnitBlock(cat, unit, state) {
    const lectureRows = unit.developed
      ? unit.lectures.map(lec => {
          const passed = StateModel.isLecturePassed(state, lec.id);
          const viewed = state.lectureProgress[lec.id] && state.lectureProgress[lec.id].viewed;
          const icon = passed
            ? `<span style="color:var(--accent)">${Utils.ICONS.check}</span>`
            : viewed ? `<span class="badge badge-amber" style="padding:2px 6px">•</span>` : `<span style="color:var(--text-faint)">○</span>`;
          return `<div class="lecture-row" data-nav="lecture" data-cat="${cat.id}" data-id="${lec.id}">
            <div class="lecture-status">${icon}</div>
            <div class="lecture-name">${Utils.escapeHtml(lec.title)}</div>
            <div class="lecture-time">${lec.estMinutes} min</div>
          </div>`;
        }).join('')
      : unit.lectures.map(title => `<div class="lecture-row" style="cursor:default">
          <div class="lecture-status">${Utils.ICONS.lock}</div>
          <div class="lecture-name" style="color:var(--text-faint)">${Utils.escapeHtml(title)}</div>
          <div class="lecture-time">soon</div>
        </div>`).join('');

    const completedCount = unit.developed ? unit.lectures.filter(l => StateModel.isLecturePassed(state, l.id)).length : 0;

    return `<div class="unit-block">
      <div class="unit-head">
        <div>
          <div class="unit-name">${Utils.escapeHtml(unit.name)}</div>
          <div class="unit-count">${unit.developed ? `${completedCount}/${unit.lectures.length} completed` : `${unit.lectures.length} lectures · content in development`}</div>
        </div>
        <div>${unit.developed ? '' : '<span class="badge badge-blue">Coming soon</span>'}</div>
      </div>
      <div class="unit-body">${lectureRows}</div>
    </div>`;
  }

  // ---------- Lecture detail ----------
  function renderLecture(container, categoryId, lectureId) {
    const state = App.state;
    const found = StateModel.findLecture(lectureId);
    if (!found) { container.innerHTML = '<div class="empty-state">Lecture not found.</div>'; return; }
    const { category, unit, lecture } = found;

    // mark viewed
    if (!state.lectureProgress[lectureId]) state.lectureProgress[lectureId] = {};
    if (!state.lectureProgress[lectureId].viewed) {
      state.lectureProgress[lectureId].viewed = true;
      state.lectureProgress[lectureId].viewedAt = Utils.nowISO();
      App.save();
    }

    const quizState = state.quizState[lectureId];
    const passed = quizState && quizState.passed;

    container.innerHTML = `
      <div class="crumbs">
        <button data-nav="categories">Categories</button><span class="sep">/</span>
        <button data-nav="category" data-id="${category.id}">${Utils.escapeHtml(category.name)}</button><span class="sep">/</span>
        <span class="current">${Utils.escapeHtml(lecture.title)}</span>
      </div>
      <div class="lecture-doc">
        <h2 class="lecture-h">${Utils.escapeHtml(lecture.title)}</h2>
        <div class="lecture-tags">
          <span class="badge badge-gray">${Utils.escapeHtml(unit.name)}</span>
          <span class="badge badge-gray">${lecture.estMinutes} min</span>
          ${passed ? '<span class="badge badge-green">Quiz passed</span>' : ''}
        </div>

        <div class="lecture-section">
          <h4>Learning Objectives</h4>
          <ul>${lecture.objectives.map(o => `<li>${Utils.escapeHtml(o)}</li>`).join('')}</ul>
        </div>

        <div class="lecture-section">
          <h4>Lesson</h4>
          ${lecture.lesson.map(p => `<p style="margin-bottom:12px">${Utils.escapeHtml(p)}</p>`).join('')}
        </div>

        <div class="lecture-section">
          <h4>Key Concepts</h4>
          <ul>${lecture.keyConcepts.map(k => `<li>${Utils.escapeHtml(k)}</li>`).join('')}</ul>
        </div>

        <div class="lecture-section">
          <h4>Practical Understanding</h4>
          <p>${Utils.escapeHtml(lecture.practical)}</p>
        </div>

        ${lecture.commands && lecture.commands.length ? `
        <div class="lecture-section">
          <h4>Reference Commands</h4>
          <div class="cmd-block">${lecture.commands.map(c => Utils.escapeHtml(c)).join('\n')}</div>
        </div>` : ''}

        <div class="lecture-section">
          <h4>Common Mistakes</h4>
          <ul>${lecture.mistakes.map(m => `<li>${Utils.escapeHtml(m)}</li>`).join('')}</ul>
        </div>

        <div class="lecture-section">
          <h4>Interview Knowledge</h4>
          <div class="callout info">${lecture.interview.map(i => Utils.escapeHtml(i)).join('<br><br>')}</div>
        </div>

        <div class="lecture-section" style="margin-top:30px">
          <h4>Knowledge Check</h4>
          <p style="margin-bottom:14px">You've reached the end of this lecture. Ready to test your understanding?</p>
          <button class="btn btn-primary" data-nav="quiz" data-cat="${category.id}" data-id="${lecture.id}">Ready for Quiz? ${passed ? '(Retake)' : ''}</button>
        </div>
      </div>
    `;
    App.wireNav(container);
  }

  // ---------- Quiz view ----------
  function renderQuiz(container, categoryId, lectureId) {
    const found = StateModel.findLecture(lectureId);
    if (!found) { container.innerHTML = '<div class="empty-state">Lecture not found.</div>'; return; }
    Quiz.start(lectureId);
    renderQuizQuestion(container, categoryId, found);
  }

  function renderQuizQuestion(container, categoryId, found) {
    const session = Quiz.current();
    const q = session.questions[session.index];
    const total = session.questions.length;

    container.innerHTML = `
      <div class="crumbs">
        <button data-nav="lecture" data-cat="${categoryId}" data-id="${found.lecture.id}">${Utils.escapeHtml(found.lecture.title)}</button><span class="sep">/</span>
        <span class="current">Quiz</span>
      </div>
      <div class="quiz-progress-bar">
        ${session.questions.map((_, i) => `<span class="${i < session.index ? 'done' : i === session.index ? 'current' : ''}"></span>`).join('')}
      </div>
      <div class="quiz-question-card">
        <div class="quiz-q-index">Question ${session.index + 1} of ${total}</div>
        <div class="quiz-q-text">${Utils.escapeHtml(q.text)}</div>
        <div class="quiz-q-hint">Select all that apply.</div>
        <div class="quiz-options">
          ${q.options.map(opt => `
            <div class="quiz-option ${session.selections[q.id].has(opt.id) ? 'selected' : ''}" data-opt="${opt.id}">
              <div class="box">${session.selections[q.id].has(opt.id) ? Utils.ICONS.check : ''}</div>
              <div>${Utils.escapeHtml(opt.text)}</div>
            </div>`).join('')}
        </div>
        <div class="quiz-nav">
          <button class="btn btn-ghost" id="quiz-prev" ${session.index === 0 ? 'disabled' : ''}>Back</button>
          ${session.index === total - 1
            ? `<button class="btn btn-primary" id="quiz-submit" ${Quiz.allAnswered() ? '' : 'disabled'}>Submit Quiz</button>`
            : `<button class="btn btn-primary" id="quiz-next" ${Quiz.isAnswered(q.id) ? '' : 'disabled'}>Next</button>`}
        </div>
      </div>
    `;

    container.querySelectorAll('.quiz-option').forEach(el => {
      el.addEventListener('click', () => {
        Quiz.toggleOption(q.id, el.dataset.opt);
        renderQuizQuestion(container, categoryId, found);
      });
    });
    const prevBtn = container.querySelector('#quiz-prev');
    if (prevBtn) prevBtn.addEventListener('click', () => { Quiz.goTo(session.index - 1); renderQuizQuestion(container, categoryId, found); });
    const nextBtn = container.querySelector('#quiz-next');
    if (nextBtn) nextBtn.addEventListener('click', () => { Quiz.goTo(session.index + 1); renderQuizQuestion(container, categoryId, found); });
    const submitBtn = container.querySelector('#quiz-submit');
    if (submitBtn) submitBtn.addEventListener('click', () => {
      const result = Quiz.submit();
      recordQuizResult(found.lecture.id, result);
      renderQuizResult(container, categoryId, found, result);
    });
  }

  function recordQuizResult(lectureId, result) {
    const state = App.state;
    if (!state.quizState[lectureId]) state.quizState[lectureId] = { attempts: [], bestScore: 0, latestScore: 0, passed: false };
    const qs = state.quizState[lectureId];
    qs.attempts.push({ date: Utils.nowISO(), score: result.scorePct, passed: result.passed });
    qs.latestScore = result.scorePct;
    qs.bestScore = Math.max(qs.bestScore, result.scorePct);
    if (result.passed) qs.passed = true;
    App.save();
  }

  function renderQuizResult(container, categoryId, found, result) {
    const session = Quiz.current();
    container.innerHTML = `
      <div class="crumbs">
        <button data-nav="lecture" data-cat="${categoryId}" data-id="${found.lecture.id}">${Utils.escapeHtml(found.lecture.title)}</button><span class="sep">/</span>
        <span class="current">Results</span>
      </div>
      <div class="quiz-result-hero">
        <div class="quiz-result-ring">
          ${Utils.ringSvg(result.scorePct, 130, 10, result.passed ? 'var(--accent)' : 'var(--red)')}
          <div class="ring-value">${result.scorePct}%</div>
        </div>
        <div class="quiz-result-title">${result.passed ? 'Passed 🎉' : 'Not Quite — Keep Going'}</div>
        <div class="quiz-result-sub">${result.passed ? 'You\'ve demonstrated solid understanding of this lecture.' : 'Review the lecture and try again.'}</div>
        <div class="quiz-result-stats">
          <div class="qrs-item"><div class="qrs-val">${result.correctCount}/${result.total}</div><div class="qrs-lbl">Correct</div></div>
          <div class="qrs-item"><div class="qrs-val">${session.passScore}%</div><div class="qrs-lbl">Pass score</div></div>
          <div class="qrs-item"><div class="qrs-val">${App.state.quizState[found.lecture.id].attempts.length}</div><div class="qrs-lbl">Attempts</div></div>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;margin-bottom:34px">
          <button class="btn btn-ghost" id="retake-btn">Retake Quiz</button>
          <button class="btn btn-primary" id="continue-btn">${result.passed ? 'Continue Learning' : 'Back to Lecture'}</button>
        </div>
      </div>

      <div class="section-head"><h3 class="section-title">Review</h3></div>
      ${session.questions.map((q, i) => {
        const r = result.perQuestion.find(p => p.qid === q.id);
        return `<div class="card quiz-question-card" style="margin-bottom:12px">
          <div class="quiz-q-index">Question ${i + 1} ${r.isCorrect ? '<span class="badge badge-green">Correct</span>' : '<span class="badge badge-red">Incorrect</span>'}</div>
          <div class="quiz-q-text" style="font-size:15px">${Utils.escapeHtml(q.text)}</div>
          <div class="quiz-options" style="margin-top:10px">
            ${q.options.map(opt => {
              const wasSelected = r.selected.includes(opt.id);
              const isCorrectOpt = q.correct.includes(opt.id);
              let cls = 'locked';
              if (isCorrectOpt && wasSelected) cls += ' correct';
              else if (isCorrectOpt && !wasSelected) cls += ' missed';
              else if (!isCorrectOpt && wasSelected) cls += ' incorrect';
              return `<div class="quiz-option ${cls}">
                <div class="box">${wasSelected ? Utils.ICONS.check : ''}</div>
                <div>${Utils.escapeHtml(opt.text)}${isCorrectOpt && !wasSelected ? ' <span style="color:var(--amber);font-size:11px">(correct answer, missed)</span>' : ''}</div>
              </div>`;
            }).join('')}
          </div>
          <div class="quiz-explain">${Utils.escapeHtml(q.explanation)}</div>
        </div>`;
      }).join('')}
    `;

    container.querySelector('#retake-btn').addEventListener('click', () => App.navigate('quiz', { cat: categoryId, id: found.lecture.id }));
    container.querySelector('#continue-btn').addEventListener('click', () => {
      if (result.passed) {
        const nextPointer = StateModel.currentLearningPointer(App.state);
        if (nextPointer) App.navigate('lecture', { cat: nextPointer.categoryId, id: nextPointer.lecture.id });
        else App.navigate('dashboard');
      } else {
        App.navigate('lecture', { cat: categoryId, id: found.lecture.id });
      }
    });
  }

  return { renderCategoryList, renderPath, renderCategoryDetail, renderLecture, renderQuiz };
})();
