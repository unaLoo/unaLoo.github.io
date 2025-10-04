---
title: 依赖注入
date: 2025-09-26
tags:
  - 设计模式
---
# 依赖注入（Dependency Injection, DI）

依赖注入是一种**设计模式**，用于实现**控制反转（Inversion of Control, IoC）**，它的核心思想是：**对象不应该自己创建或查找它所依赖的其他对象，而应该由外部将这些依赖“注入”进来**。

## 1. 问题背景：紧耦合的代码

先看一个没有使用依赖注入的例子：

```ts
class EmailService {
  send(to: string, message: string) {
    console.log(`发送邮件到 ${to}: ${message}`);
  }
}

class UserService {
  private emailService = new EmailService(); // 紧耦合！
  
  register(email: string) {
    // 业务逻辑
    this.emailService.send(email, "欢迎注册！");
  }
}
```

**问题：**
- `UserService` 和 `EmailService` 紧密耦合
- 无法轻松替换邮件服务（比如换成短信服务）
- 难以测试（无法 mock `EmailService`）
- 违反了**单一职责原则**（UserService 既要处理用户逻辑，又要负责创建依赖）

## 2. 依赖注入的基本方案

### 构造函数注入（标准依赖注入）

```ts
interface NotificationService {
  send(to: string, message: string): void;
}

class EmailService implements NotificationService {
  send(to: string, message: string) {
    console.log(`📧 发送邮件到 ${to}: ${message}`);
  }
}

class SMSService implements NotificationService {
  send(to: string, message: string) {
    console.log(`📱 发送短信到 ${to}: ${message}`);
  }
}

// UserService 不再关心具体使用哪个服务
class UserService {
  constructor(private notificationService: NotificationService) {}
  
  register(email: string) {
    this.notificationService.send(email, "欢迎注册！");
  }
}

// 使用时注入依赖
const emailUser = new UserService(new EmailService());
const smsUser = new UserService(new SMSService());
```

### 属性注入

`setXXX` 方法，注入外部依赖到实例属性。

```ts
class UserService {
  notificationService!: NotificationService;

  setNotificationService(service: NotificationService) {
    this.notificationService = service;
  }
}
```

### 方法注入

这里其实不算注入，应该叫依赖传递。

```ts
class UserService {
  register(email: string, notificationService: NotificationService) {
    notificationService.send(email, "欢迎注册！");
  }
}
```

## 3. 依赖注入容器（DI Container）

手动管理依赖注入在复杂应用中会变得繁琐，这时就需要**依赖注入容器**，DI 容器的作用就是自动创建完整的依赖树。

### 场景：

```ts
class DatabaseConnection {
  connect() { /* ... */ }
}

class UserRepository {
  constructor(private db: DatabaseConnection) {} // 依赖 DatabaseConnection
}

class UserService {
  constructor(private repo: UserRepository) {} // 依赖 UserRepository
}

// 最终要创建 UserService，但需要自动创建：
// UserService ← UserRepository ← DatabaseConnection

// 1、手动创建实现
const db = new DatabaseConnection();
const repo = new UserRepository(db);
const service = new UserService(repo);

// 2、基于DI容器实现
const service = container.resolve<UserService>('UserService');
```

### 关键问题：

1、如何自动化地在运行时获取某个类的构造函数参数信息？
```ts
// 🔦 通过反射，或装饰器拿到构造函数元信息（参数类型信息）
function Injectable(): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata('design:paramtypes', [...], target);
  };
}

@Injectable()
class UserService {
  constructor(private notificationService: NotificationService) {}
}
```

2、针对递归依赖问题，需要递归解析并创建依赖

```ts
resolve<T>(token: string): T {
  const useClass = this.providers.get(token);
  
  // 获取构造函数的参数类型列表
  const paramTypes = Reflect.getMetadata('design:paramtypes', useClass);
  
  // 递归解析每个依赖
  const args = paramTypes.map((paramType: any) => {
    const paramName = paramType.name; // 如 "NotificationService"
    return this.resolve(paramName);   // 递归创建依赖
  });
  
  return new useClass(...args); // 用解析好的依赖实例化
}
```

3、支持实例的生命周期管理
- `singleton` 有的实例是单例的，整个应用只需要创建一次
- `transient` 有的是瞬态的，每次resolve都需要创建
- `scoped` 有的和作用域相关，比如每次 http 请求创建一个实例

