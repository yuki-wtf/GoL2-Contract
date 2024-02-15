import { MigrationInterface, QueryRunner } from "typeorm"

export class migration1708009208241 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("block", true, true, true);
        await queryRunner.dropTable("refresh", true, true, true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh" ("hash" character varying(65) NOT NULL, "blockIndex" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b00dbc2a30d3b08a7e0412ed55e" PRIMARY KEY ("hash"))`);
        await queryRunner.query(`CREATE TABLE "block" ("hash" character varying(65) NOT NULL, "blockIndex" integer NOT NULL, "parentBlock" character varying(65) NOT NULL, "timestamp" TIMESTAMP NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_70d8bae40c2822f7ef0e44b78de" UNIQUE ("blockIndex"), CONSTRAINT "UQ_7bc890f5e16da6c0ef4fa6fba7a" UNIQUE ("parentBlock"), CONSTRAINT "PK_f8fba63d7965bfee9f304c487aa" PRIMARY KEY ("hash"))`);
    }

}
