import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';

// Opcional: Define una interfaz para el modelo Pharmacy
interface Pharmacy {
  pharmacy_id: string;
  name: string;
  legal_identity: string;
  phone: string;
  email: string;
  country_id?: number;
  province_id?: number;
  municipality_id?: number;
  address: string;
  pharmacy_type?: string;
  number_of_employees?: number;
  opening_date?: string;
  status?: string;
}

// Listar farmacias
export const getAllPharmacies = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await db.query('CALL sp_GetAllPharmacies()');
    res.json(rows[0]);
  } catch (error: any) {
    console.error('Error en getAllPharmacies:', error);
    res.status(500).json({ error: error.message });
  }
};

// Crear farmacia
export const createPharmacy = async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    legal_identity,
    phone,
    email,
    country_id,
    province_id,
    municipality_id,
    address,
    pharmacy_type = 'Retail',
    number_of_employees,
    opening_date,
    status = 'Activa'
  } = req.body;

  const pharmacy_id: string = uuidv4();

  try {
    await db.query(
      `CALL sp_CreatePharmacy(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pharmacy_id,
        name ?? null,
        legal_identity ?? null,
        phone ?? null,
        email ?? null,
        country_id ?? null,
        province_id ?? null,
        municipality_id ?? null,
        address ?? null,
        pharmacy_type ?? 'Retail',
        number_of_employees ?? null,
        opening_date ?? null,
        status ?? 'Activa'
      ]
    );
    res.status(201).json({ id: pharmacy_id, message: 'Farmacia creada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener farmacia por ID
export const getPharmacyById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [rows]: any = await db.query('CALL sp_GetPharmacyById(?)', [id]);
    
    const result = rows[0]; // Importante: los resultados de CALL vienen en un array doble

    if (!result || result.length === 0) {
      res.status(404).json({ message: 'Farmacia no encontrada' });
      return;
    }
    
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar farmacia
export const updatePharmacyById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    name,
    legal_identity,
    phone,
    email,
    country_id,
    province_id,
    municipality_id,
    address,
    pharmacy_type = 'Retail',
    number_of_employees,
    opening_date,
    status = 'Activa'
  } = req.body;

  try {
    await db.query(
      `CALL sp_UpdatePharmacyById(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name ?? null,
        legal_identity ?? null,
        phone ?? null,
        email ?? null,
        country_id ?? null,
        province_id ?? null,
        municipality_id ?? null,
        address ?? null,
        pharmacy_type ?? 'Retail',
        number_of_employees ?? null,
        opening_date ?? null,
        status ?? 'Activa'
      ]
    );
    res.json({ message: 'Farmacia actualizada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};



// Eliminar farmacia físicamente
export const deletePharmacy = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await db.query('CALL sp_DeletePharmacyById(?)', [id]);
    res.json({ message: 'Farmacia eliminada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Activar o Inactivar farmacia
export const updatePharmacyStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body; 

  if (!['Activa', 'Inactiva'].includes(status)) {
    res.status(400).json({ error: 'Estado inválido. Debe ser "Activa" o "Inactiva"' });
    return;
  }

  try {
    await db.query('CALL sp_UpdatePharmacyStatusById(?, ?)', [id, status]);
    res.json({ message: `Farmacia actualizada a estado ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Exporta el controlador
export default {
  getAllPharmacies,
  createPharmacy,
  getPharmacyById,
  updatePharmacyById,
  deletePharmacy,
  updatePharmacyStatus
};