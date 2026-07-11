using CSF.API.DTOs;
using CSF.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController : ControllerBase
    {
       private readonly AuthService _authService;
private readonly AppDbContext _context;
private readonly TwoFactorService _twoFactorService;

public AuthController(AuthService authService, AppDbContext context, TwoFactorService twoFactorService)
{
    _authService = authService;
    _context = context;
    _twoFactorService = twoFactorService;
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
    var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
    try
    {
        var result = await _authService.LoginAsync(dto, ipAddress);
        if (result == null)
            return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı." });

        return Ok(result);
    }
    catch (InvalidOperationException ex) when (ex.Message == "TWOFA_REQUIRED")
    {
        return Ok(new { requiresTwoFactor = true });
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetMyProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FindAsync(Guid.Parse(userId!));
            if (user == null) return NotFound();

          return Ok(new UserDto
{
    UserID = user.UserID,
    Username = user.Username,
    FullName = user.FullName,
    Email = user.Email,
    Role = user.Role,
    Status = user.Status,
    TwoFactorEnabled = user.TwoFactorEnabled
});
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<ActionResult<UserDto>> UpdateMyProfile(UpdateProfileDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            try
            {
                var updated = await _authService.UpdateProfileAsync(Guid.Parse(userId!), dto);
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            try
            {
                await _authService.ChangePasswordAsync(Guid.Parse(userId!), dto);
                return Ok(new { message = "Şifre başarıyla değiştirildi." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("security-logs")]
[Authorize(Roles = "Administrator")]
public async Task<ActionResult<List<SecurityLogDto>>> GetSecurityLogs()
{
    var logs = await _context.SecurityLogs
        .OrderByDescending(s => s.Timestamp)
        .Take(100)
        .Select(s => new SecurityLogDto
        {
            SecurityLogID = s.SecurityLogID,
            Username = s.Username,
            EventType = s.EventType,
            Success = s.Success,
            IpAddress = s.IpAddress,
            Details = s.Details,
            Timestamp = s.Timestamp
        })
        .ToListAsync();

    return Ok(logs);
}


[HttpPost("2fa/setup")]
[Authorize(Roles = "Administrator")]
public async Task<ActionResult<Enable2FADto>> Setup2FA()
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    var user = await _context.Users.FindAsync(Guid.Parse(userId!));
    if (user == null) return NotFound();

    var (secretKey, qrCodeBase64) = _twoFactorService.GenerateSecret(user.Username);

    user.TwoFactorSecret = secretKey;
    await _context.SaveChangesAsync();

    return Ok(new Enable2FADto { SecretKey = secretKey, QrCodeImageBase64 = qrCodeBase64 });
}

[HttpPost("2fa/confirm")]
[Authorize(Roles = "Administrator")]
public async Task<IActionResult> Confirm2FA(Verify2FADto dto)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    var user = await _context.Users.FindAsync(Guid.Parse(userId!));
    if (user == null || string.IsNullOrEmpty(user.TwoFactorSecret))
        return BadRequest(new { message = "Önce kurulum başlatılmalı." });

    bool valid = _twoFactorService.VerifyCode(user.TwoFactorSecret, dto.Code);
    if (!valid) return BadRequest(new { message = "Geçersiz kod, tekrar deneyin." });

    user.TwoFactorEnabled = true;
    await _context.SaveChangesAsync();

    return Ok(new { message = "2FA başarıyla etkinleştirildi." });
}

[HttpPost("2fa/disable")]
[Authorize(Roles = "Administrator")]
public async Task<IActionResult> Disable2FA()
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    var user = await _context.Users.FindAsync(Guid.Parse(userId!));
    if (user == null) return NotFound();

    user.TwoFactorEnabled = false;
    user.TwoFactorSecret = null;
    await _context.SaveChangesAsync();

    return Ok(new { message = "2FA devre dışı bırakıldı." });
}
    }
}