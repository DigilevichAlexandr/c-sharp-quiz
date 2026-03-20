namespace c_sharp_quiz.Models;

public sealed class QuizQuestion
{
    public required int Id { get; init; }
    public required string Text { get; init; }
    public required IReadOnlyList<string> Options { get; init; }
    public required int CorrectOptionIndex { get; init; }
    public required string Explanation { get; init; }
}

public sealed class QuizPageViewModel
{
    public required IReadOnlyList<QuizQuestion> Questions { get; init; }
}

public sealed class QuizResultItem
{
    public required QuizQuestion Question { get; init; }
    public required int? SelectedOptionIndex { get; init; }
    public required bool IsCorrect { get; init; }
}

public sealed class QuizResultViewModel
{
    public required IReadOnlyList<QuizResultItem> Items { get; init; }
    public required int TotalQuestions { get; init; }
    public required int CorrectAnswers { get; init; }
    public required string LevelLabel { get; init; }
}
