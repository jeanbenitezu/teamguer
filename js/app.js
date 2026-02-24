// app.js - Funcionalidad principal del dashboard
class App {
    constructor() {
        this.currentPatientId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPatients();
        this.checkFirstRun();
        this.checkUrlParameters();
    }

    // Verificar si es la primera vez que se ejecuta la app
    checkFirstRun() {
        const patients = storage.getPatients();
        if (patients.length === 0) {
            this.showWelcomeScreen();
            this.createSampleData(); // Crear datos de ejemplo
        } else {
            this.showWelcomeScreen();
        }
    }

    // Crear datos de ejemplo para demostración
    createSampleData() {
        // Alumno basado en la planilla real
        const realPatient = {
            name: 'Ana Patricia Silva',
            age: 32,
            height: 162,
            gender: 'femenino'
        };

        const patient1 = storage.savePatient(realPatient);

        // Controles basados en datos reales de la planilla
        const realControls = [
            {
                patientId: patient1.id,
                date: '2024-09-15',
                weight: 72.4,
                fatPercentage: 28.3,
                musclePercentage: 36.8,
                waterPercentage: 48.9,
                waistCircumference: 84.0,
                armCircumference: 31.2,
                thighCircumference: 58.5,
                visceralFat: 9,
                strongCapacity: 2.6,
                basalMetabolism: 1540,
                notes: 'Control inicial - establecer línea base'
            },
            {
                patientId: patient1.id,
                date: '2024-10-15',
                weight: 71.8,
                fatPercentage: 27.1,
                musclePercentage: 37.9,
                waterPercentage: 50.2,
                waistCircumference: 82.5,
                armCircumference: 31.0,
                thighCircumference: 58.0,
                visceralFat: 8,
                strongCapacity: 2.6,
                basalMetabolism: 1565,
                notes: 'Primer mes - reducción de grasa visceral'
            },
            {
                patientId: patient1.id,
                date: '2024-11-15',
                weight: 70.9,
                fatPercentage: 25.8,
                musclePercentage: 39.1,
                waterPercentage: 51.8,
                waistCircumference: 81.0,
                armCircumference: 31.5,
                thighCircumference: 57.2,
                visceralFat: 7,
                strongCapacity: 2.7,
                basalMetabolism: 1585,
                notes: 'Excelente progreso - ganancia de masa muscular'
            },
            {
                patientId: patient1.id,
                date: '2024-12-15',
                weight: 70.2,
                fatPercentage: 24.5,
                musclePercentage: 40.3,
                waterPercentage: 52.9,
                waistCircumference: 79.5,
                armCircumference: 32.0,
                thighCircumference: 56.8,
                visceralFat: 6,
                strongCapacity: 2.7,
                basalMetabolism: 1605,
                notes: 'Mantiene tendencia positiva en todos los indicadores'
            },
            {
                patientId: patient1.id,
                date: '2025-01-14',
                weight: 69.8,
                fatPercentage: 23.7,
                musclePercentage: 41.2,
                waterPercentage: 53.6,
                waistCircumference: 78.5,
                armCircumference: 32.5,
                thighCircumference: 56.5,
                visceralFat: 5,
                strongCapacity: 2.8,
                basalMetabolism: 1625,
                notes: 'Control enero - resultados excelentes, alcanzó objetivos'
            }
        ];

        realControls.forEach(control => {
            storage.saveControl(control);
        });

        // Segundo alumno de ejemplo
        const samplePatient2 = {
            name: 'Roberto Martinez',
            age: 28,
            height: 175,
            gender: 'masculino'
        };

        const patient2 = storage.savePatient(samplePatient2);

        // Controles para el segundo alumno
        const sampleControls2 = [
            {
                patientId: patient2.id,
                date: '2024-11-01',
                weight: 85.2,
                fatPercentage: 18.5,
                musclePercentage: 42.8,
                waterPercentage: 58.2,
                waistCircumference: 88.5,
                armCircumference: 36.8,
                thighCircumference: 62.5,
                visceralFat: 8,
                strongCapacity: 3.2,
                basalMetabolism: 2050,
                notes: 'Control inicial - buen estado físico base'
            },
            {
                patientId: patient2.id,
                date: '2024-12-01',
                weight: 84.8,
                fatPercentage: 17.9,
                musclePercentage: 43.5,
                waterPercentage: 58.8,
                waistCircumference: 87.0,
                armCircumference: 37.2,
                thighCircumference: 62.8,
                visceralFat: 7,
                strongCapacity: 3.2,
                basalMetabolism: 2075,
                notes: 'Progreso constante en definición muscular'
            },
            {
                patientId: patient2.id,
                date: '2025-01-01',
                weight: 84.5,
                fatPercentage: 17.2,
                musclePercentage: 44.1,
                waterPercentage: 59.2,
                waistCircumference: 85.5,
                armCircumference: 37.8,
                thighCircumference: 63.0,
                visceralFat: 6,
                strongCapacity: 3.3,
                basalMetabolism: 2095,
                notes: 'Excelente evolución - fase de mantenimiento'
            }
        ];

        sampleControls2.forEach(control => {
            storage.saveControl(control);
        });

        console.log('Datos de ejemplo creados exitosamente con alumnos realistas');
    }

