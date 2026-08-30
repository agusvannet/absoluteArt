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

class lienzoBase {
    constructor({ largo, alto, id, tipo }) {
        this.largo = largo;
        this.alto = alto;
        this.id = id;
        this.tipo = tipo
    }

    obtenerBuffer() {
        console.log("nomas para q se vea , lo devuelve completo , desde el primer hasta el ultimo pixel,  no es seccion")
    }

    obtenerBufferSeccionado() {
        console.log("obteniendo buffer seccionado xd")
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

    obtenerManchaInundacion({ cordenada, sensibilidad = () => { return false } }) {
        const buffer = this.obtenerBuffer()
        const estadosPixel = new Uint8Array(buffer.length / 4)
        const mancha = {}
        const obtenerPixel = (x, y) => {
            let ubicacion = (y * this.largo + x) * 4;
            return {
                r: buffer[ubicacion],
                g: buffer[ubicacion + 1],
                b: buffer[ubicacion + 2],
                a: buffer[ubicacion + 3],
            }
        }
        const colorBase = obtenerPixel(cordenada.x, cordenada.y)
        const pixelValido = (pixel) => {
            if (pixel.r === colorBase.r &&
                pixel.g === colorBase.g &&
                pixel.b === colorBase.b &&
                pixel.a === colorBase.a) {
                return true;
            }
            return sensibilidad({
                r: pixel.r,
                g: pixel.g,
                b: pixel.b,
                a: pixel.a,
                colorBase
            })
        }

        const tramoHorizontalidad = (x, y) => { // aca va lo de acomodar la tolerancia, sino aunque sea tolerado se agrega como mismo color
            let pixelTramoBase = this.largo * y + x
            if (estadosPixel[pixelTramoBase] !== 0) return false
            estadosPixel[pixelTramoBase] = 1
            if (!pixelValido(obtenerPixel(x, y))) return false
            let indiceX0 = pixelTramoBase;
            let indiceX1 = pixelTramoBase;
            let x0 = x;
            let x1 = x;
            let yTramo = y;

            while (x0 > 0) {
                indiceX0--;
                estadosPixel[indiceX0] = 1
                if (!pixelValido(obtenerPixel(x0 - 1, y))) break;
                x0--;
            }

            while (this.largo > x1) {
                indiceX1++
                estadosPixel[indiceX1] = 1
                if (!pixelValido(obtenerPixel(x1 + 1, y))) break;
                x1++
            }

            let x0Color = x0;
            let x1Color = x0;
            let pixelAnterior = obtenerPixel(x0, y)
            for (let n = x0; n <= x1; n++) {
                const pixelActual = obtenerPixel(n, y);

                if (pixelAnterior !== pixelActual) {
                    const colorTramo = utiles.colorRgbaHexa({
                        r: pixelAnterior.r,
                        g: pixelAnterior.g,
                        b: pixelAnterior.b,
                        a: pixelAnterior.a
                    })
                    if (!mancha[colorTramo]) mancha[colorTramo] = []
                    mancha[colorTramo].push(tramoAgregar)
                }
            }
            return new tramo(x0, x1, yTramo)
        }
        const tramoVerticalidad = (tramo) => {
            const tramosEncontrados = []
            for (let x = tramo.x0; x <= tramo.x1; x++) {
                if (tramo.y > 0) {
                    const yBajo = tramoHorizontalidad(x, tramo.y - 1)
                    if (yBajo) tramosEncontrados.push(yBajo)
                }
                if (tramo.y + 1 < this.alto) {
                    const yAlto = tramoHorizontalidad(x, tramo.y + 1)
                    if (yAlto) tramosEncontrados.push(yAlto)
                }
            }
            return tramosEncontrados
        }
        const tramoInicial = tramoHorizontalidad(cordenada.x, cordenada.y);
        let listaTramos = [tramoInicial]
        while (listaTramos.length) {
            let nuevosTramos = []

            for (let i = 0; i < listaTramos.length; i++) {
                let tramosAgregados = tramoVerticalidad(listaTramos[i])
                for (const tramo of tramosAgregados) {
                    nuevosTramos.push(tramo)
                }
            }

            listaTramos = nuevosTramos;
        }
        return {
            mancha,
            colorBase: utiles.colorRgbaHexa({
                r: colorBase.r,
                g: colorBase.g,
                b: colorBase.b,
                a: colorBase.a
            })
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
        console.log({ x, y, r, g, b, a })
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
    limpiarCirculo({ x, y, radio, r, g, b, a, rotacion, inicio, fin }) {
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
class capaBase {
    constructor(capaPadre, idCapa, lienzo) {
        this.lienzo = lienzo
        this.id = idCapa
        this.capaPadre = capaPadre;
    }
    x = 0;
    y = 0;
    visible = true;
    opacidad = 1;
    renderizar(lienzo) {
        if (!this.visible || this.opacidad === 0) return
        lienzo.pegarLienzo({ lienzo: this.lienzo, x: this.x, y: this.y, alpha: this.opacidad })
    }

    cambiarOpacidad(nuevaOpacidad) {
        this.opacidad = nuevaOpacidad
        if (this.capaPadre) this.capaPadre.preRenderizar();
    }
}
class grupoCapas extends capaBase {
    constructor({ capaPadre, idCapa, lienzo }) {
        super(capaPadre, idCapa, lienzo)
        this.nombre = 'grupo ' + idCapa
    }
    tipoCapa = 'grupo';
    contenido = [];
    preRenderizar() {
        if (this.contenido.length === 0) return
        this.lienzo.limpiar()
        for (const capa of this.contenido) {
            capa.renderizar(this.lienzo);
        }

        let padreActual = this.capaPadre
        let contador = 1;// borrar luego de probar rendimiento
        while (padreActual) {
            padreActual.preRenderizar()
            padreActual = padreActual.capaPadre;
            contador++;
        }
    }
    dividirCapas({ capa }) {
        let capaEncontrada = false;
        let anteriores = [];
        let posteriores = [];
        for (const capaActual of this.contenido) {
            if (capaEncontrada) posteriores.push(capaActual);
            if (capaActual === capa) capaEncontrada = true
            if (!capaEncontrada) anteriores.push(capaActual);
        }
        return { anteriores, posteriores }
    }
    buscarCapa(id) {
        if (this.contenido.length > 0) {
            for (const lugar of this.contenido) {
                if (lugar.tipoCapa === 'individual' && lugar.id === id) {
                    return lugar;
                }
                if (lugar.contenido) {
                    const encontrado = lugar.buscarCapa(id);
                    if (encontrado !== undefined) return encontrado;
                }
            }
        }
    }
    buscarGrupoCapas(id) { // arreglar lo de la ubicacion absolute de lienzoPrincipal , no deberian manejar absolutez en ningun contexto sin importar que 
        if (id === 0) {
            let capaPadre = this
            while (capaPadre.capaPadre) {
                capaPadre = capaPadre.capaPadre
            }
            return capaPadre
        }
        if (this.contenido.length > 0) {
            for (const lugar of this.contenido) {
                if (lugar.tipoCapa === 'grupo' && lugar.id === id) {
                    return lugar;
                }
                if (lugar.contenido) {
                    const encontrado = lugar.buscarGrupoCapas(id, lugar);
                    if (encontrado) return encontrado;
                }
            }
        }
    }
    agregarCapa({ capaPadre, idCapa, lienzo, frecuenciaCapturas, trayectoMuyLargo, limiteCapturasHistorial }) {
        const nuevaCapa = new capa({
            capaPadre,
            idCapa,
            lienzo,
            frecuenciaCapturas,
            trayectoMuyLargo,
            limiteCapturasHistorial
        })
        this.contenido.push(nuevaCapa);
        return nuevaCapa;
    }
    agregarGrupoCapas({ capaPadre, idCapa, lienzo }) {
        const nueveGrupo = new grupoCapas({
            capaPadre,
            idCapa,
            lienzo
        });
        this.contenido.push(nueveGrupo);

        return nueveGrupo;
    }
    eliminarCapa(id) {
        let cont = 0;
        while (cont < this.contenido.length) {
            if (this.contenido[cont].id === id && this.contenido[cont].tipoCapa === "individual") {
                this.contenido.splice(cont, 1)
                return true;
            }
            cont++;
        }
        return false;
    }
    eliminarGrupoCapas(id) {
        let cont = 0;
        while (cont < this.contenido.length) {
            if (this.contenido[cont].id === id && this.contenido[cont].tipoCapa === "grupo") {
                this.contenido.splice(cont, 1)
                return true;
            }
            cont++;
        }
        return false;
    }
    moverCapaIndice(capa, nuevoIndice) {
        let i = 0;
        let movida = false;
        while (i < this.contenido.length && !movida) {
            if (this.contenido[i] === capa) {
                this.contenido.splice(i, 1)
                this.contenido.splice(nuevoIndice, 0, capa)
                movida = true;
            }
            i++;
        }
    }
    moverCapaDeGrupo(capa, nuevoGrupo) {
        if (capa?.capaPadre !== nuevoGrupo && capa !== undefined && nuevoGrupo !== undefined) {
            if (capa.tipoCapa == 'grupo') {
                capa.capaPadre.eliminarGrupoCapas(capa.id)
            } else {
                capa.capaPadre.eliminarCapa(capa.id)
            }
            capa.capaPadre = nuevoGrupo;
            nuevoGrupo.contenido.push(capa)
        }
    }
    obtenerIndiceCapa(capa) {
        if (capa) {
            for (let i = 0; i < this.contenido.length; i++) {
                if (this.contenido[i] === capa) {
                    return i;
                }
            }
        }
    }
    clonar(capaPadre, idCopia) {
        const clonCapa = new grupoCapas({
            capaPadre,
            idCapa: idCopia,
            lienzo: lienzos.obtener({
                largo: this.lienzo.largo,
                alto: this.lienzo.alto
            }),
        }
        )

        clonCapa.lienzo.pegarLienzo({ lienzo: this.lienzo, y: 0, x: 0 })
        clonCapa.x = this.x
        clonCapa.y = this.y
        clonCapa.opacidad = this.opacidad
        clonCapa.visible = this.visible


        clonCapa.nombre = this.nombre + ' (copia)'
        return clonCapa;
    }
    clonarCapa(id, capa) {
        const clon = capa.clonar(this, id)
        this.contenido.push(clon)
        return clon
    }

}
class capa extends capaBase {
    constructor({ capaPadre, idCapa, lienzo, frecuenciaCapturas, trayectoMuyLargo, limiteCapturasHistorial }) {
        super(capaPadre, idCapa, lienzo)
        this.historial = new historial(
            frecuenciaCapturas,
            trayectoMuyLargo,
            limiteCapturasHistorial,
            lienzo
        );
        this.nombre = 'capa ' + idCapa
    }
    tipoCapa = 'individual';
    editable = true;
    opacidad = 1;
    guardarTrazo(trazo) {
        if (!this.editable) return
        this.historial.guardarHistorial(trazo);
    }
    revertirTrazo() {
        if (!this.editable) return
        if (this.historial.revertirTrazo()) this.capaPadre.preRenderizar()
    }
    recuperarTrazo() {
        if (!this.editable) return
        if (this.historial.recuperarTrazo()) this.capaPadre.preRenderizar()
    }
    clonar(capaPadre, idCopia) {
        const clonCapa = new capa({
            capaPadre: capaPadre,
            idCapa: idCopia,
            lienzo: lienzos.obtener({
                largo: this.lienzo.largo,
                alto: this.lienzo.alto
            }),
            frecuenciaCapturas: this.historial.frecuenciaTrazos,
            trayectoMuyLargo: this.historial.trayectoMuyLargo,
            limiteCapturasHistorial: this.historial.limiteCapturasHistorial
        }
        )

        const copiaArrays = this.historial.clonarArrays();

        clonCapa.historial.trazosRevertidos = copiaArrays.trazosRevertidos
        clonCapa.historial.historialTrazos = copiaArrays.historialTrazos
        clonCapa.historial.historialCapturas = copiaArrays.historialCapturas
        clonCapa.historial.lienzo = clonCapa.lienzo

        clonCapa.lienzo.pegarLienzo({ lienzo: this.lienzo, x: 0, y: 0 })
        clonCapa.x = this.x
        clonCapa.y = this.y
        clonCapa.opacidad = this.opacidad
        clonCapa.visible = this.visible
        clonCapa.editable = this.editable

        clonCapa.nombre = this.nombre + ' (copia)'
        return clonCapa;
    }
}
class historial {
    constructor(frecuenciaCapturas, trayectoMuyLargo, limiteCapturasHistorial, lienzo) {
        this.frecuenciaTrazos = frecuenciaCapturas;// de base son 10
        this.trayectoMuyLargo = trayectoMuyLargo; // de base son 1k
        this.limiteCapturasHistorial = limiteCapturasHistorial; // de base son 10
        this.lienzo = lienzo;
    }
    trazosRevertidos = [];
    historialTrazos = [];
    historialCapturas = []; // {captura:, indice:}

    revertirTrazo() { // NO VEO RAZON PARA QUE NO FUNCIONE
        if (this.historialTrazos.length === 0) return false
        this.lienzo.limpiar()
        this.trazosRevertidos.push(this.historialTrazos[this.historialTrazos.length - 1])
        if (this.historialCapturas.length > 0) {
            if (this.historialCapturas[this.historialCapturas.length - 1].indice > this.historialTrazos.length - 1) {
                this.historialCapturas.pop();

            }
        }
        this.historialTrazos.pop()
        this.pintarHistorial(this.lienzo);
        return true

    }
    recuperarTrazo() {
        if (this.trazosRevertidos.length === 0) return false
        this.historialTrazos.push(this.trazosRevertidos[this.trazosRevertidos.length - 1])
        this.trazosRevertidos.pop();
        pintor.dibujar(this.lienzo, this.historialTrazos[this.historialTrazos.length - 1])
        return true
    }
    guardarHistorial(trazo) {
        this.guardarTrazo(trazo);
        pintor.dibujar(this.lienzo, trazo)
        if (this.debeGuardarCaptura(trazo)) {
            this.guardarCaptura(trazo);
        }
    }
    guardarTrazo(trazo) {
        this.trazosRevertidos = [];
        this.historialTrazos.push(trazo)
    }
    pintarHistorial() {
        if (this.historialTrazos.length > 0) {
            this.lienzo.limpiar()
            this.cargarUltimaCaptura();

            const cantTrazos = this.trazosDesdeUltimaCaptura();
            const trazos = this.historialTrazos;
            for (let i = 0; i < cantTrazos; i++) {
                const indiceTrazo = trazos.length - cantTrazos + i;
                const trazoActual = trazos[indiceTrazo];
                pintor.dibujar(this.lienzo, trazoActual)
            }
        }
    }
    guardarCaptura() {
        const canvasTrucho = lienzos.obtener({ largo: this.lienzo.largo, alto: this.lienzo.alto })
        canvasTrucho.pegarLienzo({ lienzo: this.lienzo, x: 0, y: 0 })
        this.historialCapturas.push({ captura: canvasTrucho, indice: this.historialTrazos.length })

        if (this.historialCapturas.length > this.limiteCapturasHistorial) {
            this.historialCapturas.splice(0, 1)
        }
    }
    debeGuardarCaptura(trazo) {
        let guardarEstado = false;
        if (this.trazosDesdeUltimaCaptura() >= this.frecuenciaTrazos ||
            pintor.trazoComplejo(trazo) ||
            this.historialCapturas.length == 0 && this.historialTrazos.length >= this.frecuenciaTrazos) {
            guardarEstado = true;
        }
        return guardarEstado;
    }
    renderizarUltimaCaptura(lienzo) {
        if (this.historialCapturas.length > 0) {
            lienzo.pegarLienzo({ lienzo: this.historialCapturas[this.historialCapturas.length - 1].captura, x: 0, y: 0 })
        }
    }
    trazosDesdeUltimaCaptura() {
        let cantidadTrazos = this.historialTrazos.length;
        if (this.historialCapturas.length > 0) {
            cantidadTrazos = ((this.historialTrazos.length - 1) - (this.historialCapturas[this.historialCapturas.length - 1].indice) + 1);
        }
        return cantidadTrazos;
    }
    cargarUltimaCaptura() {
        if (this.historialCapturas.length > 0) {
            const captura = this.historialCapturas[this.historialCapturas.length - 1].captura;
            this.lienzo.pegarLienzo({ lienzo: captura, x: 0, y: 0 })
        }
    }
    clonarArrayTrazos(historial) { // REVISADO
        const clonHistorial = []
        for (let i = 0; i < historial.length; i++) {
            const trazoCopiado = historial[i].clonar()
            clonHistorial.push(trazoCopiado)
        }
        return clonHistorial;
    }
    clonarCapturas() {
        const clonHistorial = []
        for (let i = 0; i < this.historialCapturas.length; i++) {
            const capt = this.historialCapturas[i]
            const canvasClon = lienzos.obtener({ largo: capt.captura.largo, alto: capt.captura.alto });
            canvasClon.pegarLienzo({ lienzo: capt.captura, y: 0, x: 0 })

            clonHistorial.push({ indice: capt.indice, captura: canvasClon })
        }

        return clonHistorial
    }
    clonarArrays() {
        return {
            trazosRevertidos: this.clonarArrayTrazos(this.trazosRevertidos),
            historialTrazos: this.clonarArrayTrazos(this.historialTrazos),
            historialCapturas: this.clonarCapturas()
        }
    }
}
class categoria {
    constructor(nombre, categoria) {
        this.nombre = nombre;
        this.categoria = categoria; // igual a carpeta padre
    }
    herramientas = [];
    subCategorias = [];
}
class herramienta {
    constructor(nombre, categoria) {
        this.nombre = nombre;
        this.categoria = categoria; // igual a carpeta padre
    }
    preRenderizable = true;
    requiereSegmentacion = false;
    usar(lienzo, trazo) {
    }

    perteneceCategoria(categoria) {
        let categoriaActual = this.categoria;

        while (categoriaActual) {
            if (categoriaActual === categoria) {
                return true;
            }

            categoriaActual = categoriaActual.categoria;
        }

        return false;
    }

}
class herramientaDibujo extends herramienta {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }

    borra = false;
    usar({ lienzo, lienzoIntermediario, trazo }) {
    }
    trazoComplejo() {
        return false
    }

    trazoValido(trazo) {
        return true;
    }
}
class figura extends herramientaDibujo {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }
    cordenadasRepetibles = false;
    trayectosNecesarios = 1;
    cordenadasNecesarios = [2]; // esto del trazo 0 ,  en caso de figuras porlomenos, en caso de una herramienta selectora libre seria del trazo 2
    trazoTerminado(trazo) {
        return trazo.trayectos.length >= this.trayectosNecesarios
    }
    trazoValido(trazo) {
        if (trazo.trayectos.length !== this.trayectosNecesarios) return false
        for (let i = 0; i < trazo.trayectos.length; i++) {
            if (trazo.trayectos[i].length !== this.cordenadasNecesarios[i]) return false
        }
        if (!this.condicionesEspeciales(trazo)) return false
        return true
    }

    condicionesEspeciales(trazo) {
        const tam = trazo.cajaDelimitadora();
        if (tam.alto * tam.largo <= 0) return false

        return true
    }

    trazoEnProceso(trazo) {

        if (trazo.trayectos.length < this.trayectosNecesarios) {
            for (let i = 0; i < trazo.trayectos.length; i++) {
                if (trazo.trayectos[i].length !== this.cordenadasNecesarios[i]) {
                    return false
                }
            }
            return true;
        }

        return false;
    }
}
class lineaSimple extends figura {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }
    usar({ lienzo, trazo }) { // ({ x1, y1, x2, y2, grosor, r, g, b, a })
        if (!this.trazoValido(trazo)) return
        lienzo.pintarLinea({
            x1: trazo.trayectos[0][0].x + trazo.puntoInicial.x,
            y1: trazo.trayectos[0][0].y + trazo.puntoInicial.y,
            x2: trazo.trayectos[0][1].x + trazo.puntoInicial.x,
            y2: trazo.trayectos[0][1].y + trazo.puntoInicial.y,
            grosor: trazo.grosor,
            r: trazo.rgba[0].r,
            g: trazo.rgba[0].g,
            b: trazo.rgba[0].b,
            a: trazo.rgba[0].a
        })
    }
    condicionesEspeciales(trazo) {
        const tam = trazo.cajaDelimitadora();
        if (tam.alto + tam.largo <= 0) return false

        return true
    }
}
class rectanguloSimple extends figura {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }

    usar({ lienzo, trazo, lienzoIntermediario }) { // ({ x1, y1, x2, y2, grosor, r, g, b, a })
        if (!this.trazoValido(trazo)) return
        const lienzoUsar = lienzoIntermediario.lienzoComun;
        const caja = trazo.cajaDelimitadora();
        lienzoUsar.pintarRectangulo({
            x: trazo.puntoInicial.x + caja.x,
            y: trazo.puntoInicial.y + caja.y,
            largo: caja.largo,
            alto: caja.alto,
            r: trazo.rgba[0].r,
            g: trazo.rgba[0].g,
            b: trazo.rgba[0].b,
            a: trazo.rgba[0].a,
        })
        if (caja.largo > trazo.grosor * 2 && caja.alto > trazo.grosor * 2) {
            lienzoUsar.limpiarRectangulo({
                x: trazo.puntoInicial.x + trazo.grosor + caja.x,
                y: trazo.puntoInicial.y + trazo.grosor + caja.y,
                largo: caja.largo - trazo.grosor * 2,
                alto: caja.alto - trazo.grosor * 2,
            })

            if (trazo.rgba[1].a !== 0) {
                lienzoUsar.pintarRectangulo({
                    x: trazo.puntoInicial.x + trazo.grosor + caja.x,
                    y: trazo.puntoInicial.y + trazo.grosor + caja.y,
                    largo: caja.largo - trazo.grosor * 2,
                    alto: caja.alto - trazo.grosor * 2,
                    r: trazo.rgba[1].r,
                    g: trazo.rgba[1].g,
                    b: trazo.rgba[1].b,
                    a: trazo.rgba[1].a,
                })
            }
        }
        lienzo.pegarLienzo({ lienzo: lienzoUsar, x: 0, y: 0, modoPegado: trazo.modoDibujo })
    }
}
class elipseSimple extends figura {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }

