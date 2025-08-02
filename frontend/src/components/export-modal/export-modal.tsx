import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CFormInput, CFormSelect } from '@coreui/react';
import { useEffect, useState } from 'react';

interface ExportModalProps {
    visible: boolean;
    onClose: () => void;
    onExport: (startDate: string, endDate: string, reportModel: string) => void;
    title?: string;
}

const ExportModal = ({ visible, onClose, onExport, title }: ExportModalProps) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportModel, setReportModel] = useState('');

    useEffect(() => {
        const today = new Date();

        if (visible) {
            const end = today.toISOString().split('T')[0];
            const start = new Date(today);
            start.setMonth(start.getMonth() - 1);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end);
            setReportModel('');
        }
    }, [visible]);

    return (
        <CModal visible={visible} onClose={onClose} backdrop="static" className='modal-lg'>
            <CModalHeader closeButton>
                <CModalTitle>{title || 'Exportar PDF'}</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <div className="mb-3">
                    <label className="form-label">Selecione o modelo de relatório</label>
                    <CFormSelect
                        id="reportModel"
                        className="mb-2"
                        defaultValue=""
                        onChange={(e) => setReportModel(e.target.value)}
                        value={reportModel}
                    >
                        <option value="">Padrão (Nº, Descrição, Fornecedor, Quantidade, Preço)</option>
                        <option value="model1">Modelo 1 (Nº, Data, Descrição, Grupo, Quantidade, Preço)</option>
                        <option value="model2">Modelo 2 (Nº, Data, Descrição, Fornecedor, Grupo, Quantidade, Preço)</option>
                        <option value="model3">Modelo 3 (Nº, Data/Hora, Descrição, Quantidade, Preço)</option>
                        <option value="model4">Modelo 4 (Nº, Descrição, Usuário, Quantidade, Preço)</option>
                        <option value="model5">Modelo 5 (Nº, Descrição, Fornecedor, Usuário, Quantidade, Preço)</option>
                    </CFormSelect>
                </div>
                <div className="mb-3">
                    <label className="form-label">Data inicial</label>
                    <CFormInput
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="form-label">Data final</label>
                    <CFormInput
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </div>
            </CModalBody>
            <CModalFooter>
                <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button
                    className="btn btn-primary"
                    onClick={() => onExport(startDate, endDate, reportModel)}
                >
                    Exportar
                </button>
            </CModalFooter>
        </CModal>
    );
};

export default ExportModal;
