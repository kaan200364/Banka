using System.ComponentModel.DataAnnotations;

namespace CSF.API.DTOs
{
    public class RegisterDto
    {
        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
[RegularExpression(
    @"^(?=.*[0-9])(?=.*[!@#$%^&*(),.?"":{}|<>]).{8,}$",
    ErrorMessage = "Şifre en az 8 karakter olmalı, en az bir rakam ve bir özel karakter içermelidir.")]
public string Password { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        // "Administrator", "Manager", "Employee"
        public string Role { get; set; } = "Employee";
    }

    public class LoginDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

  public class AuthResponseDto
{
    public Guid UserID { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class UpdateProfileDto
{
    [Required(ErrorMessage = "Ad soyad zorunludur.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class ChangePasswordDto
{
    [Required(ErrorMessage = "Mevcut şifre zorunludur.")]
    public string CurrentPassword { get; set; } = string.Empty;

 [Required(ErrorMessage = "Yeni şifre zorunludur.")]
[RegularExpression(
    @"^(?=.*[0-9])(?=.*[!@#$%^&*(),.?"":{}|<>]).{8,}$",
    ErrorMessage = "Yeni şifre en az 8 karakter olmalı, en az bir rakam ve bir özel karakter içermelidir.")]
public string NewPassword { get; set; } = string.Empty;
}
}