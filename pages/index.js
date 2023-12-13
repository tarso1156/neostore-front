import React, { useState, useEffect, useRef } from 'react';

import { SupplierService } from './services/SupplierService';

import { Field, Form } from 'react-final-form';

import { InputMask } from 'primereact/inputmask';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { classNames } from 'primereact/utils';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { TabPanel, TabView } from 'primereact/tabview';

export default function Home() {
    const staleFormData = { name: '', email: '', description: '', cnpj: '' };
    const toast = useRef(null);

    const [suppliers, setSuppliers] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [first, setFirst] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [dialogFormVisible, setDialogFormVisible] = useState(false);
    const [initialFormValues, setInitialFormValues] = useState(staleFormData);
    const [onEditMode, setOnEditMode] = useState(false);
    const [suppliersJson, setSuppliersJson] = useState(``);

    async function getSuppliersData(pageNumber) {
        const s = await SupplierService.getSuppliers(pageNumber);
        setSuppliers(s.data.records ?? []);
        setTotalRecords(s.data.total_records ?? 0);
    }

    const onPageChange = (event) => {
        setFirst(event.page * 5);
        setPageNumber(event.page);
        getSuppliersData(event.page + 1);
    };

    useEffect(() => {
        getSuppliersData(1);
    }, []);

    const newSupplier = () => {
        setOnEditMode(false);
        setDialogFormVisible(true);
        setInitialFormValues(staleFormData);
    }

    const acceptDeletion = async (rowData) => {
        await SupplierService.deleteSupplier(rowData.id);
        getSuppliersData(pageNumber);
        toast.current.show({ severity: 'success', summary: 'Deletado', detail: 'Fornecedor deletado com sucesso!', life: 4000 });
    };

    const modifySupplier = (event, rowData) => {
        setOnEditMode(true);
        setDialogFormVisible(true);
        setInitialFormValues(rowData);
    };

    const deleteSupplier = (event, rowData) => {
        confirmPopup({
            target: event.currentTarget,
            message: 'Deseja realmente excluir este fornecedor?',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => acceptDeletion(rowData)
        });
    };

    const editActions = (rowData) => {
        return <div style={{ display: "flex" }}>
            <Button type="button" icon="pi pi-pencil" className="p-button-sm p-button-text" onClick={($event) => modifySupplier($event, rowData)} />
            <Button type="button" icon="pi pi-trash" className="p-button-sm p-button-text" onClick={($event) => deleteSupplier($event, rowData)} />
        </div>;
    };

    const dataTableHeader = (
        <div className="flex flex-column md:flex-row md:align-items-center justify-content-between">
            <span className="p-input-icon-left w-full md:w-auto"></span>
            <div className="mt-3 md:mt-0 flex justify-content-end">
                <Button icon="pi pi-plus" className="mr-2 p-button-rounded" onClick={newSupplier} tooltip="Incluir" tooltipOptions={{ position: 'bottom' }} />
            </div>
        </div>
    );

    const onSubmit = async (data, form) => {
        try {
            if (data.id) {
                await SupplierService.updateSupplier(data.id, data);
                toast.current.show({ severity: 'success', summary: 'Modificado', detail: 'Fornecedor modificado com sucesso!', life: 4000 });
                getSuppliersData(pageNumber);
            } else {
                await SupplierService.storeSupplier(data);
                toast.current.show({ severity: 'success', summary: 'Cadastrado', detail: 'Fornecedor(res) cadastrado(os) com sucesso!', life: 4000 });
                getSuppliersData(1);
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Falha ao cadastrar o fornecedor', detail: 'Motivo: ' + error.response.data[0].message, life: 4000 });
        }
        form.restart();
        setDialogFormVisible(false);
    };

    const validate = (data) => {
        let errors = {};

        if (!data.name) {
            errors.name = 'Nome é obrigatório';
        }

        if (!data.email) {
            errors.email = 'E-mail é obrigatório';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
            errors.email = 'Endereço de e-mail inválido. Exemplo: exemplo@email.com';
        }

        if (!data.description) {
            errors.description = 'Descrição é obrigatória';
        }

        if (!data.cnpj) {
            errors.cnpj = 'CNPJ é obrigatório';
        } else if (!validarCNPJ(data.cnpj)) {
            errors.cnpj = 'CNPJ inválido. Exemplo: 65.832.247/0001-10';
        }

        return errors;
    };

    const validarCNPJ = (cnpj) => {
        var b = [ 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 ]
        var c = String(cnpj).replace(/[^\d]/g, '')
        
        if(c.length !== 14)
            return false
    
        if(/0{14}/.test(c))
            return false
    
        for (var i = 0, n = 0; i < 12; n += c[i] * b[++i]);
        if(c[12] != (((n %= 11) < 2) ? 0 : 11 - n))
            return false
    
        for (var i = 0, n = 0; i <= 12; n += c[i] * b[i++]);
        if(c[13] != (((n %= 11) < 2) ? 0 : 11 - n))
            return false
    
        return true
    };

    const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
    const getFormErrorMessage = (meta) => {
        return isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>;
    };

    const storeSuppliersFromJson = async () => {
        if (!suppliersJson) {
            toast.current.show({ severity: 'error', summary: 'Importar de JSON', detail: 'JSON não preenchido ou mal formatado', life: 4000 });
            return;
        }
        try {
            await SupplierService.storeSuppliersFromJson(suppliersJson);
            toast.current.show({ severity: 'success', summary: 'Cadastrado', detail: 'Fornecedor(res) cadastrado(os) com sucesso!', life: 4000 });
            getSuppliersData(pageNumber);
            setDialogFormVisible(false);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Falha ao importar de JSON', detail: 'Ocorreram erros na importação', life: 4000 });
        }
    };

    return (
        <div className="surface-card p-4 border-round shadow-2">
            <Toast ref={toast} />
            <ConfirmPopup />
            
            <div className="text-3xl text-800 font-bold mb-4">NeoStore - Cadastro de Fornecedores</div>

            <DataTable value={suppliers} header={dataTableHeader}>
                <Column field="id" header="Id" sortable></Column>
                <Column field="name" header="Nome" sortable></Column>
                <Column field="email" header="E-mail" sortable></Column>
                <Column field="cnpj" header="CNPJ" sortable></Column>
                <Column field="description" header="Descrição" sortable></Column>
                <Column body={editActions}></Column>
            </DataTable>

            <Paginator first={first} rows={5} totalRecords={totalRecords} onPageChange={onPageChange} />

            <Dialog header={onEditMode ? 'Modificado Fornecedor' : 'Selecione uma opção'} visible={dialogFormVisible} onHide={() => setDialogFormVisible(false)}>
                <div className="flex justify-content-center">
                    <TabView>
                        <TabPanel header="Cadastro Manual">
                            <Form onSubmit={onSubmit} initialValues={initialFormValues} validate={validate} render={({ handleSubmit }) => (
                                <form onSubmit={handleSubmit} className="p-fluid">
                                    <Field name="name" render={({ input, meta }) => (
                                        <div className="field" style={{ margin: '1.5rem 0' }}>
                                            <span className="p-float-label">
                                                <InputText id="name" {...input} autoFocus className={classNames({ 'p-invalid': isFormFieldValid(meta) })} />
                                                <label htmlFor="name" className={classNames({ 'p-error': isFormFieldValid(meta) })}>Nome*</label>
                                            </span>
                                            {getFormErrorMessage(meta)}
                                        </div>
                                    )} />
                                    <Field name="email" render={({ input, meta }) => (
                                        <div className="field" style={{ marginBottom: '1.5rem' }}>
                                            <span className="p-float-label">
                                                <InputText id="email" {...input} className={classNames({ 'p-invalid': isFormFieldValid(meta) })} />
                                                <label htmlFor="email" className={classNames({ 'p-error': isFormFieldValid(meta) })}>E-mail*</label>
                                            </span>
                                            {getFormErrorMessage(meta)}
                                        </div>
                                    )} />

                                    <Field name="description" render={({ input, meta }) => (
                                        <div className="field" style={{ marginBottom: '1.5rem' }}>
                                            <span className="p-float-label">
                                                <InputTextarea id="description" {...input} className={classNames({ 'p-invalid': isFormFieldValid(meta) })} />
                                                <label htmlFor="description" className={classNames({ 'p-error': isFormFieldValid(meta) })}>Descrição*</label>
                                            </span>
                                            {getFormErrorMessage(meta)}
                                        </div>
                                    )} />

                                    <Field name="cnpj" render={({ input, meta }) => (
                                        <div className="field" style={{ marginBottom: '1.5rem' }}>
                                            <span className="p-float-label">
                                                <InputMask id="cnpj" {...input} mask="99.999.999/9999-99" autoClear={false} className={classNames({ 'p-invalid': isFormFieldValid(meta) })} />
                                                <label htmlFor="cnpj" className={classNames({ 'p-error': isFormFieldValid(meta) })}>CNPJ*</label>
                                            </span>
                                            {getFormErrorMessage(meta)}
                                        </div>
                                    )} />

                                    <Button type="submit" label="Salvar" className="mt-2" />
                                </form>
                            )} />
                        </TabPanel>
                        <TabPanel header="Importar de JSON" disabled={onEditMode}>
                            <InputTextarea cols={50} rows={10} placeholder="Cole aqui seu JSON para importação" style={{fontFamily: 'monospace'}}
                                onChange={(e) => setSuppliersJson(e.target.value)}></InputTextarea>

                            <div style={{textAlign: 'right'}}>
                                <Button type="button" label="Importar" className="mt-2" onClick={storeSuppliersFromJson}/>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
            </Dialog>
        </div>
    );
}

