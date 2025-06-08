// src/Components/Dashboard/TemplateEditor.jsx
import React, { useEffect, useState }  from "react";
import { useParams, useNavigate }      from "react-router-dom";
import { FaPlus, FaTrash }             from "react-icons/fa";
import { motion }                      from "framer-motion";
import { ToastContainer, toast }       from "react-toastify";

import Sidebar                         from "./Sidebar";
import { useTemplates }                from "../../hooks/useTemplates";
import {
  createSection,
  deleteSection   as apiDeleteSection,
  createQuestion,
  deleteQuestion  as apiDeleteQuestion,
  getSections
} from "../../services/templateService";

/* ------------------------------------------------------------------ */

export default function TemplateEditor() {
  const { id }  = useParams();            // template ID from URL
  const nav     = useNavigate();

  /* main hook -------------------------------------------------------- */
  const {
    templates,
    loadTemplates,
  } = useTemplates();

  /* local state ------------------------------------------------------ */
  const [tpl,       setTpl]       = useState(null);    // template object
  const [sections,  setSections]  = useState([]);      // list of sections
  const [newTitle,  setNewTitle]  = useState("");      // new section title

  /* initial data ----------------------------------------------------- */
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  /* whenever list of templates changes, grab this one */
  useEffect(() => {
    const current = templates.find(t => t.id === +id);
    setTpl(current || null);
  }, [templates, id]);

  /* whenever template is resolved, fetch its sections */
  useEffect(() => {
    if (!tpl) return;
    (async () => {
      try {
        const { data } = await getSections(tpl.id);
        setSections(data);
      } catch {
        toast.error("Impossible de charger les sections");
      }
    })();
  }, [tpl]);

  /* helpers ---------------------------------------------------------- */
  const addSection = async () => {
    if (!newTitle.trim() || !tpl) return;

    const payload = { title: newTitle, displayOrder: sections.length + 1 };

    await createSection(tpl.id, payload)
      .then(() => getSections(tpl.id).then(res => setSections(res.data)))
      .catch(() => toast.error("Ajout de section impossible"));

    setNewTitle("");
  };

  const removeSection = async (sectionId) => {
    if (!tpl) return;

    await apiDeleteSection(tpl.id, sectionId)
      .then(() => setSections(sections.filter(s => s.id !== sectionId)))
      .catch(() => toast.error("Suppression impossible"));
  };

  const addQuestion = async (sectionId, q) => {
    if (!tpl) return;
    await createQuestion(tpl.id, sectionId, q)
      .then(() => refreshSection(sectionId))
      .catch(() => toast.error("Ajout de question impossible"));
  };

  const removeQuestion = async (sectionId, qId) => {
    if (!tpl) return;
    await apiDeleteQuestion(tpl.id, sectionId, qId)
      .then(() => refreshSection(sectionId))
      .catch(() => toast.error("Suppression impossible"));
  };

  const refreshSection = async (sectionId) => {
    const { data } = await getSections(tpl.id);            // quickest: reload all
    setSections(data);
  };

  const publish = async () => {
    // … call your Publish endpoint here (not shown in services) …
    toast.success("Template publié");
    nav("/admin/questionnaire");
  };

  /* render ----------------------------------------------------------- */
  if (!tpl) return <p className="p-6">Chargement…</p>;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto">
        <ToastContainer />

        {/* title + publish btn --------------------------------------- */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{tpl.title}</h1>

          {tpl.status === "Draft" && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={publish}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Publier
            </motion.button>
          )}
        </div>

        {/* all sections ---------------------------------------------- */}
        {sections.map(sec => (
          <SectionCard
            key={sec.id}
            section={sec}
            onDelete={() => removeSection(sec.id)}
            onAddQuestion={payload => addQuestion(sec.id, payload)}
            onDeleteQuestion={qId => removeQuestion(sec.id, qId)}
          />
        ))}

        {/* add section  --------------------------------------------- */}
        <div className="mt-6 flex gap-2">
          <input
            className="input flex-1"
            placeholder="Titre de la nouvelle section"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <button
            onClick={addSection}
            className="bg-yellow-500 text-white px-3 rounded"
          >
            <FaPlus/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* helper component – a single section + its questions                */
function SectionCard({ section, onDelete, onAddQuestion, onDeleteQuestion }) {
  const [showAdd, setShowAdd]   = useState(false);
  const [qForm,   setQForm]     = useState({ wording:"", type:"Likert" });

  const submitQ = async () => {
    if (!qForm.wording.trim()) return;
    await onAddQuestion(qForm);
    setQForm({ wording:"", type:"Likert" });
    setShowAdd(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
      {/* header ------------------------------------------------------ */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">{section.title}</h2>
        <button onClick={onDelete} className="text-red-500" title="Supprimer">
          <FaTrash/>
        </button>
      </div>

      {/* questions list --------------------------------------------- */}
      <ul className="mt-3 space-y-1">
        {section.questions?.map(q => (
          <li key={q.id}
              className="flex justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <span>
              {q.wording}
              <em className="text-xs text-gray-500"> ({q.type})</em>
            </span>
            <button
              onClick={() => onDeleteQuestion(q.id)}
              className="text-red-500"
              title="Supprimer"
            >
              <FaTrash size={14}/>
            </button>
          </li>
        ))}
      </ul>

      {/* add-question area ------------------------------------------ */}
      {showAdd ? (
        <div className="mt-3 flex gap-2">
          <input
            className="input flex-1"
            placeholder="Intitulé de la question"
            value={qForm.wording}
            onChange={e => setQForm({...qForm, wording:e.target.value})}
          />
          <select
            className="input w-32"
            value={qForm.type}
            onChange={e => setQForm({...qForm, type:e.target.value})}
          >
            <option value="Likert">Likert</option>
            <option value="Binary">Binaire</option>
            <option value="Text">Texte</option>
          </select>
          <button
            onClick={submitQ}
            className="bg-yellow-500 text-white px-3 rounded"
          >
            <FaPlus/>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-2 text-sm text-blue-600"
        >
          + Question
        </button>
      )}
    </div>
  );
}
