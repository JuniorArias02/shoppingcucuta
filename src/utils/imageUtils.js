/**
 * Compresses an image file.
 * @param {File} file - The image file to compress.
 * @param {Object} options - Compression options.
 * @param {number} options.maxWidth - Maximum width for the image.
 * @param {number} options.maxHeight - Maximum height for the image.
 * @param {number} options.quality - Quality of the compressed image (0 to 1).
 * @returns {Promise<File>} - A promise that resolves with the compressed File object.
 */
export const compressImage = async (file, options = { maxWidth: 1200, maxHeight: 1200, quality: 0.7 }) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate aspect ratio resizing
                if (width > height) {
                    if (width > options.maxWidth) {
                        height *= options.maxWidth / width;
                        width = options.maxWidth;
                    }
                } else {
                    if (height > options.maxHeight) {
                        width *= options.maxHeight / height;
                        height = options.maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob failed'));
                            return;
                        }
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    file.type || 'image/jpeg',
                    options.quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
