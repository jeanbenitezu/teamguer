// new-control.js - Funcionalidad para el formulario de nuevo control
class NewControlForm {
    constructor() {
        this.selectedPatientId = null;
        this.editMode = false;
        this.editControlId = null;
        this.init();
    }

    init() {
        this.loadPatients();
        this.bindEvents();
        this.setDefaultDate();
        this.checkUrlParameters();
    }

    // Verificar parámetros URL para preseleccionar alumno o cargar control para editar
    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get('patientId');
        const editId = urlParams.get('editId');
        
        if (editId) {
            // Modo edición
            this.editMode = true;
            this.editControlId = editId;
            this.loadControlForEdit(editId);
        } else if (patientId) {
            // Preseleccionar el alumno del parámetro URL
            setTimeout(() => {
                const patientSelect = document.getElementById('patientSelectControl');
                if (patientSelect) {
                    patientSelect.value = patientId;
                    this.selectPatient(patientId);
                }
            }, 100); // Pequeño delay para asegurar que los alumnos estén cargados
        }
    }

    loadControlForEdit(controlId) {
        const control = storage.getControl(controlId);
        if (!control) {
            alert('Control no encontrado');
            this.redirectToDashboard();
            return;
        }

        // Actualizar UI para modo edición
        this.updateUIForEditMode();

        // Preseleccionar el alumno
        setTimeout(() => {
            const patientSelect = document.getElementById('patientSelectControl');
            if (patientSelect) {
                patientSelect.value = control.patientId;
                this.selectPatient(control.patientId);
                
                // Cargar datos del control después de que se haya seleccionado el paciente
                setTimeout(() => {
                    this.loadControlData(control);
                }, 100);
            }
        }, 100);
    }

    updateUIForEditMode() {
        // Cambiar título del header
        const headerTitle = document.querySelector('.brand h1');
        if (headerTitle) {
            headerTitle.textContent = 'Editar Control';
        }

        // Cambiar título del formulario
        const formTitle = document.querySelector('.form-header h3');
        if (formTitle) {
            formTitle.textContent = '✏️ Editar Datos del Control';
        }

        // Cambiar texto del botón de submit
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '✏️ Actualizar Control';
        }

        // Cambiar título de la página
        document.title = 'Editar Control - Estadistica TEAMGUER';
        
        // Cambiar título del modal de éxito
        const modalTitle = document.querySelector('#successModal .modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = '✅ Control Actualizado';
        }
        
        // Deshabilitar el selector de paciente ya que no se puede cambiar en edición
        const patientSelect = document.getElementById('patientSelectControl');
        if (patientSelect) {
            patientSelect.disabled = true;
            patientSelect.style.backgroundColor = '#f5f5f5';
            patientSelect.style.cursor = 'not-allowed';
        }
    }

    loadControlData(control) {
        // Cargar datos en el formulario
        const fields = [
            'date', 'weight', 'fatPercentage', 'musclePercentage', 
            'waterPercentage', 'strongCapacity', 'basalMetabolism',
            'waistCircumference', 'armCircumference', 'thighCircumference', 
            'visceralFat', 'notes'
        ];

        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && control[field] !== undefined) {
                if (field === 'date') {
                    element.value = control.date;
                } else {
                    element.value = control[field];
                }
            }
        });

        // Actualizar cálculos y comparaciones
        this.updateCalculatedValues();
        this.updateComparison();
    }

    bindEvents() {
        // Selección de alumno
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
         'waistCircumference'].forEach(field => {
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

        select.innerHTML = '<option value="">Seleccionar Alumno</option>';

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
            document.getElementById('selectedPatientName').textContent = 'Seleccionar Alumno';
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
        document.getElementById('date').value = today;
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
    }

    updateComparison() {
        if (!this.selectedPatientId) {
            this.hideComparison();
            return;
        }

        const currentDate = document.getElementById('date').value;
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

        // Validar que hay un alumno seleccionado
        if (!this.selectedPatientId) {
            errors.push('Debe seleccionar un alumno');
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
                errors.push('La suma de los porcentajes de grasa, músculo y agua parece incorrecta (debería estar cerca del 100%)');
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
            date: document.getElementById('date').value,
            weight: parseFloat(document.getElementById('weight').value),
            fatPercentage: parseFloat(document.getElementById('fatPercentage').value),
            musclePercentage: parseFloat(document.getElementById('musclePercentage').value),
            waterPercentage: parseFloat(document.getElementById('waterPercentage').value),
            strongCapacity: parseFloat(document.getElementById('strongCapacity').value) || null,
            basalMetabolism: parseInt(document.getElementById('basalMetabolism').value) || null,
            waistCircumference: parseFloat(document.getElementById('waistCircumference').value) || null,
            armCircumference: parseFloat(document.getElementById('armCircumference').value) || null,
            thighCircumference: parseFloat(document.getElementById('thighCircumference').value) || null,
            visceralFat: parseInt(document.getElementById('visceralFat').value) || null,
            notes: document.getElementById('notes').value.trim()
        };

        // Calcular el IMC y agregarlo explícitamente
        const patient = storage.getPatient(this.selectedPatientId);
        if (patient && patient.height && controlData.weight > 0) {
            const heightInMeters = patient.height / 100;
            controlData.imc = parseFloat((controlData.weight / (heightInMeters * heightInMeters)).toFixed(1));
        }

        try {
            if (this.editMode && this.editControlId) {
                // Modo edición: actualizar control existente
                storage.updateControl(this.editControlId, controlData);
                
                // Mostrar modal de éxito con mensaje personalizado
                this.showSuccessModal('Control actualizado exitosamente');
            } else {
                // Modo creación: guardar nuevo control
                storage.saveControl(controlData);
                
                // Mostrar modal de éxito
                this.showSuccessModal('Control guardado exitosamente');
            }
            
        } catch (error) {
            console.error('Error al guardar control:', error);
            const action = this.editMode ? 'actualizar' : 'guardar';
            alert(`Error al ${action} el control. Por favor, inténtalo de nuevo.`);
        }
    }

    showSuccessModal(customMessage = null) {
        const modal = document.getElementById('successModal');
        const message = document.querySelector('#successModal .modal-body p');
        
        if (customMessage && message) {
            message.textContent = customMessage;
        }
        
        if (modal) {
            modal.style.display = 'block';
        }
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

    // Redirigir al dashboard manteniendo la selección del alumno
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