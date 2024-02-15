import { Entity, Column, PrimaryColumn, Index, CreateDateColumn } from "typeorm"
import { HASH_LENGTH } from "../utils/const";

@Entity()
export class Transaction {
    @PrimaryColumn({length: HASH_LENGTH})
    hash!: string

    @Index()
    @Column()
    status!: string;

    @Index()
    @Column()
    functionName!: string;

    @Index()
    @Column({type: "numeric"})
    functionCaller!: string;

    @Index()
    @Column({type: "integer", nullable: true})
    functionInputCellIndex!: number;

    @Index()
    @Column({type: "numeric", nullable: true})
    functionInputGameState!: string;

    @Index()
    @Column({type: "numeric", nullable: true})
    functionInputGameId!: string;

    @Index()
    @CreateDateColumn()
    createdAt!: Date;

    @Index()
    @Column({type: "timestamp", nullable: true})
    updatedAt!: Date;
}
