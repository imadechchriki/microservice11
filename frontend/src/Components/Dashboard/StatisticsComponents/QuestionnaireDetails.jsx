import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaChartLine, FaUsers, FaClock, FaPercent, FaExpand, FaCompress, FaComments, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { statisticsService } from '../../../services/statisticsApi';
import ExportButton from './ExportButton';
import { getScoreColorClasses, formatScore } from '../../../utils/scoringUtils';

const QuestionnaireDetails = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [questionnaireStats, setQuestionnaireStats] = useState(null);
  const [availablePublications, setAvailablePublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [error, setError] = useState('');
  const [selectedView, setSelectedView] = useState('summary');
  const [expandedTextAnswers, setExpandedTextAnswers] = useState({});
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});

  useEffect(() => {
    loadAvailablePublications();
  }, []);

  const loadAvailablePublications = async () => {
    try {
      setLoadingPublications(true);
      // Get all publications from questionnaire service via statistics service
      const allPublications = await statisticsService.getAllPublications();
      
      if (allPublications.length === 0) {
        setAvailablePublications([]);
        return;
      }

      // Get publication IDs to fetch summary data
      const publicationIds = allPublications.map(pub => pub.id);
      const publicationsSummary = await statisticsService.getPublicationsSummary(publicationIds);
      
      // Filter only publications with submissions and merge data
      const publicationsWithData = publicationsSummary
        .filter(summary => summary.totalSubmissions > 0)
        .map(summary => {
          const fullPublication = allPublications.find(pub => pub.id === summary.publicationId);
          return {
            ...summary,
            formationCode: fullPublication?.formationCode,
            formationTitle: fullPublication?.formationTitle,
            startAt: fullPublication?.startAt,
            endAt: fullPublication?.endAt
          };
        });

      setAvailablePublications(publicationsWithData);
    } catch (err) {
      console.error('Error loading publications:', err);
      setError('Erreur lors du chargement des questionnaires disponibles');
    } finally {
      setLoadingPublications(false);
    }
  };

  const handleViewDetails = async (pubId) => {
    setLoading(true);
    setError('');
    setSelectedQuestionnaireId(pubId);
    
    try {
      const data = await statisticsService.getQuestionnaireStatistics(pubId);
      setQuestionnaireStats(data);
      // Reset collapsed sections when loading new questionnaire
      setCollapsedSections({});
    } catch (err) {
      setError('Erreur lors du chargement des statistiques du questionnaire');
      console.error('Error fetching questionnaire stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter publications based on search query
  const filteredPublications = availablePublications.filter(pub =>
    (pub.title || 'Questionnaire d\'Évaluation')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Toggle expanded text answers for a specific question
  const toggleTextAnswers = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`;
    setExpandedTextAnswers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle section collapse in detailed view
  const toggleSectionCollapse = (sectionIndex) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  // Helper function to get score color classes
  const getScoreColorClass = (score) => {
    if (score >= 4.5) return 'text-green-600 dark:text-green-400';
    if (score >= 3.5) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 2.5) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgClass = (score) => {
    if (score >= 4.5) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 3.5) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (score >= 2.5) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-2 flex items-center">
          <FaChartLine className="mr-3" />
          Analyse Détaillée des Questionnaires
        </h3>
        <p className="text-blue-100">
          Explorez les performances et insights de vos questionnaires d'évaluation
        </p>
      </div>

      {/* Available Publications */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FaEye className="mr-2 text-blue-500" />
          Questionnaires Disponibles
        </h4>
        
        {loadingPublications ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : availablePublications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-8xl mb-6">📋</div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Aucune donnée disponible
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              Aucun questionnaire avec des soumissions n'a été trouvé dans la base de données.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Veuillez publier des questionnaires et collecter des réponses pour voir les statistiques.
            </p>
          </div>
        ) : filteredPublications.length === 0 && searchQuery ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun questionnaire trouvé
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                Aucun questionnaire ne correspond à votre recherche "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredPublications.map((pub) => (
                <div
                  key={pub.publicationId}
                  className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                    selectedQuestionnaireId === pub.publicationId
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 shadow-lg ring-2 ring-blue-500 ring-opacity-50'
                      : 'border-gray-200 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 hover:border-blue-300'
                  }`}
                  onClick={() => handleViewDetails(pub.publicationId)}
                >
                  <div className="mb-2">
                    <h5 className={`font-medium text-sm ${
                      selectedQuestionnaireId === pub.publicationId 
                        ? 'text-blue-900 dark:text-blue-100' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {pub.title || `Questionnaire d'Évaluation`}
                    </h5>
                    {selectedQuestionnaireId === pub.publicationId && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                          <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                          Sélectionné
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <FaUsers className="mr-1 text-green-500" />
                      {pub.totalSubmissions} réponses
                    </div>
                    <div className="flex items-center">
                      <FaPercent className="mr-1 text-blue-500" />
                      {pub.completionRate?.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Note moyenne</div>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            pub.averageRating >= 4.5 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            pub.averageRating >= 3.5 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                            pub.averageRating >= 2.5 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                            'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                          style={{ width: `${(pub.averageRating / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getScoreColorClass(pub.averageRating)}`}>
                        {pub.averageRating?.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Search by Title */}
        <div className="border-t pt-4">
          <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <FaSearch className="mr-2 text-gray-500" />
            Rechercher un Questionnaire
          </h5>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre du questionnaire..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <span className="mr-1">⚠️</span>
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Loading State for Questionnaire Details */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des détails du questionnaire...</p>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      {questionnaireStats && !loading && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Réponses</p>
                  <p className="text-2xl font-bold">{questionnaireStats.totalSubmissions}</p>
                </div>
                <FaUsers className="text-3xl text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Taux de Completion</p>
                  <p className="text-2xl font-bold">{questionnaireStats.completionRate.toFixed(1)}%</p>
                </div>
                <FaPercent className="text-3xl text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Sections</p>
                  <p className="text-2xl font-bold">{questionnaireStats.sectionStatistics.length}</p>
                </div>
                <FaChartLine className="text-3xl text-purple-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Période</p>
                  <p className="text-sm font-medium">
                    {new Date(questionnaireStats.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-orange-200">
                    au {new Date(questionnaireStats.endDate).toLocaleDateString()}
                  </p>
                </div>
                <FaClock className="text-3xl text-orange-200" />
              </div>
            </div>
          </div>

          {/* Questionnaire Title with Export */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  📋 {questionnaireStats.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Analyse détaillée des réponses et des performances par section
                </p>
              </div>
              
              {/* Export Options */}
              <div className="flex flex-col space-y-2 ml-4">
                <ExportButton 
                  type="questionnaire" 
                  publicationId={questionnaireStats.publicationId}
                  title="📊 Exporter l'Analyse"
                  size="sm"
                  variant="primary"
                />
                <ExportButton 
                  type="submissions" 
                  publicationId={questionnaireStats.publicationId}
                  title="📁 Données Brutes"
                  size="sm"
                  variant="secondary"
                />
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setSelectedView('summary')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  selectedView === 'summary'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Vue Résumée
              </button>
              <button
                onClick={() => setSelectedView('detailed')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  selectedView === 'detailed'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Vue Détaillée
              </button>
            </div>
          </div>

          {/* Content Based on View */}
          {selectedView === 'summary' ? (
            // Summary View with Enhanced Colors
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {questionnaireStats.sectionStatistics.map((section, sectionIndex) => {
                const sectionAverageScore = section.questionStatistics.some(q => q.averageScore !== null)
                  ? section.questionStatistics
                      .filter(q => q.averageScore !== null)
                      .reduce((acc, q) => acc + q.averageScore, 0) / 
                    section.questionStatistics.filter(q => q.averageScore !== null).length
                  : null;

                return (
                  <div key={sectionIndex} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded-full mr-2">
                        Section {sectionIndex + 1}
                      </span>
                      {section.sectionTitle}
                    </h5>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {section.questionStatistics.length}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Réponses moyennes:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {(section.questionStatistics.reduce((acc, q) => acc + q.totalAnswers, 0) / section.questionStatistics.length).toFixed(1)}
                        </span>
                      </div>

                      {sectionAverageScore !== null && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Score moyen:</span>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${getScoreBgClass(sectionAverageScore)} ${getScoreColorClass(sectionAverageScore)}`}>
                              {sectionAverageScore.toFixed(1)}/5
                            </span>
                            <div className={`w-16 h-2 rounded-full ${
                              sectionAverageScore >= 4.5 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                              sectionAverageScore >= 3.5 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                              sectionAverageScore >= 2.5 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                              'bg-gradient-to-r from-red-400 to-red-500'
                            }`}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Detailed View with Collapsible Sections
            <div className="space-y-6">
              {questionnaireStats.sectionStatistics.map((section, sectionIndex) => (
                <div key={sectionIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 border-b cursor-pointer hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-200"
                    onClick={() => toggleSectionCollapse(sectionIndex)}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full mr-3">
                          {sectionIndex + 1}
                        </span>
                        {section.sectionTitle}
                      </h5>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {section.questionStatistics.length} questions
                        </span>
                        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                          {collapsedSections[sectionIndex] ? (
                            <FaChevronDown className="w-4 h-4" />
                          ) : (
                            <FaChevronUp className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {!collapsedSections[sectionIndex] && (
                    <div className="p-6 space-y-4">
                      {section.questionStatistics.map((question, questionIndex) => (
                        <div key={questionIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white flex-1 mr-4">
                              <span className="text-gray-500 dark:text-gray-400 mr-2">Q{questionIndex + 1}:</span>
                              {question.questionText}
                            </p>
                            <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full whitespace-nowrap">
                              {question.questionType}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {question.totalAnswers}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Réponses</div>
                            </div>
                            
                            {question.averageScore !== null && (
                              <div className="text-center">
                                <div className={`text-lg font-bold ${getScoreColorClass(question.averageScore)}`}>
                                  {question.averageScore.toFixed(1)}/5
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Score Moyen</div>
                              </div>
                            )}
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {question.answerDistribution.length}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Options</div>
                            </div>
                          </div>
                          
                          {/* Answer Distribution */}
                          {question.answerDistribution.length > 0 && (
                            <div className="mt-4">
                              <h6 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Distribution des Réponses:
                              </h6>
                              <div className="space-y-2">
                                {question.answerDistribution.map((answer, answerIndex) => (
                                  <div key={answerIndex} className="flex items-center">
                                    <div className="flex-1 mr-3">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600 dark:text-gray-300">{answer.answerValue}</span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                          {answer.count} ({answer.percentage.toFixed(1)}%)
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                          style={{ width: `${answer.percentage}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Professional Text Answers Display */}
                          {question.textAnswers && question.textAnswers.length > 0 && (
                            <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="p-4 border-b border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <FaComments className="text-blue-500 mr-2" />
                                    <h6 className="text-sm font-bold text-gray-900 dark:text-white">
                                      Commentaires et Suggestions
                                    </h6>
                                    <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                      {question.textAnswers.length}
                                    </span>
                                  </div>
                                  {question.textAnswers.length > 3 && (
                                    <button
                                      onClick={() => toggleTextAnswers(sectionIndex, questionIndex)}
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center text-xs font-medium transition-colors"
                                    >
                                      {expandedTextAnswers[`${sectionIndex}-${questionIndex}`] ? (
                                        <>
                                          <FaCompress className="mr-1" />
                                          Voir moins
                                        </>
                                      ) : (
                                        <>
                                          <FaExpand className="mr-1" />
                                          Voir tout ({question.textAnswers.length})
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="p-4">
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                  {(expandedTextAnswers[`${sectionIndex}-${questionIndex}`] 
                                    ? question.textAnswers 
                                    : question.textAnswers.slice(0, 3)
                                  ).map((text, textIndex) => (
                                    <div key={textIndex} className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex items-start">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mr-3 flex-shrink-0">
                                          <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">
                                            {textIndex + 1}
                                          </span>
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            "{text}"
                                          </p>
                                          <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                              Réponse #{textIndex + 1}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {question.textAnswers.length > 3 && !expandedTextAnswers[`${sectionIndex}-${questionIndex}`] && (
                                  <div className="mt-4 text-center">
                                    <button
                                      onClick={() => toggleTextAnswers(sectionIndex, questionIndex)}
                                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
                                    >
                                      Afficher {question.textAnswers.length - 3} autre{question.textAnswers.length - 3 > 1 ? 's' : ''} réponse{question.textAnswers.length - 3 > 1 ? 's' : ''}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionnaireDetails; 