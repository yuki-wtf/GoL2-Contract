import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1706635657462 implements MigrationInterface {
    name = 'migration1706635657462'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "whitelist" ("generation" integer NOT NULL, "proof" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_365e5cf79f9365dc5eb3c4e4c25" PRIMARY KEY ("generation"))`);
        await queryRunner.query(`CREATE INDEX "IDX_365e5cf79f9365dc5eb3c4e4c2" ON "whitelist" ("generation") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_365e5cf79f9365dc5eb3c4e4c2"`);
        await queryRunner.query(`DROP TABLE "whitelist"`);
    }

}
