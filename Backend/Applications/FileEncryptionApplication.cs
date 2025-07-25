using Backend.Models;
using Backend.Repositories.IRepositories;
using Backend.Repository;
using Frontend.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Applications
{
    public interface IFileEncryptionApplication
    {
        Task<FileEncryption> CreateEncryptedFileAsync(EncryptedFileVM fileEncryption);
        Task<bool> RemoveEncryptedFileAsync(Guid id);

    }
    public class FileEncryptionApplication : IFileEncryptionApplication
    {
        private readonly IFileEncryptionRepository fileEncryptionRepository;
        public FileEncryptionApplication(IFileEncryptionRepository fileEncryptionRepository)
        {
            this.fileEncryptionRepository = fileEncryptionRepository;
        }
        public async Task<FileEncryption> CreateEncryptedFileAsync(EncryptedFileVM fileEncryption)
        {
            FileEncryption file = new FileEncryption();
            file.IV = fileEncryption.IV;
            file.Ciphertext = fileEncryption.Ciphertext;
            file.CreatedAt = fileEncryption.CreatedAt;
            file.Name = fileEncryption.Name;
            return await fileEncryptionRepository.CreateEncryptedFileAsync(file);
        }

        public async Task<bool> RemoveEncryptedFileAsync(Guid id)
        {
            return await fileEncryptionRepository.RemoveEncryptedFileAsync(id);
        }
    }
}
