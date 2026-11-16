let tiposHerramientas = ['cursor', 'pincel', 'borrador', 'figura', 'recorte', 'balde', 'lazo', 'difuminar']
let tiposCategoriasValor = []

let tipoHerramientaActiva = tiposHerramientas[0]
let categoriaHerramientaActiva = 'todos'
let idPresetActivo = 0;
let categoriaValorSeleccionada = 'suavizado'
const equivalenciaNombres = {
    h: 'Tonalidad',
    s: 'Saturacion',
    v: 'Brillo',
    x: 'Horizontal',
    y: 'Vertical',
    msPx: 'Velocidad',
    duracion: 'Duracion',
    grosor: 'Grosor',
    alto: 'Alto',
    ancho: 'Ancho',
    rotacion: 'Rotacion',
    alpha: 'Opacidad',
}

const categorizacionValores = {
    cordenadas: ['x', 'y'],
    color: ['h', 's', 'v'],
    geometrico: ['grosor', 'alto', 'ancho', 'rotacion', 'alpha',],
    Entradas: ['presion', 'msPx', 'inclinacionX', 'inclinacionY'],
}

function cambiarTipoHerramienta(nuevaHerramienta) {
    tipoHerramienta = nuevaHerramienta;
}

let trazoActivo = categoriaPresets.todos[idPresetActivo].trazo

function cambiarPresetActivo(idNuevo) {
    idPresetActivo = idNuevo
    trazoActivo = categoriaPresets.todos[idNuevo].trazo
}

class categoriaValorTrazo {
    constructor(nombre, duenios = []) {
        this.nombre = nombre;
        this.contenido = [];
        this.duenios = duenios;
    }

    agregarValor(valor) {
        this.contenido.push(valor)
    }
}

function agregarGrupoValoresTrazo(valorTrazo) {
    if (!categoriasValores[valorTrazo.categoria]) {
        categoriasValores[valorTrazo.categoria] = new categoriaValorTrazo(valorTrazo.categoria)
    }
    categoriasValores[valorTrazo.categoria].agregarValor(valorTrazo)
}

const categoriasValores = {

}


const valoresTrazo = [
]

class valorIndividual {
    constructor(categoria, nombre, accesoVariable = nombre, nombreCompleto = accesoVariable,) {
        this.categoria = categoria;
        this.nombre = nombre;
        this.accesoVariable = accesoVariable;
        this.nombreCompleto = nombreCompleto;
    }
}

class valorTrazo {
    constructor({ categoria, nombre, nombreCompleto, tipoValor }) {
        this.nombre = nombre;
        this.nombreCompleto = nombreCompleto;
        this.categoria = categoria;
        this.tipoValor = tipoValor;
    }
}

class valorTrazoConjunto extends valorTrazo {
    constructor({ categoria, nombre, nombreCompleto, listaValores = [], tipoValor = 'conjunto' }) {
        super({ categoria, nombre, nombreCompleto, tipoValor })
        this.listaValores = listaValores;
    }
}

class valorTrazoIndividual extends valorTrazo {
    constructor({
        idTrazo, categoria, nombre,
        nombreCompleto, tipoValorTrazo, accesoVariable,
        esPorcentual = false, tipoValor = 'numero',
        listaSelecciones, preVisualizable = false,
        esSeparacion = false,

        accion = () => { console.log('accion no agregada') },

        funcionRenderizar = () => { console.log('funcion renderizar no agregada') }
    }) {
        super(categoria, nombre, nombreCompleto, tipoValor)

        this.nombre = nombre;
        this.idTrazo = idTrazo;
        this.accesoVariable = accesoVariable;
        this.esPorcentual = esPorcentual;
        this.tipoValorTrazo = tipoValorTrazo; // el tipo de valor estilo lo de ibis , en que seccion de la configuracion esta
        this.tipoValor = tipoValor; // numerico o seleccionable 
        this.nombreCompleto = nombreCompleto;
        this.categoria = categoria;
        this.listaSelecciones = listaSelecciones;
        this.preVisualizable = preVisualizable;
        this.esSeparacion = esSeparacion;
        this.accion = accion;
        this.funcionRenderizar = funcionRenderizar;
    }
    static categorias = []
}

const valoresIndividuales = [
    new valorIndividual('basico', 'grosor'),
    new valorIndividual('basico', 'separacion'),
    new valorIndividual('basico', 'flujo'),
    new valorIndividual('basico', 'Seguir Rotacion Trayecto', 'seguirRotacionTrayecto'),
    new valorIndividual('basico', 'anchoInicial'),
    new valorIndividual('basico', 'altoInicial'),
    new valorIndividual('basico', 'rotacionInicial'),
    new valorIndividual('suavizado', 'Puntos Suavizado', 'puntosSuavizado'),
]

