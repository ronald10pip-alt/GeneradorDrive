class GoogleDriveLinkGenerator {
    constructor() {
        this.driveUrlInput = document.getElementById('driveUrl');
        this.generateBtn = document.getElementById('generateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.resultDiv = document.getElementById('result');
        this.errorDiv = document.getElementById('error');
        this.errorMessage = document.getElementById('errorMessage');
        this.directLinkInput = document.getElementById('directLink');
        this.copyBtn = document.getElementById('copyBtn');
        this.testLinkBtn = document.getElementById('testLinkBtn');
        this.previewBtn = document.getElementById('previewBtn');
        this.previewContainer = document.getElementById('previewContainer');
        this.previewContent = document.getElementById('previewContent');
        this.closePreviewBtn = document.getElementById('closePreviewBtn');
        
        this.currentFileId = null;
        
        this.init();
    }
    
    init() {
        this.generateBtn.addEventListener('click', () => this.generate());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.testLinkBtn.addEventListener('click', () => this.testLink());
        this.previewBtn.addEventListener('click', () => this.showPreview());
        this.closePreviewBtn.addEventListener('click', () => this.closePreview());
        
        this.driveUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generate();
        });
        
        this.driveUrlInput.addEventListener('input', () => this.hideError());
        
        this.setupWhatsApp();
    }
    
    setupWhatsApp() {
        const whatsappLink = document.getElementById('whatsappLink');
        if (whatsappLink) {
            whatsappLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                const phoneNumber = '5197897922';
                const message = encodeURIComponent(
                    'Hola, estoy usando el Generador de Enlaces Directos de Google Drive y necesito ayuda.'
                );
                
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                window.open(whatsappUrl, '_blank');
                
                this.showTemporaryMessage('📱 Abriendo WhatsApp... Envía tu consulta', 'info');
            });
        }
    }
    
    clearAll() {
        this.driveUrlInput.value = '';
        
        if (this.directLinkInput) {
            this.directLinkInput.value = '';
        }
        
        this.currentFileId = null;
        this.closePreview();
        this.hideResult();
        this.hideError();
        
        const infoNote = document.querySelector('.info-note');
        if (infoNote) {
            infoNote.innerHTML = `
                <strong>⚠️ Nota importante:</strong>
                El archivo debe tener permisos públicos "Cualquier persona con el enlace"
                para que funcione correctamente.
            `;
        }
        
        this.driveUrlInput.focus();
        this.showTemporaryMessage('🧹 Todo ha sido limpiado', 'success');
        
        this.clearBtn.classList.add('clean-animation');
        setTimeout(() => {
            this.clearBtn.classList.remove('clean-animation');
        }, 300);
    }
    
    extractFileId(url) {
        const patterns = [
            /\/file\/d\/([a-zA-Z0-9_-]+)/,
            /id=([a-zA-Z0-9_-]+)/,
            /\/d\/([a-zA-Z0-9_-]+)/,
            /\/open\?id=([a-zA-Z0-9_-]+)/,
            /\/uc\?id=([a-zA-Z0-9_-]+)/,
            /\/download\?id=([a-zA-Z0-9_-]+)/,
            /\/file\/d\/([a-zA-Z0-9_-]+)\/view/,
            /drive\.google\.com\/.*id=([a-zA-Z0-9_-]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }
    
    generateDirectLink(fileId) {
        return `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
    }
    
    generatePreviewLink(fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    generate() {
        const url = this.driveUrlInput.value.trim();
        
        if (!url) {
            this.showError('Por favor, ingresa un enlace de Google Drive');
            return;
        }
        
        this.generateBtn.disabled = true;
        this.generateBtn.innerHTML = '<span>⏳</span> Procesando...';
        
        try {
            const fileId = this.extractFileId(url);
            
            if (!fileId) {
                throw new Error('No se pudo extraer el ID del archivo. Verifica que el enlace sea válido.');
            }
            
            this.currentFileId = fileId;
            
            const directLink = this.generateDirectLink(fileId);
            this.directLinkInput.value = directLink;
            
            this.previewBtn.disabled = false;
            
            this.showInfoNote(fileId);
            this.showResult();
            this.hideError();
            
            this.showTemporaryMessage('✅ Enlace generado correctamente. Vista previa disponible.', 'success');
            
        } catch (error) {
            this.showError(error.message);
            this.hideResult();
            this.previewBtn.disabled = true;
        } finally {
            this.generateBtn.disabled = false;
            this.generateBtn.innerHTML = '<span>✨</span> Generar Enlace Directo';
        }
    }
    
    showInfoNote(fileId) {
        const infoNote = document.querySelector('.info-note');
        if (infoNote) {
            infoNote.innerHTML = `
                <strong>✅ ID del archivo:</strong> ${fileId}<br>
                <strong>📄 Formatos con vista previa:</strong> PDF, Word, Excel, PowerPoint, Imágenes, Texto<br>
                <strong>👁️ Haz clic en "Vista Previa" para visualizar</strong><br>
                <small>⚠️ Nota: El archivo debe tener permisos públicos "Cualquier persona con el enlace"</small>
            `;
        }
    }
    
    showPreview() {
        if (!this.currentFileId) {
            this.showTemporaryMessage('No hay ningún archivo para previsualizar', 'error');
            return;
        }
        
        const previewUrl = this.generatePreviewLink(this.currentFileId);
        
        this.previewContainer.classList.remove('hidden');
        
        this.previewContent.innerHTML = `
            <div class="loading-preview">
                <span>⏳</span> Cargando vista previa...
                <p style="font-size: 12px; margin-top: 10px;">Esto puede tomar unos segundos</p>
            </div>
        `;
        
        setTimeout(() => {
            this.previewContent.innerHTML = `
                <iframe 
                    src="${previewUrl}" 
                    class="preview-frame"
                    frameborder="0"
                    allow="autoplay; fullscreen"
                    allowfullscreen
                ></iframe>
                <div style="padding: 10px; background: #f8f9fa; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0;">
                    ¿No se ve el contenido? 
                    <a href="${previewUrl}" target="_blank" style="color: #4285f4;">Abrir en nueva pestaña</a>
                </div>
            `;
            
            const iframe = this.previewContent.querySelector('iframe');
            if (iframe) {
                iframe.onerror = () => {
                    this.previewContent.innerHTML = `
                        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 500px;">
                            <span style="font-size: 48px;">⚠️</span>
                            <p style="margin-top: 15px;">No se pudo cargar la vista previa</p>
                            <p style="font-size: 12px; color: #666;">Esto puede deberse a que el archivo no tiene permisos públicos</p>
                            <button onclick="window.open('${previewUrl}', '_blank')" style="margin-top: 15px; padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Abrir en nueva ventana
                            </button>
                        </div>
                    `;
                };
            }
        }, 100);
    }
    
    closePreview() {
        this.previewContainer.classList.add('hidden');
        this.previewContent.innerHTML = '';
    }
    
    copyToClipboard() {
        if (!this.directLinkInput.value) {
            this.showTemporaryMessage('No hay ningún enlace para copiar', 'error');
            return;
        }
        
        this.directLinkInput.select();
        this.directLinkInput.setSelectionRange(0, 99999);
        
        try {
            navigator.clipboard.writeText(this.directLinkInput.value);
            this.showTemporaryMessage('¡Enlace copiado al portapapeles!', 'success');
        } catch (err) {
            document.execCommand('copy');
            this.showTemporaryMessage('¡Enlace copiado!', 'success');
        }
    }
    
    testLink() {
        const link = this.directLinkInput.value;
        if (!link) {
            this.showTemporaryMessage('No hay ningún enlace para probar', 'error');
            return;
        }
        
        this.showDownloadConfirmation(() => {
            const downloadLink = document.createElement('a');
            downloadLink.href = link;
            downloadLink.download = '';
            downloadLink.click();
            
            setTimeout(() => {
                this.showTemporaryMessage('⬇️ La descarga ha comenzado', 'success');
            }, 500);
        });
    }
    
    showDownloadConfirmation(callback) {
        const modal = document.createElement('div');
        modal.className = 'download-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span class="icon">⬇️</span>
                    <h3>Confirmar Descarga</h3>
                </div>
                <div class="modal-body">
                    <p>¿Estás seguro de que quieres descargar este archivo?</p>
                    <p class="file-info">${this.currentFileId ? `ID: ${this.currentFileId.substring(0, 10)}...` : 'Archivo de Google Drive'}</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn-cancel">Cancelar</button>
                    <button class="modal-btn-confirm">Descargar</button>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 25px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideInUp 0.3s ease;
        `;
        
        const header = modal.querySelector('.modal-header');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            font-size: 20px;
        `;
        
        const body = modal.querySelector('.modal-body');
        body.style.cssText = `
            margin-bottom: 25px;
            color: #666;
        `;
        
        const fileInfo = modal.querySelector('.file-info');
        fileInfo.style.cssText = `
            font-size: 12px;
            color: #999;
            margin-top: 10px;
            word-break: break-all;
        `;
        
        const footer = modal.querySelector('.modal-footer');
        footer.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        `;
        
        const cancelBtn = modal.querySelector('.modal-btn-cancel');
        cancelBtn.style.cssText = `
            padding: 10px 20px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s;
        `;
        cancelBtn.onmouseover = () => cancelBtn.style.background = '#5a6268';
        cancelBtn.onmouseout = () => cancelBtn.style.background = '#6c757d';
        
        const confirmBtn = modal.querySelector('.modal-btn-confirm');
        confirmBtn.style.cssText = `
            padding: 10px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.2s;
        `;
        confirmBtn.onmouseover = () => confirmBtn.style.transform = 'translateY(-2px)';
        confirmBtn.onmouseout = () => confirmBtn.style.transform = 'translateY(0)';
        
        cancelBtn.onclick = () => {
            document.body.removeChild(modal);
            this.showTemporaryMessage('Descarga cancelada', 'info');
        };
        
        confirmBtn.onclick = () => {
            document.body.removeChild(modal);
            callback();
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                this.showTemporaryMessage('Descarga cancelada', 'info');
            }
        };
        
        document.body.appendChild(modal);
    }
    
    showResult() {
        this.resultDiv.classList.remove('hidden');
    }
    
    hideResult() {
        this.resultDiv.classList.add('hidden');
        this.closePreview();
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorDiv.classList.remove('hidden');
        
        setTimeout(() => {
            if (this.errorDiv && !this.errorDiv.classList.contains('hidden')) {
                this.hideError();
            }
        }, 5000);
    }
    
    hideError() {
        this.errorDiv.classList.add('hidden');
    }
    
    showTemporaryMessage(message, type = 'success') {
        const toast = document.createElement('div');
        toast.textContent = message;
        
        let bgColor = '#28a745';
        if (type === 'error') bgColor = '#dc3545';
        if (type === 'info') bgColor = '#17a2b8';
        
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new GoogleDriveLinkGenerator();
});