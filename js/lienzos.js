class tramo { // aun sirve para comprimir una imagen , siempre y cuando 
    constructor(x0, x1, y) { // rgba , #681fadde hexadecimal de 4, osea 8 caracteres
        this.x0 = x0
        this.x1 = x1
        this.y = y
    }

    tramoFronterizo(tramo) {
        const diffY = Math.abs(tramo.y - this.y);
        if (diffY > 1) return false;

        if (diffY === 0) {
            return !(tramo.x1 < this.x0 - 1 || tramo.x0 > this.x1 + 1);
        }
        return !(tramo.x1 < this.x0 || tramo.x0 > this.x1);
    }

    fusionarTramos(tramo) {
        if (!(this.tramoFronterizo(tramo) && tramo.y === this.y)) return
        return new tramo({ y: this.y, x0: Math.min(tramo.x0, this.x0), x1: Math.max(tramo.x1, this.x1) })
    }
}
class comparadorPixel {
    constructor({ toleranciaA = 0, nivelReflejoAlpha = 0 }) {
        this.toleranciaA = toleranciaA;
        this.nivelReflejoAlpha = nivelReflejoAlpha;
        this.toleranciaTotal = toleranciaA;
    }
    obtenerComparador(pixelBase) {
    }
    obtenerEquivalenciaAlpha({ alphaBase, alphaModificar, nivelRefjelo }) {
        return (alphaBase * nivelRefjelo) + (alphaModificar * (1 - nivelRefjelo))

    }
    obtenerEquivalenciaCanales({ canalesBase, canalesModificar, nivelRefjelo }) {

    }
}
class comparadorPixelRGBA extends comparadorPixel {
    constructor({ toleranciaR = 0, toleranciaG = 0, toleranciaB = 0, toleranciaA = 0,
        nivelReflejoR = 0, nivelReflejoG = 0, nivelReflejoB = 0, nivelReflejoAlpha = 0
    }) {
        super({ toleranciaA, nivelReflejoAlpha })
        this.toleranciaR = toleranciaR;
        this.toleranciaG = toleranciaG;
        this.toleranciaB = toleranciaB;
        this.toleranciaTotal = (toleranciaA + toleranciaB + toleranciaG + toleranciaR) / 4
        this.nivelReflejoR = nivelReflejoR;
        this.nivelReflejoG = nivelReflejoG;
        this.nivelReflejoB = nivelReflejoB;
    }
    obtenerComparador(pixelBase) {
        let rTolerado = 255 * this.toleranciaR;
        let gTolerado = 255 * this.toleranciaG;
        let bTolerado = 255 * this.toleranciaB;
        let aTolerado = 255 * this.toleranciaA;

        let maximoR = pixelBase.r + rTolerado
        let maximoG = pixelBase.g + gTolerado
        let maximoB = pixelBase.b + bTolerado
        let maximoA = pixelBase.a + aTolerado

        let minimoR = pixelBase.r - rTolerado
        let minimoG = pixelBase.g - gTolerado
        let minimoB = pixelBase.b - bTolerado
        let minimoA = pixelBase.a - aTolerado

        return (r, g, b, a) => {
            return (minimoR <= r && r <= maximoR) &&
                (minimoG <= g && g <= maximoG) &&
                (minimoB <= b && b <= maximoB) &&
                (minimoA <= a && a <= maximoA)
        }
    }
    obtenerEquivalenciaCanales(canalesBase) {

        return (canalesModificar) => {
            return {
                r: (canalesBase.r * (1 - this.nivelReflejoR)) + (canalesModificar.r * this.nivelReflejoR),
                g: (canalesBase.g * (1 - this.nivelReflejoG)) + (canalesModificar.g * this.nivelReflejoG),
                b: (canalesBase.b * (1 - this.nivelReflejoB)) + (canalesModificar.b * this.nivelReflejoB),
                alpha: (canalesBase.alpha * (1 - this.nivelReflejoAlpha)) + (canalesModificar.alpha * (this.nivelReflejoAlpha)),
            }
        }
    }
}
class compararPixelHsv extends comparadorPixel {
    constructor({ toleranciaH = 0, toleranciaS = 0, toleranciaV = 0, toleranciaA = 0,
        nivelReflejoH = 0, nivelReflejoV = 0, nivelReflejoS = 0, nivelReflejoAlpha = 0 }) {
        super({ toleranciaA, nivelReflejoAlpha })
        this.toleranciaH = toleranciaH;
        this.toleranciaS = toleranciaS;
        this.toleranciaV = toleranciaV;
        this.toleranciaTotal = (toleranciaA + toleranciaH + toleranciaS + toleranciaV) / 4
        this.nivelReflejoH = nivelReflejoH;
        this.nivelReflejoS = nivelReflejoS;
        this.nivelReflejoV = nivelReflejoV;
    }

