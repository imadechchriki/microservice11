import React from "react";
import { FaUsers, FaClipboardList, FaComments, FaChartBar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from "../images/HomePage/Eval.png";

function Sidebar(){
    return(
        <div className="flex h-screen ">
        <div className="bg-gradient-to-b from-blue-700 to-blue-900 text-white w-64 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-center mb-30">
              <img src={logo} alt="Logo" className="w-48 h-auto text-center " />
            </div>
      
            <nav>
            <ul className="space-y-6 text-lg font-bold " style={{ fontFamily:"Sofia, sans-serif"}}>
            <li className="flex items-center space-x-3 hover:opacity-80 " >
                <a className="text-yellow-400"><FaUsers /></a>
                <a href="/admin/ens">Enseignats</a>
            </li>
            <li className="flex items-center space-x-3 hover:opacity-80 " >
                <a className="text-yellow-400"><FaUsers /></a>
                <a href="/admin/etud">Etudiants</a>
            </li>
            <li className="flex items-center space-x-3 hover:opacity-80 " >
                <a className="text-yellow-400"><FaUsers /></a>
                <a href="/admin/pro">Professionnel</a>
            </li>
            <li className="flex items-center space-x-3 hover:opacity-80">
            <a className="text-yellow-400"><FaClipboardList /></a>
                <a href="/admin/questionnaire">Questionnaire</a>
            </li>
            <li className="flex items-center space-x-3 hover:opacity-80">
            <a className="text-yellow-400"><FaComments /></a>
                <a href="/admin/retours">Les retours</a>
            </li>
            <li className="flex items-center space-x-3 hover:opacity-80">
            <a className="text-yellow-400"><FaChartBar /></a>
                <a href="/admin/statistics">Statistiques</a>
            </li>
            </ul>

          </nav>
          </div>
      
          <Link to="/login">
            <button className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-300 w-full">
              Se déconnecter
            </button>
          </Link>
        </div>
      
        
      </div>
      
    )
}
export default Sidebar;