    usar({ lienzo, trazo, lienzoIntermediario }) { // ({ x1, y1, x2, y2, grosor, r, g, b, a })
        if (!this.trazoValido(trazo)) return
        const lienzoUsar = lienzoIntermediario.lienzoComun;
        const caja = trazo.cajaDelimitadora();
        lienzoUsar.pintarElipse({
            x: trazo.puntoInicial.x + caja.x,
            y: trazo.puntoInicial.y + caja.y,
            largo: caja.largo,
            alto: caja.alto,
            r: trazo.rgba[0].r,
            g: trazo.rgba[0].g,
            b: trazo.rgba[0].b,
            a: trazo.rgba[0].a,
            rotacion: 0,
            inicio: 0,
            fin: Math.PI * 2
        })
        if (caja.largo > trazo.grosor * 2 && caja.alto > trazo.grosor * 2) {
            lienzoUsar.limpiarElipse({
                x: trazo.puntoInicial.x + trazo.grosor + caja.x,
                y: trazo.puntoInicial.y + trazo.grosor + caja.y,
                largo: caja.largo - trazo.grosor * 2,
                alto: caja.alto - trazo.grosor * 2,
                rotacion: 0,
                inicio: 0,
                fin: Math.PI * 2
            })

            if (trazo.rgba[1].a !== 0) {
                lienzoUsar.pintarElipse({
                    x: trazo.puntoInicial.x + trazo.grosor + caja.x,
                    y: trazo.puntoInicial.y + trazo.grosor + caja.y,
                    largo: caja.largo - trazo.grosor * 2,
                    alto: caja.alto - trazo.grosor * 2,
                    r: trazo.rgba[1].r,
                    g: trazo.rgba[1].g,
                    b: trazo.rgba[1].b,
                    a: trazo.rgba[1].a,
                    rotacion: 0,
                    inicio: 0,
                    fin: Math.PI * 2
                })
            }
        }
        lienzo.pegarLienzo({ lienzo: lienzoUsar, x: 0, y: 0, modoPegado: trazo.modoDibujo })
    }
}
class circuloSimple extends figura {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }
    usar({ lienzo, trazo, lienzoIntermediario }) {
        if (!this.trazoValido(trazo)) return
        const lienzoUsar = lienzoIntermediario.lienzoComun;
        const radio = Math.sqrt(Math.pow(trazo.trayectos[0][trazo.trayectos[0].length - 1].x, 2) + Math.pow(trazo.trayectos[0][trazo.trayectos[0].length - 1].y, 2))
        lienzoUsar.pintarCirculo({
            x: trazo.puntoInicial.x,
            y: trazo.puntoInicial.y,
            radio,
            r: trazo.rgba[0].r,
            g: trazo.rgba[0].g,
            b: trazo.rgba[0].b,
            a: trazo.rgba[0].a,
            rotacion: 0,
            inicio: 0,
            fin: Math.PI * 2
        })

        if (radio >= trazo.grosor) {
            lienzoUsar.limpiarCirculo({
                x: trazo.puntoInicial.x,
                y: trazo.puntoInicial.y,
                radio: radio - trazo.grosor,
                rotacion: 0,
                inicio: 0,
                fin: Math.PI * 2
            })
            if (trazo.rgba[1].a !== 0) {
                lienzoUsar.pintarCirculo({
                    x: trazo.puntoInicial.x,
                    y: trazo.puntoInicial.y,
                    radio: radio - trazo.grosor,
                    r: trazo.rgba[1].r,
                    g: trazo.rgba[1].g,
                    b: trazo.rgba[1].b,
                    a: trazo.rgba[1].a,
                    rotacion: 0,
                    inicio: 0,
                    fin: Math.PI * 2
                })
            }
        }
        lienzo.pegarLienzo({ lienzo: lienzoUsar, x: 0, y: 0, modoPegado: trazo.modoDibujo })
    }
    trazoValido(trazo) {
        if (Math.abs(trazo.trayectos[0][trazo.trayectos[0].length - 1].x) + Math.abs(trazo.trayectos[0][trazo.trayectos[0].length - 1].y) <= 0) return false
        return true
    }
}
class pincel extends herramientaDibujo {
    constructor(nombre, categoria, trayectoMuyLargo) {
        super(nombre, categoria)
        this.trayectoMuyLargo = trayectoMuyLargo;

    }
    alphaSolapable = true;
    usar({ lienzo, lienzoIntermediario, trazo }) {

    }
    trazoComplejo(trazo) {
        if (trazo.trayectos[0].length > this.trayectoMuyLargo) return true

        return false;
    }

