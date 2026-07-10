namespace CSF.API
{
    public class TaskActivity
    {
        public Guid ActivityID { get; set; } = Guid.NewGuid();
        public Guid TaskID { get; set; }
        public Guid? UserID { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}