
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

scroleables.forEach(element => {

}); 