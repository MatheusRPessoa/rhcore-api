import { AppDataSource } from 'src/config/database/data-source';
import {
  cleanupAll,
  createPayroll,
  getPayrollById,
  initTestDataSource,
  setupDefaultEmployee,
} from './helpers/payroll.helper';
import { AuthHelper } from 'src/auth/tests/helpers/auth.helper';

describe('GET /payroll/:id', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
    await setupDefaultEmployee();
  });

  afterAll(async () => {
    await cleanupAll();
    await AppDataSource.destroy();
  });

  it('deve buscar folha de pagamento por ID com sucesso (200)', async () => {
    const created = await createPayroll();
    const id = created.body.data!.ID;

    const { status, body } = await getPayrollById(id);

    expect(status).toBe(200);
    expect(body.succeeded).toBe(true);
    expect(body.data?.ID).toBe(id);
    expect(body.message).toBe('Folha de pagamento encontrada com sucesso.');
  });

  it('deve retornar 404 quando a folha de pagamento não existe', async () => {
    const { status, body } = await getPayrollById(
      '00000000-0000-0000-0000-000000000000',
    );

    expect(status).toBe(404);
    expect(body.succeeded).toBe(false);
  });

  it('deve retornar 401 quando não autenticado', async () => {
    const { status, body } = await getPayrollById(
      '00000000-0000-0000-0000-000000000000',
      false,
    );

    expect(status).toBe(401);
    expect(body.succeeded).toBe(false);
  });
});
