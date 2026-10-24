
/**
 * Converte a posição da moldura na tela
 * para coordenadas da imagem original.
 */
export function calcularRecorte({
    video,
    moldura,
    imagem
}) {
    if (
        !video.largura ||
        !video.altura ||
        !imagem.largura ||
        !imagem.altura
    ) {
        throw new Error(
            'As dimensões do vídeo e da imagem devem ser positivas.'
        );
    }

    const escalaX = imagem.largura / video.largura;
    const escalaY = imagem.altura / video.altura;

    const x = (moldura.esquerda - video.esquerda) * escalaX;
    const y = (moldura.topo - video.topo) * escalaY;

    const largura = moldura.largura * escalaX;
    const altura = moldura.altura * escalaY;

    return {
        x: Math.round(x),
        y: Math.round(y),
        largura: Math.round(largura),
        altura: Math.round(altura)
    };
}
