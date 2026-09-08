function hexToRgb(hex) {
    return utiles.colorHexaRgba(hex)
}
const canvasDom = document.getElementById("canvasPrincipal");
canvasDom.width = mesaTrabajo.confCapas.largoLienzo
canvasDom.height = mesaTrabajo.confCapas.altoLienzo
const canvas = lienzos.obtener({ largo: canvasDom.width, alto: canvasDom.height, canvas: canvasDom })
const canvasLienzo = canvas

const canvasInfo = canvasDom.getBoundingClientRect();

configuracion.configuracionesBase(canvasDom);


document.getElementById('representacionGrupo0').querySelector('button').appendChild(mesaTrabajo.capas.lienzo.canvas).id = 'canvasgrupocapa0'
document.getElementById('representacionCapa1').querySelector('button').appendChild(mesaTrabajo.capaActiva.lienzo.canvas).id = 'canvasindividualcapa0'

function revertirTrazo() {
    canvas.limpiar()
    mesaTrabajo.revertirTrazo()
    mesaTrabajo.renderizar(canvas)
}

function recuperarTrazo() {
    canvas.limpiar()
    mesaTrabajo.recuperarTrazo()
    mesaTrabajo.renderizar(canvas)
}

let capaActual = mesaTrabajo.capas
const listaCapas = document.getElementById('listaCapas');

function cambiarOpacidadCapa() {
    capaActual.cambiarOpacidad(Number(document.getElementById('capaOpacidad').value))
    document.getElementById('letreroCapaOpacidad').innerHTML = 'opacidad : ' + capaActual.opacidad;
    canvas.limpiar()
    mesaTrabajo.renderizar(canvas)
}

function cambiarVisibilidadCapa() {
    capaActual.visible = document.getElementById('capaVisibilidad').checked
    document.getElementById('LetreroCapaVisibilidad').innerHTML = 'visible : ' + capaActual.visible;
}

function cambiarEditabilidadCapa() {
    capaActual.editable = document.getElementById('capaEditabilidad').checked
    document.getElementById('letreroCapaEditabilidad').innerHTML = 'editable : ' + capaActual.editable;
}

const confCapa = document.getElementById('configuracionCapaActual');

function abrirConfiguracionCapa() {
    confCapa.style.display = "flex";
    let capa;
    if (tipoCapaActiva === 'grupo') {
        capaActual = mesaTrabajo.capas.buscarGrupoCapas(idGrupoActivo);
    } else {
        capaActual = mesaTrabajo.capas.buscarCapa(idCapaActiva);
    }

    actualizarSelectorCapaPadre();
    actualizarSelectorModoFusion();

    if (capaActual.tipoCapa === 'grupo') {
        document.getElementById('letreroCapaEditabilidad').parentElement.style.display = 'none'
        if (capaActual.id === 0) {
            document.getElementById('letreroCapaPadre').parentElement.style.display = 'none'

        } else {
            document.getElementById('letreroCapaPadre').parentElement.style.display = 'flex'
        }
    } else {
        document.getElementById('letreroCapaEditabilidad').parentElement.style.display = 'flex'
        document.getElementById('letreroCapaPadre').parentElement.style.display = 'flex'
    }


    document.getElementById('nombreCapaConfigurada').innerHTML = capaActual.nombre

    document.getElementById('letreroCapaOpacidad').innerHTML = 'opacidad : ' + capaActual.opacidad;
    document.getElementById('capaOpacidad').value = capaActual.opacidad;

    document.getElementById('LetreroCapaVisibilidad').innerHTML = 'visible : ' + capaActual.visible;
    document.getElementById('capaVisibilidad').checked = capaActual.visible;

    document.getElementById('letreroCapaEditabilidad').innerHTML = 'editable : ' + capaActual.editable;
    document.getElementById('capaEditabilidad').checked = capaActual.editable;

}

let idGrupoActivo = 0;
let idCapaActiva = 0;
let tipoCapaActiva = 'grupo';

