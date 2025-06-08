import React, { useState } from 'react';
import { FaDownload, FaFilePdf, FaFileExcel, FaFileCsv, FaSpinner, FaChevronDown } from 'react-icons/fa';
import { exportService } from '../../../services/exportApi';

const ExportButton = ({ 
    type = 'overall', 
    publicationId = null, 
    title = 'Exporter',
    size = 'md',
    variant = 'primary'
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [exportError, setExportError] = useState('');

    const exportOptions = {
        overall: [
            { 
                format: 'pdf', 
                icon: <FaFilePdf className="text-red-500" />, 
                label: 'PDF', 
                action: exportService.exportOverallStatisticsPdf 
            },
            { 
                format: 'excel', 
                icon: <FaFileExcel className="text-green-500" />, 
                label: 'Excel', 
                action: exportService.exportOverallStatisticsExcel 
            },
            { 
                format: 'csv', 
                icon: <FaFileCsv className="text-blue-500" />, 
                label: 'CSV', 
                action: exportService.exportOverallStatisticsCsv 
            }
        ],
        questionnaire: [
            { 
                format: 'pdf', 
                icon: <FaFilePdf className="text-red-500" />, 
                label: 'PDF', 
                action: (id) => exportService.exportQuestionnaireStatisticsPdf(id) 
            },
            { 
                format: 'excel', 
                icon: <FaFileExcel className="text-green-500" />, 
                label: 'Excel', 
                action: (id) => exportService.exportQuestionnaireStatisticsExcel(id) 
            },
            { 
                format: 'csv', 
                icon: <FaFileCsv className="text-blue-500" />, 
                label: 'CSV', 
                action: (id) => exportService.exportQuestionnaireStatisticsCsv(id) 
            }
        ],
        submissions: [
            { 
                format: 'excel', 
                icon: <FaFileExcel className="text-green-500" />, 
                label: 'Excel', 
                action: (id) => exportService.exportSubmissionsExcel(id) 
            },
            { 
                format: 'csv', 
                icon: <FaFileCsv className="text-blue-500" />, 
                label: 'CSV', 
                action: (id) => exportService.exportSubmissionsCsv(id) 
            }
        ]
    };

    const options = exportOptions[type] || exportOptions.overall;

    const handleExport = async (option) => {
        try {
            setIsExporting(true);
            setExportError('');
            setIsDropdownOpen(false);

            if (type === 'overall') {
                await option.action();
            } else {
                await option.action(publicationId);
            }

            // Success feedback could be added here
        } catch (error) {
            console.error('Export failed:', error);
            setExportError(`Erreur d'export: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-1.5 text-sm';
            case 'lg':
                return 'px-6 py-3 text-lg';
            default:
                return 'px-4 py-2 text-base';
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case 'secondary':
                return 'bg-gray-600 hover:bg-gray-700 text-white';
            case 'success':
                return 'bg-green-600 hover:bg-green-700 text-white';
            case 'outline':
                return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent';
            default:
                return 'bg-blue-600 hover:bg-blue-700 text-white';
        }
    };

    return (
        <div className="relative inline-block">
            {/* Main Export Button */}
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isExporting}
                className={`
                    inline-flex items-center space-x-2 font-medium rounded-lg
                    transition-all duration-200 transform hover:scale-105
                    ${getSizeClasses()} ${getVariantClasses()}
                    ${isExporting ? 'opacity-75 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}
                    focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
                `}
            >
                {isExporting ? (
                    <FaSpinner className="animate-spin" />
                ) : (
                    <FaDownload />
                )}
                <span>{isExporting ? 'Export en cours...' : title}</span>
                <FaChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-2">
                        <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            Choisir le format
                        </div>
                        {options.map((option) => (
                            <button
                                key={option.format}
                                onClick={() => handleExport(option)}
                                disabled={isExporting}
                                className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {option.icon}
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {exportError && (
                <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg z-50">
                    <p className="text-sm">{exportError}</p>
                    <button
                        onClick={() => setExportError('')}
                        className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                    >
                        Fermer
                    </button>
                </div>
            )}

            {/* Click outside to close dropdown */}
            {isDropdownOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                />
            )}
        </div>
    );
};

export default ExportButton; 