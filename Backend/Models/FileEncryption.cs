using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class FileEncryption
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; }
        public string Ciphertext { get; set; }
        public string IV { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExperationDate { get; set; }
        public int DownloadCount { get; set; }
        public bool isExpired { get; set; }
        public bool onDelete { get; set; }
        public int Accessed { get; set; }
    }
}
