import { Router, Request, Response } from 'express';
import {getReport} from '../controllers/report.controller';

const router = Router();

router.get('/inspection/:id', (req: Request, res: Response) => {
    getReport(req, res);
});

export {router as reportRoutes}