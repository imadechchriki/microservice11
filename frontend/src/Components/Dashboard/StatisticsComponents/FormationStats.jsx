import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaChartLine, FaUsers, FaStar, FaTrophy, FaArrowUp, FaArrowDown, FaEye } from 'react-icons/fa';
import { getScoreColorClasses, formatScore } from '../../../utils/scoringUtils';

const FormationStats = ({ formationStatistics }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'submissions', 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [animationDelay, setAnimationDelay] = useState(0);

  useEffect(() => {
    setAnimationDelay(0);
  }, [formationStatistics]);

  if (!formationStatistics || formationStatistics.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <FaGraduationCap className="mr-2 text-blue-500" />
          Statistiques par Formation
        </h3>
        <div className="text-center py-16">
          <div className="text-gray-400 text-8xl mb-6">🎓</div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Aucune donnée de formation disponible
          </h4>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Aucune formation avec des évaluations n'a été trouvée dans la base de données.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Publiez des questionnaires d'évaluation et collectez des réponses pour voir les statistiques par formation.
          </p>
        </div>
      </div>
    );
  }

  // Sorting logic
  const sortedFormations = [...formationStatistics].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'rating':
        comparison = a.averageRating - b.averageRating;
        break;
      case 'submissions':
        comparison = a.submissionCount - b.submissionCount;
        break;
      case 'name':
        comparison = (a.formationTitle || '').localeCompare(b.formationTitle || '');
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getScoreIcon = (rating) => {
    if (rating >= 4.5) return <FaTrophy className="text-yellow-500" />;
    if (rating >= 4.0) return <FaStar className="text-green-500" />;
    if (rating >= 3.0) return <FaChartLine className="text-blue-500" />;
    return <FaArrowDown className="text-red-500" />;
  };

  const getInterpretation = (rating) => {
    if (rating >= 4.1) return { text: 'Excellent', color: 'text-green-600 dark:text-green-400' };
    if (rating >= 3.1) return { text: 'Bon', color: 'text-blue-600 dark:text-blue-400' };
    if (rating >= 2.1) return { text: 'Moyen', color: 'text-yellow-600 dark:text-yellow-400' };
    if (rating >= 1.1) return { text: 'Faible', color: 'text-orange-600 dark:text-orange-400' };
    return { text: 'Très Faible', color: 'text-red-600 dark:text-red-400' };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <FaGraduationCap className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Statistiques par Formation</h3>
              <p className="text-blue-100">
                Analyse détaillée des performances de {formationStatistics.length} formation{formationStatistics.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                📊 Tableau
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'cards' 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                🃏 Cartes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Sort Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Trier par:</span>
          
          <button
            onClick={() => handleSort('rating')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'rating' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FaStar className="text-xs" />
            <span>Note</span>
            {sortBy === 'rating' && (sortOrder === 'desc' ? <FaArrowDown className="text-xs" /> : <FaArrowUp className="text-xs" />)}
          </button>
          
          <button
            onClick={() => handleSort('submissions')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'submissions' 
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FaUsers className="text-xs" />
            <span>Participants</span>
            {sortBy === 'submissions' && (sortOrder === 'desc' ? <FaArrowDown className="text-xs" /> : <FaArrowUp className="text-xs" />)}
          </button>
          
          <button
            onClick={() => handleSort('name')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'name' 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FaGraduationCap className="text-xs" />
            <span>Nom</span>
            {sortBy === 'name' && (sortOrder === 'desc' ? <FaArrowDown className="text-xs" /> : <FaArrowUp className="text-xs" />)}
          </button>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Note Moyenne
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedFormations.map((formation, index) => {
                  const interpretation = getInterpretation(formation.averageRating);
                  return (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                            <FaGraduationCap className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formation.formationCode}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                              {formation.formationTitle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <FaUsers className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formation.submissionCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getScoreIcon(formation.averageRating)}
                          <span 
                            className={`inline-flex px-3 py-1 text-sm font-bold rounded-full cursor-help ${getScoreColorClasses(formation.averageRating, 'background')}`}
                            title="Score unifié sur 5 points"
                          >
                            {formatScore(formation.averageRating)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${interpretation.color}`}>
                          {interpretation.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFormations.map((formation, index) => {
              const interpretation = getInterpretation(formation.averageRating);
              return (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="p-6">
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
                        <FaGraduationCap className="text-blue-600 dark:text-blue-400 text-xl" />
                      </div>
                      <div className="flex items-center space-x-1">
                        {getScoreIcon(formation.averageRating)}
                        <span 
                          className={`px-3 py-1 text-sm font-bold rounded-full ${getScoreColorClasses(formation.averageRating, 'background')}`}
                        >
                          {formatScore(formation.averageRating)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Formation Info */}
                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {formation.formationCode}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {formation.formationTitle}
                      </p>
                    </div>
                    
                    {/* Metrics */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FaUsers className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Participants</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formation.submissionCount}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FaStar className="text-yellow-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Performance</span>
                        </div>
                        <span className={`text-sm font-semibold ${interpretation.color}`}>
                          {interpretation.text}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            formation.averageRating >= 4.0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                            formation.averageRating >= 3.0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            formation.averageRating >= 2.0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-red-500 to-red-600'
                          }`}
                          style={{ 
                            width: `${(formation.averageRating / 5) * 100}%`,
                            transitionDelay: `${index * 200 + 500}ms`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormationStats; 