    trazoEnProceso(trazo) {
        return false
    }

    acomodarAlphaTrazo({ lienzo, trazo }) { // no lo use xd , revienta la ram
        const seccionCambiar = trazo.cajaDelimitadora();
        seccionCambiar.x += trazo.puntoInicial.x - trazo.grosor
        seccionCambiar.y += trazo.puntoInicial.y - trazo.grosor
        seccionCambiar.largo += trazo.grosor * 2
        seccionCambiar.alto += trazo.grosor * 2

        lienzo.cambiarCanalSeccion({
            seccion: seccionCambiar,
            condicion: ({ r, g, b, a }) => a !== 0,
            cambios: ({ r, g, b, a }) => {
                a = trazo.rgba[0].a * 255;
                return { r, g, b, a }
            },
        })
        lienzo.pegarLienzo({ lienzo: lienzo, x: 0, y: 0 })
    }

    utilizarLienzoIntermediario(trazo) {
        if (trazo.trayectos[0].length === 1 || trazo.rgba[0].a === 1) return false
        return true
    }
}
class sello extends herramientaDibujo {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }
    conectable = false;

}
class selloCuadrado extends sello {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }
    usar({ x, y, grosor, r, g, b, a, lienzo }) {
        lienzo.pintarRectangulo({ // pintarRectangulo({ x, y, largo, alto, r, g, b, a })
            x: x - Math.floor(grosor / 2),
            y: y - Math.floor(grosor / 2),
            largo: grosor,
            alto: grosor,
            r,
            g,
            b,
            a
        })
    }
}
class selloCircular extends sello {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }
    conectable = true;

    usar({ x, y, grosor, r, g, b, a, lienzo }) {
        lienzo.pintarCirculo({
            x,
            y,
            radio: grosor / 2,
            r,
            g,
            b,
            a,
            rotacion: 0,
            inicio: 0,
            fin: Math.PI * 2
        })
    }

    conectarSellos({ trayecto, grosor, r, g, b, a, lienzo }) {
        lienzo.pintarTrayectoLineas({
            trayecto,
            grosor,
            r,
            g,
            b,
            a
        })
    }
}
class selloCaligrafia extends sello {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }
    conectable = true;

    usar({ x, y, grosor, r, g, b, a, lienzo }) {
        lienzo.pintarLinea({
            x1: x - Math.floor(grosor / 2),
            y1: y - Math.floor(grosor / 2),
            x2: x + Math.floor(grosor / 2),
            y2: y + Math.floor(grosor / 2),
            grosor: 1,
            r,
            g,
            b,
            a
        })
    }

    conectarSellos({ trayecto, grosor, r, g, b, a, lienzo }) {
        let pixelActual = Math.floor(grosor / 2)
        for (let t = 0; t < trayecto.length; t++) {
            trayecto[t].x -= pixelActual;
            trayecto[t].y -= pixelActual;
        }
        for (let i = 0; i < grosor; i++) {
            for (let t = 0; t < trayecto.length; t++) {
                trayecto[t].x++;
                trayecto[t].y++;

            }
            lienzo.pintarTrayectoLineas({
                trayecto,
                grosor: 2,
                r,
                g,
                b,
                a
            })
        }
    }
}
class pincelSellosSimple extends pincel {
    constructor(nombre, categoria, trayectoMuyLargo) {
        super(nombre, categoria, trayectoMuyLargo)
    }

