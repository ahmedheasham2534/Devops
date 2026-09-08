/* ============================================================
   storage.js — the only file that touches localStorage directly.
   Centralized so we never scatter ad-hoc localStorage calls.
   ============================================================ */
const Storage = (() => {
  const KEY = 'opsforge_academy_state_v1';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return StateModel.createDefaultState();
      const parsed = JSON.parse(raw);
      // shallow-merge with defaults so new fields introduced later don't crash old saves
      const defaults = StateModel.createDefaultState();
      return Object.assign(defaults, parsed, {
        settings: Object.assign({}, defaults.settings, parsed.settings),
        streak: Object.assign({}, defaults.streak, parsed.streak),
      });
    } catch (e) {
      console.error('Failed to load state, resetting.', e);
      return StateModel.createDefaultState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('Failed to save state', e);
      return false;
    }
  }

  function exportJSON(state) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opsforge-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importJSON(file, onDone, onError) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid file');
        onDone(parsed);
      } catch (e) {
        onError(e);
      }
    };
    reader.onerror = () => onError(reader.error);
    reader.readAsText(file);
  }

  function reset() {
    localStorage.removeItem(KEY);
  }

  return { load, save, exportJSON, importJSON, reset };
})();
