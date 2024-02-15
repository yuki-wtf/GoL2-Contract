import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1708011954903 implements MigrationInterface {
    name = 'migration1708011954903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_08f3024b3fad3c62274225faf9"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "blockHash"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "errorContent"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "errorContent" jsonb`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "blockHash" character varying(65)`);
        await queryRunner.query(`CREATE INDEX "IDX_08f3024b3fad3c62274225faf9" ON "transaction" ("blockHash") `);
    }

}
