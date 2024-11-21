let historialCuotas = [];
let historialOperacionesAvanzadas = [];
let simulacionesResultados = [];

function calcularCuota(monto, cuotas, tasaInteres) {
    const tasaMensual = tasaInteres / 100 / 12;
    return monto * (tasaMensual * Math.pow(1 + tasaMensual, cuotas)) / (Math.pow(1 + tasaMensual, cuotas) - 1);
}

function solicitarEntrada(mensaje, esEntero = false, max = null) {
    let valor;
    do {
        valor = esEntero ? parseInt(prompt(mensaje)) : parseFloat(prompt(mensaje));
        if (isNaN(valor) || valor <= 0 || (max !== null && valor > max)) {
            alert(`⚠️ Entrada no válida. Por favor, ingrese un valor numérico positivo${max ? ` menor o igual a ${max}` : ""}.`);
        }
    } while (isNaN(valor) || valor <= 0 || (max !== null && valor > max));
    return valor;
}

function mostrarResultados(cuota, totalPagado, interesesTotales) {
    const fecha = new Date().toLocaleString();
    const resultado = `
🔹 Resultados del cálculo (${fecha}) 🔹
Cuota mensual: $${cuota.toFixed(2)}
Total a pagar: $${totalPagado.toFixed(2)}
Intereses totales: $${interesesTotales.toFixed(2)}
-----------------------------------
    `;
    alert(resultado);
    historialCuotas.push({ fecha, detalle: resultado });
}

function verHistorial() {
    if (historialCuotas.length === 0 && historialOperacionesAvanzadas.length === 0) {
        alert("⚠️ No hay cálculos previos.");
    } else {
        const cuotasHistorial = historialCuotas.map(h => h.detalle).join("\n");
        const operacionesHistorial = historialOperacionesAvanzadas.map(h => h.detalle).join("\n");

        alert(`
📜 Historial de cálculos de cuotas:
${cuotasHistorial}

📜 Historial de operaciones matemáticas avanzadas:
${operacionesHistorial}
        `);
    }
}

function limpiarHistorial() {
    historialCuotas = [];
    historialOperacionesAvanzadas = [];
    alert("✅ Historial limpiado.");
}

function mostrarAmortizacionCompleta(monto, cuotas, tasaInteres) {
    const tasaMensual = tasaInteres / 100 / 12;
    const cuota = calcularCuota(monto, cuotas, tasaInteres);
    let saldoRestante = monto;
    let tabla = "📊 Tabla de Amortización 📊\nMes\tCuota\tIntereses\tCapital\tSaldo\n";

    for (let i = 1; i <= cuotas; i++) {
        const interes = saldoRestante * tasaMensual;
        const capital = cuota - interes;
        saldoRestante -= capital;

        tabla += `${i}\t$${cuota.toFixed(2)}\t$${interes.toFixed(2)}\t$${capital.toFixed(2)}\t$${saldoRestante.toFixed(2)}\n`;
    }
    alert(tabla);
    historialCuotas.push({ fecha: new Date().toLocaleString(), detalle: tabla });
}

function calcularConTasasVariables(monto, cuotas, tasaInicial, tasaCambio, mesCambio) {
    const cuotaInicial = calcularCuota(monto, mesCambio, tasaInicial);
    const saldoRestante = monto * (Math.pow(1 + (tasaInicial / 100 / 12), mesCambio) - 1) / (Math.pow(1 + (tasaInicial / 100 / 12), mesCambio) - 1);
    const cuotaFinal = calcularCuota(saldoRestante, cuotas - mesCambio, tasaCambio);

    alert(`
🔹 Resultados con tasas variables 🔹
Cuota inicial (Tasa ${tasaInicial}%): $${cuotaInicial.toFixed(2)} por ${mesCambio} meses.
Cuota final (Tasa ${tasaCambio}%): $${cuotaFinal.toFixed(2)} por ${cuotas - mesCambio} meses.
-----------------------------------
    `);
}

function realizarSimulacion(monto, cuotas, tasas, cuotasSimulacion) {
    let simulaciones = [];
    tasas.forEach(tasa => {
        cuotasSimulacion.forEach(cuota => {
            const cuotaMensual = calcularCuota(monto, cuota, tasa);
            const totalPagado = cuotaMensual * cuota;
            const interesesTotales = totalPagado - monto;

            simulaciones.push({
                tasa,
                cuotas: cuota,
                cuotaMensual: cuotaMensual.toFixed(2),
                totalPagado: totalPagado.toFixed(2),
                interesesTotales: interesesTotales.toFixed(2),
            });
        });
    });

    simulacionesResultados = simulaciones;
    let simulacionTexto = "📊 Simulaciones 📊\nTasa de Interés | Cuotas | Cuota Mensual | Total Pagado | Intereses Totales\n";
    simulaciones.forEach(sim => {
        simulacionTexto += `${sim.tasa}% | ${sim.cuotas} | $${sim.cuotaMensual} | $${sim.totalPagado} | $${sim.interesesTotales}\n`;
    });

    alert(simulacionTexto);
}

