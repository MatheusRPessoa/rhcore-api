import { AppDataSource } from 'src/config/database/data-source';
import {
  cleanupAll,
  createEmployee,
  getEmployeeById,
  initTestDataSource,
} from './helpers/employee.helper';
import { AuthHelper } from 'src/auth/tests/helpers/auth.helper';

describe('GET /employees/:id', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
  });

  afterAll(async () => {
    await cleanupAll();
    await AppDataSource.destroy();
  });

  it('deve retornar um funcionário pelo ID (200)', async () => {
    const created = await createEmployee({
      MATRICULA: '2025001',
      CPF: '111.111.111-11',
      EMAIL: 'a@a.com',
    });
    const id = created.body.data!.ID;

    const { status, body } = await getEmployeeById(id);

    expect(status).toBe(200);
    expect(body.succeeded).toBe(true);
    expect(body.data?.ID).toBe(id);
    expect(body.message).toBe('Funcionário encontrado com sucesso.');
  });

  it('deve retornar 404 quando o funcionário não existe', async () => {
    const { status, body } = await getEmployeeById(
      '00000000-0000-0000-0000-000000000000',
    );

    expect(status).toBe(404);
    expect(body.succeeded).toBe(false);
  });

  it('deve retornar 401 quando não autenticado', async () => {
    const { status, body } = await getEmployeeById(
      '00000000-0000-0000-0000-000000000000',
      false,
    );

    expect(status).toBe(401);
    expect(body.succeeded).toBe(false);
  });
});
