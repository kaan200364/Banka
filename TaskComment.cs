namespace CSF.API
{
    public class TaskComment
    {
        public Guid CommentID { get; set; } = Guid.NewGuid();
        public Guid TaskID { get; set; }
        public Guid UserID { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}