import { Router, Request, Response } from 'express';
import medicineType from '../controllers/medicinetype.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: MedicineType
 *     description: API for managing medicine types
 */

/**
 * @swagger
 * /medicine-type:
 *   post:
 *     summary: Create a new medicine type
 *     tags: [MedicineType]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - risk_level
 *             properties:
 *               name:
 *                 type: string
 *                 example: Analgésico
 *               risk_level:
 *                 type: string
 *                 enum: [Ninguno, Bajo, Medio, Alto]
 *                 example: Bajo
 *     responses:
 *       201:
 *         description: Medicine type created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/medicine-types', (req: Request, res: Response) => {
  medicineType.createMedicineType(req, res);
});

/**
 * @swagger
 * /medicine-type:
 *   get:
 *     summary: Create a new medicine type
 *     tags: [MedicineType]
 *     responses:
 *       200:
 *         description: List of medicine types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   medicine_type_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   risk_level:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 */
router.get('/medicine-types', (req: Request, res: Response) => {
  medicineType.getAllMedicineTypes(req, res);
});

/**
 * @swagger
 * /medicine-type/{id}:
 *   delete:
 *     summary: Eliminar un tipo de medicina por ID
 *     tags: [MedicineType]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de medicina
 *     responses:
 *       200:
 *         description: Tipo de medicina eliminado correctamente
 *       500:
 *         description: Error interno del servidor
 */

router.delete('/medicine-type/:id', (req: Request, res: Response) => {
  medicineType.deleteMedicineType(req, res);
});


export default router;
