class herramientaDibujo extends herramienta {
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
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
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
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
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
    }
    usar({ lienzo, trazo, lienzoIntermediario }) { // ({ x1, y1, x2, y2, grosor, r, g, b, a })
        if (!this.trazoValido(trazo)) return
        lienzoIntermediario.lienzoComun.pintarLinea({
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
        lienzo.pegarLienzo({ lienzo: lienzoIntermediario.lienzoComun, x: 0, y: 0, modoPegado: trazo.modoDibujo })
    }
    condicionesEspeciales(trazo) {
        const tam = trazo.cajaDelimitadora();
        if (tam.alto + tam.largo <= 0) return false

        return true
    }
}
class rectanguloSimple extends figura {
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
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
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
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
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
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
    constructor({ nombre, categoria, trayectoMuyLargo }) {
        super({ nombre, categoria })
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
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
    }
    conectable = false;
}
class selloCuadrado extends sello {
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
    }
    usar({ x, y, grosor, rgb, a, lienzo }) {
        lienzo.pintarRectangulo({ // pintarRectangulo({ x, y, largo, alto, r, g, b, a })
            x: x - Math.floor(grosor / 2),
            y: y - Math.floor(grosor / 2),
            largo: grosor,
            alto: grosor,
            r: rgb[0].r,
            g: rgb[0].g,
            b: rgb[0].b,
            a
        })
    }
}
class cuadradoDobleColor extends sello {
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
    }
    usar({ x, y, grosor, rgb, a, lienzo }) {
        lienzo.pintarRectangulo({ // pintarRectangulo({ x, y, largo, alto, r, g, b, a })
            x: x - Math.floor(grosor / 2),
            y: y - Math.floor(grosor / 2),
            largo: grosor / 2,
            alto: grosor,
            r: rgb[0].r,
            g: rgb[0].g,
            b: rgb[0].b,
            a
        })
        lienzo.pintarRectangulo({ // pintarRectangulo({ x, y, largo, alto, r, g, b, a })
            x: x,
            y: y - Math.floor(grosor / 2),
            largo: grosor / 2,
            alto: grosor,
            r: rgb[1].r,
            g: rgb[1].g,
            b: rgb[1].b,
            a
        })
    }
}
class selloCircular extends sello {
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
    }
    conectable = true;

    usar({ x, y, grosor, rgb, a, lienzo }) {
        lienzo.pintarCirculo({
            x,
            y,
            radio: grosor / 2,
            r: rgb[0].r,
            g: rgb[0].g,
            b: rgb[0].b,
            a,
            rotacion: 0,
            inicio: 0,
            fin: Math.PI * 2
        })
    }

    conectarSellos({ trayecto, grosor, rgb, a, lienzo }) {
        lienzo.pintarTrayectoLineas({
            trayecto,
            grosor,
            r: rgb[0].r,
            g: rgb[0].g,
            b: rgb[0].b,
            a
        })
    }
}
class selloCaligrafia extends sello {
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
    }
    conectable = true;

    usar({ x, y, grosor, rgb, a, lienzo }) {
        lienzo.pintarLinea({
            x1: x - Math.floor(grosor / 2),
            y1: y - Math.floor(grosor / 2),
            x2: x + Math.floor(grosor / 2),
            y2: y + Math.floor(grosor / 2),
            grosor: 1,
            r: rgb[0].r,
            g: rgb[0].g,
            b: rgb[0].b,
            a
        })
    }

    conectarSellos({ trayecto, grosor, rgb, a, lienzo }) {
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
                r: rgb[0].r,
                g: rgb[0].g,
                b: rgb[0].b,
                a
            })
        }
    }
}
class poligonoSimple extends figura {
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
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
        trazoTransformado.suavizado = 0;
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
class pincelSellosSimple extends pincel {
    constructor({ nombre, categoria, trayectoMuyLargo }) {
        super({ nombre, categoria, trayectoMuyLargo })
    }

