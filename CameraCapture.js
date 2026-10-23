
export class CameraCapture {
    constructor({ video, canvas }) {
        this.video = video;
        this.canvas = canvas;
        this.stream = null;
        this.fotoBlob = null;
    }

    // Exibe na tela os dados necessários para investigar a geometria.
    mostrarDiagnostico(momento) {
        let painel = document.getElementById('diagnostico-camera');

        if (!painel) {
            painel = document.createElement('pre');
            painel.id = 'diagnostico-camera';

            Object.assign(painel.style, {
                position: 'fixed',
                top: '5px',
                left: '5px',
                right: '5px',
                maxHeight: '45vh',
                overflowY: 'auto',
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#00ff80',
                padding: '10px',
                fontSize: '11px',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                zIndex: '999999',
                margin: '0',
                border: '1px solid #00ff80',
                borderRadius: '6px'
            });

            document.body.appendChild(painel);
        }

        const rect = this.video.getBoundingClientRect();
        const configuracao = this.stream
            ?.getVideoTracks()[0]
            ?.getSettings();

        const dados = {
            momento,

            camera: {
                largura: this.video.videoWidth,
                altura: this.video.videoHeight,
                larguraConfigurada: configuracao?.width,
                alturaConfigurada: configuracao?.height
            },

            viewport: {
                largura: window.innerWidth,
                altura: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            },

            videoNaTela: {
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
                largura: rect.width,
                altura: rect.height
            },

            canvas: {
                largura: this.canvas.width,
                altura: this.canvas.height
            }
        };

        painel.textContent = JSON.stringify(dados, null, 2);
    }

    // Abre a câmera e inicia a reprodução.
    async abrirCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });
        } catch (error) {
            console.warn(
                'Falha ao abrir a câmera preferencial. Tentando alternativa.',
                error
            );

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
        }

        this.video.srcObject = this.stream;

        try {
            if (this.video.readyState < 2) {
                await new Promise((resolve, reject) => {
                    this.video.addEventListener(
                        'loadeddata',
                        resolve,
                        { once: true }
                    );

                    this.video.addEventListener(
                        'error',
                        reject,
                        { once: true }
                    );
                });
            }

            await this.video.play();

            this.mostrarDiagnostico('CAMERA INICIADA');

            console.log('Câmera iniciada com sucesso');
        } catch (error) {
            this.encerrarCamera();
            throw error;
        }
    }

    // Captura o quadro atual do vídeo.
    async capturarFoto() {
        if (
            !this.stream ||
            !this.video.videoWidth ||
            !this.video.videoHeight
        ) {
            throw new Error(
                'A câmera precisa estar aberta para capturar a foto.'
            );
        }

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        const contexto = this.canvas.getContext('2d');

        contexto.drawImage(
            this.video,
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        const blob = await new Promise((resolve, reject) => {
            this.canvas.toBlob(
                resultado => {
                    if (resultado) {
                        resolve(resultado);
                    } else {
                        reject(
                            new Error('Não foi possível gerar a imagem.')
                        );
                    }
                },
                'image/jpeg',
                0.95
            );
        });

        this.fotoBlob = blob;

        this.mostrarDiagnostico('FOTO CAPTURADA');

        console.log('Foto capturada:', {
            largura: this.canvas.width,
            altura: this.canvas.height,
            tamanho: blob.size,
            tipo: blob.type
        });

        return blob;
    }

    // Encerra a câmera e libera seus recursos.
    encerrarCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.video.pause();
        this.video.srcObject = null;
        this.fotoBlob = null;

        console.log('Câmera encerrada com sucesso');
    }
}