function obtenerEstadisticas() {
    if (historialCuotas.length === 0) {
        alert("⚠️ No hay datos suficientes para calcular estadísticas.");
        return;
    }

    let totalPagado = 0;
    let totalIntereses = 0;
    let totalCuotas = 0;

    historialCuotas.forEach(h => {
        const cuotas = h.detalle.match(/(\d+\.?\d*)/g);
        totalCuotas += parseFloat(cuotas[0]);
        totalPagado += parseFloat(cuotas[1]);
        totalIntereses += parseFloat(cuotas[2]);
    });

    const promedioCuotas = totalCuotas / historialCuotas.length;
    const promedioTotalPagado = totalPagado / historialCuotas.length;
    const promedioIntereses = totalIntereses / historialCuotas.length;

    alert(`
📊 Estadísticas del historial 📊
Promedio de cuotas: ${promedioCuotas.toFixed(2)}
Promedio de total pagado: $${promedioTotalPagado.toFixed(2)}
Promedio de intereses totales: $${promedioIntereses.toFixed(2)}
    `);
}

function main() {
    let continuar = true;
    while (continuar) {
        const opcion = prompt(`
🔹 Menú Principal 🔹
1. Realizar un cálculo de cuotas
2. Ver historial de cálculos
3. Limpiar historial
4. Mostrar tabla de amortización completa
5. Calcular con tasas variables
6. Realizar simulaciones múltiples
7. Obtener estadísticas del historial
8. Salir
Seleccione una opción (1, 2, 3, 4, 5, 6, 7 o 8):
        `);

        switch (opcion) {
            case '1':
                const monto = solicitarEntrada("Ingrese el monto total:");
                const cuotas = solicitarEntrada("Ingrese el número de cuotas (entero):", true, 360); // Máximo 30 años
                const tasaInteres = solicitarEntrada("Ingrese la tasa de interés (%):", false, 100);

                const cuota = calcularCuota(monto, cuotas, tasaInteres);
                const totalPagado = cuota * cuotas;
                const interesesTotales = totalPagado - monto;

                mostrarResultados(cuota, totalPagado, interesesTotales);
                break;

            case '2':
                verHistorial();
                break;

            case '3':
                limpiarHistorial();
                break;

            case '4':
                const montoAmortizacion = solicitarEntrada("Ingrese el monto total:");
                const cuotasAmortizacion = solicitarEntrada("Ingrese el número de cuotas (entero):", true, 360);
                const tasaAmortizacion = solicitarEntrada("Ingrese la tasa de interés (%):", false, 100);

                mostrarAmortizacionCompleta(montoAmortizacion, cuotasAmortizacion, tasaAmortizacion);
                break;

            case '5':
                const montoTasas = solicitarEntrada("Ingrese el monto total:");
                const cuotasTasas = solicitarEntrada("Ingrese el número total de cuotas (entero):", true, 360);
                const tasaInicial = solicitarEntrada("Ingrese la tasa inicial (%):", false, 100);
                const tasaCambio = solicitarEntrada("Ingrese la tasa posterior (%):", false, 100);
                const mesCambio = solicitarEntrada("Ingrese el mes en el que cambiará la tasa (entero):", true, cuotasTasas);

                calcularConTasasVariables(montoTasas, cuotasTasas, tasaInicial, tasaCambio, mesCambio);
                break;

            case '6':
                const tasasSimulacion = [5, 10, 15]; 
                const cuotasSimulacion = [12, 24, 36]; 
                const montoSimulacion = solicitarEntrada("Ingrese el monto total:");
                realizarSimulacion(montoSimulacion, cuotasSimulacion, tasasSimulacion, cuotasSimulacion);
                break;

            case '7':
                obtenerEstadisticas();
                break;

            case '8':
                alert("✅ Gracias por usar la calculadora de cuotas. ¡Hasta la próxima!");
                continuar = false;
                break;

            default:
                alert("⚠️ Opción no válida. Por favor, elija una opción válida.");
        }
    }
}

document.getElementById('iniciar-btn').addEventListener('click', function() {
    main(); 
});