    dibujo(lienzo, trazo) {
        const sello = pintor.obtenerHerramienta(trazo.sello)
        if (!trazo.continuidad) {
            for (let i = 0; i < trazo.trayectos.length; i++) {
                const infoSeparacion = trazo.ajustarSeparacionTrayecto({ sobrante: trazo.sobrante, trayectoSeparar: i })
                if (trazo.sobrante !== undefined) trazo.sobrante = infoSeparacion.sobrante
                const cordenadas = infoSeparacion.trayectoSeccionado
                for (const cord of cordenadas) {
                    sello.usar({
                        x: cord.x + trazo.puntoInicial.x,
                        y: cord.y + trazo.puntoInicial.y,
                        grosor: trazo.grosor,
                        r: trazo.rgba[0].r,
                        g: trazo.rgba[0].g,
                        b: trazo.rgba[0].b,
                        a: 1,
                        lienzo: lienzo
                    })
                }
            }
        } else {
            const cordenadasAbsolutas = trazo.obtenerTrayectosCordsAbsolutas();
            for (let i = 0; i < trazo.trayectos.length; i++) {
                for (const cord of trazo.trayectos[i]) {
                    sello.usar({
                        x: cord.x + trazo.puntoInicial.x,
                        y: cord.y + trazo.puntoInicial.y,
                        grosor: trazo.grosor,
                        r: trazo.rgba[0].r,
                        g: trazo.rgba[0].g,
                        b: trazo.rgba[0].b,
                        a: 1,
                        lienzo: lienzo
                    })
                }

                if (sello.conectable) {
                    sello.conectarSellos({
                        trayecto: cordenadasAbsolutas[i],
                        grosor: trazo.grosor,
                        r: trazo.rgba[0].r,
                        g: trazo.rgba[0].g,
                        b: trazo.rgba[0].b,
                        a: 1,
                        lienzo: lienzo
                    })
                }
            }
        }

    }

    usar({ lienzo, lienzoIntermediario, trazo }) {
        if (trazo.rgba[0].a === 0) return
        this.dibujo(lienzoIntermediario.lienzoComun, trazo)
        lienzo.pegarLienzo({ lienzo: lienzoIntermediario.lienzoComun, x: 0, y: 0, alpha: trazo.rgba[0].a, modoPegado: trazo.modoDibujo })
    }
}
class poligonoSimple extends figura {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }

    cordenadasRepetibles = false;
    trayectosNecesarios = 1;
    cordenadasNecesarios = [2]; // esto del trazo 0 ,  en caso de figuras porlomenos, en caso de una herramienta selectora libre seria del trazo 2

    usar({ lienzo, trazo, lienzoIntermediario }) { // ({ x1, y1, x2, y2, grosor, r, g, b, a })
        if (!this.trazoValido(trazo)) return
        lienzos.acomodar({ lienzo: lienzoIntermediario.lienzoComunSecundario, alto: lienzo.alto, largo: lienzo.largo })
        pintor.dibujar(lienzoIntermediario.lienzoComunSecundario, this.transformarTrazoEnPincel(trazo))
        lienzo.pegarLienzo({ lienzo: lienzoIntermediario.lienzoComunSecundario, x: 0, y: 0, alpha: trazo.rgba[0].a, modoPegado: trazo.modoDibujo })

    }
    transformarTrazoEnPincel(trazo) {
        const trazoTransformado = trazo.clonar()
        for (let i = 1; i < trazoTransformado.trayectos.length; i++) {
            if (trazoTransformado.trayectos[i].length > 1) trazoTransformado.trayectos[i].splice(0, 1)
        }
        if (!this.trazoEnProceso(trazo)) trazoTransformado.trayectos[trazoTransformado.trayectos.length - 1][0] = trazoTransformado.trayectos[0][0]

        trazoTransformado.trayectos = [trazoTransformado.obtenerTrayectoPlano()]
        trazoTransformado.herramienta = 'pincelSellosSimple'
        trazoTransformado.modoDibujo = 'normal'
        for (const rgba of trazoTransformado.rgba) {
            rgba.a = 1;
        }
        return trazoTransformado
    }

    trazoValido(trazo) {
        if (trazo.trayectos.length > 0)
            if (trazo.trayectos[0].length === 1)
                return false
            else
                if (trazo.trayectos[0][0].x === trazo.trayectos[0][1].x && trazo.trayectos[0][0].y === trazo.trayectos[0][1].y) return false
        return true
    }

    trazoEnProceso(trazo) {
        if (trazo.trayectos.length < 1) return false

        const cordenadas = trazo.obtenerTrayectoPlano()
        const margen = trazo.grosor; // agregar como parametro el margen , para poder usarlo en herramientas nuevas cuando haya lego
        const inicio = cordenadas[0]
        const fin = cordenadas[cordenadas.length - 1]


        if (inicio.x - margen <= fin.x && fin.x <= inicio.x + margen &&
            inicio.y - margen <= fin.y && fin.y <= inicio.y + margen)
            return false

        if (trazo.trayectos.length > 2)
            if (cordenadas[cordenadas.length - 1].x === cordenadas[cordenadas.length - 3].x &&
                cordenadas[cordenadas.length - 1].y === cordenadas[cordenadas.length - 3].y) return false
        return true
    }

}
class figuraSellos extends lineaSimple {
    constructor(nombre, categoria, verticesFigura) {
        super(nombre, categoria)
        this.verticesFigura = verticesFigura
    }

    usar({ lienzo, trazo, lienzoIntermediario }) {
        if (!this.trazoValido(trazo)) return
        lienzos.acomodar({ lienzo: lienzoIntermediario.lienzoComunSecundario, alto: lienzo.alto, largo: lienzo.largo })

        const clonTrazo = trazo.clonar();
        clonTrazo.herramienta = 'pincelSellosSimple'
        clonTrazo.modoDibujo = 'normal'
        const puntosVertices = this.transformarVerticesPuntos(trazo)

        clonTrazo.trayectos = puntosVertices;
        pintor.dibujar(lienzoIntermediario.lienzoComunSecundario, clonTrazo)

        lienzo.pegarLienzo({ lienzo: lienzoIntermediario.lienzoComunSecundario, x: 0, y: 0, alpha: trazo.rgba[0].a, modoPegado: trazo.modoDibujo })

    }

    transformarVerticesPuntos(trazo) {
        const caja = trazo.cajaDelimitadora()
        const secciones = []

        const restarX = (caja.x < 0) ? true : false
        const restarY = (caja.y < 0) ? true : false
        for (const vertices of this.verticesFigura) {
            const puntos = []
            for (const vertice of vertices) {
                const verticeX = (restarX) ? 1 - vertice.x : vertice.x
                const verticeY = (restarY) ? 1 - vertice.y : vertice.y

                puntos.push({
                    x: verticeX * caja.largo + caja.x,
                    y: verticeY * caja.alto + caja.y
                })
            }
            secciones.push(puntos)
        }
        return secciones;
    }
}
class baldeSimple extends herramienta {
    constructor(nombre, categoria) {
        super(nombre, categoria)
    }
    preRenderizable = false;
    usar({ lienzo, lienzoIntermediario, trazo }) {
        const puntoBalde = {
            x: trazo.puntoInicial.x + trazo.trayectos[0][trazo.trayectos[0].length - 1].x,
            y: trazo.puntoInicial.y + trazo.trayectos[0][trazo.trayectos[0].length - 1].y
        }
        const manchaClickeada = lienzo.obtenerManchaInundacion({
            cordenada: puntoBalde,
            sensibilidad: ({
                r,
                g,
                b,
                a,
                colorBase
            }) => {
                if (r === colorBase.r && g === colorBase.g && b === colorBase.a) return true
                return false
            }
        });
        console.log(manchaClickeada)
        const rgba = trazo.rgba[0]
        const tramosPintar = manchaClickeada.mancha[manchaClickeada.colorBase]

        for (const tramo of tramosPintar) {
            lienzoIntermediario.lienzoComun.pintarRectangulo({
                x: tramo.x0,
                y: tramo.y,
                largo: tramo.x1 - tramo.x0 + 1,
                alto: 1,
                r: rgba.r,
                g: rgba.g,
                b: rgba.b,
                a: rgba.a
            });
        }
        lienzo.pegarLienzo({ lienzo: lienzoIntermediario.lienzoComun, x: 0, y: 0, modoPegado: trazo.modoDibujo })
    }

