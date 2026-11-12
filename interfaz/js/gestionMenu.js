let tiposHerramientas = ['cursor', 'pincel', 'borrador', 'figura', 'recorte', 'balde', 'texto', 'lazo', 'difuminar']
let tiposCategoriasValor = []

let tipoHerramientaActiva = tiposHerramientas[0]
let categoriaHerramientaActiva = 'todos'
let idPresetActivo = 0;
let categoriaValorSeleccionada = 'config'
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

class grupoValoresTrazo {
    constructor(nombre) {
        this.nombre = nombre;
        this.contenido = []
    }
}
const categoriasValores = {

}

class valorTrazo {
    constructor({
        idTrazo, categoria, nombre,
        nombreCompleto, tipoValorTrazo, accesoVariable,
        esPorcentual = false, tipoValor = 'numero', opciones,
        esSeparacion = false, listaSelecciones, preVisualizable = false,

        accion = () => { console.log('accion no agregada') },

        funcionRenderizar = () => { console.log('funcion renderizar no agregada') }
    }) {

        this.nombre = nombre;
        this.idTrazo = idTrazo;
        this.accesoVariable = accesoVariable;
        this.esPorcentual = esPorcentual;
        this.tipoValorTrazo = tipoValorTrazo; // el tipo de valor estilo lo de ibis , en que seccion de la configuracion esta
        this.tipoValor = tipoValor; // numerico o seleccionable 
        this.opciones = opciones;
        this.nombreCompleto = nombreCompleto;
        this.categoria = categoria;
        this.esSeparacion = esSeparacion
        this.listaSelecciones = listaSelecciones;
        this.preVisualizable = preVisualizable;
        this.accion = accion;
        this.funcionRenderizar = funcionRenderizar;
    }
    static categorias = []
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

for (const actual of valoresIndividuales) {
    valoresTrazo.push(
        new valorTrazo({
            categoria: actual.categoria,
            idTrazo: idPresetActivo,
            nombre: actual.nombre,
            accesoVariable: actual.accesoVariable,
            nombreCompleto: actual.nombreCompleto,
        })
    )

}

for (const valor of cordenada.valores) {
    valoresTrazo.push(
        new valorTrazo({
            categoria: 'suavizado',
            idTrazo: idPresetActivo,
            nombre: 'suavizado de ' + valor,
            accesoVariable: 'suavizado.' + valor,
            nombreCompleto: 'suavizado' + valor,
        })
    )
}

for (const entrada of trazo.valoresSensibilidades) {
    for (const salida of trazo.valoresInicioFin) {
        if (salida === 'duracion')
            continue
        valoresTrazo.push(
            new valorTrazo({
                categoria: 'sensibilidad',
                idTrazo: idPresetActivo,
                nombre: 'sens ante ' + entrada + ' de ' + salida,
                accesoVariable: 'sensibilidad.' + entrada + '.' + salida,
                nombreCompleto: 'sensibilidad' + entrada + salida,
            })
        )
    }
}


const inFin = ['inicio', 'fin']
for (const valor of trazo.valoresInicioFin) {
    for (const inf of inFin) {
        valoresTrazo.push(
            new valorTrazo({
                categoria: 'inicioFin',
                idTrazo: idPresetActivo,
                nombre: valor + ' del ' + inf,
                accesoVariable: 'inicioFin.' + valor + '.' + inf,
                nombreCompleto: 'inicioFin' + valor + inf,
            })
        )
    }
}

for (const valor of trazo.valoresRuido) {
    valoresTrazo.push(
        new valorTrazo({
            categoria: 'ruido',
            idTrazo: idPresetActivo,
            nombre: 'ruido de ' + valor,
            accesoVariable: 'ruido.' + valor,
            nombreCompleto: 'ruido' + valor,
        })
    )
}

const listaSellos = []

for (const actual of pintor.obtenerCategoria('sello').herramientas) {
    listaSellos.push(actual.nombre)
}

valoresTrazo.push(
    new valorTrazo({
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

valoresTrazo.push(
    new valorTrazo({
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
            console.log('a')
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

valoresTrazo.push(
    new valorTrazo({
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
                separacion: .0,
                grosor,
                rgba: preset.rgbaGeneralPresets,
                trayectos: [[new cordenada(grosor, grosor), new cordenada(lienzo.largo - grosor, lienzo.alto - grosor)]]
            })
            pintor.dibujar({ lienzoDibujar: lienzo, trazo: trazoDibujar, prepararSello: true })
        }
    })
)

valoresTrazo.push(
    new valorTrazo({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Pincel de Figura',
        accesoVariable: 'motorPincel',
        nombreCompleto: 'motorPincel',
        tipoValor: 'seleccion',
        listaSelecciones: (() => {
            const devolver = []
            const listaOriginal = pintor.obtenerCategoria("pinceles").herramientas
            console.log(listaOriginal)
            for (const actual of listaOriginal) {
                devolver.push(actual.nombre)
            }
            return devolver
        })(),
    })
)

valoresTrazo.push(
    new valorTrazo({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Redondear Figura',
        accesoVariable: 'redondearFigura',
        nombreCompleto: 'redondearFigura',
        tipoValor: 'switch',
    })
)

valoresTrazo.push(
    new valorTrazo({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'suavizado Ciclico',
        accesoVariable: 'suavizadoCiclico',
        nombreCompleto: 'suavizadoCiclico',
        tipoValor: 'switch',
    })
)

valoresTrazo.push(
    new valorTrazo({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Respetar Verticalidad',
        accesoVariable: 'respetarSignoY',
        nombreCompleto: 'respetarSignoY',
        tipoValor: 'switch',
    })
)

valoresTrazo.push(
    new valorTrazo({
        categoria: 'config',
        idTrazo: idPresetActivo,
        nombre: 'Respetar Horizontalidad',
        accesoVariable: 'respetarSignoX',
        nombreCompleto: 'respetarSignoX',
        tipoValor: 'switch',
    })
)

valoresTrazo.push(
    new valorTrazo({
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

