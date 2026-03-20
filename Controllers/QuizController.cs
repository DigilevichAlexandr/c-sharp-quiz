using Microsoft.AspNetCore.Mvc;
using c_sharp_quiz.Models;

namespace c_sharp_quiz.Controllers;

public sealed class QuizController : Controller
{
    private static readonly IReadOnlyList<QuizQuestion> Questions =
    [
        new()
        {
            Id = 1,
            Text = "Что произойдёт, если в ASP.NET Core зарегистрировать сервис как singleton, но внедрять в него scoped-сервис напрямую через конструктор?",
            Options =
            [
                "Это допустимо, контейнер создаст scoped-сервис один раз при старте приложения.",
                "Приложение не скомпилируется из-за ошибки DI на этапе компиляции.",
                "Это нарушает время жизни зависимостей и обычно приводит к InvalidOperationException в рантайме.",
                "Контейнер автоматически повысит scoped-сервис до singleton."
            ],
            CorrectOptionIndex = 2,
            Explanation = "Singleton живёт дольше scoped-объекта. ASP.NET Core запрещает такой захват, чтобы избежать утечек контекста запроса."
        },
        new()
        {
            Id = 2,
            Text = "Для чего реально нужен ConfigureAwait(false) в библиотечном коде .NET?",
            Options =
            [
                "Чтобы гарантировать выполнение продолжения строго в том же потоке.",
                "Чтобы не захватывать текущий SynchronizationContext и уменьшить риск дедлоков в старых контекстах.",
                "Чтобы ускорить любой async-код минимум в 2 раза.",
                "Чтобы Task всегда завершался синхронно."
            ],
            CorrectOptionIndex = 1,
            Explanation = "ConfigureAwait(false) отключает возврат в исходный контекст, что особенно важно для библиотек и UI/legacy окружений."
        },
        new()
        {
            Id = 3,
            Text = "Почему использовать Result/Wait() на Task в ASP.NET Core обычно опасно?",
            Options =
            [
                "Потому что Task нельзя ожидать вне метода Main.",
                "Потому что блокировка потока снижает масштабируемость и может вызвать дедлок в определённых контекстах.",
                "Потому что CLR запрещает смешивать sync и async.",
                "Потому что это работает только в Linux, но не в Windows."
            ],
            CorrectOptionIndex = 1,
            Explanation = "Синхронное ожидание асинхронной операции блокирует поток и ломает модель масштабирования сервера."
        },
        new()
        {
            Id = 4,
            Text = "Какой из вариантов наиболее корректно описывает разницу между IEnumerable<T> и IAsyncEnumerable<T>?",
            Options =
            [
                "IAsyncEnumerable<T> хранит данные в памяти, IEnumerable<T> — нет.",
                "IAsyncEnumerable<T> позволяет асинхронно получать элементы по мере готовности источника.",
                "IEnumerable<T> поддерживает только массивы, IAsyncEnumerable<T> — любые коллекции.",
                "Между ними нет практической разницы."
            ],
            CorrectOptionIndex = 1,
            Explanation = "IAsyncEnumerable<T> полезен для потоковой выборки из БД/сети без полной материализации данных."
        },
        new()
        {
            Id = 5,
            Text = "В Entity Framework Core что произойдёт при использовании AsNoTracking()?",
            Options =
            [
                "Сущности не будут сохраняться автоматически, потому что контекст их не отслеживает.",
                "EF Core отключит lazy loading навсегда для всего приложения.",
                "Запрос станет транзакционным по умолчанию.",
                "AsNoTracking() работает только для удаления данных."
            ],
            CorrectOptionIndex = 0,
            Explanation = "Без tracking EF Core не знает о изменениях сущностей, поэтому нужно вручную attach/update перед SaveChanges."
        },
        new()
        {
            Id = 6,
            Text = "Какая проблема может возникнуть при множественном перечислении LINQ-запроса к базе (без ToList/ToArray)?",
            Options =
            [
                "Запрос выполнится один раз и закэшируется CLR.",
                "Каждое перечисление может заново обращаться к БД и давать разные результаты.",
                "Компилятор C# автоматически запретит второе перечисление.",
                "Это влияет только на размер сборки, но не на поведение."
            ],
            CorrectOptionIndex = 1,
            Explanation = "LINQ-запросы с deferred execution выполняются при перечислении, поэтому повторный foreach может сделать повторный SQL."
        },
        new()
        {
            Id = 7,
            Text = "Зачем в ASP.NET Core нужен middleware UseExceptionHandler в production?",
            Options =
            [
                "Он автоматически исправляет исключения и продолжает выполнение.",
                "Он перенаправляет необработанные исключения в централизованный обработчик, скрывая внутренние детали.",
                "Он заменяет ILogger и отменяет логирование.",
                "Он работает только для ошибок компиляции Razor."
            ],
            CorrectOptionIndex = 1,
            Explanation = "В production важно не отдавать клиенту stack trace и централизованно формировать безопасный ответ."
        },
        new()
        {
            Id = 8,
            Text = "Почему для HTTP-клиента в .NET рекомендуют IHttpClientFactory вместо частого new HttpClient()?",
            Options =
            [
                "IHttpClientFactory всегда быстрее минимум на порядок.",
                "Чтобы избежать проблем с истощением сокетов и централизовать конфигурацию клиентов.",
                "Потому что HttpClient нельзя использовать в singleton-сервисах.",
                "Потому что HttpClient устарел и запрещён в .NET 8+."
            ],
            CorrectOptionIndex = 1,
            Explanation = "Фабрика управляет жизненным циклом HttpMessageHandler и предотвращает типичные сетевые проблемы."
        },
        new()
        {
            Id = 9,
            Text = "Какой риск у fire-and-forget задачи (Task.Run без await) внутри обработчика HTTP-запроса?",
            Options =
            [
                "Никакого, ASP.NET Core всегда дождётся завершения всех фоновых задач.",
                "Исключения могут потеряться, а задача может завершиться после конца запроса без контроля.",
                "Код перестанет компилироваться в Release.",
                "Task.Run автоматически превращается в hosted service."
            ],
            CorrectOptionIndex = 1,
            Explanation = "Для управляемых фоновых процессов лучше использовать BackgroundService/очередь задач, а не неотслеживаемые fire-and-forget."
        },
        new()
        {
            Id = 10,
            Text = "Что наиболее корректно про CancellationToken в .NET?",
            Options =
            [
                "Если токен отменён, операция обязана мгновенно завершиться всегда.",
                "CancellationToken сам по себе прерывает поток на уровне ОС.",
                "Отмена кооперативная: код должен явно проверять токен и корректно завершать работу.",
                "CancellationToken нужен только для ASP.NET Core, вне веба он бесполезен."
            ],
            CorrectOptionIndex = 2,
            Explanation = "Отмена в .NET добровольная: библиотека или ваш код должны поддерживать её в критических местах."
        }
    ];