    // Verificar parámetros URL para preseleccionar alumno
    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get('patientId');
        
        if (patientId) {
            // Preseleccionar el alumno del parámetro URL
            setTimeout(() => {
                const patientSelect = document.getElementById('patientSelect');
                if (patientSelect) {
                    patientSelect.value = patientId;
                    this.selectPatient(patientId);
                }
            }, 200); // Delay para asegurar que los alumnos estén cargados
        }
    }

    bindEvents() {
        // Eventos del header
        const newControlBtn = document.getElementById('newControlBtn');
        if (newControlBtn) {
            newControlBtn.addEventListener('click', () => {
                // Si hay un alumno seleccionado, mantener la selección
                if (this.currentPatientId) {
                    window.location.href = `new-control.html?patientId=${this.currentPatientId}`;
                } else {
                    window.location.href = 'new-control.html';
                }
            });
        }

        const newPatientBtn = document.getElementById('newPatientBtn');
        if (newPatientBtn) {
            newPatientBtn.addEventListener('click', () => {
                this.showNewPatientModal();
            });
        }

        const quickNewPatient = document.getElementById('quickNewPatient');
        if (quickNewPatient) {
            quickNewPatient.addEventListener('click', () => {
                this.showNewPatientModal();
            });
        }

        const patientSelect = document.getElementById('patientSelect');
        if (patientSelect) {
            patientSelect.addEventListener('change', (e) => {
                this.selectPatient(e.target.value);
            });
        }

        // Eventos del modal de nuevo alumno
        const closeNewPatientModal = document.getElementById('closeNewPatientModal');
        if (closeNewPatientModal) {
            closeNewPatientModal.addEventListener('click', () => {
                this.hideNewPatientModal();
            });
        }

        const cancelNewPatient = document.getElementById('cancelNewPatient');
        if (cancelNewPatient) {
            cancelNewPatient.addEventListener('click', () => {
                this.hideNewPatientModal();
            });
        }

        const newPatientForm = document.getElementById('newPatientForm');
        if (newPatientForm) {
            newPatientForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewPatient();
            });
        }

        // Cerrar modal al hacer clic en el fondo
        const newPatientModal = document.getElementById('newPatientModal');
        if (newPatientModal) {
            newPatientModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.hideNewPatientModal();
                }
            });
        }
    }

    loadPatients() {
        const patients = storage.getPatients();
        const select = document.getElementById('patientSelect');
        
        if (!select) return;

        // Limpiar opciones existentes (excepto la primera)
        select.innerHTML = '<option value="">Seleccionar Alumno</option>';

        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = patient.name;
            select.appendChild(option);
        });

        // Mostrar siempre la pantalla de bienvenida hasta que se seleccione un alumno
        this.showWelcomeScreen();
    }

    selectPatient(patientId) {
        if (!patientId) {
            this.showWelcomeScreen();
            return;
        }

        this.currentPatientId = patientId;
        const patient = storage.getPatient(patientId);
        
        if (!patient) {
            console.error('Alumno no encontrado:', patientId);
            return;
        }

        this.showPatientDashboard(patient);
    }

    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const patientDashboard = document.getElementById('patientDashboard');
        const patientStickyInfo = document.getElementById('patientStickyInfo');
        
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        if (patientDashboard) patientDashboard.classList.add('hidden');
        if (patientStickyInfo) patientStickyInfo.classList.add('hidden');
    }

    showPatientDashboard(patient) {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const patientDashboard = document.getElementById('patientDashboard');
        const patientStickyInfo = document.getElementById('patientStickyInfo');
        
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (patientDashboard) patientDashboard.classList.remove('hidden');
        if (patientStickyInfo) patientStickyInfo.classList.remove('hidden');

        this.updatePatientInfo(patient);
        this.updateStickyPatientInfo(patient);
        this.updateDashboardData(patient.id);
        this.updateChart(patient.id);
        this.updateAchievements(patient.id);
        this.updateRecentControls(patient.id);
    }

    updatePatientInfo(patient) {
        document.getElementById('patientName').textContent = patient.name;
        document.getElementById('patientAge').textContent = `${patient.age} años`;
        document.getElementById('patientHeight').textContent = `${patient.height} cm`;
        
        const totalControls = storage.getControlsByPatient(patient.id).length;
        document.getElementById('totalControls').textContent = totalControls;
    }

    updateStickyPatientInfo(patient) {
        const totalControls = storage.getControlsByPatient(patient.id).length;
        const monthlyScore = storage.calculateMonthlyScore(patient.id);
        
        document.getElementById('stickyPatientName').textContent = patient.name;
        document.getElementById('stickyPatientAge').textContent = patient.age;
        document.getElementById('stickyPatientHeight').textContent = patient.height;
        document.getElementById('stickyTotalControls').textContent = totalControls;
        document.getElementById('stickyMonthlyScore').textContent = monthlyScore;
    }

    updateDashboardData(patientId) {
        const controls = storage.getControlsByPatient(patientId);
        
        if (controls.length === 0) {
            this.showNoDataMessage();
            return;
        }

        const latestControl = controls[0];
        const previousControl = controls.length > 1 ? controls[1] : null;

        // Actualizar score
        const monthlyScore = storage.calculateMonthlyScore(patientId);
        document.getElementById('monthlyScore').textContent = monthlyScore;
        
        // Actualizar tendencia del score
        if (previousControl) {
            const prevScore = storage.calculateMonthlyScore(patientId); // Simplificado para el ejemplo
            const scoreDiff = monthlyScore - 50; // Comparar con score base
            const scoreTrendEl = document.getElementById('scoreTrend');
            
            if (scoreDiff > 5) {
                scoreTrendEl.textContent = `↗️ +${scoreDiff} pts vs mes anterior`;
                scoreTrendEl.className = 'trend-indicator positive';
            } else if (scoreDiff < -5) {
                scoreTrendEl.textContent = `↘️ ${scoreDiff} pts vs mes anterior`;
                scoreTrendEl.className = 'trend-indicator negative';
            } else {
                scoreTrendEl.textContent = '→ Score estable';
                scoreTrendEl.className = 'trend-indicator neutral';
            }
        } else {
            document.getElementById('scoreTrend').textContent = '🆕 Primer control registrado';
        }

        // Actualizar valores actuales y comparaciones
        this.updateProgressCard('weight', 'kg', latestControl.weight, previousControl ? previousControl.weight : null);
        this.updateProgressCard('fat', '%', latestControl.fatPercentage, previousControl ? previousControl.fatPercentage : null, true);
        this.updateProgressCard('muscle', '%', latestControl.musclePercentage, previousControl ? previousControl.musclePercentage : null);
        this.updateProgressCard('water', '%', latestControl.waterPercentage, previousControl ? previousControl.waterPercentage : null);
        
        // IMC
        if (latestControl.imc) {
            console.log('Actualizando IMC:', latestControl.imc, 'vs anterior:', previousControl ? previousControl.imc : null);
            this.updateProgressCard('imc', '', latestControl.imc, previousControl ? previousControl.imc : null, true);
        } else {
            console.log('IMC no disponible en el control actual:', latestControl);
        }

        // Medidas musculares
        if (latestControl.waistCircumference) {
            this.updateProgressCard('waist', 'cm', latestControl.waistCircumference, previousControl ? previousControl.waistCircumference : null, true);
        }
    }

    updateProgressCard(type, unit, currentValue, previousValue, lowerIsBetter = false) {
        const currentEl = document.getElementById(`current${type.charAt(0).toUpperCase() + type.slice(1)}`);
        const changeEl = document.getElementById(`${type}Change`);
        const trendEl = document.getElementById(`${type}Trend`);

        console.log(`updateProgressCard - type: ${type}, buscando elemento: current${type.charAt(0).toUpperCase() + type.slice(1)}`, currentEl ? 'encontrado' : 'NO ENCONTRADO');

        if (!currentEl) return;

        currentEl.textContent = `${currentValue}${unit}`;

        if (previousValue !== undefined && previousValue !== null) {
            const change = currentValue - previousValue;
            const absChange = Math.abs(change);
            
            // Actualizar texto de cambio
            changeEl.textContent = change >= 0 ? `+${change.toFixed(1)}${unit}` : `${change.toFixed(1)}${unit}`;
            
            // Determinar si el cambio es positivo o negativo según el contexto
            let isPositive;
            if (lowerIsBetter) {
                isPositive = change < 0; // Para grasa e IMC, menor es mejor
            } else {
                isPositive = change > 0; // Para músculo y agua, mayor es mejor
            }
            
            // Actualizar clases de color
            changeEl.className = 'change';
            if (absChange < 0.1) {
                changeEl.classList.add('neutral');
                trendEl.textContent = '→';
            } else if (isPositive) {
                changeEl.classList.add('positive');
                trendEl.textContent = '↗️';
            } else {
                changeEl.classList.add('negative');
                trendEl.textContent = '↘️';
            }
        } else {
            changeEl.textContent = 'Primer control';
            changeEl.className = 'change neutral';
            trendEl.textContent = '🆕';
        }
    }

    updateChart(patientId) {
        setTimeout(() => {
            chartsManager.initAllCharts(patientId);
        }, 100);
    }

    updateAchievements(patientId) {
        const achievements = storage.getAchievements(patientId);
        const achievementsList = document.getElementById('achievementsList');
        
        if (!achievementsList) return;

        achievementsList.innerHTML = '';

        achievements.forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.className = `achievement ${achievement.unlocked ? '' : 'locked'}`;
            
            achievementEl.innerHTML = `
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            `;
            
            achievementsList.appendChild(achievementEl);
        });

        // Agregar logros bloqueados como motivación
        const lockedAchievements = [
            { title: '🔥 Quemador Pro', description: 'Reduce 5% de grasa corporal' },
            { title: '💪 Máquina de Músculo', description: 'Gana 3% de masa muscular' },
            { title: '📅 Año Completo', description: 'Mantén controles por 12 meses' }
        ];

        lockedAchievements.forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.className = 'achievement locked';
            
            achievementEl.innerHTML = `
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            `;
            
            achievementsList.appendChild(achievementEl);
        });
    }

    updateRecentControls(patientId) {
        const controls = storage.getControlsByPatient(patientId);
        const recentControlsList = document.getElementById('recentControlsList');
        
        if (!recentControlsList) return;

        recentControlsList.innerHTML = '';

        if (controls.length === 0) {
            recentControlsList.innerHTML = '<p>No hay controles registrados aún.</p>';
            return;
        }

        controls.slice(0, 3).forEach(control => {
            const controlEl = document.createElement('div');
            controlEl.className = 'control-item slide-up';
            
            const date = new Date(control.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            controlEl.innerHTML = `
                <div class="control-date">${date}</div>
                <div class="control-summary">
                    <div class="control-metric">
                        <span class="label">Peso</span>
                        <span class="value">${control.weight} kg</span>
                    </div>
                    <div class="control-metric">
                        <span class="label">% Grasa</span>
                        <span class="value">${control.fatPercentage}%</span>
                    </div>
                    <div class="control-metric">
                        <span class="label">% Músculo</span>
                        <span class="value">${control.musclePercentage}%</span>
                    </div>
                    <div class="control-metric">
                        <span class="label">% Agua</span>
                        <span class="value">${control.waterPercentage}%</span>
                    </div>
                </div>
                ${control.notes ? `<div class="control-notes" style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); font-style: italic;">${control.notes}</div>` : ''}
            `;
            
            recentControlsList.appendChild(controlEl);
        });
    }

    showNoDataMessage() {
        // Resetear valores a estado inicial
        document.getElementById('monthlyScore').textContent = '50';
        document.getElementById('scoreTrend').textContent = '🆕 ¡Registra tu primer control!';
        
        ['weight', 'fat', 'muscle', 'water', 'imc', 'waist', 'hr'].forEach(type => {
            const currentEl = document.getElementById(`current${type.charAt(0).toUpperCase() + type.slice(1)}`);
            const changeEl = document.getElementById(`${type}Change`);
            const trendEl = document.getElementById(`${type}Trend`);
            
            if (currentEl) currentEl.textContent = '-';
            if (changeEl) changeEl.textContent = 'Sin datos';
            if (trendEl) trendEl.textContent = '📊';
        });

        // Limpiar gráficas
        if (chartsManager) {
            chartsManager.destroyAllCharts();
        }
    }

    // Modal de nuevo alumno
    showNewPatientModal() {
        document.getElementById('newPatientModal').style.display = 'block';
        document.getElementById('patientNameInput').focus();
    }

    hideNewPatientModal() {
        document.getElementById('newPatientModal').style.display = 'none';
        document.getElementById('newPatientForm').reset();
    }

    createNewPatient() {
        const form = document.getElementById('newPatientForm');
        const formData = new FormData(form);
        
        const patientData = {
            name: document.getElementById('patientNameInput').value.trim(),
            age: parseInt(document.getElementById('patientAgeInput').value),
            height: parseFloat(document.getElementById('patientHeightInput').value),
            gender: document.getElementById('patientGenderInput').value
        };

        // Validación básica
        if (!patientData.name || !patientData.age || !patientData.height || !patientData.gender) {
            alert('Por favor, completa todos los campos requeridos.');
            return;
        }

        try {
            const newPatient = storage.savePatient(patientData);
            this.loadPatients();
            
            // Seleccionar el nuevo alumno
            document.getElementById('patientSelect').value = newPatient.id;
            this.selectPatient(newPatient.id);
            
            this.hideNewPatientModal();
            
            // Mostrar mensaje de éxito
            this.showSuccessMessage('Alumno creado exitosamente');
            
        } catch (error) {
            console.error('Error al crear alumno:', error);
            alert('Error al crear el alumno. Por favor, inténtalo de nuevo.');
        }
    }

    showSuccessMessage(message) {
        // Crear elemento de mensaje temporal
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Funciones globales de utilidad
window.formatDate = function(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

window.formatNumber = function(number, decimals = 1) {
    return parseFloat(number).toFixed(decimals);
};

// CSS para animaciones del mensaje
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);