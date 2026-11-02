const pi = 3.141592;
class preset {
    constructor({ trazo, nombre = ('herramienta ' + categoria + ' ' + 'id '), categoria }) {
        this.trazo = trazo;
        this.id = preset.contadorPresets;
        this.nombre = nombre;
        preset.contadorPresets++;
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

        pintor.dibujar({
            lienzoDibujar: lienzoPreset,
            trazo: this.trazo,
            prepararSello: true,
        })
    }
    clonar() {
        return new preset({
            trazo: this.trazo.clonar(),

            nombre: this.nombre,
            categoria: this.categoria
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
    todos: []
}
const respaldosPreset = [] // mismos elementos pero inmutables , para poder restablecer estados

function agregarPreset({ trazoPreset, nombre = 'generico', categoria = 'generico' }) {
    if (!categoriaPresets[trazoPreset.herramienta])
        categoriaPresets[trazoPreset.herramienta] = {}

    if (!categoriaPresets[trazoPreset.herramienta][categoria])
        categoriaPresets[trazoPreset.herramienta][categoria] = []
    if (!categoriaPresets[trazoPreset.herramienta].todos)
        categoriaPresets[trazoPreset.herramienta].todos = []

    const nuevoPreset = new preset({
        trazo: trazoPreset.clonar(),
        nombre: nombre,
    })

    if (pintor.obtenerHerramienta(trazoPreset.herramienta).perteneceCategoria(pintor.obtenerCategoria("pinceles"))) {
        nuevoPreset.trazo.trayectos = preset.trayectosPresets.pinceles
        nuevoPreset.trazo.puntoInicial = preset.puntoInicialPreset.pinceles
    } else if (pintor.obtenerHerramienta(trazoPreset.herramienta).perteneceCategoria(pintor.obtenerCategoria("figuras"))) {
        nuevoPreset.trazo.trayectos = preset.trayectosPresets.figuras
        nuevoPreset.trazo.puntoInicial = preset.puntoInicialPreset.figuras
    }
    nuevoPreset.trazo.rgba = preset.rgbaGeneralPresets

    categoriaPresets[trazoPreset.herramienta][categoria].push(nuevoPreset)
    categoriaPresets[trazoPreset.herramienta].todos.push(nuevoPreset)
    categoriaPresets.todos.push(nuevoPreset)
    respaldosPreset.push(nuevoPreset.clonar())
    return nuevoPreset
}

for (const sello of pintor.obtenerCategoria("sello").herramientas) {
    //for (const figura of pintor.obtenerCategoria("figurasSello").herramientas) {
    //    agregarPreset({
    //        nombre: figura.nombre + ' ' + sello.nombre,
    //        trazoPreset: new trazo({
    //            herramienta: figura.nombre,
    //            sello: sello.nombre,
    //            separacion: .0,
    //        })
    //    })
    //}
    agregarPreset({
        nombre: 'pincel ' + sello.nombre,
        trazoPreset: new trazo({
            herramienta: 'pincelSellosSimple',
            sello: sello.nombre,
            separacion: .0,
            grosor: 20,
            cantPuntosInicio: 25,
            cantPuntosFin: 25,

            grosorInicio: 0,
            grosorFin: 0,
        })
    })
    agregarPreset({
        nombre: 'pincel ' + sello.nombre,
        trazoPreset: new trazo({
            herramienta: 'pincelSellosSimple',
            sello: sello.nombre,
            separacion: .0,
            grosor: 20,
        })
    })
    agregarPreset({
        nombre: 'pincel ' + sello.nombre,
        trazoPreset: new trazo({
            herramienta: 'pincelSellosSimple',
            sello: sello.nombre,
            separacion: .0,
            grosor: 20,
            cantPuntosInicio: 25,
            cantPuntosFin: 25,

            grosorInicio: 0,
            grosorFin: 0,

            hInicio: .25,
            hFin: .25,

        })
    })
    agregarPreset({
        nombre: 'pincel ' + sello.nombre,
        trazoPreset: new trazo({
            herramienta: 'pincelSellosSimple',
            sello: sello.nombre,
            separacion: .0,
            grosor: 20,
            cantPuntosInicio: 25,
            cantPuntosFin: 25,

            hInicio: .25,
            hFin: .25,
        })
    })
}

