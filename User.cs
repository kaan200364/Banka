namespace CSF.API
{
    public class User
    {
        public Guid UserID { get; set; } = Guid.NewGuid();

        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // "Administrator", "Manager", "Employee"
        public string Role { get; set; } = "Employee";

        public string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int FailedLoginAttempts { get; set; } = 0;
public DateTime? LockoutEndTime { get; set; }
    }
}