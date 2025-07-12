import { Router, Request, Response } from 'express';
import locationController from '../controllers/location.controller';

const router = Router();

/**
 * @swagger
 * /api/location/countries:
 *   get:
 *     summary: Obtener todos los países
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: Lista de países
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Country'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/countries', (req: Request, res: Response) => {
    locationController.getAllCountries(req, res);
});
/**
 * @swagger
 * /api/location/provinces/{country_id}:
 *   get:
 *     summary: Obtener provincias por país
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: country_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del país
 *     responses:
 *       200:
 *         description: Lista de provincias del país
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Province'
 *       404:
 *         description: País no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/provinces/:country_id', (req: Request, res: Response) => {
    locationController.getProvincesByCountry(req, res);
});

/**
 * @swagger
 * /api/location/municipalities/{province_id}:
 *   get:
 *     summary: Obtener municipios por provincia
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: province_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la provincia
 *     responses:
 *       200:
 *         description: Lista de municipios de la provincia
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Municipality'
 *       404:
 *         description: Provincia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/municipalities/:province_id', (req: Request, res: Response) => {
    locationController.getMunicipalitiesByProvince(req, res);
});



export default router;
