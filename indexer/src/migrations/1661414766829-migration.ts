import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1661414766829 implements MigrationInterface {
    name = 'migration1661414766829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","infinite","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "infinite"`);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "infinite" AS 
        select event."txHash" "transactionHash",
            event."name" "transactionType",
            (event.content->'user_id')::numeric "transactionOwner",
            (event.content->'generation')::numeric "gameGeneration",
            (event.content->'state')::numeric "gameState",
            (event.content->'cell_index')::numeric "revivedCellIndex",
            block.status "txStatus",
            (
                case
                    when (event.content->'state')::numeric = 0 then true
                    else false
                end
            ) as "gameExtinct",
            event."createdAt" "createdAt"
        from event
            left join block on event."blockHash" = block.hash
        where (
                event.name in ('game_evolved', 'game_created')
                AND (event.content->'game_id')::numeric = 39132555273291485155644251043342963441664
            )
            OR event.name = 'cell_revived';

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
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","infinite","select event.\"txHash\" \"transactionHash\",\n            event.\"name\" \"transactionType\",\n            (event.content->'user_id')::numeric \"transactionOwner\",\n            (event.content->'generation')::numeric \"gameGeneration\",\n            (event.content->'state')::numeric \"gameState\",\n            (event.content->'cell_index')::numeric \"revivedCellIndex\",\n            block.status \"txStatus\",\n            (\n                case\n                    when (event.content->'state')::numeric = 0 then true\n                    else false\n                end\n            ) as \"gameExtinct\",\n            event.\"createdAt\" \"createdAt\"\n        from event\n            left join block on event.\"blockHash\" = block.hash\n        where (\n                event.name in ('game_evolved', 'game_created')\n                AND (event.content->'game_id')::numeric = 39132555273291485155644251043342963441664\n            )\n            OR event.name = 'cell_revived';"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","infinite","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "infinite"`);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "infinite" AS select event."txHash"                                    "transactionHash",
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
        where event.name in ('game_evolved', 'game_created', 'cell_revived')
               AND (event.content -> 'game_id')::numeric = 39132555273291485155644251043342963441664;`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","infinite","select event.\"txHash\"                                    \"transactionHash\",\n               event.\"name\"                                      \"transactionType\",\n               (event.content -> 'user_id')::numeric             \"transactionOwner\",\n               (event.content -> 'generation')::numeric          \"gameGeneration\",\n               (event.content -> 'state')::numeric               \"gameState\",\n               (event.content -> 'cell_index')::numeric          \"revivedCellIndex\",\n               block.status                                      \"txStatus\",\n               (\n                  case\n                      when (event.content -> 'state')::numeric=0 then true\n                      else false\n                      end\n                ) as \"gameExtinct\",\n               event.\"createdAt\"                                 \"createdAt\"\n        from event\n            left join block\n                on event.\"blockHash\" = block.hash\n        where event.name in ('game_evolved', 'game_created', 'cell_revived')\n               AND (event.content -> 'game_id')::numeric = 39132555273291485155644251043342963441664;"]);
    }

}
