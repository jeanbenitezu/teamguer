// storage.js - Manejo de localStorage para la aplicación
class LocalStorage {
    constructor() {
        this.PATIENTS_KEY = 'pt_patients';
        this.CONTROLS_KEY = 'pt_controls';
        this.SETTINGS_KEY = 'pt_settings';
        this.initStorage();
    }

    // Inicializar el almacenamiento
    initStorage() {
        if (!this.getPatients()) {
            localStorage.setItem(this.PATIENTS_KEY, JSON.stringify([]));
        }
        if (!this.getControls()) {
            localStorage.setItem(this.CONTROLS_KEY, JSON.stringify([]));
        }
        if (!this.getSettings()) {
            const defaultSettings = {
                created: new Date().toISOString(),
                version: '1.0.0'
            };
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(defaultSettings));
        }
    }

    // === ALUMNOS ===
    getPatients() {
        try {
            const patients = localStorage.getItem(this.PATIENTS_KEY);
            return patients ? JSON.parse(patients).filter(p => !p.deleted) : [];
        } catch (error) {
            console.error('Error al obtener alumnos:', error);
            return [];
        }
    }

    getAllPatients() {
        try {
            const patients = localStorage.getItem(this.PATIENTS_KEY);
            return patients ? JSON.parse(patients) : [];
        } catch (error) {
            console.error('Error al obtener todos los alumnos:', error);
            return [];
        }
    }

    getPatient(patientId) {
        const patients = this.getAllPatients();
        const patient = patients.find(p => p.id === patientId);
        return patient && !patient.deleted ? patient : null;
    }

    savePatient(patientData) {
        try {
            const patients = this.getPatients();
            const newPatient = {
                id: this.generateId(),
                ...patientData,
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
            patients.push(newPatient);
            localStorage.setItem(this.PATIENTS_KEY, JSON.stringify(patients));
            return newPatient;
        } catch (error) {
            console.error('Error al guardar alumno:', error);
            throw new Error('No se pudo guardar el alumno');
        }
    }

    updatePatient(patientId, updatedData) {
        try {
            const patients = this.getPatients();
            const patientIndex = patients.findIndex(p => p.id === patientId);
            if (patientIndex === -1) {
                throw new Error('Alumno no encontrado');
            }
            patients[patientIndex] = {
                ...patients[patientIndex],
                ...updatedData,
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(this.PATIENTS_KEY, JSON.stringify(patients));
            return patients[patientIndex];
        } catch (error) {
            console.error('Error al actualizar alumno:', error);
            throw new Error('No se pudo actualizar el alumno');
        }
    }

    deletePatient(patientId) {
        try {
            const patients = this.getAllPatients();
            const patientIndex = patients.findIndex(p => p.id === patientId);
            if (patientIndex === -1) {
                throw new Error('Alumno no encontrado');
            }
            
            // Soft delete: marcar como eliminado
            patients[patientIndex].deleted = true;
            patients[patientIndex].deletedAt = new Date().toISOString();
            
            localStorage.setItem(this.PATIENTS_KEY, JSON.stringify(patients));
            
            // Soft delete de todos los controles del alumno
            this.deleteControlsByPatient(patientId);
            return true;
        } catch (error) {
            console.error('Error al eliminar alumno:', error);
            throw new Error('No se pudo eliminar el alumno');
        }
    }

    // === CONTROLES ===
    getControls() {
        try {
            const controls = localStorage.getItem(this.CONTROLS_KEY);
            return controls ? JSON.parse(controls).filter(c => !c.deleted) : [];
        } catch (error) {
            console.error('Error al obtener controles:', error);
            return [];
        }
    }

    getAllControls() {
        try {
            const controls = localStorage.getItem(this.CONTROLS_KEY);
            return controls ? JSON.parse(controls) : [];
        } catch (error) {
            console.error('Error al obtener todos los controles:', error);
            return [];
        }
    }

    getControl(controlId) {
        const controls = this.getAllControls();
        const control = controls.find(c => c.id === controlId);
        return control && !control.deleted ? control : null;
    }

    getControlsByPatient(patientId) {
        const controls = this.getControls();
        return controls
            .filter(c => c.patientId === patientId)
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Más recientes primero
    }

    getLatestControlByPatient(patientId) {
        const controls = this.getControlsByPatient(patientId);
        return controls.length > 0 ? controls[0] : null;
    }

    getPreviousControlByPatient(patientId, currentDate) {
        const controls = this.getControlsByPatient(patientId);
        return controls.find(c => c.date < currentDate) || null;
    }

    saveControl(controlData) {
        try {
            const controls = this.getControls();
            const newControl = {
                id: this.generateId(),
                ...controlData,
                created: new Date().toISOString()
            };
            
            // Calcular IMC si hay datos suficientes y no se ha calculado ya
            if (!newControl.imc) {
                newControl.imc = this.calculateIMC(controlData.weight, controlData.patientId);
            }
            
            controls.push(newControl);
            localStorage.setItem(this.CONTROLS_KEY, JSON.stringify(controls));
            return newControl;
        } catch (error) {
            console.error('Error al guardar control:', error);
            throw new Error('No se pudo guardar el control');
        }
    }

    updateControl(controlId, updatedData) {
        try {
            const controls = this.getAllControls();
            const controlIndex = controls.findIndex(c => c.id === controlId);
            if (controlIndex === -1 || controls[controlIndex].deleted) {
                throw new Error('Control no encontrado');
            }
            controls[controlIndex] = {
                ...controls[controlIndex],
                ...updatedData,
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(this.CONTROLS_KEY, JSON.stringify(controls));
            return controls[controlIndex];
        } catch (error) {
            console.error('Error al actualizar control:', error);
            throw new Error('No se pudo actualizar el control');
        }
    }

    deleteControl(controlId) {
        try {
            const controls = this.getAllControls();
            const controlIndex = controls.findIndex(c => c.id === controlId);
            if (controlIndex === -1) {
                throw new Error('Control no encontrado');
            }
            
            // Soft delete: marcar como eliminado
            controls[controlIndex].deleted = true;
            controls[controlIndex].deletedAt = new Date().toISOString();
            
            localStorage.setItem(this.CONTROLS_KEY, JSON.stringify(controls));
            return true;
        } catch (error) {
            console.error('Error al eliminar control:', error);
            throw new Error('No se pudo eliminar el control');
        }
    }

    deleteControlsByPatient(patientId) {
        try {
            const controls = this.getAllControls();
            let updated = false;
            
            controls.forEach(control => {
                if (control.patientId === patientId && !control.deleted) {
                    control.deleted = true;
                    control.deletedAt = new Date().toISOString();
                    updated = true;
                }
            });
            
            if (updated) {
                localStorage.setItem(this.CONTROLS_KEY, JSON.stringify(controls));
            }
            
            return true;
        } catch (error) {
            console.error('Error al eliminar controles del alumno:', error);
            return false;
        }
    }

    // === CÁLCULOS ===
    calculateIMC(weight, patientId) {
        const patient = this.getPatient(patientId);
        if (!patient || !patient.height || !weight) {
            return null;
        }
        // IMC = peso(kg) / (altura(m))^2
        const heightInMeters = patient.height / 100;
        return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    calculateComparison(currentControl, previousControl) {
        if (!previousControl) {
            return null;
        }

        return {
            weight: this.calculateChange(currentControl.weight, previousControl.weight),
            fatPercentage: this.calculateChange(currentControl.fatPercentage, previousControl.fatPercentage),
            musclePercentage: this.calculateChange(currentControl.musclePercentage, previousControl.musclePercentage),
            waterPercentage: this.calculateChange(currentControl.waterPercentage, previousControl.waterPercentage),
            imc: this.calculateChange(currentControl.imc, previousControl.imc)
        };
    }

    calculateChange(current, previous) {
        if (!current || !previous) return { change: 0, trend: 'stable' };
        
        const change = parseFloat((current - previous).toFixed(2));
        let trend = 'stable';
        
        if (Math.abs(change) < 0.1) {
            trend = 'stable';
        } else if (change > 0) {
            trend = 'up';
        } else {
            trend = 'down';
        }

        return { change, trend };
    }

    // === SCORING ===
    calculateMonthlyScore(patientId) {
        const controls = this.getControlsByPatient(patientId);
        if (controls.length < 2) return 50; // Score neutro para primer control

        const latest = controls[0];
        const previous = controls[1];

        // Calcular cambios
        const fatChange = latest.fatPercentage - previous.fatPercentage;
        const muscleChange = latest.musclePercentage - previous.musclePercentage;
        const imcChange = latest.imc - previous.imc;
        const waterChange = latest.waterPercentage - previous.waterPercentage;

        // Fórmula simplificada: 50 base + suma de componentes
        const score = 50 + 
            // Grasa (20 pts): menor es mejor, -fatChange da puntos positivos cuando baja
            Math.max(-15, Math.min(20, -fatChange * 10)) +
            // Músculo (25 pts): mayor es mejor, muscleChange da puntos cuando sube  
            Math.max(-20, Math.min(25, muscleChange * 12.5)) +
            // IMC (15 pts): menor es mejor, -imcChange da puntos cuando baja
            Math.max(-15, Math.min(15, -imcChange * 15)) +
            // Agua (10 pts): estable es mejor, menos cambio = más puntos
            Math.max(-5, Math.min(10, 10 - Math.abs(waterChange) * 5));

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // === LOGROS ===
    getAchievements(patientId) {
        const controls = this.getControlsByPatient(patientId);
        const achievements = [];

        // Primer control
        if (controls.length >= 1) {
            achievements.push({
                id: 'first_control',
                title: '🎯 Primer Control',
                description: 'Has completado tu primer control',
                unlocked: true
            });
        }

        // Constancia
        if (controls.length >= 3) {
            achievements.push({
                id: 'three_months',
                title: '📈 3 Meses Constante',
                description: 'Has mantenido controles por 3 meses',
                unlocked: true
            });
        }

        if (controls.length >= 6) {
            achievements.push({
                id: 'six_months',
                title: '🏆 Medio Año',
                description: 'Has mantenido controles por 6 meses',
                unlocked: true
            });
        }

        // Progreso en grasa
        if (controls.length >= 2) {
            const fatReduction = controls[1].fatPercentage - controls[0].fatPercentage;
            if (fatReduction >= 2) {
                achievements.push({
                    id: 'fat_loss',
                    title: '🔥 Quemador de Grasa',
                    description: 'Has reducido 2% o más de grasa corporal',
                    unlocked: true
                });
            }
        }

        // Progreso en músculo
        if (controls.length >= 2) {
            const muscleGain = controls[0].musclePercentage - controls[1].musclePercentage;
            if (muscleGain >= 1) {
                achievements.push({
                    id: 'muscle_gain',
                    title: '💪 Constructor',
                    description: 'Has ganado 1% o más de masa muscular',
                    unlocked: true
                });
            }
        }

        return achievements;
    }

    // === CONFIGURACIONES ===
    getSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            return settings ? JSON.parse(settings) : null;
        } catch (error) {
            console.error('Error al obtener configuraciones:', error);
            return null;
        }
    }

    updateSettings(newSettings) {
        try {
            const currentSettings = this.getSettings() || {};
            const updatedSettings = {
                ...currentSettings,
                ...newSettings,
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
            return updatedSettings;
        } catch (error) {
            console.error('Error al actualizar configuraciones:', error);
            throw new Error('No se pudo actualizar las configuraciones');
        }
    }

    // === UTILIDADES ===
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    exportData() {
        return {
            patients: this.getPatients(),
            controls: this.getControls(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        try {
            if (data.patients) localStorage.setItem(this.PATIENTS_KEY, JSON.stringify(data.patients));
            if (data.controls) localStorage.setItem(this.CONTROLS_KEY, JSON.stringify(data.controls));
            if (data.settings) localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data.settings));
            return true;
        } catch (error) {
            console.error('Error al importar datos:', error);
            throw new Error('No se pudo importar los datos');
        }
    }

    clearAllData() {
        try {
            localStorage.removeItem(this.PATIENTS_KEY);
            localStorage.removeItem(this.CONTROLS_KEY);
            localStorage.removeItem(this.SETTINGS_KEY);
            this.initStorage();
            return true;
        } catch (error) {
            console.error('Error al limpiar datos:', error);
            return false;
        }
    }
}

// Crear instancia global
const storage = new LocalStorage();