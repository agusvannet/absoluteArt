
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


function agregarPresetHtml(preset) {
    const ubicacion = document.getElementById('listaPresets').getElementsByClassName('lista')[0]
    let clases = 'preset '
    if (!pintor.obtenerHerramienta(preset.trazo.herramienta).perteneceCategoria(pintor.obtenerCategoria("pinceles")))
        clases += ' grande'
    ubicacion.insertAdjacentHTML('beforeend', `
    <div class="${clases}" id="preset-${preset.id}">
        <button type="button" class="presentacion" onclick =" cambiarPresetActivo(${preset.id}) ;  ; actualizarValoresHtml()">
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
        cantPuntos: 50,
        paddingHorizontal: 15,
        paddingVertical: 45,
    })
}

const carpetasValoresTrazo = {}

class carpetaValor {
    constructor(valorProcedencia, carpeta, nombre, valorActual) {
        this.valorProcedencia = valorProcedencia;
        this.carpeta = carpeta;
        this.nombre = nombre;
        this.valorActual = valorActual;
    }
}

class carpetaValorSeleccionable extends carpetaValor {
    constructor(valorProcedencia, carpeta, nombre, valorActual, listaSeleccionables, lienzoPresentacion, funcionRenderizar = () => { console.log('sin renderizador') }) {
        super(valorProcedencia, carpeta, nombre, valorActual)
        this.lienzoPresentacion = lienzoPresentacion
        this.listaSeleccionables = listaSeleccionables
        this.funcionRenderizar = funcionRenderizar
    }

    actualizarValoresHtml() {
        const valorActual = (this.valorProcedencia.nombre) ? trazoActivo[this.valorProcedencia.accesoVariable] : this.valorProcedencia
        this.valorActual.innerHTML = valorActual;
        this.listaSeleccionables.dataset.idtrazo = idPresetActivo
        if (this.lienzoPresentacion) {
            this.funcionRenderizar(this.lienzoPresentacion, valorActual)
        }
    }
}

class carpetaValorSwitch {
    constructor(valorProcedencia, carpeta, divSwitch) {
        this.valorProcedencia = valorProcedencia;
        this.carpeta = carpeta;
        this.divSwitch = divSwitch;
    }

    switchear() {
        let returnar = false;
        if (this.divSwitch.classList.contains('activo')) {
            this.divSwitch.classList.remove('activo')
            this.divSwitch.classList.add('inactivo')
        } else {
            this.divSwitch.classList.add('activo')
            this.divSwitch.classList.remove('inactivo')
            returnar = true
        }
        return returnar
    }

    actualizarValoresHtml() {
        this.divSwitch.dataset.idtrazo = idPresetActivo
        const valorActual = trazoActivo[this.valorProcedencia.accesoVariable]
        if (!valorActual) {
            this.divSwitch.classList.remove('activo')
            this.divSwitch.classList.add('inactivo')
        } else {
            this.divSwitch.classList.add('activo')
            this.divSwitch.classList.remove('inactivo')
        }
    }

}

class carpetaValorAccion {
    constructor(valorProcedencia, carpeta, accion) {
        this.valorProcedencia = valorProcedencia;
        this.carpeta = carpeta;
        this.accion = accion;
    }

    accion(id) {
        this.accion(id)
    }

    actualizarValoresHtml() {
        this.carpeta.dataset.idtrazo = idPresetActivo
    }
}

class carpetaValorTrazoNumerico extends carpetaValor {
    constructor(valorProcedencia, carpeta, botonMenos, botonMas, range, nombre, valorActual) {
        super(valorProcedencia, carpeta, nombre, valorActual)
        this.botonMenos = botonMenos;
        this.botonMas = botonMas;
        this.range = range;
    }
    sumarPaso(idtrazo) {
        const valor = Number(this.range.value)
        this.range.value = Math.min(Number(this.range.max), valor + Number(this.range.step))
        this.valorActual.innerHTML = this.range.value
        renderizar(categoriaPresets.todos[idtrazo])
        renderizarPreVisualizacionPreset(categoriaPresets.todos[idtrazo])
        return Number(this.range.value)
    }

    restarPaso(idtrazo) {
        const valor = Number(this.range.value)
        this.range.value = Math.max(Number(this.range.min), valor - Number(this.range.step))
        this.valorActual.innerHTML = this.range.value
        renderizar(categoriaPresets.todos[idtrazo])
        renderizarPreVisualizacionPreset(categoriaPresets.todos[idtrazo])
        return Number(this.range.value)
    }

    actualizarValor() {
        this.valorActual.innerHTML = Number(this.range.value)
    }

    actualizarNumerosHtml() {
        this.range.value = categoriaPresets.todos[idPresetActivo].trazo.obtenerValorString(this.valorProcedencia.accesoVariable)
        this.actualizarValor()
    }

    actualizarValoresHtml() {
        this.actualizarNumerosHtml()
        this.range.dataset.idtrazo = idPresetActivo
        this.botonMas.dataset.idtrazo = idPresetActivo
        this.botonMenos.dataset.idtrazo = idPresetActivo
        this.range.dataset.idTrazo = idPresetActivo
        this.botonMas.dataset.idTrazo = idPresetActivo
        this.botonMenos.dataset.idTrazo = idPresetActivo
    }
}

class carpetaConjunto {
    constructor(valorProcedencia, carpeta, rangeJefe, contenedorInputs, valorActualJefe, carpetasHijas = []) {
        this.valorProcedencia = valorProcedencia;
        this.carpeta = carpeta;
        this.rangeJefe = rangeJefe;
        this.valorActualJefe = valorActualJefe;
        this.carpetasHijas = carpetasHijas;
        this.contenedorInputs = contenedorInputs;
    }

    darPaso(multiplicadorPaso = 1) {
        const valor = Number(this.rangeJefe.value)
        this.rangeJefe.value =
            Math.max(
                Number(this.rangeJefe.min),
                Math.min(
                    valor + this.rangeJefe.step * Number(multiplicadorPaso),
                    Number(this.rangeJefe.max),
                )
            )
        this.valorActualJefe.innerHTML = this.rangeJefe.value
        this.actualizarNumerosHtml();
        return Number(this.rangeJefe.value)
    }
    setearValoresIndividuales() {
        for (const actual of this.carpetasHijas) {
            actual.range.value = this.rangeJefe.value
        }
    }
    actualizarValoresHtml() {
        let valorPromedio = 0;
        for (const actual of this.carpetasHijas) {
            actual.actualizarValoresHtml()
            valorPromedio += trazoActivo.obtenerValorString(actual.valorProcedencia.accesoVariable)
        }
        valorPromedio = (valorPromedio / this.carpetasHijas.length).toFixed(2)
        this.rangeJefe.value = valorPromedio
        this.valorActualJefe.innerHTML = valorPromedio
        this.contenedorInputs.dataset.idTrazo = idPresetActivo
        this.contenedorInputs.dataset.idtrazo = idPresetActivo
    }
    actualizarNumerosHtml() {
        for (const actual of this.carpetasHijas) {
            actual.actualizarNumerosHtml();
        }
    }
}

function agregarValorAccion(ubicacion, valor, antesDespues = 'afterbegin') {
    ubicacion.insertAdjacentHTML(antesDespues, `
    <button class="valorPreset accion"  id="${valor.nombreCompleto}" data-idtrazo="${idPresetActivo}" onclick="
            carpetasValoresTrazo['${valor.nombreCompleto}'].accion(Number(this.dataset.idtrazo));
            renderizar(categoriaPresets.todos[Number(this.dataset.idtrazo)]); 
            renderizarPreVisualizacionPreset(categoriaPresets.todos[Number(this.dataset.idtrazo)]);
        ">
        <p class="nombreAccion">${valor.nombre}</p>
    </button>
    `);

    const carpetaActual = document.getElementById(valor.nombreCompleto)

    carpetasValoresTrazo[valor.nombreCompleto] =
        new carpetaValorAccion(
            valor,
            carpetaActual,
            (id) => { valor.accion(id) },
        )
}

function agregarValorSeleccionable(ubicacion, valor, antesDespues = 'afterbegin') {
    ubicacion.insertAdjacentHTML(antesDespues, `
    <div class="valorPreset ${valor.categoria} " id="${valor.nombreCompleto}" data-idtrazo="${idPresetActivo}">
            <div class="configuracionValor">
                <div class="texto"> 
                    <p class="nombreValor">${valor.nombre}</p>
                </div>
                <div class="desplegableValor desplegado" id="${valor.nombreCompleto}Desplegable">
                    <div class=" contenido">
                        <div class="listaSeleccionables" data-idtrazo="${idPresetActivo}">
                        </div>
                    </div>
                    <button class="boton" type="button" onclick="plegarDesplegar('${valor.nombreCompleto}Desplegable')">
                        <p class="valorParametro">asd</p>
                    </button>
                </div>
            </div>
        </div>
        `);
    if (valor.preVisualizable) {
        document.getElementById(valor.nombreCompleto).insertAdjacentHTML('beforeend', `
            <div class="representacionCanvas">
                <canvas id="${valor.nombreCompleto}Canvas"> </canvas>
            </div>
        `);
    }
    const listaSeleccionables = ubicacion.querySelector('#' + valor.nombreCompleto + 'Desplegable').querySelector('.listaSeleccionables')
    let tamanioCanvasPresentacion = undefined
    for (const actual of valor.listaSelecciones) {
        listaSeleccionables.insertAdjacentHTML('beforeend', `
            <button type="button" data-idtrazo="${idPresetActivo}" class="valorSeleccionable" id="${valor.nombreCompleto + actual}" onclick="
                 trazoActivo.${valor.accesoVariable} = '${actual}' ;
                 renderizar(categoriaPresets.todos[Number(this.parentNode.dataset.idtrazo)]); 
                 carpetasValoresTrazo['${valor.nombreCompleto}'].actualizarValoresHtml('${actual}');
                 renderizarPreVisualizacionPreset(categoriaPresets.todos[Number(this.parentNode.dataset.idtrazo)]);
              ">
                <p>${actual}</p>
            </button>
        `);
        if (valor.preVisualizable) {
            const lugarCanvas = document.getElementById(valor.nombreCompleto + actual)
            lugarCanvas.insertAdjacentHTML('beforeend', `
            <div class="representacionCanvas">
                <canvas></canvas>
            </div>
        `);
            const canvas = lugarCanvas.querySelector('canvas')
            if (!tamanioCanvasPresentacion) {
                const canvasRect = canvas.getBoundingClientRect()
                tamanioCanvasPresentacion = {
                    largo: canvasRect.width * 2,
                    alto: canvasRect.height * 2
                }
            }
            const lienzoCanvas = lienzos.obtener({ canvas, largo: tamanioCanvasPresentacion.largo, alto: tamanioCanvasPresentacion.alto })
            valor.funcionRenderizar(lienzoCanvas, actual)
        }
    }
    plegarDesplegar(valor.nombreCompleto + 'Desplegable')
    const carpetaActual = document.getElementById(valor.nombreCompleto)
    let lienzoPresentacion = undefined;
    if (valor.preVisualizable) {
        const canvasPresentacion = document.querySelector('#' + valor.nombreCompleto + 'Canvas')
        const canvasPresData = canvasPresentacion.getBoundingClientRect()
        lienzoPresentacion = lienzos.obtener({ canvas: canvasPresentacion, largo: canvasPresData.width * 2, alto: canvasPresData.height * 2 })
    }
    carpetasValoresTrazo[valor.nombreCompleto] =
        new carpetaValorSeleccionable(
            valor,
            carpetaActual,
            carpetaActual.getElementsByClassName('nombreValor')[0],
            carpetaActual.getElementsByClassName('valorParametro')[0],
            carpetaActual.getElementsByClassName('listaSeleccionables')[0],
            lienzoPresentacion,
            (canvas, elemento) => { valor.funcionRenderizar(canvas, elemento) },
        )
}

function agregarValorSwitch(ubicacion, valor, antesDespues = 'afterbegin') {
    ubicacion.insertAdjacentHTML(antesDespues, `
     <div class="valorPreset valorSwitch  ${valor.categoria}" id="${valor.nombreCompleto}" data-idtrazo = "${idPresetActivo}">
            <div class="nombreValor">
                ${valor.nombre}
            </div>
            <button type="button" class="switch activo"  data-idtrazo = "${idPresetActivo}"  onclick="
                trazoActivo.${valor.accesoVariable} = carpetasValoresTrazo['${valor.nombreCompleto}'].switchear(this.dataset.idtrazo); 
                renderizar(categoriaPresets.todos[Number(this.dataset.idtrazo)]);
                renderizarPreVisualizacionPreset(categoriaPresets.todos[this.dataset.idtrazo])
            ">
                <div class="bordesitoFondoSwitch">
                    <div class="fondoSwitch">
                        <div class="bolaSwitch"></div>
                    </div>
                </div>
            </button>
        </div>
        `);
    const carpetaActual = document.getElementById(valor.nombreCompleto)
    carpetasValoresTrazo[valor.nombreCompleto] =
        new carpetaValorSwitch(
            valor,
            carpetaActual,
            carpetaActual.querySelector('.switch'),
        )

    return carpetasValoresTrazo[valor.nombreCompleto]
}

function agregarValorNumerico(ubicacion, valor, antesDespues = 'afterbegin') {
    const rango = trazo.obtenerRangoValor(valor.accesoVariable)
    ubicacion.insertAdjacentHTML(antesDespues, `
        <div class="valorPreset ${valor.categoria}" id="${valor.nombreCompleto}" data-idtrazo = "${idPresetActivo}">
                <div class="configuracionValor">
                     <div class="texto">
                         <p  class="nombreValor"> ${valor.nombre} </p>
                         <p class="valorParametro"></p>
                     </div>
                        <div class="inputs">
                            <button type="button" class="botonResta" data-idtrazo = "${idPresetActivo}"
                                onclick="
                                    trazoActivo.${valor.accesoVariable} = carpetasValoresTrazo['${valor.nombreCompleto}'].restarPaso(Number(this.dataset.idtrazo)) 
                                ">
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
                     </div>
                 <button type="button" class="botonSuma" data-idtrazo = "${idPresetActivo}"
                 onclick="
                    trazoActivo.${valor.accesoVariable} = carpetasValoresTrazo['${valor.nombreCompleto}'].sumarPaso(Number(this.dataset.idtrazo)) 
                 ">
                     +
                 </button>
                 </div>
            </div>
        </div>
    `);
    const carpetaActual = document.getElementById(valor.nombreCompleto)
    carpetasValoresTrazo[valor.nombreCompleto] =
        new carpetaValorTrazoNumerico(
            valor,
            carpetaActual,
            carpetaActual.getElementsByClassName('botonResta')[0],
            carpetaActual.getElementsByClassName('botonSuma')[0],
            carpetaActual.getElementsByClassName('range')[0],
            carpetaActual.getElementsByClassName('nombreValor')[0],
            carpetaActual.getElementsByClassName('valorParametro')[0],
        )

    carpetasValoresTrazo[valor.nombreCompleto].range.min = rango.minimo
    carpetasValoresTrazo[valor.nombreCompleto].range.max = rango.maximo
    carpetasValoresTrazo[valor.nombreCompleto].range.step = rango.salto

    return carpetasValoresTrazo[valor.nombreCompleto]
}

function agregarValorConjunto(ubicacion, valor, antesDespues = 'afterbegin') {
    let asignacionesValores = ''
    for (const actual of valor.listaValores) {
        asignacionesValores += 'trazoActivo.' + actual.accesoVariable + ' = Number(this.value) ;'
    }

    let asignacionesValoresBotonResta = ''
    for (const actual of valor.listaValores)
        asignacionesValoresBotonResta += 'trazoActivo.' + actual.accesoVariable + ' = nuevoValorResta' + valor.nombreCompleto + ';'
    let asignacionesValoresBotonSuma = ''
    for (const actual of valor.listaValores)
        asignacionesValoresBotonSuma += 'trazoActivo.' + actual.accesoVariable + ' = nuevoValorSuma' + valor.nombreCompleto + ';'

    ubicacion.insertAdjacentHTML(antesDespues, `
        <div class="conjuntoValoresPreset cerrado ${valor.categoria}"  id="${valor.nombreCompleto}">
            <div class="valorPreset">
                <div class="configuracionValor">
                    <div class="texto">
                        <p class="nombreValor"> ${valor.nombre} </p>
                        <p class="valorParametro">0</p>
                    </div>
                    <div class="inputs" data-idtrazo = "${idPresetActivo}">
                        <button type="button" class="botonResta"  onclick ="
                        let nuevoValorResta${valor.nombreCompleto} = Number(carpetasValoresTrazo['${valor.nombreCompleto}'].darPaso(-1));
                        ${asignacionesValoresBotonResta}

                        carpetasValoresTrazo['${valor.nombreCompleto}'].actualizarNumerosHtml(); 
                        renderizar(categoriaPresets.todos[Number(this.parentNode.dataset.idtrazo)]) ;
                        ">
                        -
                        </button>
                        <div class="rangeCaja inputRange">
                            <input type="range" class="range rangeJefe"
                            onchange="renderizarPreVisualizacionPreset(categoriaPresets.todos[Number(this.parentNode.parentNode.dataset.idtrazo)])"
                            oninput ="${asignacionesValores}
                            this.parentNode.parentNode.parentNode.querySelector('.valorParametro').innerHTML = this.value;
                            carpetasValoresTrazo['${valor.nombreCompleto}'].actualizarNumerosHtml(); 
                            renderizar(categoriaPresets.todos[Number(this.parentNode.parentNode.dataset.idtrazo)]) ;
                            "
                            >
                        </div>
                        <button type="button" class="botonSuma" onclick="
                        let nuevoValorSuma${valor.nombreCompleto}=Number(carpetasValoresTrazo['${valor.nombreCompleto}'].darPaso());
                        ${asignacionesValoresBotonSuma}
                        carpetasValoresTrazo['${valor.nombreCompleto}'].actualizarNumerosHtml(); 
                        renderizar(categoriaPresets.todos[Number(this.parentNode.dataset.idtrazo)]) ;
                        ">
                        +
                        </button>
                    </div>
                </div>
            </div>
            <div class="lista">
                <div class="separacionValor"></div>

            </div>
            <button class="plegarDesplegarConjunto" type="button" onclick="
                let listaAlgo = this.parentNode
                if(listaAlgo.classList.contains('abierto')){
                    listaAlgo.classList.add('cerrado')
                    listaAlgo.classList.remove('abierto')
                }else{
                    listaAlgo.classList.remove('cerrado')
                    listaAlgo.classList.add('abierto')
                }
            ">
                <img src="/interfaz/imagenes/flechaLargaVertical.svg" alt="">
            </button>
        </div>
    `);
    const carpetaActual = document.getElementById(valor.nombreCompleto)
    const rangeJefe = carpetaActual.querySelector('.rangeJefe')
    const valorActualJefe = carpetaActual.querySelector('.valorParametro')
    const listaValores = carpetaActual.querySelector('.lista')
    const contenedorInputs = carpetaActual.querySelector('.inputs')
    carpetasValoresTrazo[valor.nombreCompleto] =
        new carpetaConjunto(
            valor,
            carpetaActual,
            rangeJefe,
            contenedorInputs,
            valorActualJefe
        )

    const rango = trazo.obtenerRangoValor(valor.listaValores[0].accesoVariable)


    rangeJefe.min = rango.minimo
    rangeJefe.max = rango.maximo
    rangeJefe.step = rango.salto

    for (const actual of valor.listaValores) {
        carpetasValoresTrazo[valor.nombreCompleto].carpetasHijas.push(agregarValorNumerico(listaValores, actual, 'beforeend'))
    }
}

function agregarValoresTrazo() {
    for (const valor of valoresTrazo) {
        let ubicacion = document.getElementById('listaValoresPreset')
        if (ubicacion.querySelector('.seccionCategoria.' + valor.categoria)) {
            ubicacion = ubicacion.querySelector('.seccionCategoria.' + valor.categoria)
        } else {
            ubicacion.insertAdjacentHTML('afterbegin', `
            <div class="seccionCategoria ${valor.categoria}" >
            </div>
            `);

            document.getElementById('categoriasValoresPreset').insertAdjacentHTML('afterbegin', `
                <button button type = "button" class="categoriaValor" onclick = "mostrarCategoriaValorCorrecta('${valor.categoria}')" >
                    <p>${valor.categoria}</p>
                </button>
            `);
            ubicacion = ubicacion.querySelector('.seccionCategoria.' + valor.categoria)
        }

        if (!tiposCategoriasValor.includes(valor.categoria))
            tiposCategoriasValor.push(valor.categoria)

        switch (valor.tipoValor) {
            case 'numero':
                agregarValorNumerico(ubicacion, valor);
                break;
            case 'seleccion':
                agregarValorSeleccionable(ubicacion, valor);
                break;
            case 'switch':
                agregarValorSwitch(ubicacion, valor);
                break;
            case 'accion':
                agregarValorAccion(ubicacion, valor);
                break;
            case 'conjunto':
                agregarValorConjunto(ubicacion, valor);
                break;
            default:
                ubicacion.insertAdjacentHTML('afterbegin', `
                    <div class="separacionValor" >
                    </div>`
                );
                break;
        }
    }
}

function actualizarValoresHtml() {
    for (const valor of valoresTrazo) {
        if (valor.esSeparacion) continue
        carpetasValoresTrazo[valor.nombreCompleto].actualizarValoresHtml();
    }
    acomodarNombrePreset()
    renderizar(categoriaPresets.todos[idPresetActivo])
}

function acomodarDisplaysNone() {
    for (const actual of tiposCategoriasValor) {
        document.querySelector('.seccionCategoria.' + actual).style.display = 'none'
    }
    document.querySelector('.seccionCategoria.' + categoriaValorSeleccionada).style.display = 'flex'
}

function acomodarNombrePreset() {
    const nombrePreset = categoriaPresets.todos[idPresetActivo].nombre
    document.getElementById('nombrePreset').innerHTML = nombrePreset
    const presetActivo = document.getElementById('preset-' + idPresetActivo)

    const modificadorPresetInput = document.getElementById('nombrePresetActivo')
    if (modificadorPresetInput) {
        modificadorPresetInput.placeholder = nombrePreset
        modificadorPresetInput.value = ''
    }
    if (presetActivo) {
        presetActivo.querySelector('.nombrePreset').innerHTML = nombrePreset
    }
}

agregarValoresTrazo()
actualizarValoresHtml()
renderizar(categoriaPresets.todos[idPresetActivo])
acomodarNombrePreset()
acomodarDisplaysNone()

function mostrarCategoriaValorCorrecta(categoria) {
    document.querySelector('.seccionCategoria.' + categoriaValorSeleccionada).style.display = 'none'
    categoriaValorSeleccionada = categoria
    document.querySelector('.seccionCategoria.' + categoriaValorSeleccionada).style.display = 'flex'
}