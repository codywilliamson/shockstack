using Microsoft.AspNetCore.Mvc;
using ShockStack.Core.DTOs;

namespace ShockStack.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class HealthController : ControllerBase
{
  [HttpGet("ready")]
  public IActionResult Ready()
  {
    return Ok(ApiResponse<object>.Ok(new { status = "ready" }));
  }
}
