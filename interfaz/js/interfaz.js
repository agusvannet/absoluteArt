
function plegarDesplegar(idDuenio) {
    const carpeta = document.getElementById(idDuenio)

    if (carpeta.classList.contains('desplegado')) {
        carpeta.classList.remove('desplegado')
        carpeta.classList.add('plegado')
    } else {
        carpeta.classList.remove('plegado')
        carpeta.classList.add('desplegado')
    }
}
const scrolsActivos = []
const scroleables = document.getElementsByClassName('scrollBar')

for (const scrol of scroleables) {
    const barra = scrol.getElementsByClassName('barra')[0]
    const lista = scrol.parentElement.getElementsByClassName('lista')[0]

    const altoVisible = lista.clientHeight;
    const altoContenidoTotal = lista.scrollHeight;

    const proporcion = (Math.min((altoVisible / altoContenidoTotal), 1) * 100)
    if (proporcion < 100) {
        barra.style.height = proporcion + '%'
        scrolsActivos.push({
            lista,
            barra
        })
    } else {
        scrol.classList.add('desactivado')
    }
}

function agregarPresetHtml(preset) {
    const ubicacion = document.getElementById('listaPresets').getElementsByClassName('lista')[0]
    let clases = 'preset '
    if (!pintor.obtenerHerramienta(preset.trazo.herramienta).perteneceCategoria(pintor.obtenerCategoria("pinceles")))
        clases += ' grande'
    ubicacion.insertAdjacentHTML('beforeend', `
    <div class="${clases}" id="preset-${preset.id}">
        <button type="button" class="presentacion" onclick =" cambiarPresetActivo(${preset.id}) ;  ; agregarValoresTrazo()">
            <canvas width="1" height="1"></canvas>
            <div class="nombrePreset">${preset.nombre}</div>
        </button>
        <div class="acciones">
            <button type="button" class="boton accionPreset">
                <img src="/interfaz/imagenes/botonNaranja.svg" alt="">
            </button>
        </div>
    </div>
    `);
}

function renderizarPreVisualizacionPreset(preRend) {
    const canvas = document.getElementById('preset-' + preRend.id)
    if (canvas)
        preRend.renderizarPreset({
            canvas: canvas.querySelector('canvas'),
            recalcularTrayectos: true,
            cantPuntos: 25,
            paddingHorizontal: 15,
            paddingVertical: 15,
        })
}

for (const preset of categoriaPresets.todos) {
    agregarPresetHtml(preset)
    renderizarPreVisualizacionPreset(preset)
}

const renderizar = (preset) => {
    preset.renderizarPreset({
        canvas: document.getElementById('presentacionPresetActual').querySelector('canvas'),
        recalcularTrayectos: true,
        cantPuntos: 25,
        paddingHorizontal: 15,
        paddingVertical: 45,
    })
}

const carpetasValoresTrazo = {}

class carpetaValoresTrazo {
    constructor(carpeta, botonMenos, botonMas, range, nombre, valorActual) {
        this.carpeta = carpeta;
        this.botonMenos = botonMenos;
        this.botonMas = botonMas;
        this.range = range;
        this.nombre = nombre;
        this.valorActual = valorActual;
    }

    sumarPaso(idtrazo) {
        const valor = Number(this.range.value)
        this.range.value = Math.min(Number(this.range.max), valor + Number(this.range.step))
        this.valorActual.innerHTML = valor
        renderizar(categoriaPresets.todos[idtrazo])
        renderizarPreVisualizacionPreset(categoriaPresets.todos[idtrazo])
        return this.range.value
    }

    restarPaso(idtrazo) {
        const valor = this.range.value
        this.range.value = Math.max(Number(this.range.min), valor - Number(this.range.step))
        this.valorActual.innerHTML = valor
        renderizar(categoriaPresets.todos[idtrazo])
        renderizarPreVisualizacionPreset(categoriaPresets.todos[idtrazo])
        return this.range.value
    }

    actualizarValor() {
        this.valorActual.innerHTML = Number(this.range.value)
    }

