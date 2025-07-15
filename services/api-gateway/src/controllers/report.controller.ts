import db from '../config/db';
import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';

interface InspectionData {
    success: number;
    message: string;
    pharmacy_id: string;
    pharmacy_name: string;
    legal_identity: string;
    pharmacy_phone: string;
    pharmacy_email: string;
    address: string;
    pharmacy_type: string;
    number_of_employees: number;
    opening_date: string;
    pharmacy_status: string;
    pharmacy_created_at: string;
    pharmacy_updated_at: string;
    inspection_id: string;
    inspector_name: string;
    compliance_classification: string;
    observations: string;
    renewed_license: string;
    inspection_due: string;
    inspection_executed: string;
    inspection_created_at: string;
    inspection_updated_at: string;
    supervision_id: string;
    supervision_date: string;
    supervision_time: string;
    supervision_status: string;
    supervision_created_at: string;
    supervision_updated_at: string;
    medicine_id: number;
    medicine_name: string;
    stock: number;
    medicine_description: string;
    license_permit: string;
    validity_due: string;
    medicine_type_id: number;
    medicine_type_name: string;
    risk_level: string;
    country_id: number;
    country_name: string;
    province_id: number;
    province_name: string;
    municipality_id: number;
    municipality_name: string;
    total_medicines_inspected: number; // ✅ CAMPO AGREGADO
}

