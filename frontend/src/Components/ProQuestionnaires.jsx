import React, { useState, useEffect } from 'react';
import { ChevronRight, FileText, Clock, CheckCircle, AlertCircle, ArrowLeft, Send, User, Calendar, Tag } from 'lucide-react';

const ProQuestionnaires = () => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Token JWT - à récupérer depuis votre système d'authentification
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || 'your-jwt-token-here';
  };

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/professor/questionnaires', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setQuestionnaires(data);
      
    } catch (err) {
      console.error('Erreur lors du chargement des questionnaires:', err);
      setError('Erreur lors du chargement des questionnaires: ' + err.message);
      
      // Données de démonstration en cas d'erreur API
      setQuestionnaires([
        {
          id: 1,
          templateCode: 'EVAL2024-001',
          title: 'Évaluation des cours de Mathématiques',
          description: 'Questionnaire d\'évaluation pour améliorer la qualité des cours',
          createdBy: 'Dr. Martin Dupont',
          createdAt: '2024-06-01T10:00:00Z',
          deadline: '2024-07-15T23:59:59Z',
          isPublished: true,
          isActive: true,
          responseCount: 0,
          questions: [
            {
              id: 1,
              questionText: 'Comment évaluez-vous globalement ce cours?',
              questionType: 'TEXT',
              isRequired: true,
              orderIndex: 1
            },
            {
              id: 2,
              questionText: 'Notez la clarté des explications',
              questionType: 'RATING',
              isRequired: true,
              orderIndex: 2,
              maxRating: 5
            },
            {
              id: 3,
              questionText: 'Quel aspect du cours était le plus difficile?',
              questionType: 'SINGLE_CHOICE',
              isRequired: false,
              orderIndex: 3,
              options: [
                { id: 1, optionText: 'Concepts théoriques', orderIndex: 1 },
                { id: 2, optionText: 'Exercices pratiques', orderIndex: 2 },
                { id: 3, optionText: 'Rythme du cours', orderIndex: 3 },
                { id: 4, optionText: 'Matériel pédagogique', orderIndex: 4 }
              ]
            },
            {
              id: 4,
              questionText: 'Suggestions d\'amélioration?',
              questionType: 'TEXT',
              isRequired: false,
              orderIndex: 4
            }
          ]
        },
        {
          id: 2,
          templateCode: 'FEEDBACK-002',
          title: 'Retour sur les méthodes pédagogiques',
          description: 'Questionnaire sur l\'efficacité des nouvelles méthodes d\'enseignement',
          createdBy: 'Prof. Marie Leclerc',
          createdAt: '2024-05-20T14:30:00Z',
          deadline: '2024-07-20T23:59:59Z',
          isPublished: true,
          isActive: true,
          responseCount: 5,
          questions: [
            {
              id: 5,
              questionText: 'Efficacité des méthodes interactives',
              questionType: 'RATING',
              isRequired: true,
              orderIndex: 1,
              maxRating: 10
            },
            {
              id: 6,
              questionText: 'Quels outils numériques recommandez-vous?',
              questionType: 'TEXT',
              isRequired: false,
              orderIndex: 2
            },
            {
              id: 7,
              questionText: 'Domaines de formation souhaités',
              questionType: 'MULTIPLE_CHOICE',
              isRequired: true,
              orderIndex: 3,
              options: [
                { id: 5, optionText: 'Technologies numériques', orderIndex: 1 },
                { id: 6, optionText: 'Pédagogie innovante', orderIndex: 2 },
                { id: 7, optionText: 'Gestion de classe', orderIndex: 3 },
                { id: 8, optionText: 'Évaluation des apprentissages', orderIndex: 4 }
              ]
            }
          ]
        }
      ]);
      
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireClick = (questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setAnswers({});
    setError('');
    setSuccess('');
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedQuestionnaire) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      // Vérifier les questions obligatoires
      const requiredQuestions = selectedQuestionnaire.questions.filter(q => q.isRequired);
      const missingAnswers = requiredQuestions.filter(q => 
        !answers[q.id] || 
        answers[q.id] === '' || 
        (Array.isArray(answers[q.id]) && answers[q.id].length === 0)
      );
      
      if (missingAnswers.length > 0) {
        setError('Veuillez répondre à toutes les questions obligatoires');
        setSubmitting(false);
        return;
      }

      // Formater les réponses selon l'API
      const formattedAnswers = Object.entries(answers).map(([questionId, value]) => {
        const question = selectedQuestionnaire.questions.find(q => q.id === parseInt(questionId));
        
        return {
          questionId: parseInt(questionId),
          valueNumber: question?.questionType === 'RATING' ? parseInt(value) : null,
          valueText: question?.questionType === 'TEXT' ? value : 
                    Array.isArray(value) ? value.join(', ') : 
                    typeof value === 'string' ? value : null
        };
      });

      const requestBody = {
        answers: formattedAnswers
      };

      console.log('Submitting to API:', {
        templateCode: selectedQuestionnaire.templateCode,
        body: requestBody
      });

      const response = await fetch(`/api/professor/questionnaires/submit/${selectedQuestionnaire.templateCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      setSuccess(result.message || 'Réponses enregistrées avec succès!');
      
      // Mettre à jour le compteur de réponses
      setQuestionnaires(prev => 
        prev.map(q => 
          q.id === selectedQuestionnaire.id 
            ? { ...q, responseCount: (q.responseCount || 0) + 1 }
            : q
        )
      );
      
      // Retourner à la liste après 2 secondes
      setTimeout(() => {
        setSelectedQuestionnaire(null);
        setSuccess('');
      }, 2000);
      
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError('Erreur lors de l\'enregistrement: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const sortedOptions = question.options ? 
      [...question.options].sort((a, b) => a.orderIndex - b.orderIndex) : [];

    switch (question.questionType) {
      case 'TEXT':
        return (
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
            placeholder="Votre réponse..."
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );
      
      case 'RATING':
        const maxRating = question.maxRating || 5;
        return (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">1</span>
            <div className="flex space-x-2">
              {[...Array(maxRating)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                    answers[question.id] === i + 1
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-blue-300'
                  }`}
                  onClick={() => handleAnswerChange(question.id, i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-600">{maxRating}</span>
            {answers[question.id] && (
              <span className="text-sm font-medium text-blue-600 ml-4">
                Note: {answers[question.id]}/{maxRating}
              </span>
            )}
          </div>
        );
      
      case 'SINGLE_CHOICE':
        return (
          <div className="space-y-2">
            {sortedOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  checked={answers[question.id] === option.optionText}
                  onChange={() => handleAnswerChange(question.id, option.optionText)}
                />
                <span className="text-gray-700">{option.optionText}</span>
              </label>
            ))}
          </div>
        );

      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-2">
            {sortedOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={(answers[question.id] || []).includes(option.optionText)}
                  onChange={(e) => {
                    const currentAnswers = answers[question.id] || [];
                    const newAnswers = e.target.checked
                      ? [...currentAnswers, option.optionText]
                      : currentAnswers.filter(a => a !== option.optionText);
                    handleAnswerChange(question.id, newAnswers);
                  }}
                />
                <span className="text-gray-700">{option.optionText}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="text-gray-500 italic">
            Type de question non supporté: {question.questionType}
          </div>
        );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des questionnaires...</p>
        </div>
      </div>
    );
  }

  if (selectedQuestionnaire) {
    const sortedQuestions = [...selectedQuestionnaire.questions].sort((a, b) => a.orderIndex - b.orderIndex);
    const deadlinePassed = isDeadlinePassed(selectedQuestionnaire.deadline);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* En-tête */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedQuestionnaire(null)}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la liste
                </button>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                    deadlinePassed ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span>{deadlinePassed ? 'Expiré' : 'Actif'}</span>
                  </div>
                  {selectedQuestionnaire.responseCount > 0 && (
                    <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600">
                      {selectedQuestionnaire.responseCount} réponse{selectedQuestionnaire.responseCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <h1 className="text-2xl font-bold text-gray-900">{selectedQuestionnaire.title}</h1>
                <p className="text-gray-600 mt-2">{selectedQuestionnaire.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Créé par: {selectedQuestionnaire.createdBy}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Créé le: {formatDate(selectedQuestionnaire.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Deadline: {formatDate(selectedQuestionnaire.deadline)}
                  </div>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    Code: {selectedQuestionnaire.templateCode}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {deadlinePassed && (
              <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Ce questionnaire a expiré. Vous ne pouvez plus y répondre.
                </p>
              </div>
            )}

            {/* Questions */}
            <div className="p-6 space-y-8">
              {sortedQuestions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <label className="block text-sm font-medium text-gray-900">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                        {index + 1}
                      </span>
                      {question.questionText}
                      {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {question.questionType}
                    </span>
                  </div>
                  {renderQuestion(question)}
                </div>
              ))}

              {/* Boutons d'action */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedQuestionnaire(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || deadlinePassed}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {deadlinePassed ? 'Questionnaire expiré' : 'Enregistrer les réponses'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Questionnaires</h1>
          <p className="text-gray-600">Questionnaires à compléter en tant que professeur</p>
        </div>

        {/* Message d'erreur global */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{questionnaires.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {questionnaires.filter(q => q.isActive && !isDeadlinePassed(q.deadline)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expirés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {questionnaires.filter(q => isDeadlinePassed(q.deadline)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Réponses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {questionnaires.reduce((sum, q) => sum + (q.responseCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des questionnaires */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Questionnaires disponibles</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {questionnaires.map((questionnaire) => {
              const deadlinePassed = isDeadlinePassed(questionnaire.deadline);
              
              return (
                <div
                  key={questionnaire.id}
                  onClick={() => handleQuestionnaireClick(questionnaire)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{questionnaire.title}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                          deadlinePassed ? 'text-red-600 bg-red-50' :
                          questionnaire.isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
                        }`}>
                          {deadlinePassed ? (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              <span>Expiré</span>
                            </>
                          ) : questionnaire.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Actif</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Inactif</span>
                            </>
                          )}
                        </div>
                        {questionnaire.responseCount > 0 && (
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                            {questionnaire.responseCount} réponse{questionnaire.responseCount > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{questionnaire.description}</p>
                      
                      <div className="flex flex-wrap items-center text-xs text-gray-500 gap-4">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {questionnaire.createdBy}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Créé: {formatDate(questionnaire.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Deadline: {formatDate(questionnaire.deadline)}
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          {questionnaire.questions?.length || 0} question{(questionnaire.questions?.length || 0) > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {questionnaire.templateCode}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {questionnaires.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun questionnaire disponible</h3>
            <p className="text-gray-600">Aucun questionnaire n'est actuellement disponible pour vous.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProQuestionnaires;