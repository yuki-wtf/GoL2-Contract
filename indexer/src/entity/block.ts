import { Entity, Column, PrimaryColumn, Index, CreateDateColumn } from "typeorm"
import { HASH_LENGTH } from "../utils/const";

@Entity()
export class Block {
    @PrimaryColumn({length: HASH_LENGTH})
    hash!: string

    @Index()
    @Column({type: "integer", unique: true})
    blockIndex!: number

    @Column({length: HASH_LENGTH, unique: true})
    parentBlock!: string

    @Column({type: "timestamp"})
    timestamp!: Date;

    @Column()
    status!: string;

    @CreateDateColumn()
    createdAt!: Date;
}
