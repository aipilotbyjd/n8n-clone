import { Variable } from '../entities/variable.entity';

export interface IVariableRepository {
  save(variable: Variable): Promise<Variable>;
  findById(id: string): Promise<Variable | null>;
  findByName(name: string): Promise<Variable | null>;
  findByScope(scope: string): Promise<Variable[]>;
  findByType(type: string): Promise<Variable[]>;
  findProtectedVariables(): Promise<Variable[]>;
  update(variable: Variable): Promise<Variable>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Variable[]>;
}
