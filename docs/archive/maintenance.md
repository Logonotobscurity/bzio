# Maintenance & Code Health

This document lists suspected unused files, dependencies, and dead code patterns to guide cleanup and maintenance efforts. Each item includes a confidence level and a recommended action.

## 1. Unused Files & Modules

### High Confidence

*   `netlify.toml`: **Reasoning:** The project is configured for Google Cloud App Hosting via `apphosting.yaml`. This Netlify configuration file is likely a remnant of a previous deployment strategy. **Action:** Confirm with the team and delete.
*   `k8s/`: **Reasoning:** Similar to `netlify.toml`, the presence of `apphosting.yaml` suggests these Kubernetes configurations are likely obsolete for the current deployment target. **Action:** Verify the deployment strategy. If App Hosting is the sole target, archive and delete this directory.
*   `Dockerfile`: **Reasoning:** `apphosting.yaml` uses a built-in buildpack (`"build": "npm run build"`), indicating it does not use a custom Dockerfile. This file is likely unused. **Action:** Delete if not used by any other process.
*   `*.md` documentation files: `COMPLETION_SUMMARY.md`, `DELIVERY_SUMMARY.md`, `DEVELOPMENT_PLAN.md` etc. **Reasoning:** These appear to be project management or delivery-related documents, not living documentation. They are likely safe to archive. **Action:** Move to a separate `archive` or `docs/archive` folder.

### Medium Confidence

*   `src/lib/all-products-data.json`, `src/lib/brand-data.json`, `src/lib/category-data.json`, `src/lib/company-data.json`, `src/lib/products.json`: **Reasoning:** The project uses Prisma and a database, and the repositories layer (`src/repositories/db/*`) fetches data from there. These JSON files appear to be static, potentially outdated data sources used by the `src/repositories/static/*` implementations. They might be for testing, initial seeding, or a fallback strategy. **Action:** Investigate if the `static` repositories are still in use. If not, delete these files and the static repository implementations.
*   `worker/whatsappWorker.ts`: **Reasoning:** While `send-whatsapp.ts` exists, it's not clear if this worker file is actively invoked or part of a running process. Its trigger mechanism is not apparent from the codebase. **Action:** Investigate how this worker is started and used. If it's not integrated, it's dead code.

### Low Confidence

*   `src/components/chat-widget.module.css`, `src/components/chat-widget.tsx`: **Reasoning:** A `ClientChatWidget.tsx` and `WhatsappWidget.tsx` also exist. It's possible this is an older or alternative implementation of the chat feature. **Action:** Review the live application to see which chat widget is active. Remove the unused one.
*   `jest.setup.js`: **Reasoning**: This file is empty. **Action**: Remove this file.

## 2. Unused Dependencies

*Note: A full dependency analysis requires running a tool like `depcheck`. This is a preliminary analysis based on file inspection.*

### Medium Confidence

*   `gsap`: **Reasoning:** `TECHNICAL_DEBT_ANALYSIS.txt` mentions GSAP is a candidate for removal to reduce bundle size. The only visible usage is in `GsapScrollTrigger.tsx`, which may or may not be widely used. **Action:** Analyze the usage of `GsapScrollTrigger.tsx`. If it's limited or can be replaced with CSS animations or a lighter library, consider removing it.

## 3. Dead Code Patterns

*   **Commented-Out Code:** The file `TECHNICAL_DEBT_ANALYSIS.txt` notes that there are leftover commented-out code blocks. These should be removed. **Action:** Perform a project-wide search for commented-out code blocks and delete them.
*   **Unused Exports:** Many utility files (`formatters.ts`, `utils.ts`, etc.) and component files likely contain exported functions or components that are no longer imported by any other file. **Action:** Run `eslint` with the `no-unused-vars` rule enabled or use a dedicated tool to identify and remove unused exports.
*   **Static vs. DB Repositories:** The project contains two sets of repositories in `src/repositories/`: one for a static data source (`static/`) and one for the database (`db/`). It's highly likely that the `static` repositories are either for development/testing only or are completely obsolete. **Action:** Determine if the static repositories are used in production. If not, they should be removed to reduce complexity and avoid confusion.

## 4. Dependency Analysis (from `depcheck`)

`depcheck` was run on the project and reported the following:

### Unused Dependencies
* `@genkit-ai/next`
* `depcheck`
* `firebase`
* `patch-package`

### Unused devDependencies
* `@eslint/eslintrc`
* `@types/node`
* `eslint`
* `eslint-config-next`
* `eslint-plugin-jsx-a11y`
* `eslint-plugin-react`
* `eslint-plugin-react-hooks`
* `globals`
* `postcss`
* `typescript-eslint`

### Missing Dependencies
* `@radix-ui/react-icons`: used in `./src/components/company-tools.tsx`
* `@tanstack/react-table`: used in `./src/components/company-tools.tsx`
* `schema-dts`: used in `./src/app/about/page.tsx`

**Actions:**

*   **Unused Dependencies:** These packages are not imported by any code and can likely be removed. **Action:** Run `npm uninstall @genkit-ai/next depcheck firebase patch-package`.
*   **Unused devDependencies:** These packages are not used in the build, test, or development process and can be removed. **Action:** Run `npm uninstall -D @eslint/eslintrc @types/node eslint eslint-config-next eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks globals postcss typescript-eslint`.
*   **Missing Dependencies:** These packages are used in the code but are not listed in `package.json`. They should be added. **Action:** Run `npm install @radix-ui/react-icons @tanstack/react-table schema-dts`.
