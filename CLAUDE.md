# Red Baez Business Suite - Agent OS Enabled

> Task Forecasting Platform for Independent Professionals
> Agent OS Framework Installed
> Last Updated: 2025-07-30

## Project Context

This is a **task forecasting and productivity optimization platform** targeting small business owners, independent consultants, and digital agencies. The platform helps busy professionals predict workload, track velocity, and optimize their workflow without the complexity of enterprise project management tools.

### Core Product Vision
- **Problem**: Independent professionals struggle with workload chaos, poor forecasting, and accountability gaps
- **Solution**: AI-powered task forecasting with velocity tracking and intelligent workflow optimization
- **Users**: Solo entrepreneurs, consultants, and small agency owners (2-10 people teams)

## Agent OS Documentation

### Product Context
- **Mission & Vision:** @.agent-os/product/mission.md
- **Technical Architecture:** @.agent-os/product/tech-stack.md
- **Development Roadmap:** @.agent-os/product/roadmap.md
- **Decision History:** @.agent-os/product/decisions.md

### Development Standards
- **Code Style:** @~/.agent-os/standards/code-style.md
- **Best Practices:** @~/.agent-os/standards/best-practices.md

### Project Management
- **Active Specs:** @.agent-os/specs/
- **Spec Planning:** Use `@~/.agent-os/instructions/create-spec.md`
- **Tasks Execution:** Use `@~/.agent-os/instructions/execute-tasks.md`

## Workflow Instructions

When asked to work on this codebase:

1. **First**, check @.agent-os/product/roadmap.md for current priorities
2. **Then**, follow the appropriate instruction file:
   - For new features: @.agent-os/instructions/create-spec.md
   - For tasks execution: @.agent-os/instructions/execute-tasks.md
3. **Always**, adhere to the standards in the files listed above

## Important Notes

- Product-specific files in `.agent-os/product/` override any global standards
- User's specific instructions override (or amend) instructions found in `.agent-os/specs/...`
- Always adhere to established patterns, code style, and best practices documented above.

## Current Tech Stack

### Frontend Architecture
- **React 18.3.1** with TypeScript 5.5.3
- **Vite 5.4.1** for development and build
- **Tailwind CSS 3.4.11** with shadcn/ui components
- **React Query 5.56.2** for state management and caching
- **React Router DOM 6.26.2** for client-side routing

### Backend & Services
- **Supabase** - PostgreSQL database with real-time subscriptions
- **OpenAI GPT-4o-mini** - AI content generation and analysis
- **Perplexity API** - AI news curation and intelligence

### Key Capabilities
- CRM with client management and revenue tracking
- Cross-department task management with priority tracking
- AI-powered content generation (LinkedIn posts, newsletters)
- Strategic planning dashboards for different business functions
- Real-time data synchronization with optimized caching

## Development Guidelines

### Code Quality Standards
- **TypeScript First**: All components and logic must be properly typed
- **Component Architecture**: Follow shadcn/ui patterns with Radix primitives
- **State Management**: Use React Query for server state, local state for UI
- **Error Handling**: Implement error boundaries and graceful degradation
- **Performance**: Lazy load components, optimize bundle size, cache appropriately

### AI Feature Development
- **Privacy First**: Explicit user consent for AI data processing
- **Graceful Degradation**: Features work when AI services unavailable
- **Response Time**: AI features must respond within 5 seconds
- **Quality Control**: Generated content meets professional standards
- **Cost Monitoring**: Track API usage to prevent overruns

### User Experience Focus
- **Independent Professional Workflow**: Design for busy professionals wearing multiple hats
- **Mobile Responsive**: All features work on desktop, tablet, and mobile
- **Accessibility**: WCAG AA compliance with keyboard navigation
- **Performance**: Page loads under 3 seconds, task operations under 500ms
- **Dark/Light Theme**: Full theme support across all components

## Workflow Instructions

When working on this codebase:

### 1. Daily Development
Start each session with:
```
/daily-dev
```
This runs automated analysis, cleanup, and quality checks.

### 2. Feature Development
For new features:
```
/create-spec [feature description]
```
Then execute with:
```
/execute-tasks
```

### 3. Pre-Deployment
Before any deployment:
```
/pre-deploy-check
```
Ensures all quality gates pass.

### 4. Code Analysis
For deep codebase insights:
```
/analyze-codebase
```

## Project Priorities

### Phase 1: Core Forecasting (Current Focus)
- Velocity Score System - measure forecast accuracy vs. actual completion
- Enhanced Task Estimation with confidence intervals
- Personal Productivity Reporting with trend analysis
- Smart Task Prioritization using AI suggestions

### Phase 2: AI Intelligence  
- Daily Digest Agent for morning briefings
- Weekly Planner Assistant with ROI prioritization
- Motivation Nudges based on task themes and progress
- Smart Rescheduling for missed deadlines

### Key Success Metrics
- **1,000 free users** by end of Q2
- **100 paid users** within 3 months of launch
- **$5,000 MRR** within 6 months
- **40%+ DAU/WAU retention** for power users

## Important Context

### Target User Needs
- **Clarity over Complexity**: Simple interfaces that provide immediate value
- **Forecasting Accuracy**: Reliable predictions for capacity planning
- **Client Professionalism**: Reports and communications that reflect well on their business
- **Workflow Integration**: Features that fit naturally into existing daily routines

### Technical Constraints
- **Supabase Architecture**: Leverage edge functions for AI processing
- **Bundle Size**: Keep total bundle under 500KB gzipped
- **Mobile Performance**: Ensure smooth experience on mobile devices
- **AI Costs**: Monitor and optimize AI API usage for sustainability

### Architectural Decisions
- React/TypeScript + Supabase provides rapid development with type safety
- React Query handles complex server state synchronization automatically
- shadcn/ui ensures consistent, accessible design system
- AI services isolated in `/services/ai/` for easy provider swapping

---

**Remember**: This platform serves busy independent professionals who need reliable, fast, and intuitive tools to manage their workload and communicate professionally with clients. Every feature should reduce complexity, not add it.
---

## 🚀 Ultimate Dev System Integration

This project is configured with the Ultimate Dev System for enhanced AI-assisted development.

### Tool Routing (nodejs project)
- **Cursor**: UI development, quick changes (0-15K lines)
- **Augment**: Large refactoring, cross-file changes (15K+ lines)  
- **Claude Code**: Testing, automation, deployment

### Available Specialists
Use natural language to activate specialists:
- "Build the UI" → frontend-developer + ui-engineer
- "Fix database issues" → database-optimizer + debugger
- "Add security" → security-auditor + auth-engineer
- "Optimize performance" → performance-engineer + perf-optimizer

### Quick Commands
- `~/ultimate-dev-system/smart-workflow.sh` - Context-aware recommendations
- `~/ultimate-dev-system/quick-switch.sh redbaez-biz` - Switch to this project
- Tell Claude: "Continue working on redbaez-biz" for smart continuation

### Configuration Files
- `.cursor/rules/` - Cursor-specific rules and specialist routing
- `.claude/commands/` - Custom Claude commands for this project
- `.augment/config.json` - Augment configuration and preferences
