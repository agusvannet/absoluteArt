const pi = 3.141592;
class preset {
    constructor({ trazo, nombre = ('herramienta ' + categoria + ' ' + 'id '), categoria, subCategoria, clonado = false }) {
        this.trazo = trazo;
        this.id = preset.contadorPresets;
        this.nombre = nombre;
        this.categoria = categoria;
        this.subCategoria = subCategoria;
        if (!clonado) {
            preset.contadorPresets++;
        }
    }
    static trayectosPresets = {
        pinceles: [[]],
        figuras: [[]],
    }
    static puntoInicialPreset = {
        pinceles: { x: 0, y: 0 },
        figuras: { x: 0, y: 0 }
    }
    static contadorPresets = 0;

    static rgbaGeneralPresets = [{ r: 255, g: 0, b: 0, a: 1 }, { r: 0, g: 255, b: 255, a: 1 }]
    static rgbaFondoBorrar = { r: 0, g: 0, b: 0, a: 1 }
    static maximoGrosorRenderizar = 50
    renderizarPreset({ canvas, recalcularTrayectos, cantPuntos, altitud, paddingHorizontal, paddingVertical }) {
        const canvasPresetDatos = canvas.getBoundingClientRect()
        if (canvas.height !== canvasPresetDatos.height * 2 || canvas.width !== canvasPresetDatos.width * 2) {
            canvas.height = canvasPresetDatos.height * 2
            canvas.width = canvasPresetDatos.width * 2
        }

        if (recalcularTrayectos) {
            preset.recalcularTrayectos({
                largo: canvas.width,
                alto: canvas.height,
                cantPuntos,
                altitud,
                paddingHorizontal,
                paddingVertical,
            })
        }

        const lienzoPreset = new lienzoHtml({
            largo: canvas.width,
            alto: canvas.height,
            canvas,
        })

        if (this.trazo.modoDibujo === 'borrar') {
            lienzoPreset.pintarRectangulo({
                x: 0,
                y: 0,
                largo: lienzoPreset.largo,
                alto: lienzoPreset.alto,
                r: preset.rgbaFondoBorrar.r,
                g: preset.rgbaFondoBorrar.g,
                b: preset.rgbaFondoBorrar.b,
                a: preset.rgbaFondoBorrar.a,
            })
        }

        const trazoOriginal = this.trazo.grosor;
        if (trazoOriginal > preset.maximoGrosorRenderizar)
            this.trazo.grosor = preset.maximoGrosorRenderizar

        pintor.dibujar({
            lienzoDibujar: lienzoPreset,
            trazo: this.trazo,
            prepararSello: true,
        })

        if (this.trazo.grosor > preset.maximoGrosorRenderizar)
            trazoOriginal = preset.maximoGrosorRenderizar
    }
    clonar() {
        return new preset({
            trazo: this.trazo.clonar(),

            nombre: this.nombre,
            categoria: this.categoria,
            subCategoria: this.subCategoria,
            clonado: true
        })
    }

    static recalcularTrayectos({
        cantPuntos = 10,
        largo = 1,
        alto = 1,
        paddingHorizontal = 0,
        paddingVertical = 0
    }) {
        const tiposTrayectos = Object.keys(preset.trayectosPresets)
        for (const actual of tiposTrayectos) {
            preset.trayectosPresets[actual][0] = []
        }
        preset.puntoInicialPreset.pinceles.x = paddingHorizontal;
        preset.puntoInicialPreset.pinceles.y = alto / 2;

        largo -= paddingHorizontal * 2
        const tamanioSeccion = (pi * 2) / cantPuntos
        const altitud = alto / 2 - paddingVertical
        for (let i = 0; i <= cantPuntos; i++) {
            preset.trayectosPresets.pinceles[0].push(
                new cordenada(
                    largo * (tamanioSeccion * i / (pi * 2)),
                    Math.sin(tamanioSeccion * i).toFixed(5) * altitud
                ))
        }
        preset.puntoInicialPreset.figuras.x = paddingHorizontal;
        preset.puntoInicialPreset.figuras.y = paddingVertical;

        preset.trayectosPresets.figuras[0].push(
            new cordenada(
                0,
                0
            ),
            new cordenada(
                largo,
                alto - paddingVertical * 2
            ))
    }
}

