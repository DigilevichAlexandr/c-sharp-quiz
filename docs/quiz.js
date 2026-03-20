const STORAGE_KEY = "dotnet-quiz-passed-v1";

const contexts = [
  "На code review в highload API",
  "В продакшн-сервисе с тысячами RPS",
  "На собеседовании senior backend",
  "В монолите после миграции на .NET 9",
  "При отладке инцидента с latency",
  "Во время рефакторинга legacy-решения",
  "В микросервисе с PostgreSQL и Redis",
  "В ASP.NET Core приложении под Kubernetes",
  "В библиотечном коде для нескольких команд",
  "При оптимизации производительности CI среды"
];

const topics = [
  {
    stem: "что корректнее всего про внедрение scoped зависимости в singleton?",
    correct: "Так делать напрямую нельзя: нарушается lifetime и часто возникает InvalidOperationException.",
    wrongs: [
      "Контейнер автоматически продлит жизнь scoped до singleton без рисков.",
      "Это корректно, если сервис зарегистрирован до Build().",
      "Такое ограничение действует только в Development."
    ],
    explanation: "Singleton живет дольше запроса и не должен удерживать scoped объект."
  },
  {
    stem: "зачем в библиотеке обычно используют ConfigureAwait(false)?",
    correct: "Чтобы не захватывать SynchronizationContext и снизить риск дедлоков в чужом окружении.",
    wrongs: [
      "Чтобы гарантировать возврат в UI поток после await.",
      "Чтобы Task всегда завершался синхронно.",
      "Чтобы метод перестал требовать async."
    ],
    explanation: "Библиотека не должна навязывать контекст выполнения потребителю."
  },
  {
    stem: "почему Result/Wait() на Task в веб-коде считается плохой практикой?",
    correct: "Блокирует поток и ухудшает масштабирование, а в отдельных контекстах провоцирует дедлок.",
    wrongs: [
      "Потому что это запрещено синтаксисом C# в ASP.NET Core.",
      "Потому что CLR автоматически бросает исключение на любом Wait().",
      "Потому что Task нельзя использовать вне Main()."
    ],
    explanation: "Асинхронную работу лучше ожидать через await без блокировки потока."
  },
  {
    stem: "когда AsNoTracking() в EF Core наиболее уместен?",
    correct: "Для read-only запросов, где не нужен change tracking и требуется меньше накладных расходов.",
    wrongs: [
      "Когда нужно, чтобы SaveChanges сохранил изменения автоматически.",
      "Когда требуется включить lazy loading глобально.",
      "Когда нужно удалить сущность без Attach."
    ],
    explanation: "Без tracking контекст не отслеживает изменения, но чтение обычно быстрее."
  },
  {
    stem: "в чем ключевая польза IHttpClientFactory?",
    correct: "Управление lifecycle handlers и предотвращение socket exhaustion при массовых запросах.",
    wrongs: [
      "Он заставляет HttpClient работать только синхронно.",
      "Он нужен исключительно для Blazor приложений.",
      "Он запрещает использовать typed clients."
    ],
    explanation: "Factory централизует конфигурацию и корректно переиспользует handlers."
  },
  {
    stem: "какой риск у fire-and-forget Task.Run внутри HTTP endpoint?",
    correct: "Задача может завершиться после конца запроса без контроля, а исключение потеряется.",
    wrongs: [
      "ASP.NET Core всегда дожидается таких задач перед ответом.",
      "CLR конвертирует Task.Run в HostedService автоматически.",
      "Это безопасно, если метод помечен async."
    ],
    explanation: "Для фоновых задач лучше использовать управляемые очереди и BackgroundService."
  },
  {
    stem: "что наиболее точно про CancellationToken?",
    correct: "Отмена кооперативная: код должен сам проверять токен и корректно завершаться.",
    wrongs: [
      "Токен всегда прерывает поток на уровне ОС.",
      "Отмена гарантирует мгновенный abort любого метода.",
      "CancellationToken работает только в ASP.NET Core."
    ],
    explanation: "Токен лишь сигнализирует об отмене, но не прерывает код магически."
  },
  {
    stem: "почему повторный foreach по IQueryable может быть проблемой?",
    correct: "Каждое перечисление может повторно выполнить SQL и дать другую выборку.",
    wrongs: [
      "CLR кэширует результат IQueryable навсегда.",
      "Компилятор C# запрещает второе перечисление.",
      "Проблема касается только LINQ to Objects."
    ],
    explanation: "Deferred execution выполняет запрос в момент перечисления."
  },
  {
    stem: "для чего в production нужен UseExceptionHandler?",
    correct: "Для централизованной обработки ошибок без утечки stack trace клиенту.",
    wrongs: [
      "Чтобы автоматически исправлять все исключения и продолжать pipeline.",
      "Чтобы отключить ILogger и сократить latency.",
      "Чтобы обрабатывать только ошибки Razor компиляции."
    ],
    explanation: "Обработчик формирует безопасный ответ и упрощает диагностику."
  },
  {
    stem: "зачем использовать await using с IAsyncDisposable?",
    correct: "Чтобы корректно освобождать асинхронные ресурсы, например сетевые/IO объекты.",
    wrongs: [
      "Чтобы компилятор заменил IDisposable на singleton.",
      "Чтобы избежать блока finally в синхронном коде.",
      "Чтобы объект нельзя было повторно использовать."
    ],
    explanation: "Асинхронная очистка может требовать await и не должна блокировать поток."
  },
  {
    stem: "что произойдет при захвате DbContext в singleton сервис?",
    correct: "Контекст может жить слишком долго, терять актуальность и ломать потокобезопасность.",
    wrongs: [
      "DbContext автоматически становится thread-safe.",
      "EF Core создаст новый DbContext на каждый вызов метода singleton.",
      "Это рекомендуется для снижения аллокаций."
    ],
    explanation: "DbContext проектировался как короткоживущий scoped объект."
  },
  {
    stem: "какая цель AddDbContextPool в EF Core?",
    correct: "Переиспользовать экземпляры DbContext через пул и снизить накладные расходы создания.",
    wrongs: [
      "Сделать один DbContext на всё приложение.",
      "Включить second-level cache без дополнительных настроек.",
      "Отключить все транзакции для ускорения."
    ],
    explanation: "Пул дает выигрыш в throughput, но требует аккуратного дизайна контекста."
  },
  {
    stem: "зачем в ASP.NET Core включают response compression?",
    correct: "Чтобы уменьшать размер ответов и экономить сетевой трафик для клиентов.",
    wrongs: [
      "Чтобы ускорить работу CPU при сериализации JSON.",
      "Чтобы автоматически шифровать весь HTTP трафик.",
      "Чтобы отключить chunked transfer encoding."
    ],
    explanation: "Сжатие снижает объем данных, особенно на текстовых payload."
  },
  {
    stem: "что опасно в async void вне event handlers?",
    correct: "Исключения трудно перехватить, а завершение метода невозможно корректно ожидать.",
    wrongs: [
      "Это единственный способ вернуть Task из метода.",
      "CLR автоматически заворачивает async void в ValueTask.",
      "Такой метод всегда выполняется быстрее async Task."
    ],
    explanation: "Для приложений и библиотек обычно нужен async Task/Task<T>."
  },
  {
    stem: "когда ValueTask действительно оправдан?",
    correct: "Когда часто есть синхронный результат и нужно снижать аллокации на hot path.",
    wrongs: [
      "Всегда вместо Task, независимо от профиля нагрузки.",
      "Только в UI приложениях с SynchronizationContext.",
      "Только если метод возвращает bool."
    ],
    explanation: "ValueTask сложнее в использовании и полезен только при подтвержденной выгоде."
  },
  {
    stem: "что может сломаться при отсутствии ConfigureKestrel limits?",
    correct: "Без лимитов можно получить DoS по размеру/времени запросов и рост потребления ресурсов.",
    wrongs: [
      "Kestrel автоматически отклоняет все большие запросы без конфигурации.",
      "Лимиты влияют только на HTTPS и не касаются HTTP.",
      "Это относится только к IIS, а не к Kestrel."
    ],
    explanation: "Лимиты — важная часть hardening веб-сервиса."
  },
  {
    stem: "почему не стоит возвращать IQueryable из репозитория наружу?",
    correct: "Слой выше может неявно изменить SQL, нарушить инварианты и усложнить контроль производительности.",
    wrongs: [
      "IQueryable нельзя перечислять за пределами репозитория по спецификации LINQ.",
      "Это всегда быстрее, поэтому ограничений нет.",
      "Проблема относится только к in-memory provider."
    ],
    explanation: "Лучше возвращать материализованные DTO или явно ограниченные запросы."
  },
  {
    stem: "зачем включать health checks в сервисе?",
    correct: "Чтобы оркестратор и мониторинг понимали готовность и живость приложения.",
    wrongs: [
      "Чтобы заменить все интеграционные тесты health endpoint.",
      "Чтобы автоматически чинить базу данных при сбое.",
      "Чтобы отключить логирование ошибок при старте."
    ],
    explanation: "Readiness/Liveness помогают управлять rollout и recover."
  },
  {
    stem: "что дает ProblemDetails в API?",
    correct: "Единый формат ошибок, удобный для клиента и трассировки проблем.",
    wrongs: [
      "Полное сокрытие всех кодов статуса в ответах.",
      "Автоматическую ретри-логику на клиенте.",
      "Переход на GraphQL без изменений контракта."
    ],
    explanation: "Стандартизованный формат улучшает сопровождение и DX."
  },
  {
    stem: "почему чрезмерный лог в Information может быть вреден?",
    correct: "Создает шум, повышает стоимость хранения и ухудшает поиск реальных инцидентов.",
    wrongs: [
      "Information логи автоматически удаляются CLR при нагрузке.",
      "Information нельзя отправлять в централизованный логгер.",
      "Это влияет только на консоль, но не на production."
    ],
    explanation: "Уровни логов нужно выбирать осмысленно по ценности сигнала."
  },
  {
    stem: "что важнее всего учесть при retry-политике к внешнему API?",
    correct: "Идемпотентность операций, backoff и ограничение числа повторов.",
    wrongs: [
      "Всегда ретраить бесконечно до успеха.",
      "Ретраи не нужны, если используется HttpClientFactory.",
      "Retry должен выполняться без задержек для снижения latency."
    ],
    explanation: "Неправильный retry может усилить деградацию зависимостей."
  },
  {
    stem: "зачем нужен circuit breaker при нестабильной зависимости?",
    correct: "Чтобы быстро прекращать бесполезные вызовы и дать системе восстановиться.",
    wrongs: [
      "Чтобы принудительно увеличить timeout каждого запроса.",
      "Чтобы всегда скрывать ошибки от пользователя.",
      "Чтобы заменить TLS шифрование на уровне транспорта."
    ],
    explanation: "Circuit breaker защищает ресурсы и уменьшает cascading failures."
  },
  {
    stem: "что критично при сериализации enum в публичном API?",
    correct: "Стабильность контракта: лучше фиксировать строковые значения и явные маппинги.",
    wrongs: [
      "Всегда отдавать enum как int без документации.",
      "Изменение порядка enum не влияет на клиентов.",
      "Enum нельзя сериализовать в JSON в .NET."
    ],
    explanation: "Непродуманный формат enum легко ломает обратную совместимость."
  },
  {
    stem: "какая проблема у DateTime.Now в распределенной системе?",
    correct: "Локальная зона и смещения могут искажать сравнения; безопаснее хранить UTC.",
    wrongs: [
      "DateTime.Now всегда возвращает UTC на Linux.",
      "DateTime.Now не поддерживает миллисекунды.",
      "DateTime.Now нельзя использовать в логах."
    ],
    explanation: "UTC и явные правила преобразования снижают ошибки времени."
  },
  {
    stem: "что может быть не так с долгой транзакцией в EF Core?",
    correct: "Повышает блокировки, удерживает ресурсы и ухудшает конкурентный доступ.",
    wrongs: [
      "Долгая транзакция всегда повышает производительность.",
      "EF Core автоматически дробит транзакцию на безопасные куски.",
      "Транзакции влияют только на чтение, но не на запись."
    ],
    explanation: "Транзакции должны быть максимально короткими и предсказуемыми."
  },
  {
    stem: "почему cache-aside требует осторожности при инвалидации?",
    correct: "Если invalidation неточный, можно долго отдавать устаревшие данные.",
    wrongs: [
      "Cache-aside всегда строгая консистентность без усилий.",
      "Кэш автоматически узнает об изменениях в любой БД.",
      "Инвалидация не нужна при TTL больше 1 часа."
    ],
    explanation: "Кэширование ускоряет систему, но усложняет модель согласованности."
  },
  {
    stem: "какой риск у большого object graph при JSON сериализации?",
    correct: "Рост времени/памяти и возможные циклические ссылки без корректных настроек.",
    wrongs: [
      "System.Text.Json всегда обходит циклы без конфигурации.",
      "Размер графа не влияет на аллокации.",
      "Проблема есть только у XML сериализации."
    ],
    explanation: "Структуру DTO лучше ограничивать и контролировать размер ответа."
  },
  {
    stem: "почему thread-safety важен для singleton кеша в памяти?",
    correct: "Один экземпляр разделяется всеми запросами и гонки легко ломают данные.",
    wrongs: [
      "Singleton автоматически делает коллекции потокобезопасными.",
      "Потокобезопасность нужна только для scoped сервисов.",
      "В ASP.NET Core все запросы обрабатываются в одном потоке."
    ],
    explanation: "Общие mutable структуры требуют синхронизации или lock-free дизайна."
  },
  {
    stem: "что важно при пагинации больших таблиц?",
    correct: "Стабильный порядок и индексы; для deep paging часто лучше keyset pagination.",
    wrongs: [
      "OFFSET без ORDER BY всегда детерминирован.",
      "Чем больше LIMIT, тем быстрее отдача страницы.",
      "Индексы не влияют на пагинацию."
    ],
    explanation: "Непродуманная пагинация быстро деградирует на больших данных."
  },
  {
    stem: "зачем ограничивать размер входного JSON payload?",
    correct: "Чтобы снизить риск resource exhaustion и контролировать предсказуемость обработки.",
    wrongs: [
      "Ограничения payload всегда ухудшают безопасность.",
      "ASP.NET Core по умолчанию блокирует любой payload > 1KB.",
      "Лимит размера влияет только на ответы сервера."
    ],
    explanation: "Размер запроса — важная часть защиты и SLO."
  }
];

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuestions() {
  const list = [];
  let id = 1;

  for (const context of contexts) {
    for (const topic of topics) {
      list.push({
        id,
        text: `${context}: ${topic.stem}`,
        correct: topic.correct,
        wrongs: topic.wrongs,
        explanation: topic.explanation
      });
      id += 1;
    }
  }

  return list;
}

