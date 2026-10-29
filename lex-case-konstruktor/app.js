const els = {
  topic: document.getElementById('topicSelect'),
  difficulty: document.getElementById('difficultySelect'),
  format: document.getElementById('formatSelect'),
  generate: document.getElementById('generateBtn'),
  randomize: document.getElementById('randomizeBtn'),
  newBtn: document.getElementById('newBtn'),
  result: document.getElementById('resultSection'),
  title: document.getElementById('caseTitle'),
  text: document.getElementById('caseText'),
  meta: document.getElementById('caseMeta'),
  taskText: document.getElementById('taskText'),
  sentencingContext: document.getElementById('sentencingContext'),
  questionsBtn: document.getElementById('questionsBtn'),
  solutionBtn: document.getElementById('solutionBtn'),
  questionsPanel: document.getElementById('questionsPanel'),
  solutionPanel: document.getElementById('solutionPanel'),
  questionsList: document.getElementById('questionsList'),
  solutionText: document.getElementById('solutionText'),
  copyCase: document.getElementById('copyCaseBtn'),
  copyAll: document.getElementById('copyAllBtn'),
  theme: document.getElementById('themeToggle'),
  toast: document.getElementById('toast')
};

let currentCase = null;
let serial = 1;
let lastCaseKey = null;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickDifferent(arr, keyFn) {
  if (arr.length < 2) return arr[0];
  let picked = pickRandom(arr);
  let key = keyFn(picked);
  let guard = 0;
  while (key === lastCaseKey && guard < 12) {
    picked = pickRandom(arr);
    key = keyFn(picked);
    guard += 1;
  }
  lastCaseKey = key;
  return picked;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 1700);
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestions(format, difficulty) {
  const base = QUESTION_SETS[format];
  const count = difficulty === 'basic' ? 3 : difficulty === 'medium' ? 4 : 5;
  return shuffle(base).slice(0, Math.min(count, base.length));
}

function buildSolution(item, format, difficulty) {
  const formatLead = {
    qualification: "Начните с определения объекта посягательства, способа совершения деяния и направленности умысла. Затем сопоставьте установленные признаки с возможными составами и исключите смежные варианты.",
    elements: "Структурируйте ответ по четырём элементам состава: объект, объективная сторона, субъект и субъективная сторона. Отдельно выделите обязательные и факультативные признаки.",
    distinction: "Составьте таблицу разграничительных признаков: объект, предмет, способ, последствия, форма вины, цель, момент окончания и специальные признаки субъекта.",
    sentencing: "Сначала определите квалификацию и санкцию применяемой нормы. Затем последовательно проверьте общие начала назначения наказания, смягчающие и отягчающие обстоятельства, специальные правила (в том числе при неоконченном преступлении, соучастии или рецидиве), а при необходимости — правила совокупности преступлений или приговоров, сложения и зачёта."
  }[format];

  const difficultyTail = {
    basic: "Для базового уровня достаточно назвать основной вариант и 2–3 ключевых аргумента.",
    medium: "Для среднего уровня желательно разобрать альтернативный вариант и указать, какого факта не хватает для окончательного вывода.",
    advanced: "Для повышенного уровня необходимо предложить несколько конкурирующих версий, показать их разграничение и указать, какие доказательства способны изменить итоговый вывод."
  }[difficulty];

  const sentencingTail = format === 'sentencing'
    ? `<p><strong>Контрольная последовательность.</strong></p>
       <ol>
         <li>Определите санкцию и категорию преступления.</li>
         <li>Проверьте ст. 60–68 УК РФ применительно к условиям задачи.</li>
         <li>Если преступлений несколько — отдельно назначьте наказание за каждое и только затем переходите к правилам ст. 69 УК РФ.</li>
         <li>Если новое преступление совершено после предыдущего приговора при наличии неотбытой части наказания — проверьте ст. 70 УК РФ.</li>
         <li>При необходимости проверьте правила сложения и зачёта по ст. 71–72 УК РФ.</li>
       </ol>`
    : '';

  return `
    <p><strong>Алгоритм анализа.</strong> ${formatLead}</p>
    <p><strong>Юридически значимые узлы:</strong></p>
    <ul>${item.issues.map(i => `<li>${i}</li>`).join('')}</ul>
    <p><strong>Ориентир для преподавателя.</strong> ${item.orientation}</p>
    ${sentencingTail}
    <p><strong>Уровень ответа.</strong> ${difficultyTail}</p>
    <p><em>LEX CASE не подменяет проверку действующей редакции закона, постановлений Пленума Верховного Суда РФ и актуальной судебной практики.</em></p>
  `;
}