function agregarSeparador(categoria) {
    valoresTrazo.unshift(
        new valorTrazoIndividual({
            categoria,
            esSeparacion: true,
            nombre: 's',
            nombreCompleto: 's',
            tipoValor: 's',
        })
    )
}

for (const actual of valoresIndividuales) {
    agregarSeparador(actual.categoria)
    valoresTrazo.unshift(
        new valorTrazoIndividual({
            categoria: actual.categoria,
            idTrazo: idPresetActivo,
            nombre: actual.nombre,
            accesoVariable: actual.accesoVariable,
            nombreCompleto: actual.nombreCompleto,
        })
    )
}

valoresTrazo.splice(1, 1)

agregarSeparador('suavizado')

const tiposSuavizado = Object.keys(categorizacionValores)
for (const actual of tiposSuavizado) {
    valoresTrazo.unshift(
        new valorTrazoConjunto({
            categoria: 'suavizado',
            idTrazo: idPresetActivo,
            nombre: 'suavizado ' + actual,
            nombreCompleto: 'suavizado' + actual,
            tipoValor: 'conjunto',
            listaValores: (() => {
                const devolver = []
                for (const elemento of categorizacionValores[actual]) {
                    devolver.push(
                        new valorTrazoIndividual({
                            categoria: 'suavizado',
                            idTrazo: idPresetActivo,
                            nombre: (equivalenciaNombres[elemento] ? equivalenciaNombres[elemento] : elemento),
                            accesoVariable: 'suavizado.' + elemento,
                            nombreCompleto: 'suavizado' + elemento,
                        })
                    )
                }
                return devolver
            })()
        })
    )
    agregarSeparador('suavizado')
}

valoresTrazo.shift()

for (const entrada of trazo.valoresSensibilidades) {
    valoresTrazo.unshift(
        new valorTrazoConjunto({
            categoria: 'sensibilidad',
            idTrazo: idPresetActivo,
            nombre: 'Sensibilidad a la ' + (equivalenciaNombres[entrada] ? equivalenciaNombres[entrada] : entrada),
            nombreCompleto: 'Sensibilidad' + entrada,
            tipoValor: 'conjunto',
            listaValores: (() => {
                const devolver = []
                for (const salida of trazo.valoresInicioFin) {
                    if (salida === 'duracion')
                        continue
                    devolver.push(
                        new valorTrazoIndividual({
                            categoria: 'sensibilidad',
                            idTrazo: idPresetActivo,
                            nombre: (equivalenciaNombres[salida] ? equivalenciaNombres[salida] : salida),
                            accesoVariable: 'sensibilidad.' + entrada + '.' + salida,
                            nombreCompleto: 'sensibilidad' + entrada + salida,
                        })
                    )
                }
                return devolver
            })()
        })
    )
    agregarSeparador('sensibilidad')
}
valoresTrazo.shift()

const inFin = ['inicio', 'fin']
for (const valor of trazo.valoresInicioFin) {
    valoresTrazo.unshift(
        new valorTrazoConjunto({
            categoria: 'inicioFin',
            idTrazo: idPresetActivo,
            nombre: (equivalenciaNombres[valor] ? equivalenciaNombres[valor] : valor) + ' Del Inicio Fin',
            nombreCompleto: 'valoriniciofin' + valor,
            tipoValor: 'conjunto',
            listaValores: [
                new valorTrazoIndividual({
                    categoria: 'inicioFin',
                    idTrazo: idPresetActivo,
                    nombre: 'Inicio',
                    accesoVariable: 'inicioFin.' + valor + '.inicio',
                    nombreCompleto: 'inicioFin' + valor + 'inicio',
                }),
                new valorTrazoIndividual({
                    categoria: 'inicioFin',
                    idTrazo: idPresetActivo,
                    nombre: 'Fin',
                    accesoVariable: 'inicioFin.' + valor + '.fin',
                    nombreCompleto: 'inicioFin' + valor + 'fin',
                }),
            ]
        })
    )
    agregarSeparador('inicioFin')
}
valoresTrazo.shift()

const tiposRuido = Object.keys(categorizacionValores)
tiposRuido.splice(tiposRuido.indexOf('Entradas'), 1)
for (const actual of tiposRuido) {
    valoresTrazo.unshift(
        new valorTrazoConjunto({
            categoria: 'ruido',
            idTrazo: idPresetActivo,
            nombre: 'ruido ' + actual,
            nombreCompleto: 'ruido' + actual,
            tipoValor: 'conjunto',
            listaValores: (() => {
                const devolver = []
                for (const elemento of categorizacionValores[actual]) {
                    devolver.push(
                        new valorTrazoIndividual({
                            categoria: 'ruido',
                            idTrazo: idPresetActivo,
                            nombre: (equivalenciaNombres[elemento] ? equivalenciaNombres[elemento] : elemento),
                            accesoVariable: 'ruido.' + elemento,
                            nombreCompleto: 'ruido' + elemento,
                        })
                    )
                }
                return devolver
            })()
        })
    )
    agregarSeparador('ruido')
}
valoresTrazo.shift()

