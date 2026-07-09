namespace CSF.API
{
    public class ContractAttachment
    {
        public Guid AttachmentID { get; set; } = Guid.NewGuid();
        public Guid ContractID { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string? UploadedBy { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}