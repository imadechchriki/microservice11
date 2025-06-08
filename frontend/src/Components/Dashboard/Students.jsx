// src/components/Students.jsx
import React, { useState, useRef } from "react";
import { FaTrash, FaUserEdit, FaPlus, FaCopy, FaFileExcel, FaUpload } from "react-icons/fa";
import { IoFilterOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useStudents } from "../../hooks/useStudents";

/* ------------------- animations déjà présentes ------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function Students() {
  /* --------------------------- état UI --------------------------- */
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    filiere: "",
  });
  const [importFile, setImportFile] = useState(null);
  const fileInputRef = useRef(null);

  /* --------------------- données fournies par hook -------------------- */
  const {
    students,
    profiles,
    loading,
    createStudent,
    editStudent,
    removeStudent,
    importStudents,
  } = useStudents();

  /* ------------------------ Fonctions helpers ------------------------- */
  const filteredStudents = filter
    ? students.filter((s) => 
        s.firstName.toLowerCase().includes(filter.toLowerCase()) ||
        s.lastName.toLowerCase().includes(filter.toLowerCase()) ||
        s.email.toLowerCase().includes(filter.toLowerCase()) ||
        s.filiere.toLowerCase().includes(filter.toLowerCase())
      )
    : students;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Email copié 📋"))
      .catch(() => toast.error("Échec de la copie"));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((p) => ({ ...p, [id]: value }));
  };

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", email: "", filiere: "" });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /* --------------------------- CRUD local --------------------------- */
  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.filiere) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    if (!validateEmail(formData.email)) {
      toast.error("Veuillez saisir une adresse email valide");
      return;
    }

    createStudent(formData);
    setIsAddOpen(false);
    resetForm();
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.filiere) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Veuillez saisir une adresse email valide");
      return;
    }

    editStudent(selectedStudent.id, formData);
    setIsEditOpen(false);
    resetForm();
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      filiere: student.filiere,
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    removeStudent(selectedStudent.id);
    setIsDeleteOpen(false);
    setSelectedStudent(null);
  };

  /* --------------------------- Import Excel --------------------------- */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast.error("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
        return;
      }
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    try {
      await importStudents(importFile);
      setIsImportOpen(false);
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const closeImportModal = () => {
    setIsImportOpen(false);
    setImportFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ------------------------------ Render ------------------------------ */
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="h-full w-full overflow-auto p-6">
        <ToastContainer />

        {/* Header & actions */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
              <span className="text-yellow-500">Gestion</span> des Étudiants
            </h1>
            <div className="flex items-center gap-3">
              {/* FILTRE */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                />
                <IoFilterOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              
              {/* BOUTON IMPORT */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsImportOpen(true)}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all shadow-md"
              >
                <FaFileExcel size={14} /> <span>Importer</span>
              </motion.button>
              
              {/* BOUTON AJOUT */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetForm();
                  setIsAddOpen(true);
                }}
                className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all shadow-md"
              >
                <FaPlus size={12} /> <span>Ajouter</span>
              </motion.button>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-16 h-16 border-t-4 border-yellow-500 border-solid rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement…</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">
                      <th className="px-6 py-4">Nom</th>
                      <th className="px-6 py-4">Prénom</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Filière</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                    <AnimatePresence>
                      {filteredStudents.length ? (
                        filteredStudents.map((student) => (
                          <motion.tr 
                            key={student.id} 
                            variants={rowVariants} 
                            className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {student.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {student.firstName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              <div className="flex items-center">
                                <span className="mr-2">{student.email}</span>
                                <motion.button 
                                  whileHover={{ scale: 1.2 }} 
                                  whileTap={{ scale: 0.9 }} 
                                  onClick={() => copyToClipboard(student.email)} 
                                  className="text-blue-500 hover:text-blue-700" 
                                  title="Copier l'email"
                                >
                                  <FaCopy size={14} />
                                </motion.button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                                {student.filiere}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <motion.div
                                  initial={false}
                                  animate={{ backgroundColor: profiles[student.id] ? "#10B981" : "#EF4444" }}
                                  transition={{ duration: 0.3 }}
                                  className="w-3 h-3 rounded-full mr-2"
                                />
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  profiles[student.id] 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}>
                                  {profiles[student.id] ? "Activé" : "Non activé"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-3">
                                <motion.button 
                                  whileHover={{ scale: 1.1 }} 
                                  whileTap={{ scale: 0.9 }} 
                                  onClick={() => openEditModal(student)} 
                                  className="p-1.5 bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors" 
                                  title="Modifier"
                                >
                                  <FaUserEdit size={16} />
                                </motion.button>
                                <motion.button 
                                  whileHover={{ scale: 1.1 }} 
                                  whileTap={{ scale: 0.9 }} 
                                  onClick={() => openDeleteModal(student)} 
                                  className="p-1.5 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors" 
                                  title="Supprimer"
                                >
                                  <FaTrash size={16} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                            {filter ? "Aucun étudiant trouvé pour cette recherche" : "Aucun étudiant trouvé"}
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </motion.tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* MODAL AJOUT */}
        <AnimatePresence>
          {isAddOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                transition={{ type: "spring", damping: 20 }} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Ajouter un étudiant
                  </h2>
                  <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="filiere" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Filière
                      </label>
                      <input
                        type="text"
                        id="filiere"
                        value={formData.filiere}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => {
                          setIsAddOpen(false);
                          resetForm();
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Annuler
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                      >
                        Ajouter
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL MODIFICATION */}
        <AnimatePresence>
          {isEditOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                transition={{ type: "spring", damping: 20 }} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Modifier l'étudiant
                  </h2>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="filiere" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Filière
                      </label>
                      <input
                        type="text"
                        id="filiere"
                        value={formData.filiere}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => {
                          setIsEditOpen(false);
                          resetForm();
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Annuler
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                      >
                        Modifier
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL SUPPRESSION */}
        <AnimatePresence>
          {isDeleteOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                transition={{ type: "spring", damping: 20 }} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Supprimer l'étudiant
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    Êtes-vous sûr de vouloir supprimer <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong> ?
                    Cette action est irréversible.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setIsDeleteOpen(false);
                        setSelectedStudent(null);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Supprimer
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL IMPORT EXCEL */}
        <AnimatePresence>
          {isImportOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                transition={{ type: "spring", damping: 20 }} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Importer des étudiants
                  </h2>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      <p className="mb-2">Sélectionnez un fichier Excel (.xlsx ou .xls) contenant :</p>
                      <ul className="list-disc list-inside ml-4 text-xs">
                        <li>Colonne "Prénom" </li>
                        <li>Colonne "Nom" </li>
                        <li>Colonne "Email" </li>
                        <li>Colonne "Filière" </li>
                      </ul>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <FaUpload className="text-4xl text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Cliquez pour sélectionner un fichier
                        </span>
                      </label>
                      {importFile && (
                        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900 rounded-md">
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Fichier sélectionné: {importFile.name}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={closeImportModal}
                        className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Annuler
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleImport}
                        disabled={!importFile || loading}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Import...
                          </>
                        ) : (
                          <>
                            <FaFileExcel size={14} />
                            Importer
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}