    trazoEnProceso() {
        return false;
    }
    trazoValido(trazo) {
        if (trazo.puntoInicial) return true
    }
    trazoComplejo() {
        return true;
    }
}
class trazo {
    constructor({ trayectos, puntoInicial, rgba, grosor, herramienta, sello, continuidad, separacion, modoDibujo }) { // le puedo agregar cosas pero por ahora va este 
        this.trayectos = trayectos;
        this.puntoInicial = puntoInicial;
        this.rgba = rgba;
        this.grosor = grosor;
        this.herramienta = herramienta; // es un string, simplemente el nombre de la herramienta
        this.sello = sello;
        this.continuidad = continuidad;
        this.separacion = separacion;
        this.modoDibujo = modoDibujo;
    }
    minimoSeparacion = 0.01
    velPxsMin = 300
    velPxsMax = 3000
    cajaDelimitadora() { // se toma asi pq es cordenada relativa a punto inicial, la cord 0 siempre es 0 0 
        let x1 = 0;
        let y1 = 0;
        let x2 = 0;
        let y2 = 0;
        for (const cord of this.trayectos[0]) {
            if (x1 > cord.x) x1 = cord.x
            if (x2 < cord.x) x2 = cord.x
            if (y1 > cord.y) y1 = cord.y
            if (y2 < cord.y) y2 = cord.y
        }

        return {
            x: x1,
            y: y1,
            largo: x2 - x1,
            alto: y2 - y1
        }
    }
    cajaDelimitadoraAbsoluta() {
        const cordenadas = this.obtenerTrayectoPlano()
        let x1 = 0;
        let y1 = 0;
        let x2 = 0;
        let y2 = 0;
        for (const cord of cordenadas) {
            if (x1 > cord.x) x1 = cord.x
            if (x2 < cord.x) x2 = cord.x
            if (y1 > cord.y) y1 = cord.y
            if (y2 < cord.y) y2 = cord.y
        }

        return {
            x: x1,
            y: y1,
            largo: x2 - x1,
            alto: y2 - y1
        }
    }
    invertirRGB(indice) {
        const color = this.rgba[indice]
        if (color) {
            color.r = 255 - color.r;
            color.g = 255 - color.g;
            color.b = 255 - color.b;
        }
    }
    invertirAlpha(indice) {
        const color = this.rgba[indice]
        if (color) {
            color.a = 1 - color.a;
        }
    }
    invertirCanalesRGBA(indice) {
        this.invertirAlpha(indice)
        this.invertirRGB(indice)
    }
    clonarRGBA() {
        const clonRGBA = [];
        for (const act of this.rgba) {
            clonRGBA.push({
                r: act.r,
                g: act.g,
                b: act.b,
                a: act.a
            })
        }
        return clonRGBA
    }
    clonarTrayectos() {
        const clonTrayectos = [];
        for (const trayecto of this.trayectos) {
            const clonTrayecto = [];
            if (trayecto[0]) {
                for (const cords of trayecto) {
                    clonTrayecto.push({
                        x: cords.x,
                        y: cords.y,
                    })
                }
            }
            clonTrayectos.push(clonTrayecto)
        }
        return clonTrayectos
    }
    clonar() {
        return new trazo({
            puntoInicial: { x: this.puntoInicial.x, y: this.puntoInicial.y },
            grosor: this.grosor,
            rgba: this.clonarRGBA(),
            trayectos: this.clonarTrayectos(),
            herramienta: this.herramienta,
            sello: this.sello,
            continuidad: this.continuidad,
            separacion: this.separacion,
            modoDibujo: this.modoDibujo
        })
    }
    agregarTrazo(cordenada) {
        this.trayectos.push([this.obtenerCordenadaRelativa(cordenada)])
    }
    agregarCordenada(cordenada) {
        this.trayectos[this.trayectos.length - 1].push(this.obtenerCordenadaRelativa(cordenada))
    }
    remplazarUltimaCordenada(cordenada) {
        if (this.trayectos[this.trayectos.length - 1].length > 0) {
            this.trayectos[this.trayectos.length - 1].pop()
            this.trayectos[this.trayectos.length - 1].push(this.obtenerCordenadaRelativa(cordenada))
        } else {
            this.agregarCordenada(cordenada)
        }
    }
    obtenerCordenadaRelativa(cordenada) {
        return { x: cordenada.x - this.puntoInicial.x, y: cordenada.y - this.puntoInicial.y }
    }
    obtenerTrayectosCordsAbsolutas() {
        const trayectosCordAbsolutos = []
        for (const trayecto of this.trayectos) {
            let trayectosAbsoluto = []
            for (const cord of trayecto) {
                trayectosAbsoluto.push({
                    x: cord.x + this.puntoInicial.x,
                    y: cord.y + this.puntoInicial.y
                })
            }
            trayectosCordAbsolutos.push(trayectosAbsoluto);
        }
        return trayectosCordAbsolutos
    }
    obtenerTrayectoPlano() {
        let cordenadas = []
        for (const trayecto of this.trayectos) {
            for (const cord of trayecto) {
                cordenadas.push({ x: cord.x, y: cord.y })
            }
        }
        return cordenadas;
    }
    ajustarSeparacionTrayecto({ separacion, sobrante = 0, trayectoSeparar = 0 } = {}) {
        let trayectoSeccionado = [];
        if (sobrante === 0) trayectoSeccionado = [{ x: this.trayectos[trayectoSeparar][0].x, y: this.trayectos[trayectoSeparar][0].y }];
        if (!separacion) separacion = this.grosor * Math.max(this.separacion, this.minimoSeparacion);

        for (let i = 0; i < this.trayectos[trayectoSeparar].length - 1; i++) {
            const origenTramo = this.trayectos[trayectoSeparar][i];
            const finTramo = this.trayectos[trayectoSeparar][i + 1];

            const largo = finTramo.x - origenTramo.x;
            const alto = finTramo.y - origenTramo.y;

            let hyp = 0
            if (largo === 0 || alto === 0)
                hyp = Math.max(Math.abs(largo), Math.abs(alto))
            else
                hyp = Math.hypot(largo, alto);

            if (hyp === 0) continue;

            const distanciaTotal = hyp + sobrante;
            const puntos = Math.floor(distanciaTotal / separacion);

            const dirX = largo / hyp;
            const dirY = alto / hyp;

            let d = separacion - sobrante;
            for (let n = 0; n < puntos; n++) {
                trayectoSeccionado.push({
                    x: origenTramo.x + dirX * d,
                    y: origenTramo.y + dirY * d
                });
                d += separacion;
            }

            sobrante = distanciaTotal % separacion;
        }

        return { trayectoSeccionado, sobrante };
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
const mesaTrabajo = {
    confCapas: {
        frecuenciaCapturas: 10,
        trayectoMuyLargo: 1000,
        limiteCapturasHistorial: 5,
        largoLienzo: 1920,
        altoLienzo: 1080
    },
    conteoCapas: 0,
    conteoGrupoCapas: 0,
    capas: {},
    capasIndividualesVivas: [],
    capasGrupoVivas: [],
    capaActiva: undefined,
    grupoCapasActiva: undefined,

    trazoTemporal: undefined,
    trazoGuardar: undefined,

    lienzoPrevio: undefined,
    lienzoCapaActual: undefined,
    lienzoPosterior: undefined,

    herramientaActiva: undefined,

    inicioClick({ cordenada, lienzoReal, parametrosTrazo }) {
        if (this.capasIndividualesVivas.length === 0) return
        if (this.trazoGuardar)
            if (!this.herramientaActiva.trazoEnProceso(this.trazoGuardar))
                if (this.herramientaActiva.trazoValido(this.trazoGuardar))
                    this.trazoGuardar = undefined;

        if (!this.trazoGuardar) this.trazoGuardar = new trazo(parametrosTrazo)

        this.herramientaActiva = pintor.obtenerHerramienta(this.trazoGuardar.herramienta);

        if (this.herramientaActiva.perteneceCategoria(pintor.obtenerCategoria('pinceles')))
            lienzos.acomodar({
                lienzo: pintor.lienzosIntermediarios.lienzoPincel,
                alto: this.confCapas.altoLienzo,
                largo: this.confCapas.largoLienzo
            })
        this.prepararLienzosSanduich()
        this.trazoGuardar.agregarTrazo(cordenada)
        this.trazoTemporal = this.trazoGuardar.clonar()
        this.trazoTemporal.sobrante = 0;
    },

    arrastreClick({ cordenada, lienzoReal }) {
        if (this.capasIndividualesVivas.length === 0) return

        if (this.herramientaActiva.perteneceCategoria(pintor.obtenerCategoria('pinceles'))) {
            this.trazoGuardar.agregarCordenada(cordenada)

            this.trazoTemporal.trayectos[0][0] = this.trazoGuardar.trayectos[0][this.trazoGuardar.trayectos[0].length - 2]
            this.trazoTemporal.trayectos[0][1] = this.trazoGuardar.trayectos[0][this.trazoGuardar.trayectos[0].length - 1]

        } else {
            if (this.trazoTemporal.trayectos[this.trazoTemporal.trayectos.length - 1].length > 1) {

                this.trazoTemporal.remplazarUltimaCordenada(cordenada)
            } else {
                this.trazoTemporal.agregarCordenada(cordenada)
            }
        }

        if (this.herramientaActiva.preRenderizable) {
            lienzoReal.limpiar()
            this.renderizarTrazo({
                lienzoReal,
                trazoTemporal: this.trazoTemporal,
                trazoReal: this.trazoGuardar,
            })
        }
    },

    finClick({ cordenada, lienzoReal }) {
        if (this.capasIndividualesVivas.length === 0) return
        if (!this.trazoGuardar) return

        lienzoReal.limpiar()
        this.trazoGuardar.agregarCordenada(cordenada)

        if (!this.herramientaActiva.trazoEnProceso(this.trazoGuardar)) {
            if (this.herramientaActiva.trazoValido(this.trazoGuardar)) {
                this.guardarTrazo();
                this.capaActiva.capaPadre.preRenderizar();
            }
            this.trazoGuardar = undefined;
            lienzoReal.limpiar();
            this.capas.renderizar(lienzoReal)

            return;
        }

        if (this.herramientaActiva.perteneceCategoria(pintor.obtenerCategoria('pinceles'))) {
            this.renderizarIntermedioPincel({
                lienzoReal,
                trazoTemporal: this.trazoTemporal,
                trazoReal: this.trazoGuardar,
            })
        }
        else {
            this.renderizarTrazo({ lienzoReal: lienzoReal, trazoTemporal: this.trazoTemporal, trazoReal: this.trazoGuardar })
        }
    },

    renderizarTrazo({ lienzoReal, trazoTemporal, trazoReal }) {
        if (!this.herramientaActiva.preRenderizable) return
        if (this.herramientaActiva.perteneceCategoria(pintor.obtenerCategoria('pinceles'))) {
            this.renderizarIntermedioPincel({ lienzoReal, trazoTemporal, trazoReal })
        } else {
            this.rendreizarFigura({ lienzoReal, trazo: trazoTemporal })
        }
    },
    renderizarIntermedioPincel({ lienzoReal, trazoTemporal, trazoReal }) {
        const lienzoPincel = pintor.lienzosIntermediarios.lienzoPincel;
        lienzos.acomodar({ lienzo: lienzoPincel, alto: lienzoReal.alto, largo: lienzoReal.largo, limpiar: false })

        if (this.lienzoPrevio) lienzoReal.pegarLienzo({ lienzo: this.lienzoPrevio, x: 0, y: 0, })
        trazoTemporal.rgba[0].a = 1
        if (trazoReal.modoDibujo === "normal") {
            this.capaActiva.renderizar(lienzoReal)
            pintor.dibujar(lienzoPincel, trazoTemporal)
            lienzoReal.pegarLienzo({ lienzo: lienzoPincel, y: 0, x: 0, alpha: this.trazoGuardar.rgba[0].a })
        } else {
            this.lienzoCapaActual.limpiar()
            this.capaActiva.renderizar(this.lienzoCapaActual)
            this.herramientaActiva.dibujo(lienzoPincel, trazoTemporal)
            this.lienzoCapaActual.pegarLienzo({ lienzo: lienzoPincel, x: 0, y: 0, alpha: this.trazoGuardar.rgba[0].a, modoPegado: trazoReal.modoDibujo })

            lienzoReal.pegarLienzo({ lienzo: this.lienzoCapaActual, y: 0, x: 0 })
        }

        if (this.lienzoPosterior) lienzoReal.pegarLienzo({ lienzo: this.lienzoPosterior, y: 0, x: 0 })
    },
    rendreizarFigura({ lienzoReal, trazo }) {
        if (this.lienzoPrevio) lienzoReal.pegarLienzo({ lienzo: this.lienzoPrevio, x: 0, y: 0 })
        this.capaActiva.renderizar(lienzoReal)
        pintor.dibujar(lienzoReal, trazo)
        if (this.lienzoPosterior) lienzoReal.pegarLienzo({ lienzo: this.lienzoPosterior, y: 0, x: 0 })
    },
    prepararLienzosSanduich() {
        const capasDivididas = this.capas.dividirCapas({ capa: this.capaActiva, })
        if (capasDivididas.anteriores.length > 0) {
            if (!this.lienzoPrevio) this.lienzoPrevio = lienzos.obtener({ largo: this.confCapas.largoLienzo, alto: this.confCapas.altoLienzo, tipo: 'temporal' })

            lienzos.acomodar({
                lienzo: this.lienzoPrevio,
                alto: this.confCapas.altoLienzo,
                largo: this.confCapas.largoLienzo
            })

            for (const actual of capasDivididas.anteriores) {
                actual.renderizar(this.lienzoPrevio)
            }
        } else {
            if (this.lienzoPrevio) this.lienzoPrevio.limpiar()
        }

        if (capasDivididas.posteriores.length > 0) {
            if (!this.lienzoPosterior) this.lienzoPosterior = lienzos.obtener({ largo: this.confCapas.largoLienzo, alto: this.confCapas.altoLienzo, tipo: 'temporal' })
            lienzos.acomodar({
                lienzo: this.lienzoPosterior,
                alto: this.confCapas.altoLienzo,
                largo: this.confCapas.largoLienzo
            })
            for (const actual of capasDivididas.posteriores) {
                actual.renderizar(this.lienzoPosterior)
            }
        } else {
            if (this.lienzoPosterior) this.lienzoPosterior.limpiar()

        }
        if (!this.lienzoCapaActual)
            this.lienzoCapaActual = lienzos.obtener({ largo: this.confCapas.largoLienzo, alto: this.confCapas.altoLienzo, tipo: 'temporal' })
        this.lienzoCapaActual.limpiar()
        this.capaActiva.renderizar(this.lienzoCapaActual)
    },
    clonarCapa(carpeta, capa) { //id carpeta es el padre, capa es la carpeta a clonar
        if (carpeta.tipoCapa === 'grupo') {
            if (capa.tipoCapa === 'individual') {
                this.conteoCapas++

                this.capaActiva = carpeta.clonarCapa(this.conteoCapas, capa);
                this.capasIndividualesVivas.push(this.capaActiva);
            } else {
                if (capa.id !== 0) {
                    this.conteoGrupoCapas++
                    this.grupoCapasActiva = carpeta.clonarCapa(this.conteoGrupoCapas, capa);
                    this.capasGrupoVivas.push(this.grupoCapasActiva);
                    this.clonarContenido(capa, this.grupoCapasActiva)
                }
            }
        }
    },
    clonarContenido(grupo, clon) {
        for (const capa of grupo.contenido) {
            this.clonarCapa(clon, capa)
            if (capa.tipoCapa === 'grupo') {
                if (capa.contenido.length > 0) {
                    const padre = clon.contenido[clon.contenido.length - 1]
                    this.clonarContenido(capa, padre)
                }
            }
        }
    },
    agregarCapa(idCapa) {
        const capaPadre = this.capas.buscarGrupoCapas(idCapa);
        if (capaPadre) {
            this.conteoCapas++;
            this.capaActiva = capaPadre.agregarCapa({
                capaPadre,
                idCapa: this.conteoCapas,
                lienzo: lienzos.obtener({ largo: this.confCapas.largoLienzo, alto: this.confCapas.altoLienzo }),
                frecuenciaCapturas: this.confCapas.frecuenciaCapturas,
                trayectoMuyLargo: this.confCapas.trayectoMuyLargo,
                limiteCapturasHistorial: this.confCapas.limiteCapturasHistorial
            });
            this.capasIndividualesVivas.push(this.capaActiva);
        }
    },
    agregarGrupoCapas(idCapa) {
        const capaPadre = this.capas.buscarGrupoCapas(idCapa);
        if (capaPadre) {
            this.conteoGrupoCapas++;

            this.grupoCapasActiva = capaPadre.agregarGrupoCapas({
                capaPadre,
                idCapa: this.conteoGrupoCapas,
                lienzo: lienzos.obtener({ largo: this.confCapas.largoLienzo, alto: this.confCapas.altoLienzo })
            });
            this.capasGrupoVivas.push(this.grupoCapasActiva);
        }
    },
    eliminarCapa(id) { // eliminarCapa(id) 
        const capaPadre = this.capas.buscarCapa(id)?.capaPadre;
        if (capaPadre !== undefined) {
            if (capaPadre.eliminarCapa(id)) {
                let i = 0;
                let capaVivaEliminada = false;
                while (i < this.capasIndividualesVivas.length && !capaVivaEliminada) {
                    if (this.capasIndividualesVivas[i].id === id) {
                        this.capasIndividualesVivas.splice(i, 1);
                        capaVivaEliminada = true;
                    }
                    i++;
                }
                this.capaActiva = this.capasIndividualesVivas[0]
            }
        }
        capaPadre.preRenderizar();
    },
    eliminarCapasHijo(capa) {
        if (capa.contenido.length > 0) {
            for (let i = capa.contenido.length - 1; i > - 1; i--) {
                if (capa.contenido[i].tipoCapa === 'grupo') {
                    this.eliminarGrupoCapas(capa.contenido[i].id)
                } else {
                    this.eliminarCapa(capa.contenido[i].id)
                }
            }
        }
    },
    eliminarGrupoCapas(id) {
        const capaEliminar = this.capas.buscarGrupoCapas(id)
        const capaPadre = capaEliminar?.capaPadre;
        if (this.capasGrupoVivas.length > 0 && capaPadre !== undefined && id !== 0) {
            this.eliminarCapasHijo(capaEliminar);
            if (capaPadre.eliminarGrupoCapas(id)) {
                let i = 0;
                let capaVivaEliminada = false;
                while (i < this.capasGrupoVivas.length && !capaVivaEliminada) {
                    if (this.capasGrupoVivas[i].id === id) {
                        this.capasGrupoVivas.splice(i, 1);
                        capaVivaEliminada = true;
                    }
                    i++;
                }
                this.grupoCapasActiva = this.capasGrupoVivas[0]
            }
        }
        capaPadre.preRenderizar();
    },
    revertirTrazo() {
        this.capaActiva.revertirTrazo()
        this.trazoGuardar = undefined
        this.trazoTemporal = undefined
    },
    recuperarTrazo() {
        this.capaActiva.recuperarTrazo()
    },
    renderizar(lienzo) {
        this.capas.renderizar(lienzo)
        this.trazoGuardar = undefined
        this.trazoTemporal = undefined
    },
    guardarTrazo() {
        this.capaActiva.guardarTrazo(this.trazoGuardar)

    },
    seleccionarCapa(id) {
        for (const capa of this.capasIndividualesVivas) {
            if (capa.id === id) {
                this.capaActiva = capa
                return capa
            }
        }
        return false
    },
    seleccionarGrupoCapas(id) {
        for (const capa of this.capasGrupoVivas) {
            if (capa.id === id) {
                this.grupoCapasActiva = capa
                return capa
            }
        }
        return false
    }
}
const pintor = {
    lienzosIntermediarios: {
        lienzoPincel: lienzos.obtener({ muchaLectura: true, alto: 1, largo: 1, tipo: 'temporal' }),
        lienzoCapa: lienzos.obtener({ muchaLectura: true, alto: 1, largo: 1, tipo: 'temporal' }),
        lienzoComun: lienzos.obtener({ muchaLectura: true, alto: 1, largo: 1, tipo: 'temporal' }),
        lienzoComunSecundario: lienzos.obtener({ muchaLectura: true, alto: 1, largo: 1, tipo: 'temporal' })
    },
    categorias: new categoria('herramientas'),
    listaHerramientas: [],
    listaCategorias: [],
    bufferSeccionado: undefined,
    herramientaUltimoDibujo: undefined,
    ultimoLienzoId: undefined,

    dibujar(lienzoDibujar, trazo) {
        lienzos.acomodar({ lienzo: this.lienzosIntermediarios.lienzoComun, alto: lienzoDibujar.alto, largo: lienzoDibujar.largo })
        const herramienta = this.obtenerHerramienta(trazo.herramienta)


        if (herramienta.requiereSegmentacion) {
            if (this.herramientaUltimoDibujo === undefined || this.ultimoLienzoId === undefined) {
                this.bufferSeccionado = lienzoDibujar.obtenerBufferSeccionado()
            }
            else if (!this.herramientaUltimoDibujo.perteneceCategoria(this.obtenerCategoria("mutacionColor")) ||
                lienzoDibujar.id !== this.ultimoLienzoId) {
                utiles.calentarMotorGrafico()
                const t0 = performance.now();
                this.bufferSeccionado = lienzoDibujar.obtenerBufferSeccionado()
                const t1 = performance.now();
                console.log(`Tiempo de escaneo: ${(t1 - t0).toFixed(2)} ms`);
            }

        }

        herramienta.usar({
            lienzo: lienzoDibujar,
            trazo,
            lienzoIntermediario: this.lienzosIntermediarios,
            bufferSeccionado: this.bufferSeccionado
        })

        this.herramientaUltimoDibujo = herramienta
        if (lienzoDibujar.tipo !== 'temporal')
            this.ultimoLienzoId = lienzoDibujar.id
        this.lienzosIntermediarios.lienzoComun.limpiar()
    },
    trazoComplejo(trazo) {
        return this.obtenerHerramienta(trazo.herramienta).trazoComplejo(trazo);
    },
    cargarCategorias() { // orden ordenado por dios
        const listaCategorias = [
            { nombreCategoria: 'herramienta' },
            { nombreCategoria: 'edicionLienzo', categoriaPadre: 'herramienta' },
            { nombreCategoria: 'mutacionColor', categoriaPadre: 'edicionLienzo' },
            { nombreCategoria: 'dibujo', categoriaPadre: 'herramienta' },
            { nombreCategoria: 'figuras', categoriaPadre: 'dibujo' },
            { nombreCategoria: 'pinceles', categoriaPadre: 'dibujo' },
            { nombreCategoria: 'sello', categoriaPadre: 'dibujo' },
        ]
        const agregarHerramienta = ({ nombreCategoria, categoriaPadre }) => {
            this.listaCategorias.push(this.agregarCategoria(new categoria(nombreCategoria, this.obtenerCategoria(categoriaPadre))))
        };
        for (const herramienta of listaCategorias) {
            agregarHerramienta(herramienta);
        }
    },
    cargarHerramientas() { // orden irrelevante
        this.cargarCategorias();
        this.listaHerramientas.push(
            this.agregarHerramienta(new lineaSimple('lineaSimple', this.obtenerCategoria('figuras'))),
            this.agregarHerramienta(new rectanguloSimple('rectanguloSimple', this.obtenerCategoria('figuras'))),
            this.agregarHerramienta(new elipseSimple('elipseSimple', this.obtenerCategoria('figuras'))),
            this.agregarHerramienta(new circuloSimple('circuloSimple', this.obtenerCategoria('figuras'))),
            this.agregarHerramienta(new poligonoSimple('poligonoSimple', this.obtenerCategoria('figuras'))),
            this.agregarHerramienta(new selloCuadrado('selloCuadrado', this.obtenerCategoria('sello'))),
            this.agregarHerramienta(new selloCaligrafia('selloCaligrafia', this.obtenerCategoria('sello'))),
            this.agregarHerramienta(new selloCircular('selloCircular', this.obtenerCategoria('sello'))),
            this.agregarHerramienta(new pincelSellosSimple('pincelSellosSimple', this.obtenerCategoria('pinceles'), 4000)),
            this.agregarHerramienta(new figuraSellos('cruzSellos', this.obtenerCategoria('figuras'),
                [[{ x: 0, y: 0 },
                { x: 1, y: 1 }],
                [{ x: 1, y: 0 },
                { x: 0, y: 1 }]])),
            this.agregarHerramienta(new figuraSellos('trianguloSellos', this.obtenerCategoria('figuras'),
                [[{ x: 0, y: 1 },
                { x: 1, y: 1 },
                { x: 0.5, y: 0 },
                { x: 0, y: 1 },]])),
            this.agregarHerramienta(new figuraSellos('rectanguloSello', this.obtenerCategoria('figuras'),
                [[{ x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 1, y: 1 },
                { x: 1, y: 0 },
                { x: 0, y: 0 },]])),
            this.agregarHerramienta(new figuraSellos('pentagonoSello', this.obtenerCategoria('figuras'),
                [[{ x: 0.8, y: 1 },
                { x: 0.2, y: 1 },
                { x: 0, y: 0.4 },
                { x: 0.5, y: 0 },
                { x: 1, y: 0.4 },
                { x: 0.8, y: 1 },]])),
            this.agregarHerramienta(new figuraSellos('flechaHorizontal', this.obtenerCategoria('figuras'),
                [[{ x: 0, y: 0.25 },
                { x: 0.5, y: 0.25 },
                { x: 0.5, y: 0 },
                { x: 1, y: 0.5 },
                { x: 0.5, y: 1 },
                { x: 0.5, y: 0.75 },
                { x: 0, y: 0.75 },
                { x: 0, y: 0.25 },]])),
            this.agregarHerramienta(new figuraSellos('estrellaSellos', this.obtenerCategoria('figuras'),
                [[{ x: 0.500, y: 0.000 },
                { x: 0.618, y: 0.363 },
                { x: 0.976, y: 0.363 },
                { x: 0.685, y: 0.575 },
                { x: 0.794, y: 0.938 },
                { x: 0.500, y: 0.724 },
                { x: 0.206, y: 0.938 },
                { x: 0.315, y: 0.575 },
                { x: 0.024, y: 0.363 },
                { x: 0.382, y: 0.363 },
                { x: 0.500, y: 0.000 },
                ]])),
            this.agregarHerramienta(new figuraSellos('lineaSello', this.obtenerCategoria('figuras'),
                [[{ x: 0, y: 0 },
                { x: 1, y: 1 }]])),
            this.agregarHerramienta(new figuraSellos('crepperSello', this.obtenerCategoria('figuras'),
                [[{ x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 1, y: 1 },
                { x: 0, y: 1 },
                { x: 0, y: 0 }],
                [{ x: 0.2, y: 0.2 },
                { x: 0.4, y: 0.2 },
                { x: 0.4, y: 0.4 },
                { x: 0.2, y: 0.4 },
                { x: 0.2, y: 0.2 }],
                [{ x: 0.6, y: 0.2 },
                { x: 0.8, y: 0.2 },
                { x: 0.8, y: 0.4 },
                { x: 0.6, y: 0.4 },
                { x: 0.6, y: 0.2 }],
                [{ x: 0.4, y: 0.4 },
                { x: 0.6, y: 0.4 },
                { x: 0.6, y: 0.5 },
                { x: 0.7, y: 0.5 },
                { x: 0.7, y: 0.8 },
                { x: 0.6, y: 0.8 },
                { x: 0.6, y: 0.7 },
                { x: 0.4, y: 0.7 },
                { x: 0.4, y: 0.8 },
                { x: 0.3, y: 0.8 },
                { x: 0.3, y: 0.5 },
                { x: 0.4, y: 0.5 },
                { x: 0.4, y: 0.4 },
                ]])),
            this.agregarHerramienta(new figuraSellos('estresadorGrilla', this.obtenerCategoria('figuras'), [
                [{ x: 0.00, y: 0 }, { x: 0.00, y: 1 }], [{ x: 0.04, y: 0 }, { x: 0.04, y: 1 }], [{ x: 0.08, y: 0 }, { x: 0.08, y: 1 }], [{ x: 0.12, y: 0 }, { x: 0.12, y: 1 }],
                [{ x: 0.16, y: 0 }, { x: 0.16, y: 1 }], [{ x: 0.20, y: 0 }, { x: 0.20, y: 1 }], [{ x: 0.24, y: 0 }, { x: 0.24, y: 1 }], [{ x: 0.28, y: 0 }, { x: 0.28, y: 1 }],
                [{ x: 0.32, y: 0 }, { x: 0.32, y: 1 }], [{ x: 0.36, y: 0 }, { x: 0.36, y: 1 }], [{ x: 0.40, y: 0 }, { x: 0.40, y: 1 }], [{ x: 0.44, y: 0 }, { x: 0.44, y: 1 }],
                [{ x: 0.48, y: 0 }, { x: 0.48, y: 1 }], [{ x: 0.52, y: 0 }, { x: 0.52, y: 1 }], [{ x: 0.56, y: 0 }, { x: 0.56, y: 1 }], [{ x: 0.60, y: 0 }, { x: 0.60, y: 1 }],
                [{ x: 0.64, y: 0 }, { x: 0.64, y: 1 }], [{ x: 0.68, y: 0 }, { x: 0.68, y: 1 }], [{ x: 0.72, y: 0 }, { x: 0.72, y: 1 }], [{ x: 0.76, y: 0 }, { x: 0.76, y: 1 }],
                [{ x: 0.80, y: 0 }, { x: 0.80, y: 1 }], [{ x: 0.84, y: 0 }, { x: 0.84, y: 1 }], [{ x: 0.88, y: 0 }, { x: 0.88, y: 1 }], [{ x: 0.92, y: 0 }, { x: 0.92, y: 1 }],
                [{ x: 0.96, y: 0 }, { x: 0.96, y: 1 }], [{ x: 1.00, y: 0 }, { x: 1.00, y: 1 }],
                [{ x: 0, y: 0.00 }, { x: 1, y: 0.00 }], [{ x: 0, y: 0.04 }, { x: 1, y: 0.04 }], [{ x: 0, y: 0.08 }, { x: 1, y: 0.08 }], [{ x: 0, y: 0.12 }, { x: 1, y: 0.12 }],
                [{ x: 0, y: 0.16 }, { x: 1, y: 0.16 }], [{ x: 0, y: 0.20 }, { x: 1, y: 0.20 }], [{ x: 0, y: 0.24 }, { x: 1, y: 0.24 }], [{ x: 0, y: 0.28 }, { x: 1, y: 0.28 }],
                [{ x: 0, y: 0.32 }, { x: 1, y: 0.32 }], [{ x: 0, y: 0.36 }, { x: 1, y: 0.36 }], [{ x: 0, y: 0.40 }, { x: 1, y: 0.40 }], [{ x: 0, y: 0.44 }, { x: 1, y: 0.44 }],
                [{ x: 0, y: 0.48 }, { x: 1, y: 0.48 }], [{ x: 0, y: 0.52 }, { x: 1, y: 0.52 }], [{ x: 0, y: 0.56 }, { x: 1, y: 0.56 }], [{ x: 0, y: 0.60 }, { x: 1, y: 0.60 }],
                [{ x: 0, y: 0.64 }, { x: 1, y: 0.64 }], [{ x: 0, y: 0.68 }, { x: 1, y: 0.68 }], [{ x: 0, y: 0.72 }, { x: 1, y: 0.72 }], [{ x: 0, y: 0.76 }, { x: 1, y: 0.76 }],
                [{ x: 0, y: 0.80 }, { x: 1, y: 0.80 }], [{ x: 0, y: 0.84 }, { x: 1, y: 0.84 }], [{ x: 0, y: 0.88 }, { x: 1, y: 0.88 }], [{ x: 0, y: 0.92 }, { x: 1, y: 0.92 }],
                [{ x: 0, y: 0.96 }, { x: 1, y: 0.96 }], [{ x: 0, y: 1.00 }, { x: 1, y: 1.00 }]])),

            this.agregarHerramienta(new baldeSimple('baldeSimple', this.obtenerCategoria('mutacionColor'))),

        )
    },
    agregarHerramienta(herramienta) {
        herramienta.categoria.herramientas.push(herramienta);
        return herramienta
    },
    agregarCategoria(categoria) {
        categoria.categoria.subCategorias.push(categoria);
        return categoria
    },
    obtenerHerramienta(nombre) {
        for (const herramienta of this.listaHerramientas) {
            if (herramienta.nombre === nombre) {
                return herramienta
            }
        }
    },
    obtenerCategoria(nombre) {
        for (const categoria of this.listaCategorias) {
            if (categoria.nombre === nombre) {
                return categoria
            }
        }
        return this.categorias;
    },
    acomLienzInterm({ alto, largo }) {
        const nombreLienzo = Object.keys(this.lienzosIntermediarios)
        for (const actual of nombreLienzo) {
            lienzos.acomodar({ lienzo: this.lienzosIntermediarios[actual], alto, largo })
        }
    }
}
const utiles = {
    datosCuadrilatero(trayecto) {
        let x = 0;
        let y = 0;
        let esquina = [{ x, y }, { x, y }, { x, y }, { x, y }]
        const priCord = trayecto[0];
        const ultCord = trayecto[trayecto.length - 1];
        if (priCord.x >= ultCord.x) {
            esquina[0].x = priCord.x
            esquina[1].x = ultCord.x
            esquina[2].x = ultCord.x
            esquina[3].x = priCord.x
        } else {
            esquina[0].x = ultCord.x
            esquina[1].x = priCord.x
            esquina[2].x = priCord.x
            esquina[3].x = ultCord.x
        }
        if (priCord.y >= ultCord.y) {
            esquina[0].y = ultCord.y
            esquina[1].y = ultCord.y
            esquina[2].y = priCord.y
            esquina[3].y = priCord.y
        } else {
            esquina[0].y = priCord.y
            esquina[1].y = priCord.y
            esquina[2].y = ultCord.y
            esquina[3].y = ultCord.y
        }
        return esquina;
    },
    borrarRecorridoIntermedio(conf) { // elimina todo el trayecto basura para cuando se usa un elemento que no requiere mas que los puntos inicial y final
        let modificado = conf;
        modificado.contexto.recorrido = [conf.contexto.recorrido[0], conf.contexto.recorrido[conf.contexto.recorrido.length - 1]]
        return modificado;
    },
    eliminarTrayectoInutil(trazo) { // para cuando se usan pinceles y se general lineas de recorrido , para acortar el recorrido[] , agregar trazos diagonales
        // no funca no usar AUN
        let trayectoOptimizado = trazo;
        let trayecto = trazo.contexto.recorrido;
        // limpieza de puntos repetidos primero
        for (let i = trayecto.length - 1; i > 0; i--) {
            if (trayecto[i].x === trayecto[i - 1].x &&
                trayecto[i].y === trayecto[i - 1].y) {
                trayecto.splice(i, 1)
            }
        }

        trayectoOptimizado.contexto.recorrido = recorrido;
        return trayectoOptimizado;
    },
    medidaPixelesCanvas(canvas) {// dice cuantos pixeles reales mide uno de canvas  // recibe el canvas ya en  contexto osea el ctx como dice gemini
        const canvasInfo = canvas.getBoundingClientRect();
        const medidasCanvas = { real: { w: canvas.width, h: canvas.height }, css: { w: canvasInfo.width, h: canvasInfo.height } }


        return { ancho: (canvasInfo.width / canvas.width), alto: (canvasInfo.height / canvas.height) };
    },
    adaptarCordCanvas(cordX, cordY, canvas) {//usar para convertir la cordenada obtenida para que sea la cordenada real tocada del canvas
        const tamanio = this.medidaPixelesCanvas(canvas);
        const ubicacionClick = this.obtUbicClickElem(cordX, cordY, canvas);
        //return { x: ((ubicacionClick.x / tamanio.ancho) | 0) + 0.5, y: ((ubicacionClick.y / tamanio.alto) | 0) + 0.5 };
        //return { x: ((ubicacionClick.x / tamanio.ancho) ) , y: ((ubicacionClick.y / tamanio.alto))  };
        return { x: (Math.floor(ubicacionClick.x / tamanio.ancho)), y: (Math.floor(ubicacionClick.y / tamanio.alto)) };
    },
    obtUbicClickElem(cordX, cordY, elemento) {
        const infoObjeto = { x: elemento.getBoundingClientRect().x, y: elemento.getBoundingClientRect().y };
        return { x: cordX - infoObjeto.x, y: cordY - infoObjeto.y };
    },
    colorHexaRgba(hex) {
        const h = hex.replace('#', '');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        const a = parseInt(h.substring(6, 8), 16)

        const rgba = (a !== undefined && !Number.isNaN(a)) ? { r, g, b, a } : { r, g, b }
        return rgba
    },
    colorRgbaHexa({ r, g, b, a }) {
        // Asegura que los valores estén en el rango 0-255 y sean enteros
        const toHex = (n) => {
            const clamped = Math.max(0, Math.min(255, Math.round(n)));
            return clamped.toString(16).padStart(2, '0');
        };
        let hex = (a !== undefined) ? `${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}` : `${toHex(r)}${toHex(g)}${toHex(b)}`

        return hex;
    },
    calentarMotorGrafico() { // segun gemini el motor de crhome necesita calentar motores digamos

        const lienzoCalenton = lienzos.obtener({ largo: 64, alto: 64, muchaLectura: true })
        for (let i = 0; i < 50; i++) {
            lienzoCalenton.obtenerBufferSeccionado();
        }
    }
}
const configuracion = {
    configurarEsteticaCanvas(canvas) { // se lo pedi a gemini
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // 2. ¡MUY IMPORTANTE! Para navegadores viejos o Firefox/Safari, 
        // a veces hay que usar los prefijos viejos para asegurarse de que se apague:
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        canvas.style.imageRendering = 'pixelated';
        canvas.style.imageRendering = 'crisp-edges'; // me lo tiro gemini , para el navegador de mierda pq lo difumina
    },
    agregarCapaBase() {
        const lienzo = mesaTrabajo;
        lienzo.capas = new grupoCapas({
            capaPadre: undefined,
            idCapa: 0,
            lienzo: lienzos.obtener({
                largo: lienzo.confCapas.largoLienzo,
                alto: lienzo.confCapas.altoLienzo
            })
        });
        lienzo.grupoCapasActiva = lienzo.capas;
        lienzo.agregarCapa(0)
    },

    configuracionesBase(canvas) {
        this.agregarCapaBase()
        this.configurarEsteticaCanvas(canvas)
        pintor.cargarHerramientas()

    }
}
const absoluteArt = {
    mesaTrabajo,
    lienzo: lienzos,
    utiles,
    pintor,
    configuracion
}
