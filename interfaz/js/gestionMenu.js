let tiposHerramientas = ['cursor', 'pincel', 'borrador', 'figura', 'recorte', 'balde', 'texto', 'lazo', 'difuminar']

let tipoHerramientaActiva = tiposHerramientas[0]
let categoriaHerramientaActiva = 'todos'
let idPresetActivo = 0;
function cambiarTipoHerramienta(nuevaHerramienta) {
    tipoHerramienta = nuevaHerramienta;
}

let trazoActivo = categoriaPresets.todos[idPresetActivo].trazo

function cambiarPresetActivo(idNuevo) {
    idPresetActivo = idNuevo
    trazoActivo = categoriaPresets.todos[idNuevo].trazo

}

class valorTrazo {
    constructor({ idTrazo, categoria, nombre, nombreCompleto, tipoValorTrazo, accesoVariable, min = 0,
        esPorcentual = false, tipoValor = 'numerico', opciones, esSeparacion = false }) {
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
    }
}

const valoresTrazo = [
]
function agregarSeparacion() {
    valoresTrazo.push(
        new valorTrazo({
            esSeparacion: true
        })
    )
}



valoresTrazo.push(
    new valorTrazo({
        categoria: 'basico',
        idTrazo: idPresetActivo,
        nombre: 'grosor',
        accesoVariable: 'grosor',
        nombreCompleto: 'grosor',
    })
)

agregarSeparacion();

valoresTrazo.push(
    new valorTrazo({
        categoria: 'basico',
        idTrazo: idPresetActivo,
        nombre: 'separacion',
        valIni: 0,
        accesoVariable: 'separacion',
        nombreCompleto: 'separacion',
    })
)

agregarSeparacion();

valoresTrazo.push(
    new valorTrazo({
        categoria: 'basico',
        idTrazo: idPresetActivo,
        nombre: 'flujo',
        accesoVariable: 'flujo',
        nombreCompleto: 'flujo',
    })
)

agregarSeparacion();

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
    agregarSeparacion();
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
