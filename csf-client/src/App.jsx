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
import ProfilePage from "./components/ProfilePage";

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
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>CSF Yönetim</h1>
          <span>Kurumsal Sistem</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeTab === "customers" ? "active" : ""}
            onClick={() => setActiveTab("customers")}
          >
            <span className="nav-icon">◆</span> Cari / Tedarikçi
          </button>

          {canSeeBankModule && (
            <button
              className={activeTab === "bank" ? "active" : ""}
              onClick={() => setActiveTab("bank")}
            >
              <span className="nav-icon">▤</span> Banka Hesapları
            </button>
          )}

          {canSeeFinanceModule && (
            <button
              className={activeTab === "finance" ? "active" : ""}
              onClick={() => setActiveTab("finance")}
            >
              <span className="nav-icon">↕</span> Gelir / Gider
            </button>
          )}

          {canSeeQuotationModule && (
            <button
              className={activeTab === "quotations" ? "active" : ""}
              onClick={() => setActiveTab("quotations")}
            >
              <span className="nav-icon">▢</span> Teklifler
            </button>
          )}

          {canSeeContractModule && (
            <button
              className={activeTab === "contracts" ? "active" : ""}
              onClick={() => setActiveTab("contracts")}
            >
              <span className="nav-icon">▦</span> Sözleşmeler
            </button>
          )}

          {canSeeProjectModule && (
            <button
              className={activeTab === "projects" ? "active" : ""}
              onClick={() => setActiveTab("projects")}
            >
              <span className="nav-icon">◫</span> Projeler
            </button>
          )}

          <button
            className={activeTab === "tasks" ? "active" : ""}
            onClick={() => setActiveTab("tasks")}
          >
            <span className="nav-icon">☑</span> Görevler
          </button>

          {canSeeReportsModule && (
            <button
              className={activeTab === "reports" ? "active" : ""}
              onClick={() => setActiveTab("reports")}
            >
              <span className="nav-icon">▲</span> Raporlar
            </button>
          )}

          {canSeeUserModule && (
            <button
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              <span className="nav-icon">◉</span> Kullanıcılar
            </button>
          )}

          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            <span className="nav-icon">●</span> Profilim
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user.fullName}</strong>
            <span>{user.role}</span>
          </div>
          <button className="secondary" onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </aside>

      <div className="content-area">
        {activeTab === "customers" && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <h2>Cari / Tedarikçi</h2>
                <span className="page-subtitle">Müşteri ve tedarikçi kayıtlarınızı yönetin</span>
              </div>
            </div>
            <div className="app-main">
              <div className="sub-tab-nav" style={{ width: "100%" }}>
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
            </div>
          </>
        )}

        {activeTab === "bank" && canSeeBankModule && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <h2>Banka Hesapları</h2>
                <span className="page-subtitle">Hesap bakiyelerinizi ve hareketlerinizi takip edin</span>
              </div>
            </div>
            <div className="app-main">
              <BankAccountForm
                editingAccount={editingBankAccount}
                onSaved={handleBankAccountSaved}
                onCancel={() => setEditingBankAccount(null)}
              />
              <BankAccountList onEdit={setEditingBankAccount} refreshTrigger={bankRefresh} />
            </div>
          </>
        )}

        {activeTab === "finance" && canSeeFinanceModule && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <h2>Gelir / Gider</h2>
                <span className="page-subtitle">Nakit akışınızı kaydedin ve izleyin</span>
              </div>
            </div>
            <div className="app-main">
              <FinanceForm userRole={user.role} onSaved={handleFinanceSaved} />
              <FinanceList refreshTrigger={financeRefresh} />
            </div>
          </>
        )}

        {activeTab === "quotations" && canSeeQuotationModule && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <h2>Teklifler</h2>
                <span className="page-subtitle">Müşterilerinize teklif oluşturun ve takip edin</span>
              </div>
            </div>
            <div className="app-main">
              <QuotationForm
                editingQuotation={editingQuotation}
                onSaved={handleQuotationSaved}
                onCancel={() => setEditingQuotation(null)}
              />
              <QuotationList userRole={user.role} onEdit={setEditingQuotation} refreshTrigger={quotationRefresh} />
            </div>
          </>
        )}

        {activeTab === "contracts" && canSeeContractModule && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <h2>Sözleşmeler</h2>
                <span className="page-subtitle">Onaylı tekliflerden sözleşme oluşturun</span>
              </div>
            </div>
            <div className="app-main">
              <ContractForm onSaved={handleContractSaved} />
              <ContractList refreshTrigger={contractRefresh} />
            </div>
          </>
        )}

        {activeTab === "projects" && canSeeProjectModule && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <h2>Projeler</h2>
                <span className="page-subtitle">Sözleşmelerinize bağlı projeleri yönetin</span>
              </div>
            </div>
            <div className="app-main">
              <ProjectForm
                editingProject={editingProject}
                onSaved={handleProjectSaved}
                onCancel={() => setEditingProject(null)}
              />
              <ProjectList onEdit={setEditingProject} refreshTrigger={projectRefresh} />
            </div>
          </>
        )}

        {activeTab === "tasks" && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <h2>Görevler</h2>
                <span className="page-subtitle">Ekibinize görev atayın ve ilerlemeyi izleyin</span>
              </div>
            </div>
            <div className="app-main">
              {canCreateTask && (
                <TaskForm
                  editingTask={editingTask}
                  onSaved={handleTaskSaved}
                  onCancel={() => setEditingTask(null)}
                />
              )}
              <TaskList currentUser={user} onEdit={setEditingTask} refreshTrigger={taskRefresh} />
            </div>
          </>
        )}

        {activeTab === "reports" && canSeeReportsModule && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <h2>Raporlar</h2>
                <span className="page-subtitle">İşletmenizin genel durumuna bakın</span>
              </div>
            </div>
            <ReportsDashboard />
          </>
        )}

        {activeTab === "users" && canSeeUserModule && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <h2>Kullanıcılar</h2>
                <span className="page-subtitle">Sistem kullanıcılarını ve rollerini yönetin</span>
              </div>
            </div>
            <div className="app-main">
              <UserForm onSaved={handleUserSaved} />
              <UserList currentUserId={user.userID} refreshTrigger={userRefresh} />
            </div>
          </>
        )}

        {activeTab === "profile" && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <h2>Profilim</h2>
                <span className="page-subtitle">Hesap bilgilerinizi güncelleyin</span>
              </div>
            </div>
            <ProfilePage />
          </>
        )}
      </div>
    </div>
  );
}

export default App;