function seleccionarCapa(id, tipo) {
    if (tipo === 'individual') {
        tipoCapaActiva = 'individual';
        capaActual = mesaTrabajo.capas.buscarCapa(id);
        mesaTrabajo.capaActiva = capaActual;

        idCapaActiva = id;
        const eliminar = document.querySelector('.activo')
        if (eliminar) {
            eliminar.classList.remove('activo')
        }
        document.getElementById('representacionCapa' + id).classList.add('activo')
        abrirConfiguracionCapa()
        abrirCapasPadre(capaActual)
    } else if (tipo === 'grupo') {
        tipoCapaActiva = 'grupo';
        capaActual = mesaTrabajo.capas.buscarGrupoCapas(id);
        mesaTrabajo.grupoCapasActiva = capaActual;
        idGrupoActivo = id;

        const eliminar = document.querySelector('.activo')
        if (eliminar) {
            eliminar.classList.remove('activo')
        }
        document.getElementById('representacionGrupo' + id).classList.add('activo')
        abrirConfiguracionCapa()
        if (capaActual.id !== 0) {
            abrirCapasPadre(capaActual)
        }
    } else {
        console.log("errorsito bro")
    }
}

function abrirCapasPadre(capa) {
    if (capa.capaPadre) {
        document.getElementById('desplegableCapa' + capa.capaPadre.id).checked = true;
        if (capa.capaPadre.capaPadre) {
            abrirCapasPadre(capa.capaPadre)
        }
    }
}

function agregarCapaDom(tipo) {
    const ubic = document.getElementById('contenido' + idGrupoActivo);

    if (tipo === 'grupo') {
        mesaTrabajo.agregarGrupoCapas(idGrupoActivo);
        const capa = mesaTrabajo.grupoCapasActiva
        idGrupoActivo = capa.id

        agregarCapaGrupo(ubic, capa);
        seleccionarCapa(idGrupoActivo, 'grupo')

    } else if (tipo === 'individual') {

        mesaTrabajo.agregarCapa(idGrupoActivo);
        const capa = mesaTrabajo.capaActiva
        capaActiva = capa.id

        agregarCapaIndividual(ubic, capa)

        seleccionarCapa(capa.id, 'individual')
    }
}

function agregarCapaGrupo(ubicacion, capa) {
    ubicacion.insertAdjacentHTML('afterbegin', `
        <div class="representacionCapa representacionCapaGrupo" id="representacionGrupo${capa.id}" ">
                    <input type="checkbox" name="" class="input" id="desplegableCapa${capa.id}">

                    <div class="portada">
                        <label for="desplegableCapa${capa.id}" class="plegado">
                            <p>></p>
                        </label>
                        <button type="button" class="infoPlegado" onclick="seleccionarCapa(${capa.id} , 'grupo')">
                            <p class="nombreCapa"> ${capa.nombre}</p>
                        </button>
                    </div>
                    <div class="contenido" id="contenido${capa.id}">
                    </div>
                </div>

        `);

    const ubicCanvas = document.getElementById('representacionGrupo' + capa.id).querySelector('button')
    ubicCanvas.appendChild(capa.lienzo.canvas).id = 'canvasgrupocapa' + capa.id

}

function agregarCapaIndividual(ubicacion, capa) {
    ubicacion.insertAdjacentHTML('afterbegin', `
        <div class="representacionCapa representacionCapaGrupo capaIndividual" id="representacionCapa${capa.id}">
                    <input type="checkbox" name="" class="input" id="visibilidadCapa${capa.id} onchange= "cambiarVisibilidadCapa('individual' , ${capa.id})"">

                    <div class="portada">
                        <label for="visibilidadCapa${capa.id}" class="plegado">
                            <p>0</p>
                        </label>
                        <button type="button" class="infoPlegado" onclick="seleccionarCapa(${capa.id} , 'individual')">
                            <p class="nombreCapa"> ${capa.nombre}</p>
                        </button>
                    </div>
                </div>

        `);

    const ubicCanvas = document.getElementById('representacionCapa' + capa.id).querySelector('button')
    ubicCanvas.appendChild(capa.lienzo.canvas).id = 'canvasindividualcapa' + capa.id

}

function agregarContenidoGrupo(grupo) {
    const ubic = document.getElementById('contenido' + grupo.id)
    const borrar = ubic.querySelectorAll('.representacionCapa');
    for (const cap of borrar) {
        cap.remove()
    }

    for (const capa of grupo.contenido) {
        if (capa.tipoCapa === 'grupo') {
            agregarCapaGrupo(ubic, capa)
            if (capa.contenido !== 0) {
                agregarContenidoGrupo(capa)
            }
        } else {
            agregarCapaIndividual(ubic, capa)
        }
    }

}