    obtenerComparador(pixelBase) {
        const pixelHvsBase = utiles.colorRgbHvs({
            r: pixelBase.r,
            g: pixelBase.g,
            b: pixelBase.b,
        })
        let hTolerado = this.toleranciaH;
        let sTolerado = this.toleranciaS;
        let vTolerado = this.toleranciaV;
        let aTolerado = 255 * this.toleranciaA;

        let maximoH = pixelHvsBase.h + hTolerado
        let maximoS = pixelHvsBase.s + sTolerado
        let maximoV = pixelHvsBase.v + vTolerado
        let maximoA = pixelBase.a + aTolerado

        let minimoH = pixelHvsBase.h - hTolerado
        let minimoS = pixelHvsBase.s - sTolerado
        let minimoV = pixelHvsBase.v - vTolerado
        let minimoA = pixelBase.a - aTolerado

        let reboteInferiorH = (maximoH > 360) ? maximoH - 360 : 0
        let reboteSuperiorH = (0 > minimoH) ? minimoH + 360 : 360

        return (r, g, b, a) => {
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const v = (max / 255);
            const s = (max === 0 ? 0 : (max - min) / max);
            const delta = max - min;
            let h = 0;
            if (delta !== 0) {
                if (max === r) {
                    h = 60 * ((g - b) / delta);
                } else if (max === g) {
                    h = 120 + 60 * ((b - r) / delta);
                } else {
                    h = 240 + 60 * ((r - g) / delta);
                }
                if (h < 0) {
                    h += 360;
                }
            }

            if (minimoH >= 0 && maximoH <= 360) {
                return (minimoH <= h && h <= maximoH) &&
                    (minimoV <= v && v <= maximoV) &&
                    (minimoS <= s && s <= maximoS) &&
                    (minimoA <= a && a <= maximoA)
            } else {
                if (maximoH > 360) {
                    return ((0 <= h && h <= reboteInferiorH) || (minimoH <= h && h <= 360)) &&
                        (minimoV <= v && v <= maximoV) &&
                        (minimoS <= s && s <= maximoS) &&
                        (minimoA <= a && a <= maximoA)
                } else {
                    return ((0 <= h && h <= maximoH) || (reboteSuperiorH <= h && h <= 360)) &&
                        (minimoV <= v && v <= maximoV) &&
                        (minimoS <= s && s <= maximoS) &&
                        (minimoA <= a && a <= maximoA)
                }
            }

        }
    }

    obtenerEquivalenciaCanales(canalesBase) {
        const hsvBase = utiles.colorRgbHvs({
            r: canalesBase.r,
            g: canalesBase.g,
            b: canalesBase.b,
        })

        return (canalesModificar) => {

            const max = Math.max(canalesModificar.r, canalesModificar.g, canalesModificar.b);
            const min = Math.min(canalesModificar.r, canalesModificar.g, canalesModificar.b);
            const vModificar = max / 255;
            const sModificar = max === 0 ? 0 : (max - min) / max;
            const delta = max - min;
            let hModificar = 0;
            if (delta !== 0) {
                if (max === canalesModificar.r) {
                    hModificar = 60 * ((canalesModificar.g - canalesModificar.b) / delta);
                } else if (max === canalesModificar.g) {
                    hModificar = 120 + 60 * ((canalesModificar.b - canalesModificar.r) / delta);
                } else {
                    hModificar = 240 + 60 * ((canalesModificar.r - canalesModificar.g) / delta);
                }
                if (hModificar < 0) {
                    hModificar += 360;
                }
            }
            const hModificado = (hsvBase.h * (1 - this.nivelReflejoH)) + (hModificar * this.nivelReflejoH)
            const sModificado = (hsvBase.s * (1 - this.nivelReflejoS)) + (sModificar * this.nivelReflejoS)
            const vModificado = (hsvBase.v * (1 - this.nivelReflejoV)) + (vModificar * this.nivelReflejoV)

            const sat = sModificado;
            const val = vModificado;

            const c = val * sat;
            const normH = ((hModificado % 360) + 360) % 360;
            const x = c * (1 - Math.abs(((normH / 60) % 2) - 1));
            const m = val - c;

            let rPrime = 0;
            let gPrime = 0;
            let bPrime = 0;

            if (normH < 60) {
                rPrime = c;
                gPrime = x;
                bPrime = 0;
            } else if (normH < 120) {
                rPrime = x;
                gPrime = c;
                bPrime = 0;
            } else if (normH < 180) {
                rPrime = 0;
                gPrime = c;
                bPrime = x;
            } else if (normH < 240) {
                rPrime = 0;
                gPrime = x;
                bPrime = c;
            } else if (normH < 300) {
                rPrime = x;
                gPrime = 0;
                bPrime = c;
            } else {
                rPrime = c;
                gPrime = 0;
                bPrime = x;
            }

            return {
                r: Math.round((rPrime + m) * 255),
                g: Math.round((gPrime + m) * 255),
                b: Math.round((bPrime + m) * 255),
                alpha: (canalesBase.alpha * (1 - this.nivelReflejoAlpha)) + (canalesModificar.alpha * (this.nivelReflejoAlpha)),
            }

        }
    }
}
class lienzoBase {
    constructor({ largo, alto, id, tipo }) {
        this.largo = largo;
        this.alto = alto;
        this.id = id;
        this.tipo = tipo;
    }

