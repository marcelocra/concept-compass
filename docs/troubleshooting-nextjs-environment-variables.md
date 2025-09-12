# Troubleshooting Next.js Environment Variables in Client Components

## TL;DR

**Problem**: Environment variables with `NEXT_PUBLIC_` prefix not showing up in client components, showing fallback values instead of configured names.

**Root Cause**: Next.js replaces `process.env` references at build time, not runtime. Dynamic string interpolation like `process.env[dynamicKey]` doesn't work because the bundler can't statically analyze which environment variables to include.

**Solution**:

1. **Use direct references**: Instead of dynamic keys, reference each environment variable directly
2. **Create a lookup object**: Map indices to direct `process.env.NEXT_PUBLIC_*` references
3. **Restart development server**: Environment variable changes require a full server restart

**Quick Fix**:

```javascript
// ❌ This doesn't work - dynamic key access
const getImplementationName = (index) => {
    return process.env[`NEXT_PUBLIC_MINDMAP_IMPL_${index}`] || `${index}`;
};

// ✅ This works - direct references
const getImplementationName = (index) => {
    const envVars = {
        0: process.env.NEXT_PUBLIC_MINDMAP_IMPL_0,
        1: process.env.NEXT_PUBLIC_MINDMAP_IMPL_1,
        2: process.env.NEXT_PUBLIC_MINDMAP_IMPL_2,
    };
    return envVars[index] || `${index}`;
};
```

---

## Deep Dive: The Great Environment Variable Vanishing Act

### Chapter 1: The Mystery of the Missing Variables

It started as a simple request: make it easy to customize implementation names through environment variables. The plan was straightforward:

1. Set environment variables like `NEXT_PUBLIC_MINDMAP_IMPL_0="Galaxy View"`
2. Use them in a client component to display custom names
3. Fall back to numbers if not set

Simple, right? Wrong.

### Chapter 2: The Build-Time vs Runtime Confusion

The first attempt seemed logical:

```javascript
const getImplementationName = (index) => {
    return process.env[`NEXT_PUBLIC_MINDMAP_IMPL_${index}`] || `${index}`;
};
```

Environment variables were correctly set in `.env.local`:

```bash
NEXT_PUBLIC_MINDMAP_IMPL_0="Simple View"
NEXT_PUBLIC_MINDMAP_IMPL_1="Galaxy View"
```

The development server was restarted. Everything should work, but the dropdown still showed "0" and "1" instead of the custom names.

### Chapter 3: The Next.js Build System Reality

**The Hidden Truth**: Next.js doesn't work with environment variables the way traditional Node.js applications do. Here's what actually happens:

#### Traditional Node.js (Runtime)

```javascript
// This works in regular Node.js because process.env is available at runtime
const dynamicKey = `MY_VAR_${index}`;
const value = process.env[dynamicKey]; // ✅ Works
```

#### Next.js Client Components (Build-Time)

```javascript
// This DOESN'T work in Next.js client components
const dynamicKey = `NEXT_PUBLIC_VAR_${index}`;
const value = process.env[dynamicKey]; // ❌ Always undefined
```

**Why?** Next.js uses webpack's `DefinePlugin` to replace `process.env.NEXT_PUBLIC_*` references at build time. The bundler scans your code for literal `process.env.VARIABLE_NAME` patterns and replaces them with string literals.

### Chapter 4: The Static Analysis Problem

When you write:

```javascript
process.env[`NEXT_PUBLIC_MINDMAP_IMPL_${index}`];
```

The webpack bundler sees this as a dynamic property access and can't determine which environment variables to include. It can only handle static references like:

```javascript
process.env.NEXT_PUBLIC_MINDMAP_IMPL_0; // ✅ Static - bundler knows to include this
```

### Chapter 5: The Debugging Journey

**Attempt 1**: Added console.log debugging

```javascript
console.log(
    `Looking for NEXT_PUBLIC_MINDMAP_IMPL_${index}:`,
    process.env[`NEXT_PUBLIC_MINDMAP_IMPL_${index}`]
);
```

**Result**: Always logged `undefined`, confirming the dynamic access wasn't working.

**Attempt 2**: Checked if environment variables were loaded

```bash
echo $NEXT_PUBLIC_MINDMAP_IMPL_0  # Empty in bash
```

**Result**: Environment variables aren't available in the shell session, but that's normal - they're only for the Node.js process.

**Attempt 3**: Verified the `.env.local` file format

```bash
NEXT_PUBLIC_MINDMAP_IMPL_0="perplexity-o3"
NEXT_PUBLIC_MINDMAP_IMPL_1="perplexity-sonnet-4-thinking-oneshot"
```

**Result**: File format was correct, variables properly set.

### Chapter 6: The Eureka Moment

The breakthrough came from understanding Next.js's build-time environment variable replacement. The solution required creating a lookup object with direct references:

```javascript
const getImplementationName = (index) => {
    // Direct access to specific env vars (Next.js bundles these at build time)
    const envVars = {
        0: process.env.NEXT_PUBLIC_MINDMAP_IMPL_0, // ✅ Static reference
        1: process.env.NEXT_PUBLIC_MINDMAP_IMPL_1, // ✅ Static reference
        2: process.env.NEXT_PUBLIC_MINDMAP_IMPL_2, // ✅ Static reference
    };

    return envVars[index] || `${index}`;
};
```

**Why This Works**:

