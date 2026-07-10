using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CSF.API.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
        {
            var exists = await _context.Users.AnyAsync(u => u.Username == dto.Username);
            if (exists) return null;

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName,
                Email = dto.Email,
                Role = dto.Role,
                Status = "Active"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateToken(user);

            return new AuthResponseDto
            {
                UserID = user.UserID,
                Token = token,
                Username = user.Username,
                FullName = user.FullName,
                Role = user.Role
            };
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto dto, string? ipAddress = null)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null)
            {
                await LogSecurityEventAsync(dto.Username, false, ipAddress, "Kullanıcı bulunamadı.");
                return null;
            }

            // KİLİT KONTROLÜ
            if (user.LockoutEndTime.HasValue && user.LockoutEndTime.Value > DateTime.UtcNow)
            {
                var remainingMinutes = Math.Ceiling((user.LockoutEndTime.Value - DateTime.UtcNow).TotalMinutes);
                await LogSecurityEventAsync(dto.Username, false, ipAddress, "Hesap kilitliyken giriş denendi.");
                throw new InvalidOperationException(
                    $"Hesabınız çok fazla başarısız giriş denemesi nedeniyle kilitlendi. Lütfen {remainingMinutes} dakika sonra tekrar deneyin.");
            }

            // Kilit süresi dolmuşsa, sayaçları sıfırla
            if (user.LockoutEndTime.HasValue && user.LockoutEndTime.Value <= DateTime.UtcNow)
            {
                user.FailedLoginAttempts = 0;
                user.LockoutEndTime = null;
            }

            bool passwordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!passwordValid)
            {
                user.FailedLoginAttempts += 1;

                if (user.FailedLoginAttempts >= 5)
                {
                    user.LockoutEndTime = DateTime.UtcNow.AddMinutes(15);
                }

                await _context.SaveChangesAsync();
                await LogSecurityEventAsync(dto.Username, false, ipAddress, "Şifre hatalı.");
                return null;
            }

            // Şifre doğru — başarısız deneme sayacını sıfırla
            user.FailedLoginAttempts = 0;
            user.LockoutEndTime = null;

            await _context.SaveChangesAsync();

            var token = GenerateToken(user);

            await LogSecurityEventAsync(dto.Username, true, ipAddress, "Giriş başarılı.");

            return new AuthResponseDto
            {
                UserID = user.UserID,
                Token = token,
                Username = user.Username,
                FullName = user.FullName,
                Role = user.Role
            };
        }

        public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new InvalidOperationException("Kullanıcı bulunamadı.");

            user.FullName = dto.FullName;
            user.Email = dto.Email;

            await _context.SaveChangesAsync();

            return new UserDto
            {
                UserID = user.UserID,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Status = user.Status
            };
        }

        public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new InvalidOperationException("Kullanıcı bulunamadı.");

            bool currentPasswordValid = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash);
            if (!currentPasswordValid)
                throw new InvalidOperationException("Mevcut şifre yanlış.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();
        }

        private async Task LogSecurityEventAsync(string username, bool success, string? ipAddress, string details)
        {
            _context.SecurityLogs.Add(new SecurityLog
            {
                Username = username,
                EventType = "LoginAttempt",
                Success = success,
                IpAddress = ipAddress,
                Details = details,
                Timestamp = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }

        private string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expireMinutes = double.Parse(_configuration["Jwt:ExpireMinutes"]!);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}