namespace CSF.API
{
    public class Supplier
    {
        public Guid SupplierID { get; set; } = Guid.NewGuid();

        public string CompanyName { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? TaxNumber { get; set; }
        public string? Address { get; set; }

        public string Status { get; set; } = "Active";

        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}