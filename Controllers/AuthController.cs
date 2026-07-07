using CSF.API.DTOs;
using CSF.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CSF.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        // POST /api/v1/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            if (result == null)
                return BadRequest(new { message = "Bu kullanıcı adı zaten kullanılıyor." });

            return Ok(result);
        }

        // POST /api/v1/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            if (result == null)
                return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı." });

            return Ok(result);
        }
    }
}