    obtenerBufferSeccionado() {
        const buffer = new Uint32Array(this.obtenerBuffer().buffer);
        const manchaTemporal = {}; // Usamos números crudos para ir a máxima velocidad

        let x0 = 0;
        let y = 0;
        let colorAnterior = buffer[0];

        for (let n = 1; n <= buffer.length; n++) {
            const x = n % this.largo;
            const colorActual = buffer[n];
            const finDeLinea = (x === 0);

            if (colorActual !== colorAnterior || finDeLinea || n === buffer.length) {

                const x1 = finDeLinea && n !== buffer.length ? this.largo - 1 : x - 1;

                if (!manchaTemporal[colorAnterior]) manchaTemporal[colorAnterior] = [];
                manchaTemporal[colorAnterior].push(new tramo(x0, x1, y));

                if (n < buffer.length) {
                    x0 = finDeLinea ? 0 : x;
                    if (finDeLinea) y++;
                    colorAnterior = colorActual;
                }
            }
        }

        const mancha = {};
        const uint32ToHex = (p32) => {
            const r = p32 & 0xFF;
            const g = (p32 >> 8) & 0xFF;
            const b = (p32 >> 16) & 0xFF;
            const a = (p32 >>> 24) & 0xFF;
            return r.toString(16).padStart(2, '0') +
                g.toString(16).padStart(2, '0') +
                b.toString(16).padStart(2, '0') +
                a.toString(16).padStart(2, '0');
        };

        for (const colo32 in manchaTemporal) {
            const hexa = uint32ToHex(Number(colo32));
            mancha[hexa] = manchaTemporal[colo32];
        }

        console.log(mancha);
        return { mancha };
    }

