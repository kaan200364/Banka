namespace CSF.API
{
    public class TaskDependency
    {
        public Guid TaskDependencyID { get; set; } = Guid.NewGuid();

        // Bu görev, DependsOnTaskID bitmeden başlatılamaz
        public Guid TaskID { get; set; }
        public Guid DependsOnTaskID { get; set; }
    }
}