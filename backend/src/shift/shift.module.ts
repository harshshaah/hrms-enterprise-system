import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Shift, ShiftSchema } from './schemas/shift.schema';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shift.name, schema: ShiftSchema },
    ]),
  ],
  controllers: [ShiftController],
  providers: [ShiftService],
  exports: [ShiftService, MongooseModule],
})
export class ShiftModule {}

