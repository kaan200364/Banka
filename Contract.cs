namespace CSF.API
{
    public class Contract
    {
        public Guid ContractID { get; set; } = Guid.NewGuid();

        public Guid QuotationID { get; set; }
        public string ContractNumber { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // "Active", "Terminated", "Expired"
        public string Status { get; set; } = "Active";

        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? TerminationReason { get; set; }
public Guid? RenewedFromContractID { get; set; }
    }
}