import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm";
import { HASH_LENGTH } from "../utils/const";

@Entity()
export class Event {
    @PrimaryColumn({length: HASH_LENGTH})
    txHash!: string;

    @PrimaryColumn({type: "integer"})
    eventIndex!: number;

    @Column({type: "integer"})
    txIndex!: number;

    @Column({length: HASH_LENGTH, nullable: true})
    blockHash!: string;

    @Column({type: "integer", nullable: true})
    blockIndex!: number;

    @Index({})
    @Column()
    name!: string;

    @Column({type: "jsonb"})
    content!: Record<string, any>

    @CreateDateColumn()
    createdAt!: Date;
}
