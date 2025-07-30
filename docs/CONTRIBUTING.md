# 🤝 Contributing to N8N Clone

Thank you for your interest in contributing to the N8N Clone project! This guide will help you get started with contributing to our open-source workflow automation platform.

## 📋 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

### 1. Fork the Repository
Fork the repository on GitHub and clone your fork locally:

```bash
git clone https://github.com/<your-username>/n8n-clone.git
cd n8n-clone
```

### 2. Set Up Development Environment
Follow the [Getting Started Guide](./09-getting-started.md) to set up your local development environment.

### 3. Create a Branch
Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

## 🛠️ Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages

### Testing
- Write unit tests for new features
- Ensure all tests pass before submitting a PR
- Aim for at least 80% code coverage

### Documentation
- Update documentation for any new features
- Include code examples where appropriate
- Update the API documentation if you change any endpoints

## 📝 Submitting Changes

### 1. Commit Your Changes
Make sure your commits are atomic and have clear messages:

```bash
git add .
git commit -m "feat: add new integration node for Slack"
```

### 2. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 3. Create a Pull Request
Create a pull request from your fork to the main repository:
- Provide a clear title and description
- Reference any related issues
- Include screenshots if applicable
- Ensure all checks pass

## 🐛 Reporting Issues

### Bug Reports
When reporting bugs, please include:
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment details (OS, Node.js version, etc.)
- Screenshots or error logs

### Feature Requests
For feature requests, please include:
- Clear description of the feature
- Use case and benefits
- Any implementation ideas

## 🔌 Contributing Integration Nodes

We welcome contributions of new integration nodes! Please:
1. Follow the [Integration Nodes Guide](./08-integration-nodes.md)
2. Ensure the node follows our design patterns
3. Include comprehensive tests
4. Document the node's functionality
5. Test with real API credentials (if applicable)

## 📚 Areas for Contribution

We particularly welcome contributions in these areas:
- New integration nodes
- Performance improvements
- Bug fixes
- Documentation improvements
- Test coverage
- Security enhancements

## 💬 Community

- **Discord**: [Join our community](https://discord.gg/n8n-clone)
- **GitHub Discussions**: Ask questions and share ideas
- **Twitter**: Follow [@n8nclone](https://twitter.com/n8nclone) for updates

## 🏆 Recognition

Contributors will be recognized in our:
- README file
- Release notes
- Annual contributor report

Thank you for helping make N8N Clone better for everyone! 🎉
