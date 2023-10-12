
import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

import { Toolbar } from 'primereact/toolbar';

import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where  } from "firebase/firestore";
import { db } from '../config/firebase';
import {ColumnGroup} from 'primereact/columngroup';
import {Row} from 'primereact/row';
import moment from 'moment'

export const ProtectedContent = ()  => {
    let emptyMovement = {
        id: null,
        concepto: "",
        ingreso: 0,
        egreso: 0,
        fecha: new Date()
    };

    const [movements, setMovements] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [movement, setMovement] = useState(emptyMovement);
    const [selectedMovements, setselectedMovements] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0)
    const [dateTo, setDateTo] = useState(new Date())
    const [dateFrom, setDateFrom] = useState(moment().subtract(1,'month').toDate())

    const toast = useRef(null);
    const dt = useRef(null);

    const getMovements = async () => {
        setLoading(true)
        setTotal(0)

        const q = query(collection(db,"movimientos-caja"), where("fecha", ">=", moment(dateFrom).startOf('day').toDate()), where("fecha", "<=", moment(dateTo).endOf('day').toDate()))  

        await getDocs(q).then((querySnapshot) => {
            const newData = querySnapshot.docs.map(doc => {
                return {...doc.data(), id: doc.id, fecha: new Date(doc.data().fecha.toDate())}
            }) 

            setMovements(newData.map(d => {
                return {
                    ...d,
                    fecha: new Date(d.fecha)
                }
            }))

            let t = 0

            newData.forEach((d) => {
                t = t + (d.ingreso ?? 0) - (d.egreso ?? 0)
            })

            setTotal(t)
            setLoading(false)
         })
    }

    useEffect(() => {
      getMovements()
    }, [dateFrom, dateTo]);


    const openNew = () => {
        setMovement(emptyMovement);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
    };

    const saveProduct = async () => {

        if (!movement.concepto) {
            return toast.current.show({ severity: 'error', summary: 'Error', detail: "Concepto no puede ser vacio", life: 3000 });
        }


        if (!movement.fecha) {
            return toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Fecha no puede ser vacio",
                life: 3000
            })
        }

        if (!movement.ingreso && !movement.egreso) {
            return toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Ingreso o egreso no puede ser vacio",  
            })
        }


        setSubmitted(true);
        setMovements(movements)
        setProductDialog(false)
        
        try {
            let docRef
            if (movement.id) {
                docRef = doc(db, "movimientos-caja", movement.id)
                await updateDoc(docRef, movement)
            } else {
                docRef = await addDoc(collection(db, "movimientos-caja"), movement)
            }


            console.log("Document written with ID: ", docRef.id);
            toast.current.show({
                severity: "success",
                summary: "Successful",
                detail: "Movimiento Creado",
            }) 
        } catch(e) {
            console.log(e)
        }

        setMovement(emptyMovement);
        getMovements()
        
    };

    const editProduct = (product) => {
        setMovement({ ...product });
        setProductDialog(true);
    };

    const confirmDeleteProduct = (product) => {
        setMovement(product);
        setDeleteProductDialog(true);
    };

    const deleteProduct = async () => {

        try {
            setLoading(true)
            setDeleteProductDialog(false);

            const docRef = doc(db, "movimientos-caja", movement.id)
            await deleteDoc(docRef)

            let _movements = movements.filter((val) => val.id !== movement.id);

            setMovements(_movements);
            setMovement(emptyMovement);


            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
            setLoading(false)

        } catch (e) {
            console.log(e)
        } 

    };





    const deleteselectedMovements = () => {
        let _movements = movements.filter((val) => !selectedMovements.includes(val));

        setMovements(_movements);
        setDeleteProductsDialog(false);
        setselectedMovements(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
    };



    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...movement };

        _product[`${name}`] = val;

        setMovement(_product);
    };


    const onInputNumberChange = (e, name) => {
        const val = e.value || 0
        let _product = { ...movement };

        _product[`${name}`] = val;

        setMovement(_product);
    };


    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };





 

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editProduct(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteProduct(rowData)} />
            </React.Fragment>
        );
    };

    const onDateFromChange = (e) => { 
        setDateFrom(e.value)
    }

    const onDateToChange = (e) => {
        setDateTo(e.value)
    }


    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Movimimientos</h4>
            <div className='flex'>
                <div className='mr-3'>
                    <label className='mr-2'>Fecha desde</label>
                    <Calendar dateFormat='dd/mm/yy'
                    value={dateFrom}
                    onChange={(e) => onDateFromChange(e)}>
                    </Calendar>
                </div>
                <div>
                    <label className='mr-2'>Fecha hasta</label>
                    <Calendar dateFormat='dd/mm/yy'
                    value={dateTo}
                    onChange={(e) => onDateToChange(e)}>
                    </Calendar>
                </div>
            </div>
        </div>
    );
    const productDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveProduct} />
        </React.Fragment>
    );
    const deleteProductDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteProduct} />
        </React.Fragment>
    );
    const deleteProductsDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProductsDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteselectedMovements} />
        </React.Fragment>
    );

    const dateTemplate = (rowData) => { 
        return (
            <React.Fragment>
                <Calendar dateFormat='dd/mm/yy' value={rowData.fecha} disabled></Calendar>
            </React.Fragment>
        )
    }

    const moneyTemplate = (amount) => {
        return (
            <React.Fragment>
                <div>
                    {amount?.toLocaleString('es-AR',{style: 'currency', currency: 'ARS'})}
                </div>
            </React.Fragment>
        )
    }

    const footer = (
        <ColumnGroup>
        
            <Row>
                <Column footer="Total:" colSpan={3} footerStyle={{textAlign: 'right'}}/>
                <Column footer={moneyTemplate(total)} />
            </Row>
        
        </ColumnGroup>
    )

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

                <DataTable ref={dt} value={movements} selection={selectedMovements} onSelectionChange={(e) => setselectedMovements(e.value)}
                        dataKey="id"  paginator rows={10} rowsPerPageOptions={[5, 10, 25] } loading={loading} footerColumnGroup={footer}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} movements" globalFilter={globalFilter} header={header}>
                    <Column field="id" header="ID"></Column>
                    <Column field="concepto" header="Concepto"></Column>
                    <Column field="ingreso" body={(rowData) => {return moneyTemplate(rowData.ingreso)}}></Column>
                    <Column field="egreso" body={(rowData) => {return moneyTemplate(rowData.egreso)}}></Column>
                    <Column header="Fecha" body={dateTemplate}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={productDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Product Details" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                
                <div className="field">
                    <label htmlFor="concepto" className="font-bold">
                        Concepto
                    </label>
                    <InputText id="concepto" value={movement.concepto} onChange={(e) => onInputChange(e, 'concepto')} required autoFocus className={classNames({ 'p-invalid': submitted && !movement.concepto })} />
                    {submitted && !movement.concepto && <small className="p-error">Concepto is required.</small>}
                </div>

                <div className="field">
                    <label htmlFor="ingreso" className="font-bold">
                        Ingreso
                    </label>
                    <InputNumber id="ingreso" value={movement.ingreso} onValueChange={(e) => onInputNumberChange(e,"ingreso")} disabled={movement.egreso != 0}>
                    
                    </InputNumber>
               </div>

               <div className="field">
                    <label htmlFor="egreso" className="font-bold">
                        Egreso
                    </label>
                    <InputNumber id="egreso" value={movement.egreso} onValueChange={(e) => onInputNumberChange(e,"egreso")} disabled={movement.ingreso != 0}>
                    
                    </InputNumber>
               </div>


               <div className="field">
                    <label htmlFor="fecha" className="font-bold">
                        Fecha
                    </label>
                    <Calendar id="fecha" value={movement.fecha} onChange={(e) => onInputChange(e,"fecha")} dateFormat='dd/mm/yy'>
                    
                    </Calendar>
               </div>


            </Dialog>

            <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {movement && (
                        <span>
                            Are you sure you want to delete <b>{movement.id}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={deleteProductsDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {movement && <span>Are you sure you want to delete the selected movements?</span>}
                </div>
            </Dialog>
        </div>
    );
}