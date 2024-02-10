import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm"

@Entity()
export class Whitelist {
    @Index()
    @PrimaryColumn({type: "integer", unique: true})
    generation!: number;

    @Column({type: 'text'})
    proof!: string;
    
    @CreateDateColumn()
    createdAt!: Date;
}
