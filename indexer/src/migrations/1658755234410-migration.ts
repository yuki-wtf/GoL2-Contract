import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1658755234410 implements MigrationInterface {
    name = 'migration1658755234410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transaction" ("hash" character varying(65) NOT NULL, "errorContent" jsonb, "blockHash" character varying(65), "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_de4f0899c41c688529784bc443f" PRIMARY KEY ("hash"))`);
        await queryRunner.query(`CREATE INDEX "IDX_08f3024b3fad3c62274225faf9" ON "transaction" ("blockHash") `);
        await queryRunner.query(`CREATE INDEX "IDX_63f749fc7f7178ae1ad85d3b95" ON "transaction" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_63f749fc7f7178ae1ad85d3b95"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_08f3024b3fad3c62274225faf9"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
    }

}
