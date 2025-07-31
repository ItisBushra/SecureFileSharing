using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Repositories.IRepositories
{
    public interface IFileEncryptionRepository
    {
        Task<FileEncryption> CreateEncryptedFileAsync(FileEncryption fileEncryption); 
        Task<bool> RemoveEncryptedFileAsync(Guid id);
        Task<FileEncryption?> GetEncryptedFileAsync(Guid id);
        Task<bool> CheckEncryptedFileExpirationDateAsync(Guid id);
        Task<bool> UpdateEncryptedFileDownloadCountAsync(Guid id);
    }
}