const categoriaPresets = {
    todos: [],
    pinceles: [],
    borradores: [],
    figuras: [],

}
const respaldosPreset = [] // mismos elementos pero inmutables , para poder restablecer estados

function agregarPreset({ trazoPreset, nombre = 'generico', categoria = trazoPreset.herramienta, subCategoria = 'generico' }) {
    if (!categoriaPresets[categoria])
        categoriaPresets[categoria] = {}

    if (!categoriaPresets[categoria][subCategoria])
        categoriaPresets[categoria][subCategoria] = []
    if (!categoriaPresets[categoria].todos)
        categoriaPresets[categoria].todos = []

    const nuevoPreset = new preset({
        trazo: trazoPreset.clonar(false),
        nombre: nombre,
        categoria,
        subCategoria
    })

    if (pintor.obtenerHerramienta(trazoPreset.herramienta).perteneceCategoria(pintor.obtenerCategoria("pinceles"))) {
        nuevoPreset.trazo.trayectos = preset.trayectosPresets.pinceles
        nuevoPreset.trazo.puntoInicial = preset.puntoInicialPreset.pinceles
    } else if (pintor.obtenerHerramienta(trazoPreset.herramienta).perteneceCategoria(pintor.obtenerCategoria("figuras"))) {
        nuevoPreset.trazo.trayectos = preset.trayectosPresets.figuras
        nuevoPreset.trazo.puntoInicial = preset.puntoInicialPreset.figuras
    }
    nuevoPreset.trazo.rgba = preset.rgbaGeneralPresets

    const respaldo = nuevoPreset.clonar(false)
    respaldo.trazo.trayectos = nuevoPreset.trazo.trayectos
    respaldo.trazo.puntoInicial = nuevoPreset.trazo.puntoInicial
    respaldo.trazo.rgba = nuevoPreset.trazo.rgba

    categoriaPresets[categoria][subCategoria].push(nuevoPreset)
    categoriaPresets[categoria].todos.push(nuevoPreset)
    categoriaPresets.todos.push(nuevoPreset)
    respaldosPreset.push(respaldo)
    return nuevoPreset
}
const modosDibujo = ['normal', 'borrar']
for (const modo of modosDibujo) {
    for (const figura of pintor.obtenerCategoria("figurasSello").herramientas) {
        agregarPreset({
            nombre: 'figura ',
            categoria: 'figuras',
            trazoPreset: new trazo({
                herramienta: figura.nombre,

                separacion: .2,
                grosor: 20,

                modoDibujo: modo,
            })
        })
    }
    agregarPreset({
        nombre: 'pincel',
        categoria: 'pinceles',
        trazoPreset: new trazo({
            herramienta: 'pincelSellosSimple',
            separacion: .2,
            grosor: 20,

            inicioFin: {
                duracion: {
                    inicio: 25,
                    fin: 25
                },
                alpha: {
                    inicio: .25,
                    fin: .25
                }
            },
            modoDibujo: modo,
            flujo: .25,
        })
    })
    agregarPreset({
        nombre: 'pincel ',
        categoria: 'pinceles',
        trazoPreset: new trazo({
            herramienta: 'pincelSellosSimple',
            separacion: .2,
            grosor: 20,
            modoDibujo: modo,
            flujo: .25,
        })
    })
    agregarPreset({
        nombre: 'pincel ',
        categoria: 'pinceles',
        trazoPreset: new trazo({
            herramienta: 'pincelSellosSimple',
            separacion: .0,
            grosor: 20,
            modoDibujo: modo,
            flujo: .25,
        })
    })
}