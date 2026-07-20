import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, Filter, Check } from 'lucide-react';
import { ImageItem } from '../types';
import { toValidDate } from '../utils/dateUtils';
import './DateRangeModal.css';

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageItem[];
  onApplyDateSelection: (matchingImageIds: string[]) => void;
}

export type DatePresetType = 'this_month' | 'last_month' | 'this_year' | 'last_30_days' | 'custom';

export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  isOpen,
  onClose,
  images,
  onApplyDateSelection
}) => {
  const [selectedPreset, setSelectedPreset] = useState<DatePresetType>('this_month');
  
  // Custom Date Range State (YYYY-MM-DD)
  const now = new Date();
  const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const defaultEndDate = now.toISOString().split('T')[0];

  const [startDateStr, setStartDateStr] = useState<string>(defaultStartDate);
  const [endDateStr, setEndDateStr] = useState<string>(defaultEndDate);

  // Filter matching images based on current selection
  const matchingImages = useMemo(() => {
    if (!images || images.length === 0) return [];

    const currentDate = new Date();
    let startTime = 0;
    let endTime = Infinity;

    if (selectedPreset === 'this_month') {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      startTime = firstDay.getTime();
      endTime = currentDate.getTime();
    } else if (selectedPreset === 'last_month') {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59);
      startTime = firstDay.getTime();
      endTime = lastDay.getTime();
    } else if (selectedPreset === 'this_year') {
      const firstDay = new Date(currentDate.getFullYear(), 0, 1);
      startTime = firstDay.getTime();
      endTime = currentDate.getTime();
    } else if (selectedPreset === 'last_30_days') {
      startTime = currentDate.getTime() - 30 * 24 * 60 * 60 * 1000;
      endTime = currentDate.getTime();
    } else if (selectedPreset === 'custom') {
      if (startDateStr) {
        const start = new Date(`${startDateStr}T00:00:00`);
        if (!isNaN(start.getTime())) startTime = start.getTime();
      }
      if (endDateStr) {
        const end = new Date(`${endDateStr}T23:59:59`);
        if (!isNaN(end.getTime())) endTime = end.getTime();
      }
    }

    return images.filter(img => {
      const time = toValidDate(img.date).getTime();
      return time >= startTime && time <= endTime;
    });
  }, [images, selectedPreset, startDateStr, endDateStr]);

  if (!isOpen) return null;

  const handleApply = () => {
    const ids = matchingImages.map(img => img.id);
    onApplyDateSelection(ids);
    onClose();
  };

  return (
    <div className="date-modal-backdrop" onClick={onClose}>
      <div className="date-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="date-modal-header">
          <h2>
            <Calendar size={20} className="preset-icon" />
            Selección por Rango Temporal
          </h2>
          <button className="btn-icon" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="date-modal-body">
          <div className="date-presets-grid">
            <div 
              className={`date-preset-btn ${selectedPreset === 'this_month' ? 'active' : ''}`}
              onClick={() => setSelectedPreset('this_month')}
            >
              <Calendar size={18} className="preset-icon" />
              <div className="preset-text">
                <span className="preset-title">Este Mes</span>
                <span className="preset-desc">Fotos del mes actual</span>
              </div>
            </div>

            <div 
              className={`date-preset-btn ${selectedPreset === 'last_month' ? 'active' : ''}`}
              onClick={() => setSelectedPreset('last_month')}
            >
              <Clock size={18} className="preset-icon" />
              <div className="preset-text">
                <span className="preset-title">Mes Anterior</span>
                <span className="preset-desc">Fotos del mes pasado</span>
              </div>
            </div>

            <div 
              className={`date-preset-btn ${selectedPreset === 'this_year' ? 'active' : ''}`}
              onClick={() => setSelectedPreset('this_year')}
            >
              <Filter size={18} className="preset-icon" />
              <div className="preset-text">
                <span className="preset-title">Este Año ({now.getFullYear()})</span>
                <span className="preset-desc">Fotos de todo el año</span>
              </div>
            </div>

            <div 
              className={`date-preset-btn ${selectedPreset === 'last_30_days' ? 'active' : ''}`}
              onClick={() => setSelectedPreset('last_30_days')}
            >
              <Clock size={18} className="preset-icon" />
              <div className="preset-text">
                <span className="preset-title">Últimos 30 Días</span>
                <span className="preset-desc">Fotos recientes</span>
              </div>
            </div>
          </div>

          {/* Custom Date Range Box */}
          <div 
            className={`custom-range-box ${selectedPreset === 'custom' ? 'active' : ''}`}
            onClick={() => setSelectedPreset('custom')}
            style={{ cursor: 'pointer' }}
          >
            <div className="custom-range-title">Rango de Fechas Personalizado</div>
            <div className="range-inputs-row">
              <div>
                <label>Desde Fecha</label>
                <input 
                  type="date" 
                  className="date-picker-input"
                  value={startDateStr}
                  onChange={(e) => {
                    setSelectedPreset('custom');
                    setStartDateStr(e.target.value);
                  }}
                />
              </div>

              <div>
                <label>Hasta Fecha</label>
                <input 
                  type="date" 
                  className="date-picker-input"
                  value={endDateStr}
                  onChange={(e) => {
                    setSelectedPreset('custom');
                    setEndDateStr(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="date-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>

          <button 
            className="btn btn-primary"
            onClick={handleApply}
            disabled={matchingImages.length === 0}
          >
            <Check size={16} />
            Seleccionar {matchingImages.length} foto(s)
          </button>
        </div>
      </div>
    </div>
  );
};
