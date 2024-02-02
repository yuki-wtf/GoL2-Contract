import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1706887624061 implements MigrationInterface {
    name = 'migration1706887624061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "blockHash" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "blockHash" SET NOT NULL`);
    }

}
