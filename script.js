const DOMSelectors = {
    calcularCuotasBtn: document.getElementById('calcular-cuotas-btn'),
    verHistorialBtn: document.getElementById('ver-historial-btn'),
    limpiarHistorialBtn: document.getElementById('limpiar-historial-btn'),
    tablaAmortizacionBtn: document.getElementById('tabla-amortizacion-btn'),
    tasasVariablesBtn: document.getElementById('tasas-variables-btn'),
    simulacionesBtn: document.getElementById('simulaciones-btn'),
    estadisticasBtn: document.getElementById('estadisticas-btn'),
    output: document.getElementById('output'),
    inputForm: document.getElementById('input-form'),
    inputSection: document.getElementById('input-section'),
    submitBtn: document.getElementById('submit-btn'),
    loadingOverlay: document.getElementById('loading-overlay'),
};

let historialCuotas = JSON.parse(localStorage.getItem('historialCuotas')) || [];
let simulacionesResultados = JSON.parse(localStorage.getItem('simulacionesResultados')) || [];

function guardarHistorial() {
    localStorage.setItem('historialCuotas', JSON.stringify(historialCuotas));
}

function guardarSimulaciones() {
    localStorage.setItem('simulacionesResultados', JSON.stringify(simulacionesResultados));
}

function toggleLoading(state) {
    const overlay = DOMSelectors.loadingOverlay;
    if (state) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function mostrarFormulario(campos, callback) {
    DOMSelectors.inputForm.innerHTML = '';
    DOMSelectors.inputSection.style.display = 'block';

    campos.forEach(({ label, type, id, max }) => {
        const fieldWrapper = document.createElement('div');
        const fieldLabel = document.createElement('label');
        const fieldInput = document.createElement('input');

        fieldLabel.textContent = label;
        fieldInput.type = type;
        fieldInput.id = id;
        fieldInput.max = max || '';
        fieldInput.required = true;

        fieldWrapper.appendChild(fieldLabel);
        fieldWrapper.appendChild(fieldInput);
        DOMSelectors.inputForm.appendChild(fieldWrapper);
    });

    DOMSelectors.submitBtn.onclick = () => {
        const valores = {};
        campos.forEach(({ id, type }) => {
            const valor = document.getElementById(id).value;
            valores[id] = type === 'number' ? parseFloat(valor) : valor;
        });

        DOMSelectors.inputSection.style.display = 'none';
        callback(valores);
    };
}

function updateOutput(content) {
    DOMSelectors.output.innerHTML = ''; 
    DOMSelectors.output.appendChild(content); 
}

function calcularCuota(monto, cuotas, tasaInteres) {
    const tasaMensual = tasaInteres / 100 / 12;
    return monto * (tasaMensual * Math.pow(1 + tasaMensual, cuotas)) / (Math.pow(1 + tasaMensual, cuotas) - 1);
}

function calcularConTasasVariables(monto, cuotas, tasaInicial, tasaCambio, mesCambio) {
    const cuotaInicial = calcularCuota(monto, mesCambio, tasaInicial);
    const saldoRestante = monto * (Math.pow(1 + (tasaInicial / 100 / 12), mesCambio) - 1) / (Math.pow(1 + (tasaInicial / 100 / 12), mesCambio) - 1);
    const cuotaFinal = calcularCuota(saldoRestante, cuotas - mesCambio, tasaCambio);

    updateOutput(`
🔹 Resultados con tasas variables 🔹
Cuota inicial (Tasa ${tasaInicial}%): $${cuotaInicial.toFixed(2)} por ${mesCambio} meses.
Cuota final (Tasa ${tasaCambio}%): $${cuotaFinal.toFixed(2)} por ${cuotas - mesCambio} meses.
-----------------------------------
    `);
}

function realizarSimulaciones(monto, cuotasSimulacion, tasas) {
    const simulaciones = tasas.flatMap(tasa => {
        return cuotasSimulacion.map(cuotas => {
            const cuotaMensual = calcularCuota(monto, cuotas, tasa);
            const totalPagado = cuotaMensual * cuotas;
            const intereses = totalPagado - monto;

            return { tasa, cuotas, cuotaMensual, totalPagado, intereses };
        });
    });

    simulacionesResultados = simulaciones;
    guardarSimulaciones(); 

    const resultadosTexto = simulaciones.map(sim => `
Tasa: ${sim.tasa}% | Cuotas: ${sim.cuotas}
Cuota Mensual: $${sim.cuotaMensual.toFixed(2)}
Total Pagado: $${sim.totalPagado.toFixed(2)}
Intereses: $${sim.intereses.toFixed(2)}
----------------------------------
    `).join('\n');

    updateOutput(`📊 Resultados de simulaciones 📊\n${resultadosTexto}`);
}

DOMSelectors.calcularCuotasBtn.addEventListener('click', () => {
    mostrarFormulario([
        { label: 'Monto Total:', type: 'number', id: 'monto' },
        { label: 'Número de Cuotas:', type: 'number', id: 'cuotas', max: 360 },
        { label: 'Tasa de Interés (%):', type: 'number', id: 'tasaInteres', max: 100 },
    ], ({ monto, cuotas, tasaInteres }) => {
        const cuota = calcularCuota(monto, cuotas, tasaInteres);
        const totalPagado = cuota * cuotas;
        const interesesTotales = totalPagado - monto;

        historialCuotas.push({ monto, cuotas, tasaInteres, totalPagado, interesesTotales });
        guardarHistorial(); 

        updateOutput(`
Cuota mensual: $${cuota.toFixed(2)}
Total a pagar: $${totalPagado.toFixed(2)}
Intereses totales: $${interesesTotales.toFixed(2)}
        `);
    });
});

DOMSelectors.verHistorialBtn.addEventListener('click', () => {
    if (historialCuotas.length === 0) {
        updateOutput("⚠️ No hay cálculos previos.");
        return;
    }

    const historial = historialCuotas.map((entry, index) => `
#${index + 1} - Monto: $${entry.monto}, Cuotas: ${entry.cuotas}, Tasa: ${entry.tasaInteres}%
    Total Pagado: $${entry.totalPagado.toFixed(2)}
    Intereses Totales: $${entry.interesesTotales.toFixed(2)}
    `).join("\n");

    updateOutput(`📜 Historial de cálculos:\n${historial}`);
});

DOMSelectors.limpiarHistorialBtn.addEventListener('click', () => {
    historialCuotas = [];
    localStorage.removeItem('historialCuotas'); 
    updateOutput("✅ Historial limpiado.");
});

function updateOutput(content) {
    if (typeof content === "string") {
        DOMSelectors.output.textContent = content; 
    } else if (content instanceof HTMLElement) {
        DOMSelectors.output.innerHTML = ''; 
        DOMSelectors.output.appendChild(content);
    } else {
        console.error("El contenido proporcionado no es válido:", content);
    }
}

DOMSelectors.calcularCuotasBtn.addEventListener('click', () => {
    mostrarFormulario([
        { label: 'Monto Total:', type: 'number', id: 'monto' },
        { label: 'Número de Cuotas:', type: 'number', id: 'cuotas', max: 360 },
        { label: 'Tasa de Interés (%):', type: 'number', id: 'tasaInteres', max: 100 },
    ], ({ monto, cuotas, tasaInteres }) => {
        const cuota = calcularCuota(monto, cuotas, tasaInteres);
        const totalPagado = cuota * cuotas;
        const interesesTotales = totalPagado - monto;

        historialCuotas.push({ monto, cuotas, tasaInteres, totalPagado, interesesTotales });
        guardarHistorial();

        const resultado = `
            Cuota mensual: $${cuota.toFixed(2)}
            Total a pagar: $${totalPagado.toFixed(2)}
            Intereses totales: $${interesesTotales.toFixed(2)}
        `;
        console.log("Resultado calculado:", resultado); 
        updateOutput(resultado);
    });
});

DOMSelectors.verHistorialBtn.addEventListener('click', () => {
    if (historialCuotas.length === 0) {
        updateOutput("⚠️ No hay cálculos previos.");
        return;
    }

    const historial = historialCuotas.map((entry, index) => `
#${index + 1} - Monto: $${entry.monto}, Cuotas: ${entry.cuotas}, Tasa: ${entry.tasaInteres}%
    Total Pagado: $${entry.totalPagado.toFixed(2)}
    Intereses Totales: $${entry.interesesTotales.toFixed(2)}
    `).join("\n");

    console.log("Historial cargado:", historial); 
    updateOutput(`📜 Historial de cálculos:\n${historial}`);
});

DOMSelectors.simulacionesBtn.addEventListener('click', () => {
    mostrarFormulario([
        { label: 'Monto Total:', type: 'number', id: 'monto' },
        { label: 'Número de Cuotas:', type: 'number', id: 'cuotas', max: 360 },
    ], ({ monto }) => {
        const tasas = [5, 10, 15];
        const cuotasSimulacion = [12, 24, 36];

        realizarSimulaciones(monto, cuotasSimulacion, tasas);

        const simulacionesTexto = simulacionesResultados.map(sim => `
Tasa: ${sim.tasa}% | Cuotas: ${sim.cuotas}
Cuota Mensual: $${sim.cuotaMensual.toFixed(2)}
Total Pagado: $${sim.totalPagado.toFixed(2)}
Intereses: $${sim.intereses.toFixed(2)}
----------------------------------
        `).join('\n');

        console.log("Simulaciones realizadas:", simulacionesTexto); 
        updateOutput(`📊 Resultados de simulaciones 📊\n${simulacionesTexto}`);
    });
});

DOMSelectors.tasasVariablesBtn.addEventListener('click', () => {
    mostrarFormulario([
        { label: 'Monto Total:', type: 'number', id: 'monto' },
        { label: 'Número de Cuotas:', type: 'number', id: 'cuotas', max: 360 },
        { label: 'Tasa de Interés Inicial (%):', type: 'number', id: 'tasaInicial', max: 100 },
        { label: 'Tasa de Cambio (%):', type: 'number', id: 'tasaCambio', max: 100 },
        { label: 'Mes de Cambio de Tasa:', type: 'number', id: 'mesCambio', max: 360 },
    ], ({ monto, cuotas, tasaInicial, tasaCambio, mesCambio }) => {
        if (mesCambio >= cuotas) {
            updateOutput("⚠️ El mes de cambio debe ser menor al número total de cuotas.");
            return;
        }

        const cuotaInicial = calcularCuota(monto, mesCambio, tasaInicial);
        const saldoRestante = monto - (cuotaInicial * mesCambio);
        const cuotaFinal = calcularCuota(saldoRestante, cuotas - mesCambio, tasaCambio);

        const resultado = `
🔹 Resultados con tasas variables 🔹
Cuota inicial (Tasa ${tasaInicial}%): $${cuotaInicial.toFixed(2)} por ${mesCambio} meses.
Cuota final (Tasa ${tasaCambio}%): $${cuotaFinal.toFixed(2)} por ${cuotas - mesCambio} meses.
-----------------------------------
`;
        console.log("Resultados tasas variables:", resultado);
        updateOutput(resultado);
    });
});

function obtenerEstadisticas() {
    if (simulacionesResultados.length === 0) {
        updateOutput("⚠️ No hay simulaciones previas para generar estadísticas.");
        return;
    }

    const totalSimulaciones = simulacionesResultados.length;
    const interesesTotales = simulacionesResultados.reduce((acc, sim) => acc + sim.intereses, 0);
    const promedioIntereses = interesesTotales / totalSimulaciones;
    const estadisticas = `
📊 Estadísticas de Simulaciones 📊
Total de Simulaciones: ${totalSimulaciones}
Intereses Totales: $${interesesTotales.toFixed(2)}
Promedio de Intereses: $${promedioIntereses.toFixed(2)}
----------------------------------
`;
    console.log("Estadísticas generadas:", estadisticas);
    updateOutput(estadisticas);
}

DOMSelectors.estadisticasBtn.addEventListener('click', obtenerEstadisticas);
