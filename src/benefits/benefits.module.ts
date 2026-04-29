import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Benefit } from './entities/benefit.entity';
import { Employee } from 'src/employees/entities/employee.entity';
import { BenefitsController } from './benefits.controller';
import { BenefitsService } from './benefits.service';

@Module({
  imports: [TypeOrmModule.forFeature([Benefit, Employee])],
  controllers: [BenefitsController],
  providers: [BenefitsService],
})
export class BenefitsModule {}
