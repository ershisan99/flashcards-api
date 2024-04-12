import { IsNumber, IsString, Max, Min } from 'class-validator'

import { ApiSchema } from '../../../infrastructure/common/helpers/api-schema'

@ApiSchema({ name: 'SaveGradeRequest' })
export class SaveGradeDto {
  @IsString()
  cardId: string

  @IsNumber()
  @Max(5)
  @Min(1)
  grade: number
}
