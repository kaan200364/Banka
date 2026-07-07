namespace CSF.API
{
    public class Quotation
    {
        public Guid QuotationID { get; set; } = Guid.NewGuid();

        public Guid CustomerID { get; set; }
        public string QuotationNumber { get; set; } = string.Empty;

        public DateTime IssueDate { get; set; } = DateTime.UtcNow;
        public DateTime ExpiryDate { get; set; }

        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = "TRY";

        // "Draft", "Approved", "Rejected", "Expired"
        public string Status { get; set; } = "Draft";

        public int RevisionNumber { get; set; } = 1;
        public string? Description { get; set; }

        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}