1. Each `process.env.NEXT_PUBLIC_MINDMAP_IMPL_*` is a static reference
2. Webpack can analyze and replace these with actual values
3. The lookup object provides runtime flexibility while maintaining build-time optimization

### Chapter 7: The SelectValue Plot Twist

After fixing the environment variables, a new issue emerged: the dropdown showed the correct options but didn't display the selected value. This was a separate UI issue where the `SelectValue` component needed an explicit placeholder:

```javascript
// ❌ Doesn't show selected value clearly
<SelectValue />

// ✅ Shows selected value with fallback
<SelectValue placeholder="Select..." />
```

### Chapter 8: Understanding Next.js Environment Variable Lifecycle

#### Build Time Process

1. Next.js scans code for `process.env.NEXT_PUBLIC_*` patterns
2. Replaces static references with actual values
3. Dynamic references are left as `undefined`

#### Runtime Process

1. Client receives bundled code with environment variables as string literals
2. No access to the original `process.env` object
3. Only pre-replaced values are available

### Lessons Learned

#### 1. **Static Analysis Limitations**

Modern build tools prioritize static analysis for optimization. Dynamic property access patterns that work in runtime environments often fail in build-time environments.

#### 2. **Environment Variable Best Practices for Next.js**

```javascript
// ✅ Good - Static references
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG;

// ✅ Good - Direct lookup object
const configs = {
    api: process.env.NEXT_PUBLIC_API_URL,
    debug: process.env.NEXT_PUBLIC_DEBUG,
};

// ❌ Bad - Dynamic access
const getConfig = (key) => process.env[`NEXT_PUBLIC_${key}`];
```

#### 3. **Build-Time vs Runtime Mental Model**

Traditional web development: Code runs with access to environment
Next.js development: Code is transformed before running, environment "baked in"

#### 4. **Debugging Environment Variables**

```javascript
// Debug what actually got bundled
console.log({
    impl0: process.env.NEXT_PUBLIC_MINDMAP_IMPL_0,
    impl1: process.env.NEXT_PUBLIC_MINDMAP_IMPL_1,
    // This will show actual values or undefined
});
```

### Alternative Approaches

#### Approach 1: Server-Side Environment Injection

Create an API route to provide environment variables:

```javascript
// pages/api/config.js
export default function handler(req, res) {
    res.json({
        implementations: {
            0: process.env.MINDMAP_IMPL_0, // No NEXT_PUBLIC_ needed
            1: process.env.MINDMAP_IMPL_1,
        },
    });
}
```

#### Approach 2: Build-Time Generation

Use a build script to generate a config file:

```javascript
// scripts/generate-config.js
const fs = require("fs");

const config = {
    implementations: [
        process.env.MINDMAP_IMPL_0 || "0",
        process.env.MINDMAP_IMPL_1 || "1",
    ],
};

fs.writeFileSync("src/generated-config.json", JSON.stringify(config));
```

#### Approach 3: Static Expansion Pattern

For a finite set of variables, the static lookup approach is often the most practical:

```javascript
const ENV_VARS = {
    0: process.env.NEXT_PUBLIC_MINDMAP_IMPL_0,
    1: process.env.NEXT_PUBLIC_MINDMAP_IMPL_1,
    2: process.env.NEXT_PUBLIC_MINDMAP_IMPL_2,
    3: process.env.NEXT_PUBLIC_MINDMAP_IMPL_3,
    4: process.env.NEXT_PUBLIC_MINDMAP_IMPL_4,
    // Add more as needed
};
```

### Prevention Strategies

#### 1. **Understand Your Build System**

Different frameworks handle environment variables differently:

-   **Next.js**: Build-time replacement with static analysis
-   **Vite**: Similar build-time replacement with `import.meta.env`
-   **Create React App**: Runtime `process.env` access
-   **Node.js**: Full runtime `process.env` access

#### 2. **Test Environment Variables Early**

```javascript
// Add this to your component during development
useEffect(() => {
    console.log("Environment check:", {
        impl0: process.env.NEXT_PUBLIC_MINDMAP_IMPL_0,
        impl1: process.env.NEXT_PUBLIC_MINDMAP_IMPL_1,
    });
}, []);
```

#### 3. **Documentation for Team**

```javascript
// Document the limitation clearly
/**
 * Environment variable access in Next.js client components
 *
 * ❌ DON'T: process.env[dynamicKey]
 * ✅ DO: process.env.NEXT_PUBLIC_SPECIFIC_VAR
 *
 * Variables must be referenced statically for webpack to include them
 */
```

### Conclusion

This debugging journey highlighted the fundamental difference between build-time and runtime environment variable access. The key insights:

1. **Next.js client components** use build-time environment variable replacement
2. **Dynamic string interpolation** doesn't work with `process.env` in client components
3. **Static references** are required for webpack to bundle environment variables
4. **UI component state** issues can compound environment variable debugging

Understanding these architectural decisions helps developers work with the framework rather than against it. The static lookup pattern, while requiring explicit variable declaration, provides both build-time optimization and runtime flexibility.

### Modern Web Development Complexity

This issue exemplifies how modern web development frameworks optimize for performance and bundle size by making trade-offs in developer experience. The shift from runtime flexibility to build-time optimization requires developers to adapt their mental models and coding patterns.

The environment variable "vanishing act" wasn't a bug - it was a feature working as designed, but with documentation that didn't clearly communicate the static analysis requirement.

---

_This troubleshooting session was conducted with Next.js 15.5.3, using client components with TypeScript, and pnpm as the package manager in a DevContainer environment._
