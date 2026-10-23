import {CameraCapture} from './CameraCapture.js'

const video = document.querySelector('#video');
const canvas = document.querySelector('#canvas')
const imagemCapturada = document.querySelector('#foto-capturada');
const container = document.querySelector("#camera-container");
const moldura = document.querySelector("#moldura-validade");
const botaoDiagnostico = document.querySelector(
    "#atualizar-diagnostico"
);

console.log("Vídeo:", video.getBoundingClientRect());
console.log("Contêiner:", container.getBoundingClientRect());
console.log("Moldura:", moldura.getBoundingClientRect());
const painel = document.querySelector("#diagnostico-camera");

console.log("Resolução original:", {
    largura: video.videoWidth,
    altura: video.videoHeight
});


const camera = new CameraCapture({video, canvas});

document.querySelector('#abrirCamera').addEventListener('click', async ()=>{
    try {
        await camera.abrirCamera();
    } catch (erro) {
        console.error('Erro ao abrir camera: ', erro);
    }
});

document.querySelector('#btn-encerrar').addEventListener('click', ()=>{
    camera.encerrarCamera();
    imagemCapturada.hidden = true;
})



document.querySelector('#btn-capturar').addEventListener('click', async ()=>{
    try {
        const foto = await camera.capturarFoto();

        //Cria uma URL temporaria para img
        const urlFoto = URL.createObjectURL(foto);

        //Libera a URL se houver uma anterior
        if(imagemCapturada.dataset.urlFoto){
            URL.revokeObjectURL(imagemCapturada.dataset.urlFoto);
        }

        //Exibir a fotografia
        imagemCapturada.src = urlFoto;
        imagemCapturada.dataset.urlFoto = urlFoto;
        imagemCapturada.hidden = false

        console.log('Blob recebido:',foto);        
    } catch (error) {
        console.error('Erro na captura:', error.message);
    }
});

video.addEventListener("loadeddata", () => {
    console.log("Vídeo pronto:", {
        larguraReal: video.videoWidth,
        alturaReal: video.videoHeight,
        larguraExibida: video.getBoundingClientRect().width,
        alturaExibida: video.getBoundingClientRect().height
    });

    console.log("Contêiner:", container.getBoundingClientRect());
    console.log("Moldura:", moldura.getBoundingClientRect());
}, { once: true });

// -----_Diagnositico -------
function atualizarDiagnostico() {
    if (!video || !moldura || !painel) {
        console.error("Elementos do diagnóstico não encontrados.");
        return;
    }

    if (!video.videoWidth || !video.videoHeight) {
        painel.textContent =
            "Aguardando a câmera ficar pronta...\n" +
            "Abra a câmera e tente novamente.";
        return;
    }

    // Medidas da imagem original fornecida pela câmera.
    const original = {
        largura: video.videoWidth,
        altura: video.videoHeight
    };

    // Retângulos reais dos elementos na tela.
    const videoRect = video.getBoundingClientRect();
    const molduraRect = moldura.getBoundingClientRect();

    // Posição da moldura relativa ao vídeo.
    const relativo = {
        esquerda: molduraRect.left - videoRect.left,
        topo: molduraRect.top - videoRect.top,
        direita: videoRect.right - molduraRect.right,
        base: videoRect.bottom - molduraRect.bottom
    };

    // Escala entre pixels exibidos e pixels originais.
    const escala = {
        x: original.largura / videoRect.width,
        y: original.altura / videoRect.height
    };

    // Estimativa da região correspondente na imagem original.
    const recorteEstimado = {
        x: Math.round(relativo.esquerda * escala.x),
        y: Math.round(relativo.topo * escala.y),
        width: Math.round(molduraRect.width * escala.x),
        height: Math.round(molduraRect.height * escala.y)
    };

    const recorteDentroDaImagem =
        recorteEstimado.x >= 0 &&
        recorteEstimado.y >= 0 &&
        recorteEstimado.width > 0 &&
        recorteEstimado.height > 0 &&
        recorteEstimado.x + recorteEstimado.width <=
            original.largura &&
        recorteEstimado.y + recorteEstimado.height <=
            original.altura;

    // Propriedades visuais que podem afetar o mapeamento.
    const estiloVideo = getComputedStyle(video);

    const diagnostico = {
        camera: {
            pronta: video.readyState >= 2,
            videoTrackAtivo:
                video.srcObject?.getVideoTracks().some(
                    track => track.readyState === "live"
                ) ?? false
        },

        ambiente: {
            larguraViewport: window.innerWidth,
            alturaViewport: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            orientacao: screen.orientation?.type ?? "indisponível"
        },

        imagemOriginal: original,

        videoNaTela: {
            left: +videoRect.left.toFixed(2),
            top: +videoRect.top.toFixed(2),
            right: +videoRect.right.toFixed(2),
            bottom: +videoRect.bottom.toFixed(2),
            largura: +videoRect.width.toFixed(2),
            altura: +videoRect.height.toFixed(2)
        },

        molduraNaTela: {
            left: +molduraRect.left.toFixed(2),
            top: +molduraRect.top.toFixed(2),
            right: +molduraRect.right.toFixed(2),
            bottom: +molduraRect.bottom.toFixed(2),
            largura: +molduraRect.width.toFixed(2),
            altura: +molduraRect.height.toFixed(2)
        },

        molduraRelativaAoVideo: {
            esquerda: +relativo.esquerda.toFixed(2),
            topo: +relativo.topo.toFixed(2),
            direita: +relativo.direita.toFixed(2),
            base: +relativo.base.toFixed(2)
        },

        escalaPixelsTelaParaOriginal: {
            x: +escala.x.toFixed(5),
            y: +escala.y.toFixed(5)
        },

        estimativaRecorteOriginal: recorteEstimado,

        verificacao: {
            recorteDentroDaImagem,
            proporcaoOriginal:
                +(original.largura / original.altura).toFixed(5),
            proporcaoVideoExibido:
                +(videoRect.width / videoRect.height).toFixed(5),
            objectFit: estiloVideo.objectFit,
            transform: estiloVideo.transform
        }
    };

    painel.textContent = JSON.stringify(diagnostico, null, 2);

    console.log("Diagnóstico da câmera:", diagnostico);
}

botaoDiagnostico?.addEventListener(
    "click",
    atualizarDiagnostico
);

// Atualiza quando a câmera estiver pronta.
video?.addEventListener("loadeddata", atualizarDiagnostico);

// Atualiza se o tamanho da área mudar.
window.addEventListener("resize", atualizarDiagnostico);
window.addEventListener("orientationchange", () => {
    setTimeout(atualizarDiagnostico, 300);
});

if (video && window.ResizeObserver) {
    const observador = new ResizeObserver(atualizarDiagnostico);
    observador.observe(video);
    observador.observe(moldura);
}