    obtenerManchaInundacion({ cordenada, comparadorPixel, colorComparar }) {
        const buffer = new Uint32Array(this.obtenerBuffer().buffer);
        const estadosPixel = new Uint8Array(this.largo * this.alto);
        const mancha = {};

        const indiceBase = cordenada.y * this.largo + cordenada.x;
        const colorBaseUint32 = (colorComparar) ? utiles.colorRgbaUint32(colorComparar) : buffer[indiceBase];
        const baseObj = {
            r: colorBaseUint32 & 0xFF,
            g: (colorBaseUint32 >> 8) & 0xFF,
            b: (colorBaseUint32 >> 16) & 0xFF,
            a: (colorBaseUint32 >> 24) & 0xFF
        };

        const compararPixel = (comparadorPixel) ? comparadorPixel.obtenerComparador(baseObj) : () => { return false }
        const obtenerPixel = (x, y) => {
            const p32 = buffer[y * this.largo + x];
            return {
                r: p32 & 0xFF,
                g: (p32 >> 8) & 0xFF,
                b: (p32 >> 16) & 0xFF,
                a: (p32 >> 24) & 0xFF
            };
        };
        const pixelValido = (indice) => {
            const p32 = buffer[indice];
            if (p32 === colorBaseUint32) return true;
            return compararPixel(
                p32 & 0xFF,
                (p32 >> 8) & 0xFF,
                (p32 >> 16) & 0xFF,
                (p32 >> 24) & 0xFF
            );
        };
        const tramoHorizontalidad = (x, y) => {
            let pixelTramoBase = this.largo * y + x;
            if (estadosPixel[pixelTramoBase] !== 0) return false;
            estadosPixel[pixelTramoBase] = 1;
            if (!pixelValido(pixelTramoBase)) return false;

            let indiceX0 = pixelTramoBase;
            let indiceX1 = pixelTramoBase;
            let x0 = x;
            let x1 = x;
            let yTramo = y;

            while (x0 > 0) {
                indiceX0--;
                estadosPixel[indiceX0] = 1;
                if (!pixelValido(indiceX0)) break;
                x0--;
            }

            while (this.largo > x1) {
                indiceX1++;
                estadosPixel[indiceX1] = 1;
                if (!pixelValido(indiceX1)) break;
                x1++;
            }

            let x0Color = x0;
            let pixelAnterior = utiles.colorRgbaHexa(obtenerPixel(x0, y));

            for (let n = x0 + 1; n <= x1; n++) {
                const pixelActual = utiles.colorRgbaHexa(obtenerPixel(n, y));

                if (pixelAnterior !== pixelActual) {
                    if (!mancha[pixelAnterior]) mancha[pixelAnterior] = [];
                    mancha[pixelAnterior].push(new tramo(x0Color, n - 1, yTramo));

                    x0Color = n;
                    pixelAnterior = pixelActual;
                }
            }

            if (!mancha[pixelAnterior]) mancha[pixelAnterior] = [];
            mancha[pixelAnterior].push(new tramo(x0Color, x1, yTramo));

            return new tramo(x0, x1, yTramo);
        };

        const tramoVerticalidad = (tramo) => {
            const tramosEncontrados = [];
            for (let x = tramo.x0; x <= tramo.x1; x++) {
                if (tramo.y > 0) {
                    const yBajo = tramoHorizontalidad(x, tramo.y - 1);
                    if (yBajo) tramosEncontrados.push(yBajo);
                }
                if (tramo.y + 1 < this.alto) {
                    const yAlto = tramoHorizontalidad(x, tramo.y + 1);
                    if (yAlto) tramosEncontrados.push(yAlto);
                }
            }
            return tramosEncontrados;
        };

        const tramoInicial = tramoHorizontalidad(cordenada.x, cordenada.y);
        let listaTramos = tramoInicial ? [tramoInicial] : [];

        while (listaTramos.length) {
            let nuevosTramos = [];

            for (let i = 0; i < listaTramos.length; i++) {
                let tramosAgregados = tramoVerticalidad(listaTramos[i]);
                for (const tramo of tramosAgregados) {
                    nuevosTramos.push(tramo);
                }
            }

            listaTramos = nuevosTramos;
        }

        console.log(mancha)
        return {
            mancha,
            colorBase: utiles.colorRgbaHexa(baseObj)
        };
    }
}
class lienzoHtml extends lienzoBase {
    constructor({ largo, alto, canvas, muchaLectura, id, tipo }) {
        super({ largo, alto, id, tipo })
        if (canvas) {
            this.canvas = canvas;
        } else {
            this.canvas = document.createElement('canvas')
        }
        if (!muchaLectura) {
            this.ctx = this.canvas.getContext('2d')
        } else {
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })
        }
        this.canvas.width = this.largo
        this.canvas.height = this.alto
    }
    modosPegado = {
        normal: 'source-over',
        borrar: 'destination-out',
        multiplicar: 'multiply',
        oscurecer: 'darken',
        iluminar: 'lighter',
        aclarar: 'lighten',
        diferencia: 'difference',
        recortar: 'source-atop',
        setear: 'sourece-in',
    }

    pegarLienzo({ lienzo, x, y, rotacion = 0, xPivote = 0, yPivote = 0, largo = lienzo.largo, alto = lienzo.alto, alpha = 1, modoPegado = 'normal' }) { // pegar en ESTE lienzo}
        if (alpha === 0) return
        let guardar = modoPegado !== 'normal' ? this.modosPegado[modoPegado] : false
        guardar = guardar || alpha !== 1 || rotacion !== 0 || xPivote !== 0 || yPivote !== 0;

        if (guardar) {
            this.ctx.save();
            if (alpha !== 1) this.ctx.globalAlpha = alpha;
            if (modoPegado) this.ctx.globalCompositeOperation = this.modosPegado[modoPegado];
            if (rotacion !== 0) {
                if (xPivote !== 0 || yPivote !== 0)
                    this.ctx.translate(x + xPivote, y + yPivote)
                this.ctx.rotate(rotacion);
            }
        }
        this.ctx.drawImage(
            lienzo.canvas,
            rotacion === 0 ? x : - xPivote,
            rotacion === 0 ? y : - yPivote,
            largo,
            alto
        );
        if (guardar)
            this.ctx.restore()
    }
    redimMantImg({ u, r, d, l }) {
        const canvasProvisional = document.createElement('canvas')
        canvasProvisional.width = this.largo;
        canvasProvisional.height = this.alto;
        canvasProvisional.getContext('2d').drawImage(this.canvas, 0, 0);
        this.canvas.width = this.largo + r + l
        this.canvas.height = this.alto + u + d
        this.ctx.drawImage(canvasProvisional, l, u)
    }
    pintarPixel({ x, y, r, g, b, a }) {
        this.ctx.fillStyle = 'rgba(' + r + ' , ' + g + ' , ' + b + ' , ' + a + ')';
        this.ctx.fillRect(x, y, 1, 1)
    }
    limpiarPixel({ x, y }) {
        this.ctx.clearRect(x, y, 1, 1)
    }
    pintarLinea({ x1, y1, x2, y2, grosor, r, g, b, a }) {
        this.ctx.lineWidth = grosor;
        this.ctx.strokeStyle = 'rgba(' + r + ' , ' + g + ' , ' + b + ' , ' + a + ')';
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1)
        this.ctx.lineTo(x2, y2)
        this.ctx.stroke();
    }
    limpiarRectangulo({ x, y, largo, alto }) {
        this.ctx.clearRect(x, y, largo, alto);
    }
    pintarRectangulo({ x, y, largo, alto, r, g, b, a }) {
        this.ctx.fillStyle = 'rgba(' + r + ' , ' + g + ' , ' + b + ' , ' + a + ')';
        this.ctx.fillRect(x, y, largo, alto)
    }
    pintarElipse({ x, y, largo, alto, r, g, b, a, rotacion, inicio, fin }) {
        this.ctx.fillStyle = 'rgba(' + r + ' , ' + g + ' , ' + b + ' , ' + a + ')';
        let radioX = Math.abs(largo) / 2;
        let radioY = Math.abs(alto) / 2;

        let centroX = x + radioX;
        let centroY = y + radioY;
        this.ctx.beginPath();
        this.ctx.ellipse(
            centroX,
            centroY,
            radioX,
            radioY,
            rotacion,
            inicio,
            fin
        );
        this.ctx.fill();
    }
    limpiarElipse({ x, y, largo, alto, rotacion, inicio, fin }) {
        this.ctx.fillStyle = 'rgba(255 , 255 , 255 , 1)';
        this.ctx.globalCompositeOperation = "destination-out";
        let radioX = Math.abs(largo) / 2;
        let radioY = Math.abs(alto) / 2;

        let centroX = x + radioX;
        let centroY = y + radioY;

        this.ctx.beginPath();
        this.ctx.ellipse(
            centroX,
            centroY,
            radioX,
            radioY,
            rotacion,
            inicio,
            fin
        );
        this.ctx.fill();
        this.ctx.globalCompositeOperation = "source-over";
    }
    pintarTrayectoLineas({ puntoInicialX = 0, puntoInicialY = 0, trayecto, grosor, r, g, b, a, inicioTrayecto, finTrayecto }) {
        if (trayecto.length > 1) {
            this.ctx.lineWidth = grosor;
            this.ctx.strokeStyle = 'rgba(' + r + ' , ' + g + ' , ' + b + ' , ' + a + ')';
            this.ctx.beginPath();
            for (let i = inicioTrayecto; i < finTrayecto; i++) {
                this.ctx.moveTo(trayecto[i].x + puntoInicialX, trayecto[i].y + puntoInicialY)
                this.ctx.lineTo(trayecto[i + 1].x + puntoInicialX, trayecto[i + 1].y + puntoInicialY)
            }
            this.ctx.stroke();
        }
    }
    pintarTrayectoCirculo({ puntoInicialX = 0, puntoInicialY = 0, trayecto, radio, r, g, b, a, rotacion, inicio, fin, inicioTrayecto, finTrayecto }) {
        if (trayecto.length > 0) {
            this.ctx.fillStyle = 'rgba(' + r + ' , ' + g + ' , ' + b + ' , ' + a + ')';
            this.ctx.beginPath();
            for (let i = inicioTrayecto; i <= finTrayecto; i++) {
                this.ctx.moveTo(trayecto[i].x + puntoInicialX, trayecto[i].y + puntoInicialY)
                this.ctx.ellipse(
                    trayecto[i].x + puntoInicialX,
                    trayecto[i].y + puntoInicialY,
                    radio,
                    radio,
                    rotacion,
                    inicio,
                    fin
                );
            }
            this.ctx.fill();
        }
    }
    pintarCirculo({ x, y, radio, r, g, b, a, rotacion, inicio, fin }) {
        this.ctx.fillStyle = 'rgba(' + r + ' , ' + g + ' , ' + b + ' , ' + a + ')';
        this.ctx.beginPath();
        this.ctx.ellipse(
            x,
            y,
            radio,
            radio,
            rotacion,
            inicio,
            fin
        );
        this.ctx.fill();
    }
    limpiarCirculo({ x, y, radio, rotacion, inicio, fin }) {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.fillStyle = 'rgba(255 , 255 , 255 , 1)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            x,
            y,
            radio,
            radio,
            rotacion,
            inicio,
            fin
        );
        this.ctx.fill();
        this.ctx.globalCompositeOperation = "source-over";
    }
    limpiar() {
        this.ctx.clearRect(0, 0, this.largo, this.alto)
    }
    redimenzionar(largo, alto) {
        this.largo = largo;
        this.alto = alto;
        this.canvas.width = largo;
        this.canvas.height = alto;
    }
    obtenerPixel({ x, y }) {
        const pixel = this.ctx.getImageData(x, y, 1, 1).data;

        return {
            r: pixel[0],
            g: pixel[1],
            b: pixel[2],
            a: pixel[3]
        };
    }
    obtenerSeccionBuffer({ alto, largo, x, y }) {
        return this.ctx.getImageData(x, y, largo, alto)
    }
    obtenerBuffer() {
        return this.ctx.getImageData(0, 0, this.largo, this.alto).data
    }
    insertarSeccionBuffer({ buffer, x, y }) {
        this.ctx.putImageData(buffer, x, y);
    }
    cambiarCanalSeccion({ seccion, condicion, cambios }) {

        const imageData = this.obtenerSeccionBuffer(seccion)
        const buffer = imageData.data
        // this.recorrerBuffer(buffer , condicion , cambios)
        for (let i = 0; i < buffer.length; i += 4) {
            const r = buffer[i];
            const g = buffer[i + 1];
            const b = buffer[i + 2];
            const a = buffer[i + 3];
            if (condicion({ r, g, b, a })) {
                const nuevoPx = cambios({ r, g, b, a })
                buffer[i] = nuevoPx.r;
                buffer[i + 1] = nuevoPx.g;
                buffer[i + 2] = nuevoPx.b;
                buffer[i + 3] = nuevoPx.a;
            }
        }

        this.insertarSeccionBuffer({ buffer: imageData, x: seccion.x, y: seccion.y });
    }
}

const lienzos = {
    contadorLienzos: 0,
    obtener({ largo, alto, canvas, muchaLectura = true, tipo = 'permanente' }) {// faltan lienzos, por ahora solo el lienzoPlano pero si agregase react native faltaria ese tambien ,
        //  todos deben tener las mismas funciones , porlomenos las que ese usen al dibujar
        //   console.log('num lien crea : ', this.contadorLienzos)
        //  console.log(' max ram  : ', ((largo * alto * 8 * this.contadorLienzos) / 1048576).toFixed(2), 'MB')// es por 8 para no meter un * 2 * mas 
        this.contadorLienzos++;
        console.log(this.contadorLienzos)
        return new lienzoHtml({
            largo,
            alto,
            canvas,
            muchaLectura,
            id: this.contadorLienzos,
            tipo // temporal o permanente , ya
        })
    },
    acomodar({ lienzo, alto, largo, limpiar }) {
        if (lienzo.largo !== largo || lienzo.alto !== alto) {
            lienzo.redimenzionar(largo, alto)
        } else {
            if (limpiar !== false) lienzo.limpiar();
        }

    }
}