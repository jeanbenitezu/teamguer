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
        const leaderboardBtn = document.getElementById('leaderboardBtn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                this.showLeaderboard();
            });
        }

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

        // Eventos del leaderboard
        const closeLeaderboard = document.getElementById('closeLeaderboard');
        if (closeLeaderboard) {
            closeLeaderboard.addEventListener('click', () => {
                this.hideLeaderboard();
            });
        }

        const leaderboardSection = document.getElementById('leaderboardSection');
        if (leaderboardSection) {
            leaderboardSection.addEventListener('click', (e) => {
                if (e.target.classList.contains('leaderboard-section')) {
                    this.hideLeaderboard();
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
        
        // Limpiar información del ranking cuando no hay alumno seleccionado
        this.clearRankingInfo();
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
        
        // Actualizar información de ranking
        this.updateRankingInfo(patientId, monthlyScore);
        
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

        controls.forEach(control => {
            const controlEl = document.createElement('div');
            controlEl.className = 'control-item slide-up';
            
            const date = new Date(control.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            controlEl.innerHTML = `
                <div class="control-header">
                    <div class="control-date">${date}</div>
                    <div class="control-actions">
                        <button onclick="app.downloadControl('${control.id}')" class="btn btn-sm btn-download" title="Descargar Control">📥</button>
                        <button onclick="app.editControl('${control.id}')" class="btn btn-sm btn-edit" title="Editar Control">✏️</button>
                        <button onclick="app.deleteControl('${control.id}', '${patientId}')" class="btn btn-sm btn-delete" title="Eliminar Control">🗑️</button>
                    </div>
                </div>
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
        
        // Limpiar información del ranking cuando no hay controles
        this.clearRankingInfo();
        
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

    // === LEADERBOARD ===
    showLeaderboard() {
        const leaderboardSection = document.getElementById('leaderboardSection');
        const header = document.querySelector('.header');
        const patientStickyInfo = document.getElementById('patientStickyInfo');
        
        if (leaderboardSection) {
            this.loadLeaderboardData();
            leaderboardSection.classList.remove('hidden');
            
            // Hide header when leaderboard is displayed
            if (header) {
                header.style.display = 'none';
            }

            if (patientStickyInfo) {
                patientStickyInfo.style.display = 'none';
            }
            
            // Agregar efecto de "fanfarria" visual al abrir
            this.triggerCelebrationEffect();
        }
    }

    triggerCelebrationEffect() {
        // Crear elementos de celebración con logo TEAMGUER
        const celebrationElements = [];
        
        for (let i = 0; i < 15; i++) {
            const celebration = document.createElement('img');
            celebration.src = 'assets/logo.png';
            celebration.alt = 'TEAMGUER';
            celebration.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}vw;
                top: ${Math.random() * 100}vh;
                width: ${Math.random() * 30 + 40}px;
                height: ${Math.random() * 30 + 40}px;
                object-fit: contain;
                pointer-events: none;
                z-index: 1001;
                animation: celebrationFall ${2 + Math.random() * 2}s ease-out forwards;
                opacity: 0;
                filter: drop-shadow(0 0 10px rgba(229, 62, 62, 0.6));
            `;
            
            document.body.appendChild(celebration);
            celebrationElements.push(celebration);
            
            // Animar entrada
            setTimeout(() => {
                celebration.style.opacity = '1';
            }, i * 80);
        }
        
        // Limpiar elementos después de la animación
        setTimeout(() => {
            celebrationElements.forEach(el => {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
        }, 5000);
    }

    hideLeaderboard() {
        const leaderboardSection = document.getElementById('leaderboardSection');
        const header = document.querySelector('.header');
        const patientStickyInfo = document.getElementById('patientStickyInfo');
        if (leaderboardSection) {
            leaderboardSection.classList.add('hidden');
            
            // Show header again when leaderboard is hidden
            if (header) {
                header.style.display = '';
            }

            if (patientStickyInfo) {
                patientStickyInfo.style.display = '';
            }
        }
    }

    loadLeaderboardData() {
        const patients = storage.getPatients();
        const leaderboardList = document.getElementById('leaderboardList');
        
        if (!leaderboardList) return;

        // Si no hay pacientes, mostrar mensaje vacío
        if (patients.length === 0) {
            leaderboardList.innerHTML = `
                <div class="leaderboard-empty">
                    <h3>📊 Sin datos disponibles</h3>
                    <p>Aún no hay alumnos registrados para mostrar en el ranking.</p>
                    <p>¡Comienza creando tu primer alumno!</p>
                </div>
            `;
            return;
        }

        // Calcular puntajes para todos los pacientes
        const patientsWithScores = patients.map(patient => {
            const controls = storage.getControlsByPatient(patient.id);
            const totalControls = controls.length;
            const monthlyScore = storage.calculateMonthlyScore(patient.id);
            
            return {
                ...patient,
                monthlyScore,
                totalControls,
                lastControl: totalControls > 0 ? controls[0] : null
            };
        });

        // Filtrar solo pacientes con al menos un control y ordenar por puntaje
        const rankedPatients = patientsWithScores
            .filter(patient => patient.totalControls > 0)
            .sort((a, b) => b.monthlyScore - a.monthlyScore)
            .slice(0, 5); // Top 5

        if (rankedPatients.length === 0) {
            leaderboardList.innerHTML = `
                <div class="leaderboard-empty">
                    <h3>📈 Esperando controles</h3>
                    <p>Los alumnos necesitan al menos un control para aparecer en el ranking.</p>
                    <p>¡Agrega controles para ver el leaderboard!</p>
                </div>
            `;
            return;
        }

        // Generar HTML del leaderboard
        const leaderboardHTML = rankedPatients.map((patient, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            const lastControlDate = patient.lastControl 
                ? new Date(patient.lastControl.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                })
                : 'N/A';

            const trendIcon = this.getScoreTrendIcon(patient.monthlyScore);
            
            return `
                <div class="leaderboard-item ${rankClass}">
                    <div class="leaderboard-rank rank-${rank}">${rank}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${patient.name}</div>
                        <div class="leaderboard-details">
                            <span>📅 ${lastControlDate}</span>
                            <span>📊 ${patient.totalControls} controles</span>
                            <span>👤 ${patient.age} años</span>
                        </div>
                    </div>
                    <div class="leaderboard-score">
                        <div class="leaderboard-score-number">${patient.monthlyScore}</div>
                        <div class="leaderboard-score-label">pts ${trendIcon}</div>
                    </div>
                </div>
            `;
        }).join('');

        leaderboardList.innerHTML = leaderboardHTML;

        // Solo aplicar el título sin animaciones
        setTimeout(() => {
            this.enhanceLeaderboardForTV();
        }, 100);
    }

    getScoreTrendIcon(score) {
        if (score >= 90) return '🔥💪';
        if (score >= 80) return '🔥⭐';
        if (score >= 70) return '📈✨';
        if (score >= 60) return '🎯💫';
        if (score >= 50) return '💪⚡';
        return '🌟💪';
    }



    enhanceLeaderboardForTV() {
        // Solo mantener el título sin animaciones
        const headerTitle = document.querySelector('.leaderboard-header h2');
        if (headerTitle) {
            headerTitle.innerHTML = '<span class="title-glow">🏆 Top 5 Alumnos del Mes 🏆</span>';
        }
    }

    // === RANKING FUNCTIONS ===
    getPatientRanking(patientId) {
        const patients = storage.getPatients();
        
        // Calcular puntajes para todos los pacientes con al menos un control
        const patientsWithScores = patients.map(patient => {
            const controls = storage.getControlsByPatient(patient.id);
            if (controls.length === 0) return null;
            
            return {
                id: patient.id,
                name: patient.name,
                monthlyScore: storage.calculateMonthlyScore(patient.id),
                totalControls: controls.length
            };
        }).filter(patient => patient !== null);

        // Ordenar por puntaje descendente
        const rankedPatients = patientsWithScores.sort((a, b) => b.monthlyScore - a.monthlyScore);

        // Encontrar la posición del paciente actual
        const patientIndex = rankedPatients.findIndex(p => p.id === patientId);
        
        if (patientIndex === -1) {
            return null;
        }

        return {
            rank: patientIndex + 1,
            total: rankedPatients.length,
            isInTop5: patientIndex < 5
        };
    }

    updateRankingInfo(patientId, monthlyScore) {
        const rankingInfo = document.getElementById('rankingInfo');
        const rankingText = document.getElementById('rankingText');
        
        if (!rankingInfo || !rankingText) return;

        const ranking = this.getPatientRanking(patientId);
        
        if (!ranking || ranking.total < 2) {
            // Ocultar si no hay suficientes datos para ranking
            rankingInfo.classList.add('hidden');
            return;
        }

        rankingInfo.classList.remove('hidden');
        
        if (ranking.isInTop5) {
            // Está en el top 5
            const rankEmojis = ['', '🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
            const rankEmoji = rankEmojis[ranking.rank] || `${ranking.rank}⃣`;
            
            rankingText.innerHTML = `
                <span class="rank-badge rank-${ranking.rank}">
                    ${rankEmoji} TOP ${ranking.rank}
                </span>
                <span class="rank-total">de ${ranking.total} alumnos</span>
            `;
            
            rankingInfo.className = `ranking-info top-rank rank-${ranking.rank}`;
        } else {
            // No está en el top 5
            rankingText.innerHTML = `
                <span class="rank-badge rank-other">
                    #${ranking.rank}
                </span>
                <span class="rank-total">de ${ranking.total} alumnos</span>
            `;
            
            rankingInfo.className = 'ranking-info';
        }
    }

    clearRankingInfo() {
        const rankingInfo = document.getElementById('rankingInfo');
        if (rankingInfo) {
            rankingInfo.classList.add('hidden');
            rankingInfo.className = 'ranking-info hidden';
        }
    }

    // === CONTROL MANAGEMENT ===
    editControl(controlId) {
        // Redirigir a new-control.html con parámetro editId
        window.location.href = `new-control.html?editId=${controlId}`;
    }

    deleteControl(controlId, patientId) {
        if (confirm('¿Estás seguro de que quieres eliminar este control? Esta acción no se puede deshacer.')) {
            try {
                storage.deleteControl(controlId);
                
                // Mostrar mensaje de éxito
                this.showSuccessMessage('Control eliminado exitosamente');
                
                // Actualizar la vista
                this.updateDashboardData(patientId);
                this.updateChart(patientId);
                this.updateRecentControls(patientId);
                
            } catch (error) {
                alert('Error al eliminar el control: ' + error.message);
            }
        }
    }

    deletePatient(patientId) {
        const patient = storage.getPatient(patientId);
        const confirmMessage = `¿Estás seguro de que quieres eliminar a ${patient.name}? Se ocultarán todos sus datos y controles.`;
        
        if (confirm(confirmMessage)) {
            try {
                storage.deletePatient(patientId);
                
                // Mostrar mensaje de éxito
                this.showSuccessMessage('Alumno eliminado exitosamente');
                
                // Recargar lista de alumnos y mostrar welcome screen
                this.loadPatients();
                this.showWelcomeScreen();
                
            } catch (error) {
                alert('Error al eliminar el alumno: ' + error.message);
            }
        }
    }

    // === DOWNLOAD FUNCTIONS ===
    downloadControl(controlId) {
        const control = storage.getControl(controlId);
        if (!control) {
            alert('Control no encontrado');
            return;
        }

        const patient = storage.getPatient(control.patientId);
        if (!patient) {
            alert('Paciente no encontrado');
            return;
        }

        // Show download options modal
        this.showDownloadModal(control, patient);
    }

    showDownloadModal(control, patient) {
        const modalHTML = `
            <div id="downloadModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📥 Descargar Control</h3>
                        <button onclick="app.closeDownloadModal()" class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Selecciona el formato de descarga para el control de <strong>${patient.name}</strong></p>
                        <div class="download-options">
                            <button onclick="app.downloadAsPDF('${control.id}')" class="btn btn-primary btn-large">
                                📄 Descargar como PDF
                            </button>
                            <button onclick="app.downloadAsImage('${control.id}')" class="btn btn-secondary btn-large">
                                🖼️ Descargar como Imagen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('downloadModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('downloadModal').style.display = 'block';
    }

    closeDownloadModal() {
        const modal = document.getElementById('downloadModal');
        if (modal) {
            modal.remove();
        }
    }

    async downloadAsPDF(controlId) {
        const control = storage.getControl(controlId);
        const patient = storage.getPatient(control.patientId);
        
        try {
            // Create the control view element
            const controlView = this.createControlView(control, patient);
            document.body.appendChild(controlView);

            // Capture the element as canvas
            const canvas = await html2canvas(controlView, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 190;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Generate filename
            const date = new Date(control.date).toISOString().split('T')[0];
            const filename = `control_${patient.name.replace(/\s+/g, '_')}_${date}.pdf`;
            
            pdf.save(filename);
            
            // Clean up
            document.body.removeChild(controlView);
            this.closeDownloadModal();
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
    }

    async downloadAsImage(controlId) {
        const control = storage.getControl(controlId);
        const patient = storage.getPatient(control.patientId);
        
        try {
            // Create the control view element
            const controlView = this.createControlView(control, patient);
            document.body.appendChild(controlView);

            // Capture the element as canvas
            const canvas = await html2canvas(controlView, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            // Create download link
            const link = document.createElement('a');
            const date = new Date(control.date).toISOString().split('T')[0];
            const filename = `control_${patient.name.replace(/\s+/g, '_')}_${date}.png`;
            
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Clean up
            document.body.removeChild(controlView);
            this.closeDownloadModal();
            
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Error al generar la imagen. Por favor, inténtalo de nuevo.');
        }
    }

    createControlView(control, patient) {
        const date = new Date(control.date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const controlView = document.createElement('div');
        controlView.className = 'control-download-view';
        controlView.style.cssText = `
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 800px;
            padding: 40px;
            background: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #2D3748;
        `;

        controlView.innerHTML = `
            <div class="download-header">
                <div class="download-logo">
                    <img src="assets/logo.png" alt="TEAMGUER" style="width: 60px; height: 60px; object-fit: contain;">
                    <div style="margin-left: 15px;">
                        <h1 style="margin: 0; color: #E53E3E; font-size: 28px; font-weight: bold;">TEAMGUER</h1>
                        <p style="margin: 0; color: #666; font-size: 14px;">Control Corporal</p>
                    </div>
                </div>
                <div class="download-date" style="text-align: right; color: #666; font-size: 14px;">
                    Generado: ${new Date().toLocaleDateString('es-ES')}
                </div>
            </div>
            
            <hr style="margin: 30px 0; border: none; height: 2px; background: #E53E3E;">
            
            <div class="download-patient-info">
                <h2 style="color: #E53E3E; margin-bottom: 20px; font-size: 24px;">📊 Control de ${patient.name}</h2>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div><strong>Fecha:</strong> ${date}</div>
                    <div><strong>Edad:</strong> ${patient.age} años</div>
                    <div><strong>Estatura:</strong> ${patient.height} cm</div>
                </div>
            </div>
            
            <div class="download-measurements">
                <h3 style="color: #2D3748; margin-bottom: 20px; font-size: 20px;">📏 Medidas Corporales</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div class="measurement-item" style="padding: 15px; background: #F7FAFC; border-radius: 8px; border-left: 4px solid #E53E3E;">
                        <div style="color: #666; font-size: 14px;">Peso</div>
                        <div style="font-size: 24px; font-weight: bold; color: #2D3748;">${control.weight} kg</div>
                    </div>
                    <div class="measurement-item" style="padding: 15px; background: #F7FAFC; border-radius: 8px; border-left: 4px solid #E53E3E;">
                        <div style="color: #666; font-size: 14px;">IMC</div>
                        <div style="font-size: 24px; font-weight: bold; color: #2D3748;">${control.imc || 'N/A'}</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
                    <div class="measurement-item" style="padding: 15px; background: #FED7D7; border-radius: 8px; text-align: center;">
                        <div style="color: #666; font-size: 14px;">% Grasa</div>
                        <div style="font-size: 20px; font-weight: bold; color: #E53E3E;">${control.fatPercentage}%</div>
                    </div>
                    <div class="measurement-item" style="padding: 15px; background: #C6F6D5; border-radius: 8px; text-align: center;">
                        <div style="color: #666; font-size: 14px;">% Músculo</div>
                        <div style="font-size: 20px; font-weight: bold; color: #38A169;">${control.musclePercentage}%</div>
                    </div>
                    <div class="measurement-item" style="padding: 15px; background: #BEE3F8; border-radius: 8px; text-align: center;">
                        <div style="color: #666; font-size: 14px;">% Agua</div>
                        <div style="font-size: 20px; font-weight: bold; color: #3182CE;">${control.waterPercentage}%</div>
                    </div>
                </div>
            </div>
            
            ${control.waistCircumference || control.armCircumference || control.thighCircumference ? `
                <div class="download-circumferences">
                    <h3 style="color: #2D3748; margin-bottom: 20px; font-size: 20px;">📐 Circunferencias</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
                        ${control.waistCircumference ? `
                            <div style="padding: 15px; background: #F7FAFC; border-radius: 8px; text-align: center;">
                                <div style="color: #666; font-size: 14px;">Cintura</div>
                                <div style="font-size: 18px; font-weight: bold;">${control.waistCircumference} cm</div>
                            </div>
                        ` : ''}
                        ${control.armCircumference ? `
                            <div style="padding: 15px; background: #F7FAFC; border-radius: 8px; text-align: center;">
                                <div style="color: #666; font-size: 14px;">Brazo</div>
                                <div style="font-size: 18px; font-weight: bold;">${control.armCircumference} cm</div>
                            </div>
                        ` : ''}
                        ${control.thighCircumference ? `
                            <div style="padding: 15px; background: #F7FAFC; border-radius: 8px; text-align: center;">
                                <div style="color: #666; font-size: 14px;">Muslo</div>
                                <div style="font-size: 18px; font-weight: bold;">${control.thighCircumference} cm</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${control.strongCapacity || control.basalMetabolism || control.visceralFat || control.metabolicAge ? `
                <div class="download-additional">
                    <h3 style="color: #2D3748; margin-bottom: 20px; font-size: 20px;">📈 Datos Adicionales</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
                        ${control.strongCapacity ? `
                            <div style="padding: 15px; background: #F7FAFC; border-radius: 8px;">
                                <div style="color: #666; font-size: 14px;">Capacidad Fuerte</div>
                                <div style="font-size: 18px; font-weight: bold;">${control.strongCapacity}</div>
                            </div>
                        ` : ''}
                        ${control.basalMetabolism ? `
                            <div style="padding: 15px; background: #F7FAFC; border-radius: 8px;">
                                <div style="color: #666; font-size: 14px;">Metabolismo Basal</div>
                                <div style="font-size: 18px; font-weight: bold;">${control.basalMetabolism}</div>
                            </div>
                        ` : ''}
                        ${control.visceralFat ? `
                            <div style="padding: 15px; background: #F7FAFC; border-radius: 8px;">
                                <div style="color: #666; font-size: 14px;">Grasa Visceral</div>
                                <div style="font-size: 18px; font-weight: bold;">${control.visceralFat}</div>
                            </div>
                        ` : ''}
                        ${control.metabolicAge ? `
                            <div style="padding: 15px; background: #F7FAFC; border-radius: 8px;">
                                <div style="color: #666; font-size: 14px;">Edad Metabólica</div>
                                <div style="font-size: 18px; font-weight: bold;">${control.metabolicAge} años</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${control.notes ? `
                <div class="download-notes">
                    <h3 style="color: #2D3748; margin-bottom: 15px; font-size: 20px;">📝 Notas</h3>
                    <div style="padding: 20px; background: #F7FAFC; border-radius: 8px; border-left: 4px solid #E53E3E;">
                        <p style="margin: 0; font-size: 16px; line-height: 1.5;">${control.notes}</p>
                    </div>
                </div>
            ` : ''}
            
            <div class="download-footer" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; color: #666; font-size: 12px;">
                <p>TEAMGUER - Sistema de Control Corporal</p>
                <p>Made with ♥ by Jean Benitez</p>
            </div>
        `;

        // Add logo styling
        const logoStyle = document.createElement('style');
        logoStyle.textContent = `
            .download-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
            }
            .download-logo {
                display: flex;
                align-items: center;
            }
        `;
        controlView.appendChild(logoStyle);

        return controlView;
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