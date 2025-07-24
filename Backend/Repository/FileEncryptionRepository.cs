using Backend.Data;
using Backend.Models;
using Backend.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Repository
{
    public class FileEncryptionRepository : IFileEncryptionRepository
    {
        private DBContext _dBContext;
        public FileEncryptionRepository(DBContext dBContext)
        {
            _dBContext = dBContext;
        }
        public Task<bool> CheckEncryptedFileExpirationDateAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<FileEncryption> CreateEncryptedFileAsync(FileEncryption fileEncryption)
        {
            await _dBContext.FileEncryption.AddAsync(fileEncryption);
            await _dBContext.SaveChangesAsync();
            return fileEncryption;
        }

        public async Task<bool> RemoveEncryptedFileAsync(Guid id)
        {
            var fileToBeRemoved = await _dBContext.FileEncryption.FindAsync(id);
            if (fileToBeRemoved != null)
            {
                _dBContext.Remove(fileToBeRemoved);
                await _dBContext.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> UpdateDownloadCountAsync(Guid id)
        {
            var fileToBeUpdated = await _dBContext.FileEncryption.FindAsync(id);
            if (fileToBeUpdated != null)
            {
                fileToBeUpdated.DownloadCount += 1;
                await _dBContext.SaveChangesAsync();
                return true;    
            }
            return false;
        }
    }
}
