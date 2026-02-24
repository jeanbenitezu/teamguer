// charts.js - Configuración y manejo de gráficas con Chart.js
class ChartsManager {
    constructor() {
        this.charts = {
            evolution: null,
            composition: null,
            progress: null,
            trends: null
        };
        this.chartColors = {
            weight: '#3B82F6',      // Azul
            fatPercentage: '#EF4444',     // Rojo
            musclePercentage: '#10B981',  // Verde
            waterPercentage: '#06B6D4',   // Cyan
            imc: '#8B5CF6',         // Púrpura
            waist: '#F59E0B',       // Amarillo
        };
    }

    // Inicializar todas las gráficas
    initAllCharts(patientId) {
        this.initCompositionChart('compositionChart', patientId);
        this.initProgressChart('progressChart', patientId);
        this.initTrendsChart('trendsChart', patientId);
        this.initEvolutionChart('evolutionChart', patientId);
    }

    // Gráfica de composición corporal (dona)
    initCompositionChart(canvasId, patientId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const controls = storage.getControlsByPatient(patientId);
        if (controls.length === 0) return;

        const latestControl = controls[0];
        
        // Destruir gráfica anterior si existe
        if (this.charts.composition) {
            this.charts.composition.destroy();
        }

        // Calcular otros componentes
        const totalKnown = latestControl.fatPercentage + latestControl.musclePercentage + latestControl.waterPercentage;
        const other = Math.max(0, 100 - totalKnown);

        const data = {
            labels: ['% Grasa', '% Músculo', '% Agua', 'Otros'],
            datasets: [{
                data: [
                    latestControl.fatPercentage,
                    latestControl.musclePercentage,
                    latestControl.waterPercentage,
                    other
                ],
                backgroundColor: [
                    this.chartColors.fatPercentage,
                    this.chartColors.musclePercentage,
                    this.chartColors.waterPercentage,
                    '#9CA3AF'
                ],
                borderWidth: 3,
                borderColor: '#FFFFFF'
            }]
        };

        this.charts.composition = new Chart(canvas, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 14 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed.toFixed(1) + '%';
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    // Gráfica de progreso inicial vs actual
    initProgressChart(canvasId, patientId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const controls = storage.getControlsByPatient(patientId);
        if (controls.length < 2) return;

        const firstControl = controls[controls.length - 1];
        const latestControl = controls[0];

        // Destruir gráfica anterior si existe
        if (this.charts.progress) {
            this.charts.progress.destroy();
        }

        const data = {
            labels: ['Peso (kg)', '% Grasa', '% Músculo', 'Cintura (cm)'],
            datasets: [
                {
                    label: 'Inicial',
                    data: [
                        firstControl.weight,
                        firstControl.fatPercentage,
                        firstControl.musclePercentage,
                        firstControl.waistCircumference || 0
                    ],
                    backgroundColor: 'rgba(156, 163, 175, 0.8)',
                    borderColor: '#9CA3AF',
                    borderWidth: 2
                },
                {
                    label: 'Actual',
                    data: [
                        latestControl.weight,
                        latestControl.fatPercentage,
                        latestControl.musclePercentage,
                        latestControl.waistCircumference || 0
                    ],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: this.chartColors.weight,
                    borderWidth: 2
                }
            ]
        };

        this.charts.progress = new Chart(canvas, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                const metric = context.label;
                                
                                if (metric.includes('kg') || metric.includes('cm')) {
                                    return label + ': ' + value.toFixed(1) + (metric.includes('kg') ? ' kg' : ' cm');
                                } else {
                                    return label + ': ' + value.toFixed(1) + '%';
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#F3F4F6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Gráfica de tendencias clave (líneas)
    initTrendsChart(canvasId, patientId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const controls = storage.getControlsByPatient(patientId).reverse();
        if (controls.length === 0) return;

        // Destruir gráfica anterior si existe
        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        const labels = controls.map(control => {
            const date = new Date(control.date);
            return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        });

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Peso (kg)',
                    data: controls.map(c => c.weight),
                    borderColor: this.chartColors.weight,
                    backgroundColor: this.chartColors.weight + '20',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: '% Grasa',
                    data: controls.map(c => c.fatPercentage),
                    borderColor: this.chartColors.fatPercentage,
                    backgroundColor: this.chartColors.fatPercentage + '20',
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'Cintura (cm)',
                    data: controls.map(c => c.waistCircumference || null),
                    borderColor: this.chartColors.waist,
                    backgroundColor: this.chartColors.waist + '20',
                    tension: 0.4,
                    yAxisID: 'y2'
                }
            ]
        };

        this.charts.trends = new Chart(canvas, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Peso (kg)'
                        },
                        grid: {
                            color: '#F3F4F6'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '% Grasa'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    y2: {
                        type: 'linear',
                        display: false,
                        position: 'right'
                    }
                }
            }
        });
    }

    // Inicializar gráfica de evolución (actualizada)
    initEvolutionChart(canvasId, patientId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas no encontrado:', canvasId);
            return;
        }

        // Destruir gráfica anterior si existe
        if (this.charts.evolution) {
            this.charts.evolution.destroy();
        }

        const data = this.prepareChartData(patientId);
        
        // Configuración de la gráfica
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 14
                            },
                            color: '#374151'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1F2937',
                        bodyColor: '#374151',
                        borderColor: '#E5E7EB',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                return 'Control: ' + context[0].label;
                            },
                            label: function(context) {
                                const datasetLabel = context.dataset.label;
                                const value = context.parsed.y;
                                
                                if (datasetLabel === 'Peso') {
                                    return `${datasetLabel}: ${value} kg`;
                                } else if (datasetLabel === 'IMC') {
                                    return `${datasetLabel}: ${value}`;
                                } else if (datasetLabel.includes('cm')) {
                                    return `${datasetLabel}: ${value} cm`;
                                } else {
                                    return `${datasetLabel}: ${value}%`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Fecha del Control',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: '#374151'
                        },
                        grid: {
                            color: '#F3F4F6'
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            color: '#6B7280'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Valores',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: '#374151'
                        },
                        grid: {
                            color: '#F3F4F6'
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            color: '#6B7280'
                        },
                        beginAtZero: false
                    }
                },
                elements: {
                    line: {
                        tension: 0.3,
                        borderWidth: 3
                    },
                    point: {
                        radius: 6,
                        hoverRadius: 8,
                        borderWidth: 2,
                        backgroundColor: '#FFFFFF'
                    }
                }
            }
        };

        // Crear nueva gráfica
        this.charts.evolution = new Chart(canvas, config);
        return this.charts.evolution;
    }

    // Preparar datos para la gráfica
    prepareChartData(patientId) {
        const controls = storage.getControlsByPatient(patientId).reverse(); // Orden cronológico
        
        if (controls.length === 0) {
            return this.getEmptyChartData();
        }

        const labels = controls.map(control => {
            const date = new Date(control.date);
            return date.toLocaleDateString('es-ES', { 
                month: 'short', 
                year: '2-digit' 
            });
        });

        const datasets = [];

        // Dataset para peso
        if (controls.some(c => c.weight)) {
            datasets.push({
                label: 'Peso',
                data: controls.map(c => c.weight || null),
                borderColor: this.chartColors.weight,
                backgroundColor: this.chartColors.weight + '20',
                yAxisID: 'y',
                tension: 0.3
            });
        }

        // Dataset para porcentaje de grasa
        if (controls.some(c => c.fatPercentage)) {
            datasets.push({
                label: '% Grasa',
                data: controls.map(c => c.fatPercentage || null),
                borderColor: this.chartColors.fatPercentage,
                backgroundColor: this.chartColors.fatPercentage + '20',
                yAxisID: 'y',
                tension: 0.3
            });
        }

        // Dataset para porcentaje de músculo
        if (controls.some(c => c.musclePercentage)) {
            datasets.push({
                label: '% Músculo',
                data: controls.map(c => c.musclePercentage || null),
                borderColor: this.chartColors.musclePercentage,
                backgroundColor: this.chartColors.musclePercentage + '20',
                yAxisID: 'y',
                tension: 0.3
            });
        }

        // Dataset para porcentaje de agua
        if (controls.some(c => c.waterPercentage)) {
            datasets.push({
                label: '% Agua',
                data: controls.map(c => c.waterPercentage || null),
                borderColor: this.chartColors.waterPercentage,
                backgroundColor: this.chartColors.waterPercentage + '20',
                yAxisID: 'y',
                tension: 0.3
            });
        }

        // Dataset para circunferencia de cintura
        if (controls.some(c => c.waistCircumference)) {
            datasets.push({
                label: 'Cintura (cm)',
                data: controls.map(c => c.waistCircumference || null),
                borderColor: this.chartColors.waist,
                backgroundColor: this.chartColors.waist + '20',
                yAxisID: 'y',
                tension: 0.3
            });
        }

        return {
            labels: labels,
            datasets: datasets
        };
    }

    // Datos vacíos para cuando no hay controles
    getEmptyChartData() {
        return {
            labels: ['No hay datos'],
            datasets: [{
                label: 'Sin controles registrados',
                data: [0],
                borderColor: '#9CA3AF',
                backgroundColor: '#F3F4F6',
                pointRadius: 0
            }]
        };
    }

    // Actualizar gráficas con nuevos datos
    updateCharts(patientId) {
        this.initAllCharts(patientId);
    }

    // Destruir todas las gráficas
    destroyAllCharts() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
                this.charts[key] = null;
            }
        });
    }

    // Destruir gráfica específica (método legacy)
    destroyChart() {
        this.destroyAllCharts();
    }

    // Configurar gráfica para pantalla completa/TV
    configureForTV() {
        if (!this.chart) return;

        // Actualizar opciones para mejor visibilidad en TV
        this.chart.options.plugins.title.font.size = 24;
        this.chart.options.plugins.legend.labels.font.size = 18;
        this.chart.options.scales.x.title.font.size = 18;
        this.chart.options.scales.y.title.font.size = 18;
        this.chart.options.scales.x.ticks.font.size = 16;
        this.chart.options.scales.y.ticks.font.size = 16;
        this.chart.options.elements.point.radius = 8;
        this.chart.options.elements.line.borderWidth = 4;

        this.chart.update();
    }
}

// Crear instancia global
const chartsManager = new ChartsManager();