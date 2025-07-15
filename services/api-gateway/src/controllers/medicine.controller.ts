import { Request, Response } from 'express';
import db from '../config/db';

export const createMedicine = async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    stock,
    medicine_type_id,
    description,
    license_permit,
    validity_due,
  } = req.body;

  try {
    await db.query(
      'CALL sp_CreateMedicine(?, ?, ?, ?, ?, ?)',
      [
        name,
        stock,
        medicine_type_id || null,
        description || null,
        license_permit || 'Sin Licencia',
        validity_due || null,
      ]
    );
    res.status(201).json({ message: 'Medicamento creado correctamente' });
  } catch (error: any) {
    console.error('Error al crear medicamento:', error);
    res.status(500).json({ error: 'Error al crear medicamento' });
  }
};

export default {
  createMedicine
};

