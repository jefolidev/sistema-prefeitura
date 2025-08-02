import { CFormCheck, CFormInput, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";
import { useEffect, useState } from "react";
import './styles/index.css';
import { ExportRequisitionModalProps } from "./types";

export function RequisitionModal({visible, title, onClose}: ExportRequisitionModalProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const today = new Date();
  
        if (visible) {
            const end = today.toISOString().split('T')[0];
            const start = new Date(today);
            start.setMonth(start.getMonth() - 1);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end);
        }
    }, [visible]);
  
    return (
        <CModal visible={visible} onClose={onClose} backdrop="static" className='modal-lg'>
            <CModalHeader closeButton>
                <CModalTitle>{title || 'Exportar PDF'}</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <div className="py-4 flex-col">
                    <div className="flex justify-between container">
                        <div className="mb-3">
                            <div className="flex gap-3 items-center">
                                <label className="form-label fw-bold text-lg">Campos</label>
                                <CFormCheck label="Selecionar todos os campos" className="opacity-75 text-sm"/>
                            </div>
                            <div className="flex gap-4 my-2">
                                <CFormCheck label="Fornecedores" className="text-md"/>
                                <CFormCheck label="Grupos" className="text-md"/>
                                <CFormCheck label="Departamentos" className="text-md"/>
                            </div>
                        </div>
                        <div className="flex mb-3 gap-3 items-center">
                            <div className="input-wrapper">
                                <label className="form-label text-lg fw-bold">Data inicial</label>
                                <CFormInput
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="separator"/>
                            <div className="input-wrapper">
                                <label className="form-label text-lg fw-bold">Data final</label>
                                <CFormInput
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex container">
                        <div className="mb-3">
                            <div className="flex gap-3 items-center">
                                <label className="form-label fw-bold text-lg">Fornecedores</label>
                                <CFormCheck label="Selecionar todas opções" className="opacity-75 text-sm"/>
                            </div>
                            <div className="flex gap-4 my-2">
                                <CFormCheck label="Exibir requisições feitas por fornecedores" className="text-md"/>
                                <CFormCheck label="Exibir total gasto por fornecedores em um período" className="text-md"/>
                            </div>
                        </div>
                    </div>
                    <div className="flex container">
                        <div className="mb-3">
                            <div className="flex gap-3 items-center">
                                <label className="form-label fw-bold text-lg">Departamentos</label>
                                <CFormCheck label="Selecionar todas opções" className="opacity-75 text-sm"/>
                            </div>
                            <div className="flex gap-4 my-2">
                                <CFormCheck label="Exibir quanto cada departamento gastou com cada fornecedor" className="text-md"/>
                                <CFormCheck label="Exibir quanto foi gasto por grupo dentro de departamentos" className="text-md"/>
                            </div>
                        </div>
                    </div>
                    <div className="flex container">
                        <div className="mb-3">
                            <div className="flex gap-3 items-center">
                                <label className="form-label fw-bold text-lg">Grupos</label>
                                <CFormCheck label="Selecionar todas opções" className="opacity-75 text-sm"/>
                            </div>
                            <div className="flex gap-4 my-2">
                                <CFormCheck label="Mostrar os valores gastos por grupos" className="text-md"/>
                                <CFormCheck label="Mostrar itens detalhados por cada grupo" className="text-md"/>
                            </div>
                        </div>
                    </div>
                </div>
            </CModalBody>
            <CModalFooter>
                <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button
                    className="btn btn-primary"
                    // onClick={() => onExport(startDate, endDate, reportModel)}
                >
                      Exportar
                </button>
            </CModalFooter>
        </CModal>
    );
}