function generateCase() {
  const topic = els.topic.value;
  const difficulty = els.difficulty.value;
  const format = els.format.value;
  const item = pickDifferent(CASE_LIBRARY[topic], candidate => `${topic}:${candidate.title}`);
  const questions = buildQuestions(format, difficulty);
  const sentencingProfile = format === 'sentencing' ? pickRandom(SENTENCING_PROFILES[difficulty]) : '';
  const solution = buildSolution(item, format, difficulty);

  currentCase = {
    number: String(serial++).padStart(2, '0'),
    topic,
    difficulty,
    format,
    title: item.title,
    text: item.facts[difficulty],
    task: TASK_DESCRIPTIONS[format],
    sentencingProfile,
    questions,
    solution
  };

  renderCase();
}

function renderCase() {
  if (!currentCase) return;
  const c = currentCase;

  els.title.textContent = `Кейс № ${c.number} · ${c.title}`;
  els.text.textContent = c.text;
  els.taskText.textContent = c.task;
  els.meta.textContent = `${TOPIC_NAMES[c.topic]} · ${DIFFICULTY_NAMES[c.difficulty]} · ${FORMAT_NAMES[c.format]}`;
  els.questionsList.innerHTML = c.questions.map(q => `<li>${q}</li>`).join('');
  els.solutionText.innerHTML = c.solution;

  if (c.sentencingProfile) {
    els.sentencingContext.textContent = c.sentencingProfile;
    els.sentencingContext.classList.remove('hidden');
  } else {
    els.sentencingContext.textContent = '';
    els.sentencingContext.classList.add('hidden');
  }

  els.questionsPanel.classList.add('hidden');
  els.solutionPanel.classList.add('hidden');
  els.questionsBtn.textContent = 'Показать вопросы';
  els.solutionBtn.textContent = 'Показать ориентир';
  els.result.classList.remove('hidden');
  els.result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function togglePanel(panel, button, openLabel, closeLabel) {
  const isHidden = panel.classList.contains('hidden');
  panel.classList.toggle('hidden');
  button.textContent = isHidden ? closeLabel : openLabel;
}

function cleanTextFromHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.innerText.trim();
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  showToast(message);
}

function allCaseText() {
  if (!currentCase) return '';
  const lines = [
    `LEX CASE — Кейс № ${currentCase.number}: ${currentCase.title}`,
    `Раздел: ${TOPIC_NAMES[currentCase.topic]}`,
    `Сложность: ${DIFFICULTY_NAMES[currentCase.difficulty]}`,
    `Формат: ${FORMAT_NAMES[currentCase.format]}`,
    '',
    'Фабула:',
    currentCase.text,
    '',
    'Задание:',
    currentCase.task
  ];

  if (currentCase.sentencingProfile) {
    lines.push('', 'Дополнительные вводные для анализа наказания:', currentCase.sentencingProfile);
  }

  lines.push(
    '',
    'Вопросы:',
    ...currentCase.questions.map((q, i) => `${i + 1}. ${q}`),
    '',
    'Ориентир для преподавателя:',
    cleanTextFromHtml(currentCase.solution)
  );

  return lines.join('\n');
}

function randomizeSettings() {
  const randomOption = select => {
    select.selectedIndex = Math.floor(Math.random() * select.options.length);
  };
  randomOption(els.topic);
  randomOption(els.difficulty);
  randomOption(els.format);
  showToast('Настройки изменены');
}

els.generate.addEventListener('click', generateCase);
els.newBtn.addEventListener('click', generateCase);
els.randomize.addEventListener('click', randomizeSettings);

els.questionsBtn.addEventListener('click', () => {
  togglePanel(els.questionsPanel, els.questionsBtn, 'Показать вопросы', 'Скрыть вопросы');
});
els.solutionBtn.addEventListener('click', () => {
  togglePanel(els.solutionPanel, els.solutionBtn, 'Показать ориентир', 'Скрыть ориентир');
});

els.copyCase.addEventListener('click', () => {
  if (!currentCase) return;
  copyText(currentCase.text, 'Фабула скопирована');
});
els.copyAll.addEventListener('click', () => {
  if (!currentCase) return;
  copyText(allCaseText(), 'Кейс, вопросы и ориентир скопированы');
});

els.theme.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('lexcase-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

if (localStorage.getItem('lexcase-theme') === 'dark') {
  document.body.classList.add('dark');
}

generateCase();
