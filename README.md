# @tenorlab/react-dashboard

Foundation components for creating user-configurable, high-performance dashboards in React.

---

### Part of the Built With JavaScript Ecosystem
**Tenorlab** is the specialized software foundry for the [@builtwithjavascript](https://github.com/builtwithjavascript) ecosystem, focusing on modular, type-safe utilities and UI kits.

---

## 🚀 Quick Start

### Installation

Install the package via npm or pnpm:

```bash
npm install @tenorlab/react-dashboard
# or
pnpm add @tenorlab/react-dashboard
```

## Basic Usage
Tenorlab provides a modular approach to dashboard construction. Here is how to implement a basic grid-based dashboard:
```typescript
import React from 'react'
import { DashboardProvider, DashboardGrid, Widget } from '@tenorlab/react-dashboard'

const MyDashboard = () => {
  return (
    <DashboardProvider>
      <DashboardGrid columns={12} gap={16}>
        <Widget id="revenue-chart" title="Revenue Overview">
          {/* Your Chart Component Here */}
          <div>Chart Content</div>
        </Widget>
        
        <Widget id="active-users" title="Live Users">
          <div>4,281</div>
        </Widget>
      </DashboardGrid>
    </DashboardProvider>
  )
}

export default MyDashboard
```



## Features

- **Type-Safe:** Built with TypeScript for excellent IDE support and error catching.
- **Configurable:** Allow end-users to resize, drag, and drop widgets.
- **Vite Optimized:** Tree-shakeable and lightweight for modern build pipelines.
- **Themeable:** Easy integration with Tailwind CSS or CSS Variables.



## Licensing

This project is dual-licensed:

1. **Non-Commercial / Personal Use:** Licensed under the [Polyform Non-Commercial 1.0.0](https://polyformproject.org/licenses/non-commercial/1.0.0/). Free to use for students, hobbyists, and open-source projects.
2. **Commercial Use:** Requires a **Tenorlab Commercial License**.

If you are using this library to build a product that generates revenue, or within a commercial entity, please visit [tenorlab.com/license](https://tenorlab.com/license) to purchase a commercial seat.
