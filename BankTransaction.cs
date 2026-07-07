namespace CSF.API
{
    public class BankTransaction
    {
        public Guid TransactionID { get; set; } = Guid.NewGuid();

        public Guid BankAccountID { get; set; }
        public BankAccount? BankAccount { get; set; }

        // "Income" veya "Expense"
        public string TransactionType { get; set; } = string.Empty;

        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }

        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}