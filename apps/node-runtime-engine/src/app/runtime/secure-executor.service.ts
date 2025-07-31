import { Injectable, Logger } from '@nestjs/common';
import { VM } from 'vm2';

export interface ExecutionContext {
  $input: any;
  $json: any;
  $node: any;
  $workflow: any;
  $execution: any;
  $vars: Record<string, any>;
  $parameters: Record<string, any>;
  console: {
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    info: (...args: any[]) => void;
  };
  DateTime: any; // Luxon DateTime
  $: any; // Lodash
  Math: any;
  JSON: any;
}

@Injectable()
export class SecureExecutorService {
  private readonly logger = new Logger(SecureExecutorService.name);

  async executeJavaScript(
    code: string,
    context: Record<string, any>,
    timeout: number = 30000
  ): Promise<any> {
    this.logger.log('Executing JavaScript code in secure sandbox');

    try {
      // Create execution logs
      const logs: string[] = [];

      // Create secure VM instance
      const vm = new VM({
        timeout,
        sandbox: this.createSandboxContext(context, logs)
      });

      // Execute the code
      const result = vm.run(code);

      return {
        result,
        logs,
        success: true
      };

    } catch (error) {
      this.logger.error('JavaScript execution failed:', error);
      throw new Error(`Code execution failed: ${error.message}`);
    }
  }

  async executeExpression(
    expression: string,
    data: any,
    additionalKeys?: Record<string, any>
  ): Promise<any> {
    this.logger.debug(`Executing expression: ${expression}`);

    try {
      // Wrap the expression in a return statement if needed
      const code = expression.startsWith('return ') 
        ? expression 
        : `return (${expression})`;

      const context = {
        ...data,
        ...additionalKeys,
        $json: data,
        $input: data
      };

      const result = await this.executeJavaScript(code, context, 5000);
      return result.result;

    } catch (error) {
      this.logger.error(`Expression execution failed: ${expression}`, error);
      throw new Error(`Expression evaluation failed: ${error.message}`);
    }
  }

  async validateJavaScript(code: string): Promise<{
    valid: boolean;
    errors: Array<{ line: number; message: string; type: 'error' | 'warning' }>;
  }> {
    this.logger.debug('Validating JavaScript code');

    try {
      // Create a VM for validation (with shorter timeout)
      const vm = new VM({
        timeout: 1000,
        sandbox: this.createMinimalSandbox()
      });

      // Try to compile the code without executing
      vm.run(`(function() { ${code} })`);

      return { valid: true, errors: [] };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          line: this.extractLineNumber(error.message),
          message: error.message,
          type: 'error'
        }]
      };
    }
  }

  private createSandboxContext(context: Record<string, any>, logs: string[]): ExecutionContext {
    return {
      $input: context.$input || {},
      $json: context.$json || context.$input || {},
      $node: context.$node || {},
      $workflow: context.$workflow || {},
      $execution: context.$execution || {},
      $vars: context.$vars || {},
      $parameters: context.$parameters || {},
      
      // Console with logging capture
      console: {
        log: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          logs.push(`LOG: ${message}`);
          this.logger.debug(`Code log: ${message}`);
        },
        error: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          logs.push(`ERROR: ${message}`);
          this.logger.error(`Code error: ${message}`);
        },
        warn: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          logs.push(`WARN: ${message}`);
          this.logger.warn(`Code warn: ${message}`);
        },
        info: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          logs.push(`INFO: ${message}`);
          this.logger.log(`Code info: ${message}`);
        }
      },

      // DateTime library (Luxon)
      DateTime: this.createDateTimeProxy(),
      
      // Lodash utilities
      $: this.createLodashProxy(),

      // Math utilities
      Math: Math,
      
      // Safe JSON operations
      JSON: {
        parse: JSON.parse,
        stringify: JSON.stringify
      },

      // Additional context data
      ...context
    };
  }

  private createMinimalSandbox(): any {
    return {
      console: {
        log: () => {},
        error: () => {},
        warn: () => {},
        info: () => {}
      },
      Math,
      JSON: {
        parse: JSON.parse,
        stringify: JSON.stringify
      }
    };
  }

  private createDateTimeProxy(): any {
    // In a real implementation, you would import and configure Luxon
    // For now, we'll create a basic proxy
    return {
      now: () => new Date(),
      fromISO: (iso: string) => new Date(iso),
      fromMillis: (millis: number) => new Date(millis),
      local: () => new Date(),
      utc: () => new Date()
    };
  }

  private createLodashProxy(): any {
    // In a real implementation, you would import lodash
    // For now, we'll create basic utilities
    return {
      get: (obj: any, path: string, defaultValue?: any) => {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
          if (result && typeof result === 'object' && key in result) {
            result = result[key];
          } else {
            return defaultValue;
          }
        }
        return result;
      },
      set: (obj: any, path: string, value: any) => {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
          }
          current = current[key];
        }
        current[keys[keys.length - 1]] = value;
        return obj;
      },
      merge: (...objects: any[]) => Object.assign({}, ...objects),
      clone: (obj: any) => JSON.parse(JSON.stringify(obj)),
      isArray: Array.isArray,
      isObject: (value: any) => value !== null && typeof value === 'object'
    };
  }

  private extractLineNumber(errorMessage: string): number {
    const match = errorMessage.match(/line (\d+)/i);
    return match ? parseInt(match[1], 10) : 1;
  }
}
