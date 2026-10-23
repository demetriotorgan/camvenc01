export class CameraCapture {
    constructor({ video, canvas }) {
        this.video = video;
        this.canvas = canvas;
        this.stream = null;
        this.fotoBlob = null;
    }

    async abrirCamera() {
        //Solicitar acesso a camera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });
        //Associar  fluxo ao elemento de video
        this.stream = stream;
        this.video.srcObject = stream;

        //Aguardar o video estar pronto
        await new Promise((resolve, reject) => {
            if (this.video.readyState >= 2) {
                resolve();
                return;
            }
            this.video.addEventListener('loadeddata', resolve, {
                once: true
            });
            this.video.addEventListener('error', reject, {
                once: true
            })
        })

        //4. Iniciar reprodução
        await this.video.play();
        console.log("Camera iniciada com sucesso");
    }

    encerrarCamera() {
        //1. Interromper todas as faixas de camera
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            //2. Libera o fluxo
            this.stream = null;
        }
        //3. Desassociar o fluxo ao elemento de video
        this.video.pause();
        this.video.srcObject = null;

        //4. Limpar a referencia a foto se existir
        this.fotoBlob = null;
        console.log('Camera encerrada com sucesso');
    }

    async capturarFoto() {
        //1.Verificar se camera esta pronta
        if (!this.stream || !this.video.videoWidth || !this.video.videoHeight) {
            throw new Error('A camera precisa estar aberta para capturar a foto')
        };

        //2. Ajustar o canvas a resolução real do video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        //3. Copiar o quadro atual do video para o canvas
        const contexto = this.canvas.getContext("2d");
        contexto.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        //4. Converter o canvas em um arquivo de imagem
        const blob = await new Promise((resolve, reject) => {
            this.canvas.toBlob((resultado) => {
                if (resultado) {
                    resolve(resultado)
                } else {
                    reject(new Error('Não foi possível gerar a imagem'));
                }
            }, "image/jpeg", 0.95);
        });

        //5. Guardar e devolver a fotografia
        this.fotoBlob = blob;
        console.log('Foto capturada com sucesso', {
            largura: this.canvas.width,
            altura: this.canvas.height,
            tamanho: blob.size,
            tipo: blob.type
        });

        console.log("Dimensões do vídeo:", {
            larguraReal: this.video.videoWidth,
            alturaReal: this.video.videoHeight,
            larguraExibida: this.video.clientWidth,
            alturaExibida: this.video.clientHeight
        });
        return blob;
    }
}