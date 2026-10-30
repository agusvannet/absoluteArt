class preset {
    constructor({ trazo, id, nombre = ('herramienta ' + categoria + ' ' + 'id '), categoria }) {
        this.trazo = trazo;
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
    }
}

const categoriaPresets = {
    pincel: [],
    figuras: [],
}

let contadorPresets = 0;
let rgbaGeneralPresets = {
    r: 255,
    g: 0,
    b: 0,
    a: 1
}
let trayectoGeneralPresets = []
let puntoInicialGeneralPresets = { x: 0, y: 0 }
categoriaPresets.pincel.push(
    new preset({
        trazo: new trazo({
            puntoInicial: puntoInicialGeneralPresets,
            trayectos: [trayectoGeneralPresets],
            rgba: [rgbaGeneralPresets],
        }),
        id: contadorPresets,
        nombre: 'Clasico Cuadrado',
        categoria: 'Sellos Simple'
    })

)