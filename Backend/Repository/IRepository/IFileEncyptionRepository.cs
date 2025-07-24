using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Repository.IRepository
{
    public interface IFileEncyptionRepository
    {
        Task<FileEncryption> CreateEncryptedFileAsync(FileEncryption fileEncryption); 
        Task<bool> RemoveEncryptedFileAsync(Guid id);
        Task<bool> CheckEncryptedFileExpirationDateAsync(Guid id);
        Task<bool> UpdateDownloadCountAsync(Guid id);
    }
}