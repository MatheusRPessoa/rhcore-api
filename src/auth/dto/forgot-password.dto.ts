import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email do usuário para recuperação de senha',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  EMAIL: string;
}