function eliminarCapaActual() {
    let capaDios = false;
    if (capaActual.tipoCapa === 'grupo') {
        if (capaActual.id === 0) {
            capaDios = true
        }
    }
    if (!capaDios) {
        if (capaActual.tipoCapa === 'grupo') {
            mesaTrabajo.eliminarGrupoCapas(capaActual.id);
            document.getElementById('representacionGrupo' + capaActual.id).remove()
        } else {
            mesaTrabajo.eliminarCapa(capaActual.id);
            document.getElementById('representacionCapa' + capaActual.id).remove()
        }
        capaActual = mesaTrabajo.capas
        seleccionarCapa(capaActual.id, capaActual.tipoCapa)
        canvas.limpiar()
        mesaTrabajo.capas.renderizar(canvas);
    }

}

function moverCapaLista(capa, movimiento) {
    const indiceCapa = capa.capaPadre.obtenerIndiceCapa(capa);
    if (indiceCapa + movimiento >= 0 && indiceCapa + movimiento < capa.capaPadre.contenido.length) {
        capa.capaPadre.moverCapaIndice(capa, indiceCapa + movimiento)
        let capaMover;
        if (capaActual.tipoCapa === 'grupo') {
            capaMover = document.getElementById('representacionGrupo' + capaActual.id)
        } else {
            capaMover = document.getElementById('representacionCapa' + capaActual.id)
        }
        agregarContenidoGrupo(capa.capaPadre)

    }
    seleccionarCapa(capa.id, capa.tipoCapa)
}

function duplicarCapa() {
    if (capaActual.capaPadre) {
        mesaTrabajo.clonarCapa(capaActual.capaPadre, capaActual)
    }
    agregarContenidoGrupo(mesaTrabajo.capas)
    seleccionarCapa(capaActual.id, capaActual.tipoCapa)
}

function actualizarSelectorCapaPadre() {
    const select = document.getElementById('selectorCapaPadre')
    for (const borrar of select.querySelectorAll('option')) {
        borrar.remove();
    }

    for (const capa of mesaTrabajo.capasGrupoVivas) {
        if (capaActual !== capa) {
            let capaHijo = true;
            if (capaActual.tipoCapa === 'grupo') {
                if (capaActual.buscarGrupoCapas(capa.id) !== undefined) {
                    capaHijo = false;
                }
            }
            if (capaHijo) {
                if (capaActual.capaPadre === capa) {
                    select.insertAdjacentHTML('afterbegin', `
                    <option value="${capa.id} ">
                        ${capa.nombre}
                    </option>
                `);
                } else {
                    select.insertAdjacentHTML('afterbegin', `
                        <option value="${capa.id}"  ">
                            ${capa.nombre}
                        </option>
                    `);
                }
            }

        }
    }

    const capaDios = absoluteArt.mesaTrabajo.capas;
    if (capaActual !== capaDios) {
        if (capaActual.capaPadre === capaDios) {
            select.insertAdjacentHTML('afterbegin', `
                <option value="${capaDios.id} ">
                    ${capaDios.nombre}
                </option>
            `);
        } else {
            select.insertAdjacentHTML('afterbegin', `
                <option value="${capaDios.id}" ">
                    ${capaDios.nombre}
                </option>
                `);
        }
    }
}

function actualizarSelectorModoFusion() {
    const select = document.getElementById('selectorModoFusion')
    for (const borrar of select.querySelectorAll('option')) {
        borrar.remove();
    }

    const modosPegado = Object.keys(capaActual.lienzo.modosPegado)
    for (const modo of modosPegado) {
        if (capaActual.modoFusion !== modo) {
            select.insertAdjacentHTML('afterbegin', `
                    <option value="${modo}">
                        ${modo}
                    </option>
                `);
        } else {
            select.insertAdjacentHTML('afterbegin', `
                    <option value="${modo}" disabled selected>
                        ${modo}
                    </option>
                `);
        }
    }
}

function cambiarCapaGrupo() {
    const nuevaCapaPadre = mesaTrabajo.capas.buscarGrupoCapas(Number(document.getElementById('selectorCapaPadre').value));
    mesaTrabajo.capas.moverCapaDeGrupo(capaActual, nuevaCapaPadre)
    agregarContenidoGrupo(mesaTrabajo.capas)
    seleccionarCapa(capaActual.id, capaActual.tipoCapa)
}

function cambiarModoFusion() {
    const nuevoModoFusion = document.getElementById('selectorModoFusion').value
    capaActual.cambiarModoFusion(nuevoModoFusion)
}

