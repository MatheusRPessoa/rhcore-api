import { AppDataSource } from 'src/config/database/data-source';
import {
  cleanupAll,
  createPayroll,
  initTestDataSource,
  payPayroll,
  setupDefaultEmployee,
} from './helpers/payroll.helper';
import { AuthHelper } from 'src/auth/tests/helpers/auth.helper';

describe('PATCH /payroll/:id/pay', () => {
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

  it('deve marcar folha de pagamento como paga com sucesso (200)', async () => {
    const created = await createPayroll();
    const id = created.body.data!.ID;

    const { status, body } = await payPayroll(id);

    expect(status).toBe(200);
    expect(body.succeeded).toBe(true);
    expect(body.data?.STATUS_FOLHA).toBe('PAGO');
    expect(body.message).toBe(
      'Folha de pagamento marcada como paga com sucesso.',
    );
  });

  it('deve retornar 400 quando folha de pagamento já foi paga', async () => {
    const created = await createPayroll({ MES_REFERENCIA: 5 });
    const id = created.body.data!.ID;

    await payPayroll(id);
    const { status, body } = await payPayroll(id);

    expect(status).toBe(400);
    expect(body.succeeded).toBe(false);
  });

  it('deve retornar 404 quando a folha de pagamento não existe', async () => {
    const { status, body } = await payPayroll(
      '00000000-0000-0000-0000-000000000000',
    );

    expect(status).toBe(404);
    expect(body.succeeded).toBe(false);
  });

  it('deve retornar 401 quando não autenticado', async () => {
    const { status, body } = await payPayroll(
      '00000000-0000-0000-0000-000000000000',
      false,
    );

    expect(status).toBe(401);
    expect(body.succeeded).toBe(false);
  });
});