const questions = buildQuestions();
const totalQuestions = questions.length;

const form = document.getElementById("quiz-form");
const result = document.getElementById("result");
const progressBar = document.getElementById("progress-bar");
const submitBtn = document.getElementById("submit-btn");
const nextBtn = document.getElementById("next-btn");
const resetBtn = document.getElementById("reset-progress-btn");

let passedIds = loadPassed();
let currentQuestion = null;
let currentOptions = [];

function loadPassed() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return new Set();

  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => Number.isInteger(x)));
  } catch {
    return new Set();
  }
}

function savePassed() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...passedIds]));
}

function updateProgress() {
  const passed = passedIds.size;
  const left = totalQuestions - passed;
  progressBar.innerHTML = `
    <strong>Всего:</strong> ${totalQuestions}
    &nbsp;|&nbsp;
    <strong>Пройдено:</strong> ${passed}
    &nbsp;|&nbsp;
    <strong>Осталось:</strong> ${left}
  `;
}

function pickRandomQuestion() {
  const remaining = questions.filter((q) => !passedIds.has(q.id));
  if (remaining.length === 0) return null;
  const index = Math.floor(Math.random() * remaining.length);
  return remaining[index];
}

function renderQuestion() {
  currentQuestion = pickRandomQuestion();
  result.classList.add("hidden");
  submitBtn.disabled = false;
  nextBtn.classList.add("hidden");

  if (!currentQuestion) {
    form.innerHTML = `
      <section class="card">
        <div class="q-index">Завершено</div>
        <h2 class="q-title">Ты прошел все 300 вопросов.</h2>
        <p class="muted">Нажми "Сбросить прогресс", чтобы начать заново с новым случайным порядком.</p>
      </section>
    `;
    submitBtn.disabled = true;
    return;
  }

  currentOptions = shuffle([
    { text: currentQuestion.correct, isCorrect: true },
    ...currentQuestion.wrongs.map((x) => ({ text: x, isCorrect: false }))
  ]);

  form.innerHTML = `
    <section class="card">
      <div class="q-index">Вопрос ${currentQuestion.id} / ${totalQuestions}</div>
      <h2 class="q-title">${currentQuestion.text}</h2>
      ${currentOptions.map((opt, i) => `
        <label class="option">
          <input type="radio" name="answer" value="${i}">
          <span>${opt.text}</span>
        </label>
      `).join("")}
    </section>
  `;
}

