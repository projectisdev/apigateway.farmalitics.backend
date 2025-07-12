import { Request, Response } from 'express';
import db from '../config/db';

export const getAllCountries = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await db.query('CALL sp_GetAllCountries()');
        res.json(rows[0]);
    } catch (error: any) {
        console.error('Error en getAllCountries:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getProvincesByCountry = async (req: Request, res: Response) => {
    const { country_id } = req.params;
    const countryIdNum = Number(country_id);
    if (isNaN(countryIdNum)) {
        return res.status(400).json({ error: 'Invalid country_id parameter' });
    }
    try {
        const [rows]: any = await db.query('CALL sp_GetProvincesByCountry(?)', [countryIdNum]);
        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMunicipalitiesByProvince = async (req: Request, res: Response) => {
    const { province_id } = req.params;
    const provinceIdNum = Number(province_id);
    if (isNaN(provinceIdNum)) {
        return res.status(400).json({ error: 'Invalid province_id parameter' });
    }
    try {
        const [rows]: any = await db.query('CALL sp_GetMunicipalitiesByProvince(?)', [provinceIdNum]);
        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    getAllCountries,
    getProvincesByCountry,
    getMunicipalitiesByProvince,
};
