import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1705943377612 implements MigrationInterface {
    name = 'migration1705943377612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "blockIndex" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "blockIndex" SET NOT NULL`);
    }

}
