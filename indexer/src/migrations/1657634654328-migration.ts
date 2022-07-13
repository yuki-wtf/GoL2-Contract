import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1657634654328 implements MigrationInterface {
    name = 'migration1657634654328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh" ("hash" character varying(65) NOT NULL, "blockIndex" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b00dbc2a30d3b08a7e0412ed55e" PRIMARY KEY ("hash"))`);
        await queryRunner.query(`CREATE TABLE "block" ("hash" character varying(65) NOT NULL, "blockIndex" integer NOT NULL, "parentBlock" character varying(65) NOT NULL, "timestamp" TIMESTAMP NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_70d8bae40c2822f7ef0e44b78de" UNIQUE ("blockIndex"), CONSTRAINT "UQ_7bc890f5e16da6c0ef4fa6fba7a" UNIQUE ("parentBlock"), CONSTRAINT "PK_f8fba63d7965bfee9f304c487aa" PRIMARY KEY ("hash"))`);
        await queryRunner.query(`CREATE INDEX "IDX_70d8bae40c2822f7ef0e44b78d" ON "block" ("blockIndex") `);
        await queryRunner.query(`CREATE TABLE "event" ("txHash" character varying(65) NOT NULL, "eventIndex" integer NOT NULL, "txIndex" integer NOT NULL, "blockIndex" integer NOT NULL, "name" character varying NOT NULL, "content" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "blockHash" character varying(65), CONSTRAINT "PK_168407df0cd2c71680bf4287000" PRIMARY KEY ("txHash", "eventIndex"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b535fbe8ec6d832dde22065ebd" ON "event" ("name") `);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_55151d22981cfae04b8ea74fe78" FOREIGN KEY ("blockHash") REFERENCES "block"("hash") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "balance" AS 
      with transfers as (
          select (content -> 'to')::numeric "to",
                 (content -> 'from_')::numeric "from",
                 (content -> 'value')::numeric "value",
                 "createdAt" "createdAt"
          from event
          where name='Transfer'
      ),
      incoming as (
          select "to",
                 sum("value") as incoming_credits,
                 MIN("createdAt") as oldestTransaction,
                 MAX("createdAt") as newestTransaction
          from transfers
          group by "to"
      ), 
      outgoing as (
          select "from",
          sum("value") as outgoing_credits,
          MIN("createdAt") as oldestTransaction,
          MAX("createdAt") as newestTransaction
      from transfers
      group by "from"
      ) select "to" as "userId",
               (incoming_credits - outgoing_credits) as balance,
               (
                  case
                      when incoming.oldesttransaction>outgoing.oldesttransaction then outgoing.oldesttransaction
                      else incoming.oldesttransaction
                      end
                ) as "createdAt",
                (
                  case
                      when incoming.newesttransaction<outgoing.newesttransaction then outgoing.newesttransaction
                      else incoming.newesttransaction
                      end
                ) as "updatedAt"
      from incoming 
          left join outgoing
                    on "to" = "from"
                    where "to" != '0';

      -- CUSTOM INDICES
        create unique index on balance (
           "userId"
        );
        create index on balance (
           "userId",
           "updatedAt",
           "createdAt"
        );
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","balance","with transfers as (\n          select (content -> 'to')::numeric \"to\",\n                 (content -> 'from_')::numeric \"from\",\n                 (content -> 'value')::numeric \"value\",\n                 \"createdAt\" \"createdAt\"\n          from event\n          where name='Transfer'\n      ),\n      incoming as (\n          select \"to\",\n                 sum(\"value\") as incoming_credits,\n                 MIN(\"createdAt\") as oldestTransaction,\n                 MAX(\"createdAt\") as newestTransaction\n          from transfers\n          group by \"to\"\n      ), \n      outgoing as (\n          select \"from\",\n          sum(\"value\") as outgoing_credits,\n          MIN(\"createdAt\") as oldestTransaction,\n          MAX(\"createdAt\") as newestTransaction\n      from transfers\n      group by \"from\"\n      ) select \"to\" as \"userId\",\n               (incoming_credits - outgoing_credits) as balance,\n               (\n                  case\n                      when incoming.oldesttransaction>outgoing.oldesttransaction then outgoing.oldesttransaction\n                      else incoming.oldesttransaction\n                      end\n                ) as \"createdAt\",\n                (\n                  case\n                      when incoming.newesttransaction<outgoing.newesttransaction then outgoing.newesttransaction\n                      else incoming.newesttransaction\n                      end\n                ) as \"updatedAt\"\n      from incoming \n          left join outgoing\n                    on \"to\" = \"from\"\n                    where \"to\" != '0';"]);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "creator" AS 
        select "txHash"                              "transactionHash",
               "name"                                "transactionType",
               (content -> 'user_id')::numeric       "transactionOwner",
               (content -> 'game_id')::numeric       "gameId",
               (content -> 'generation')::numeric    "gameGeneration",
               (content -> 'state')::numeric         "gameState",
               "createdAt"                           "createdAt"
        from event 
        where (name='game_evolved' OR name='game_created')
              AND (content -> 'game_id')::numeric != 39132555273291485155644251043342963441664;

        -- CUSTOM INDICES
          create unique index on creator (
             "transactionHash"
          );
          create index on creator (
            "transactionType",
            "transactionOwner",
            "gameId",
            "createdAt"
          );
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","creator","select \"txHash\"                              \"transactionHash\",\n               \"name\"                                \"transactionType\",\n               (content -> 'user_id')::numeric       \"transactionOwner\",\n               (content -> 'game_id')::numeric       \"gameId\",\n               (content -> 'generation')::numeric    \"gameGeneration\",\n               (content -> 'state')::numeric         \"gameState\",\n               \"createdAt\"                           \"createdAt\"\n        from event \n        where (name='game_evolved' OR name='game_created')\n              AND (content -> 'game_id')::numeric != 39132555273291485155644251043342963441664;"]);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "infinite" AS 
        select "txHash"                              "transactionHash",
               "name"                                "transactionType",
               (content -> 'user_id')::numeric       "transactionOwner",
               (content -> 'generation')::numeric    "gameGeneration",
               (content -> 'state')::numeric         "gameState",
               (content -> 'cell_index')::numeric    "revivedCellIndex",
               "createdAt"                           "createdAt"
        from event
        where (name='game_evolved'
               AND (content -> 'game_id')::numeric = 39132555273291485155644251043342963441664)
               OR name='cell_revived';

        -- CUSTOM INDICES
          create unique index on infinite (
             "transactionHash"
          );
          create index on infinite (
            "transactionType",
            "transactionOwner",
            "createdAt"
          );
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","infinite","select \"txHash\"                              \"transactionHash\",\n               \"name\"                                \"transactionType\",\n               (content -> 'user_id')::numeric       \"transactionOwner\",\n               (content -> 'generation')::numeric    \"gameGeneration\",\n               (content -> 'state')::numeric         \"gameState\",\n               (content -> 'cell_index')::numeric    \"revivedCellIndex\",\n               \"createdAt\"                           \"createdAt\"\n        from event\n        where (name='game_evolved'\n               AND (content -> 'game_id')::numeric = 39132555273291485155644251043342963441664)\n               OR name='cell_revived';"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","infinite","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "infinite"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","creator","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "creator"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","balance","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "balance"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_55151d22981cfae04b8ea74fe78"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b535fbe8ec6d832dde22065ebd"`);
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_70d8bae40c2822f7ef0e44b78d"`);
        await queryRunner.query(`DROP TABLE "block"`);
        await queryRunner.query(`DROP TABLE "refresh"`);
    }

}
