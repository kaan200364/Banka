namespace CSF.API
{
    public class Project
    {
        public Guid ProjectID { get; set; } = Guid.NewGuid();

        public Guid ContractID { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public Guid ProjectManagerID { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        // "Active", "Completed", "OnHold"
        public string Status { get; set; } = "Active";

        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}