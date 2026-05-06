/* =========================================================
   SCRIPT.JS — interazioni minimali per la pagina Workout
   - Cronometro (start / stop / reset)
   - Selezione attività -> schermata "ALLENAMENTO IN CORSO"
   - Lista esercizi con checkbox (al check l'esercizio scompare)
   - Quando tutti completati -> torna alla schermata iniziale
   ========================================================= */

(function () {
  // ---------- TIMER ----------
  const display = document.getElementById('timer-display');
  let elapsed = 0;       // millisecondi
  let startTs = 0;
  let intervalId = null;

  function fmt(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }
  function render() { if (display) display.textContent = fmt(elapsed); }
  function start() {
    if (intervalId) return;
    startTs = Date.now() - elapsed;
    intervalId = setInterval(() => { elapsed = Date.now() - startTs; render(); }, 250);
  }
  function stop() {
    if (!intervalId) return;
    clearInterval(intervalId); intervalId = null;
  }
  function reset() {
    stop(); elapsed = 0; render();
  }

  document.getElementById('timer-start')?.addEventListener('click', start);
  document.getElementById('timer-stop')?.addEventListener('click', stop);
  document.getElementById('timer-reset')?.addEventListener('click', reset);

  // ---------- SCHERMATE ----------
  const screenHome = document.getElementById('screen-home');
  const screenWorkout = document.getElementById('screen-workout');
  const exerciseList = document.getElementById('exercise-list');
  const workoutLabel = document.getElementById('workout-label');

  function showHome() {
    screenWorkout.hidden = true;
    screenHome.hidden = false;
    reset();
  }
  function showWorkout() {
    screenHome.hidden = true;
    screenWorkout.hidden = false;
  }

  // Mappa attività -> id template e label
  const ACTIVITIES = {
    dinamico:    { tpl: 'ex-dinamico', label: 'Stretching dinamico' },
    statico:     { tpl: 'ex-statico',  label: 'Stretching statico'  },
    abs:         { tpl: 'ex-abs',      label: 'Circuito ABS'        },
    // "allenamento" viene risolto dinamicamente in base al giorno
  };

  function getAllenamentoTemplate() {
    const day = new Date().getDay(); // 0..6
    return document.getElementById(`ex-allenamento-${day}`)
        || document.getElementById('ex-allenamento-1'); // fallback
  }

  function loadExercises(activity) {
    let tpl, label;
    if (activity === 'allenamento') {
      tpl = getAllenamentoTemplate();
      label = tpl?.dataset.label || 'Allenamento';
    } else {
      const cfg = ACTIVITIES[activity];
      tpl = document.getElementById(cfg.tpl);
      label = cfg.label;
    }
    workoutLabel.textContent = label;

    exerciseList.innerHTML = '';
    if (!tpl) return;
    Array.from(tpl.content.querySelectorAll('li')).forEach((srcLi) => {
      const li = document.createElement('li');
      li.className = 'exercise-item';
      li.innerHTML = `
        <label class="ex-row">
          <input type="checkbox" class="ex-check" />
          <div class="ex-info">
            <h3>${srcLi.dataset.name}</h3>
            <div class="exercise-meta">
              <span class="chip">${srcLi.dataset.sets} serie</span>
              <span class="chip">${srcLi.dataset.reps} reps</span>
              <span class="chip">${srcLi.dataset.weight}</span>
            </div>
          </div>
        </label>`;
      const cb = li.querySelector('input');
      cb.addEventListener('change', () => {
        if (!cb.checked) return;
        li.classList.add('done');
        // Rimuove l'esercizio dopo una breve animazione
        setTimeout(() => {
          li.remove();
          if (exerciseList.children.length === 0) {
            // Tutti completati -> torna alla home
            alert('🎉 Allenamento completato!');
            showHome();
          }
        }, 250);
      });
      exerciseList.appendChild(li);
    });
  }

  document.querySelectorAll('.activity-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      loadExercises(btn.dataset.activity);
      reset();
      showWorkout();
      start();
    });
  });

  document.getElementById('exit-workout')?.addEventListener('click', showHome);

  render();
})();
