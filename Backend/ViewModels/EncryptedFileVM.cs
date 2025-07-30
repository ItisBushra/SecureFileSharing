namespace Frontend.ViewModels
{
    public class EncryptedFileVM
    {
        public string Name { get; set; }
        public string Ciphertext { get; set; }
        public string IV { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExperationDate { get; set; }
        public int DownloadCount { get; set; }
        public bool IsExpired { get; set; }
        public bool OnDelete { get; set; }
    }
}