import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1661518136720 implements MigrationInterface {
    name = 'migration1661518136720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "functionName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "functionCaller" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "functionInputCellIndex" integer`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "functionInputGameState" numeric`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "functionInputGameId" numeric`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_54dcd9578eb59a50d4095eae99" ON "transaction" ("functionName") `);
        await queryRunner.query(`CREATE INDEX "IDX_32ad9e0d62211b679ebca15104" ON "transaction" ("functionCaller") `);
        await queryRunner.query(`CREATE INDEX "IDX_7f40575a1b279607e73504117e" ON "transaction" ("functionInputCellIndex") `);
        await queryRunner.query(`CREATE INDEX "IDX_7719a5dd0518e380f8911fb7ff" ON "transaction" ("functionInputGameState") `);
        await queryRunner.query(`CREATE INDEX "IDX_0d681662b792661c819f8276a0" ON "transaction" ("functionInputGameId") `);
        await queryRunner.query(`CREATE INDEX "IDX_83cb622ce2d74c56db3e0c29f1" ON "transaction" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_253f6b005b632dbac80cff5020" ON "transaction" ("updatedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_253f6b005b632dbac80cff5020"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_83cb622ce2d74c56db3e0c29f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d681662b792661c819f8276a0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7719a5dd0518e380f8911fb7ff"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f40575a1b279607e73504117e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32ad9e0d62211b679ebca15104"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_54dcd9578eb59a50d4095eae99"`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "updatedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "functionInputGameId"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "functionInputGameState"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "functionInputCellIndex"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "functionCaller"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "functionName"`);
    }

}