const listaSellos = []

for (const actual of pintor.obtenerCategoria('sello').herramientas) {
    listaSellos.unshift(actual.nombre)
}

valoresTrazo.unshift(
    new valorTrazoIndividual({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Modo Dibujo',
        accesoVariable: 'modoDibujo',
        nombreCompleto: 'modoDibujo',
        tipoValor: 'seleccion',
        listaSelecciones: (() => {
            const devolver = []
            const modos = Object.keys(lienzoHtml.modosPegado)
            for (const actual of modos) {
                devolver.push(actual)
            }
            devolver.splice(devolver.indexOf('copiar'), 1)
            return devolver
        })(),
    })
)
agregarSeparador('config')
valoresTrazo.unshift(
    new valorTrazoIndividual({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Sello dibujar',
        accesoVariable: 'sello',
        nombreCompleto: 'sello',
        tipoValor: 'seleccion',
        listaSelecciones: (() => {
            const devolver = []
            const listaOriginal = pintor.obtenerCategoria('sello').herramientas
            for (const actual of listaOriginal) {
                devolver.push(actual.nombre)
            }
            return devolver
        })(),
        preVisualizable: true,
        funcionRenderizar: (lienzo, elemento) => {
            lienzo.limpiar()
            pintor.obtenerHerramienta(elemento).usar({
                x: lienzo.largo / 2,
                y: lienzo.alto / 2,
                grosor: lienzo.alto,
                rgb: preset.rgbaGeneralPresets,
                a: 1,
                lienzo
            })
        }
    })
)
agregarSeparador('config')

valoresTrazo.unshift(
    new valorTrazoIndividual({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Figura dibujar',
        accesoVariable: 'herramienta',
        nombreCompleto: 'figuraDibujar',
        tipoValor: 'seleccion',
        listaSelecciones: (() => {
            const devolver = []
            const listaOriginal = pintor.obtenerCategoria('figurasSello').herramientas
            for (const actual of listaOriginal) {
                devolver.push(actual.nombre)
            }
            return devolver
        })(),
        preVisualizable: true,

        funcionRenderizar: (lienzo, elemento) => {
            lienzo.limpiar()
            const grosor = 4;
            const trazoDibujar = new trazo({
                herramienta: elemento,
                motorPincel: 'pincelBarato',
                separacion: .0,
                grosor,
                rgba: preset.rgbaGeneralPresets,
                trayectos: [[new cordenada(grosor, grosor), new cordenada(lienzo.largo - grosor, lienzo.alto - grosor)]]
            })
            pintor.dibujar({ lienzoDibujar: lienzo, trazo: trazoDibujar, prepararSello: true })
        }
    })
)
agregarSeparador('config')

valoresTrazo.unshift(
    new valorTrazoIndividual({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Pincel de Figura',
        accesoVariable: 'motorPincel',
        nombreCompleto: 'motorPincel',
        tipoValor: 'seleccion',
        listaSelecciones: (() => {
            const devolver = []
            const listaOriginal = pintor.obtenerCategoria("pinceles").herramientas
            for (const actual of listaOriginal) {
                devolver.push(actual.nombre)
            }
            return devolver
        })(),
    })
)
agregarSeparador('config')

valoresTrazo.unshift(
    new valorTrazoIndividual({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Redondear Figura',
        accesoVariable: 'redondearFigura',
        nombreCompleto: 'redondearFigura',
        tipoValor: 'switch',
    })
)
agregarSeparador('config')

valoresTrazo.unshift(
    new valorTrazoIndividual({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'suavizado Ciclico',
        accesoVariable: 'suavizadoCiclico',
        nombreCompleto: 'suavizadoCiclico',
        tipoValor: 'switch',
    })
)
agregarSeparador('config')

valoresTrazo.unshift(
    new valorTrazoIndividual({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Respetar Verticalidad',
        accesoVariable: 'respetarSignoY',
        nombreCompleto: 'respetarSignoY',
        tipoValor: 'switch',
    })
)
agregarSeparador('config')

valoresTrazo.unshift(
    new valorTrazoIndividual({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Respetar Horizontalidad',
        accesoVariable: 'respetarSignoX',
        nombreCompleto: 'respetarSignoX',
        tipoValor: 'switch',
    })
)
agregarSeparador('config')

valoresTrazo.unshift(
    new valorTrazoIndividual({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Restablecer Preset',
        nombreCompleto: 'RestablecerPreset',
        tipoValor: 'accion',
        accion: (id) => {
            categoriaPresets.todos[id].restablecer();
            trazoActivo = categoriaPresets.todos[id].trazo;
            actualizarValoresHtml();
        }
    })
)
agregarSeparador('config')

valoresTrazo.pop()