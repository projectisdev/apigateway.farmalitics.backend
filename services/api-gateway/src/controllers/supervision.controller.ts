import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';


// Obtener todas las supervisiones de farmacia
export const getAllSupervisionPharmacy = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.query('CALL sp_GetAllSupervision_pharmacy()');
    res.json(rows[0]); // El resultado de CALL viene en un array dentro de otro array
  } catch (error: any) {
    console.error('Error en getAllSupervisionPharmacy:', error);
    res.status(500).json({ error: error.message });
  }
};

// Crear una supervision de farmacia
export const createSupervisionPharmacy = async (req: Request, res: Response): Promise<void> => {
  const {
    pharmacy_id,
    supervision_date,
    supervision_time
  } = req.body;

  const supervision_id = uuidv4();

  if (!pharmacy_id || !supervision_date || !supervision_time) {
    res.status(400).json({ error: 'Todos los campos son obligatorios' });
    return;
  }

  try {
    await db.query('CALL sp_CreateSupervision_pharmacy(?, ?, ?, ?)', [
      supervision_id,
      pharmacy_id,
      supervision_date,
      supervision_time
    ]);

    res.status(201).json({
      id: supervision_id,
      message: 'Supervisión creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en createSupervisionPharmacy:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener Supervision de Farmacia por ID

export const getSupervisionPharmacyById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const [rows]: any = await db.query('CALL sp_GetSupervision_pharmacyById(?)', [id]);

    const result = rows[0]; // Resultado del CALL viene anidado

    if (!result || result.length === 0) {
      res.status(404).json({ message: 'Supervisión no encontrada' });
      return;
    }

    res.json(result[0]);
  } catch (error: any) {
    console.error('Error en getSupervisionPharmacyById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar Supervision de Farmacia por ID
export const updateSupervisionPharmacyById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    pharmacy_id,
    supervision_date,
    supervision_time,
    status
  } = req.body;

  if (!pharmacy_id || !supervision_date || !supervision_time || !status) {
    res.status(400).json({ error: 'Todos los campos son obligatorios' });
    return;
  }

  // Validar status válido
  if (!['Pendiente', 'Realizada'].includes(status)) {
    res.status(400).json({ error: 'Status inválido. Debe ser "Pendiente" o "Realizada"' });
    return;
  }

  try {
    await db.query(
      'CALL sp_UpdateSupervision_pharmacyById(?, ?, ?, ?, ?)',
      [id, pharmacy_id, supervision_date, supervision_time, status]
    );
    res.json({ message: 'Supervisión actualizada correctamente' });
  } catch (error: any) {
    console.error('Error en updateSupervisionPharmacyById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar Supervision de Farmacia por ID
export const deleteSupervisionPharmacyById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await db.query('CALL sp_DeleteSupervision_pharmacyById(?)', [id]);
    res.json({ message: 'Supervisión eliminada correctamente' });
  } catch (error: any) {
    console.error('Error en deleteSupervisionPharmacyById:', error);
    res.status(500).json({ error: error.message });
  }
};



export const updateSupervisionPharmacyStatusById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Pendiente', 'Realizada'].includes(status)) {
    res.status(400).json({ error: 'Estado inválido. Debe ser "Pendiente" o "Realizada".' });
    return;
  }

  try {
    await db.query('CALL sp_UpdateSupervision_pharmacyStatusById(?, ?)', [id, status]);
    res.json({ message: `Estado de supervisión actualizado a ${status}` });
  } catch (error: any) {
    console.error('Error en updateSupervisionPharmacyStatusById:', error);
    res.status(500).json({ error: error.message });
  }
};




export default {
  createSupervisionPharmacy,
  getAllSupervisionPharmacy,
  getSupervisionPharmacyById,
  updateSupervisionPharmacyById,
  deleteSupervisionPharmacyById,
  updateSupervisionPharmacyStatusById
};
