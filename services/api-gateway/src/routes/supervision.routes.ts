import { Router, Request, Response } from 'express';
import supervisionController from '../controllers/supervision.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Supervision
 *     description: API para gestionar supervisiones de farmacias
 */

/**
 * @swagger
 * /supervisions:
 *   get:
 *     summary: Obtener todas las supervisiones de farmacia
 *     tags: [Supervision]
 *     responses:
 *       200:
 *         description: Lista de supervisiones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   supervision_id:
 *                     type: string
 *                     format: uuid
 *                   pharmacy_id:
 *                     type: string
 *                     format: uuid
 *                   pharmacy_name:
 *                     type: string
 *                   supervision_date:
 *                     type: string
 *                     format: date
 *                   supervision_time:
 *                     type: string
 *                     format: time
 *                   status:
 *                     type: string
 *                     enum: [Pendiente, Realizada]
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error del servidor
 */
router.get('/supervisions', (req: Request, res: Response) => {
  supervisionController.getAllSupervisionPharmacy(req, res);
});

/**
 * @swagger
 * /supervisions:
 *   post:
 *     summary: Crear una supervisión de farmacia
 *     tags: [Supervision]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pharmacy_id
 *               - supervision_date
 *               - supervision_time
 *             properties:
 *               pharmacy_id:
 *                 type: string
 *                 format: uuid
 *                 example: "f9e8d7c6-b5a4-3210-9876-abcdef123456"
 *               supervision_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-12"
 *               supervision_time:
 *                 type: string
 *                 format: time
 *                 example: "15:30:00"
 *     responses:
 *       201:
 *         description: Supervisión creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: Supervisión creada exitosamente
 *       400:
 *         description: Faltan campos obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Todos los campos son obligatorios
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/supervisions', (req: Request, res: Response) => {
  supervisionController.createSupervisionPharmacy(req, res);
});

/**
 * @swagger
 * /supervisions/{id}:
 *   get:
 *     summary: Get a pharmacy supervision by ID
 *     tags: [Supervision]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supervision ID
 *     responses:
 *       200:
 *         description: Supervision found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 supervision_id:
 *                   type: string
 *                 pharmacy_id:
 *                   type: string
 *                 supervision_date:
 *                   type: string
 *                   format: date
 *                 supervision_time:
 *                   type: string
 *                   format: time
 *                 status:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                 pharmacy_name:
 *                   type: string
 *       404:
 *         description: Supervision not found
 */
router.get('/supervisions/:id', (req: Request, res: Response) => {
  supervisionController.getSupervisionPharmacyById(req, res);
});

/**
 * @swagger
 * /supervisions/{id}:
 *   put:
 *     summary: Update a pharmacy supervision by ID
 *     tags: [Supervision]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supervision ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pharmacy_id
 *               - supervision_date
 *               - supervision_time
 *               - status
 *             properties:
 *               pharmacy_id:
 *                 type: string
 *                 format: uuid
 *               supervision_date:
 *                 type: string
 *                 format: date
 *               supervision_time:
 *                 type: string
 *                 format: time
 *               status:
 *                 type: string
 *                 enum: [Pendiente, Realizada]
 *     responses:
 *       200:
 *         description: Supervision updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Supervisión actualizada correctamente
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/supervisions/:id', (req: Request, res: Response) => {
  supervisionController.updateSupervisionPharmacyById(req, res);
});

/**
 * @swagger
 * /supervisions/{id}:
 *   delete:
 *     summary: Delete a pharmacy supervision by ID
 *     tags: [Supervision]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supervision ID
 *     responses:
 *       200:
 *         description: Supervision deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Supervisión eliminada correctamente
 *       500:
 *         description: Server error
 */
router.delete('/supervisions/:id', (req: Request, res: Response) => {
  supervisionController.deleteSupervisionPharmacyById(req, res);
});

/**
 * @swagger
 * /supervisions/{id}/status:
 *   put:
 *     summary: Update supervision status
 *     tags: [Supervision]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supervision ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pendiente, Realizada]
 *                 description: New status for the supervision
 *             example:
 *               status: "Realizada"
 *     responses:
 *       200:
 *         description: Supervision status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Estado de supervisión actualizado a Realizada
 *       400:
 *         description: Invalid status provided
 *       500:
 *         description: Server error
 */
router.put('/supervisions/:id/status', (req: Request, res: Response) => {
  supervisionController.updateSupervisionPharmacyStatusById(req, res);
});



export default router;
