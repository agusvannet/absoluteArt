class cordenada {
    constructor(x, y, presion = 1, msPx = 1, inclinacionX = 0, inclinacionY = 0, alpha = 1) {
        this.x = x;
        this.y = y;
        this.presion = presion;
        this.msPx = msPx;
        this.alpha = alpha;
        this.inclinacionY = inclinacionY;
        this.inclinacionX = inclinacionX;
    }
    static maxMsPx = 1;
    static minMsPx = 0.004;
    static maxInclinacion = 90;
    static minInclinacion = -90;
    clonar(x = this.x, y = this.y, presion = this.presion, msPx = this.msPx, inclinacionX = 0, inclinacionY = 0, alpha = this.alpha) {
        return new cordenada(x, y, presion, msPx, inclinacionX, inclinacionY, alpha)
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
