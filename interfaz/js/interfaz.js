
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
    console.log(lista.clientHeight, lista.scrollHeight)

    const proporcion = (Math.min((altoVisible / altoContenidoTotal), 1) * 100)
    console.log(proporcion)
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
        <div class="presentacion">
            <canvas width="1" height="1"></canvas>
            <div class="nombrePreset">${preset.nombre}</div>
        </div>
        <div class="acciones">
            <button type="button" class="boton accionPreset">
                <img src="/interfaz/imagenes/botonNaranja.svg" alt="">
            </button>
        </div>
    </div>
    `);
}



for (const preset of categoriaPresets.todos) {
    agregarPresetHtml(preset)
    preset.renderizarPreset({
        canvas: document.getElementById('preset-' + preset.id).querySelector('canvas'),
        recalcularTrayectos: true,
        cantPuntos: 50,
        paddingHorizontal: 15,
        paddingVertical: 15,
    })
}