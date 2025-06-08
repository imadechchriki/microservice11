// src/Components/Dashboard/Templates.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { FaPlus, FaTrash, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

import Sidebar from "./Sidebar";
import { useTemplates } from "../../hooks/useTemplates";
import { useFilieres } from "../../hooks/useFilieres";

export default function Templates() {
  /* ─── template hook ─── */
  const {
    templates,
    loading: tplLoading,
    loadTemplates,
    addTemplate,
    removeTemplate
  } = useTemplates();

  /* ─── filière hook ─── */
  const {
    filieres,
    loading: filLoading
  } = useFilieres();

  /* ─── local state ─── */
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    templateCode: "",
    filiereId: "",
    role: "Professor",
    title: ""
  });

  /* ─── initial load ─── */
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  /* ─── handlers ─── */
  const handleCreate = async (e) => {
    e.preventDefault();
    // payload shape expected by API:
    const payload = {
      templateCode: form.templateCode,
      filiereId: Number(form.filiereId),
      role: form.role,
      title: form.title
    };
    const ok = await addTemplate(payload);
    if (ok !== false) {
      setShowNew(false);
      setForm({ templateCode: "", filiereId: "", role: "Professor", title: "" });
    }
  };

  const list = Array.isArray(templates) ? templates : [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <ToastContainer />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Templates
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow"
          >
            <FaPlus size={14} /> Nouveau
          </motion.button>
        </div>

        {/* List */}
        {tplLoading ? (
          <p>Chargement…</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white dark:bg-gray-800 p-4 rounded shadow"
              >
                <h3 className="font-semibold text-lg mb-1">{tpl.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Code : {tpl.templateCode}
                  <br />
                  Filière : {tpl.filiereId}
                  <br />
                  Rôle : {tpl.role}
                  <br />
                  Statut :
                  <span
                    className={
                      tpl.status === "Published"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {" " + tpl.status}
                  </span>
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/questionnaire/${tpl.id}/edit`}
                    className="flex-1 py-1 bg-blue-600 text-white rounded flex items-center justify-center gap-1"
                  >
                    <FaArrowRight /> Éditer
                  </Link>
                  {tpl.status === "Draft" && (
                    <button
                      onClick={() => removeTemplate(tpl.id)}
                      className="p-2 bg-red-100 text-red-600 rounded"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Template Modal */}
        {showNew && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded w-96">
              <h2 className="text-lg font-semibold mb-4">Nouveau template</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <input
                  className="input w-full"
                  placeholder="Code template"
                  value={form.templateCode}
                  onChange={(e) =>
                    setForm({ ...form, templateCode: e.target.value })
                  }
                  required
                />
                <input
                  className="input w-full"
                  placeholder="Titre"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <select
                  className="input w-full"
                  value={form.filiereId}
                  onChange={(e) =>
                    setForm({ ...form, filiereId: e.target.value })
                  }
                  disabled={filLoading}
                  required
                >
                  <option value="">Sélectionnez une filière</option>
                  {filieres.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code} – {f.title}
                    </option>
                  ))}
                </select>
                <select
                  className="input w-full"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Professor">Professor</option>
                  <option value="Professional">Professional</option>
                  <option value="Student">Student</option>
                </select>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNew(false)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-yellow-500 text-white rounded"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
