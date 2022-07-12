import {Index, PrimaryColumn, ViewColumn, ViewEntity} from "typeorm";

@ViewEntity({
    expression: `
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
    `,
    materialized: true,
})
// WARNING: INDICES HAVE TO BE CREATED MANUALLY IN MIGRATIONS, EVERY TIME THIS VIEW IS EDITED
@Index(["transactionType", "transactionOwner", "gameId", "createdAt"])
export class Creator {
    @PrimaryColumn()
    @ViewColumn()
    transactionHash!: string

    @ViewColumn()
    transactionType!: string;

    @ViewColumn()
    transactionOwner!: string;

    @ViewColumn()
    gameId!: number;

    @ViewColumn()
    gameGeneration!: number;

    @ViewColumn()
    gameState!: number;

    @ViewColumn()
    createdAt!: string;
}
