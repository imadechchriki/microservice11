import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FaChartBar, FaUsers, FaPercentage } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartsSection = ({ overallStats }) => {
  if (!overallStats || !overallStats.formationStatistics || overallStats.formationStatistics.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FaChartBar className="mr-2 text-blue-500" />
          Analyses Graphiques
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-500 dark:text-gray-400">
            Les graphiques apparaîtront une fois que des données d'évaluation seront disponibles.
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for Formation Performance Chart
  const formationNames = overallStats.formationStatistics.map(f => 
    f.formationCode || f.formationTitle?.substring(0, 20) || 'Formation'
  );
  const formationScores = overallStats.formationStatistics.map(f => f.averageRating);
  const formationSubmissions = overallStats.formationStatistics.map(f => f.submissionCount);

  // Performance Bar Chart
  const performanceChartData = {
    labels: formationNames,
    datasets: [
      {
        label: 'Note Moyenne (/5)',
        data: formationScores,
        backgroundColor: formationScores.map(score => {
          if (score >= 4.0) return 'rgba(34, 197, 94, 0.8)'; // Green
          if (score >= 3.0) return 'rgba(59, 130, 246, 0.8)'; // Blue
          if (score >= 2.0) return 'rgba(251, 191, 36, 0.8)'; // Yellow
          return 'rgba(239, 68, 68, 0.8)'; // Red
        }),
        borderColor: formationScores.map(score => {
          if (score >= 4.0) return 'rgba(34, 197, 94, 1)';
          if (score >= 3.0) return 'rgba(59, 130, 246, 1)';
          if (score >= 2.0) return 'rgba(251, 191, 36, 1)';
          return 'rgba(239, 68, 68, 1)';
        }),
        borderWidth: 2,
        borderRadius: 4,
      }
    ],
  };

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const formation = overallStats.formationStatistics[context.dataIndex];
            return [
              `Note: ${context.parsed.y.toFixed(1)}/5`,
              `Participants: ${formation.submissionCount}`,
              `Formation: ${formation.formationTitle || formation.formationCode}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 0.5,
        },
        title: {
          display: true,
          text: 'Note Moyenne',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Formations',
        }
      }
    },
  };

  // Performance Categories Distribution
  const performanceCategories = {
    excellent: overallStats.formationStatistics.filter(f => f.averageRating >= 4.1).length,
    good: overallStats.formationStatistics.filter(f => f.averageRating >= 3.1 && f.averageRating < 4.1).length,
    average: overallStats.formationStatistics.filter(f => f.averageRating >= 2.1 && f.averageRating < 3.1).length,
    poor: overallStats.formationStatistics.filter(f => f.averageRating >= 1.1 && f.averageRating < 2.1).length,
    veryPoor: overallStats.formationStatistics.filter(f => f.averageRating < 1.1).length,
  };

  const categoriesChartData = {
    labels: ['Excellent (4.1-5.0)', 'Bon (3.1-4.0)', 'Moyen (2.1-3.0)', 'Faible (1.1-2.0)', 'Très Faible (0-1.0)'],
    datasets: [
      {
        label: 'Nombre de Formations',
        data: [
          performanceCategories.excellent,
          performanceCategories.good,
          performanceCategories.average,
          performanceCategories.poor,
          performanceCategories.veryPoor
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green - Excellent
          'rgba(59, 130, 246, 0.8)',   // Blue - Good  
          'rgba(251, 191, 36, 0.8)',   // Yellow - Average
          'rgba(251, 146, 60, 0.8)',   // Orange - Poor
          'rgba(239, 68, 68, 0.8)',    // Red - Very Poor
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      }
    ],
  };

  const categoriesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = overallStats.formationStatistics.length;
            const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0;
            return [
              `Formations: ${context.parsed.y}`,
              `Pourcentage: ${percentage}%`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Nombre de Formations',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Catégories de Performance',
        }
      }
    },
  };

  // Completion Rate Donut Chart
  const completionRate = overallStats.overallCompletionRate || 0;
  const incompletionRate = 100 - completionRate;

  const donutChartData = {
    labels: ['Complétées', 'Non complétées'],
    datasets: [
      {
        data: [completionRate, incompletionRate],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(156, 163, 175, 0.3)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderWidth: 2,
      }
    ],
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.toFixed(1)}%`;
          }
        }
      }
    },
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <div className="bg-white/20 p-2 rounded-lg mr-3">
              <FaChartBar className="text-lg" />
            </div>
            Analyses Graphiques des Performances
          </h3>
          <p className="text-blue-100 text-sm mt-1">Visualisation des données de performance en temps réel</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Chart */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
                  <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg mr-3">
                    <FaChartBar className="text-green-600 dark:text-green-300" />
                  </div>
                  Performance par Formation
                </h4>
                <div className="h-64 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
                  <Bar data={performanceChartData} options={performanceChartOptions} />
                </div>
              </div>
            </div>

            {/* Completion Rate Donut */}
            <div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center">
                  <div className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-lg mr-3">
                    <FaPercentage className="text-yellow-600 dark:text-yellow-300" />
                  </div>
                  Taux de Completion
                </h4>
                <div className="h-64 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner flex items-center justify-center">
                  <div className="w-full h-full relative">
                    <Doughnut data={donutChartData} options={donutChartOptions} />
                  </div>
                </div>
                <div className="text-center mt-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-inner">
                  <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {completionRate.toFixed(1)}%
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Évaluations complétées
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Categories Chart */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Chart Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <h4 className="text-xl font-bold text-white flex items-center">
            <div className="bg-white/20 p-2 rounded-lg mr-3">
              <FaChartBar className="text-lg" />
            </div>
            Répartition des Performances
          </h4>
          <p className="text-purple-100 text-sm mt-1">Distribution des formations par niveau de qualité</p>
        </div>
        
        <div className="p-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 shadow-lg">
            <div className="h-64 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
              <Bar data={categoriesChartData} options={categoriesChartOptions} />
            </div>
          </div>
          
          {/* Enhanced Performance Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {performanceCategories.excellent}
              </div>
              <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                Excellent
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                4.1 - 5.0
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {performanceCategories.good}
              </div>
              <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Bon
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                3.1 - 4.0
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4 text-center border border-yellow-200 dark:border-yellow-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                {performanceCategories.average}
              </div>
              <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                Moyen
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                2.1 - 3.0
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 text-center border border-orange-200 dark:border-orange-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                {performanceCategories.poor}
              </div>
              <div className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                Faible
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                1.1 - 2.0
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-4 text-center border border-red-200 dark:border-red-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                {performanceCategories.veryPoor}
              </div>
              <div className="text-sm font-semibold text-red-700 dark:text-red-300">
                Très Faible
              </div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                0.0 - 1.0
              </div>
            </div>
          </div>
          
          {/* Enhanced Quality Insights */}
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800 shadow-lg">
            <h5 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center">
              <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-lg mr-3">
                📊
              </div>
              Insights Qualité
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Formations de qualité (≥3.1/5)</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {performanceCategories.excellent + performanceCategories.good} / {overallStats.formationStatistics.length}
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((performanceCategories.excellent + performanceCategories.good) / overallStats.formationStatistics.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Nécessitent amélioration (≤3.0/5)</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {performanceCategories.average + performanceCategories.poor + performanceCategories.veryPoor} / {overallStats.formationStatistics.length}
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((performanceCategories.average + performanceCategories.poor + performanceCategories.veryPoor) / overallStats.formationStatistics.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection; 