function mostrarHsv(elemento) {
    document.getElementById('botonRGB').style.backgroundColor = 'white'
    elemento.style.backgroundColor = 'green'
    modeloColorComparador = 'hsv';
    for (const rgb of document.getElementsByClassName('rgb')) {
        rgb.style.display = 'none'
    }

    for (const hsv of document.getElementsByClassName('hsv')) {
        hsv.style.display = 'flex'
    }
}
function mostrarRgb(elemento) {
    document.getElementById('botonHSV').style.backgroundColor = 'white'
    elemento.style.backgroundColor = 'green'
    modeloColorComparador = 'rgb';
    for (const elem of document.getElementsByClassName('rgb')) {

        elem.style.display = 'flex'
    }

    for (const elem of document.getElementsByClassName('hsv')) {
        elem.style.display = 'none'
    }
}



function listarHerramientas() {
    for (const herramienta of pintor.listaHerramientas) {
        if (herramienta.categoria.nombre === 'sello')
            document.getElementById("sellos").insertAdjacentHTML('beforeend', `<option value="${herramienta.nombre}" >${herramienta.nombre}</option>`);
        else
            document.getElementById("herramientas").insertAdjacentHTML('beforeend', `<option value="${herramienta.nombre}" >${herramienta.nombre}</option>`);
    }
    const modosDIbujo = Object.keys(canvas.modosPegado)
    for (const nombre of modosDIbujo) {
        document.getElementById("modoDibujoHerramienta").insertAdjacentHTML('beforeend', `<option value="${nombre}" >${nombre}</option>`);
    }
}
listarHerramientas();

let colorPrincipal = { r: 0, g: 0, b: 0, }
let colorSecundario = { r: 0, g: 0, b: 0, }
let opacidadPrincipal = 1;
let opacidadSecundaria = 1;
let alphaCompararBalde = 1;
let grosor = 10;
let nombreHerramienta = 'lineaSimple';
let nombreSello = 'selloCircular'
let continuidad = false;
let modoDibujo = 'normal';
let separacion = 1
let toleranciaCanal = {
    alpha: 0,
    rgb: {
        r: 0,
        g: 0,
        b: 0
    },
    hsv: {
        h: 0,
        s: 0,
        v: 0
    }
}
let reflejarCanal = {
    alpha: 0,
    rgb: {
        r: 0,
        g: 0,
        b: 0
    },
    hsv: {
        h: 0,
        s: 0,
        v: 0
    }
}
let setearBalde = true;
let reflejarCanales = false;
let modeloColorComparador = 'rgb'

let compararColorDistinto = false;

function obtenerColores() {
    const rgba = [{
        r: hexToRgb(document.getElementById('colorPrincipal').value).r,
        g: hexToRgb(document.getElementById('colorPrincipal').value).g,
        b: hexToRgb(document.getElementById('colorPrincipal').value).b,
        a: opacidadPrincipal
    }, {
        r: hexToRgb(document.getElementById('colorSecundario').value).r,
        g: hexToRgb(document.getElementById('colorSecundario').value).g,
        b: hexToRgb(document.getElementById('colorSecundario').value).b,
        a: opacidadSecundaria
    }];
    return rgba;
}

