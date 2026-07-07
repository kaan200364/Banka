using System.ComponentModel.DataAnnotations;

namespace CSF.API.DTOs
{
    public class CreateProjectDto
    {
        [Required(ErrorMessage = "Sözleşme seçilmelidir.")]
        public Guid ContractID { get; set; }

        [Required(ErrorMessage = "Proje adı zorunludur.")]
        [MaxLength(200)]
        public string ProjectName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Proje yöneticisi seçilmelidir.")]
        public Guid ProjectManagerID { get; set; }

        [Required(ErrorMessage = "Başlangıç tarihi zorunludur.")]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }
    }

    public class ProjectDto
    {
        public Guid ProjectID { get; set; }
        public Guid ContractID { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public Guid ProjectManagerID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }


    public class UpdateProjectDto
{
    [Required(ErrorMessage = "Proje adı zorunludur.")]
    [MaxLength(200)]
    public string ProjectName { get; set; } = string.Empty;

    public DateTime? EndDate { get; set; }

    [Required(ErrorMessage = "Durum zorunludur.")]
    public string Status { get; set; } = string.Empty;
}
}