const API_BASE_URL = import.meta.env.VITE_STATISTICS_API_URL || 'http://localhost:5246/api';

// Helper function to download file
const downloadFile = async (url, filename) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': '*/*',
            },
        });

        if (!response.ok) {
            throw new Error(`Export failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || 'export';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        return { success: true };
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
};

export const exportService = {
    // Overall Statistics Exports
    exportOverallStatisticsPdf: () => 
        downloadFile(`${API_BASE_URL}/export/overall/pdf`, 'statistiques_generales.pdf'),
    
    exportOverallStatisticsExcel: () => 
        downloadFile(`${API_BASE_URL}/export/overall/excel`, 'statistiques_generales.xlsx'),
    
    exportOverallStatisticsCsv: () => 
        downloadFile(`${API_BASE_URL}/export/overall/csv`, 'statistiques_generales.csv'),

    // Questionnaire Statistics Exports
    exportQuestionnaireStatisticsPdf: (publicationId) => 
        downloadFile(`${API_BASE_URL}/export/questionnaire/${publicationId}/pdf`, `analyse_questionnaire_${publicationId}.pdf`),
    
    exportQuestionnaireStatisticsExcel: (publicationId) => 
        downloadFile(`${API_BASE_URL}/export/questionnaire/${publicationId}/excel`, `analyse_questionnaire_${publicationId}.xlsx`),
    
    exportQuestionnaireStatisticsCsv: (publicationId) => 
        downloadFile(`${API_BASE_URL}/export/questionnaire/${publicationId}/csv`, `analyse_questionnaire_${publicationId}.csv`),

    // Raw Submissions Exports
    exportSubmissionsExcel: (publicationId) => 
        downloadFile(`${API_BASE_URL}/export/submissions/${publicationId}/excel`, `donnees_brutes_${publicationId}.xlsx`),
    
    exportSubmissionsCsv: (publicationId) => 
        downloadFile(`${API_BASE_URL}/export/submissions/${publicationId}/csv`, `donnees_brutes_${publicationId}.csv`),

    // Get available formats
    getAvailableFormats: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/export/formats`);
            if (!response.ok) {
                throw new Error('Failed to fetch available formats');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching available formats:', error);
            throw error;
        }
    }
}; 