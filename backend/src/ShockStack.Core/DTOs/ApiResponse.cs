namespace ShockStack.Core.DTOs;

public record ApiResponse<T>(T? Data, string[]? Errors = null, object? Meta = null)
{
  public bool Success => Errors is null || Errors.Length == 0;

  public static ApiResponse<T> Ok(T data, object? meta = null) => new(data, null, meta);
  public static ApiResponse<T> Fail(params string[] errors) => new(default, errors);
}
