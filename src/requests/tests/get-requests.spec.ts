import { AppDataSource } from 'src/config/database/data-source';
import {
  cleanupAll,
  createRequest,
  getAllRequests,
  initTestDataSource,
  setupDefaultEmployee,
} from './helpers/request.helper';
import { AuthHelper } from 'src/auth/tests/helpers/auth.helper';

describe('GET /requests', () => {
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

  it('deve listar solicitações com sucesso (200)', async () => {
    await createRequest();
    const { status, body } = await getAllRequests();

    expect(status).toBe(200);
    expect(body.succeeded).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data?.length).toBeGreaterThan(0);
    expect(body.message).toBe('Solicitações listadas com sucesso');
  });

  it('deve retornar 401 quando não autenticado', async () => {
    const response = await fetch('http://localhost:3001/requests', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.succeeded).toBe(false);
  });
});
