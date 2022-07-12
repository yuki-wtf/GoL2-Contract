import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import { HASH_LENGTH } from "../utils/const";

@Entity()
export class Refresh {
    @PrimaryColumn({length: HASH_LENGTH})
    hash!: string

    @Column({type: "integer"})
    blockIndex!: number;

    @CreateDateColumn()
    createdAt!: Date;
}
