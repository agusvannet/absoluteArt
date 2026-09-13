
class categoria {
    constructor(nombre, categoria) {
        this.nombre = nombre;
        this.categoria = categoria; // igual a carpeta padre
    }
    herramientas = [];
    subCategorias = [];
}
class herramienta {
    constructor({ nombre, categoria }) {
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

class capaBase {
    constructor(capaPadre, idCapa, lienzo, modoFusion = 'normal') {
        this.lienzo = lienzo
        this.id = idCapa
        this.capaPadre = capaPadre;
        this.modoFusion = modoFusion;
    }
    x = 0;
    y = 0;
    visible = true;
    opacidad = 1;
    renderizar({ lienzoReceptor, modoFusion = this.modoFusion, x = this.x, y = this.y, alpha = this.opacidad }) {
        if (!this.visible || this.opacidad === 0) return
        lienzoReceptor.pegarLienzo({ lienzo: this.lienzo, x, y, alpha, modoPegado: modoFusion })
    }
    cambiarOpacidad(nuevaOpacidad) {
        this.opacidad = nuevaOpacidad
        if (this.capaPadre) this.capaPadre.preRenderizar();
    }
    cambiarModoFusion(nuevoModoFusion) {
        if (this.lienzo.modosPegado[nuevoModoFusion] !== undefined)
            this.modoFusion = nuevoModoFusion
        else
            this.modoFusion = 'normal'

    }
}
class grupoCapas extends capaBase {
    constructor({ capaPadre, idCapa, lienzo, modoFusion = 'normal', mascaras = [] }) {
        super(capaPadre, idCapa, lienzo, modoFusion, mascaras)
        this.nombre = 'grupo ' + idCapa
    }
    tipoCapa = 'grupo';
    contenido = [];
    preRenderizar({ capaSustituir, lienzoSustituto } = {}) {
        if (this.contenido.length === 0) return
        this.lienzo.limpiar()
        for (const capa of this.contenido) {
            if (capa !== capaSustituir) {
                capa.renderizar({ lienzoReceptor: this.lienzo });
            } else {
                this.lienzo.pegarLienzo({ lienzo: lienzoSustituto, x: capa.x, y: capa.y, modoPegado: capa.modoFusion })
            }
        }

        if (this.capaPadre)
            this.capaPadre.preRenderizar()
    }
    dividirCapas({ capa }) {
        let capaEncontrada = false;
        let anteriores = [];
        let posteriores = [];
        let ancestros = [];
        let padre = capa.capaPadre
        while (padre) {
            ancestros.push(padre);
            padre = padre.capaPadre
        }
        const esAncestro = (grupo) => {
            for (const ancestro of ancestros) {
                if (grupo === ancestro) return true
            }
            return false
        }
        const recorrerCapa = (capa, grupoRecorrer) => {
            for (const capaActual of grupoRecorrer) {
                if (!esAncestro(capaActual)) {
                    if (capaEncontrada) posteriores.push(capaActual);
                    if (capaActual === capa) capaEncontrada = true
                    if (!capaEncontrada) anteriores.push(capaActual);
                } else {
                    recorrerCapa(capa, capaActual.contenido)
                }
            }
        }
        recorrerCapa(capa, this.contenido)
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
    constructor({ capaPadre, idCapa, lienzo, modoFusion = 'normal', frecuenciaCapturas, trayectoMuyLargo, limiteCapturasHistorial, mascaras = [] }) {
        super(capaPadre, idCapa, lienzo, modoFusion, mascaras)
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
        })

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
    clonar() {

    }
}
class trazo {
    constructor({
        trayectos,
        puntoInicial,
        rgba,
        grosor,
        herramienta,
        sello,
        continuidad,
        separacion,
        modoDibujo,
        toleranciaCanal,
        reflejarCanal,
        setearBalde,
        modeloColorComparador,
        reflejarCanales,
        colorCompararBalde,
        respetarSignoX,
        respetarSignoY,
        suavizado,
        puntosSuavizado,
    }) { // le puedo agregar cosas pero por ahora va este 
        this.trayectos = trayectos;
        this.puntoInicial = puntoInicial;
        this.rgba = rgba;
        this.grosor = grosor;
        this.herramienta = herramienta; // es un string, simplemente el nombre de la herramienta
        this.sello = sello;
        this.continuidad = continuidad;
        this.separacion = separacion;
        this.modoDibujo = modoDibujo;
        this.toleranciaCanal = {
            alpha: toleranciaCanal.alpha,
            rgb: {
                r: toleranciaCanal.rgb.r,
                g: toleranciaCanal.rgb.g,
                b: toleranciaCanal.rgb.b
            },
            hsv: {
                h: toleranciaCanal.hsv.h,
                s: toleranciaCanal.hsv.s,
                v: toleranciaCanal.hsv.v
            }
        }
        this.reflejarCanal = {
            alpha: reflejarCanal.alpha,
            rgb: {
                r: reflejarCanal.rgb.r,
                g: reflejarCanal.rgb.g,
                b: reflejarCanal.rgb.b
            },
            hsv: {
                h: reflejarCanal.hsv.h,
                s: reflejarCanal.hsv.s,
                v: reflejarCanal.hsv.v
            }
        }
        this.setearBalde = setearBalde;
        this.modeloColorComparador = modeloColorComparador;
        this.reflejarCanales = reflejarCanales;
        this.colorCompararBalde = colorCompararBalde;
        this.respetarSignoX = respetarSignoX;
        this.respetarSignoY = respetarSignoY;
        this.suavizado = suavizado;
        this.puntosSuavizado = puntosSuavizado;
    }
    separar = true
    minimoSeparacion = 0.01
    maxPxMs = 20
    minPxMs = 3000
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
            modoDibujo: this.modoDibujo,
            toleranciaCanal: {
                alpha: this.toleranciaCanal.alpha,
                rgb: {
                    r: this.toleranciaCanal.rgb.r,
                    g: this.toleranciaCanal.rgb.g,
                    b: this.toleranciaCanal.rgb.b
                },
                hsv: {
                    h: this.toleranciaCanal.hsv.h,
                    s: this.toleranciaCanal.hsv.s,
                    v: this.toleranciaCanal.hsv.v
                }
            },

            reflejarCanal: {
                alpha: this.reflejarCanal.alpha,
                rgb: {
                    r: this.reflejarCanal.rgb.r,
                    g: this.reflejarCanal.rgb.g,
                    b: this.reflejarCanal.rgb.b
                },
                hsv: {
                    h: this.reflejarCanal.hsv.h,
                    s: this.reflejarCanal.hsv.s,
                    v: this.reflejarCanal.hsv.v
                }
            },
            setearBalde: this.setearBalde,
            modeloColorComparador: this.modeloColorComparador,
            reflejarCanales: this.reflejarCanales,
            colorCompararBalde: {
                r: this.colorCompararBalde.r,
                g: this.colorCompararBalde.g,
                b: this.colorCompararBalde.b,
                a: this.colorCompararBalde.a
            },
            respetarSignoX: this.respetarSignoX,
            respetarSignoY: this.respetarSignoY,
            suavizado,
            puntosSuavizado,
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
    ajustarSeparacionTrayecto({ separacion, sobrante = 0, trayecto } = {}) {
        let trayectoSeccionado = [];
        if (sobrante === 0) trayectoSeccionado = [{ x: trayecto[0].x, y: trayecto[0].y }];
        if (!separacion) separacion = Math.max(1, (this.grosor * Math.max(this.separacion, this.minimoSeparacion)));

        for (let i = 0; i < trayecto.length - 1; i++) {
            const origenTramo = trayecto[i];
            const finTramo = trayecto[i + 1];

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
    obtenerTrayectoSuavizado(puntos, puntosSuavizado) {
        if (puntos.length < 3) return puntos;

        const trayectoSuavizado = [{ x: puntos[0].x, y: puntos[0].y }];
        const radio = Math.floor(puntosSuavizado / 2);

        for (let i = 1; i < puntos.length - 1; i++) {
            let sumaX = 0, sumaY = 0, puntosValidos = 0;

            const minimo = Math.max(0, i - radio);
            const maximo = Math.min(puntos.length - 1, i + radio);

            for (let n = minimo; n <= maximo; n++) {
                sumaX += puntos[n].x;
                sumaY += puntos[n].y;
                puntosValidos++;
            }

            const puntoPromedio = {
                x: sumaX / puntosValidos,
                y: sumaY / puntosValidos
            };

            trayectoSuavizado.push({
                x: puntoPromedio.x * this.suavizado + puntos[i].x * (1 - this.suavizado),
                y: puntoPromedio.y * this.suavizado + puntos[i].y * (1 - this.suavizado),
            });
        }

        trayectoSuavizado.push({ x: puntos[puntos.length - 1].x, y: puntos[puntos.length - 1].y });
        return trayectoSuavizado;
    }
}

const mesaTrabajo = {
    confCapas: {
        frecuenciaCapturas: 10,
        trayectoMuyLargo: 1000,
        limiteCapturasHistorial: 5,
        largoLienzo: 1280,
        altoLienzo: 720
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
    modoFusionPosterior: 'normal',

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
                lienzo: pintor.lienzosIntermediarios.lienzoPreVisualizacion,
                alto: this.confCapas.altoLienzo,
                largo: this.confCapas.largoLienzo
            })
        this.prepararLienzosSanduich()
        this.trazoGuardar.agregarTrazo(cordenada)
        console.log(cordenada)
        this.trazoTemporal = this.trazoGuardar.clonar()
        this.trazoTemporal.sobrante = 0;

        if (this.herramientaActiva.preRenderizable) {
            lienzoReal.limpiar()
            this.renderizarTrazo({
                lienzoReal,
                trazoTemporal: this.trazoTemporal,
                trazoReal: this.trazoGuardar,
            })
        }
    },
    arrastreClick({ cordenada, lienzoReal }) {
        if (this.capasIndividualesVivas.length === 0) return

        if (this.herramientaActiva.perteneceCategoria(pintor.obtenerCategoria('pinceles'))) {
            this.trazoGuardar.agregarCordenada(cordenada)
            let cordenadasManetener = Math.min(this.trazoGuardar.trayectos[0].length, this.trazoGuardar.puntosSuavizado)
            console.log(cordenadasManetener)
            for (let i = cordenadasManetener; i > 0; i--) {
                if (this.trazoGuardar.trayectos[0][this.trazoGuardar.trayectos[0].length - i] - i === undefined) continue
                this.trazoTemporal.trayectos[0][cordenadasManetener - i] = this.trazoGuardar.trayectos[0][this.trazoGuardar.trayectos[0].length - i]
            }
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
            this.capas.renderizar({ lienzoReceptor: lienzoReal })

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
            this.renderizarFigura({ lienzoReal, trazo: trazoTemporal })
        }
    },
    renderizarIntermedioPincel({ lienzoReal, trazoTemporal, trazoReal }) {
        const lienzoPincel = pintor.lienzosIntermediarios.lienzoPreVisualizacion;
        lienzos.acomodar({ lienzo: lienzoPincel, alto: lienzoReal.alto, largo: lienzoReal.largo, limpiar: false })

        if (this.lienzoPrevio) lienzoReal.pegarLienzo({ lienzo: this.lienzoPrevio, x: 0, y: 0, })
        trazoTemporal.rgba[0].a = 1

        this.lienzoCapaActual.limpiar()
        this.capaActiva.renderizar({ lienzoReceptor: this.lienzoCapaActual, modoFusion: 'normal' })
        this.herramientaActiva.dibujo(lienzoPincel, trazoTemporal)
        this.lienzoCapaActual.pegarLienzo({ lienzo: lienzoPincel, x: 0, y: 0, alpha: this.trazoGuardar.rgba[0].a, modoPegado: trazoReal.modoDibujo })


        lienzoReal.pegarLienzo({ lienzo: this.lienzoCapaActual, y: 0, x: 0, modoPegado: this.capaActiva.modoFusion })
        if (this.lienzoPosterior) lienzoReal.pegarLienzo({ lienzo: this.lienzoPosterior, y: 0, x: 0, modoPegado: this.modoFusionPosterior })
    },
    renderizarFigura({ lienzoReal, trazo }) {
        if (this.lienzoPrevio) lienzoReal.pegarLienzo({ lienzo: this.lienzoPrevio, x: 0, y: 0 })


        this.lienzoCapaActual.limpiar()
        this.capaActiva.renderizar({ lienzoReceptor: this.lienzoCapaActual, modoFusion: 'normal' })
        pintor.dibujar(this.lienzoCapaActual, trazo)



        lienzoReal.pegarLienzo({ lienzo: this.lienzoCapaActual, y: 0, x: 0, modoPegado: this.capaActiva.modoFusion })
        if (this.lienzoPosterior) lienzoReal.pegarLienzo({ lienzo: this.lienzoPosterior, y: 0, x: 0, modoPegado: this.modoFusionPosterior })
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
                actual.renderizar({ lienzoReceptor: this.lienzoPrevio })
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

            capasDivididas.posteriores[0].renderizar({ lienzoReceptor: this.lienzoPosterior, modoFusion: 'normal' })
            this.modoFusionPosterior = capasDivididas.posteriores[0].modoFusion
            for (let i = 1; i < capasDivididas.posteriores.length; i++) {
                capasDivididas.posteriores[i].renderizar({ lienzoReceptor: this.lienzoPosterior })
            }
        } else {
            if (this.lienzoPosterior) this.lienzoPosterior.limpiar()
        }
        if (!this.lienzoCapaActual)
            this.lienzoCapaActual = lienzos.obtener({ largo: this.confCapas.largoLienzo, alto: this.confCapas.altoLienzo, tipo: 'temporal' })
        this.lienzoCapaActual.limpiar()
        this.capaActiva.renderizar({ lienzoReceptor: this.lienzoCapaActual })
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
        this.capas.renderizar({ lienzoReceptor: lienzo })
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
        lienzoPreVisualizacion: lienzos.obtener({ muchaLectura: true, alto: 1, largo: 1, tipo: 'temporal' }),
        lienzoPreVisualizacionSecundario: lienzos.obtener({ muchaLectura: true, alto: 1, largo: 1, tipo: 'temporal' }),
        lienzoCapa: lienzos.obtener({ muchaLectura: true, alto: 1, largo: 1, tipo: 'temporal' }),
        lienzoComun: lienzos.obtener({ muchaLectura: true, alto: 1, largo: 1, tipo: 'temporal' }),
        lienzoComunSecundario: lienzos.obtener({ muchaLectura: true, alto: 1, largo: 1, tipo: 'temporal' })
    },
    categorias: new categoria('herramientas'),
    listaHerramientas: [],
    listaCategorias: { herramientas: this.categorias, undefined: this.categorias },
    bufferSeccionado: undefined,
    herramientaUltimoDibujo: undefined,
    ultimoLienzoId: undefined,

    generadorHerramientas: { // uso generadorHerramientas['nombreClase'](parametros)
        lineaSimple: (parametros) => { return new lineaSimple(parametros) },
        rectanguloSimple: (parametros) => { return new rectanguloSimple(parametros) },
        elipseSimple: (parametros) => { return new elipseSimple(parametros) },
        circuloSimple: (parametros) => { return new circuloSimple(parametros) },
        poligonoSimple: (parametros) => { return new poligonoSimple(parametros) },
        selloCuadrado: (parametros) => { return new selloCuadrado(parametros) },
        cuadradoDobleColor: (parametros) => { return new cuadradoDobleColor(parametros) },
        selloCaligrafia: (parametros) => { return new selloCaligrafia(parametros) },
        selloCircular: (parametros) => { return new selloCircular(parametros) },// nombre, cateogoria ( basicos )
        pincelSellosSimple: (parametros) => { return new pincelSellosSimple(parametros) },// nombre, cateogoria ( basicos )
        figuraSellos: (parametros) => { return new figuraSellos(parametros) },// nombre, cateogoria ( basicos )
        baldeSimple: (parametros) => { return new baldeSimple(parametros) },
    },

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
            bufferSeccionado: this.bufferSeccionado,
            comparadorPixel: this.obtenerGeneradorComparadorColor(trazo)
        })

        this.herramientaUltimoDibujo = herramienta
        if (lienzoDibujar.tipo !== 'temporal')
            this.ultimoLienzoId = lienzoDibujar.id
        this.lienzosIntermediarios.lienzoComun.limpiar()
    },
    trazoComplejo(trazo) {
        return this.obtenerHerramienta(trazo.herramienta).trazoComplejo(trazo);
    },
    cargarCategorias(categorias) { // orden ordenado por dios
        const agregarCategoria = ({ nombreCategoria, categoriaPadre }) => {
            this.listaCategorias[nombreCategoria] = (this.agregarCategoria(new categoria(nombreCategoria, this.obtenerCategoria(categoriaPadre))))
        };
        for (const categoria of categorias) {
            agregarCategoria(categoria);
        }
    },
    cargarHerramientas(herramientas) { // orden irrelevante  ,herramientas = [{clase , parametros}]
        for (const herramienta of herramientas) {
            this.listaHerramientas.push(this.agregarHerramienta(this.generadorHerramientas[herramienta.clase](herramienta.parametros)))
        }
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
        if (!this.listaCategorias[nombre]) return this.categorias
        return this.listaCategorias[nombre];
    },
    acomLienzInterm({ alto, largo }) {
        const nombreLienzo = Object.keys(this.lienzosIntermediarios)
        for (const actual of nombreLienzo) {
            lienzos.acomodar({ lienzo: this.lienzosIntermediarios[actual], alto, largo })
        }
    },
    obtenerGeneradorComparadorColor(trazo) {
        switch (trazo.modeloColorComparador) {
            case 'hsv':
                return new compararPixelHsv({
                    nivelReflejoAlpha: trazo.reflejarCanal.alpha,
                    toleranciaA: trazo.toleranciaCanal.alpha,

                    toleranciaH: trazo.toleranciaCanal.hsv.h,
                    toleranciaS: trazo.toleranciaCanal.hsv.s,
                    toleranciaV: trazo.toleranciaCanal.hsv.v,

                    nivelReflejoH: trazo.reflejarCanal.hsv.h,
                    nivelReflejoS: trazo.reflejarCanal.hsv.s,
                    nivelReflejoV: trazo.reflejarCanal.hsv.v,
                })
                break;
            case 'rgb':
                return new comparadorPixelRGBA({
                    nivelReflejoAlpha: trazo.reflejarCanal.alpha,
                    toleranciaA: trazo.toleranciaCanal.alpha,

                    toleranciaR: trazo.toleranciaCanal.rgb.r,
                    toleranciaG: trazo.toleranciaCanal.rgb.g,
                    toleranciaB: trazo.toleranciaCanal.rgb.b,

                    nivelReflejoR: trazo.reflejarCanal.rgb.r,
                    nivelReflejoG: trazo.reflejarCanal.rgb.g,
                    nivelReflejoB: trazo.reflejarCanal.rgb.b,

                })
                break;
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
    colorRgbHvs({ r, g, b, }) {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const v = max / 255;
        const s = max === 0 ? 0 : (max - min) / max;
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
        return {
            h,
            s,
            v
        }
    },
    colorHsvRgb({ h, s, v }) {
        // Normalizar S y V por si vienen en escala 0-100
        const sat = s > 1 ? s / 100 : s;
        const val = v > 1 ? v / 100 : v;

        const c = val * sat;
        const normH = ((h % 360) + 360) % 360;
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
            b: Math.round((bPrime + m) * 255)
        };
    },
    colorRgbaUint32({ r, g, b, a }) { // alpha 0 255
        return (((a & 0xFF) << 24) |
            ((b & 0xFF) << 16) |
            ((g & 0xFF) << 8) |
            (r & 0xFF)) >>> 0;
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
        //canvas.style.imageRendering = 'pixelated';
        //canvas.style.imageRendering = 'crisp-edges'; // me lo tiro gemini , para el navegador de mierda pq lo difumina
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
    }
}
const absoluteArt = {
    mesaTrabajo,
    lienzo: lienzos,
    utiles,
    pintor,
    configuracion
}