    [HttpGet]
    public IActionResult Index()
    {
        return View(new QuizPageViewModel
        {
            Questions = Questions
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Submit(Dictionary<int, int> answers)
    {
        var items = Questions
            .Select(question =>
            {
                answers.TryGetValue(question.Id, out var selectedOptionIndex);
                var hasAnswer = answers.ContainsKey(question.Id);
                var isCorrect = hasAnswer && selectedOptionIndex == question.CorrectOptionIndex;

                return new QuizResultItem
                {
                    Question = question,
                    SelectedOptionIndex = hasAnswer ? selectedOptionIndex : null,
                    IsCorrect = isCorrect
                };
            })
            .ToList();

        var correctAnswers = items.Count(item => item.IsCorrect);

        return View("Result", new QuizResultViewModel
        {
            Items = items,
            TotalQuestions = Questions.Count,
            CorrectAnswers = correctAnswers,
            LevelLabel = GetLevelLabel(correctAnswers, Questions.Count)
        });
    }

    private static string GetLevelLabel(int score, int total)
    {
        var percent = (double)score / total;

        if (percent >= 0.9)
        {
            return "Senior .NET";
        }

        if (percent >= 0.7)
        {
            return "Strong Middle";
        }

        if (percent >= 0.5)
        {
            return "Middle";
        }

        return "Junior+";
    }
}
