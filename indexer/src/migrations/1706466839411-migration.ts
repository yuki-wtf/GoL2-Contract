import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1706466839411 implements MigrationInterface {
    name = 'migration1706466839411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mints" ("generation" integer NOT NULL, "userId" character varying NOT NULL, "txHash" character varying NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_391ba31dd81cfe86148e7c915ba" PRIMARY KEY ("generation"))`);
        await queryRunner.query(`CREATE INDEX "IDX_391ba31dd81cfe86148e7c915b" ON "mints" ("generation") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_391ba31dd81cfe86148e7c915b"`);
        await queryRunner.query(`DROP TABLE "mints"`);
    }

}
