import { Router, Request, Response } from 'express';
import pharmacyController from '../controllers/pharmacy.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Pharmacies
 *     description: API for pharmacy management
 */

/**
 * @swagger
 * /pharmacies:
 *   get:
 *     summary: Get all pharmacies
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (Activa, Inactiva)
 *     responses:
 *       200:
 *         description: List of pharmacies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   pharmacy_id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   legal_identity:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   country_id:
 *                     type: integer
 *                   province_id:
 *                     type: integer
 *                   municipality_id:
 *                     type: integer
 *                   address:
 *                     type: string
 *                   pharmacy_type:
 *                     type: string
 *                   number_of_employees:
 *                     type: integer
 *                   opening_date:
 *                     type: string
 *                     format: date
 *                   status:
 *                     type: string
 */
router.get('/pharmacies', (req: Request, res: Response) => {
  pharmacyController.getAllPharmacies(req, res);
});

/**
 * @swagger
 * /pharmacies:
 *   post:
 *     summary: Create a new pharmacy
 *     tags: [Pharmacies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - legal_identity
 *               - phone
 *               - email
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: Farmacia Central
 *               legal_identity:
 *                 type: string
 *                 example: RNC123456789
 *               phone:
 *                 type: string
 *                 example: "+1 809 555 1234"
 *               email:
 *                 type: string
 *                 example: contacto@farmaciacentral.com
 *               country_id:
 *                 type: integer
 *                 example: 1
 *               province_id:
 *                 type: integer
 *                 example: 2
 *               municipality_id:
 *                 type: integer
 *                 example: 3
 *               address:
 *                 type: string
 *                 example: Av. Principal 123
 *               pharmacy_type:
 *                 type: string
 *                 example: Retail
 *               number_of_employees:
 *                 type: integer
 *                 example: 10
 *               opening_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               status:
 *                 type: string
 *                 example: Activa
 *     responses:
 *       201:
 *         description: Pharmacy created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "a1b2c3d4-e5f6-7890-abcd-1234567890ef"
 *                 message:
 *                   type: string
 *                   example: Farmacia creada
 */
router.post('/pharmacies', (req: Request, res: Response) => {
  pharmacyController.createPharmacy(req, res);
});

/**
 * @swagger
 * /pharmacies/{id}:
 *   get:
 *     summary: Get pharmacy by ID
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Pharmacy ID (UUID)
 *     responses:
 *       200:
 *         description: Pharmacy details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pharmacy_id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 legal_identity:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *                 country_id:
 *                   type: integer
 *                 province_id:
 *                   type: integer
 *                 municipality_id:
 *                   type: integer
 *                 address:
 *                   type: string
 *                 pharmacy_type:
 *                   type: string
 *                 number_of_employees:
 *                   type: integer
 *                 opening_date:
 *                   type: string
 *                   format: date
 *                 status:
 *                   type: string
 *       404:
 *         description: Pharmacy not found
 */
router.get('/pharmacies/:id', (req: Request, res: Response) => {
  pharmacyController.getPharmacyById(req, res);
});

/**
 * @swagger
 * /pharmacies/{id}:
 *   put:
 *     summary: Update an existing pharmacy
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Pharmacy ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               legal_identity:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               country_id:
 *                 type: integer
 *                 nullable: true
 *               province_id:
 *                 type: integer
 *                 nullable: true
 *               municipality_id:
 *                 type: integer
 *                 nullable: true
 *               address:
 *                 type: string
 *                 nullable: true
 *               pharmacy_type:
 *                 type: string
 *                 enum: [Retail, Hospitalaria]
 *                 default: Retail
 *               number_of_employees:
 *                 type: integer
 *                 nullable: true
 *               opening_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [Activa, Inactiva]
 *                 default: Activa
 *     responses:
 *       200:
 *         description: Pharmacy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pharmacy updated
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.put('/pharmacies/:id', (req: Request, res: Response) => {
  pharmacyController.updatePharmacyById(req, res);
});


/**
 * @swagger
 * /pharmacies/{id}:
 *   delete:
 *     summary: Delete pharmacy physically
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Pharmacy ID (UUID)
 *     responses:
 *       200:
 *         description: Pharmacy deleted
 */
router.delete('/pharmacies/:id', (req: Request, res: Response) => {
  pharmacyController.deletePharmacy(req, res);
});

/**
 * @swagger
 * /pharmacies/{id}/status:
 *   put:
 *     summary: Update pharmacy status (activate or deactivate)
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Pharmacy ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Activa, Inactiva]
 *                 description: New status of the pharmacy
 *             example:
 *               status: "Inactiva"
 *     responses:
 *       200:
 *         description: Pharmacy status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Farmacia actualizada a estado Inactiva"
 *       400:
 *         description: Invalid status provided
 *       500:
 *         description: Server error
 */
router.put('/pharmacies/:id/status', (req: Request, res: Response) => {
  pharmacyController.updatePharmacyStatus(req, res);
});


export default router;
