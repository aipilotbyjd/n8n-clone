  private async executeIfNode(nodeDefinition: any, sandbox: any): Promise<any> {
    const condition = sandbox.$parameter.condition;
    const conditionValue = sandbox.$parameter.conditionValue;
    const operation = sandbox.$parameter.operation || 'equal';

    if (!condition) {
      throw new InvalidNodeParameterError('IF node requires condition parameter');
    }

    try {
      // Evaluate condition for each input item
      const items = sandbox.$items();
      const trueItems: any[] = [];
      const falseItems: any[] = [];

      for (const item of items) {
        const actualValue = this.evaluateExpression(condition, item, sandbox.$parameter);
        const conditionMet = this.evaluateCondition(actualValue, conditionValue, operation);

        if (conditionMet) {
          trueItems.push(item);
        } else {
          falseItems.push(item);
        }
      }

      return {
        true: trueItems,
        false: falseItems
      };

    } catch (error) {
      throw new NodeExecutionError(`IF node execution failed: ${error.message}`);
    }
  }

  private async executeSwitchNode(nodeDefinition: any, sandbox: any): Promise<any> {
    const mode = sandbox.$parameter.mode || 'rules';
    const rules = sandbox.$parameter.rules || [];

    try {
      const items = sandbox.$items();
      const outputs: { [key: number]: any[] } = {};

      // Initialize outputs
      for (let i = 0; i <= rules.length; i++) {
        outputs[i] = [];
      }

      for (const item of items) {
        let matched = false;

        // Check each rule
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          const actualValue = this.evaluateExpression(rule.value, item, sandbox.$parameter);
          const conditionMet = this.evaluateCondition(actualValue, rule.value2, rule.operation);

          if (conditionMet) {
            outputs[i].push(item);
            matched = true;
            if (mode === 'rules') break; // Stop at first match in rules mode
          }
        }

        // If no rule matched, send to fallback output
        if (!matched) {
          outputs[rules.length].push(item);
        }
      }

      return outputs;

    } catch (error) {
      throw new NodeExecutionError(`Switch node execution failed: ${error.message}`);
    }
  }

  private async executeSetNode(nodeDefinition: any, sandbox: any): Promise<any> {
    const values = sandbox.$parameter.values || [];
    const keepOnlySet = sandbox.$parameter.keepOnlySet || false;

    try {
      const items = sandbox.$items();
      const resultItems: any[] = [];

      for (const item of items) {
        let newItem = keepOnlySet ? {} : { ...item };

        // Apply each set operation
        for (const setValue of values) {
          const { name, value, type = 'set' } = setValue;
          
          if (type === 'set') {
            const evaluatedValue = this.evaluateExpression(value, item, sandbox.$parameter);
            this.setNestedProperty(newItem, name, evaluatedValue);
          } else if (type === 'unset') {
            this.unsetNestedProperty(newItem, name);
          }
        }

        resultItems.push(newItem);
      }

      return resultItems;

    } catch (error) {
      throw new NodeExecutionError(`Set node execution failed: ${error.message}`);
    }
  }

  private async executeMergeNode(nodeDefinition: any, sandbox: any): Promise<any> {
    const mode = sandbox.$parameter.mode || 'append';
    const inputs = sandbox.$input;

    try {
      if (!Array.isArray(inputs) || inputs.length === 0) {
        return [];
      }

      switch (mode) {
        case 'append':
          return inputs.flat();
        
        case 'merge':
          // Merge objects with same keys
          const merged = {};
          for (const inputArray of inputs) {
            if (Array.isArray(inputArray)) {
              for (const item of inputArray) {
                Object.assign(merged, item);
              }
            }
          }
          return [merged];
        
        case 'chooseBranch':
          const branchIndex = sandbox.$parameter.branchIndex || 0;
          return inputs[branchIndex] || [];
        
        default:
          throw new InvalidNodeParameterError(`Unknown merge mode: ${mode}`);
      }

    } catch (error) {
      throw new NodeExecutionError(`Merge node execution failed: ${error.message}`);
    }
  }

  private evaluateExpression(expression: string, item: any, parameters: any, itemIndex?: number): any {
    if (!expression) return null;

    // Simple expression evaluation
    // In production, you'd use a more sophisticated expression parser
    try {
      if (expression.startsWith('{{') && expression.endsWith('}}')) {
        const code = expression.slice(2, -2).trim();
        
        // Create a safe evaluation context
        const context = {
          $json: item,
          $parameter: parameters,
          $item: item,
          $itemIndex: itemIndex || 0,
          Math,
          Date,
          JSON,
          String,
          Number,
          Boolean,
          Array,
          Object
        };

        // Use Function constructor for safer evaluation than eval
        const func = new Function(...Object.keys(context), `return ${code}`);
        return func(...Object.values(context));
      }

      return expression;

    } catch (error) {
      this.logger.warn('Expression evaluation failed', {
        expression,
        error: error.message
      });
      return expression; // Return original if evaluation fails
    }
  }

  private evaluateCondition(actualValue: any, expectedValue: any, operation: string): boolean {
    switch (operation) {
      case 'equal':
        return actualValue == expectedValue;
      case 'notEqual':
        return actualValue != expectedValue;
      case 'larger':
        return actualValue > expectedValue;
      case 'largerEqual':
        return actualValue >= expectedValue;
      case 'smaller':
        return actualValue < expectedValue;
      case 'smallerEqual':
        return actualValue <= expectedValue;
      case 'contains':
        return String(actualValue).includes(String(expectedValue));
      case 'notContains':
        return !String(actualValue).includes(String(expectedValue));
      case 'startsWith':
        return String(actualValue).startsWith(String(expectedValue));
      case 'endsWith':
        return String(actualValue).endsWith(String(expectedValue));
      case 'regex':
        return new RegExp(expectedValue).test(String(actualValue));
      case 'isEmpty':
        return !actualValue || actualValue === '' || (Array.isArray(actualValue) && actualValue.length === 0);
      case 'isNotEmpty':
        return !!actualValue && actualValue !== '' && (!Array.isArray(actualValue) || actualValue.length > 0);
      default:
        return false;
    }
  }

  private setNestedProperty(obj: any, path: string, value: any): void {
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
  }

  private unsetNestedProperty(obj: any, path: string): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        return; // Path doesn't exist
      }
      current = current[key];
    }

    delete current[keys[keys.length - 1]];
  }

  private async makeHttpRequest(options: any, credentials: any): Promise<any> {
    const axios = require('axios');
    
    // Apply credentials if available
    if (credentials) {
      if (credentials.authType === 'bearer') {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${credentials.token}`
        };
      } else if (credentials.authType === 'basic') {
        options.auth = {
          username: credentials.username,
          password: credentials.password
        };
      } else if (credentials.authType === 'apiKey') {
        if (credentials.location === 'header') {
          options.headers = {
            ...options.headers,
            [credentials.name]: credentials.value
          };
        } else if (credentials.location === 'query') {
          options.params = {
            ...options.params,
            [credentials.name]: credentials.value
          };
        }
      }
    }

    try {
      const response = await axios(options);
      return {
        statusCode: response.status,
        headers: response.headers,
        body: response.data
      };
    } catch (error) {
      if (error.response) {
        return {
          statusCode: error.response.status,
          headers: error.response.headers,
          body: error.response.data,
          error: true
        };
      }
      throw error;
    }
  }

  private validateNodeParameters(nodeDefinition: any, parameters: any): void {
    if (!nodeDefinition.parameters) return;

    for (const paramDef of nodeDefinition.parameters) {
      if (paramDef.required && !(paramDef.name in parameters)) {
        throw new MissingParameterError(`Required parameter '${paramDef.name}' is missing`);
      }

      if (paramDef.name in parameters) {
        const value = parameters[paramDef.name];
        
        // Type validation
        if (paramDef.type === 'number' && typeof value !== 'number') {
          throw new InvalidParameterTypeError(`Parameter '${paramDef.name}' must be a number`);
        }
        
        if (paramDef.type === 'boolean' && typeof value !== 'boolean') {
          throw new InvalidParameterTypeError(`Parameter '${paramDef.name}' must be a boolean`);
        }
        
        if (paramDef.type === 'string' && typeof value !== 'string') {
          throw new InvalidParameterTypeError(`Parameter '${paramDef.name}' must be a string`);
        }

        // Range validation for numbers
        if (paramDef.type === 'number') {
          if (paramDef.min !== undefined && value < paramDef.min) {
            throw new InvalidParameterValueError(`Parameter '${paramDef.name}' must be >= ${paramDef.min}`);
          }
          if (paramDef.max !== undefined && value > paramDef.max) {
            throw new InvalidParameterValueError(`Parameter '${paramDef.name}' must be <= ${paramDef.max}`);
          }
        }

        // Options validation
        if (paramDef.options && !paramDef.options.some(opt => opt.value === value)) {
          throw new InvalidParameterValueError(`Parameter '${paramDef.name}' must be one of: ${paramDef.options.map(o => o.value).join(', ')}`);
        }
      }
    }
  }
}

// 4. Trigger Manager Service
// apps/trigger-manager/src/trigger-manager.service.ts
@Injectable()
export class TriggerManagerService {
  private activeTriggers: Map<string, TriggerInstance> = new Map();
  private cronJobs: Map<string, CronJob> = new Map();
  private webhookRoutes: Map<string, WebhookRoute> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly workflowService: WorkflowService,
    private readonly executionService: ExecutionService,
    private readonly webhookService: WebhookService,
    private readonly cronService: CronService,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
    private readonly metricsService: MetricsService
  ) {}

  async onModuleInit() {
    // Load and activate all active workflows on startup
    await this.loadActiveWorkflows();
  }

  async onModuleDestroy() {
    // Clean up all active triggers
    await this.deactivateAllTriggers();
  }

  async activateWorkflowTriggers(workflowId: string): Promise<void> {
    this.logger.info('Activating workflow triggers', { workflowId });

    try {
      const workflow = await this.workflowService.getWorkflow(workflowId);
      if (!workflow) {
        throw new WorkflowNotFoundError(`Workflow ${workflowId} not found`);
      }

      // Find all trigger nodes
      const triggerNodes = workflow.nodes.filter(node => node.isTrigger());

      for (const triggerNode of triggerNodes) {
        await this.activateTrigger(workflow, triggerNode);
      }

      this.logger.info('Workflow triggers activated', {
        workflowId,
        triggerCount: triggerNodes.length
      });

    } catch (error) {
      this.logger.error('Failed to activate workflow triggers', {
        workflowId,
        error: error.message
      });
      throw error;
    }
  }

  async deactivateWorkflowTriggers(workflowId: string): Promise<void> {
    this.logger.info('Deactivating workflow triggers', { workflowId });

    try {
      // Find all active triggers for this workflow
      const workflowTriggers = Array.from(this.activeTriggers.entries())
        .filter(([_, trigger]) => trigger.workflowId === workflowId);

      for (const [triggerId, trigger] of workflowTriggers) {
        await this.deactivateTrigger(triggerId, trigger);
      }

      this.logger.info('Workflow triggers deactivated', {
        workflowId,
        deactivatedCount: workflowTriggers.length
      });

    } catch (error) {
      this.logger.error('Failed to deactivate workflow triggers', {
        workflowId,
        error: error.message
      });
      throw error;
    }
  }

  private async activateTrigger(workflow: Workflow, triggerNode: Node): Promise<void> {
    const triggerId = `${workflow.id.value}:${triggerNode.id.value}`;
    
    try {
      switch (triggerNode.type) {
        case 'cron':
          await this.activateCronTrigger(workflow, triggerNode, triggerId);
          break;
        
        case 'webhook':
          await this.activateWebhookTrigger(workflow, triggerNode, triggerId);
          break;
        
        case 'interval':
          await this.activateIntervalTrigger(workflow, triggerNode, triggerId);
          break;
        
        case 'polling':
          await this.activatePollingTrigger(workflow, triggerNode, triggerId);
          break;
        
        case 'file-watcher':
          await this.activateFileWatcherTrigger(workflow, triggerNode, triggerId);
          break;
        
        default:
          this.logger.warn('Unknown trigger type', {
            triggerType: triggerNode.type,
            nodeId: triggerNode.id.value
          });
      }

      // Store active trigger
      this.activeTriggers.set(triggerId, {
        id: triggerId,
        workflowId: workflow.id.value,
        nodeId: triggerNode.id.value,
        type: triggerNode.type,
        parameters: triggerNode.parameters,
        activatedAt: new Date()
      });

      this.logger.debug('Trigger activated', {
        triggerId,
        triggerType: triggerNode.type,
        workflowId: workflow.id.value
      });

    } catch (error) {
      this.logger.error('Failed to activate trigger', {
        triggerId,
        triggerType: triggerNode.type,
        error: error.message
      });
      throw error;
    }
  }

  private async activateCronTrigger(workflow: Workflow, triggerNode: Node, triggerId: string): Promise<void> {
    const cronExpression = triggerNode.parameters.rule;
    if (!cronExpression) {
      throw new InvalidTriggerConfigError('Cron trigger requires rule parameter');
    }

    const cronJob = new CronJob(
      cronExpression,
      async () => {
        this.logger.debug('Cron trigger fired', { triggerId, cronExpression });
        
        try {
          await this.executionService.executeWorkflow({
            workflowId: workflow.id.value,
            userId: workflow.createdBy.value,
            input: {},
            mode: ExecutionMode.TRIGGER,
            correlationId: uuidv4(),
            triggeredBy: 'cron'
          });

          this.metricsService.recordApiRequest('TRIGGER', 'cron', 200);

        } catch (error) {
          this.logger.error('Cron trigger execution failed', {
            triggerId,
            error: error.message
          });
          this.metricsService.recordError('trigger_error', 'cron', error.code);
        }
      },
      null,
      true // Start immediately
    );

    this.cronJobs.set(triggerId, cronJob);
  }

  private async activateWebhookTrigger(workflow: Workflow, triggerNode: Node, triggerId: string): Promise<void> {
    const webhookPath = triggerNode.parameters.path || `/webhook/${workflow.id.value}/${triggerNode.id.value}`;
    const httpMethod = triggerNode.parameters.httpMethod || 'POST';
    const authentication = triggerNode.parameters.authentication || 'none';

    const webhookRoute: WebhookRoute = {
      id: triggerId,
      path: webhookPath,
      method: httpMethod.toUpperCase(),
      authentication,
      workflowId: workflow.id.value,
      nodeId: triggerNode.id.value,
      handler: async (req: any, res: any) => {
        this.logger.debug('Webhook trigger fired', {
          triggerId,
          path: webhookPath,
          method: httpMethod
        });

        try {
          // Validate authentication if required
          if (authentication !== 'none') {
            await this.validateWebhookAuthentication(req, triggerNode.parameters);
          }

          // Extract data from request
          const inputData = {
            headers: req.headers,
            query: req.query,
            body: req.body,
            params: req.params
          };

          // Execute workflow
          const execution = await this.executionService.executeWorkflow({
            workflowId: workflow.id.value,
            userId: workflow.createdBy.value,
            input: inputData,
            mode: ExecutionMode.TRIGGER,
            correlationId: req.headers['x-correlation-id'] || uuidv4(),
            triggeredBy: 'webhook'
          });

          this.metricsService.recordApiRequest('TRIGGER', 'webhook', 200);

          // Return response based on configuration
          const responseMode = triggerNode.parameters.responseMode || 'onReceived';
          
          if (responseMode === 'onReceived') {
            res.status(200).json({
              message: 'Workflow triggered successfully',
              executionId: execution.executionId
            });
          } else if (responseMode === 'lastNode') {
            // Wait for execution to complete and return result
            const result = await this.waitForExecutionCompletion(execution.executionId);
            res.status(200).json(result.output);
          }

        } catch (error) {
          this.logger.error('Webhook trigger execution failed', {
            triggerId,
            error: error.message
          });

          this.metricsService.recordError('trigger_error', 'webhook', error.code);

          res.status(500).json({
            error: 'Webhook execution failed',
            message: error.message
          });
        }
      }
    };

    this.webhookRoutes.set(triggerId, webhookRoute);
    await this.webhookService.registerRoute(webhookRoute);
  }

  private async activateIntervalTrigger(workflow: Workflow, triggerNode: Node, triggerId: string): Promise<void> {
    const intervalMs = triggerNode.parameters.interval * 1000; // Convert seconds to milliseconds
    if (!intervalMs || intervalMs < 1000) {
      throw new InvalidTriggerConfigError('Interval trigger requires interval parameter (minimum 1 second)');
    }

    const intervalId = setInterval(async () => {
      this.logger.debug('Interval trigger fired', { triggerId, intervalMs });

      try {
        await this.executionService.executeWorkflow({
          workflowId: workflow.id.value,
          userId: workflow.createdBy.value,
          input: {},
          mode: ExecutionMode.TRIGGER,
          correlationId: uuidv4(),
          triggeredBy: 'interval'
        });

        this.metricsService.recordApiRequest('TRIGGER', 'interval', 200);

      } catch (error) {
        this.logger.error('Interval trigger execution failed', {
          triggerId,
          error: error.message
        });
        this.metricsService.recordError('trigger_error', 'interval', error.code);
      }
    }, intervalMs);

    this.pollingIntervals.set(triggerId, intervalId);
  }

  private async activatePollingTrigger(workflow: Workflow, triggerNode: Node, triggerId: string): Promise<void> {
    const pollInterval = triggerNode.parameters.pollInterval * 1000; // Convert to milliseconds
    const endpoint = triggerNode.parameters.endpoint;
    
    if (!endpoint) {
      throw new InvalidTriggerConfigError('Polling trigger requires endpoint parameter');
    }

    let lastPollData: any = null;

    const pollId = setInterval(async () => {
      this.logger.debug('Polling trigger checking', { triggerId, endpoint });

      try {
        // Make HTTP request to poll endpoint
        const response = await this.makePollingRequest(endpoint, triggerNode.parameters);
        
        // Check if data has changed
        if (this.hasDataChanged(lastPollData, response.data)) {
          lastPollData = response.data;

          await this.executionService.executeWorkflow({
            workflowId: workflow.id.value,
            userId: workflow.createdBy.value,
            input: response.data,
            mode: ExecutionMode.TRIGGER,
            correlationId: uuidv4(),
            triggeredBy: 'polling'
          });

          this.metricsService.recordApiRequest('TRIGGER', 'polling', 200);
        }

      } catch (error) {
        this.logger.error('Polling trigger failed', {
          triggerId,
          endpoint,
          error: error.message
        });
        this.metricsService.recordError('trigger_error', 'polling', error.code);
      }
    }, pollInterval);

    this.pollingIntervals.set(triggerId, pollId);
  }

  private async deactivateTrigger(triggerId: string, trigger: TriggerInstance): Promise<void> {
    try {
      switch (trigger.type) {
        case 'cron':
          const cronJob = this.cronJobs.get(triggerId);
          if (cronJob) {
            cronJob.stop();
            this.cronJobs.delete(triggerId);
          }
          break;

        case 'webhook':
          const webhookRoute = this.webhookRoutes.get(triggerId);
          if (webhookRoute) {
            await this.webhookService.unregisterRoute(webhookRoute);
            this.webhookRoutes.delete(triggerId);
          }
          break;

        case 'interval':
        case 'polling':
          const intervalId = this.pollingIntervals.get(triggerId);
          if (intervalId) {
            clearInterval(intervalId);
            this.pollingIntervals.delete(triggerId);
          }
          break;
      }

      this.activeTriggers.delete(triggerId);

      this.logger.debug('Trigger deactivated', {
        triggerId,
        triggerType: trigger.type
      });

    } catch (error) {
      this.logger.error('Failed to deactivate trigger', {
        triggerId,
        error: error.message
      });
    }
  }

  private async loadActiveWorkflows(): Promise<void> {
    try {
      const activeWorkflows = await this.workflowService.getActiveWorkflows();
      
      for (const workflow of activeWorkflows) {
        await this.activateWorkflowTriggers(workflow.id.value);
      }

      this.logger.info('Active workflows loaded', {
        workflowCount: activeWorkflows.length
      });

    } catch (error) {
      this.logger.error('Failed to load active workflows', {
        error: error.message
      });
    }
  }

  private async deactivateAllTriggers(): Promise<void> {
    const triggerIds = Array.from(this.activeTriggers.keys());
    
    for (const triggerId of triggerIds) {
      const trigger = this.activeTriggers.get(triggerId);
      if (trigger) {
        await this.deactivateTrigger(triggerId, trigger);
      }
    }

    this.logger.info('All triggers deactivated', {
      deactivatedCount: triggerIds.length
    });
  }

  private hasDataChanged(oldData: any, newData: any): boolean {
    if (!oldData) return true; // First poll
    
    return JSON.stringify(oldData) !== JSON.stringify(newData);
  }

  private async makePollingRequest(endpoint: string, parameters: any): Promise<any> {
    const axios = require('axios');
    
    const options = {
      url: endpoint,
      method: parameters.method || 'GET',
      headers: parameters.headers || {},
      timeout: parameters.timeout || 30000
    };

    return await axios(options);
  }

  private async validateWebhookAuthentication(request: any, parameters: any): Promise<void> {
    // Implement webhook authentication validation
    // This could include API key validation, signature verification, etc.
    
    if (parameters.authentication === 'basicAuth') {
      // Validate basic auth
    } else if (parameters.authentication === 'apiKey') {
      // Validate API key
    } else if (parameters.authentication === 'signature') {
      // Validate webhook signature
    }
  }

  private async waitForExecutionCompletion(executionId: string): Promise<any> {
    // Implementation to wait for execution completion
    // This would typically involve polling the execution service
    // or subscribing to execution completion events
    return new Promise((resolve, reject) => {
      // Simplified implementation
      setTimeout(() => {
        resolve({ output: {} });
      }, 1000);
    });
  }
}

interface TriggerInstance {
  id: string;
  workflowId: string;
  nodeId: string;
  type: string;
  parameters: any;
  activatedAt: Date;
}

interface WebhookRoute {
  id: string;
  path: string;
  method: string;
  authentication: string;
  workflowId: string;
  nodeId: string;
  handler: (req: any, res: any) => Promise<void>;
}

// 5. Credentials Vault Service
// apps/credentials-vault/src/credentials-vault.service.ts
@Injectable()
export class CredentialsVaultService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly encryptionService: EncryptionService,
    private readonly oauthService: OAuthService,
    private readonly cacheService: CacheService,
    private readonly logger: Logger,
    private readonly metricsService: MetricsService
  ) {}

  async createCredential(request: CreateCredentialRequest): Promise<CredentialResponseDto> {
    const { name, type, data, userId, testConnection } = request;

    this.logger.info('Creating credential', {
      name,
      type,
      userId,
      testConnection
    });

    try {
      // Validate credential type
      await this.validateCredentialType(type);

      // Encrypt sensitive data
      const encryptedData = await this.encryptionService.encrypt(JSON.stringify(data));

      // Create credential
      const command = new CreateCredentialCommand({
        name,
        type,
        encryptedData,
        userId
      });

      const credential = await this.commandBus.execute(command);

      // Test connection if requested
      if (testConnection) {
        await this.testCredentialConnection(credential.id, userId);
      }

      this.metricsService.recordApiRequest('CREATE', 'credential', 201, userId);

      return {
        id: credential.id,
        name: credential.name,
        type: credential.type,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
        testedAt: credential.testedAt,
        isValid: credential.isValid
      };

    } catch (error) {
      this.logger.error('Failed to create credential', {
        name,
        type,
        userId,
        error: error.message
      });

      this.metricsService.recordError('credential_error', 'create', error.code);
      throw error;
    }
  }

  async getDecryptedCredential(credentialId: string, userId: string): Promise<any> {
    const cacheKey = `credential:decrypted:${credentialId}:${userId}`;

    try {
      // Try cache first
      const cached = await this.cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get credential from database
      const credential = await this.queryBus.execute(
        new GetCredentialQuery(credentialId, userId)
      );

      if (!credential) {
        throw new CredentialNotFoundError(`Credential ${credentialId} not found`);
      }

      // Decrypt data
      const decryptedData = await this.encryptionService.decrypt(credential.encryptedData);
      const credentialData = JSON.parse(decryptedData);

      // Handle OAuth token refresh if needed
      if (credential.type.includes('oauth') && credentialData.refreshToken) {
        const refreshedData = await this.refreshOAuthTokenIfNeeded(credentialData, credential.type);
        if (refreshedData !== credentialData) {
          // Update credential with new tokens
          await this.updateCredentialData(credentialId, refreshedData, userId);
          credentialData = refreshedData;
        }
      }

      // Cache for 5 minutes
      await this.cacheService.set(cacheKey, credentialData, 300);

      return credentialData;

    } catch (error) {
      this.logger.error('Failed to get decrypted credential', {
        credentialId,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  async testCredentialConnection(credentialId: string, userId: string): Promise<CredentialTestResult> {
    this.logger.info('Testing credential connection', {
      credentialId,
      userId
    });

    // ========================================
// PHASE 4: MICROSERVICES IMPLEMENTATION
// ========================================

// 1. API Gateway Implementation
// apps/api-gateway/src/api-gateway.controller.ts
@Controller()
@UseGuards(JwtAuthGuard, RateLimitGuard)
@UseInterceptors(LoggingInterceptor, MetricsInterceptor)
export class ApiGatewayController {
  constructor(
    private readonly workflowService: WorkflowProxyService,
    private readonly executionService: ExecutionProxyService,
    private readonly nodeService: NodeProxyService,
    private readonly credentialService: CredentialProxyService,
    private readonly userService: UserProxyService,
    private readonly metricsService: MetricsService,
    private readonly logger: Logger
  ) {}

  // ========================================
  // WORKFLOW ENDPOINTS
  // ========================================

  @Post('workflows')
  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiResponse({ status: 201, type: WorkflowResponseDto })
  async createWorkflow(
    @Body() createDto: CreateWorkflowDto,
    @CurrentUser() user: UserEntity
  ): Promise<WorkflowResponseDto> {
    const correlationId = uuidv4();
    
    this.logger.info('Creating workflow via API Gateway', {
      userId: user.id,
      workflowName: createDto.name,
      correlationId
    });

    try {
      const result = await this.workflowService.createWorkflow({
        ...createDto,
        userId: user.id,
        correlationId
      });

      this.metricsService.recordApiRequest('POST', '/workflows', 201, user.id);
      return result;

    } catch (error) {
      this.logger.error('Failed to create workflow', { error: error.message, correlationId });
      this.metricsService.recordError('api_error', 'workflow-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  @Get('workflows')
  @ApiOperation({ summary: 'Get user workflows' })
  @ApiResponse({ status: 200, type: [WorkflowResponseDto] })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60) // Cache for 1 minute
  async getUserWorkflows(
    @Query() queryDto: GetWorkflowsQueryDto,
    @CurrentUser() user: UserEntity
  ): Promise<WorkflowListResponseDto> {
    try {
      const result = await this.workflowService.getUserWorkflows({
        userId: user.id,
        ...queryDto
      });

      this.metricsService.recordApiRequest('GET', '/workflows', 200, user.id);
      return result;

    } catch (error) {
      this.logger.error('Failed to get workflows', { error: error.message, userId: user.id });
      this.metricsService.recordError('api_error', 'workflow-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  @Get('workflows/:id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  @ApiResponse({ status: 200, type: WorkflowResponseDto })
  async getWorkflow(
    @Param('id', ParseUUIDPipe) workflowId: string,
    @CurrentUser() user: UserEntity
  ): Promise<WorkflowResponseDto> {
    try {
      const result = await this.workflowService.getWorkflow(workflowId, user.id);
      this.metricsService.recordApiRequest('GET', `/workflows/${workflowId}`, 200, user.id);
      return result;

    } catch (error) {
      this.logger.error('Failed to get workflow', { error: error.message, workflowId, userId: user.id });
      this.metricsService.recordError('api_error', 'workflow-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  @Put('workflows/:id')
  @ApiOperation({ summary: 'Update workflow' })
  @ApiResponse({ status: 200, type: WorkflowResponseDto })
  async updateWorkflow(
    @Param('id', ParseUUIDPipe) workflowId: string,
    @Body() updateDto: UpdateWorkflowDto,
    @CurrentUser() user: UserEntity
  ): Promise<WorkflowResponseDto> {
    try {
      const result = await this.workflowService.updateWorkflow(workflowId, {
        ...updateDto,
        userId: user.id
      });

      this.metricsService.recordApiRequest('PUT', `/workflows/${workflowId}`, 200, user.id);
      return result;

    } catch (error) {
      this.logger.error('Failed to update workflow', { error: error.message, workflowId, userId: user.id });
      this.metricsService.recordError('api_error', 'workflow-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  @Delete('workflows/:id')
  @ApiOperation({ summary: 'Delete workflow' })
  @ApiResponse({ status: 204 })
  async deleteWorkflow(
    @Param('id', ParseUUIDPipe) workflowId: string,
    @CurrentUser() user: UserEntity
  ): Promise<void> {
    try {
      await this.workflowService.deleteWorkflow(workflowId, user.id);
      this.metricsService.recordApiRequest('DELETE', `/workflows/${workflowId}`, 204, user.id);

    } catch (error) {
      this.logger.error('Failed to delete workflow', { error: error.message, workflowId, userId: user.id });
      this.metricsService.recordError('api_error', 'workflow-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  // ========================================
  // EXECUTION ENDPOINTS
  // ========================================

  @Post('workflows/:id/execute')
  @ApiOperation({ summary: 'Execute workflow' })
  @ApiResponse({ status: 202, type: ExecutionResponseDto })
  @Throttle(10, 60) // 10 executions per minute
  async executeWorkflow(
    @Param('id', ParseUUIDPipe) workflowId: string,
    @Body() executeDto: ExecuteWorkflowDto,
    @CurrentUser() user: UserEntity
  ): Promise<ExecutionResponseDto> {
    const correlationId = uuidv4();

    this.logger.info('Executing workflow via API Gateway', {
      workflowId,
      userId: user.id,
      mode: executeDto.mode,
      correlationId
    });

    try {
      const result = await this.executionService.executeWorkflow({
        workflowId,
        userId: user.id,
        input: executeDto.input,
        mode: executeDto.mode,
        correlationId
      });

      this.metricsService.recordApiRequest('POST', `/workflows/${workflowId}/execute`, 202, user.id);
      return result;

    } catch (error) {
      this.logger.error('Failed to execute workflow', { 
        error: error.message, 
        workflowId, 
        userId: user.id,
        correlationId 
      });
      this.metricsService.recordError('api_error', 'execution-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  @Get('workflows/:id/executions')
  @ApiOperation({ summary: 'Get workflow execution history' })
  @ApiResponse({ status: 200, type: ExecutionHistoryResponseDto })
  async getExecutionHistory(
    @Param('id', ParseUUIDPipe) workflowId: string,
    @Query() queryDto: ExecutionHistoryQueryDto,
    @CurrentUser() user: UserEntity
  ): Promise<ExecutionHistoryResponseDto> {
    try {
      const result = await this.executionService.getExecutionHistory({
        workflowId,
        userId: user.id,
        ...queryDto
      });

      this.metricsService.recordApiRequest('GET', `/workflows/${workflowId}/executions`, 200, user.id);
      return result;

    } catch (error) {
      this.logger.error('Failed to get execution history', { 
        error: error.message, 
        workflowId, 
        userId: user.id 
      });
      this.metricsService.recordError('api_error', 'execution-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  @Get('executions/:id')
  @ApiOperation({ summary: 'Get execution details' })
  @ApiResponse({ status: 200, type: ExecutionDetailsResponseDto })
  async getExecution(
    @Param('id', ParseUUIDPipe) executionId: string,
    @CurrentUser() user: UserEntity
  ): Promise<ExecutionDetailsResponseDto> {
    try {
      const result = await this.executionService.getExecution(executionId, user.id);
      this.metricsService.recordApiRequest('GET', `/executions/${executionId}`, 200, user.id);
      return result;

    } catch (error) {
      this.logger.error('Failed to get execution', { 
        error: error.message, 
        executionId, 
        userId: user.id 
      });
      this.metricsService.recordError('api_error', 'execution-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  @Post('executions/:id/stop')
  @ApiOperation({ summary: 'Stop running execution' })
  @ApiResponse({ status: 200 })
  async stopExecution(
    @Param('id', ParseUUIDPipe) executionId: string,
    @Body() stopDto: StopExecutionDto,
    @CurrentUser() user: UserEntity
  ): Promise<void> {
    try {
      await this.executionService.stopExecution({
        executionId,
        userId: user.id,
        reason: stopDto.reason
      });

      this.metricsService.recordApiRequest('POST', `/executions/${executionId}/stop`, 200, user.id);

    } catch (error) {
      this.logger.error('Failed to stop execution', { 
        error: error.message, 
        executionId, 
        userId: user.id 
      });
      this.metricsService.recordError('api_error', 'execution-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  // ========================================
  // NODE ENDPOINTS
  // ========================================

  @Get('nodes')
  @ApiOperation({ summary: 'Get available nodes' })
  @ApiResponse({ status: 200, type: [NodeDefinitionDto] })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // Cache for 5 minutes
  async getNodes(
    @Query() queryDto: GetNodesQueryDto
  ): Promise<NodeDefinitionDto[]> {
    try {
      const result = await this.nodeService.getNodes(queryDto);
      this.metricsService.recordApiRequest('GET', '/nodes', 200);
      return result;

    } catch (error) {
      this.logger.error('Failed to get nodes', { error: error.message });
      this.metricsService.recordError('api_error', 'node-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  @Get('nodes/:type')
  @ApiOperation({ summary: 'Get node definition' })
  @ApiResponse({ status: 200, type: NodeDefinitionDto })
  async getNodeDefinition(
    @Param('type') nodeType: string
  ): Promise<NodeDefinitionDto> {
    try {
      const result = await this.nodeService.getNodeDefinition(nodeType);
      this.metricsService.recordApiRequest('GET', `/nodes/${nodeType}`, 200);
      return result;

    } catch (error) {
      this.logger.error('Failed to get node definition', { error: error.message, nodeType });
      this.metricsService.recordError('api_error', 'node-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  // ========================================
  // CREDENTIAL ENDPOINTS
  // ========================================

  @Post('credentials')
  @ApiOperation({ summary: 'Create credential' })
  @ApiResponse({ status: 201, type: CredentialResponseDto })
  async createCredential(
    @Body() createDto: CreateCredentialDto,
    @CurrentUser() user: UserEntity
  ): Promise<CredentialResponseDto> {
    try {
      const result = await this.credentialService.createCredential({
        ...createDto,
        userId: user.id
      });

      this.metricsService.recordApiRequest('POST', '/credentials', 201, user.id);
      return result;

    } catch (error) {
      this.logger.error('Failed to create credential', { error: error.message, userId: user.id });
      this.metricsService.recordError('api_error', 'credential-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  @Get('credentials')
  @ApiOperation({ summary: 'Get user credentials' })
  @ApiResponse({ status: 200, type: [CredentialResponseDto] })
  async getUserCredentials(
    @Query() queryDto: GetCredentialsQueryDto,
    @CurrentUser() user: UserEntity
  ): Promise<CredentialResponseDto[]> {
    try {
      const result = await this.credentialService.getUserCredentials({
        userId: user.id,
        ...queryDto
      });

      this.metricsService.recordApiRequest('GET', '/credentials', 200, user.id);
      return result;

    } catch (error) {
      this.logger.error('Failed to get credentials', { error: error.message, userId: user.id });
      this.metricsService.recordError('api_error', 'credential-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  @Post('credentials/:id/test')
  @ApiOperation({ summary: 'Test credential connection' })
  @ApiResponse({ status: 200, type: CredentialTestResponseDto })
  async testCredential(
    @Param('id', ParseUUIDPipe) credentialId: string,
    @CurrentUser() user: UserEntity
  ): Promise<CredentialTestResponseDto> {
    try {
      const result = await this.credentialService.testCredential(credentialId, user.id);
      this.metricsService.recordApiRequest('POST', `/credentials/${credentialId}/test`, 200, user.id);
      return result;

    } catch (error) {
      this.logger.error('Failed to test credential', { 
        error: error.message, 
        credentialId, 
        userId: user.id 
      });
      this.metricsService.recordError('api_error', 'credential-service', error.code);
      throw this.handleServiceError(error);
    }
  }

  // ========================================
  // ERROR HANDLING
  // ========================================

  private handleServiceError(error: any): HttpException {
    if (error.code === 'NOT_FOUND') {
      return new NotFoundException(error.message);
    }
    
    if (error.code === 'VALIDATION_ERROR') {
      return new BadRequestException(error.message);
    }
    
    if (error.code === 'UNAUTHORIZED') {
      return new UnauthorizedException(error.message);
    }
    
    if (error.code === 'FORBIDDEN') {
      return new ForbiddenException(error.message);
    }
    
    if (error.code === 'CONFLICT') {
      return new ConflictException(error.message);
    }
    
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return new TooManyRequestsException(error.message);
    }

    // Log unexpected errors
    this.logger.error('Unexpected service error', {
      error: error.message,
      stack: error.stack,
      code: error.code
    });

    return new InternalServerErrorException('Internal server error');
  }
}

// 2. Workflow Orchestrator Service
// apps/workflow-orchestrator/src/workflow-orchestrator.service.ts
@Injectable()
export class WorkflowOrchestratorService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    private readonly executionEngine: ExecutionEngine,
    private readonly nodeRegistry: NodeRegistryService,
    private readonly credentialService: CredentialService,
    private readonly variableService: VariableService,
    private readonly metricsService: MetricsService,
    private readonly logger: Logger
  ) {}

  async executeWorkflow(request: ExecuteWorkflowRequest): Promise<ExecutionResult> {
    const { workflowId, userId, input, mode, correlationId } = request;

    this.logger.info('Starting workflow execution', {
      workflowId,
      userId,
      mode,
      correlationId
    });

    const startTime = Date.now();

    try {
      // 1. Load and validate workflow
      const workflow = await this.queryBus.execute(
        new GetWorkflowQuery(workflowId, userId)
      );

      if (!workflow) {
        throw new WorkflowNotFoundError(`Workflow ${workflowId} not found`);
      }

      if (!workflow.active && mode === ExecutionMode.TRIGGER) {
        throw new InactiveWorkflowError(`Workflow ${workflowId} is not active`);
      }

      // 2. Validate user permissions
      await this.validateExecutionPermissions(workflow, userId);

      // 3. Build execution context
      const executionContext = await this.buildExecutionContext(workflow, input, userId);

      // 4. Create execution record
      const execution = await this.commandBus.execute(
        new CreateExecutionCommand({
          workflowId,
          userId,
          input,
          mode,
          correlationId
        })
      );

      // 5. Publish execution started event
      await this.eventBus.publish(
        new WorkflowExecutionStartedEvent(
          workflowId,
          execution.id,
          userId,
          new Date()
        )
      );

      // 6. Execute workflow asynchronously
      this.executeWorkflowAsync(execution, workflow, executionContext)
        .catch(error => {
          this.logger.error('Async workflow execution failed', {
            executionId: execution.id,
            workflowId,
            error: error.message
          });
        });

      return {
        executionId: execution.id,
        status: ExecutionStatus.RUNNING,
        startedAt: execution.startedAt,
        correlationId
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.metricsService.recordWorkflowExecution(
        workflowId,
        'failed',
        mode,
        userId,
        duration / 1000
      );

      this.logger.error('Workflow execution failed', {
        workflowId,
        userId,
        correlationId,
        error: error.message,
        duration
      });

      throw error;
    }
  }

  private async executeWorkflowAsync(
    execution: WorkflowExecution,
    workflow: Workflow,
    context: ExecutionContext
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Execute workflow using the execution engine
      const result = await this.executionEngine.execute(workflow, context);

      // Update execution record
      await this.commandBus.execute(
        new CompleteExecutionCommand({
          executionId: execution.id,
          result,
          completedAt: new Date()
        })
      );

      const duration = (Date.now() - startTime) / 1000;

      // Record metrics
      this.metricsService.recordWorkflowExecution(
        workflow.id.value,
        result.status,
        execution.mode,
        execution.triggeredBy,
        duration
      );

      // Publish completion event
      await this.eventBus.publish(
        new WorkflowExecutionCompletedEvent(
          workflow.id.value,
          execution.id,
          result.status,
          duration,
          new Date()
        )
      );

      this.logger.info('Workflow execution completed successfully', {
        executionId: execution.id,
        workflowId: workflow.id.value,
        status: result.status,
        duration
      });

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;

      // Update execution record with error
      await this.commandBus.execute(
        new FailExecutionCommand({
          executionId: execution.id,
          error: {
            message: error.message,
            stack: error.stack,
            code: error.code
          },
          failedAt: new Date()
        })
      );

      // Record metrics
      this.metricsService.recordWorkflowExecution(
        workflow.id.value,
        'failed',
        execution.mode,
        execution.triggeredBy,
        duration
      );

      // Publish failure event
      await this.eventBus.publish(
        new WorkflowExecutionFailedEvent(
          workflow.id.value,
          execution.id,
          error.message,
          new Date()
        )
      );

      this.logger.error('Workflow execution failed', {
        executionId: execution.id,
        workflowId: workflow.id.value,
        error: error.message,
        duration
      });
    }
  }

  private async buildExecutionContext(
    workflow: Workflow,
    input: any,
    userId: string
  ): Promise<ExecutionContext> {
    // Resolve environment variables
    const environmentVariables = await this.variableService.resolveEnvironmentVariables(
      workflow.settings.environment
    );

    // Resolve global variables
    const globalVariables = await this.variableService.resolveGlobalVariables(userId);

    // Resolve credentials for all nodes
    const nodeCredentials = new Map<string, any>();
    
    for (const node of workflow.nodes) {
      if (node.credentialId) {
        try {
          const credential = await this.credentialService.getDecryptedCredential(
            node.credentialId.value,
            userId
          );
          nodeCredentials.set(node.id.value, credential);
        } catch (error) {
          this.logger.warn('Failed to resolve credential for node', {
            nodeId: node.id.value,
            credentialId: node.credentialId.value,
            error: error.message
          });
        }
      }
    }

    return new ExecutionContext({
      input,
      environmentVariables,
      globalVariables,
      nodeCredentials,
      userId,
      workflowId: workflow.id.value,
      executionMode: ExecutionMode.MANUAL
    });
  }

  private async validateExecutionPermissions(workflow: Workflow, userId: string): Promise<void> {
    // Check if user owns the workflow or has execution permissions
    if (workflow.createdBy.value !== userId) {
      // Check if user has shared access to this workflow
      const hasPermission = await this.queryBus.execute(
        new CheckWorkflowPermissionQuery(workflow.id.value, userId, 'execute')
      );

      if (!hasPermission) {
        throw new InsufficientPermissionsError(
          `User ${userId} does not have permission to execute workflow ${workflow.id.value}`
        );
      }
    }
  }
}

// 3. Node Runtime Engine Service
// apps/node-runtime-engine/src/node-runtime-engine.service.ts
@Injectable()
export class NodeRuntimeEngineService {
  private readonly vm: NodeVM;
  private readonly sandboxes: Map<string, any> = new Map();

  constructor(
    private readonly nodeRegistry: NodeRegistryService,
    private readonly logger: Logger,
    private readonly metricsService: MetricsService
  ) {
    this.vm = new NodeVM({
      console: 'inherit',
      sandbox: {},
      require: {
        external: ['lodash', 'moment', 'crypto', 'axios'],
        builtin: ['crypto', 'util', 'path'],
        root: './node_modules/'
      },
      timeout: 30000 // 30 second timeout
    });
  }

  async executeNode(request: NodeExecutionRequest): Promise<NodeExecutionResult> {
    const { nodeId, nodeType, parameters, inputData, credentials, context } = request;
    const startTime = Date.now();

    this.logger.debug('Executing node', {
      nodeId,
      nodeType,
      executionId: context.executionId
    });

    try {
      // Get node definition
      const nodeDefinition = await this.nodeRegistry.getNodeDefinition(nodeType);
      if (!nodeDefinition) {
        throw new NodeNotFoundError(`Node type ${nodeType} not found`);
      }

      // Validate node parameters
      this.validateNodeParameters(nodeDefinition, parameters);

      // Create execution sandbox
      const sandbox = this.createExecutionSandbox(inputData, parameters, credentials, context);

      // Execute node based on type
      let result: any;
      
      if (nodeDefinition.category === 'core') {
        result = await this.executeCoreNode(nodeDefinition, sandbox);
      } else if (nodeDefinition.category === 'trigger') {
        result = await this.executeTriggerNode(nodeDefinition, sandbox);
      } else {
        result = await this.executeIntegrationNode(nodeDefinition, sandbox);
      }

      const duration = Date.now() - startTime;

      this.logger.debug('Node execution completed', {
        nodeId,
        nodeType,
        duration,
        outputItems: Array.isArray(result) ? result.length : 1
      });

      return {
        nodeId,
        status: 'success',
        outputData: result,
        executionTime: duration,
        metadata: {
          itemsProcessed: Array.isArray(inputData) ? inputData.length : 1,
          itemsReturned: Array.isArray(result) ? result.length : 1
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('Node execution failed', {
        nodeId,
        nodeType,
        error: error.message,
        duration
      });

      this.metricsService.recordError('node_execution_error', 'node-runtime-engine', error.code);

      return {
        nodeId,
        status: 'error',
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code || 'UNKNOWN_ERROR'
        },
        executionTime: duration
      };
    } finally {
      // Clean up sandbox
      this.sandboxes.delete(nodeId);
    }
  }

  private createExecutionSandbox(
    inputData: any,
    parameters: any,
    credentials: any,
    context: ExecutionContext
  ): any {
    const sandbox = {
      // Input data
      $input: inputData,
      $json: inputData,
      
      // Parameters
      $parameter: parameters,
      
      // Credentials (only expose what's needed)
      $credentials: credentials,
      
      // Utility functions
      $: require('lodash'),
      moment: require('moment'),
      
      // Node execution helpers
      $item: (index: number) => Array.isArray(inputData) ? inputData[index] : inputData,
      $items: () => Array.isArray(inputData) ? inputData : [inputData],
      
      // Expression evaluation
      $evaluateExpression: (expression: string, itemIndex?: number) => {
        return this.evaluateExpression(expression, inputData, parameters, itemIndex);
      },
      
      // HTTP request helper
      $httpRequest: async (options: any) => {
        return this.makeHttpRequest(options, credentials);
      },
      
      // Context information
      $executionId: context.executionId,
      $workflowId: context.workflowId,
      $userId: context.userId,
      
      // Environment variables
      $env: context.environmentVariables,
      
      // Console for debugging
      console: {
        log: (...args: any[]) => this.logger.debug('Node console.log', { args }),
        error: (...args: any[]) => this.logger.error('Node console.error', { args }),
        warn: (...args: any[]) => this.logger.warn('Node console.warn', { args }),
        info: (...args: any[]) => this.logger.info('Node console.info', { args })
      }
    };

    return sandbox;
  }

  private async executeCoreNode(nodeDefinition: any, sandbox: any): Promise<any> {
    switch (nodeDefinition.name) {
      case 'Code':
        return this.executeCodeNode(nodeDefinition, sandbox);
      
      case 'Function':
        return this.executeFunctionNode(nodeDefinition, sandbox);
      
      case 'IF':
        return this.executeIfNode(nodeDefinition, sandbox);
      
      case 'Switch':
        return this.executeSwitchNode(nodeDefinition, sandbox);
      
      case 'Set':
        return this.executeSetNode(nodeDefinition, sandbox);
      
      case 'Merge':
        return this.executeMergeNode(nodeDefinition, sandbox);
      
      default:
        throw new UnsupportedNodeError(`Core node ${nodeDefinition.name} not implemented`);
    }
  }

  private async executeCodeNode(nodeDefinition: any, sandbox: any): Promise<any> {
    const code = sandbox.$parameter.jsCode;
    if (!code) {
      throw new InvalidNodeParameterError('Code node requires jsCode parameter');
    }

    try {
      // Execute code in secure VM
      const result = this.vm.run(code, 'code-node.js', {
        sandbox: sandbox
      });

      // Handle different return types
      if (typeof result === 'function') {
        return result();
      }

      return result;

    } catch (error) {
      throw new NodeExecutionError(`Code execution failed: ${error.message}`);
    }
  }

  private async executeFunctionNode(nodeDefinition: any, sandbox: any): Promise<any> {
    const functionCode = sandbox.$parameter.functionCode;
    if (!functionCode) {
      throw new InvalidNodeParameterError('Function node requires functionCode parameter');
    }

    try {
      // Wrap function code in a function that returns the result
      const wrappedCode = `
        (function() {
          ${functionCode}
          return items;
        })()
      `;

      const result = this.vm.run(wrappedCode, 'function-node.js', {
        sandbox: {
          ...sandbox,
          items: sandbox.$items()
        }
      });

      return result;

    } catch (error) {
      throw new NodeExecutionError(`Function execution failed: ${error.message}`);
    }
  }

  private async executeIfNode(nodeDefinition: