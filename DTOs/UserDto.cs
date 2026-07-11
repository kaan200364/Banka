using System.ComponentModel.DataAnnotations;

namespace CSF.API.DTOs
{
    public class UserDto
    {
        public Guid UserID { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool TwoFactorEnabled { get; set; }
    }

    public class CreateUserDto
    {
        [Required(ErrorMessage = "Kullanıcı adı zorunludur.")]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

  [Required(ErrorMessage = "Şifre zorunludur.")]
[RegularExpression(
    @"^(?=.*[0-9])(?=.*[!@#$%^&*(),.?"":{}|<>]).{8,}$",
    ErrorMessage = "Şifre en az 8 karakter olmalı, en az bir rakam ve bir özel karakter içermelidir.")]
public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ad soyad zorunludur.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "E-posta zorunludur.")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Rol seçilmelidir.")]
        public string Role { get; set; } = "Employee";
    }

    public class UpdateUserRoleDto
    {
        [Required(ErrorMessage = "Rol seçilmelidir.")]
        public string Role { get; set; } = string.Empty;
    }

    public class SecurityLogDto
{
    public Guid SecurityLogID { get; set; }
    public string Username { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? IpAddress { get; set; }
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; }
}
}