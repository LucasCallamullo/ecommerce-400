/// <reference path="../../../../../static/js/base.js" />


/**
 * Uploads image files to a specified endpoint using FormData.
 *
 * @param {string|number} objectId - The ID to associate the images with (e.g., product, user, post).
 * @param {FileList|Array<File>} files - List of image files to upload.
 * @param {string} url - API endpoint URL to send the FormData to.
 * @param {string} idFieldName - The name of the ID field in the FormData (default: 'id').
 * @param {string} inputFieldName - The name of the form field for the images (default: 'images').
 * @returns {Promise<Object>} The parsed JSON response from the server.
 * 
 // Examples of Use
    uploadImages({
        url = optional dynamic url, 
        inputFieldName = 'images',
        quantity = 0    # zero no limits image upload
    }
 */

// Variable global para mantener la instancia
let globalPond = null;
// Cache global para imágenes comprimidas
const compressedFilesCache = new Map();

async function uploadImages({url = window.TEMPLATE_URLS.genericUpdateImages, inputName = 'images', quantity = 0}) {
    if (!globalPond) {
        openAlert('Algo salió mal, recargue la página.', 'red', 1500);
        return null;
    }

    // 1. Validar existencia de archivos comprimidos
    const filesToUpload = Array.from(compressedFilesCache.values())
        .filter(file => {
            const isValid = file instanceof File || file instanceof Blob;
            if (!isValid) {
                console.warn('Archivo no válido en cache:', file);
            }
            return isValid;
        });

    // 2. Validar si hay archivos para subir
    if (filesToUpload.length === 0) {
        openAlert('No hay imágenes válidas para subir', 'red', 1500);
        return null; // O return { success: false, error: 'No files' }
    }
    
    // 3. Crear FormData con los comprimidos
    const formData = new FormData();
    let count = 0;
    filesToUpload.forEach((file, index) => {
        if (quantity > 0 && count >= quantity) return;
        if (!file) return;

        console.log(`Archivo comprimido [${index}]: ${file.name}, ${file.type}, ${file.size} bytes`);
        
        formData.append(inputName, file);
        // limit quantity to update
        count++;
    });

    // Enviar al servidor con fetch
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: formData
    });

    const data = await response.json();

    // If the server returns an error, propagate it to the caller
    if (!response.ok) {
        openAlert('Error al subir las imagenes.' || data.detail, 'red', 1500);
        return null;
    }

    // On success, show confirmation message
    if (data.success) {
        openAlert('Imágenes subidas correctamente.', 'green', 1500);
        compressedFilesCache.clear();
        return data.image_url;
    }

    openAlert('Error al subir las imagenes.' || data.detail, 'red', 1500);
    return null;
}


async function compressAndCache(originalFile) {
    // Verificar si ya está en cache
    if (compressedFilesCache.has(originalFile.name)) {
        return compressedFilesCache.get(originalFile.name);
    }

    const SIZE_KB = originalFile.size / 1024;
    let quality = 0.9; // Valor por defecto

    if (SIZE_KB > 5000) quality = 0.6;  // >5MB: máxima compresión
    else if (SIZE_KB > 700) quality = 0.7; // >1MB
    else if (SIZE_KB > 300) quality = 0.8;  // >300KB

    if (SIZE_KB <= 250) {
        compressedFilesCache.set(originalFile.name, originalFile);
        return originalFile;
    }
    
    // Comprimir si no está cacheado
    const compressedFile = await new Promise(resolve => {
        new Compressor(originalFile, {
            quality: quality,
            maxWidth: 1024,
            success: result => {
                const file = new File([result], originalFile.name, {
                    type: 'image/jpeg'
                });
                resolve(file);
            }
        });
    });
    
    // Almacenar en cache
    compressedFilesCache.set(originalFile.name, compressedFile);
    return compressedFile;
}


function initInputImage(form, initClear = true) {
    const imageInput = form.querySelector('.image-input');
    const previewContainer = form.querySelector('.cont-img-previews');

    // 1. Limpieza inicial
    if (globalPond) {
        FilePond.destroy(globalPond);
        globalPond = null;
    }

    if (initClear) {
        imageInput.value = '';
        previewContainer.innerHTML = '';
        compressedFilesCache.clear();    // clear map in a new form
    }

    // 2. Configurar FilePond con Compressor.js
    globalPond = FilePond.create(imageInput, {
        allowMultiple: true,
        acceptedFileTypes: ['image/*'],
        maxFiles: 5,
        // Deshabilita la cámara para priorizar la galería
        allowCamera: true,
        labelIdle: 'Arrastra tus imágenes o <span class="filepond--label-action"><b>Selecciona</b></span>',
        onaddfile: (error, fileItem) => {
            if (error) return;
            
            // Comprimir y cachear inmediatamente
            compressAndCache(fileItem.file).then(compressedFile => {
                updatePreview(compressedFile, previewContainer);
            });
        },
        onremovefile: (error, fileItem) => {
            if (error) return;
            compressedFilesCache.delete(fileItem.file.name); // Limpiar cache al remover archivo

            // Eliminar solo la imagen correspondiente
            const fileId = `${fileItem.file.name}`;
            const imgToRemove = previewContainer.querySelector(`img[data-file-id="${fileId}"]`);
            if (imgToRemove) imgToRemove.remove();
        }
    });

    // 3. Función de previsualización optimizada
    function updatePreview(file, container) {
        const reader = new FileReader();
        const child = container.querySelector('.icon-img');
        if (child && child.parentNode === container) child.remove();

        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('h-190');

            // Identificador único basado en el nombre + timestamp
            img.dataset.fileId = `${file.name}`;
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}


/*    LEGACY
function compressImage(file) {
    return new Promise((resolve) => {
        new Compressor(file, {
            quality: 0.7,
            maxWidth: 1024,
            maxHeight: 1024,
            success(result) {
                resolve(new File([result], `compressed_${file.name}`, {
                    type: 'image/jpeg'
                }));
            },
            error(err) {
                console.error('Error al comprimir:', err);
                resolve(null); // Devuelve null si falla
            }
        });
    });
}

const ALLOWED_MIME_TYPES = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg', // Algunos navegadores usan 'image/jpg' incorrectamente
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif'
    };

else if (file.type === 'application/octet-stream') {

            // Paso 1: Leer el archivo como ArrayBuffer para detectar tipo REAL
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer.slice(0, 4)); // Leer primeros 4 bytes (magic number)
            const fileSignature = Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

            // Paso 2: Determinar extensión REAL (JPEG, PNG, etc.)
            let realExtension = 'jpg'; // Por defecto JPEG (el más común en cámaras)
            
            // Magic Numbers de formatos conocidos:
            if (fileSignature.startsWith('FFD8FF')) realExtension = 'jpg';
            else if (fileSignature.startsWith('89504E47')) realExtension = 'png';
            else if (fileSignature.startsWith('47494638')) realExtension = 'gif';
            else if (fileSignature.startsWith('52494646')) realExtension = 'webp'; 

            // Paso 3: Crear nuevo File con nombre y tipo correctos
            processedFile = new File([file], `foto-${i}.${realExtension}`, { 
                type: `image/${realExtension === 'jpg' ? 'jpeg' : realExtension}` 
            });
*/