export const getReport = async (req: Request, res: Response): Promise<any> => {
    try {
        const [rows]: any = await db.query('CALL sp_get_inspection_by_id(?)', [req.params.id]);
        
        if (!rows[0] || rows[0].length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No se encontraron datos para el ID proporcionado'
            });
        }

        const data: InspectionData = rows[0][0];

        // Verificar que los datos sean válidos
        if (!data.success) {
            return res.status(404).json({
                success: false,
                error: data.message || 'No se encontraron datos'
            });
        }

        // ✅ VALIDACIÓN ADICIONAL: Verificar campos críticos
        console.log('Datos recibidos del SP:', {
            inspection_id: data.inspection_id,
            pharmacy_name: data.pharmacy_name,
            inspector_name: data.inspector_name,
            total_medicines: data.total_medicines_inspected,
            compliance: data.compliance_classification
        });

        // Crear un PDF con PDFKit
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: `Reporte de Farmacia ${data.pharmacy_name}`,
                Author: 'Farmalitics',
                Creator: 'Farmalitics API'
            }
        });
        
        // Capturar el buffer usando streams
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        
        // Crear una promesa para esperar que termine la generación
        const pdfPromise = new Promise<Buffer>((resolve, reject) => {
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);
        });
        
        // ============================================================================
        // CONTENIDO DEL PDF
        // ============================================================================
        
        // Encabezado
        doc.fontSize(24)
           .fillColor('#2c3e50')
           .text('REPORTE DE INSPECCIÓN FARMACÉUTICA', { align: 'center' })
           .fillColor('#000000')
           .moveDown(0.5);
        
        doc.fontSize(12)
           .fillColor('#7f8c8d')
           .text(`Fecha de generación: ${new Date().toLocaleDateString('es-DO')}`, { align: 'center' })
           .text(`ID de Inspección: ${data.inspection_id}`, { align: 'center' })
           .fillColor('#000000')
           .moveDown(2);
        
        // Información de la Farmacia
        doc.fontSize(16)
           .fillColor('#2c3e50')
           .text('INFORMACIÓN DE LA FARMACIA', { underline: true })
           .fillColor('#000000')
           .moveDown(0.5);
        
        const pharmacyInfo = [
            { label: 'Nombre:', value: data.pharmacy_name || 'N/A' },
            { label: 'RNC:', value: data.legal_identity || 'N/A' },
            { label: 'Teléfono:', value: data.pharmacy_phone || 'N/A' },
            { label: 'Email:', value: data.pharmacy_email || 'N/A' },
            { label: 'Dirección:', value: data.address || 'N/A' },
            { label: 'Tipo:', value: data.pharmacy_type || 'N/A' },
            { label: 'Empleados:', value: data.number_of_employees?.toString() || 'N/A' },
            { label: 'Estado:', value: data.pharmacy_status || 'N/A' },
            { label: 'Fecha de Apertura:', value: data.opening_date ? new Date(data.opening_date).toLocaleDateString('es-DO') : 'N/A' }
        ];

        pharmacyInfo.forEach(item => {
            doc.fontSize(11)
               .text(item.label, { continued: true, width: 150 })
               .text(item.value);
        });
        
        doc.moveDown(1.5);

        // Información de Inspección
        doc.fontSize(16)
           .fillColor('#2c3e50')
           .text('DETALLES DE LA INSPECCIÓN', { underline: true })
           .fillColor('#000000')
           .moveDown(0.5);
        
        const inspectionInfo = [
            { label: 'Inspector:', value: data.inspector_name || 'N/A' },
            { label: 'Clasificación:', value: data.compliance_classification || 'N/A' },
            { label: 'Estado de Licencia:', value: data.renewed_license || 'N/A' },
            { label: 'Fecha de Inspección:', value: data.inspection_executed ? new Date(data.inspection_executed).toLocaleString('es-DO') : 'N/A' },
            { label: 'Próxima Inspección:', value: data.inspection_due ? new Date(data.inspection_due).toLocaleDateString('es-DO') : 'N/A' },
            { label: 'Fecha de Supervisión:', value: data.supervision_date ? new Date(data.supervision_date).toLocaleDateString('es-DO') : 'N/A' },
            { label: 'Hora de Supervisión:', value: data.supervision_time || 'N/A' }
        ];

        // ✅ MEJORADO: Agregar color según clasificación
        inspectionInfo.forEach((item, index) => {
            if (index === 1) { // Clasificación
                let classificationColor = '#000000';
                if (data.compliance_classification === 'Cumple') classificationColor = '#27ae60';
                else if (data.compliance_classification === 'Parcial') classificationColor = '#f39c12';
                else if (data.compliance_classification === 'Falta Grave') classificationColor = '#e74c3c';
                
                doc.fontSize(11)
                   .text(item.label, { continued: true, width: 150 })
                   .fillColor(classificationColor)
                   .text(item.value)
                   .fillColor('#000000');
            } else {
                doc.fontSize(11)
                   .text(item.label, { continued: true, width: 150 })
                   .text(item.value);
            }
        });
        
        doc.moveDown(1);

        // Observaciones
        if (data.observations) {
            doc.fontSize(12)
               .fillColor('#2c3e50')
               .text('OBSERVACIONES:', { underline: true })
               .fillColor('#000000')
               .fontSize(11)
               .text(data.observations, { 
                   indent: 20,
                   align: 'justify'
               })
               .moveDown(1.5);
        }

        // ✅ MEJORADO: Información del Medicamento con indicador de total
        if (data.medicine_id) {
            doc.fontSize(16)
               .fillColor('#2c3e50')
               .text('MEDICAMENTO INSPECCIONADO', { underline: true })
               .fillColor('#000000')
               .moveDown(0.3);

            // ✅ NUEVO: Mostrar total de medicamentos inspeccionados
            if (data.total_medicines_inspected && data.total_medicines_inspected > 1) {
                doc.fontSize(10)
                   .fillColor('#7f8c8d')
                   .text(`* Mostrando el primer medicamento de ${data.total_medicines_inspected} medicamentos inspeccionados`)
                   .fillColor('#000000')
                   .moveDown(0.3);
            } else {
                doc.fontSize(10)
                   .fillColor('#7f8c8d')
                   .text(`* Total de medicamentos inspeccionados: ${data.total_medicines_inspected || 1}`)
                   .fillColor('#000000')
                   .moveDown(0.3);
            }

            const medicineInfo = [
                { label: 'Código:', value: data.medicine_id?.toString() || 'N/A' },
                { label: 'Nombre:', value: data.medicine_name || 'N/A' },
                { label: 'Stock:', value: data.stock?.toString() || 'N/A' },
                { label: 'Descripción:', value: data.medicine_description || 'N/A' },
                { label: 'Tipo:', value: data.medicine_type_name || 'N/A' },
                { label: 'Nivel de Riesgo:', value: data.risk_level || 'N/A' },
                { label: 'Licencia Requerida:', value: data.license_permit || 'N/A' },
                { label: 'Fecha de Vencimiento:', value: data.validity_due ? new Date(data.validity_due).toLocaleDateString('es-DO') : 'N/A' }
            ];

            medicineInfo.forEach((item, index) => {
                if (index === 5) { // Nivel de Riesgo
                    let riskColor = '#000000';
                    if (data.risk_level === 'Alto') riskColor = '#e74c3c';
                    else if (data.risk_level === 'Medio') riskColor = '#f39c12';
                    else if (data.risk_level === 'Bajo') riskColor = '#f1c40f';
                    
                    doc.fontSize(11)
                       .text(item.label, { continued: true, width: 150 })
                       .fillColor(riskColor)
                       .text(item.value)
                       .fillColor('#000000');
                } else {
                    doc.fontSize(11)
                       .text(item.label, { continued: true, width: 150 })
                       .text(item.value);
                }
            });
            
            doc.moveDown(1.5);
        }

        // Ubicación
        if (data.country_name) {
            doc.fontSize(16)
               .fillColor('#2c3e50')
               .text('UBICACIÓN', { underline: true })
               .fillColor('#000000')
               .moveDown(0.5);

            const locationInfo = [
                { label: 'País:', value: data.country_name || 'N/A' },
                { label: 'Provincia:', value: data.province_name || 'N/A' },
                { label: 'Municipio:', value: data.municipality_name || 'N/A' }
            ];

            locationInfo.forEach(item => {
                doc.fontSize(11)
                   .text(item.label, { continued: true, width: 150 })
                   .text(item.value);
            });
            
            doc.moveDown(2);
        }

        // Pie de página
        doc.fontSize(8)
           .fillColor('#7f8c8d')
           .text('Reporte generado por Sistema de Control Farmacéutico - Farmalitics', 
                 50, doc.page.height - 50, { align: 'center' })
           .text(`Generado el ${new Date().toLocaleString('es-DO')}`, 
                 50, doc.page.height - 35, { align: 'center' });

        // Finalizar el documento
        doc.end();
        
        // Esperar a que se complete la generación del PDF
        const pdfBuffer = await pdfPromise;
        
        // ============================================================================
        // ENVIAR RESPUESTA
        // ============================================================================
        
        const base64 = pdfBuffer.toString('base64');
        
        // ✅ MEJORADO: Incluir más información en la respuesta
        res.json({
            success: true,
            pdf: base64,
            filename: `inspeccion_${data.pharmacy_name.replace(/\s+/g, '_')}_${data.inspection_id.substring(0, 8)}.pdf`,
            message: 'Reporte generado exitosamente',
            metadata: {
                inspection_id: data.inspection_id,
                pharmacy_name: data.pharmacy_name,
                inspector_name: data.inspector_name,
                total_medicines_inspected: data.total_medicines_inspected,
                compliance_classification: data.compliance_classification,
                inspection_date: data.inspection_executed,
                file_size: pdfBuffer.length
            }
        });
        
    } catch (error: any) {
        console.error('Error en getReport:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};