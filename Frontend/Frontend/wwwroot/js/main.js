async function SendFileToRazor(file, encrypted, experationDate, autoDelete) {
    const dataToSend = {
        Name: file.name,
        Ciphertext: encrypted.ciphertext, 
        IV: encrypted.iv,
        Size: file.size,
        ExperationDate: experationDate?.toISOString(),
        OnDelete: autoDelete
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
        linkContainer.innerHTML = `
              <div style="text-align:center; margin-top: 1rem;">
               <div><strong> Click to View! </strong></div>
                  <a href="/Index?handler=Text&id=${result.link.split('id=')[1]}" target="_blank">${result.link}</a>
                <div style="margin-top: 0.5rem;">
                  <a href="/Index?handler=Download&id=${result.link.split('id=')[1]}" 
                  style="color:blue; margin-right: 1rem;">Download Encrypted File?</a>
                  <a href="/Index?handler=Delete&id=${result.link.split('id=')[1]}" style="color:red;"
                  >Remove Encrypted File?</a>
                </div>
              </div>
        `;
    }
}

function handleFile(files, experationDate, autoDelete) {
    console.log("the function is triggered here");
    const maxSize = 5 * 1024 * 1024;
    const file = files[0];
        if (file.size > maxSize) {
            const linkContainer = document.getElementById('file-size-warning');
            linkContainer.innerHTML = `
              <div style="text-align:center; margin-top: 1rem;">
                <span style="color:red;">The selected file is too large. Please upload a file under 5MB</span>
              </div>`;

            return;
        }
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