```ts
container.register('Database', DatabaseConnection, { scope: 'singleton' });
```


### 简单模拟实现：

```ts
class DIContainer {
  private providers = new Map<string, Provider>();

  // 注册服务
  register<T>(
    token: string | (new (...args: any[]) => T),
    useClass?: new (...args: any[]) => T,
    scope: Scope = 'singleton'
  ): void {
    const key = typeof token === 'string' ? token : token.name;
    const impl = useClass || (token as new (...args: any[]) => T);
    
    this.providers.set(key, {
      useClass: impl,
      scope
    });
  }

  // 解析服务（带循环依赖检测）
  resolve<T>(token: string | (new (...args: any[]) => T)): T {
    const key = typeof token === 'string' ? token : token.name;
    const provider = this.providers.get(key);
    
    if (!provider) {
      throw new Error(`未注册的服务: ${key}`);
    }

    // 如果是单例且已创建，直接返回
    if (provider.scope === 'singleton' && provider.instance) {
      return provider.instance;
    }

    // 创建新实例
    const instance = this.instantiate(provider.useClass, new Set());
    
    // 缓存单例
    if (provider.scope === 'singleton') {
      provider.instance = instance;
    }

    return instance;
  }

  // 递归实例化（带循环依赖检测）
  private instantiate<T>(target: new (...args: any[]) => T, visiting: Set<string>): T {
    const typeName = target.name;
    
    // 检测循环依赖
    if (visiting.has(typeName)) {
      throw new Error(`检测到循环依赖: ${Array.from(visiting).join(' → ')} → ${typeName}`);
    }
    visiting.add(typeName);

    try {
      // 获取构造函数参数类型（由 emitDecoratorMetadata 生成）
      const paramTypes: (new (...args: any[]) => any)[] = 
        Reflect.getMetadata('design:paramtypes', target) || [];

      // 递归解析每个依赖
      const args = paramTypes.map(paramType => {
        if (!paramType) {
          throw new Error(`无法解析 ${typeName} 的某个依赖（可能是 any 或未启用 emitDecoratorMetadata）`);
        }
        return this.resolve(paramType);
      });

      return new target(...args);
    } finally {
      visiting.delete(typeName); // 清理访问记录
    }
  }
}
```


## 4. 在 TypeScript/JavaScript 框架中的应用

### NestJS 示例

```ts
@Injectable()
export class EmailService {
  send() { /* ... */ }
}

@Injectable()
export class UserService {
  constructor(private emailService: EmailService) {} // 自动注入
}

// 控制器中使用
@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {} // 自动注入
}
```

### Angular 示例

```ts
@Injectable({ providedIn: 'root' })
export class HttpService {
  // ...
}

@Component({
  selector: 'app-user',
  template: '...'
})
export class UserComponent {
  constructor(private httpService: HttpService) {} // 自动注入
}
```

## 5. 依赖注入的核心优势

✅ **解耦**
- 类只依赖抽象接口，不依赖具体实现
- 可以轻松替换依赖的实现

✅ **可维护性**
- 修改依赖实现不影响使用方代码
- 符合开闭原则（对扩展开放，对修改关闭）

✅ **可测试性**
```ts
// 测试时可以轻松 mock 依赖
class MockNotificationService implements NotificationService {
  sendCalls: string[] = [];
  send(to: string, message: string) {
    this.sendCalls.push(`${to}: ${message}`);
  }
}

// 测试 UserService
const mockService = new MockNotificationService();
const userService = new UserService(mockService);
userService.register("test@example.com");
expect(mockService.sendCalls).toHaveLength(1);
```

## 6. 实际应用场景

- **Web 框架**：处理 HTTP 请求、数据库连接、日志服务等
- **企业应用**：复杂的业务逻辑层，需要灵活替换服务实现
- **微服务架构**：不同服务间的依赖管理
- **插件系统**：动态加载和注入插件依赖

## 总结

依赖注入的本质是**将对象的创建和使用分离**，通过外部注入依赖来实现松耦合。它不是必需的，但在构建**大型、可维护、可测试**的应用程序时，是一个非常有价值的模式。现代 TypeScript 框架（如 NestJS、Angular）都内置了强大的依赖注入系统，让开发者能够专注于业务逻辑而不是依赖管理。