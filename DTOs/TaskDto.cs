using System.ComponentModel.DataAnnotations;

namespace CSF.API.DTOs
{
    public class CreateTaskDto
    {
        [Required(ErrorMessage = "Proje seçilmelidir.")]
        public Guid ProjectID { get; set; }

        [Required(ErrorMessage = "Görevin atanacağı kullanıcı seçilmelidir.")]
        public Guid AssignedUserID { get; set; }

        [Required(ErrorMessage = "Başlık zorunludur.")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string Priority { get; set; } = "Medium";
        public DateTime? DueDate { get; set; }
        public Guid? ParentTaskID { get; set; }
    }

    public class UpdateTaskStatusDto
    {
        [Required(ErrorMessage = "Durum zorunludur.")]
        public string Status { get; set; } = string.Empty;
    }

    public class TaskDto
    {
        public Guid TaskID { get; set; }
        public Guid ProjectID { get; set; }
        public Guid AssignedUserID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public Guid? ParentTaskID { get; set; }
    }

    public class UpdateTaskDto
{
    [Required(ErrorMessage = "Başlık zorunludur.")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public Guid AssignedUserID { get; set; }
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
}

public class AddDependencyDto
{
    [Required(ErrorMessage = "Bağımlı olunan görev seçilmelidir.")]
    public Guid DependsOnTaskID { get; set; }
}

public class TaskDependencyDto
{
    public Guid TaskDependencyID { get; set; }
    public Guid DependsOnTaskID { get; set; }
    public string DependsOnTaskTitle { get; set; } = string.Empty;
    public string DependsOnTaskStatus { get; set; } = string.Empty;
}
}