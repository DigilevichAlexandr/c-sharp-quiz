const questions = [
  {
    id: 1,
    text: "Что произойдет, если в ASP.NET Core зарегистрировать сервис как singleton, но внедрять в него scoped-сервис напрямую через конструктор?",
    options: [
      "Это допустимо, контейнер создаст scoped-сервис один раз при старте приложения.",
      "Приложение не скомпилируется из-за ошибки DI на этапе компиляции.",
      "Это нарушает время жизни зависимостей и обычно приводит к InvalidOperationException в рантайме.",
      "Контейнер автоматически повысит scoped-сервис до singleton."
    ],
    correct: 2,
    explanation: "Singleton живет дольше scoped-объекта. ASP.NET Core запрещает такой захват, чтобы избежать утечек контекста запроса."
  },
  {
    id: 2,
    text: "Для чего реально нужен ConfigureAwait(false) в библиотечном коде .NET?",
    options: [
      "Чтобы гарантировать выполнение продолжения строго в том же потоке.",
      "Чтобы не захватывать текущий SynchronizationContext и уменьшить риск дедлоков в старых контекстах.",
      "Чтобы ускорить любой async-код минимум в 2 раза.",
      "Чтобы Task всегда завершался синхронно."
    ],
    correct: 1,
    explanation: "ConfigureAwait(false) отключает возврат в исходный контекст, что особенно важно для библиотек и UI/legacy окружений."
  },
  {
    id: 3,
    text: "Почему использовать Result/Wait() на Task в ASP.NET Core обычно опасно?",
    options: [
      "Потому что Task нельзя ожидать вне метода Main.",
      "Потому что блокировка потока снижает масштабируемость и может вызвать дедлок в определенных контекстах.",
      "Потому что CLR запрещает смешивать sync и async.",
      "Потому что это работает только в Linux, но не в Windows."
    ],
    correct: 1,
    explanation: "Синхронное ожидание асинхронной операции блокирует поток и ломает модель масштабирования сервера."
  },
  {
    id: 4,
    text: "Какой из вариантов наиболее корректно описывает разницу между IEnumerable<T> и IAsyncEnumerable<T>?",
    options: [
      "IAsyncEnumerable<T> хранит данные в памяти, IEnumerable<T> — нет.",
      "IAsyncEnumerable<T> позволяет асинхронно получать элементы по мере готовности источника.",
      "IEnumerable<T> поддерживает только массивы, IAsyncEnumerable<T> — любые коллекции.",
      "Между ними нет практической разницы."
    ],
    correct: 1,
    explanation: "IAsyncEnumerable<T> полезен для потоковой выборки из БД/сети без полной материализации данных."
  },
  {
    id: 5,
    text: "В Entity Framework Core что произойдет при использовании AsNoTracking()?",
    options: [
      "Сущности не будут сохраняться автоматически, потому что контекст их не отслеживает.",
      "EF Core отключит lazy loading навсегда для всего приложения.",
      "Запрос станет транзакционным по умолчанию.",
      "AsNoTracking() работает только для удаления данных."
    ],
    correct: 0,
    explanation: "Без tracking EF Core не знает об изменениях сущностей, поэтому нужно вручную attach/update перед SaveChanges."
  },
  {
    id: 6,
    text: "Какая проблема может возникнуть при множественном перечислении LINQ-запроса к базе (без ToList/ToArray)?",
    options: [
      "Запрос выполнится один раз и закэшируется CLR.",
      "Каждое перечисление может заново обращаться к БД и давать разные результаты.",
      "Компилятор C# автоматически запретит второе перечисление.",
      "Это влияет только на размер сборки, но не на поведение."
    ],
    correct: 1,
    explanation: "LINQ-запросы с deferred execution выполняются при перечислении, поэтому повторный foreach может сделать повторный SQL."
  },
  {
    id: 7,
    text: "Зачем в ASP.NET Core нужен middleware UseExceptionHandler в production?",
    options: [
      "Он автоматически исправляет исключения и продолжает выполнение.",
      "Он перенаправляет необработанные исключения в централизованный обработчик, скрывая внутренние детали.",
      "Он заменяет ILogger и отменяет логирование.",
      "Он работает только для ошибок компиляции Razor."
    ],
    correct: 1,
    explanation: "В production важно не отдавать клиенту stack trace и централизованно формировать безопасный ответ."
  },
  {
    id: 8,
    text: "Почему для HTTP-клиента в .NET рекомендуют IHttpClientFactory вместо частого new HttpClient()?",
    options: [
      "IHttpClientFactory всегда быстрее минимум на порядок.",
      "Чтобы избежать проблем с истощением сокетов и централизовать конфигурацию клиентов.",
      "Потому что HttpClient нельзя использовать в singleton-сервисах.",
      "Потому что HttpClient устарел и запрещен в .NET 8+."
    ],
    correct: 1,
    explanation: "Фабрика управляет жизненным циклом HttpMessageHandler и предотвращает типичные сетевые проблемы."
  },
  {
    id: 9,
    text: "Какой риск у fire-and-forget задачи (Task.Run без await) внутри обработчика HTTP-запроса?",
    options: [
      "Никакого, ASP.NET Core всегда дождется завершения всех фоновых задач.",
      "Исключения могут потеряться, а задача может завершиться после конца запроса без контроля.",
      "Код перестанет компилироваться в Release.",
      "Task.Run автоматически превращается в hosted service."
    ],
    correct: 1,
    explanation: "Для управляемых фоновых процессов лучше использовать BackgroundService/очередь задач, а не неотслеживаемые fire-and-forget."
  },
  {
    id: 10,
    text: "Что наиболее корректно про CancellationToken в .NET?",
    options: [
      "Если токен отменен, операция обязана мгновенно завершиться всегда.",
      "CancellationToken сам по себе прерывает поток на уровне ОС.",
      "Отмена кооперативная: код должен явно проверять токен и корректно завершать работу.",
      "CancellationToken нужен только для ASP.NET Core, вне веба он бесполезен."
    ],
    correct: 2,
    explanation: "Отмена в .NET добровольная: библиотека или ваш код должны поддерживать ее в критических местах."
  }
];

