import { CFormCheck, CFormInput, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../button";
import './styles/index.css';
import { ExportRequisitionModalProps, generateReportRequestSchema } from "./types";

export function RequisitionModal({ visible, title, onClose }: ExportRequisitionModalProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { register, handleSubmit, setValue, watch } = useForm({
        resolver: zodResolver(generateReportRequestSchema)
    });

    function handleCheckAllInGroup(
        groupKeys: Array<GroupKeys>,
        checked: boolean
    ) {
        groupKeys.forEach((key) => setValue(key, checked));
    }

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
                <form>
                    <div className="py-2 flex-col">
                        <div className="flex justify-between container">
                            <div className="mb-3">
                                <div className="flex gap-3 items-center">
                                    <label className="form-label fw-bold text-lg">Campos</label>
                                    <CFormCheck 
                                        id="selectAllCategoryFields"
                                        label="Selecionar todos os campos"
                                        className="opacity-75 text-sm"
                                        checked={Boolean(watch("isProviders")) && Boolean(watch("isGroups")) && Boolean(watch("isDepartments"))}
                                        onChange={(e) => handleCheckAllInGroup(["isProviders", "isGroups", "isDepartments"],  e.target.checked)}
                                    />
                                </div>
                                <div className="flex gap-4 my-2">
                                    <CFormCheck label="Fornecedores" className="text-md" id="isProviders" {...register("isProviders")}/>
                                    <CFormCheck label="Grupos" className="text-md" id="isGroups"  {...register("isGroups")}/>
                                    <CFormCheck label="Departamentos" className="text-md" id="isDepartments"  {...register("isDepartments")}/>
                                </div>
                            </div>
                            <div className="flex mb-3 gap-3 items-center">
                                <div className="input-wrapper">
                                    <label className="form-label text-lg fw-bold">Data inicial</label>
                                    <CFormInput
                                        {...register("startDate")}
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="separator"/>
                                <div className="input-wrapper">
                                    <label className="form-label text-lg fw-bold">Data final</label>
                                    <CFormInput
                                        {...register("endDate")}
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
                                    <CFormCheck
                                        id="selectAllProvidersFields"
                                        label="Selecionar todas opções"
                                        className="opacity-75 text-sm"
                                        checked={Boolean(watch("shouldShowRequisitionByProviders")) && Boolean(watch("shouldShowAllExpensesByProviderInPeriod"))}
                                        onChange={(e) => handleCheckAllInGroup(["shouldShowRequisitionByProviders", "shouldShowAllExpensesByProviderInPeriod"],  e.target.checked)}
                                    />
                                </div>
                                <div className="flex gap-4 my-2">
                                    <CFormCheck label="Exibir requisições feitas por fornecedores"  id="shouldShowRequisitionByProviders" className="text-md" {...register("shouldShowRequisitionByProviders")}/>
                                    <CFormCheck label="Exibir total gasto por fornecedores em um período" id="shouldShowAllExpensesByProviderInPeriod" className="text-md" {...register("shouldShowAllExpensesByProviderInPeriod")}/>
                                </div>
                            </div>
                        </div>
                        <div className="flex container">
                            <div className="mb-3">
                                <div className="flex gap-3 items-center">
                                    <label className="form-label fw-bold text-lg">Departamentos</label>
                                    <CFormCheck 
                                        label="Selecionar todas opções" 
                                        id="selectAllDepartmentsFields" 
                                        className="opacity-75 text-sm"
                                        checked={Boolean(watch("shouldShowHowMuchEachDepartmentSpentWithEachProvider")) && Boolean(watch("shouldShowHowHasBeenSpentedByGroupInDepartments"))}
                                        onChange={(e) => handleCheckAllInGroup(["shouldShowHowMuchEachDepartmentSpentWithEachProvider", "shouldShowHowHasBeenSpentedByGroupInDepartments"],  e.target.checked)}
                                    />
                                </div>
                                <div className="flex gap-4 my-2">
                                    <CFormCheck label="Exibir quanto cada departamento gastou com cada fornecedor" id="shouldShowHowMuchEachDepartmentSpentWithEachProvider" className="text-md" {...register("shouldShowHowMuchEachDepartmentSpentWithEachProvider")}/>
                                    <CFormCheck label="Exibir quanto foi gasto por grupo dentro de departamentos" id="shouldShowHowHasBeenSpentedByGroupInDepartments" className="text-md" {...register("shouldShowHowHasBeenSpentedByGroupInDepartments")}/>
                                </div>
                            </div>
                        </div>
                        <div className="flex container">
                            <div className="mb-3">
                                <div className="flex gap-3 items-center">
                                    <label className="form-label fw-bold text-lg">Grupos</label>
                                    <CFormCheck
                                        label="Selecionar todas opções"
                                        id="selectAllGroupsFields"
                                        className="opacity-75 text-sm"
                                        checked={Boolean(watch("shouldShowValuesSpentedByGroups")) && Boolean(watch("shouldShowDetailedItemsByEachGroup"))}
                                        onChange={(e) => handleCheckAllInGroup(["shouldShowValuesSpentedByGroups", "shouldShowDetailedItemsByEachGroup"],  e.target.checked)}
                                    />
                                </div>
                                <div className="flex gap-4 my-2">
                                    <CFormCheck label="Mostrar os valores gastos por grupos" className="text-md" id="shouldShowValuesSpentedByGroups" {...register("shouldShowValuesSpentedByGroups")}/>
                                    <CFormCheck label="Mostrar itens detalhados por cada grupo" className="text-md" id="shouldShowDetailedItemsByEachGroup" {...register("shouldShowDetailedItemsByEachGroup")}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </CModalBody>
            <CModalFooter>
                <Button variant="outline" label="Cancelar" onClick={onClose}/>
                <Button
                    color="primary"
                    label="Exportar"
                    type="submit"
                    onClick={handleSubmit((data) => console.log(data))}
                />
            </CModalFooter>
        </CModal>
    );
}