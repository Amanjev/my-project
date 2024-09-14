// Function to handle file conversion
async function convertFile() {
    const fileInput = document.getElementById('fileInput').files[0];
    const conversionType = document.getElementById('conversionType').value;

    if (!fileInput) {
        alert('Please upload a file.');
        return;
    }

    try {
        switch (conversionType) {
            case 'pdfToImage':
                await convertPdfToImage(fileInput);
                break;
            case 'imageToPdf':
                convertImageToPdf(fileInput);
                break;
            case 'textToPdf':
                convertTextToPdf(fileInput);
                break;
            case 'docToPdf':
                convertDocToPdf(fileInput);
                break;
            case 'pdfToDoc':
                convertPdfToDoc(fileInput);
                break;
            case 'pdfToText':
                convertPdfToText(fileInput);
                break;
            case 'compressFile':
                compressFile(fileInput);
                break;
            case 'imageToText':
                await convertImageToText(fileInput);
                break;
            case 'textToImage':
                convertTextToImage(fileInput);
                break;
            default:
                throw new Error('Unsupported conversion type.');
        }
    } catch (error) {
        console.error('Conversion error:', error);
        alert('An error occurred during the conversion. Check the console for details.');
    }
}

// PDF to Image Conversion using PDF.js
async function convertPdfToImage(file) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];

    const fileReader = new FileReader();
    fileReader.onload = async function () {
        try {
            const pdfData = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            await page.render(renderContext).promise;

            const imgUrl = canvas.toDataURL();
            displayResultImage(imgUrl);
        } catch (error) {
            console.error('Error rendering PDF to image:', error);
        }
    };
    fileReader.readAsArrayBuffer(file);
}

// Image to PDF Conversion using jsPDF
function convertImageToPdf(file) {
    const fileReader = new FileReader();
    fileReader.onload = function () {
        try {
            const img = new Image();
            img.src = this.result;
            img.onload = function () {
                const pdf = new jsPDF();
                pdf.addImage(img, 'JPEG', 0, 0, img.width / 4, img.height / 4);
                const pdfBlob = pdf.output('blob');
                displayDownloadLink(pdfBlob, 'converted.pdf');
            };
        } catch (error) {
            console.error('Error converting image to PDF:', error);
        }
    };
    fileReader.readAsDataURL(file);
}

// Text to PDF Conversion
function convertTextToPdf(file) {
    const fileReader = new FileReader();
    fileReader.onload = function () {
        try {
            const text = this.result;
            const pdf = new jsPDF();
            pdf.text(text, 10, 10);
            const pdfBlob = pdf.output('blob');
            displayDownloadLink(pdfBlob, 'text-to-pdf.pdf');
        } catch (error) {
            console.error('Error converting text to PDF:', error);
        }
    };
    fileReader.readAsText(file);
}

// DOC to PDF Conversion (treating DOC as text input for browser-based solution)
function convertDocToPdf(file) {
    const fileReader = new FileReader();
    fileReader.onload = function () {
        try {
            const text = this.result;
            const pdf = new jsPDF();
            pdf.text(text, 10, 10);
            const pdfBlob = pdf.output('blob');
            displayDownloadLink(pdfBlob, 'doc-to-pdf.pdf');
        } catch (error) {
            console.error('Error converting DOC to PDF:', error);
        }
    };
    fileReader.readAsText(file);
}

// PDF to DOC conversion (simplified to extracting text from PDF)
async function convertPdfToDoc(file) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];

    const fileReader = new FileReader();
    fileReader.onload = async function () {
        try {
            const pdfData = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map(item => item.str).join(' ') + '\n';
            }
            const blob = new Blob([textContent], { type: 'application/msword' });
            displayDownloadLink(blob, 'pdf-to-doc.doc');
        } catch (error) {
            console.error('Error converting PDF to DOC:', error);
        }
    };
    fileReader.readAsArrayBuffer(file);
}

// PDF to Text Conversion
async function convertPdfToText(file) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];

    const fileReader = new FileReader();
    fileReader.onload = async function () {
        try {
            const pdfData = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map(item => item.str).join(' ') + '\n';
            }
            const blob = new Blob([textContent], { type: 'text/plain' });
            displayDownloadLink(blob, 'pdf-to-text.txt');
        } catch (error) {
            console.error('Error converting PDF to text:', error);
        }
    };
    fileReader.readAsArrayBuffer(file);
}

// File Compression using pako.js
function compressFile(file) {
    const fileReader = new FileReader();
    fileReader.onload = function () {
        try {
            const data = new Uint8Array(this.result);
            const compressedData = pako.deflate(data);
            const blob = new Blob([compressedData], { type: 'application/octet-stream' });
            displayDownloadLink(blob, 'compressed-file.gz');
        } catch (error) {
            console.error('Error compressing file:', error);
        }
    };
    fileReader.readAsArrayBuffer(file);
}

// Image to Text Conversion using Tesseract.js
// Image to Text Conversion using Tesseract.js
async function convertImageToText(file) {
    const fileReader = new FileReader();
    fileReader.onload = async function () {
        try {
            const img = new Image();
            img.src = this.result;
            img.onload = async function () {
                try {
                    // Perform OCR using Tesseract.js
                    const { data: { text } } = await Tesseract.recognize(img, 'eng');
                    
                    // Create a Blob with the extracted text
                    const blob = new Blob([text], { type: 'text/plain' });
                    
                    // Display download link for the text file
                    displayDownloadLink(blob, 'image-to-text.txt');
                } catch (error) {
                    console.error('Error during OCR:', error);
                }
            };
        } catch (error) {
            console.error('Error loading image:', error);
        }
    };
    fileReader.readAsDataURL(file);
}

// Helper function to create a download link and display it
function displayDownloadLink(blob, filename) {
    const resultSection = document.getElementById('resultSection');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.textContent = `Download ${filename}`;
    resultSection.innerHTML = ''; // Clear previous results
    resultSection.appendChild(a);
}

// Function to handle file conversion
function convertFile() {
    const fileInput = document.getElementById('fileInput').files[0];
    const conversionType = document.getElementById('conversionType').value;
    
    if (!fileInput) {
        alert('Please upload a file.');
        return;
    }

    // Hide the download button initially
    document.getElementById('downloadButton').style.display = 'none';

    if (conversionType === 'pdfToImage') {
        convertPdfToImage(fileInput);
    } else if (conversionType === 'imageToPdf') {
        convertImageToPdf(fileInput);
    } else if (conversionType === 'textToPdf') {
        convertTextToPdf(fileInput);
    } else if (conversionType === 'docToPdf') {
        convertDocToPdf(fileInput);
    } else if (conversionType === 'pdfToDoc') {
        convertPdfToDoc(fileInput);
    } else if (conversionType === 'pdfToText') {
        convertPdfToText(fileInput);
    } else if (conversionType === 'compressFile') {
        compressFile(fileInput);
    } else if (conversionType === 'imageToText') {
        convertImageToText(fileInput);
    } else if (conversionType === 'textToImage') {
        convertTextToImage(fileInput);
    }
}

// Display the download link for converted or compressed files
function displayDownloadLink(fileBlob, fileName) {
    const resultSection = document.getElementById('resultSection');
    const url = URL.createObjectURL(fileBlob);
    
    // Update the download button
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.href = url;
    downloadButton.download = fileName;
    downloadButton.textContent = `Download ${fileName}`;
    downloadButton.style.display = 'inline-block'; // Show the button
}
