document.addEventListener('DOMContentLoaded', function() {
    const formatter = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true
    });
    const numberFormatter = new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true
    });
    const inputs = {
        capital: document.getElementById('capital'),
        amortizar: document.getElementById('amortizar'),
        interes: document.getElementById('interes'),
        plazo_anios: document.getElementById('plazo_anios'),
        plazo_meses: document.getElementById('plazo_meses')
    };

    // Format input values on blur
    inputs.capital.addEventListener('blur', function() {
        if (this.value) {
            const value = parseFloat(this.value);
            this.value = formatter.format(value).replace('€', '').trim();
        }
    });

    inputs.amortizar.addEventListener('blur', function() {
        if (this.value) {
            // Ensure we're parsing the raw input value correctly
            const value = parseFloat(this.value.replace(/\./g, '').replace(',', '.'));
            // Format with thousand separators but no decimal places
            this.value = formatter.format(value).replace('€', '').trim();
        }
    });

    // Add input event listeners to calculate totals and compare options with delay
    let calculationTimer;
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(calculationTimer);
            calculationTimer = setTimeout(function() {
                calculateTotals();
                compareOptions();
            }, 400);
        });
    });

    // Initial calculation
    calculateTotals();

    function calculateTotals() {
        const capital = parseFloat(inputs.capital.value.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
        const interes = parseFloat(inputs.interes.value) || 0;
        const plazoAnios = parseInt(inputs.plazo_anios.value) || 0;
        const plazoMeses = parseInt(inputs.plazo_meses.value) || 0;

        const totalMeses = (plazoAnios * 12) + plazoMeses;
        if (capital > 0 && interes > 0 && totalMeses > 0) {
            const tasaMensual = interes / 1200;
            const cuotaMensual = capital * tasaMensual * Math.pow(1 + tasaMensual, totalMeses) / (Math.pow(1 + tasaMensual, totalMeses) - 1);
            const totalPagar = cuotaMensual * totalMeses;
            const totalIntereses = totalPagar - capital;

            document.getElementById('total_sin_amortizacion').value = formatter.format(Math.round(totalPagar));
            document.getElementById('intereses_sin_amortizacion').value = formatter.format(Math.round(totalIntereses));
            document.getElementById('cuota_antes').value = formatter.format(Math.round(cuotaMensual));
            document.getElementById('cuota_mantiene').value = formatter.format(Math.round(cuotaMensual));
            document.getElementById('cuotas_antes').value = numberFormatter.format(totalMeses);
        }
    }

    function compareOptions() {
        const capital = parseFloat(inputs.capital.value.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
        const amortizar = parseFloat(inputs.amortizar.value.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
        const interes = parseFloat(inputs.interes.value) || 0;
        const plazoAnios = parseInt(inputs.plazo_anios.value) || 0;
        const plazoMeses = parseInt(inputs.plazo_meses.value) || 0;
        const totalMeses = (plazoAnios * 12) + plazoMeses;

        if (capital > 0 && amortizar > 0 && interes > 0 && totalMeses > 0) {
            const tasaMensual = interes / 1200;
            const cuotaOriginal = capital * tasaMensual * Math.pow(1 + tasaMensual, totalMeses) / (Math.pow(1 + tasaMensual, totalMeses) - 1);
            const nuevoCapital = capital - amortizar;

            // Reducción de cuota (mismo plazo)
            const nuevaCuota = nuevoCapital * tasaMensual * Math.pow(1 + tasaMensual, totalMeses) / (Math.pow(1 + tasaMensual, totalMeses) - 1);
            const ahorroMensual = cuotaOriginal - nuevaCuota;
            const ahorroAnual = ahorroMensual * 12;
            const totalPagarCuota = nuevaCuota * totalMeses;
            const totalInteresesCuota = totalPagarCuota - nuevoCapital;
            const ahorroTotalInteresesCuota = (cuotaOriginal * totalMeses - capital) - totalInteresesCuota;

            // Reducción de plazo (misma cuota)
            let nuevoTotalMeses = Math.ceil(Math.log(cuotaOriginal / (cuotaOriginal - nuevoCapital * tasaMensual)) / Math.log(1 + tasaMensual));
            const ahorroMeses = totalMeses - nuevoTotalMeses;
            const ahorroAniosPlazo = Math.floor(ahorroMeses / 12);
            const ahorroMesesPlazo = ahorroMeses % 12;
            const nuevoPlazoAnios = Math.floor(nuevoTotalMeses / 12);
            const nuevoPlazoMeses = nuevoTotalMeses % 12;
            const totalPagarPlazo = cuotaOriginal * nuevoTotalMeses;
            const totalInteresesPlazo = totalPagarPlazo - nuevoCapital;
            const ahorroTotalInteresesPlazo = (cuotaOriginal * totalMeses - capital) - totalInteresesPlazo;

            // Actualizar resultados de reducción de cuota
            document.getElementById('nueva_cuota').value = formatter.format(Math.round(nuevaCuota));
            document.getElementById('ahorro_mensual').value = formatter.format(Math.round(ahorroMensual));
            document.getElementById('ahorro_anual').value = formatter.format(Math.round(ahorroAnual));
            document.getElementById('ahorro_total_intereses_cuota').value = formatter.format(Math.round(ahorroTotalInteresesCuota));
            document.getElementById('intereses_despues_cuota').value = formatter.format(Math.round(totalInteresesCuota));
            document.getElementById('total_despues_cuota').value = formatter.format(Math.round(totalPagarCuota));

            // Actualizar resultados de reducción de plazo
            document.getElementById('cuotas_despues').value = numberFormatter.format(nuevoTotalMeses);
            document.getElementById('ahorro_letras').value = numberFormatter.format(ahorroMeses);
            document.getElementById('nuevo_plazo_anios').value = numberFormatter.format(nuevoPlazoAnios);
            document.getElementById('nuevo_plazo_meses').value = numberFormatter.format(nuevoPlazoMeses);
            document.getElementById('ahorro_tiempo_anios').value = numberFormatter.format(ahorroAniosPlazo);
            document.getElementById('ahorro_tiempo_meses').value = numberFormatter.format(ahorroMesesPlazo);
            document.getElementById('ahorro_total_intereses_plazo').value = formatter.format(Math.round(ahorroTotalInteresesPlazo));
            document.getElementById('intereses_despues_plazo').value = formatter.format(Math.round(totalInteresesPlazo));
            document.getElementById('total_despues_plazo').value = formatter.format(Math.round(totalPagarPlazo));
        }
    }
});
