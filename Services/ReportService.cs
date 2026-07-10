using CSF.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CSF.API.Services
{
    public class ReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<FinancialSummaryDto> GetFinancialSummaryAsync(DateTime? from, DateTime? to)
        {
            var incomesQuery = _context.Incomes.AsQueryable();
            var expensesQuery = _context.Expenses.AsQueryable();

            if (from.HasValue)
            {
                incomesQuery = incomesQuery.Where(i => i.TransactionDate >= from.Value);
                expensesQuery = expensesQuery.Where(e => e.TransactionDate >= from.Value);
            }
            if (to.HasValue)
            {
                incomesQuery = incomesQuery.Where(i => i.TransactionDate <= to.Value);
                expensesQuery = expensesQuery.Where(e => e.TransactionDate <= to.Value);
            }

            var totalIncome = await incomesQuery.SumAsync(i => (decimal?)i.Amount) ?? 0;
            var totalExpense = await expensesQuery.SumAsync(e => (decimal?)e.Amount) ?? 0;
            var incomeCount = await incomesQuery.CountAsync();
            var expenseCount = await expensesQuery.CountAsync();

            return new FinancialSummaryDto
            {
                TotalIncome = totalIncome,
                TotalExpense = totalExpense,
                NetBalance = totalIncome - totalExpense,
                IncomeCount = incomeCount,
                ExpenseCount = expenseCount
            };
        }

        public async Task<List<ProjectSummaryDto>> GetProjectSummaryAsync()
        {
            var projects = await _context.Projects.ToListAsync();
            var result = new List<ProjectSummaryDto>();

            foreach (var project in projects)
            {
                var tasks = await _context.ProjectTasks
                    .Where(t => t.ProjectID == project.ProjectID)
                    .ToListAsync();

                result.Add(new ProjectSummaryDto
                {
                    ProjectID = project.ProjectID,
                    ProjectName = project.ProjectName,
                    Status = project.Status,
                    TotalTasks = tasks.Count,
                    CompletedTasks = tasks.Count(t => t.Status == "Completed")
                });
            }

            return result;
        }

        public async Task<QuotationSummaryDto> GetQuotationSummaryAsync()
        {
            var quotations = await _context.Quotations.ToListAsync();

            return new QuotationSummaryDto
            {
                TotalQuotations = quotations.Count,
                DraftCount = quotations.Count(q => q.Status == "Draft"),
                ApprovedCount = quotations.Count(q => q.Status == "Approved"),
                RejectedCount = quotations.Count(q => q.Status == "Rejected"),
                TotalApprovedAmount = quotations.Where(q => q.Status == "Approved").Sum(q => q.TotalAmount)
            };
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
{
    var totalCustomers = await _context.Customers.CountAsync(c => c.Status == "Active");
    var totalSuppliers = await _context.Suppliers.CountAsync(s => s.Status == "Active");
    var totalBankBalance = await _context.BankAccounts
        .Where(b => b.Status == "Active")
        .SumAsync(b => (decimal?)b.Balance) ?? 0;
    var activeProjectsCount = await _context.Projects.CountAsync(p => p.Status == "Active");
    var pendingTasksCount = await _context.ProjectTasks.CountAsync(t => t.Status == "Pending");

    return new DashboardSummaryDto
    {
        TotalCustomers = totalCustomers,
        TotalSuppliers = totalSuppliers,
        TotalBankBalance = totalBankBalance,
        ActiveProjectsCount = activeProjectsCount,
        PendingTasksCount = pendingTasksCount
    };
}

public async Task<List<CustomerReportItemDto>> GetCustomerReportAsync()
{
    var customers = await _context.Customers.Where(c => c.Status == "Active").ToListAsync();
    var result = new List<CustomerReportItemDto>();

    foreach (var customer in customers)
    {
        var incomes = await _context.Incomes
            .Where(i => i.CustomerID == customer.CustomerID)
            .ToListAsync();

        result.Add(new CustomerReportItemDto
        {
            CustomerID = customer.CustomerID,
            CompanyName = customer.CompanyName,
            TotalIncomeAmount = incomes.Sum(i => i.Amount),
            TransactionCount = incomes.Count
        });
    }

    return result.OrderByDescending(r => r.TotalIncomeAmount).ToList();
}

public async Task<List<SupplierReportItemDto>> GetSupplierReportAsync()
{
    var suppliers = await _context.Suppliers.Where(s => s.Status == "Active").ToListAsync();
    var result = new List<SupplierReportItemDto>();

    foreach (var supplier in suppliers)
    {
        var expenses = await _context.Expenses
            .Where(e => e.SupplierID == supplier.SupplierID)
            .ToListAsync();

        result.Add(new SupplierReportItemDto
        {
            SupplierID = supplier.SupplierID,
            CompanyName = supplier.CompanyName,
            TotalExpenseAmount = expenses.Sum(e => e.Amount),
            TransactionCount = expenses.Count
        });
    }

    return result.OrderByDescending(r => r.TotalExpenseAmount).ToList();
}

public async Task<List<BankReportItemDto>> GetBankReportAsync()
{
    var accounts = await _context.BankAccounts.Where(b => b.Status == "Active").ToListAsync();
    var result = new List<BankReportItemDto>();

    foreach (var account in accounts)
    {
        var transactionCount = await _context.BankTransactions
            .CountAsync(t => t.BankAccountID == account.BankAccountID);

        result.Add(new BankReportItemDto
        {
            BankAccountID = account.BankAccountID,
            BankName = account.BankName,
            Balance = account.Balance,
            TransactionCount = transactionCount
        });
    }

    return result.OrderByDescending(r => r.Balance).ToList();
}

public async Task<ContractReportDto> GetContractReportAsync()
{
    var contracts = await _context.Contracts.ToListAsync();
    var expiringSoon = contracts.Count(c => c.Status == "Active" && c.EndDate <= DateTime.UtcNow.AddDays(30));

    return new ContractReportDto
    {
        TotalContracts = contracts.Count,
        ActiveCount = contracts.Count(c => c.Status == "Active"),
        TerminatedCount = contracts.Count(c => c.Status == "Terminated"),
        RenewedCount = contracts.Count(c => c.Status == "Renewed"),
        ExpiringSoonCount = expiringSoon
    };
}

public async Task<TaskReportDto> GetTaskReportAsync()
{
    var tasks = await _context.ProjectTasks.ToListAsync();
    var overdue = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow && t.Status != "Completed");

    return new TaskReportDto
    {
        TotalTasks = tasks.Count,
        PendingCount = tasks.Count(t => t.Status == "Pending"),
        InProgressCount = tasks.Count(t => t.Status == "InProgress"),
        CompletedCount = tasks.Count(t => t.Status == "Completed"),
        OverdueCount = overdue
    };
}
    }
}