import { Router } from 'express';
import { check } from 'express-validator';
import { validateJWT } from '../middlewares/validate-jwt.js';
import { hasRole } from '../middlewares/validate-role.js';
import { validateInvoiceData } from '../middlewares/validate-invoice-data.js';
import { validateInvoice } from '../middlewares/validate-invoice.js';
import { generateInvoice, paidInvoice, getInvoices, getTotalIncome, getMontlyIncome} from './invoice.controller.js';

const router = Router();

router.post(
    '/generateInvoice',
    [
        validateJWT,
        hasRole('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
        validateInvoiceData
    ],
    generateInvoice
)

router.put(
    '/paidInvoice/:id',
    [
        validateJWT,
        hasRole('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
        check('id', 'Invalid ID').isMongoId(),
        validateInvoice
    ],
    paidInvoice
)

router.get(
    '/',
    [
        validateJWT,
        hasRole('ADMIN_ROLE', 'EMPLOYEE_ROLE')
    ],
    getInvoices
)

router.get(
    '/income',
    getTotalIncome
)

router.get(
    '/moonthlyincome',
    getMontlyIncome
)

export default router;