function obtenerColorComparar(cordInicial) {
    if (compararColorDistinto) {
        return {
            r: hexToRgb(document.getElementById('colorCompararBalde').value).r,
            g: hexToRgb(document.getElementById('colorCompararBalde').value).g,
            b: hexToRgb(document.getElementById('colorCompararBalde').value).b,
            a: alphaCompararBalde
        }
    } else {
        const colorClickeado = capaActual.lienzo.obtenerPixel(cordInicial);
        return {
            r: colorClickeado.r,
            g: colorClickeado.g,
            b: colorClickeado.b,
            a: colorClickeado.a / 255,
        }
    }
}
function obtenerTrazoActual(cordInicial) {
    const trazoGuardar = new trazo({
        trayectos: [],
        puntoInicial: cordInicial,
        rgba: obtenerColores(),
        grosor: Number(grosor),
        herramienta: nombreHerramienta,
        sello: nombreSello,
        continuidad,
        modoDibujo,
        separacion,

        toleranciaCanal,
        reflejarCanal,

        setearBalde,
        modeloColorComparador,
        reflejarCanales,
        colorCompararBalde: obtenerColorComparar(cordInicial)
    })
    return trazoGuardar;
}
function llenarElCanvasHSVcompleto(idCapa) {
    const capa = mesaTrabajo.capas.contenido[0].lienzo;
    const canvas = capa.canvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const ANCHO = canvas.width;
    const ALTO = canvas.height;
    const MITAD_ALTO = (ALTO / 2) | 0;

    const imgData = ctx.createImageData(ANCHO, ALTO);
    const data = imgData.data;

    // Conversión HSV completo (H: 0-1, S: 0-1, V: 0-1) a RGB [0-255]
    function hsvToRgb(h, s, v) {
        const c = v * s;
        const hp = (h * 6) % 6;
        const x = c * (1 - Math.abs((hp % 2) - 1));
        const m = v - c;

        let r = 0, g = 0, b = 0;
        if (hp < 1) { r = c; g = x; }
        else if (hp < 2) { r = x; g = c; }
        else if (hp < 3) { g = c; b = x; }
        else if (hp < 4) { g = x; b = c; }
        else if (hp < 5) { r = x; b = c; }
        else { r = c; b = x; }

        return [
            ((r + m) * 255) | 0,
            ((g + m) * 255) | 0,
            ((b + m) * 255) | 0
        ];
    }

    // Precalculamos los valores de H para cada columna (2 ciclos)
    const hues = new Float32Array(ANCHO);
    for (let x = 0; x < ANCHO; x++) {
        hues[x] = ((x / ANCHO) * 2) % 1;
    }

    // Llenamos el buffer
    for (let y = 0; y < ALTO; y++) {
        const offsetFila = y * ANCHO * 4;

        let s, v;
        if (y < MITAD_ALTO) {
            // Mitad superior: S varía de 0.0 (arriba) a 1.0 (medio), V fijo en 1.0
            s = y / MITAD_ALTO;
            v = 1.0;
        } else {
            // Mitad inferior: S fija en 1.0, V varía de 1.0 (medio) a 0.0 (fondo)
            s = 1.0;
            v = 1.0 - ((y - MITAD_ALTO) / (ALTO - MITAD_ALTO));
        }

        for (let x = 0; x < ANCHO; x++) {
            const [r, g, b] = hsvToRgb(hues[x], s, v);
            const idx = offsetFila + (x * 4);

            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imgData, 0, 0);

    if (capa.buffer) {
        capa.buffer.set(new Uint32Array(imgData.data.buffer));
    }

    if (typeof mesaTrabajo.render === 'function') mesaTrabajo.render();
    else if (typeof mesaTrabajo.dibujar === 'function') mesaTrabajo.dibujar();
    mesaTrabajo.capas.preRenderizar()
    console.log(canvas)
    mesaTrabajo.capas.renderizar(canvasLienzo)

    console.log(`✓ Grid de prueba inyectado (${ANCHO}x${ALTO}): Hue doble en X, Saturación en mitad superior y Brillo en mitad inferior.`);

}

document.getElementById('cerrarConfCapa').click()

let clickeando = false;

canvasDom.addEventListener('pointerdown', (e) => {
    if (clickeando) return
    clickeando = true;

    const cordenadaActual = utiles.adaptarCordCanvas(e.clientX, e.clientY, canvasDom)
    mesaTrabajo.inicioClick({
        cordenada: cordenadaActual,
        lienzoReal: canvas,
        parametrosTrazo: obtenerTrazoActual(cordenadaActual)
    })
});

let ultimoMovimiento = 0;
let ultimoCord = { x: 0, y: 0 };
canvasDom.addEventListener('pointermove', (e) => {
    let tiempMovimiento = performance.now() - ultimoMovimiento;
    if (ultimoMovimiento = 0) tiempMovimiento = 0
    //   console.log(tiempMovimiento)
    if (clickeando) {
        const cordenadaActual = utiles.adaptarCordCanvas(e.clientX, e.clientY, canvasDom)
        mesaTrabajo.arrastreClick({
            cordenada: cordenadaActual,
            tiempoArrastre: tiempMovimiento,
            lienzoReal: canvas
        })
    }
    ultimoMovimiento = performance.now()
});

canvasDom.addEventListener('pointerup', (e) => {
    clickeando = false;
    const cordenadaActual = utiles.adaptarCordCanvas(e.clientX, e.clientY, canvasDom)

    mesaTrabajo.finClick({
        cordenada: cordenadaActual,
        lienzoReal: canvas
    })

});