    dibujo(lienzo, trazo) {
        const sello = pintor.obtenerHerramienta(trazo.sello)
        if (!trazo.continuidad) {
            for (let i = 0; i < trazo.trayectos.length; i++) {
                let trayectoSuavizado = (trazo.suavizado) ? trazo.obtenerTrayectoSuavizado(trazo.trayectos[i], trazo.puntosSuavizado) : trazo.trayectos[i]
                if (trazo.separar) {
                    const infoSeparacion = trazo.ajustarSeparacionTrayecto({ sobrante: trazo.sobrante, trayecto: trayectoSuavizado })
                    trayectoSuavizado = infoSeparacion.trayectoSeccionado
                    if (trazo.sobrante !== undefined) trazo.sobrante = infoSeparacion.sobrante
                }
                const cordenadas = trayectoSuavizado
                for (const cord of cordenadas) {
                    sello.usar({
                        x: cord.x + trazo.puntoInicial.x,
                        y: cord.y + trazo.puntoInicial.y,
                        grosor: trazo.grosor,
                        rgb: trazo.rgba,
                        a: 1,
                        lienzo: lienzo
                    })
                }
            }
        } else {
            if (sello.conectable) {
                for (let i = 0; i < trazo.trayectos.length; i++) {
                    let trayectoSuavizado = (trazo.suavizado) ? trazo.obtenerTrayectoSuavizado(trazo.trayectos[i], trazo.puntosSuavizado) : trazo.trayectos[i]
                    const obtenerTrayectoAsboluto = () => {
                        const trayecto = []
                        for (const cord of trayectoSuavizado) {
                            trayecto.push({ x: cord.x + trazo.puntoInicial.x, y: cord.y + trazo.puntoInicial.y })
                        }
                        return trayecto
                    }
                    const cordAbsoluta = obtenerTrayectoAsboluto();
                    for (const cord of cordAbsoluta) {
                        sello.usar({
                            x: cord.x,
                            y: cord.y,
                            grosor: trazo.grosor,
                            rgb: trazo.rgba,
                            a: 1,
                            lienzo: lienzo
                        })
                    }
                    sello.conectarSellos({
                        trayecto: cordAbsoluta,
                        grosor: trazo.grosor,
                        rgb: trazo.rgba,
                        a: 1,
                        lienzo: lienzo
                    })

                }
            } else {
                const separacionActual = trazo.separacion
                const separarActual = trazo.separar
                trazo.separar = true
                trazo.separacion = 0
                trazo.continuidad = false
                this.dibujo(lienzo, trazo)
                trazo.separar = separarActual
                trazo.separacion = separacionActual
                trazo.continuidad = true
            }
        }

    }

