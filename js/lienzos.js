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
class manchaLienzo { // eliminar o  adaptar para otra cosa, muy pesado para uso original
    constructor(tramos, color) {
        this.tramos = {}
        this.color = color

        this.x0 = undefined;
        this.x1 = undefined;
        this.y0 = undefined;
        this.y1 = undefined;

        this.agregarTramos(tramos)
    }
    agregarTramos(tramos) {
        for (const tramo of tramos) {
            this.agregarTramo(tramo)
        }
    }
    agregarTramo(tramo) {
        if (!this.tramos[tramo.y]) this.tramos[tramo.y] = []
        this.tramos[tramo.y].push(tramo)
        if (this.x0 !== undefined &&
            this.y0 !== undefined &&
            this.x1 !== undefined &&
            this.y1 !== undefined) {

            this.x0 = Math.min(tramo.x0, this.x0)
            this.y0 = Math.min(tramo.y, this.y0)
            this.x1 = Math.max(tramo.x1, this.x1)
            this.y1 = Math.max(tramo.y, this.y1)
        } else {
            this.x0 = tramo.x0
            this.y0 = tramo.y
            this.x1 = tramo.x1
            this.y1 = tramo.y
        }
    }
    actualizarDelimitadores() {
        if (this.tramos.length < 1) return
        const listaTramos = Object.keys(this.tramos)
        this.x0 = this.tramos[listaTramos.length - 1].x0
        this.y0 = this.tramos[listaTramos.length - 1].y
        this.x1 = this.tramos[listaTramos.length - 1].x1
        this.y1 = this.tramos[listaTramos.length - 1].y

        for (const actual of listaTramos) {
            this.x0 = Math.min(this.x0, this.tramos[actual].x0)
            this.x1 = Math.max(this.x1, this.tramos[actual].x1)
            this.y0 = Math.min(this.y0, this.tramos[actual].y)
            this.y1 = Math.max(this.y1, this.tramos[actual].y)
        }

    }
    manchaEnArea(mancha) {
        if (mancha.y0 > this.y1 + 1 || this.y0 > mancha.y1 + 1) return false

        if (mancha.x0 > this.x1 + 1 || this.x0 > mancha.x1 + 1) return false

        return true
    }
    manchaFronteriza(mancha) {
        if (!this.manchaEnArea(mancha)) return false
        const y0 = Math.max(mancha.y0 - 1, this.y0 - 1);
        const y1 = Math.min(mancha.y1 + 1, this.y1 + 1);

        for (let i = y0; i <= y1; i++) {
            const fila = this.tramos[i]
            if (!fila) continue
            for (const tramo of fila) {
                for (let n = y0; n <= y1; n++) {
                    const fila = this.tramos[n]
                    if (!fila) continue
                    for (const tramoComparar of fila) {
                        if (tramo.tramoFronterizo(tramoComparar)) return true;
                    }
                }

            }
        }
    }
    tramoPerteneciente(tramo) {
        for (const tramoComprabar of this.tramos) {
            if (tramo.tramoFronterizo(tramoComprabar)) return true
        }
        return false
    }
    agregarTramosMancha(mancha) {
        for (let i = mancha.y0; i <= mancha.y1; i++) {
            const linea = mancha.tramos[i];
            if (!linea) continue
            for (const tramo of linea) {
                this.agregarTramo(tramo)
            }
        }
    }
    tramoEnArea(tramo) {
        if (tramo.y < this.y0 - 1 || tramo.y > this.y1 + 1) return false;
        if (tramo.x1 < this.x0 - 1 || tramo.x0 > this.x1 + 1) return false;

        return true;
    }
    tramoFronterizo(tramoComprobar) {
        if (!this.tramoEnArea(tramoComprobar)) return false
        for (let i = tramoComprobar.y - 1; i <= tramoComprobar.y + 1; i++) {
            const fila = this.tramos[i]
            if (!fila) continue
            for (const tramo of fila) {
                if (tramoComprobar.tramoFronterizo(tramo)) return true
            }
        }
    }
    recorrerTramos(inicio = this.y0, fin = this.y1, accion) {

        for (let i = inicio; i <= fin; i++) {
            const fila = this.tramos[i]
            if (!fila) continue
            for (const tramo of fila) {
                if (accion(tramo)) return true
            }
        }
        return false
    }
    obtenerTramosPlano() {
        const tramosPlano = []
        for (let i = this.y0; i <= this.y1; i++) {
            for (const tramo of this.tramos[i]) {
                tramosPlano.push(tramo)
            }
        }
        return tramosPlano
    }
}
class grupoManchas {
    constructor() {
        this.manchas = []
    }
    agregarMancha(tramos, color) {
        const nuevaMancha = new manchaLienzo(tramos, color)
        this.manchas.push(nuevaMancha)
        return nuevaMancha
    }
    agregarTramo(tramo, color, manchasComparar) {
        const manchasCompatibles = []
        for (const mancha of manchasComparar) {
            if (mancha.color !== color) continue
            if (!mancha.tramoEnArea(tramo)) continue
            if (mancha.tramoFronterizo(tramo)) {
                if (!manchasCompatibles.includes(mancha))
                    manchasCompatibles.push(mancha)
            }
        }
        if (manchasCompatibles.length === 1) {
            manchasCompatibles[0].agregarTramo(tramo)
            return manchasCompatibles[0]
        }

        if (manchasCompatibles.length > 1) {
            const manchaPrincipal = manchasCompatibles[0]
            manchaPrincipal.agregarTramo(tramo)

            for (let i = 1; i < manchasCompatibles.length; i++) {
                const manchaSecundaria = manchasCompatibles[i]
                manchaPrincipal.agregarTramosMancha(manchaSecundaria)

                const indiceBorrar = this.manchas.indexOf(manchaSecundaria)
                if (indiceBorrar !== -1)
                    this.manchas.splice(indiceBorrar, 1)

                for (let j = 0; j < manchasComparar.length; j++) {
                    if (manchasComparar[j] === manchaSecundaria) manchasComparar[j] = manchaPrincipal
                }
            }

            return manchaPrincipal
        }

        return this.agregarMancha([tramo], color)
    }
    obtenerManchaClick(cord) {
        for (const mancha of this.manchas) {
            if (mancha.x0 <= cord.x && cord.x <= mancha.x1 &&
                mancha.y0 <= cord.y && cord.y <= mancha.y1) {

                const fila = mancha.tramos[cord.y]
                if (!fila) continue
                for (const tramo of fila) {
                    if (cord.x >= tramo.x0 && cord.x <= tramo.x1) return mancha
                }
            }
        }
    }
    obtenerManchasFronterizas(mancha) {
        const manchasFronterizas = []
        for (const manchaActual of this.manchas) {
            if (manchaActual === mancha) continue
            if (mancha.manchaFronteriza(manchaActual))
                manchasFronterizas.push(manchaActual);
        }
        return manchasFronterizas
    }
}
class comparadorPixel {
    constructor({ toleranciaA = 0, nivelReflejoAlpha = 0 }) {
        this.toleranciaA = toleranciaA;
        this.nivelReflejoAlpha = nivelReflejoAlpha;

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
        let manchasLineaAnterior = []
        let manchasLineaActual = []

        const buffer = this.obtenerBuffer();
        const buffer32 = new Uint32Array(buffer.buffer);
        let pixelActual = 0;
        const lienzoSeccionado = new grupoManchas();

        for (let y = 0; y < this.alto; y++) {
            let colorActual = buffer32[pixelActual]
            let x0 = 0;

            for (let x = 0; x < this.largo; x++) {
                const px = buffer32[pixelActual]

                if (px !== colorActual) {
                    manchasLineaActual.push(
                        lienzoSeccionado.agregarTramo(
                            new tramo(x0, x - 1, y),
                            colorActual,
                            manchasLineaAnterior
                        ))

                    colorActual = px;
                    x0 = x;
                }
                pixelActual += 1;
            }
            manchasLineaActual.push(
                lienzoSeccionado.agregarTramo(
                    new tramo(x0, this.largo - 1, y),
                    colorActual,
                    manchasLineaAnterior
                ));

            manchasLineaAnterior = manchasLineaActual;
            manchasLineaActual = []
        }

        return lienzoSeccionado;
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
    modosPegado = { // por nada del mundo agregar source-in
        normal: 'source-over',
        borrar: 'destination-out',
        multiplicar: 'multiply',
        oscurecer: 'darken',
        iluminar: 'lighter',
        aclarar: 'lighten',
        diferencia: 'difference',
        recortar: 'source-atop',
    }

    pegarLienzo({ lienzo, x, y, alpha, modoPegado }) { // pegar en ESTE lienzo
        if (alpha !== undefined || modoPegado)
            if (alpha !== undefined || this.modosPegado[modoPegado])
                this.ctx.save();

        if (alpha !== undefined)
            this.ctx.globalAlpha = alpha;

        if (modoPegado)
            if (this.modosPegado[modoPegado])
                this.ctx.globalCompositeOperation = this.modosPegado[modoPegado];

        this.ctx.drawImage(lienzo.canvas, x, y)

        if (alpha !== undefined || modoPegado)
            if (alpha !== undefined || this.modosPegado[modoPegado])
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
    pintarTrayectoLineas({ trayecto, grosor, r, g, b, a }) {
        if (trayecto.length > 1) {
            this.ctx.lineWidth = grosor;
            this.ctx.strokeStyle = 'rgba(' + r + ' , ' + g + ' , ' + b + ' , ' + a + ')';
            this.ctx.beginPath();
            for (let i = 0; i < trayecto.length - 1; i++) {
                this.ctx.moveTo(trayecto[i].x, trayecto[i].y)
                this.ctx.lineTo(trayecto[i + 1].x, trayecto[i + 1].y)
            }
            this.ctx.stroke();
        }
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
            //console.trace((limpiar !== false))
            if (limpiar !== false) lienzo.limpiar();
        }

    }
}