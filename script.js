let historial = "";

function calcularCuota(monto, cuotas, tasaInteres) {
    const tasaMensual = tasaInteres / 100 / 12;
    return monto * (tasaMensual * Math.pow(1 + tasaMensual, cuotas)) / (Math.pow(1 + tasaMensual, cuotas) - 1);
}

function solicitarEntrada(mensaje, esEntero = false) {
    let valor;
    do {
        valor = esEntero ? parseInt(prompt(mensaje)) : parseFloat(prompt(mensaje));
        if (isNaN(valor) || valor <= 0) {
            alert("⚠️ Entrada no válida. Por favor, ingrese un valor numérico positivo.");
        }
    } while (isNaN(valor) || valor <= 0);
    return valor;
}

function mostrarResultados(cuota, totalPagado, interesesTotales) {
    const resultado = `
🔹 Resultados del cálculo 🔹
Cuota mensual: $${cuota.toFixed(2)}
Total a pagar: $${totalPagado.toFixed(2)}
Intereses totales: $${interesesTotales.toFixed(2)}
-----------------------------------
    `;
    alert(resultado);
    historial += resultado + "\n"; 
}

function verHistorial() {
    if (historial === "") {
        alert("⚠️ No hay cálculos previos.");
    } else {
        alert(`📜 Historial de cálculos:\n${historial}`);
    }
}

function main() {
    let continuar = true;
    while (continuar) {
        const opcion = prompt(`
🔹 Menú Principal 🔹
1. Realizar un cálculo de cuotas
2. Ver historial de cálculos
3. Ver instrucciones
4. Limpiar historial
5. Salir
Seleccione una opción (1, 2, 3, 4 o 5):
        `);

        switch (opcion) {
            case '1':
                const monto = solicitarEntrada("Ingrese el monto total:");
                const cuotas = solicitarEntrada("Ingrese el número de cuotas (entero):", true);
                const tasaInteres = solicitarEntrada("Ingrese la tasa de interés (%):");
                
                const cuota = calcularCuota(monto, cuotas, tasaInteres);
                const totalPagado = cuota * cuotas;
                const interesesTotales = totalPagado - monto;

                mostrarResultados(cuota, totalPagado, interesesTotales);
                break;

            case '2':
                verHistorial();
                break;

            case '3':
                alert(`
📘 Instrucciones:
1. Seleccione la opción '1' para realizar un cálculo de cuotas.
2. Siga las indicaciones para ingresar el monto, las cuotas y la tasa de interés.
3. Los resultados se mostrarán y guardarán en el historial.
4. Puede ver el historial, limpiar el historial o salir del programa.
-----------------------------------
                `);
                break;

            case '4':
                historial = ""; 
                alert("✅ Historial limpiado.");
                break;

            case '5':
                alert("✅ Gracias por usar la calculadora de cuotas. ¡Hasta la próxima!");
                continuar = false;
                break;

            default:
                alert("⚠️ Opción no válida. Por favor, elija 1, 2, 3, 4 o 5.");
        }
    }
}

main();