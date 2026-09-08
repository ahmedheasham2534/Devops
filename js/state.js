/* ============================================================
   state.js — the central application state model + pure
   progress-calculation functions. No DOM, no localStorage here.
   ============================================================ */
const StateModel = (() => {

  function createDefaultState() {
    return {
      version: 1,
      user: { name: 'Learner' },
      settings: {
        theme: 'dark',
        notifications: true,
        reminders: true,
        passScore: 80,
      },
      lectureProgress: {},   // { [lectureId]: { viewed: true, viewedAt } }
      quizState: {},         // { [lectureId]: { attempts: [{date,score,passed}], bestScore, latestScore, passed } }
      projectStatus: {},     // { [projectId]: { status, startDate, deadline, completionDate } }
      tasks: [],             // array of task objects
      streak: { lastActiveDate: null, currentStreak: 0 },
      createdAt: Utils.nowISO(),
    };
  }

  // ---- flat lookups over CATALOG ----

  function allDevelopedLectures() {
    const out = [];
    CATALOG.categories.forEach(cat => {
      cat.units.forEach(unit => {
        if (!unit.developed) return;
        unit.lectures.forEach(lec => out.push({ categoryId: cat.id, categoryName: cat.name, unitId: unit.id, unitName: unit.name, lecture: lec }));
      });
    });
    return out;
  }

  function findLecture(lectureId) {
    for (const cat of CATALOG.categories) {
      for (const unit of cat.units) {
        if (!unit.developed) continue;
        for (const lec of unit.lectures) {
          if (lec.id === lectureId) return { category: cat, unit, lecture: lec };
        }
      }
    }
    return null;
  }

  function categoryLectures(categoryId) {
    const cat = CATALOG.categories.find(c => c.id === categoryId);
    if (!cat) return [];
    const out = [];
    cat.units.forEach(unit => {
      if (!unit.developed) return;
      unit.lectures.forEach(lec => out.push({ unitId: unit.id, lecture: lec }));
    });
    return out;
  }

  // ---- progress computation (pure functions of state) ----

  function isLecturePassed(state, lectureId) {
    const q = state.quizState[lectureId];
    return !!(q && q.passed);
  }

  function categoryProgress(state, categoryId) {
    const lectures = categoryLectures(categoryId);
    const total = lectures.length;
    const completed = lectures.filter(l => isLecturePassed(state, l.lecture.id)).length;
    return {
      total, completed, remaining: total - completed,
      pct: Utils.pct(completed, total),
      hasContent: total > 0,
    };
  }

  function overallProgress(state) {
    const all = allDevelopedLectures();
    const totalLectures = all.length;
    const completedLectures = all.filter(l => isLecturePassed(state, l.lecture.id)).length;

    let completedQuizzes = 0, attemptedQuizzes = 0;
    Object.values(state.quizState).forEach(q => {
      if (q.attempts && q.attempts.length) attemptedQuizzes++;
      if (q.passed) completedQuizzes++;
    });

    const projectEntries = Object.values(state.projectStatus);
    const completedProjects = projectEntries.filter(p => p.status === 'Completed').length;

    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.status === 'Completed').length;
    const overdueTasks = state.tasks.filter(t => t.status !== 'Completed' && Utils.isOverdue(t.deadline, false)).length;

    return {
      pct: Utils.pct(completedLectures, totalLectures),
      totalLectures, completedLectures,
      completedQuizzes, attemptedQuizzes,
      completedProjects, totalProjects: PROJECTS.length,
      totalTasks, completedTasks, overdueTasks,
    };
  }

  function allSkills(state) {
    return CATALOG.categories.map(cat => {
      const p = categoryProgress(state, cat.id);
      return { id: cat.id, name: cat.name, pct: p.pct, hasContent: p.hasContent };
    });
  }

  // Find the first not-yet-passed developed lecture, in catalog order —
  // used to drive the "Continue Learning" card.
  function currentLearningPointer(state) {
    const all = allDevelopedLectures();
    for (const entry of all) {
      if (!isLecturePassed(state, entry.lecture.id)) return entry;
    }
    return null; // everything developed has been passed
  }

  return {
    createDefaultState, allDevelopedLectures, findLecture, categoryLectures,
    isLecturePassed, categoryProgress, overallProgress, allSkills, currentLearningPointer,
  };
})();
