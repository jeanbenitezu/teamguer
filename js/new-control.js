// new-control.js - Funcionalidad para el formulario de nuevo control
class NewControlForm {
    constructor() {
        this.selectedPatientId = null;
        this.init();
    }

    init() {
        this.loadPatients();
        this.bindEvents();
        this.setDefaultDate();
        this.checkUrlParameters();
    }

    // Verificar parámetros URL para preseleccionar paciente
    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get('patientId');
        
        if (patientId) {
            // Preseleccionar el paciente del parámetro URL
            setTimeout(() => {
                const patientSelect = document.getElementById('patientSelectControl');
                if (patientSelect) {
                    patientSelect.value = patientId;
                    this.selectPatient(patientId);
                }
            }, 100); // Pequeño delay para asegurar que los pacientes estén cargados
        }
    }

    bindEvents() {
        // Selección de paciente
        const patientSelectControl = document.getElementById('patientSelectControl');
        if (patientSelectControl) {
            patientSelectControl.addEventListener('change', (e) => {
                this.selectPatient(e.target.value);
            });
        }

        // Formulario principal
        const newControlForm = document.getElementById('newControlForm');
        if (newControlForm) {
            newControlForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveControl();
            });
        }

        // Campos de medición para cálculos automáticos
        ['weight', 'fatPercentage', 'musclePercentage', 'waterPercentage', 
         'waistCircumference', 'hipCircumference', 'systolicPressure', 'diastolicPressure'].forEach(field => {
            const fieldElement = document.getElementById(field);
            if (fieldElement) {
                fieldElement.addEventListener('input', () => {
                    this.updateCalculatedValues();
                    this.updateComparison();
                });
            }
        });

        // Botones de cancelar
        const cancelControl = document.getElementById('cancelControl');
        if (cancelControl) {
            cancelControl.addEventListener('click', () => {
                if (confirm('¿Estás seguro de cancelar? Se perderán los datos ingresados.')) {
                    this.redirectToDashboard();
                }
            });
        }

        // Modal de éxito
        const goToDashboard = document.getElementById('goToDashboard');
        if (goToDashboard) {
            goToDashboard.addEventListener('click', () => {
                this.redirectToDashboard();
            });
        }

        const addAnotherControl = document.getElementById('addAnotherControl');
        if (addAnotherControl) {
            addAnotherControl.addEventListener('click', () => {
                this.hideSuccessModal();
                this.resetForm();
            });
        }

        // Cerrar modal al hacer clic en el fondo
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.hideSuccessModal();
                    this.redirectToDashboard();
                }
            });
        }
    }

    loadPatients() {
        const patients = storage.getPatients();
        const select = document.getElementById('patientSelectControl');
        
        if (!select) return;

        select.innerHTML = '<option value="">Seleccionar Paciente</option>';

        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = patient.name;
            select.appendChild(option);
        });
    }

    selectPatient(patientId) {
        this.selectedPatientId = patientId;
        
        if (!patientId) {
            document.getElementById('selectedPatientName').textContent = 'Seleccionar Paciente';
            this.hideComparison();
            this.updateUrlParameter();
            return;
        }

        const patient = storage.getPatient(patientId);
        if (!patient) return;

        document.getElementById('selectedPatientName').textContent = patient.name;
        this.updateComparison();
        this.updateUrlParameter();
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('controlDate').value = today;
    }

    updateCalculatedValues() {
        if (!this.selectedPatientId) return;

        const patient = storage.getPatient(this.selectedPatientId);
        const weight = parseFloat(document.getElementById('weight').value) || 0;
        const fatPercentage = parseFloat(document.getElementById('fatPercentage').value) || 0;
        const musclePercentage = parseFloat(document.getElementById('musclePercentage').value) || 0;
        const waterPercentage = parseFloat(document.getElementById('waterPercentage').value) || 0;

        // Calcular IMC
        if (patient && patient.height && weight > 0) {
            const heightInMeters = patient.height / 100;
            const imc = weight / (heightInMeters * heightInMeters);
            document.getElementById('calculatedIMC').textContent = imc.toFixed(1);
        } else {
            document.getElementById('calculatedIMC').textContent = '-';
        }

        // Calcular pesos absolutos
        if (weight > 0) {
            if (fatPercentage > 0) {
                const fatWeight = (weight * fatPercentage / 100).toFixed(1);
                document.getElementById('calculatedFatWeight').textContent = `${fatWeight} kg`;
            }

            if (musclePercentage > 0) {
                const muscleWeight = (weight * musclePercentage / 100).toFixed(1);
                document.getElementById('calculatedMuscleWeight').textContent = `${muscleWeight} kg`;
            }

            if (waterPercentage > 0) {
                const waterWeight = (weight * waterPercentage / 100).toFixed(1);
                document.getElementById('calculatedWaterWeight').textContent = `${waterWeight} kg`;
            }
        } else {
            document.getElementById('calculatedFatWeight').textContent = '-';
            document.getElementById('calculatedMuscleWeight').textContent = '-';
            document.getElementById('calculatedWaterWeight').textContent = '-';
        }

        // Calcular ratio cintura/cadera
        const waist = parseFloat(document.getElementById('waistCircumference').value) || 0;
        const hip = parseFloat(document.getElementById('hipCircumference').value) || 0;
        
        if (waist > 0 && hip > 0) {
            const whr = (waist / hip).toFixed(2);
            document.getElementById('calculatedWHR').textContent = whr;
        } else {
            document.getElementById('calculatedWHR').textContent = '-';
        }

        // Mostrar presión arterial
        const systolic = parseInt(document.getElementById('systolicPressure').value) || 0;
        const diastolic = parseInt(document.getElementById('diastolicPressure').value) || 0;
        
        if (systolic > 0 && diastolic > 0) {
            document.getElementById('calculatedBloodPressure').textContent = `${systolic}/${diastolic}`;
        } else {
            document.getElementById('calculatedBloodPressure').textContent = '-';
        }
    }

    updateComparison() {
        if (!this.selectedPatientId) {
            this.hideComparison();
            return;
        }

        const currentDate = document.getElementById('controlDate').value;
        const previousControl = storage.getPreviousControlByPatient(this.selectedPatientId, currentDate);

        if (!previousControl) {
            this.hideComparison();
            return;
        }

        this.showComparison(previousControl);
    }

    hideComparison() {
        const comparisonSection = document.getElementById('comparisonSection');
        if (comparisonSection) {
            comparisonSection.style.display = 'none';
        }
    }

    showComparison(previousControl) {
        const comparisonSection = document.getElementById('comparisonSection');
        const comparisonGrid = document.getElementById('comparisonGrid');

        if (!comparisonSection || !comparisonGrid) return;

        comparisonSection.style.display = 'block';

        // Obtener valores actuales del formulario
        const currentValues = {
            weight: parseFloat(document.getElementById('weight').value) || 0,
            fatPercentage: parseFloat(document.getElementById('fatPercentage').value) || 0,
            musclePercentage: parseFloat(document.getElementById('musclePercentage').value) || 0,
            waterPercentage: parseFloat(document.getElementById('waterPercentage').value) || 0
        };

        // Calcular IMC actual si hay datos suficientes
        const patient = storage.getPatient(this.selectedPatientId);
        if (patient && patient.height && currentValues.weight > 0) {
            const heightInMeters = patient.height / 100;
            currentValues.imc = currentValues.weight / (heightInMeters * heightInMeters);
        }

        const metrics = [
            { key: 'weight', label: 'Peso', unit: 'kg', lowerIsBetter: false },
            { key: 'fatPercentage', label: '% Grasa', unit: '%', lowerIsBetter: true },
            { key: 'musclePercentage', label: '% Músculo', unit: '%', lowerIsBetter: false },
            { key: 'waterPercentage', label: '% Agua', unit: '%', lowerIsBetter: false }
        ];

        if (currentValues.imc && previousControl.imc) {
            metrics.push({ key: 'imc', label: 'IMC', unit: '', lowerIsBetter: true });
        }

        comparisonGrid.innerHTML = '';

        metrics.forEach(metric => {
            const current = currentValues[metric.key] || 0;
            const previous = previousControl[metric.key] || 0;

            if (current === 0 && previous === 0) return;

            const change = current - previous;
            const changeClass = this.getChangeClass(change, metric.lowerIsBetter);

            const comparisonItem = document.createElement('div');
            comparisonItem.className = 'comparison-item';
            comparisonItem.innerHTML = `
                <div class="metric">${metric.label}</div>
                <div class="values">
                    <span class="previous">${previous.toFixed(1)}${metric.unit}</span>
                    <span class="arrow">→</span>
                    <span class="current">${current.toFixed(1)}${metric.unit}</span>
                </div>
                <div class="change ${changeClass}">
                    ${change >= 0 ? '+' : ''}${change.toFixed(1)}${metric.unit}
                </div>
            `;

            comparisonGrid.appendChild(comparisonItem);
        });

        // Mostrar fecha del control anterior
        const previousDate = new Date(previousControl.date).toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        });

        const titleElement = document.querySelector('#comparisonSection h4');
        if (titleElement) {
            titleElement.textContent = `📊 Comparación con Control Anterior (${previousDate})`;
        }
    }

    getChangeClass(change, lowerIsBetter) {
        const absChange = Math.abs(change);
        
        if (absChange < 0.1) return 'neutral';
        
        const isPositiveChange = change > 0;
        const isGoodChange = lowerIsBetter ? !isPositiveChange : isPositiveChange;
        
        return isGoodChange ? 'positive' : 'negative';
    }

    validateForm() {
        const requiredFields = ['weight', 'fatPercentage', 'musclePercentage', 'waterPercentage'];
        const errors = [];

        // Validar que hay un paciente seleccionado
        if (!this.selectedPatientId) {
            errors.push('Debe seleccionar un paciente');
        }

        // Validar campos requeridos
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            const value = parseFloat(input.value);
            
            if (!value || value <= 0) {
                errors.push(`${input.previousElementSibling.textContent} es requerido`);
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        // Validar rangos
        const weight = parseFloat(document.getElementById('weight').value);
        const fat = parseFloat(document.getElementById('fatPercentage').value);
        const muscle = parseFloat(document.getElementById('musclePercentage').value);
        const water = parseFloat(document.getElementById('waterPercentage').value);

        if (weight && (weight < 20 || weight > 300)) {
            errors.push('El peso debe estar entre 20 y 300 kg');
        }

        if (fat && (fat < 3 || fat > 60)) {
            errors.push('El porcentaje de grasa debe estar entre 3% y 60%');
        }

        if (muscle && (muscle < 20 || muscle > 70)) {
            errors.push('El porcentaje de músculo debe estar entre 20% y 70%');
        }

        if (water && (water < 30 || water > 80)) {
            errors.push('El porcentaje de agua debe estar entre 30% y 80%');
        }

        // Validar que los porcentajes sumen aproximadamente 100% (con tolerancia)
        if (fat && muscle && water) {
            const total = fat + muscle + water;
            if (total < 85 || total > 115) {
                errors.push('La suma de los porcentajes parece incorrecta (debería estar cerca del 100%)');
            }
        }

        return errors;
    }

    saveControl() {
        // Validar formulario
        const errors = this.validateForm();
        if (errors.length > 0) {
            alert('Por favor, corrige los siguientes errores:\n\n' + errors.join('\n'));
            return;
        }

        // Preparar datos del control
        const controlData = {
            patientId: this.selectedPatientId,
            date: document.getElementById('controlDate').value,
            weight: parseFloat(document.getElementById('weight').value),
            fatPercentage: parseFloat(document.getElementById('fatPercentage').value),
            musclePercentage: parseFloat(document.getElementById('musclePercentage').value),
            waterPercentage: parseFloat(document.getElementById('waterPercentage').value),
            boneMass: parseFloat(document.getElementById('boneMass').value) || null,
            basalMetabolism: parseInt(document.getElementById('basalMetabolism').value) || null,
            metabolicAge: parseInt(document.getElementById('metabolicAge').value) || null,
            waistCircumference: parseFloat(document.getElementById('waistCircumference').value) || null,
            hipCircumference: parseFloat(document.getElementById('hipCircumference').value) || null,
            armCircumference: parseFloat(document.getElementById('armCircumference').value) || null,
            thighCircumference: parseFloat(document.getElementById('thighCircumference').value) || null,
            systolicPressure: parseInt(document.getElementById('systolicPressure').value) || null,
            diastolicPressure: parseInt(document.getElementById('diastolicPressure').value) || null,
            restingHeartRate: parseInt(document.getElementById('restingHeartRate').value) || null,
            visceralFat: parseInt(document.getElementById('visceralFat').value) || null,
            notes: document.getElementById('notes').value.trim()
        };

        try {
            // Guardar el control
            storage.saveControl(controlData);
            
            // Mostrar modal de éxito
            this.showSuccessModal();
            
        } catch (error) {
            console.error('Error al guardar control:', error);
            alert('Error al guardar el control. Por favor, inténtalo de nuevo.');
        }
    }

    showSuccessModal() {
        document.getElementById('successModal').style.display = 'block';
    }

    hideSuccessModal() {
        document.getElementById('successModal').style.display = 'none';
    }

    resetForm() {
        document.getElementById('newControlForm').reset();
        this.setDefaultDate();
        this.updateCalculatedValues();
        this.hideComparison();
        
        // Limpiar clases de error
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
    }

    // Actualizar parámetro URL
    updateUrlParameter() {
        const url = new URL(window.location);
        if (this.selectedPatientId) {
            url.searchParams.set('patientId', this.selectedPatientId);
        } else {
            url.searchParams.delete('patientId');
        }
        window.history.replaceState({}, '', url);
    }

    // Redirigir al dashboard manteniendo la selección del paciente
    redirectToDashboard() {
        if (this.selectedPatientId) {
            window.location.href = `index.html?patientId=${this.selectedPatientId}`;
        } else {
            window.location.href = 'index.html';
        }
    }
}

// Inicializar el formulario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.newControlForm = new NewControlForm();
});

// Función de utilidad para formatear números
window.formatValue = function(value, decimals = 1) {
    return parseFloat(value).toFixed(decimals);
};