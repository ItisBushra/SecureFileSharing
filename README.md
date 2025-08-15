## Secure File Sharing

This is a .NET project that provides a tool for encrypting files and generating secure links for file sharing.

## Deployment

To deploy this project, simply clone the repository:

```bash
git clone https://github.com/ItisBushra/SecureFileSharing.git
```
Then navigate into the project directory and run in the terminal:
```bash
dotnet run
```
or by building the solution (Visual Studio)



## Methodology

![Methodology Diagram.](https://www.sharesecure.link/_next/image?url=%2Fhow-it-works-dark.png&w=3840&q=75)


**Cryptography Logic:**

AES-GCM (Advanced Encryption Standard - Galois/Counter Mode) is the encryption algorithm used in this project.

It is implemented using Web Cryptography API in JavaScript.


**Key Logic:**

The key is generated with the help of a password provided by the sender. The key is then fragmented into 2 pieces that are stored in different places to provide an additional security layer.

![Key Diagram.](https://github.com/ItisBushra/SecureFileSharing/blob/master/Key%20Diagram.png?raw=true)

In the decryption process, both fragments are combined to generate the key for decryption. This process validates that the fragments have not been modified on the server or in the link.

**Zero Acknowledgment Model:**

The project follows the Zero Acknowledgment model. Where the server does not see the plain file's data, nor the encryption key.



## Code Structure
- The backend folder (.NET Web Application) includes database related operations and services.

- The Frontend folder (Razor Pages) includes the project's UI, handler methods and Cryptology Logic.

- The file validation code is within `fileValidation.js`.

- The encrypted file's configuration is within `expirationDateAndPasswordConfig.js`.

- The encryption/decryption logic is within `main.js`.


## How to Use the Project

In the Encryption tab, the user can select a file of an allowed type; such details are specified in the 'How Does It Work' pop-up on the home page.

![Encryption Tab.](https://github.com/ItisBushra/SecureFileSharing/blob/master/Encryption%20Tab.png?raw=true)

After the file is validated, the user sets a password to share with the recipient and has the option to set an expiration date to make the link inaccessible after a certain date and/or deleted.

![Expiration Date and Password.](https://github.com/ItisBushra/SecureFileSharing/blob/master/Expiration%20Date%20and%20Password.png?raw=true)


The file is then encrypted, and a shareable link is generated. The user also has the option to either download the encrypted file, or remove the file, making the link unusable and erasing the file's information from the system.

![Encrypted File Link.](https://github.com/ItisBushra/SecureFileSharing/blob/master/Encrypted%20File%20Link.png?raw=true)


If the user clicks the generated link, they can see the file's cipher text.

![Encrypted File's cipher text.](https://github.com/ItisBushra/SecureFileSharing/blob/master/Encrypted%20File's%20cipher%20text.png?raw=true)


In the Decryption tab, once the user provides the link and password correctly, the decryption process runs and the original file is downloaded by default.

The user can access the file a maximum of two times. If they attempt to access it more than that, the file is permanently deleted and the link becomes unusable.

![Decryption Tab.](https://github.com/ItisBushra/SecureFileSharing/blob/master/Decryption%20Tab.png?raw=true)


## Acknowledgements

- [Application Logic Reference](https://www.sharesecure.link/articles/the-ultimate-developers-guide-to-aes-gcm-encryption-with-web-cryptography-api)