function answerCurrentQuestion() {
  if (!currentQuestion) return;

  const checked = form.querySelector("input[name='answer']:checked");
  if (!checked) {
    result.innerHTML = "<p>Сначала выбери вариант ответа.</p>";
    result.classList.remove("hidden");
    return;
  }

  const selected = Number(checked.value);
  const selectedOption = currentOptions[selected];
  const statusClass = selectedOption.isCorrect ? "ok" : "bad";
  const statusText = selectedOption.isCorrect ? "Верно" : "Неверно";
  const correctText = currentOptions.find((x) => x.isCorrect).text;

  passedIds.add(currentQuestion.id);
  savePassed();
  updateProgress();

  result.innerHTML = `
    <article class="result-item ${statusClass}">
      <h3>${statusText}</h3>
      <p><strong>Твой ответ:</strong> ${selectedOption.text}</p>
      <p><strong>Правильный ответ:</strong> ${correctText}</p>
      <p class="muted"><strong>Пояснение:</strong> ${currentQuestion.explanation}</p>
    </article>
  `;

  result.classList.remove("hidden");
  nextBtn.classList.remove("hidden");
  submitBtn.disabled = true;
}

function resetProgress() {
  passedIds = new Set();
  savePassed();
  updateProgress();
  renderQuestion();
}

submitBtn.addEventListener("click", answerCurrentQuestion);
nextBtn.addEventListener("click", renderQuestion);
resetBtn.addEventListener("click", resetProgress);

updateProgress();
renderQuestion();
