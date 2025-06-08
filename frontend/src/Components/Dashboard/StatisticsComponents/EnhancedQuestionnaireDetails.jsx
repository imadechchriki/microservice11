import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaChartLine, FaUsers, FaClock, FaPercent, FaChartBar, FaStar, FaExpand, FaCompress, FaComments } from 'react-icons/fa';
import { statisticsService } from '../../../services/statisticsApi';

const EnhancedQuestionnaireDetails = () => {
  const [publicationId, setPublicationId] = useState('');
  const [questionnaireStats, setQuestionnaireStats] = useState(null);
  const [availablePublications, setAvailablePublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [error, setError] = useState('');
  const [selectedView, setSelectedView] = useState('summary');
  const [expandedTextAnswers, setExpandedTextAnswers] = useState({});

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
    } finally {
      setLoadingPublications(false);
    }
  };

  const handleViewDetails = async (pubId) => {
    setPublicationId(pubId.toString());
    setLoading(true);
    setError('');
    
    try {
      const data = await statisticsService.getQuestionnaireStatistics(pubId);
      setQuestionnaireStats(data);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques du questionnaire');
      console.error('Error fetching questionnaire stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSearch = async () => {
    if (!publicationId || isNaN(publicationId)) {
      setError('Veuillez entrer un ID de publication valide');
      return;
    }
    await handleViewDetails(parseInt(publicationId));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 dark:text-green-400';
    if (rating >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCompletionColor = (rate) => {
    if (rate >= 80) return 'from-green-500 to-green-600';
    if (rate >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  // Toggle expanded text answers for a specific question
  const toggleTextAnswers = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`;
    setExpandedTextAnswers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold mb-3 flex items-center">
              <FaChartLine className="mr-4 text-4xl" />
              Analytics Dashboard
            </h3>
            <p className="text-indigo-100 text-lg">
              Analyse approfondie des questionnaires d'évaluation • Insights en temps réel
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <FaChartBar className="text-5xl text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Publications Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 border-b">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaEye className="mr-3 text-blue-500" />
            Questionnaires Actifs
            <span className="ml-3 text-sm bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-3 py-1 rounded-full">
              {availablePublications.length} {availablePublications.length <= 1 ? 'disponible' : 'disponibles'}
            </span>
          </h4>
        </div>
        
        <div className="p-6">
          {loadingPublications ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : availablePublications.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 text-9xl mb-8">📊</div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Aucune donnée disponible
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-3">
                Aucun questionnaire avec des soumissions n'a été trouvé dans la base de données.
              </p>
              <p className="text-gray-400 dark:text-gray-500 mb-6">
                Veuillez publier des questionnaires et collecter des réponses pour voir les statistiques.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mx-auto max-w-md">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  💡 Astuce: Utilisez la recherche avancée ci-dessous pour analyser un questionnaire spécifique par son ID.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {availablePublications.map((pub) => (
                <div
                  key={pub.publicationId}
                  className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleViewDetails(pub.publicationId)}
                >
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      #{pub.publicationId}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-bold text-gray-900 dark:text-white text-lg mb-2 pr-16">
                      {pub.title || `Questionnaire d'Évaluation #${pub.publicationId}`}
                    </h5>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <FaUsers className="mx-auto text-blue-500 mb-1" />
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {pub.totalSubmissions}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Réponses</div>
                    </div>
                    
                    <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <FaPercent className="mx-auto text-green-500 mb-1" />
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {pub.completionRate?.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Complété</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</span>
                      <span className={`text-sm font-bold ${getRatingColor(pub.averageRating)}`}>
                        {pub.averageRating?.toFixed(1)}/5
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3 mr-3">
                        <div
                          className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(pub.averageRating / 5) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-sm ${
                              i < Math.round(pub.averageRating)
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 group-hover:shadow-lg">
                    Analyser en détail
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Custom Search */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <FaSearch className="mr-3 text-indigo-500" />
              Recherche Avancée
            </h5>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={publicationId}
                  onChange={(e) => setPublicationId(e.target.value)}
                  placeholder="Saisissez l'ID du questionnaire à analyser..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-lg"
                />
              </div>
              <button
                onClick={handleCustomSearch}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center font-medium text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyse...
                  </>
                ) : (
                  <>
                    <FaSearch className="mr-3" />
                    Analyser
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Results */}
      {questionnaireStats && (
        <div className="space-y-6">
          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Réponses</p>
                  <p className="text-3xl font-bold">{questionnaireStats.totalSubmissions}</p>
                  <p className="text-blue-200 text-xs mt-1">Participants uniques</p>
                </div>
                <div className="bg-blue-400/30 p-3 rounded-full">
                  <FaUsers className="text-2xl" />
                </div>
              </div>
            </div>
            
            <div className={`bg-gradient-to-br ${getCompletionColor(questionnaireStats.completionRate)} text-white p-6 rounded-xl shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Taux de Completion</p>
                  <p className="text-3xl font-bold">{questionnaireStats.completionRate.toFixed(1)}%</p>
                  <p className="text-white/70 text-xs mt-1">Questionnaires terminés</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <FaPercent className="text-2xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Sections</p>
                  <p className="text-3xl font-bold">{questionnaireStats.sectionStatistics.length}</p>
                  <p className="text-purple-200 text-xs mt-1">Modules d'évaluation</p>
                </div>
                <div className="bg-purple-400/30 p-3 rounded-full">
                  <FaChartLine className="text-2xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Période Active</p>
                  <p className="text-lg font-bold">
                    {new Date(questionnaireStats.startDate).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit'})}
                  </p>
                  <p className="text-orange-200 text-xs">
                    au {new Date(questionnaireStats.endDate).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit'})}
                  </p>
                </div>
                <div className="bg-orange-400/30 p-3 rounded-full">
                  <FaClock className="text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Questionnaire Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-blue-500 text-white p-2 rounded-lg mr-4">📋</span>
              {questionnaireStats.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Analyse détaillée des réponses • Performance par section • Distribution des évaluations
            </p>
          </div>

          {/* Enhanced View Toggle */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-xl">
              <button
                onClick={() => setSelectedView('summary')}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                  selectedView === 'summary'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <FaChartBar className="mr-2" />
                Vue Synthèse
              </button>
              <button
                onClick={() => setSelectedView('detailed')}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                  selectedView === 'detailed'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <FaEye className="mr-2" />
                Vue Détaillée
              </button>
            </div>
          </div>

          {/* Content Views */}
          {selectedView === 'summary' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {questionnaireStats.sectionStatistics.map((section, sectionIndex) => (
                <div key={sectionIndex} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 border-b">
                    <h5 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm px-3 py-1 rounded-full mr-3 font-medium">
                        Section {sectionIndex + 1}
                      </span>
                      {section.sectionTitle}
                    </h5>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {section.questionStatistics.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                      </div>
                      
                      <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {(section.questionStatistics.reduce((acc, q) => acc + q.totalAnswers, 0) / section.questionStatistics.length).toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Réponses moy.</div>
                      </div>
                    </div>

                    {section.questionStatistics.some(q => q.averageScore !== null) && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {(section.questionStatistics
                              .filter(q => q.averageScore !== null)
                              .reduce((acc, q) => acc + q.averageScore, 0) / 
                              section.questionStatistics.filter(q => q.averageScore !== null).length
                            ).toFixed(1)}/5
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Score Moyen</div>
                          <div className="flex justify-center mt-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`text-sm ${
                                  i < Math.round((section.questionStatistics
                                    .filter(q => q.averageScore !== null)
                                    .reduce((acc, q) => acc + q.averageScore, 0) / 
                                    section.questionStatistics.filter(q => q.averageScore !== null).length))
                                    ? 'text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {questionnaireStats.sectionStatistics.map((section, sectionIndex) => (
                <div key={sectionIndex} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800 p-6 border-b">
                    <h5 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-4 py-2 rounded-full mr-4 font-medium">
                        Section {sectionIndex + 1}
                      </span>
                      {section.sectionTitle}
                    </h5>
                  </div>
                  
                  <div className="p-8">
                    <div className="grid gap-6">
                      {section.questionStatistics.map((question, questionIndex) => (
                        <div key={questionIndex} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 mr-4">
                              <div className="flex items-center mb-2">
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full mr-3 font-medium">
                                  Q{questionIndex + 1}
                                </span>
                                <span className="text-xs bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                                  {question.questionType}
                                </span>
                              </div>
                              <p className="text-gray-900 dark:text-white font-medium text-lg leading-relaxed">
                                {question.questionText}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                              <FaUsers className="mx-auto text-blue-500 mb-2" />
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {question.totalAnswers}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Réponses</div>
                            </div>
                            
                            {question.averageScore !== null && (
                              <div className="text-center bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                                <FaStar className="mx-auto text-yellow-500 mb-2" />
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  {question.averageScore.toFixed(1)}/5
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Score Moyen</div>
                              </div>
                            )}
                            
                            <div className="text-center bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                              <FaChartBar className="mx-auto text-purple-500 mb-2" />
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {question.answerDistribution.length}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Options</div>
                            </div>
                          </div>
                          
                          {question.answerDistribution.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                              <h6 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <FaChartBar className="mr-2 text-indigo-500" />
                                Distribution des Réponses
                              </h6>
                              <div className="space-y-4">
                                {question.answerDistribution.map((answer, answerIndex) => (
                                  <div key={answerIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {answer.answerValue}
                                      </span>
                                      <div className="flex items-center space-x-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          {answer.count} réponses
                                        </span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                          {answer.percentage.toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                      <div
                                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${answer.percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {question.textAnswers && question.textAnswers.length > 0 && (
                            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 mt-6 overflow-hidden shadow-lg">
                              <div className="bg-gradient-to-r from-emerald-100 to-cyan-100 dark:from-emerald-900/40 dark:to-cyan-900/40 p-5 border-b border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <FaComments className="text-emerald-600 dark:text-emerald-400 mr-3 text-lg" />
                                    <h6 className="text-lg font-bold text-gray-900 dark:text-white">
                                      Commentaires et Suggestions
                                    </h6>
                                    <span className="ml-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                                      {question.textAnswers.length}
                                    </span>
                                  </div>
                                  {question.textAnswers.length > 4 && (
                                    <button
                                      onClick={() => toggleTextAnswers(sectionIndex, questionIndex)}
                                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center text-sm font-medium transition-all duration-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 px-3 py-1 rounded-lg"
                                    >
                                      {expandedTextAnswers[`${sectionIndex}-${questionIndex}`] ? (
                                        <>
                                          <FaCompress className="mr-2" />
                                          Réduire
                                        </>
                                      ) : (
                                        <>
                                          <FaExpand className="mr-2" />
                                          Tout afficher ({question.textAnswers.length})
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="p-6">
                                <div className="grid gap-4 max-h-80 overflow-y-auto">
                                  {(expandedTextAnswers[`${sectionIndex}-${questionIndex}`] 
                                    ? question.textAnswers 
                                    : question.textAnswers.slice(0, 4)
                                  ).map((text, textIndex) => (
                                    <div key={textIndex} className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-emerald-400 shadow-sm hover:shadow-md transition-all duration-200 group">
                                      <div className="flex items-start space-x-4">
                                        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                          {textIndex + 1}
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                                            "{text}"
                                          </p>
                                          <div className="flex items-center mt-3 space-x-2">
                                            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
                                              Réponse #{textIndex + 1}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              {text.length} caractères
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {question.textAnswers.length > 4 && !expandedTextAnswers[`${sectionIndex}-${questionIndex}`] && (
                                  <div className="mt-6 text-center">
                                    <button
                                      onClick={() => toggleTextAnswers(sectionIndex, questionIndex)}
                                      className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                      📖 Découvrir {question.textAnswers.length - 4} autre{question.textAnswers.length - 4 > 1 ? 's' : ''} commentaire{question.textAnswers.length - 4 > 1 ? 's' : ''} détaillé{question.textAnswers.length - 4 > 1 ? 's' : ''}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedQuestionnaireDetails; 