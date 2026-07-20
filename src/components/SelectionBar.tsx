import React from 'react';
import { Printer, Calendar, CheckSquare, Square, X, Sparkles } from 'lucide-react';
import './SelectionBar.css';

interface SelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onOpenDateFilter: () => void;
  onOpenPrintStudio: () => void;
}

export const SelectionBar: React.FC<SelectionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onOpenDateFilter,
  onOpenPrintStudio
}) => {
  if (selectedCount === 0) return null;

  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="selection-bar-wrapper">
      <div className="selection-info-group">
        <div className="selection-badge">
          <span className="count-pill">{selectedCount}</span>
          <span>foto(s) elegida(s)</span>
        </div>
      </div>

      <div className="selection-actions">
        <button 
          className="selection-action-btn btn-print-active"
          onClick={onOpenPrintStudio}
          title="Abrir Estudio de Impresión con las fotos seleccionadas"
        >
          <Printer size={16} />
          Imprimir Selección ({selectedCount})
        </button>

        <button 
          className="selection-action-btn"
          onClick={onOpenDateFilter}
          title="Filtrar o seleccionar por intervalo de fechas / mes / año"
        >
          <Calendar size={15} />
          Filtrar Fecha
        </button>

        <button 
          className="selection-action-btn"
          onClick={isAllSelected ? onClearSelection : onSelectAll}
          title={isAllSelected ? "Deseleccionar todas" : "Seleccionar todas las fotos visibles"}
        >
          {isAllSelected ? <Square size={15} /> : <CheckSquare size={15} />}
          {isAllSelected ? "Deseleccionar" : "Seleccionar Todo"}
        </button>

        <button 
          className="selection-close-btn"
          onClick={onClearSelection}
          title="Limpiar selección (Esc)"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