const form = document.getElementById("quiz-form");
const result = document.getElementById("result");
const submitBtn = document.getElementById("submit-btn");
const retryBtn = document.getElementById("retry-btn");

function renderQuiz() {
  form.innerHTML = questions.map((q) => `
    <section class="card">
      <div class="q-index">Вопрос ${q.id}</div>
      <h2 class="q-title">${q.text}</h2>
      ${q.options.map((opt, i) => `
        <label class="option">
          <input type="radio" name="q-${q.id}" value="${i}">
          <span>${opt}</span>
        </label>
      `).join("")}
    </section>
  `).join("");
}

function getLevel(score, total) {
  const p = score / total;
  if (p >= 0.9) return "Senior .NET";
  if (p >= 0.7) return "Strong Middle";
  if (p >= 0.5) return "Middle";
  return "Junior+";
}

function showResult() {
  const details = [];
  let score = 0;

  for (const q of questions) {
    const checked = form.querySelector(`input[name="q-${q.id}"]:checked`);
    const selected = checked ? Number(checked.value) : null;
    const ok = selected === q.correct;
    if (ok) score += 1;

    const selectedText = selected === null ? "Нет ответа" : q.options[selected];
    details.push(`
      <article class="result-item ${ok ? "ok" : "bad"}">
        <h3>${q.id}. ${q.text}</h3>
        <p><strong>Ваш ответ:</strong> ${selectedText}</p>
        <p><strong>Правильный ответ:</strong> ${q.options[q.correct]}</p>
        <p class="muted"><strong>Пояснение:</strong> ${q.explanation}</p>
      </article>
    `);
  }

  result.innerHTML = `
    <h2>Результат: ${score}/${questions.length}</h2>
    <p class="muted">Уровень: <strong>${getLevel(score, questions.length)}</strong></p>
    ${details.join("")}
  `;
  result.classList.remove("hidden");
  retryBtn.classList.remove("hidden");
}

submitBtn.addEventListener("click", showResult);
retryBtn.addEventListener("click", () => {
  form.reset();
  result.classList.add("hidden");
  retryBtn.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

renderQuiz();
