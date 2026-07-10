namespace CSF.API
{
    public class SecurityLog
    {
        public Guid SecurityLogID { get; set; } = Guid.NewGuid();
        public string Username { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string? IpAddress { get; set; }
        public string? Details { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}