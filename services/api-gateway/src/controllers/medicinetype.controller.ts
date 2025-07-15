import { Request, Response } from 'express';
import db from '../config/db';

export const createMedicineType = async (req: Request, res: Response): Promise<void> => {
  const { name, risk_level } = req.body;

  if (!name || !risk_level) {
    res.status(400).json({ error: 'Los campos name y risk_level son obligatorios' });
    return;
  }

  if (!['Ninguno', 'Bajo', 'Medio', 'Alto'].includes(risk_level)) {
    res.status(400).json({ error: 'El nivel de riesgo debe ser Ninguno, Bajo, Medio o Alto' });
    return;
  }

  try {
    await db.query('CALL sp_CreateMedicineType(?, ?)', [name, risk_level]);
    res.status(201).json({ message: 'Tipo de medicina creado exitosamente' });
  } catch (error: any) {
    console.error('Error en createMedicineType:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllMedicineTypes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.query('CALL sp_GetAllMedicineTypes()');
    res.json(rows[0]);
  } catch (error: any) {
    console.error('Error en getAllMedicineTypes:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMedicineType = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await db.query('CALL sp_DeleteMedicineTypeById(?)', [id]);
    res.json({ message: 'Tipo de medicina eliminado correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export default {
  createMedicineType,
  getAllMedicineTypes,
  deleteMedicineType
};