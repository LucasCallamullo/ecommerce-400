

/// <reference path="../../../../../static/js/base.js" />




// 1. Obtener archivos originales
    const originalFiles = globalPond.getFiles().map(fileItem => fileItem.file);
    
    // 2. Comprimir TODAS las imágenes en paralelo
    const compressedFiles = await Promise.all(
        originalFiles.map(file => compressImage(file))
    );
    
    // 3. Crear FormData con los comprimidos
    const formData = new FormData();
    compressedFiles.forEach((file, i) => {
        console.log(`Archivo comprimido [${i}]: ${file.name || `output-${i}`}, ${file.type}, ${file.size} bytes`);
        if (file) { 
            formData.append(inputFieldName, file);
            // limit quantity to update
            if (quantity > 0 && quantity-1 == i) return;
        }
    });


    /*
        onaddfile: (error, file) => {
            if (error) return;
            updatePreview(file.file, previewContainer);
        },
        onremovefile: () => {
            previewContainer.innerHTML = '';
            globalPond.getFiles().forEach(file => {
                updatePreview(file.file, previewContainer);
            });
        }

*/




/*
    const preparedFiles = await globalPond.prepareFiles();
    if (!preparedFiles || preparedFiles.length === 0) {
        openAlert('No hay archivos en FilePond.', 'red', 1500);
        return null;
    }

    // Lista de tipos MIME permitidos (puedes ampliarla) and create formdata to send
    const formData = new FormData();
    const ALLOWED_MIME_TYPES = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg', // Algunos navegadores usan 'image/jpg' incorrectamente
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif'
    };

    for (let i = 0; i < preparedFiles.length; i++) {
        
        // const compressed = preparedFiles[i].output;
        console.log(`Archivo comprimido [${i}]: ${compressed.name || `output-${i}`}, ${compressed.type}, ${compressed.size} bytes`);

        const extension = ALLOWED_MIME_TYPES[compressed.type.toLowerCase()];
        if (!extension) {
            console.warn(`Tipo MIME no permitido: ${compressed.type}`);
            continue;
        }

        const processedFile = new File([compressed], `foto-${i}.${extension}`, {
            type: compressed.type,
            lastModified: Date.now()
        });

        console.log(`📤 Procesado [${i}]: ${processedFile.name}, ${processedFile.type}, ${processedFile.size} bytes`);

        formData.append(inputFieldName, processedFile);

        if (quantity > 0 && quantity - 1 === i) {
            console.log(`Cortando procesamiento por límite de cantidad (${quantity})`);
            break;
        }
    } */









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
let globalCompressedFiles = [];

async function uploadImages({
    url = window.TEMPLATE_URLS.genericUpdateImages, 
    inputFieldName = 'images',
    quantity = 0
}) {
    if (!globalPond) {
        openAlert('Algo salió mal GLOBAL POND IMAGENES, recargue la página.', 'red', 1500);
        return null;
    }

    const filesGlobalPond = globalPond.getFiles();
    if (!filesGlobalPond || filesGlobalPond.length === 0) {
        openAlert('No hay archivos en FilePond.', 'red', 1500);
        return null;
    }
    
    const files = filesGlobalPond.map(fileItem =>
        fileItem.file
    );

    if (!files || files.length === 0) {
        openAlert('No seleccionaste imagenes para cargar.', 'red', 1500);
        return null;
    }

    // Lista de tipos MIME permitidos (puedes ampliarla) and create formdata to send
    const formData = new FormData();
    const ALLOWED_MIME_TYPES = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg', // Algunos navegadores usan 'image/jpg' incorrectamente
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif'
    };

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let processedFile;

        // Caso 1: Tipo MIME válido (image/jpeg, image/png, etc.) → No necesita magic number
        console.log(`Archivo ${i}:`, file.name, file.type, file.size);

        const extension = ALLOWED_MIME_TYPES[file.type.toLowerCase()];

        // Verificar si el archivo ya está comprimido (de los metadatos)
        if (extension) {
            // Si ya es el archivo comprimido, úsalo directamente
            if (file instanceof File && file.name.startsWith('foto-') && file.type === file.type) {
                processedFile = file;
            } else {
                processedFile = new File([file], `foto-${i}.${extension}`, { type: file.type });
            }
            // processedFile = new File([file], `foto-${i}.${extension}`, { type: file.type });
        
        // 2. Manejar tipos MIME problemáticos (Android/iOS)
        // Esto es realmente para si algun momento quiero agregar imagenes de una con las fotos
        } else if (file.type === 'application/octet-stream') {

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

        // Caso 3: Tipo no admitido (ej: PDF, texto)
        } else {
            openAlert(`Archivo ${file.name} no es una imagen válida.`, 'red', 1500);
            // throw new Error(`Archivo ${file.name} no es una imagen válida.`);
            return null;
        }

        // add image to upload
        formData.append(inputFieldName, processedFile);

        // limit quantity to update
        if (quantity > 0 && quantity-1 == i) break;
    }

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
        // throw new Error(data.detail || 'Failed to upload images');
        return null;
    }

    // On success, show confirmation message
    openAlert('Imágenes subidas correctamente.', 'green', 1500);
    if (data.success) return data.image_url;

    return null;
}

