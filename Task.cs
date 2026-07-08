namespace CSF.API
{
    public class ProjectTask
    {
        public Guid TaskID { get; set; } = Guid.NewGuid();

        public Guid ProjectID { get; set; }
        public Guid AssignedUserID { get; set; }
        public Guid? ParentTaskID { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium";
        public DateTime? DueDate { get; set; }

        // "Pending", "InProgress", "Completed"
        public string Status { get; set; } = "Pending";

        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}