import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1707646272528 implements MigrationInterface {
    name = 'migration1707646272528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "whitelist" ADD "timestamp" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "whitelist" ADD "gameState" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "whitelist" DROP COLUMN "gameState"`);
        await queryRunner.query(`ALTER TABLE "whitelist" DROP COLUMN "timestamp"`);
    }

}
