import { AppDataSource } from 'src/config/database/data-source';
import {
  cleanupAll,
  createRequest,
  getRequestById,
  initTestDataSource,
  setupDefaultEmployee,
} from './helpers/request.helper';
import { AuthHelper } from 'src/auth/tests/helpers/auth.helper';

describe('GET /requests/:id', () => {
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

  it('deve buscar solicitação por ID com sucesso (200)', async () => {
    const created = await createRequest();
    const id = created.body.data!.ID;

    const { status, body } = await getRequestById(id);

    expect(status).toBe(200);
    expect(body.succeeded).toBe(true);
    expect(body.data?.ID).toBe(id);
    expect(body.message).toBe('Solicitação encontrada com sucesso.');
  });

  it('deve retornar 404 quando solicitação não existe', async () => {
    const { status, body } = await getRequestById(
      '00000000-0000-0000-0000-000000000000',
    );

    expect(status).toBe(404);
    expect(body.succeeded).toBe(false);
  });

  it('deve retornar 401 quando não autenticado', async () => {
    const { status, body } = await getRequestById(
      '00000000-0000-0000-0000-000000000000',
      false,
    );

    expect(status).toBe(401);
    expect(body.succeeded).toBe(false);
  });
});
