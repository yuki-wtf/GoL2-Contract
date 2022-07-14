import { Index, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: `
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
    `,
  materialized: true,
})

// WARNING: INDICES HAVE TO BE CREATED MANUALLY IN MIGRATIONS, EVERY TIME THIS VIEW IS EDITED
@Index(["userId", "updatedAt", "createdAt"])
export class Balance {
  @PrimaryColumn()
  @ViewColumn()
  userId!: string

  @ViewColumn()
  balance!: number;

  @ViewColumn()
  updatedAt!: number;

  @ViewColumn()
  createdAt!: number;
}