function initInputImage(modalForm) {
    const imageInput = modalForm.querySelector('.image-input');
    const previewContainer = modalForm.querySelector('.cont-img-previews');

    // 1. Limpieza inicial
    if (globalPond) {
        FilePond.destroy(globalPond);
        globalPond = null;
    }
    imageInput.value = '';
    previewContainer.innerHTML = '';

    // 2. Configurar FilePond con Compressor.js
    globalPond = FilePond.create(imageInput, {
        allowMultiple: true,
        acceptedFileTypes: ['image/*'],
        maxFiles: 5,
        // Deshabilita la cámara para priorizar la galería
        allowCamera: true,
        labelIdle: 'Arrastra tus imágenes o <span class="filepond--label-action"><b>Selecciona</b></span>',

        onpreparefile: (file, output) => {
            const start = performance.now();

            return new Promise((resolve, reject) => {
                new Compressor(output, {
                    quality: 0.7,
                    maxWidth: 1024,
                    maxHeight: 1024,
                    success(result) {

                        const end = performance.now();
                        console.log(`Tiempo de compresión: ${(end - start).toFixed(2)} ms`);

                        const compressedFile = new File([result], output.name, {
                            type: output.type,
                            lastModified: Date.now()
                        });

                        // Guardar el comprimido en metadata por si lo usás después
                        file.setMetadata('compressedFile', compressedFile);

                        console.log(`${compressedFile.name}, ${compressedFile.type}`)

                        // Actualizar el preview manual, si querés
                        updatePreview(compressedFile, previewContainer);

                        resolve(compressedFile);
                    },
                    error(err) {
                        console.error("Compresión falló:", err);
                        reject(err);
                    }
                });
            });
        },

        onaddfile: (error, file) => {
            if (error) return;
            updatePreview(file.file, previewContainer);
        },
        onremovefile: () => {
            previewContainer.innerHTML = '';
            globalPond.getFiles().forEach(file => {
                updatePreview(file.file, previewContainer);
            });
        }
    });


    // 3. Función de previsualización optimizada
    function updatePreview(file, container) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('h-190');
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Initializes modal form events with proper cleanup:
 * 1. Image preview handling
 * 2. Click-outside closing
 * 3. Modal cancel button
 * 
 * This use eventHandlersMap for delete correctly some events
 * @param {HTMLElement} modalForm - The modal form container
 */

/*
function initInputImage(modalForm) {
    const imageInput = modalForm.querySelector('.image-input');
    const previewContainer = modalForm.querySelector('.cont-img-previews');

    // 1. Limpieza inicial
    if (globalPond) {
        FilePond.destroy(globalPond);
        // FilePond.destroy(imageInput);
        globalPond = null;
    }
    imageInput.value = '';
    previewContainer.innerHTML = '';

    // 2. Configurar FilePond con callbacks para previsualización
    globalPond = FilePond.create(imageInput, {
        allowMultiple: true,
        acceptedFileTypes: ['image/*'],
        maxFiles: 5,
        // Deshabilita la cámara para priorizar la galería
        allowCamera: true,
        labelIdle: 'Arrastra tus imágenes o <span class="filepond--label-action"><b>Selecciona</b></span>',
        // IMPORTANTE: Usar los eventos nativos de FilePond
        beforeAddFile: (file) => {
            // sirve para convertir una imagen de 3mb a 200kb calidad casi intacta
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    
                    img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024; // Ancho máximo
                    const MAX_HEIGHT = 1024; // Altura máxima
                    let width = img.width;
                    let height = img.height;
            
                    // Redimensionar manteniendo aspect ratio
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                        }
                    }
            
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
            
                    // Convertir a JPEG con calidad ajustable (0.7 = 70% calidad)
                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                        });
                        resolve(compressedFile); // FilePond usa este archivo
                    }, 'image/jpeg', 0.7); // Ajusta este valor (0.6-0.8)
                    };
                };
                reader.readAsDataURL(file.file);
            });
        },
        onaddfile: (error, file) => {
            if (error) return;
            updatePreview(file.file, previewContainer);
        },
        onremovefile: () => {
            previewContainer.innerHTML = '';
            pond.getFiles().forEach(file => {
                updatePreview(file.file, previewContainer);
            });
        }
    });

    // 3. Función de previsualización optimizada
    function updatePreview(file, container) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('h-190');
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
} 
    













// ✅ Este sí: usamos fileValidateType, pero luego manejamos el file


onpreparefile: (fileItem, file) => {
            const start = performance.now();

            return new Promise((resolve, reject) => {
                new Compressor(file, {
                    quality: 0.7,
                    maxWidth: 1024,
                    maxHeight: 1024,
                    success(result) {

                        const end = performance.now();
                        console.log(`Tiempo de compresión: ${(end - start).toFixed(2)} ms`);

                        const compressedFile = new File([result], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });

                        // Guardar el comprimido en metadata por si lo usás después
                        fileItem.setMetadata('compressedFile', compressedFile);

                        console.log(`${compressedFile.name}, ${compressedFile.type}`)

                        // Actualizar el preview manual, si querés
                        updatePreview(compressedFile, previewContainer);

                        resolve(compressedFile);
                    },
                    error(err) {
                        console.error("Compresión falló:", err);
                        reject(err);
                    }
                });
            });
        }







        onaddfilestart: (fileItem) => {
            const originalFile = fileItem.file;

            new Compressor(originalFile, {
                quality: 0.7,
                maxWidth: 1024,
                maxHeight: 1024,
                success(result) {
                    const compressed = new File([result], originalFile.name, {
                        type: fileItem.file.type, // esto es crucial
                        // type: 'image/jpeg',
                        lastModified: Date.now()
                    });

                    // Reemplazamos el archivo original con el comprimido
                    fileItem.setMetadata('compressedFile', compressed);

                    // Actualizamos preview manualmente si querés
                    updatePreview(compressed, previewContainer);
                },
                error(err) {
                    console.error("Compresión falló:", err);
                }
            });
        },
    });



*/