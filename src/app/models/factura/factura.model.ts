import { FacturaDetalle } from '../detalle/FacturaDetalle.model';


export interface Factura {
    codigoFactura: number;
    codigoCliente: number;
    tipo: number;
    cliente: string;
    numeroFactura: string;
    importeTotal: string;
    numComprobante: string;
    fecha: Date;    
    estado?: string;
    itemDetalles: FacturaDetalle[];
}
