import { useState } from "react";
import CustomerList from "./components/CustomerList";
import CustomerForm from "./components/CustomerForm";
import BankAccountList from "./components/BankAccountList";
import BankAccountForm from "./components/BankAccountForm";
import Login from "./components/Login";
import "./App.css";
import FinanceForm from "./components/FinanceForm";
import FinanceList from "./components/FinanceList";
import QuotationForm from "./components/QuotationForm";
import QuotationList from "./components/QuotationList";
import ContractForm from "./components/ContractForm";
import ContractList from "./components/ContractList";
import ProjectForm from "./components/ProjectForm";
import ProjectList from "./components/ProjectList";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import ReportsDashboard from "./components/ReportsDashboard";
import UserForm from "./components/UserForm";
import UserList from "./components/UserList";
import SupplierForm from "./components/SupplierForm";
import SupplierList from "./components/SupplierList";

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return {
      userID: localStorage.getItem("userID"),
      username: localStorage.getItem("username"),
      fullName: localStorage.getItem("fullName"),
      role: localStorage.getItem("role"),
    };
  });

  const [activeTab, setActiveTab] = useState("customers");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerRefresh, setCustomerRefresh] = useState(0);
  const [bankRefresh, setBankRefresh] = useState(0);
  const [financeRefresh, setFinanceRefresh] = useState(0);
  const [quotationRefresh, setQuotationRefresh] = useState(0);
  const [contractRefresh, setContractRefresh] = useState(0);
  const [projectRefresh, setProjectRefresh] = useState(0);
  const [taskRefresh, setTaskRefresh] = useState(0);
  const [userRefresh, setUserRefresh] = useState(0);
  const [editingBankAccount, setEditingBankAccount] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [customerSubTab, setCustomerSubTab] = useState("customers");
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierRefresh, setSupplierRefresh] = useState(0);
  const [editingTask, setEditingTask] = useState(null);

  function handleLoginSuccess(result) {
    setUser({
      userID: result.userID,
      username: result.username,
      fullName: result.fullName,
      role: result.role,
    });
  }

  function handleLogout() {
    localStorage.clear();
    setUser(null);
  }

  function handleCustomerSaved() {
    setEditingCustomer(null);
    setCustomerRefresh((prev) => prev + 1);
  }

  function handleBankAccountSaved() {
    setEditingBankAccount(null);
    setBankRefresh((prev) => prev + 1);
  }
  function handleFinanceSaved() {
    setFinanceRefresh((prev) => prev + 1);
  }
  function handleQuotationSaved() {
    setEditingQuotation(null);
    setQuotationRefresh((prev) => prev + 1);
  }
  function handleContractSaved() {
    setContractRefresh((prev) => prev + 1);
  }
  function handleProjectSaved() {
    setEditingProject(null);
    setProjectRefresh((prev) => prev + 1);
  }
  function handleTaskSaved() {
    setEditingTask(null);
    setTaskRefresh((prev) => prev + 1);
  }
  function handleUserSaved() {
    setUserRefresh((prev) => prev + 1);
  }
  function handleSupplierSaved() {
    setEditingSupplier(null);
    setSupplierRefresh((prev) => prev + 1);
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const canSeeBankModule = user.role === "Administrator" || user.role === "Manager";
  const canSeeFinanceModule = ["Administrator", "Employee", "Manager"].includes(user.role);
  const canSeeQuotationModule = ["Administrator", "Employee"].includes(user.role);
  const canSeeContractModule = user.role === "Administrator" || user.role === "Manager";
  const canSeeProjectModule = user.role === "Administrator" || user.role === "Manager";
  const canCreateTask = user.role === "Administrator" || user.role === "Manager";
  const canSeeReportsModule = user.role === "Administrator" || user.role === "Manager";
  const canSeeUserModule = user.role === "Administrator";

  return (
    <div className="app">
      <header className="app-header">
        <h1>CSF Yönetim Sistemi</h1>
        <div className="user-info">
          <span>{user.fullName} ({user.role})</span>
          <button className="secondary" onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </header>

      <nav className="tab-nav">
        <button
          className={activeTab === "customers" ? "tab active" : "tab"}
          onClick={() => setActiveTab("customers")}
        >
          Cari / Tedarikçi
        </button>
        {canSeeBankModule && (
          <button
            className={activeTab === "bank" ? "tab active" : "tab"}
            onClick={() => setActiveTab("bank")}
          >
            Banka Hesapları
          </button>
        )}
        {canSeeFinanceModule && (
          <button
            className={activeTab === "finance" ? "tab active" : "tab"}
            onClick={() => setActiveTab("finance")}
          >
            Gelir / Gider
          </button>
        )}
        {canSeeQuotationModule && (
          <button
            className={activeTab === "quotations" ? "tab active" : "tab"}
            onClick={() => setActiveTab("quotations")}
          >
            Teklifler
          </button>
        )}
        {canSeeContractModule && (
          <button
            className={activeTab === "contracts" ? "tab active" : "tab"}
            onClick={() => setActiveTab("contracts")}
          >
            Sözleşmeler
          </button>
        )}
        {canSeeProjectModule && (
          <button
            className={activeTab === "projects" ? "tab active" : "tab"}
            onClick={() => setActiveTab("projects")}
          >
            Projeler
          </button>
        )}
        <button
          className={activeTab === "tasks" ? "tab active" : "tab"}
          onClick={() => setActiveTab("tasks")}
        >
          Görevler
        </button>
        {canSeeReportsModule && (
          <button
            className={activeTab === "reports" ? "tab active" : "tab"}
            onClick={() => setActiveTab("reports")}
          >
            Raporlar
          </button>
        )}
        {canSeeUserModule && (
          <button
            className={activeTab === "users" ? "tab active" : "tab"}
            onClick={() => setActiveTab("users")}
          >
            Kullanıcılar
          </button>
        )}
      </nav>

      <main className="app-main">
        {activeTab === "customers" && (
          <>
            <div className="sub-tab-nav">
              <button
                className={customerSubTab === "customers" ? "sub-tab active" : "sub-tab"}
                onClick={() => setCustomerSubTab("customers")}
              >
                Cari
              </button>
              <button
                className={customerSubTab === "suppliers" ? "sub-tab active" : "sub-tab"}
                onClick={() => setCustomerSubTab("suppliers")}
              >
                Tedarikçi
              </button>
            </div>

            {customerSubTab === "customers" && (
              <>
                <CustomerForm
                  editingCustomer={editingCustomer}
                  onSaved={handleCustomerSaved}
                  onCancel={() => setEditingCustomer(null)}
                />
                <CustomerList onEdit={setEditingCustomer} refreshTrigger={customerRefresh} />
              </>
            )}

            {customerSubTab === "suppliers" && (
              <>
                <SupplierForm
                  editingSupplier={editingSupplier}
                  onSaved={handleSupplierSaved}
                  onCancel={() => setEditingSupplier(null)}
                />
                <SupplierList onEdit={setEditingSupplier} refreshTrigger={supplierRefresh} />
              </>
            )}
          </>
        )}

        {activeTab === "bank" && canSeeBankModule && (
          <>
            <BankAccountForm
              editingAccount={editingBankAccount}
              onSaved={handleBankAccountSaved}
              onCancel={() => setEditingBankAccount(null)}
            />
            <BankAccountList onEdit={setEditingBankAccount} refreshTrigger={bankRefresh} />
          </>
        )}

        {activeTab === "finance" && canSeeFinanceModule && (
          <>
            <FinanceForm userRole={user.role} onSaved={handleFinanceSaved} />
            <FinanceList refreshTrigger={financeRefresh} />
          </>
        )}

        {activeTab === "quotations" && canSeeQuotationModule && (
          <>
            <QuotationForm
              editingQuotation={editingQuotation}
              onSaved={handleQuotationSaved}
              onCancel={() => setEditingQuotation(null)}
            />
            <QuotationList userRole={user.role} onEdit={setEditingQuotation} refreshTrigger={quotationRefresh} />
          </>
        )}

        {activeTab === "contracts" && canSeeContractModule && (
          <>
            <ContractForm onSaved={handleContractSaved} />
            <ContractList refreshTrigger={contractRefresh} />
          </>
        )}

        {activeTab === "projects" && canSeeProjectModule && (
          <>
            <ProjectForm
              editingProject={editingProject}
              onSaved={handleProjectSaved}
              onCancel={() => setEditingProject(null)}
            />
            <ProjectList onEdit={setEditingProject} refreshTrigger={projectRefresh} />
          </>
        )}

        {activeTab === "tasks" && (
          <>
            {canCreateTask && (
              <TaskForm
                editingTask={editingTask}
                onSaved={handleTaskSaved}
                onCancel={() => setEditingTask(null)}
              />
            )}
            <TaskList currentUser={user} onEdit={setEditingTask} refreshTrigger={taskRefresh} />
          </>
        )}

        {activeTab === "reports" && canSeeReportsModule && <ReportsDashboard />}

        {activeTab === "users" && canSeeUserModule && (
          <>
            <UserForm onSaved={handleUserSaved} />
            <UserList currentUserId={user.userID} refreshTrigger={userRefresh} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;