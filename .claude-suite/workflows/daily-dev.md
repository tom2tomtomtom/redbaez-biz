# Daily Development Workflow

<workflow_meta>
  <name>daily-dev</name>
  <description>Standard daily development workflow for Red Baez Business Suite</description>
  <estimated_time>15-30 minutes</estimated_time>
  <frequency>daily</frequency>
</workflow_meta>

## Workflow Overview

This automated workflow helps maintain code quality, identify issues early, and ensure consistent development practices for the task forecasting platform.

<workflow_steps>
  <step number="1">
    <name>Codebase Health Check</name>
    <command>/analyze-codebase</command>
    <condition>always</condition>
    <description>Analyze current codebase for issues, technical debt, and optimization opportunities</description>
  </step>
  
  <step number="2">
    <name>Code Quality Cleanup</name>
    <command>/clean-codebase</command>
    <condition>if_issues_found</condition>
    <description>Automatically fix linting issues, update imports, and optimize code structure</description>
  </step>
  
  <step number="3">
    <name>Dependency Security Check</name>
    <command>/security-audit</command>
    <condition>weekly</condition>
    <description>Check for security vulnerabilities in dependencies and suggest updates</description>
  </step>
  
  <step number="4">
    <name>Test Coverage Analysis</name>
    <command>/analyze-tests</command>
    <condition>if_code_changed</condition>
    <description>Identify missing test coverage and suggest test improvements</description>
  </step>
  
  <step number="5">
    <name>Performance Monitoring</name>
    <command>/performance-check</command>
    <condition>if_bundle_changed</condition>
    <description>Analyze bundle size, component performance, and loading times</description>
  </step>
</workflow_steps>

## Success Criteria

- **Code Quality**: No ESLint errors or TypeScript issues
- **Security**: No high-severity vulnerabilities
- **Performance**: Bundle size under acceptable limits
- **Test Coverage**: Critical paths have adequate test coverage

## Daily Checklist

- [ ] Review any issues found by codebase analysis
- [ ] Address high-priority code quality issues
- [ ] Update dependencies if security issues found
- [ ] Verify all TypeScript types are properly defined
- [ ] Check React Query cache strategies are optimal
- [ ] Ensure AI service integrations are functioning
- [ ] Validate Supabase connection and RLS policies

## Integration Points

### React Query Optimization
- Check for unnecessary re-renders
- Validate query keys are properly structured
- Ensure stale times are appropriate for data types

### Supabase Health
- Verify edge function deployments
- Check database query performance
- Validate RLS policies are secure and efficient

### AI Service Monitoring
- Test OpenAI and Perplexity API connections
- Monitor AI feature response times
- Validate content generation quality

## Automation Triggers

### Git Hooks Integration
```bash
# Pre-commit: Run linting and basic checks
npm run lint
npm run type-check

# Pre-push: Run tests and security checks
npm run test
npm audit --audit-level high
```

### Continuous Integration
- Trigger on pull request creation
- Run full workflow on main branch pushes
- Schedule weekly comprehensive analysis

## Customization Options

### Frequency Settings
- **Daily**: Core quality checks
- **Weekly**: Comprehensive security audit  
- **Monthly**: Dependency updates and architecture review

### Condition Modifiers
- `always`: Run every time
- `if_issues_found`: Only when problems detected
- `if_code_changed`: Only when relevant files modified
- `weekly`: Once per week regardless of changes