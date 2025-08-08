async function SendFileToRazor(file, encrypted, experationDate, autoDelete) {
    const dataToSend = {
        Name: file.name,
        Ciphertext: encrypted.ciphertext, 
        IV: encrypted.iv,
        Size: file.size,
        ExperationDate: experationDate?.toISOString(),
        OnDelete: autoDelete,
        Key: encrypted.key,
        Type: file.type
    };
    const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
    const response = await fetch(window.location.pathname, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': token
        },
        body: JSON.stringify(dataToSend),
    });
    const result = await response.json();
    if (result.link) {
        const linkContainer = document.getElementById('generated-link');
        const fullIdParam = result.link.split('id=')[1]; 
        const guidOnly = fullIdParam.split('/key=')[0];  
        linkContainer.innerHTML = `
              <div style="text-align:center; margin-top: 1rem;">
               <div><strong> Click to View! </strong></div>
                  <a href="/Index?handler=Text&id=${guidOnly}" target="_blank">${result.link}</a>
                <div style="margin-top: 0.5rem;">
                  <a href="/Index?handler=Download&id=${guidOnly}" 
                  style="color:blue; margin-right: 1rem;">Download Encrypted File?</a>
                  <a href="/Index?handler=Delete&id=${guidOnly}" style="color:red;"
                  >Remove Encrypted File?</a>
                </div>
              </div>
        `;
    }
}
function handleFile(files, experationDate, autoDelete) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async function () {
        const arrayBuffer = new Uint8Array(reader.result);
        const encrypted = await encryptData(arrayBuffer, experationDate);
        await SendFileToRazor(file, encrypted, experationDate, autoDelete);
    };
    reader.readAsArrayBuffer(file);
}

async function GenerateKey() {
    const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    return key;
}

async function encryptData(fileContent) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await GenerateKey();
    const encryptedContent = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv, tagLength: 128 },
        key,
        fileContent
    );

    const rawKey = await crypto.subtle.exportKey("raw", key);
    return {
        ciphertext: uint8ArrayToBase64(new Uint8Array(encryptedContent)),
        iv: uint8ArrayToBase64(iv),
        key: uint8ArrayToBase64(new Uint8Array(rawKey)),
    };

}
function uint8ArrayToBase64(uint8Array) {
    let binary = '';
    const len = uint8Array.length;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}
function base64ToUint8Array(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

document.getElementById("validateLinkForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const LinkInput = document.getElementById("dec-link");
    const generatedLink = LinkInput.value;
    const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
    const LinkError = document.getElementById("link-error");

    const response = await fetch("/Index?handler=ValidateLink", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            'RequestVerificationToken': token
        },
        body: new URLSearchParams({
            generatedLink: generatedLink
        })
    });

    const result = await response.json().catch(() => null); // Handle non-JSON responses

    if (response.ok) {
        if (result?.file) {
            LinkInput.value = '';
            const idAndKey = generatedLink.split('id=')[1];
            const parts = idAndKey.split('/key=');
            decryptData(result.file, parts[1]);
        }
    } else {
        LinkInput.value = '';
        const errorMessage = result?.error || "Invalid link. Please check and try again.";
        LinkError.innerHTML = `${errorMessage}`;
    }
    
});

async function decryptData(fileContent, decryptionKey) {
    const keyData = base64ToUint8Array(decryptionKey);
    const iv = base64ToUint8Array(fileContent.iv);
    const ciphertext = base64ToUint8Array(fileContent.ciphertext);

    const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
            tagLength: 128
        },
        key,
        ciphertext
    );
    //find file type
    FindFileTypeAndDecrypt(fileContent, decrypted);
}
function FindFileTypeAndDecrypt(file, cipherText) {
    const fileName = file.name;
    console.log(file.name);
    const lastDotIndex = fileName.lastIndexOf('.');
    var fileType = fileName.slice(lastDotIndex + 1);
    let decryptedContent;
    const typeWarning = document.getElementById("file-type-warning-enc");
    let isValidForDec = false;
    fileTypes.forEach(allowedType => {
        if (fileType === allowedType) {
            isValidForDec = true;
        }
    });
    if (isValidForDec == false) {
        typeWarning.innerHTML = `
        <div style="text-align:center; margin-top: 1rem;">
            <span style="color:red;">The provided link format cannot be decrypted, Please check the link and try again.</span>
        </div>`;
        return;
    }

    if (fileType == "txt" || fileType == "json" || fileType == "xml" || fileType == "html" || fileType == "css") {
        decryptedContent = new TextDecoder('utf-8').decode(cipherText);
        CreateFile(decryptedContent, file.type, fileName);
    }
    else {
        decryptedContent = new Uint8Array(cipherText);
        CreateFile(decryptedContent, file.type, fileName);
    }    
}
function CreateFile(content, fileType, fileName) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
        new Blob([content], { type: fileType })
    );
    link.download = fileName;
    link.click();

    setTimeout(() => {
        URL.revokeObjectURL(link.href);
        link.remove();
    }, 100);
}