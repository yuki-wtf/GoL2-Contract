import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1658138315215 implements MigrationInterface {
    name = 'migration1658138315215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","infinite","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "infinite"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","creator","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "creator"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","balance","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "balance"`);
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
               (incoming_credits - coalesce(outgoing_credits, 0)) as balance,
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
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","balance","with transfers as (\n          select (content -> 'to')::numeric \"to\",\n                 (content -> 'from_')::numeric \"from\",\n                 (content -> 'value')::numeric \"value\",\n                 \"createdAt\" \"createdAt\"\n          from event\n          where name='Transfer'\n      ),\n      incoming as (\n          select \"to\",\n                 sum(\"value\") as incoming_credits,\n                 MIN(\"createdAt\") as oldestTransaction,\n                 MAX(\"createdAt\") as newestTransaction\n          from transfers\n          group by \"to\"\n      ), \n      outgoing as (\n          select \"from\",\n          sum(\"value\") as outgoing_credits,\n          MIN(\"createdAt\") as oldestTransaction,\n          MAX(\"createdAt\") as newestTransaction\n      from transfers\n      group by \"from\"\n      ) select \"to\" as \"userId\",\n               (incoming_credits - coalesce(outgoing_credits, 0)) as balance,\n               (\n                  case\n                      when incoming.oldesttransaction>outgoing.oldesttransaction then outgoing.oldesttransaction\n                      else incoming.oldesttransaction\n                      end\n                ) as \"createdAt\",\n                (\n                  case\n                      when incoming.newesttransaction<outgoing.newesttransaction then outgoing.newesttransaction\n                      else incoming.newesttransaction\n                      end\n                ) as \"updatedAt\"\n      from incoming \n          left join outgoing\n                    on \"to\" = \"from\"\n                    where \"to\" != '0';"]);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "creator" AS 
        select event."txHash"                                    "transactionHash",
               event."name"                                      "transactionType",
               (event.content -> 'user_id')::numeric             "transactionOwner",
               (event.content -> 'game_id')::numeric             "gameId",
               (event.content -> 'generation')::numeric          "gameGeneration",
               (event.content -> 'state')::numeric               "gameState",
               block.status                                      "txStatus",
               (
                  case
                      when (event.content -> 'state')::numeric=0 then true
                      else false
                      end
                ) as "gameOver",
               event."createdAt"                                 "createdAt"
        from event
            left join block
                on event."blockHash" = block.hash
        where (event.name='game_evolved' OR event.name='game_created')
              AND (event.content -> 'game_id')::numeric != 39132555273291485155644251043342963441664;

        -- CUSTOM INDICES
          create unique index on creator (
             "transactionHash"
          );
          create index on creator (
            "transactionType",
            "transactionOwner",
            "gameId",
            "createdAt",
            "gameOver",
            "txStatus"
          );
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","creator","select event.\"txHash\"                                    \"transactionHash\",\n               event.\"name\"                                      \"transactionType\",\n               (event.content -> 'user_id')::numeric             \"transactionOwner\",\n               (event.content -> 'game_id')::numeric             \"gameId\",\n               (event.content -> 'generation')::numeric          \"gameGeneration\",\n               (event.content -> 'state')::numeric               \"gameState\",\n               block.status                                      \"txStatus\",\n               (\n                  case\n                      when (event.content -> 'state')::numeric=0 then true\n                      else false\n                      end\n                ) as \"gameOver\",\n               event.\"createdAt\"                                 \"createdAt\"\n        from event\n            left join block\n                on event.\"blockHash\" = block.hash\n        where (event.name='game_evolved' OR event.name='game_created')\n              AND (event.content -> 'game_id')::numeric != 39132555273291485155644251043342963441664;"]);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "infinite" AS 
        select event."txHash"                                    "transactionHash",
               event."name"                                      "transactionType",
               (event.content -> 'user_id')::numeric             "transactionOwner",
               (event.content -> 'generation')::numeric          "gameGeneration",
               (event.content -> 'state')::numeric               "gameState",
               (event.content -> 'cell_index')::numeric          "revivedCellIndex",
               block.status                                      "txStatus",
               (
                  case
                      when (event.content -> 'state')::numeric=0 then true
                      else false
                      end
                ) as "gameExtinct",
               event."createdAt"                                 "createdAt"
        from event
            left join block
                on event."blockHash" = block.hash
        where (event.name='game_evolved'
               AND (event.content -> 'game_id')::numeric = 39132555273291485155644251043342963441664)
               OR event.name='cell_revived';

        -- CUSTOM INDICES
          create unique index on infinite (
             "transactionHash"
          );
          create index on infinite (
            "transactionType",
            "transactionOwner",
            "createdAt",
            "gameExtinct",
            "txStatus"
          );
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","infinite","select event.\"txHash\"                                    \"transactionHash\",\n               event.\"name\"                                      \"transactionType\",\n               (event.content -> 'user_id')::numeric             \"transactionOwner\",\n               (event.content -> 'generation')::numeric          \"gameGeneration\",\n               (event.content -> 'state')::numeric               \"gameState\",\n               (event.content -> 'cell_index')::numeric          \"revivedCellIndex\",\n               block.status                                      \"txStatus\",\n               (\n                  case\n                      when (event.content -> 'state')::numeric=0 then true\n                      else false\n                      end\n                ) as \"gameExtinct\",\n               event.\"createdAt\"                                 \"createdAt\"\n        from event\n            left join block\n                on event.\"blockHash\" = block.hash\n        where (event.name='game_evolved'\n               AND (event.content -> 'game_id')::numeric = 39132555273291485155644251043342963441664)\n               OR event.name='cell_revived';"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","infinite","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "infinite"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","creator","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "creator"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","balance","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "balance"`);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "balance" AS with transfers as (
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
        );`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","balance","with transfers as (\n          select (content -> 'to')::numeric \"to\",\n                 (content -> 'from_')::numeric \"from\",\n                 (content -> 'value')::numeric \"value\",\n                 \"createdAt\" \"createdAt\"\n          from event\n          where name='Transfer'\n      ),\n      incoming as (\n          select \"to\",\n                 sum(\"value\") as incoming_credits,\n                 MIN(\"createdAt\") as oldestTransaction,\n                 MAX(\"createdAt\") as newestTransaction\n          from transfers\n          group by \"to\"\n      ), \n      outgoing as (\n          select \"from\",\n          sum(\"value\") as outgoing_credits,\n          MIN(\"createdAt\") as oldestTransaction,\n          MAX(\"createdAt\") as newestTransaction\n      from transfers\n      group by \"from\"\n      ) select \"to\" as \"userId\",\n               (incoming_credits - outgoing_credits) as balance,\n               (\n                  case\n                      when incoming.oldesttransaction>outgoing.oldesttransaction then outgoing.oldesttransaction\n                      else incoming.oldesttransaction\n                      end\n                ) as \"createdAt\",\n                (\n                  case\n                      when incoming.newesttransaction<outgoing.newesttransaction then outgoing.newesttransaction\n                      else incoming.newesttransaction\n                      end\n                ) as \"updatedAt\"\n      from incoming \n          left join outgoing\n                    on \"to\" = \"from\"\n                    where \"to\" != '0';"]);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "creator" AS select "txHash"                              "transactionHash",
               "name"                                "transactionType",
               (content -> 'user_id')::numeric       "transactionOwner",
               (content -> 'game_id')::numeric       "gameId",
               (content -> 'generation')::numeric    "gameGeneration",
               (content -> 'state')::numeric         "gameState",
               "createdAt"                           "createdAt",
               (
                  case
                      when (content -> 'state')::numeric=0 then true
                      else false
                      end
                ) as "gameOver",
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
            "createdAt",
            "gameOver"
          );`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","creator","select \"txHash\"                              \"transactionHash\",\n               \"name\"                                \"transactionType\",\n               (content -> 'user_id')::numeric       \"transactionOwner\",\n               (content -> 'game_id')::numeric       \"gameId\",\n               (content -> 'generation')::numeric    \"gameGeneration\",\n               (content -> 'state')::numeric         \"gameState\",\n               \"createdAt\"                           \"createdAt\",\n               (\n                  case\n                      when (content -> 'state')::numeric=0 then true\n                      else false\n                      end\n                ) as \"gameOver\",\n        from event \n        where (name='game_evolved' OR name='game_created')\n              AND (content -> 'game_id')::numeric != 39132555273291485155644251043342963441664;"]);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "infinite" AS select "txHash"                              "transactionHash",
               "name"                                "transactionType",
               (content -> 'user_id')::numeric       "transactionOwner",
               (content -> 'generation')::numeric    "gameGeneration",
               (content -> 'state')::numeric         "gameState",
               (content -> 'cell_index')::numeric    "revivedCellIndex",
               "createdAt"                           "createdAt",
               (
                  case
                      when (content -> 'state')::numeric=0 then true
                      else false
                      end
                ) as "gameExtinct",
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
            "createdAt",
            "gameExtinct"
          );`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","infinite","select \"txHash\"                              \"transactionHash\",\n               \"name\"                                \"transactionType\",\n               (content -> 'user_id')::numeric       \"transactionOwner\",\n               (content -> 'generation')::numeric    \"gameGeneration\",\n               (content -> 'state')::numeric         \"gameState\",\n               (content -> 'cell_index')::numeric    \"revivedCellIndex\",\n               \"createdAt\"                           \"createdAt\",\n               (\n                  case\n                      when (content -> 'state')::numeric=0 then true\n                      else false\n                      end\n                ) as \"gameExtinct\",\n        from event\n        where (name='game_evolved'\n               AND (content -> 'game_id')::numeric = 39132555273291485155644251043342963441664)\n               OR name='cell_revived';"]);
    }

}
