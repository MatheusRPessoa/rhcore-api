import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payroll } from './entities/payroll.entity';
import { Employee } from 'src/employees/entities/employee.entity';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payroll, Employee])],
  controllers: [PayrollController],
  providers: [PayrollService],
})
export class PayrollModule {}