    usar({ lienzo, lienzoIntermediario, trazo }) {
        if (trazo.rgba[0].a === 0) return
        this.dibujo(lienzoIntermediario.lienzoComun, trazo)
        lienzo.pegarLienzo({ lienzo: lienzoIntermediario.lienzoComun, x: 0, y: 0, alpha: trazo.rgba[0].a, modoPegado: trazo.modoDibujo })
    }
}

class figuraSellos extends lineaSimple {
    constructor({ nombre, categoria, verticesFigura }) {
        super({ nombre, categoria })
        this.verticesFigura = verticesFigura
    }
    usar({ lienzo, trazo, lienzoIntermediario }) {
        if (!this.trazoValido(trazo)) return
        lienzos.acomodar({ lienzo: lienzoIntermediario.lienzoComunSecundario, alto: lienzo.alto, largo: lienzo.largo })

        const clonTrazo = trazo.clonar();
        clonTrazo.herramienta = 'pincelSellosSimple'
        clonTrazo.modoDibujo = 'normal'
        clonTrazo.separar = false;
        clonTrazo.suavizado = 0;
        const puntosVertices = this.transformarVerticesPuntos(trazo)
        clonTrazo.trayectos = puntosVertices;
        pintor.dibujar(lienzoIntermediario.lienzoComunSecundario, clonTrazo)

        lienzo.pegarLienzo({ lienzo: lienzoIntermediario.lienzoComunSecundario, x: 0, y: 0, alpha: trazo.rgba[0].a, modoPegado: trazo.modoDibujo })

    }
    transformarVerticesPuntos(trazo) {
        const caja = trazo.cajaDelimitadora()
        const secciones = []

        const restarX = (caja.x < 0 && trazo.respetarSignoX) ? true : false
        const restarY = (caja.y < 0 && trazo.respetarSignoY) ? true : false

        let sobrante = 0
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
            if (!trazo.continuidad) {
                const seccionado = trazo.ajustarSeparacionTrayecto({ sobrante, trayecto: puntos })
                sobrante = seccionado.sobrante
                secciones.push(seccionado.trayectoSeccionado)
            } else {
                secciones.push(puntos)
            }

        }
        return secciones;
    }
}
class baldeSimple extends herramienta {
    constructor({ nombre, categoria }) {
        super({ nombre, categoria })
    }
    preRenderizable = false;
    usar({ lienzo, lienzoIntermediario, trazo, comparadorPixel }) {
        const puntoBalde = {
            x: trazo.puntoInicial.x + trazo.trayectos[0][trazo.trayectos[0].length - 1].x,
            y: trazo.puntoInicial.y + trazo.trayectos[0][trazo.trayectos[0].length - 1].y
        };

        const colorComparar = {
            r: trazo.colorCompararBalde.r,
            g: trazo.colorCompararBalde.g,
            b: trazo.colorCompararBalde.b,
            a: trazo.colorCompararBalde.a * 255
        }

        const manchaClickeada = lienzo.obtenerManchaInundacion({
            cordenada: puntoBalde,
            comparadorPixel,
            colorComparar
        });
        const rgba = trazo.rgba[0];
        const obtenerEquivalentes = comparadorPixel.obtenerEquivalenciaCanales({
            r: rgba.r,
            g: rgba.g,
            b: rgba.b,
            alpha: rgba.a * 255,
        })
        const coloresMancha = Object.keys(manchaClickeada.mancha)
        for (const color of coloresMancha) {
            let alpha = rgba.a
            let r = rgba.r;
            let g = rgba.g;
            let b = rgba.b;

            if (trazo.reflejarCanales) {
                const rgbaActual = utiles.colorHexaRgba(color)
                const equivalentesCanales = obtenerEquivalentes({
                    r: rgbaActual.r,
                    g: rgbaActual.g,
                    b: rgbaActual.b,
                    alpha: rgbaActual.a,
                })
                r = Math.round(equivalentesCanales.r)
                g = Math.round(equivalentesCanales.g)
                b = Math.round(equivalentesCanales.b)
                alpha = equivalentesCanales.alpha / 255
            }
            for (const tramo of manchaClickeada.mancha[color]) {
                lienzoIntermediario.lienzoComun.pintarRectangulo({
                    x: tramo.x0,
                    y: tramo.y,
                    largo: tramo.x1 - tramo.x0 + 1,
                    alto: 1,
                    r,
                    g,
                    b,
                    a: alpha,
                });
            }
        }
        if (trazo.setearBalde) {
            for (const color of coloresMancha) {
                for (const tramo of manchaClickeada.mancha[color]) {
                    lienzo.limpiarRectangulo({
                        x: tramo.x0,
                        y: tramo.y,
                        largo: tramo.x1 - tramo.x0 + 1,
                        alto: 1,
                    });
                }
            }
        }
        lienzo.pegarLienzo({
            lienzo: lienzoIntermediario.lienzoComun,
            x: 0,
            y: 0,
            modoPegado: trazo.modoDibujo
        });
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

pintor.cargarCategorias([
    { nombreCategoria: 'herramienta' },
    { nombreCategoria: 'edicionLienzo', categoriaPadre: 'herramienta' },
    { nombreCategoria: 'mutacionColor', categoriaPadre: 'edicionLienzo' },
    { nombreCategoria: 'dibujo', categoriaPadre: 'herramienta' },
    { nombreCategoria: 'figuras', categoriaPadre: 'dibujo' },
    { nombreCategoria: 'pinceles', categoriaPadre: 'dibujo' },
    { nombreCategoria: 'sello', categoriaPadre: 'dibujo' },
]);

const herramientas = [
    { clase: 'lineaSimple', parametros: { nombre: 'lineaSimple', categoria: pintor.obtenerCategoria('figuras') } },
    { clase: 'rectanguloSimple', parametros: { nombre: 'rectanguloSimple', categoria: pintor.obtenerCategoria('figuras') } },
    { clase: 'elipseSimple', parametros: { nombre: 'elipseSimple', categoria: pintor.obtenerCategoria('figuras') } },
    { clase: 'circuloSimple', parametros: { nombre: 'circuloSimple', categoria: pintor.obtenerCategoria('figuras') } },
    { clase: 'poligonoSimple', parametros: { nombre: 'poligonoSimple', categoria: pintor.obtenerCategoria('figuras') } },
    { clase: 'selloCuadrado', parametros: { nombre: 'selloCuadrado', categoria: pintor.obtenerCategoria('sello') } },
    { clase: 'cuadradoDobleColor', parametros: { nombre: 'cuadradoDobleColor', categoria: pintor.obtenerCategoria('sello') } },
    { clase: 'selloCaligrafia', parametros: { nombre: 'selloCaligrafia', categoria: pintor.obtenerCategoria('sello') } },
    { clase: 'selloCircular', parametros: { nombre: 'selloCircular', categoria: pintor.obtenerCategoria('sello') } },
    { clase: 'pincelSellosSimple', parametros: { nombre: 'pincelSellosSimple', categoria: pintor.obtenerCategoria('pinceles'), trayectoMuyLargo: 4000 } },
    { clase: 'baldeSimple', parametros: { nombre: 'baldeSimple', categoria: pintor.obtenerCategoria('mutacionColor') } },
    {
        clase: 'figuraSellos', parametros: {
            nombre: 'cruzSellos', categoria: pintor.obtenerCategoria('figuras'), verticesFigura:
                [[{ x: 0, y: 0 },
                { x: 1, y: 1 }],
                [{ x: 1, y: 0 },
                { x: 0, y: 1 }]]
        }
    },
    {
        clase: 'figuraSellos', parametros: {
            nombre: 'trianguloSellos', categoria: pintor.obtenerCategoria('figuras'), verticesFigura:
                [[{ x: 0, y: 1 },
                { x: 1, y: 1 },
                { x: 0.5, y: 0 },
                { x: 0, y: 1 },]]
        }
    },
    {
        clase: 'figuraSellos', parametros: {
            nombre: 'rectanguloSello', categoria: pintor.obtenerCategoria('figuras'), verticesFigura:
                [[{ x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 1, y: 1 },
                { x: 1, y: 0 },
                { x: 0, y: 0 },]]
        }
    },
    {
        clase: 'figuraSellos', parametros: {
            nombre: 'romboSello', categoria: pintor.obtenerCategoria('figuras'), verticesFigura:
                [[{ x: 0.5, y: 0 },
                { x: 1, y: 0.5 },
                { x: 0.5, y: 1 },
                { x: 0, y: 0.5 },
                { x: 0.5, y: 0 },]]
        }
    },
    {
        clase: 'figuraSellos', parametros: {
            nombre: 'pentagonoSello', categoria: pintor.obtenerCategoria('figuras'), verticesFigura:
                [[{ x: 0.8, y: 1 },
                { x: 0.2, y: 1 },
                { x: 0, y: 0.4 },
                { x: 0.5, y: 0 },
                { x: 1, y: 0.4 },
                { x: 0.8, y: 1 },]]
        }
    },
    {
        clase: 'figuraSellos', parametros: {
            nombre: 'flechaHorizontal', categoria: pintor.obtenerCategoria('figuras'), verticesFigura:
                [[{ x: 0, y: 0.25 },
                { x: 0.5, y: 0.25 },
                { x: 0.5, y: 0 },
                { x: 1, y: 0.5 },
                { x: 0.5, y: 1 },
                { x: 0.5, y: 0.75 },
                { x: 0, y: 0.75 },
                { x: 0, y: 0.25 },]]
        }
    },
    {
        clase: 'figuraSellos', parametros: {
            nombre: 'estrellaSellos', categoria: pintor.obtenerCategoria('figuras'), verticesFigura:
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
                ]]
        }
    },
    {
        clase: 'figuraSellos', parametros: {
            nombre: 'lineaSello', categoria: pintor.obtenerCategoria('figuras'), verticesFigura:
                [[{ x: 0, y: 0 },
                { x: 1, y: 1 }]]
        }
    },
    {
        clase: 'figuraSellos', parametros: {
            nombre: 'crepperSello', categoria: pintor.obtenerCategoria('figuras'), verticesFigura:
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
                { x: 0.4, y: 0.4 }]]
        }
    },
    {
        clase: 'figuraSellos', parametros: {
            nombre: 'estresadorGrilla', categoria: pintor.obtenerCategoria('figuras'), verticesFigura: [
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
                [{ x: 0, y: 0.96 }, { x: 1, y: 0.96 }], [{ x: 0, y: 1.00 }, { x: 1, y: 1.00 }]]
        }
    },
    {
        clase: 'figuraSellos', parametros: {
            nombre: 'prueba', categoria: pintor.obtenerCategoria('figuras'), verticesFigura:
                [[{ x: 0, y: 0 }, { x: 1, y: 0 }],
                [{ x: 0, y: 0.1 }, { x: 1, y: 0.1 }],
                [{ x: 0, y: 0.2 }, { x: 1, y: 0.2 }],
                [{ x: 0, y: 0.3 }, { x: 1, y: 0.3 }],
                [{ x: 0, y: 0.4 }, { x: 1, y: 0.4 }],
                [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }],
                [{ x: 0, y: 0.6 }, { x: 1, y: 0.6 }],
                [{ x: 0, y: 0.7 }, { x: 1, y: 0.7 }],
                [{ x: 0, y: 0.8 }, { x: 1, y: 0.8 }],
                [{ x: 0, y: 0.9 }, { x: 1, y: 0.9 }],
                [{ x: 0, y: 1 }, { x: 1, y: 1 }],
                ]
        }
    },
]

pintor.cargarHerramientas(herramientas)