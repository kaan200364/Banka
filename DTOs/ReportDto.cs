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

    public class DashboardSummaryDto
{
    public int TotalCustomers { get; set; }
    public int TotalSuppliers { get; set; }
    public decimal TotalBankBalance { get; set; }
    public int ActiveProjectsCount { get; set; }
    public int PendingTasksCount { get; set; }
}


public class CustomerReportItemDto
{
    public Guid CustomerID { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public decimal TotalIncomeAmount { get; set; }
    public int TransactionCount { get; set; }
}

public class SupplierReportItemDto
{
    public Guid SupplierID { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public decimal TotalExpenseAmount { get; set; }
    public int TransactionCount { get; set; }
}

public class BankReportItemDto
{
    public Guid BankAccountID { get; set; }
    public string BankName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public int TransactionCount { get; set; }
}
}