    cambiarValoresPreset() {

    }
}
let inputsCreados = false;
function agregarValoresTrazo() {
    const ubicacion = document.getElementById('listaValoresPreset')
    for (const valor of valoresTrazo) {
        if (!inputsCreados) {
            if (!valor.esSeparacion) {
                const rango = trazo.obtenerRangoValor(valor.accesoVariable)
                ubicacion.insertAdjacentHTML('beforeend', `
                    <div class="valorPreset ${valor.categoria}"id="${valor.nombreCompleto}" data-idtrazo = "${idPresetActivo}">
                        <div class="texto">
                            <p  class="nombreValor"></p>
                            <p class="valorParametro"></p>
                        </div>
                    <div class="inputs">
                        <button type="button" class="botonResta" data-idtrazo = "${idPresetActivo}"
                        onclick="trazoActivo.${valor.accesoVariable} = carpetasValoresTrazo['${valor.nombreCompleto}'].restarPaso(Number(this.dataset.idtrazo)) ">
                            -
                        </button>
                        <div class="rangeCaja inputRange">
                            <input type="range" class="range" data-idtrazo = "${idPresetActivo}"
                            oninput = "
                                trazoActivo.${valor.accesoVariable} = Number(this.value) ;
                                renderizar(categoriaPresets.todos[Number(this.dataset.idtrazo)]) ;
                                carpetasValoresTrazo['${valor.nombreCompleto}'].actualizarValor(); 
                             " 
                             onchange="
                             renderizarPreVisualizacionPreset(categoriaPresets.todos[Number(this.dataset.idtrazo)])
                             ">
                        </div >
                    <button type="button" class="botonSuma" data-idtrazo = "${idPresetActivo}"
                    onclick="trazoActivo.${valor.accesoVariable} = carpetasValoresTrazo['${valor.nombreCompleto}'].sumarPaso(Number(this.dataset.idtrazo)) ">
                        +
                    </button>
                        </div>
                    </div>
                `);
                const carpetaActual = document.getElementById(valor.nombreCompleto)
                carpetasValoresTrazo[valor.nombreCompleto] =
                    new carpetaValoresTrazo(
                        carpetaActual,
                        carpetaActual.getElementsByClassName('botonResta')[0],
                        carpetaActual.getElementsByClassName('botonSuma')[0],
                        carpetaActual.getElementsByClassName('range')[0],
                        carpetaActual.getElementsByClassName('nombreValor')[0],
                        carpetaActual.getElementsByClassName('valorParametro')[0],
                    )
                carpetasValoresTrazo[valor.nombreCompleto].nombre.innerHTML = valor.nombre

                carpetasValoresTrazo[valor.nombreCompleto].range.min = rango.minimo
                carpetasValoresTrazo[valor.nombreCompleto].range.max = rango.maximo
                carpetasValoresTrazo[valor.nombreCompleto].range.step = rango.salto
                carpetasValoresTrazo[valor.nombreCompleto].range.value = categoriaPresets.todos[valor.idTrazo].trazo.obtenerValorString(valor.accesoVariable)

                carpetasValoresTrazo[valor.nombreCompleto].valorActual.innerHTML = carpetasValoresTrazo[valor.nombreCompleto].range.value;

            } else {
                ubicacion.insertAdjacentHTML('beforeend', `
                <div class="valorPreset separacionValores" >
                </div>
                `);
            }
        } else {
            if (!valor.esSeparacion) {
                const cambiar = carpetasValoresTrazo[valor.nombreCompleto];

                cambiar.range.value = categoriaPresets.todos[idPresetActivo].trazo.obtenerValorString(valor.accesoVariable)

                cambiar.valorActual.innerHTML = carpetasValoresTrazo[valor.nombreCompleto].range.value;

                cambiar.range.dataset.idtrazo = idPresetActivo
                cambiar.botonMas.dataset.idtrazo = idPresetActivo
                cambiar.botonMenos.dataset.idtrazo = idPresetActivo

                cambiar.range.dataset.idTrazo = idPresetActivo
                cambiar.botonMas.dataset.idTrazo = idPresetActivo
                cambiar.botonMenos.dataset.idTrazo = idPresetActivo

                renderizar(categoriaPresets.todos[idPresetActivo])
            }
        }

    }
    inputsCreados = true;
}

agregarValoresTrazo()
renderizar(categoriaPresets.todos[idPresetActivo])