namespace CSF.API.DTOs
{
    public class FinancialSummaryDto
    {
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal NetBalance { get; set; }
        public int IncomeCount { get; set; }
        public int ExpenseCount { get; set; }
    }

    public class ProjectSummaryDto
    {
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
    }

    public class QuotationSummaryDto
    {
        public int TotalQuotations { get; set; }
        public int DraftCount { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
        public decimal TotalApprovedAmount { get; set; }
    }
}