import { Entity, Column, PrimaryColumn, Index, CreateDateColumn } from "typeorm"
import { HASH_LENGTH } from "../utils/const";

@Entity()
export class Transaction {
    @PrimaryColumn({length: HASH_LENGTH})
    hash!: string

    @Column({type: "jsonb", nullable: true})
    errorContent!: Record<string, any>

    @Index()
    @Column({length: HASH_LENGTH, nullable: true })
    blockHash!: string;

    @Index()
    @Column()
    status!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({type: "timestamp"})
    updatedAt!: Date;
}
