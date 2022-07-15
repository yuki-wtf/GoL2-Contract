import {Index, PrimaryColumn, ViewColumn, ViewEntity} from "typeorm";

@ViewEntity({
    expression: `
        select "txHash"                              "transactionHash",
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
                ) as "gameExtinct"
        from event
        where (name='game_evolved'
               AND (content -> 'game_id')::numeric = 39132555273291485155644251043342963441664)
               OR name='cell_revived';
    `,
    materialized: true,
})
// WARNING: INDICES HAVE TO BE CREATED MANUALLY IN MIGRATIONS, EVERY TIME THIS VIEW IS EDITED
@Index(["transactionType", "transactionOwner", "createdAt", "gameExtinct"])
export class Infinite {
    @PrimaryColumn()
    @ViewColumn()
    transactionHash!: string

    @ViewColumn()
    transactionType!: string;

    @ViewColumn()
    transactionOwner!: string;

    @ViewColumn()
    revivedCellIndex!: number;

    @ViewColumn()
    gameGeneration!: number;

    @ViewColumn()
    gameState!: number;

    @ViewColumn()
    createdAt!: string;

    @ViewColumn()
    gameExtinct!: boolean
}
