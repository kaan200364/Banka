using System.ComponentModel.DataAnnotations;

namespace CSF.API.DTOs
{
    public class CreateCommentDto
    {
        [Required(ErrorMessage = "Yorum boş olamaz.")]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;
    }

    public class TaskCommentDto
    {
        public Guid CommentID { get; set; }
        public Guid UserID { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class TaskAttachmentDto
    {
        public Guid AttachmentID { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string? UploadedBy { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    public class TaskActivityDto
{
    public Guid ActivityID { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? UserFullName { get; set; }
    public DateTime Timestamp { get; set; }
}
}