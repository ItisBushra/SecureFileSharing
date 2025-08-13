async function SendFileToRazor(file, encrypted, experationDate, autoDelete) {
    const dataToSend = {
        Name: file.name,
        Ciphertext: encrypted.ciphertext, 
        IV: encrypted.iv,
        Size: file.size,
        ExperationDate: experationDate?.toISOString(),
        OnDelete: autoDelete,
        Salt: encrypted.salt,
        Type: file.type,
        AuthTag: encrypted.authTag,
        PublicFragment: encrypted.publicFragment,
        PrivateFragment: encrypted.privateFragment
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
function handleFile(files, experationDate, autoDelete, passwordValue) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async function () {
        const arrayBuffer = new Uint8Array(reader.result);
        const encrypted = await encryptData(arrayBuffer, passwordValue);
        await SendFileToRazor(file, encrypted, experationDate, autoDelete);
    };
    reader.readAsArrayBuffer(file);
}

async function generateKeyFragment(derivedKey) {
    const rawDerivedKey = await window.crypto.subtle.exportKey("raw", derivedKey);
    const rawDerivedKeyBytes = new Uint8Array(rawDerivedKey);
    const keyFragment = window.crypto.getRandomValues(
        new Uint8Array(rawDerivedKeyBytes.length)
    );
    const encryptionKey = new Uint8Array(rawDerivedKeyBytes.length);
    for (let i = 0; i < rawDerivedKeyBytes.length; i++) {
        encryptionKey[i] = rawDerivedKeyBytes[i] ^ keyFragment[i];
    }
    return { encryptionKey, keyFragment };
}

async function deriveKey(password, salt) {
    const encodedPassword = new TextEncoder().encode(password);
    const baseKey = await window.crypto.subtle.importKey(
        "raw",
        encodedPassword,
        { name: "PBKDF2" },
        false,
        ["deriveKey"],
    );
    const derivedKey = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 600000,
            hash: "SHA-256",
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    return derivedKey;
}

async function encryptData(data, password) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await deriveKey(password, salt);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const { encryptionKey: rawEncryptionKey, keyFragment } = await generateKeyFragment(derivedKey);
    const encryptionKey = await window.crypto.subtle.importKey(
        "raw",
        rawEncryptionKey,
        { name: "AES-GCM" },
        true,
        ["encrypt"] 
    );
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv, tagLength: 128 },
        encryptionKey,
        data
    );
    const ciphertext = encryptedContent.slice(0,encryptedContent.byteLength - 16);
    const authTag = encryptedContent.slice(encryptedContent.byteLength - 16);
    const publicFragment = keyFragment.slice(0, keyFragment.length / 2);
    const privateFragment = keyFragment.slice(keyFragment.length / 2);
    return {
        ciphertext: uint8ArrayToBase64(new Uint8Array(ciphertext)),
        iv: uint8ArrayToBase64(iv),
        salt: uint8ArrayToBase64(salt),
        authTag: uint8ArrayToBase64(new Uint8Array(authTag)),
        privateFragment: uint8ArrayToBase64(privateFragment),
        publicFragment: uint8ArrayToBase64(publicFragment),
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
    const passwordInput = document.getElementById('passwordInput').value;
    const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
    const LinkError = document.getElementById("link-error");

    try {
        const response = await fetch("/Index?handler=ValidateLink", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'RequestVerificationToken': token
            },
            body: new URLSearchParams({
                generatedLink: generatedLink,
                passwordInput: passwordInput
            })
        });

        const result = await response.json();

        if (response.ok && result?.file) {
            const idAndKey = generatedLink.split('id=')[1];
            const privateFragment = idAndKey.split('/key=')[1];
            if (!privateFragment) {
                throw new Error("Invalid link format: Missing key fragment.");
            }
            const publicFrag = base64ToUint8Array(result.file.publicFragment);
            const privateFrag = base64ToUint8Array(privateFragment);
            const combinedKey = combineKeyFragments(publicFrag, privateFrag);
            const derivedKey = await deriveKey(passwordInput, base64ToUint8Array(result.file.salt));
            const encryptionKey = await reconstructEncryptionKey(derivedKey, combinedKey);
            await decryptData(result.file, encryptionKey);
            LinkInput.value = '';
            document.getElementById('passwordInput').value = '';
            LinkError.innerHTML = '';

        } else {
            const errorMessage = result?.error || "Invalid link. Please check and try again.";
            LinkError.innerHTML = errorMessage;
        }
    } catch (error) {
        console.error("Decryption failed:", error);
        LinkError.innerHTML = "Decryption failed. Please check your password and link.";
    }
});

async function decryptData(fileContent, decryptionKey) {
    const iv = base64ToUint8Array(fileContent.iv);
    const authTag = base64ToUint8Array(fileContent.authTag);
    const ciphertext = base64ToUint8Array(fileContent.ciphertext);
    const dataWithAuthTag = new Uint8Array(ciphertext.length + authTag.length);
    dataWithAuthTag.set(ciphertext, 0);
    dataWithAuthTag.set(authTag, ciphertext.length);

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv, tagLength: 128 },
        decryptionKey,
        dataWithAuthTag
    );

    FindFileTypeAndDecrypt(fileContent, decrypted);
}
function combineKeyFragments(publicFragment, privateFragment) {
    const combined = new Uint8Array(publicFragment.length + privateFragment.length);
    combined.set(publicFragment, 0);
    combined.set(privateFragment, publicFragment.length);
    var combinedKey = uint8ArrayToBase64(combined);
    return combined;
}

async function reconstructEncryptionKey(derivedKey, combinedFragment) {
    const rawDerivedKey = await window.crypto.subtle.exportKey("raw", derivedKey);
    const rawDerivedBytes = new Uint8Array(rawDerivedKey);

    const rawEncryptionKey = new Uint8Array(rawDerivedBytes.length);
    for (let i = 0; i < rawDerivedBytes.length; i++) {
        rawEncryptionKey[i] = rawDerivedBytes[i] ^ combinedFragment[i];
    }

    return await window.crypto.subtle.importKey(
        "raw",
        rawEncryptionKey,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );
}

function FindFileTypeAndDecrypt(file, decryptedText) {
    const fileName = file.name;
    const lastDotIndex = fileName.lastIndexOf('.');
    var fileType = fileName.slice(lastDotIndex + 1);
    let decryptedContent;
   
    if (fileType == "txt" || fileType == "json" || fileType == "xml" || fileType == "html" || fileType == "css") {
        decryptedContent = new TextDecoder('utf-8').decode(decryptedText);
        CreateFile(decryptedContent, file.type, fileName);
    }
    else {
        decryptedContent = new Uint8Array(decryptedText);
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