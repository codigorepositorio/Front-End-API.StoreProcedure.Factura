import { DetalleForAddEdit } from '../detalle/detalleForAddEdit.model';
export interface facturaForAddEdit {
    codigoCliente: number;
    usuarioId: number;
    tipoComprobante: string;
    serieComprobante: string;
    numeroFactura: string;
    fecha: Date;
    impuesto: number;
    subTotal: number;
    estado: string;
    itemDetalles?: DetalleForAddEdit[];
}

