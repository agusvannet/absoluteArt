let contadorCordenadas = 0;
class cordenada {
    constructor(x, y, presion = 1, msPx = 1, inclinacionX = 0, inclinacionY = 0, alpha = 1, grosor = 1, rotacion = 0) {
        this.x = x; // cualquier numero 
        this.y = y; // cualquier numero 
        this.presion = presion; // 0 - 1
        this.msPx = msPx; // 0.004 - 0.5
        this.inclinacionX = inclinacionX; // -90 - 90
        this.inclinacionY = inclinacionY; // -90 - 90
        this.alpha = alpha; // 0 - 1
        this.grosor = grosor; // 0 - 1
        this.rotacion = rotacion; // 0  - 2 PI

        contadorCordenadas++;
    }
    static maxMsPx = 0.5;
    static minMsPx = 0.004;
    static maxInclinacion = 90;
    static minInclinacion = -90;
    clonar(
        x = this.x,
        y = this.y,
        presion = this.presion,
        msPx = this.msPx,
        inclinacionX = this.inclinacionX,
        inclinacionY = this.inclinacionY,
        alpha = this.alpha,
        grosor = this.grosor,
        rotacion = this.rotacion) {
        const cord = new cordenada(x, y, presion, msPx, inclinacionX, inclinacionY, alpha, grosor, rotacion)
        cord.indice = this.indice
        return cord
    }
}

class grupoCordenada {
    constructor() {
    }
}

const piscinaCordenadas = {
    cordenadas: [],
    gruposVivos: [],

    agregarCordenada(arrayReceptor, x, y, presion = 1, msPx = 1, inclinacionX = 0, inclinacionY = 0, alpha = 1) {
        const cord = new cordenada(x, y, presion, msPx, inclinacionX, inclinacionY, alpha)
        this.cordenadas.push(

        )
    },

    liberarArray(array) {

    },
}
