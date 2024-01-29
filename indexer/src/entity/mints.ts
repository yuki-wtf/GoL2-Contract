import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Mints {
    @Index()
    @PrimaryColumn({type: "integer", unique: true})
    generation!: number;

    @Column()
    userId!: string;

    @Column()
    txHash!: string;

    @Column()
    status!: string;
    
    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedDate!: Date
}
