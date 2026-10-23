
import { CameraCapture } from './CameraCapture.js';

// Elementos da interface
const video = document.querySelector('#video');
const canvas = document.querySelector('#canvas');
const imagemCapturada = document.querySelector('#foto-capturada');
const container = document.querySelector('#camera-container');
const moldura = document.querySelector('#moldura-validade');

// Inicializa a câmera
const camera = new CameraCapture({ video, canvas });

// Diagnóstico centralizado da geometria
function atualizarDiagnostico(momento) {
    const videoRect = video.getBoundingClientRect();
    const molduraRect = moldura.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const diagnostico = {
        momento,

        viewport: {
            largura: window.innerWidth,
            altura: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
        },

        imagemOriginal: {
            largura: video.videoWidth,
            altura: video.videoHeight
        },

        videoNaTela: {
            top: +videoRect.top.toFixed(2),
            bottom: +videoRect.bottom.toFixed(2),
            left: +videoRect.left.toFixed(2),
            right: +videoRect.right.toFixed(2),
            largura: +videoRect.width.toFixed(2),
            altura: +videoRect.height.toFixed(2)
        },

        containerNaTela: {
            top: +containerRect.top.toFixed(2),
            bottom: +containerRect.bottom.toFixed(2),
            largura: +containerRect.width.toFixed(2),
            altura: +containerRect.height.toFixed(2)
        },

        molduraNaTela: {
            top: +molduraRect.top.toFixed(2),
            bottom: +molduraRect.bottom.toFixed(2),
            left: +molduraRect.left.toFixed(2),
            right: +molduraRect.right.toFixed(2),
            largura: +molduraRect.width.toFixed(2),
            altura: +molduraRect.height.toFixed(2)
        },

        molduraRelativaAoVideo: {
            esquerda: +(molduraRect.left - videoRect.left).toFixed(2),
            topo: +(molduraRect.top - videoRect.top).toFixed(2),
            direita: +(videoRect.right - molduraRect.right).toFixed(2),
            base: +(videoRect.bottom - molduraRect.bottom).toFixed(2)
        }
    };

    let painel = document.querySelector('#diagnostico-camera');

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

    painel.textContent = JSON.stringify(diagnostico, null, 2);

    console.log('Diagnóstico:', diagnostico);
}

// Botão: abrir câmera
document.querySelector('#abrirCamera').addEventListener('click', async () => {
    try {
        await camera.abrirCamera();
        atualizarDiagnostico('CAMERA INICIADA');
    } catch (error) {
        console.error('Erro ao abrir câmera:', error);
    }
});

// Botão: capturar fotografia
document.querySelector('#btn-capturar').addEventListener('click', async () => {
    try {
        const foto = await camera.capturarFoto();

        const urlAnterior = imagemCapturada.dataset.urlFoto;

        if (urlAnterior) {
            URL.revokeObjectURL(urlAnterior);
        }

        const urlFoto = URL.createObjectURL(foto);

        imagemCapturada.src = urlFoto;
        imagemCapturada.dataset.urlFoto = urlFoto;
        imagemCapturada.hidden = false;

        atualizarDiagnostico('FOTO CAPTURADA');

    } catch (error) {
        console.error('Erro na captura:', error);
    }
});

// Botão: encerrar câmera
document.querySelector('#btn-encerrar').addEventListener('click', () => {
    camera.encerrarCamera();
    imagemCapturada.hidden = true;
});
