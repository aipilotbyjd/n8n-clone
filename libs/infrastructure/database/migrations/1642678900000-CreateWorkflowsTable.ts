import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateWorkflowsTable1642678900000 implements MigrationInterface {
    name = 'CreateWorkflowsTable1642678900000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create workflows table
        await queryRunner.createTable(
            new Table({
                name: 'workflows',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'active',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'tags',
                        type: 'text',
                        isArray: true,
                        isNullable: true,
                    },
                    {
                        name: 'settings',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'version',
                        type: 'integer',
                        default: 1,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Create indexes
        await queryRunner.createIndex(
            'workflows',
            new Index({
                name: 'idx_workflows_user_active',
                columnNames: ['user_id', 'active'],
            }),
        );

        await queryRunner.createIndex(
            'workflows',
            new Index({
                name: 'idx_workflows_name_user',
                columnNames: ['name', 'user_id'],
            }),
        );

        await queryRunner.createIndex(
            'workflows',
            new Index({
                name: 'idx_workflows_tags',
                columnNames: ['tags'],
                isUnique: false,
            }),
        );

        // Create trigger for updated_at
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        await queryRunner.query(`
            CREATE TRIGGER update_workflows_updated_at 
            BEFORE UPDATE ON workflows 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop trigger and function
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

        // Drop indexes
        await queryRunner.dropIndex('workflows', 'idx_workflows_tags');
        await queryRunner.dropIndex('workflows', 'idx_workflows_name_user');
        await queryRunner.dropIndex('workflows', 'idx_workflows_user_active');

        // Drop table
        await queryRunner.dropTable('workflows');
    }
}
