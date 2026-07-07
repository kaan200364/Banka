namespace CSF.API
{
    public class Income
    {
        public Guid IncomeID { get; set; } = Guid.NewGuid();

        public Guid? CustomerID { get; set; }
        public Guid BankAccountID { get; set; }
        public Guid? ProjectID { get; set; }

        public decimal Amount { get; set; }
        public string? Category { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }

        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}