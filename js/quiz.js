/* ============================================================
   quiz.js — Multiple-Select Question quiz engine.
   Sequential question flow -> full submit -> scored review screen.
   Explanations are shown during the post-submit review, never before.
   ============================================================ */
const Quiz = (() => {
  let session = null; // { lectureId, questions:[{...q, options(shuffled)}], index, selections:{qid:Set}, submitted:false, result:null }

  function start(lectureId) {
    const found = StateModel.findLecture(lectureId);
    if (!found) return null;
    const quiz = found.lecture.quiz;
    const questions = Utils.shuffle(quiz.questions).map(q => ({
      ...q,
      options: Utils.shuffle(q.options),
    }));
    session = {
      lectureId, passScore: quiz.passScore || 80,
      questions, index: 0,
      selections: {}, // qid -> Set of optionIds
      submitted: false, result: null,
    };
    questions.forEach(q => { session.selections[q.id] = new Set(); });
    return session;
  }

  function current() { return session; }

  function toggleOption(qid, optId) {
    if (!session || session.submitted) return;
    const set = session.selections[qid];
    if (set.has(optId)) set.delete(optId); else set.add(optId);
  }

  function goTo(index) {
    if (!session) return;
    session.index = Utils.clamp(index, 0, session.questions.length - 1);
  }

  function isAnswered(qid) {
    return session && session.selections[qid] && session.selections[qid].size > 0;
  }

  function allAnswered() {
    return session.questions.every(q => isAnswered(q.id));
  }

  function submit() {
    if (!session) return null;
    let correctCount = 0;
    const perQuestion = session.questions.map(q => {
      const selected = session.selections[q.id];
      const correctSet = new Set(q.correct);
      const isCorrect = selected.size === correctSet.size && [...selected].every(id => correctSet.has(id));
      if (isCorrect) correctCount++;
      return { qid: q.id, isCorrect, selected: [...selected], correct: q.correct };
    });
    const total = session.questions.length;
    const scorePct = Utils.pct(correctCount, total);
    const passed = scorePct >= session.passScore;
    session.submitted = true;
    session.result = { correctCount, total, scorePct, passed, perQuestion };
    return session.result;
  }

  function reset() { session = null; }

  return { start, current, toggleOption, goTo, isAnswered, allAnswered, submit, reset };
})();
